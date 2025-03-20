import { Router } from "express";
import { body } from "express-validator";
import { register, login, getCurrentUser } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { rateLimiterMiddleware } from "../middleware/rateLimiter";

const router = Router();

/**
 * POST /api/auth/register
 * Creates a new user account
 * Rate limited to prevent abuse
 */
router.post(
  "/register",
  rateLimiterMiddleware,
  [
    body("username")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Must be a valid email"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  register
);

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT
 * Rate limited to prevent brute force attacks
 */
router.post(
  "/login",
  rateLimiterMiddleware,
  [
    body("email").isEmail().withMessage("Must be a valid email"),
    body("password").isString().withMessage("Password is required"),
  ],
  login
);

/**
 * GET /api/auth/me
 * Returns the current authenticated user's details
 * Protected route - requires valid JWT
 */
router.get("/me", requireAuth, getCurrentUser);

export default router;
