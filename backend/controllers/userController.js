const store = require("../store");

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, verificationStatus, specialty } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (verificationStatus) filter.verificationStatus = verificationStatus;

    let users = await store.getUsers(filter);

    if (role === "DOCTOR") {
      users = users.map((u) => {
        const prof = u.doctor_profile || {};
        const initials = u.full_name
          ? u.full_name
              .split(" ")
              .filter((p) => !p.startsWith("Dr."))
              .map((p) => p[0])
              .join("")
              .substring(0, 2)
              .toUpperCase() || "DR"
          : "DR";

        return {
          id: u.id,
          name: u.full_name,
          mrn: prof.mrn || prof.medical_license_number || "KMC-48921",
          state_council: prof.state_council || "Karnataka Medical Council (KMC)",
          specialty: prof.specialization || prof.specialty || "Internal Medicine",
          experience_years: prof.experience_years || 10,
          clinic_affiliation: prof.clinic_affiliation || "Pulse Care Clinic & Diagnostic Center",
          clinic_address: prof.clinic_address || "80 Feet Rd, 4th Block, Koramangala, Bengaluru",
          consultation_fee: prof.consultation_fee || 600,
          rating: prof.rating || 4.9,
          total_consultations: prof.total_consultations || 2400,
          distance_km: prof.distance_km || 0.8,
          avatar_initials: initials,
          bio:
            prof.bio ||
            `Consultant specializing in ${prof.specialization || "Internal Medicine"} with over ${prof.experience_years || 10} years of clinical expertise.`,
          available_slots: prof.available_slots || [
            { id: `slot-${u.id}-1`, time: "10:30 AM", status: "AVAILABLE" },
            { id: `slot-${u.id}-2`, time: "11:00 AM", status: "AVAILABLE" },
            { id: `slot-${u.id}-3`, time: "11:30 AM", status: "AVAILABLE" },
            { id: `slot-${u.id}-4`, time: "04:30 PM", status: "AVAILABLE" },
            { id: `slot-${u.id}-5`, time: "05:00 PM", status: "AVAILABLE" },
          ],
        };
      });

      if (specialty && specialty !== "ALL") {
        users = users.filter((u) => u.specialty.toLowerCase().includes(specialty.toLowerCase()));
      }
    }

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

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await store.findUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User with id '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { email, password, full_name, phone, role, doctor_profile, pharmacy_profile, patient_profile } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: email, password, full_name.",
      });
    }

    const existing = await store.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `A user with email '${email}' is already registered.`,
      });
    }

    const userId = req.body.id || `usr-${role ? role.toLowerCase() : "pat"}-${Date.now().toString(36)}`;
    const verificationStatus = role === "DOCTOR" || role === "PHARMACY" ? "PENDING_VERIFICATION" : "ACTIVE";

    const newUser = await store.addUser({
      id: userId,
      email: email.toLowerCase().trim(),
      password,
      full_name: full_name.trim(),
      phone: phone || "",
      role: role || "PATIENT",
      verificationStatus,
      doctor_profile: doctor_profile || {},
      pharmacy_profile: pharmacy_profile || {},
      patient_profile: patient_profile || {},
      isActive: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const userObj = { ...newUser };
    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates._id;
    delete updates.id;

    const updatedUser = await store.updateUserById(id, updates);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: `User with id '${id}' not found.`,
      });
    }

    const userObj = { ...updatedUser };
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await store.deleteUserById(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: `User with id '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `User '${deletedUser.email}' (${deletedUser.id}) successfully deleted.`,
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

    const status = isApproved ? "ACTIVE" : "REJECTED";
    const user = await store.updateUserById(userId, {
      verificationStatus: status,
      rejectionReason: !isApproved ? (rejectionReason || "Verification criteria not met") : "",
    });

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
