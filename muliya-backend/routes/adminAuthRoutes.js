import express from "express";

import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
} from "../controllers/adminAuthController.js";

import {
  protectAdmin,
  requireRole,
} from "../middleware/adminAuth.js";

const router = express.Router();

/*
  Create the first admin account during development.

  After your first Super Admin account is created,
  protect or disable this route before production.
*/
router.post(
  "/register",
  registerAdmin
);

router.post(
  "/login",
  loginAdmin
);

router.post(
  "/logout",
  logoutAdmin
);

router.get(
  "/me",
  protectAdmin,
  getCurrentAdmin
);

/*
  Optional protected admin-creation endpoint.

  Only an authenticated Super Admin may use this route.
*/
router.post(
  "/create-admin",
  protectAdmin,
  requireRole("Super Admin"),
  registerAdmin
);

export default router;