const store = require("../store");

/**
 * Admin Service: Manages admin operations & queries across admins and platform collections
 */
class AdminService {
  async authenticateAdmin(email, password) {
    const cleanEmail = email.toLowerCase().trim();
    const admin = await store.findAdminByEmail(cleanEmail);

    if (!admin) {
      return { success: false, reason: "ADMIN_NOT_FOUND" };
    }

    const isMatch = store.checkPassword(password, admin.password);
    if (!isMatch) {
      return { success: false, reason: "INVALID_PASSWORD" };
    }

    if (admin.status !== "ACTIVE") {
      return { success: false, reason: "ACCOUNT_SUSPENDED" };
    }

    const adminObj = { ...admin };
    delete adminObj.password;
    return { success: true, admin: adminObj };
  }

  async createAdmin(adminData) {
    return await store.addAdmin(adminData);
  }

  async getAllAdmins() {
    return await store.getAdmins();
  }

  async getAllUsers(filter) {
    return await store.getUsers(filter);
  }

  async verifyUser(userId, isApproved, rejectionReason) {
    const status = isApproved ? "ACTIVE" : "REJECTED";
    return await store.updateUserById(userId, {
      verificationStatus: status,
      rejectionReason: !isApproved ? (rejectionReason || "Verification criteria not met") : "",
    });
  }

  async getAllAppointments(filter) {
    return await store.getAppointmentsList(filter);
  }

  async getAuditLogs(limit) {
    return await store.getLogs(limit);
  }
}

module.exports = new AdminService();
