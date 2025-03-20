import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

const userRepository = AppDataSource.getRepository(User);
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if email already exists
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      res.status(409).json({
        errors: [
          {
            status: "409",
            title: "Conflict",
            detail: "User with this email already exists",
          },
        ],
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User();
    user.email = email;
    user.password = hashedPassword;

    await userRepository.save(user);

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      data: {
        type: "users",
        id: user.id,
        attributes: {
          email: user.email,
          createdAt: user.createdAt,
        },
        meta: {
          token,
        },
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Server Error",
          detail: "An error occurred while registering the user",
        },
      ],
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userRepository.findOneBy({ email });
    if (!user) {
      res.status(401).json({
        errors: [
          {
            status: "401",
            title: "Unauthorized",
            detail: "Invalid email or password",
          },
        ],
      });
      return;
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({
        errors: [
          {
            status: "401",
            title: "Unauthorized",
            detail: "Invalid email or password",
          },
        ],
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      data: {
        type: "users",
        id: user.id,
        attributes: {
          email: user.email,
          createdAt: user.createdAt,
        },
        meta: {
          token,
        },
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Server Error",
          detail: "An error occurred while logging in",
        },
      ],
    });
  }
};

// Get current user
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        errors: [
          {
            status: "401",
            title: "Unauthorized",
            detail: "Not authenticated",
          },
        ],
      });
      return;
    }

    const user = await userRepository.findOneBy({ id: userId });

    if (!user) {
      res.status(404).json({
        errors: [
          {
            status: "404",
            title: "Not Found",
            detail: "User not found",
          },
        ],
      });
      return;
    }

    res.status(200).json({
      data: {
        type: "users",
        id: user.id,
        attributes: {
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Server Error",
          detail: "An error occurred while retrieving user information",
        },
      ],
    });
  }
};
