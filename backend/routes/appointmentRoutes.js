const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Patient & Doctor Appointment Routes
router.get("/", appointmentController.getAppointments);
router.get("/my", appointmentController.getMyAppointments);
router.get("/doctor", appointmentController.getDoctorAppointments);
router.get("/:id", appointmentController.getAppointmentById);
router.post("/book", appointmentController.bookAppointment);
router.patch("/:id/status", appointmentController.updateAppointmentStatus);
router.patch("/status", appointmentController.updateAppointmentStatus);
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;
