import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDatabase from "./config/db.js";
import cookieParser from "cookie-parser";


import productRoutes from "./routes/productRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import metalRateRoutes from "./routes/metalRateRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import instagramRoutes from "./routes/instagramRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import expertRequestRoutes from "./routes/expertRequestRoutes.js";
import imageSearchRoutes from "./routes/imageSearchRoutes.js";
import goldPredictionRoutes from "./routes/goldPredictionRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Muliya Jewellery API is running.",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/metal-rates", metalRateRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/instagram", instagramRoutes);
app.use("/api/chat", chatbotRoutes);
app.use("/api/expert-requests", expertRequestRoutes);
app.use("/api/image-search", imageSearchRoutes);
app.use(cookieParser());

app.use(
  "/api/gold-prediction",
  goldPredictionRoutes
);

app.use(
  "/api/admin/auth",
  adminAuthRoutes
);

/*
  Keep this 404 handler after every API route.
*/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Unable to start server:",
      error.message
    );

    process.exit(1);
  }
};

startServer();