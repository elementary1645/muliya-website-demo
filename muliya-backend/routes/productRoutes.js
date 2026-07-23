import express from "express";

import {
  getProducts,
  getProductSuggestions,
  getProductById,
} from "../controllers/productController.js";

const router = express.Router();

router.get(
  "/suggestions",
  getProductSuggestions,
);

router.get("/", getProducts);

router.get("/:id", getProductById);

export default router;