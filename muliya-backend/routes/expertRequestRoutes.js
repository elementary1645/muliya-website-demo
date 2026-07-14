import express from "express";

import {
  createExpertRequest,
  getExpertRequests,
  getExpertRequestById,
  updateExpertRequestStatus,
} from "../controllers/expertRequestController.js";

const router = express.Router();

router
  .route("/")
  .post(createExpertRequest)
  .get(getExpertRequests);

router
  .route("/:id")
  .get(getExpertRequestById)
  .patch(updateExpertRequestStatus);

export default router;