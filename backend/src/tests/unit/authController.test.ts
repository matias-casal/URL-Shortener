import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Request, Response } from "express";
import { AppDataSource } from "../../config/database";
import { User } from "../../entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mock dependencies
jest.mock("../../config/database", () => {
  const mockUserRepo = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  return {
    AppDataSource: {
      getRepository: jest.fn((entity: any) => {
        if (entity === User) return mockUserRepo;
        return null;
      }),
    },
  };
});

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-token"),
}));

// Import controllers after mocking
import {
  register,
  login,
  getCurrentUser,
} from "../../controllers/authController";

describe("Auth Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserRepo: any;

  beforeEach(() => {
    mockRequest = {
      body: {},
      user: null as any,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockUserRepo = AppDataSource.getRepository(User);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      // Arrange
      mockRequest.body = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      (
        bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>
      ).mockResolvedValue("hashed_password" as never);

      mockUserRepo.findOneBy.mockResolvedValue(null);
      mockUserRepo.save.mockImplementation((user) => {
        return {
          ...user,
          id: "user-uuid",
        };
      });

      // Mock JWT sign method
      const mockToken = "mock-token";
      jest.spyOn(jwt, "sign").mockReturnValue(mockToken);

      // Act
      await register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        "password123",
        expect.any(Number)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "users",
            attributes: expect.objectContaining({
              username: "testuser",
              email: "test@example.com",
            }),
            meta: expect.objectContaining({
              token: "mock-token",
            }),
          }),
        })
      );
    });

    it("should return error if email already exists", async () => {
      // Arrange
      mockRequest.body = {
        username: "testuser",
        email: "existing@example.com",
        password: "password123",
      };

      mockUserRepo.findOneBy.mockResolvedValue({
        id: "existing-user-uuid",
        email: "existing@example.com",
      });

      // Act
      await register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              status: "409",
              title: "Conflict",
              detail: expect.stringContaining("already exists"),
            }),
          ]),
        })
      );
    });
  });

  describe("login", () => {
    it("should login user successfully with correct credentials", async () => {
      // Arrange
      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
      };

      mockUserRepo.findOneBy.mockResolvedValue({
        id: "user-uuid",
        username: "testuser",
        email: "test@example.com",
        password: "hashed_password",
        createdAt: new Date(),
      });

      (
        bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>
      ).mockResolvedValue(true as never);

      // Act
      await login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashed_password"
      );
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "users",
            id: "user-uuid",
            attributes: expect.objectContaining({
              username: "testuser",
              email: "test@example.com",
            }),
            meta: expect.objectContaining({
              token: "mock-token",
            }),
          }),
        })
      );
    });

    it("should return error if user not found", async () => {
      // Arrange
      mockRequest.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      mockUserRepo.findOneBy.mockResolvedValue(null);

      // Act
      await login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              status: "401",
              title: "Unauthorized",
              detail: "Invalid email or password",
            }),
          ]),
        })
      );
    });

    it("should return error if password is incorrect", async () => {
      // Arrange
      mockRequest.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      mockUserRepo.findOneBy.mockResolvedValue({
        id: "user-uuid",
        username: "testuser",
        email: "test@example.com",
        password: "hashed_password",
      });

      (
        bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>
      ).mockResolvedValue(false as never);

      // Act
      await login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              status: "401",
              title: "Unauthorized",
              detail: "Invalid email or password",
            }),
          ]),
        })
      );
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user details", async () => {
      // Arrange
      mockRequest.user = { id: "user-uuid" };
      mockUserRepo.findOneBy.mockResolvedValue({
        id: "user-uuid",
        username: "testuser",
        email: "test@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      await getCurrentUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({
        id: "user-uuid",
      });
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "users",
            id: "user-uuid",
            attributes: expect.objectContaining({
              username: "testuser",
              email: "test@example.com",
            }),
          }),
        })
      );
    });
  });
});
