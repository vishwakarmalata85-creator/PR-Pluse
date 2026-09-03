const jwt = require("jsonwebtoken");
const adminService = require("./adminService");
const store = require("../store");

const JWT_SECRET = process.env.JWT_SECRET || "pulsecare_jwt_secure_super_secret_key_2026";

// POST /api/admin/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "PulseCare Admin Console";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide both admin email and password.",
      });
    }

    const authResult = await adminService.authenticateAdmin(email, password);

    if (!authResult.success) {
      const statusMap = {
        ADMIN_NOT_FOUND: "FAILED_USER_NOT_FOUND",
        INVALID_PASSWORD: "FAILED_INVALID_PASSWORD",
        ACCOUNT_SUSPENDED: "FAILED_REJECTED",
      };

      await store.addLog({
        id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        email: email.toLowerCase().trim(),
        role: "ADMIN",
        ipAddress,
        userAgent,
        status: statusMap[authResult.reason] || "FAILED_INVALID_PASSWORD",
        reason: `Admin login failed: ${authResult.reason}`,
        timestamp: new Date().toISOString(),
      });

      return res.status(401).json({
        success: false,
        error:
          authResult.reason === "ADMIN_NOT_FOUND"
            ? "No administrator account found with this email."
            : authResult.reason === "ACCOUNT_SUSPENDED"
            ? "This administrator account is currently suspended."
            : "Incorrect admin password. Please verify credentials.",
      });
    }

    const admin = authResult.admin;

    // Log authorized admin access
    await store.addLog({
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      email: admin.email,
      role: "ADMIN",
      ipAddress,
      userAgent,
      status: "AUTHORIZED",
      reason: "Administrator master console login.",
      timestamp: new Date().toISOString(),
    });

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "ADMIN",
        name: admin.name,
        permissions: admin.permissions || [],
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: `Welcome, Administrator ${admin.name}!`,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "ADMIN",
        status: admin.status,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// POST /api/admin/create (Create new administrator)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Missing required admin fields: name, email, password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters.",
      });
    }

    const existing = await store.findAdminByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `An administrator with email '${email}' already exists.`,
      });
    }

    const newAdmin = await adminService.createAdmin({
      id: `adm-${Date.now().toString(36)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "ADMIN",
      status: "ACTIVE",
      permissions: permissions || [
        "VERIFY_DOCTORS",
        "VERIFY_PHARMACIES",
        "MANAGE_USERS",
        "VIEW_AUDIT_LOGS",
      ],
      created_at: new Date().toISOString(),
    });

    const adminObj = { ...newAdmin };
    delete adminObj.password;

    return res.status(201).json({
      success: true,
      message: "Administrator account created successfully.",
      admin: adminObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/admin/users (List all registered Patients, Doctors, Pharmacies)
exports.getUsers = async (req, res) => {
  try {
    const { role, verificationStatus } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (verificationStatus) filter.verificationStatus = verificationStatus;

    const users = await adminService.getAllUsers(filter);
    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// POST /api/admin/verify-user
exports.verifyUser = async (req, res) => {
  try {
    const { userId, isApproved, rejectionReason } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "Missing userId parameter.",
      });
    }

    const user = await adminService.verifyUser(userId, isApproved, rejectionReason);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User #${userId} not found.`,
      });
    }

    const userObj = { ...user };
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: isApproved
        ? `Account for ${user.full_name} (${user.role}) has been VERIFIED & ACTIVATED.`
        : `Account for ${user.full_name} has been REJECTED. Reason: ${rejectionReason || "Criteria not met"}`,
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/admin/appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await adminService.getAllAppointments(req.query);
    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/admin/login-history
exports.getLoginHistory = async (req, res) => {
  try {
    const logs = await adminService.getAuditLogs(100);
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

// GET /api/admin/list
exports.getAdmins = async (req, res) => {
  try {
    const admins = await adminService.getAllAdmins();
    return res.status(200).json({
      success: true,
      count: admins.length,
      admins,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
