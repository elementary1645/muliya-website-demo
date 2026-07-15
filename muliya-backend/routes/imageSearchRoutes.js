import express from "express";

import {
  searchByImage,
} from "../controllers/imageSearchController.js";

import {
  handleImageUpload,
} from "../middleware/imageUpload.js";

const router = express.Router();

router.post(
  "/",
  handleImageUpload,
  searchByImage
);

export default router;