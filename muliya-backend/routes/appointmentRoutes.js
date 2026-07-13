import express from "express";

import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";

const router = express.Router();

router
  .route("/")
  .post(createAppointment)
  .get(getAppointments);

router
  .route("/:id")
  .get(getAppointmentById);

router
  .route("/:id/status")
  .patch(updateAppointmentStatus);

export default router;