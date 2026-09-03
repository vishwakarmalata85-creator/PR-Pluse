const store = require("../store");
const notificationService = require("../services/notificationService");

// GET /api/appointments (all or filtered)
exports.getAppointments = async (req, res) => {
  try {
    const { patientId, doctorId, status } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;
    if (status) filter.status = status;

    const appointments = await store.getAppointmentsList(filter);
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

// GET /api/appointments/my (Patient's appointments)
exports.getMyAppointments = async (req, res) => {
  try {
    const patientId = req.query.patientId || req.user?.id || "usr-pat-001";
    const appointments = await store.getAppointmentsList({ patientId });
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

// GET /api/appointments/doctor (Doctor's queue)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.query.doctorId || req.user?.id || "usr-doc-001";
    const appointments = await store.getAppointmentsList({ doctorId });
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

// GET /api/appointments/:id (Single appointment details)
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const all = await store.getAppointmentsList();
    const apt = all.find((a) => a.id === id || a._id === id || a.token === id || a.tokenNumber === id);

    if (!apt) {
      return res.status(404).json({
        success: false,
        error: `Appointment #${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      appointment: apt,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// POST /api/appointments/book (Patient books slot)
exports.bookAppointment = async (req, res) => {
  try {
    let {
      patientId,
      patientName,
      doctorId,
      doctorName,
      department,
      clinicName,
      clinicAddress,
      date,
      timeSlot,
      time,
      consultationFee,
      symptoms,
      vitals,
    } = req.body;

    const chosenDate = date || new Date().toISOString().split("T")[0];
    const chosenTime = timeSlot || time || "11:15 AM";

    // Auto-lookup doctor details if only doctorId is supplied
    if (doctorId && !doctorName) {
      const docUser = await store.findUserById(doctorId);
      if (docUser) {
        doctorName = docUser.full_name;
        department = docUser.doctor_profile?.specialization || "Internal Medicine";
        clinicName = docUser.doctor_profile?.clinic_affiliation || "Pulse Care Clinic & Diagnostic Center";
      }
    }

    // Auto-lookup patient details if only patientId is supplied
    if (patientId && !patientName) {
      const patUser = await store.findUserById(patientId);
      if (patUser) {
        patientName = patUser.full_name;
      }
    }

    const finalPatientName = patientName || req.user?.fullName || "Anil Kumar Verma";
    const finalDoctorName = doctorName || "Dr. Vikram Sethi, MD";
    const finalPatientId = patientId || req.user?.id || "usr-pat-001";
    const finalDoctorId = doctorId || "usr-doc-001";

    const tokenSerial = Math.floor(100 + Math.random() * 900);
    const tokenStr = `T-${tokenSerial}`;

    const newAppointment = await store.addAppointment({
      id: req.body.id || `apt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      token: tokenStr,
      tokenNumber: tokenStr,
      patientId: finalPatientId,
      patientName: finalPatientName,
      doctorId: finalDoctorId,
      doctorName: finalDoctorName,
      department: department || "Internal Medicine",
      clinicName: clinicName || "Pulse Care Clinic & Diagnostic Center",
      clinicAddress: clinicAddress || "80 Feet Rd, 4th Block, Koramangala, Bengaluru",
      date: chosenDate,
      timeSlot: chosenTime,
      time: chosenTime,
      consultationFee: Number(consultationFee) || 600,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms || "OPD Clinical Consultation"],
      vitals: vitals || {
        bp: "120/80 mmHg",
        pulse: "72 bpm",
        temp: "98.6 °F",
        spo2: "99%",
      },
      status: "REQUESTED",
      clinicalNotes: "",
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Notify Doctor of new appointment
    notificationService.notifyDoctorNewAppointment(newAppointment);

    return res.status(201).json({
      success: true,
      message: `Appointment requested successfully! Token: ${newAppointment.tokenNumber}`,
      appointment: newAppointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// PATCH /api/appointments/status or PATCH /api/appointments/:id/status (Doctor accepts or rejects)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointmentId = req.params.id || req.body.appointmentId;
    const { status, clinicalNotes, rejectionReason } = req.body;

    if (!appointmentId || !status) {
      return res.status(400).json({
        success: false,
        error: "Missing appointmentId or status parameter.",
      });
    }

    const updateFields = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (clinicalNotes !== undefined) updateFields.clinicalNotes = clinicalNotes;
    if (rejectionReason !== undefined) updateFields.rejectionReason = rejectionReason;

    const appointment = await store.updateAppointment(appointmentId, updateFields);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: `Appointment #${appointmentId} not found.`,
      });
    }

    // Notify Patient of status change
    notificationService.notifyPatientStatusUpdate(appointment);

    return res.status(200).json({
      success: true,
      message:
        status === "CONFIRMED"
          ? `Appointment #${appointment.tokenNumber || appointment.token} CONFIRMED for ${appointment.patientName}.`
          : status === "CANCELLED"
          ? `Appointment #${appointment.tokenNumber || appointment.token} DECLINED.`
          : `Appointment #${appointment.tokenNumber || appointment.token} status updated to ${status}.`,
      appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await store.deleteAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: `Appointment #${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Appointment #${appointment.tokenNumber || appointment.token} deleted successfully.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
