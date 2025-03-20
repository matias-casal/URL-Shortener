import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Type extension for Express Request to include user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * Authentication middleware that extracts and verifies JWT from request headers
 * Attaches user data to request if token is valid
 * Continues without authentication if no token or invalid token
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // Continue without authentication
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
      };
      req.user = decoded;
      next();
    } catch (error) {
      // Invalid token, but continue without authentication
      next();
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    next();
  }
};

/**
 * Middleware to protect routes that require authentication
 * Returns 401 Unauthorized if user is not authenticated
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      errors: [
        {
          status: "401",
          title: "Unauthorized",
          detail: "Authentication required",
        },
      ],
    });
  }

  next();
};
