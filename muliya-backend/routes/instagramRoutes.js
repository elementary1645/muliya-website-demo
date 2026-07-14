import express from "express";

import {
  getInstagramFeed,
} from "../controllers/instagramController.js";

const router = express.Router();

/*
  GET /api/instagram/posts

  Returns:
  - Live Instagram posts when Meta API is configured
  - Cached posts when cache is available
  - Fallback posts when Instagram API is unavailable
*/

router.get("/posts", getInstagramFeed);

export default router;