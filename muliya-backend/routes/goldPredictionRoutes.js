import express from "express";

import {
  getGoldPrediction,
  getGoldHistory,
  getGoldModelInfo,
  getGoldPredictionHealth,
} from "../controllers/goldPredictionController.js";

const router = express.Router();

router.get("/", getGoldPrediction);
router.get("/history", getGoldHistory);
router.get("/model-info", getGoldModelInfo);
router.get("/health", getGoldPredictionHealth);

export default router;