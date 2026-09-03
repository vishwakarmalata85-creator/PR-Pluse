/**
 * NEXORA PULSECARE - REAL-TIME NOTIFICATION SERVICE
 * Manages appointment notifications between Patients, Doctors, and Administrators.
 */

class NotificationService {
  constructor() {
    this.notifications = [];
  }

  createNotification({ recipientId, recipientRole, title, message, data = {} }) {
    const notification = {
      id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      recipientId,
      recipientRole,
      title,
      message,
      data,
      isRead: false,
      timestamp: new Date().toISOString(),
    };
    this.notifications.unshift(notification);
    if (this.notifications.length > 200) {
      this.notifications.pop();
    }
    console.log(`🔔 [NOTIFICATION -> ${recipientRole}] ${title}: ${message}`);
    return notification;
  }

  notifyDoctorNewAppointment(appointment) {
    return this.createNotification({
      recipientId: appointment.doctorId,
      recipientRole: "DOCTOR",
      title: "New Appointment Request",
      message: `Patient ${appointment.patientName} requested an appointment for ${appointment.date} at ${appointment.timeSlot || appointment.time} (Token: ${appointment.token || appointment.tokenNumber}).`,
      data: { appointmentId: appointment.id, appointment },
    });
  }

  notifyPatientStatusUpdate(appointment) {
    const statusText =
      appointment.status === "CONFIRMED"
        ? "Confirmed 🟢"
        : appointment.status === "CANCELLED"
        ? "Declined 🔴"
        : appointment.status;

    return this.createNotification({
      recipientId: appointment.patientId,
      recipientRole: "PATIENT",
      title: `Appointment ${statusText}`,
      message: `Your appointment with ${appointment.doctorName} on ${appointment.date} at ${appointment.timeSlot || appointment.time} has been ${statusText.toLowerCase()}.`,
      data: { appointmentId: appointment.id, appointment },
    });
  }

  getNotificationsForUser(recipientId, recipientRole = null) {
    return this.notifications.filter(
      (n) =>
        (!recipientId || n.recipientId === recipientId) ||
        (recipientRole && n.recipientRole === recipientRole)
    );
  }

  markAsRead(id) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
    return notif;
  }
}

module.exports = new NotificationService();
