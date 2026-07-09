import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDatabase from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

connectDatabase();

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Muliya Jewellery API is running.",
  });
});

app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});