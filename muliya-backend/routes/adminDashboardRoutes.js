import express from "express";

import {
  getAdminDashboard,
} from "../controllers/adminDashboardController.js";

import {
  protectAdmin,
  requirePermission,
} from "../middleware/adminAuth.js";

const router = express.Router();

router.get(
  "/",
  protectAdmin,
  requirePermission(
    "analytics",
    "view"
  ),
  getAdminDashboard
);

export default router;