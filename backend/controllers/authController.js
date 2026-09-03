const jwt = require("jsonwebtoken");
const store = require("../store");

const JWT_SECRET = process.env.JWT_SECRET || "pulsecare_jwt_secure_super_secret_key_2026";

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "PulseCare Web Client";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide both email address and password.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await store.findUserByEmail(cleanEmail);

    if (!user) {
      await store.addLog({
        id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        role: "UNKNOWN",
        ipAddress,
        userAgent,
        status: "FAILED_USER_NOT_FOUND",
        reason: "User account does not exist in registry.",
        timestamp: new Date().toISOString(),
      });

      return res.status(401).json({
        success: false,
        error: "No registered account found with this email address. Please register first.",
      });
    }

    // Verify bcrypt hashed password
    const isMatch = store.checkPassword(password, user.password);
    if (!isMatch) {
      await store.addLog({
        id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        role: user.role,
        ipAddress,
        userAgent,
        status: "FAILED_INVALID_PASSWORD",
        reason: "Invalid password provided.",
        timestamp: new Date().toISOString(),
      });

      return res.status(401).json({
        success: false,
        error: "Incorrect password. Please verify your credentials and try again.",
      });
    }

    if (user.verificationStatus === "PENDING_VERIFICATION") {
      await store.addLog({
        id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        role: user.role,
        ipAddress,
        userAgent,
        status: "FAILED_UNVERIFIED",
        reason: "License and credentials verification pending.",
        timestamp: new Date().toISOString(),
      });

      return res.status(403).json({
        success: false,
        error: "Your medical council or pharmacy credentials are currently undergoing verification by the Admin desk. You will receive an email once approved.",
        verificationStatus: "PENDING_VERIFICATION",
      });
    }

    if (user.verificationStatus === "REJECTED") {
      await store.addLog({
        id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        role: user.role,
        ipAddress,
        userAgent,
        status: "FAILED_REJECTED",
        reason: user.rejectionReason || "Verification rejected by administrator.",
        timestamp: new Date().toISOString(),
      });

      return res.status(403).json({
        success: false,
        error: `Your account verification was rejected: ${user.rejectionReason || "License could not be verified with the state medical board."}`,
        verificationStatus: "REJECTED",
      });
    }

    // Success - record audit log
    await store.addLog({
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      role: user.role,
      ipAddress,
      userAgent,
      status: "AUTHORIZED",
      reason: "Successful authentication.",
      timestamp: new Date().toISOString(),
    });

    const userObj = { ...user };
    delete userObj.password;

    // Issue JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.full_name}!`,
      token,
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { doctor_profile, pharmacy_profile, patient_profile } = req.body;
    const email = req.body.email?.toLowerCase()?.trim();
    const password = req.body.password || req.body.pass;
    const full_name = (req.body.full_name || req.body.fullName || req.body.name || "").trim();
    const phone = (req.body.phone || req.body.phoneNumber || req.body.mobile || "").trim();
    const role = req.body.role || "PATIENT";

    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "PulseCare Web Client";

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: "Missing mandatory registration fields: full_name, email, password.",
      });
    }

    if (role === "ADMIN") {
      return res.status(403).json({
        success: false,
        error: "Security Policy: Administrator accounts cannot be created via public registration. Contact System Management.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await store.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `An account with ${cleanEmail} is already registered. Please login instead.`,
      });
    }

    const selectedRole = role || "PATIENT";
    const verificationStatus = selectedRole === "DOCTOR" || selectedRole === "PHARMACY" ? "PENDING_VERIFICATION" : "ACTIVE";
    const userId = req.body.id || `usr-${selectedRole.toLowerCase()}-${Date.now().toString(36)}`;

    // Store will hash the password with bcrypt before writing to MongoDB/memory
    const newUser = await store.addUser({
      id: userId,
      email: cleanEmail,
      password: password, // Will be bcrypt hashed by store.addUser
      full_name: full_name.trim(),
      phone: phone || "",
      role: selectedRole,
      verificationStatus,
      doctor_profile: doctor_profile || {},
      pharmacy_profile: pharmacy_profile || {},
      patient_profile: patient_profile || {},
      isActive: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await store.addLog({
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      role: selectedRole,
      ipAddress,
      userAgent,
      status: verificationStatus === "ACTIVE" ? "AUTHORIZED" : "FAILED_UNVERIFIED",
      reason: "New account registration.",
      timestamp: new Date().toISOString(),
    });

    const userObj = { ...newUser };
    delete userObj.password;

    // Issue JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        fullName: newUser.full_name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message:
        verificationStatus === "PENDING_VERIFICATION"
          ? "Registration received! Your license is queued for verification by the Admin desk."
          : "Registration successful! Welcome to PulseCare.",
      token,
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

// GET /api/auth/login-history
exports.getLoginHistory = async (req, res) => {
  try {
    const logs = await store.getLogs(100);
    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
