/**
 * NEXORA PULSE - AUTHENTICATION & REST API CLIENT SERVICE
 * Connects frontend to backend REST APIs (backed by MongoDB Atlas)
 */

const STORAGE_KEY_SESSION = "nexora_active_session";

class AuthService {
  constructor() {
    this.session = this.loadSession();
    this.apiBase = typeof window !== "undefined" && window.location && window.location.origin ? window.location.origin : "";
  }

  loadSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveSession(sessionData) {
    this.session = sessionData;
    if (sessionData) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
    } else {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    }
  }

  getCurrentUser() {
    return this.session ? this.session.user : null;
  }

  /**
   * POST /api/auth/login
   */
  async login(email, password) {
    const res = await fetch(`${this.apiBase}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Login failed. Please check your credentials.");
    }

    const session = { token: data.token, user: data.user };
    this.saveSession(session);
    return session;
  }

  /**
   * POST /api/auth/register
   */
  async register(formData) {
    const res = await fetch(`${this.apiBase}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Registration failed.");
    }

    const session = { token: data.token, user: data.user };
    this.saveSession(session);
    return session;
  }

  /**
   * POST /api/auth/logout
   */
  logout() {
    this.saveSession(null);
  }

  /**
   * GET /api/auth/login-history
   */
  async getLoginHistory() {
    try {
      const res = await fetch(`${this.apiBase}/api/auth/login-history`);
      const data = await res.json();
      return data.logs || [];
    } catch {
      return [];
    }
  }

  /**
   * GET /api/admin/users
   */
  async getAdminUsers() {
    try {
      const res = await fetch(`${this.apiBase}/api/admin/users`);
      const data = await res.json();
      return data.users || [];
    } catch {
      return [];
    }
  }

  /**
   * POST /api/admin/verify-user
   */
  async adminVerifyUser(userId, isApproved, rejectionReason = "") {
    const res = await fetch(`${this.apiBase}/api/admin/verify-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isApproved, rejectionReason })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to update user verification.");
    }
    return data.user;
  }

  /**
   * GET /api/appointments
   */
  async getAppointments() {
    try {
      const res = await fetch(`${this.apiBase}/api/appointments`);
      const data = await res.json();
      return data.appointments || [];
    } catch {
      return [];
    }
  }

  /**
   * POST /api/appointments/book
   */
  async bookAppointment(appointmentData) {
    const res = await fetch(`${this.apiBase}/api/appointments/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointmentData)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to book appointment.");
    }
    return data.appointment;
  }

  /**
   * PATCH /api/appointments/status
   */
  async updateAppointmentStatus(appointmentId, status, clinicalNotes = "") {
    const res = await fetch(`${this.apiBase}/api/appointments/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, status, clinicalNotes })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to update appointment status.");
    }
    return data.appointment;
  }
}

export const authService = new AuthService();
