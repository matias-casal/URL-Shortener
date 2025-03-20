import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import { connectRedis } from "./config/redis";
import urlRoutes from "./routes/urlRoutes";
import authRoutes from "./routes/authRoutes";
import { authMiddleware } from "./middleware/auth";
import path from "path";

// Load environment variables
dotenv.config();

/**
 * Express application instance
 */
const app = express();
const PORT = process.env.PORT || 4000;

/**
 * Global middleware setup
 */
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

/**
 * API route registration
 */
app.use("/api/urls", urlRoutes);
app.use("/api/auth", authRoutes);

/**
 * Custom 404 page for URL redirects
 */
app.use("/404", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

/**
 * Default API 404 response
 */
app.use("/api/*", (req, res) => {
  res.status(404).json({
    errors: [
      {
        status: "404",
        title: "Not Found",
        detail: "The requested resource does not exist",
      },
    ],
  });
});

/**
 * Application initialization function
 * Connects to databases and starts the server
 */
const initializeApp = async () => {
  try {
    // Connect to PostgreSQL
    await AppDataSource.initialize();
    console.log("PostgreSQL database connected successfully");

    // Connect to Redis
    await connectRedis();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error initializing app:", error);
    process.exit(1);
  }
};

initializeApp();
