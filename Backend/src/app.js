

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// Security headers
app.use(helmet());

// Frontend-backend communication
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse incoming JSON request bodies
app.use(express.json({ limit: "1mb" }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Parse cookies
app.use(cookieParser());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth Service is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Centralized error handler (must be last)
app.use(errorMiddleware);

export default app;
