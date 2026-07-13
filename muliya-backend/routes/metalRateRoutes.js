import express from "express";

import {
  getMetalRates,
} from "../controllers/metalRateController.js";

const router = express.Router();

router.get("/", getMetalRates);

export default router;