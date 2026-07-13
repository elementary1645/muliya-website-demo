import express from "express";

import {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
} from "../controllers/enquiryController.js";

const router = express.Router();

router.route("/").post(createEnquiry).get(getEnquiries);

router.get("/:id", getEnquiryById);

export default router;