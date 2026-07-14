import express from "express";

import {
  sendChatMessage,
} from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/", sendChatMessage);

export default router;