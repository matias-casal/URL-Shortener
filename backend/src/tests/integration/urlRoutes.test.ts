import {
  describe,
  it,
  expect,
  jest,
  beforeAll,
  beforeEach,
} from "@jest/globals";
import supertest from "supertest";
import express from "express";
import { Url } from "../../entities/Url";
import { User } from "../../entities/User";

// Define mock return types
type MockReturnType = any;

// Mock database repositories
const mockUrlRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockUserRepo = {
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

// Mock Redis
jest.mock("../../config/redis", () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    increment: jest.fn(),
  },
  connectRedis: jest.fn().mockResolvedValue(true as MockReturnType),
}));

jest.mock("../../config/database", () => ({
  AppDataSource: {
    getRepository: jest.fn((entity: any) => {
      if (entity === Url) return mockUrlRepo;
      if (entity === User) return mockUserRepo;
      return null;
    }),
    initialize: jest.fn().mockResolvedValue(true as MockReturnType),
  },
}));

// Mock JWT verification
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
  sign: jest.fn().mockReturnValue("test-token"),
}));

// Mock Rate Limiter
jest.mock("../../middleware/rateLimiter", () => ({
  rateLimiterMiddleware: jest.fn((req: any, res: any, next: any) => next()),
}));

// Import after mocking
import { AppDataSource } from "../../config/database";
import { connectRedis } from "../../config/redis";
import urlRoutes from "../../routes/urlRoutes";
import authRoutes from "../../routes/authRoutes";
import { authMiddleware } from "../../middleware/auth";
import jwt from "jsonwebtoken";

describe("URL Routes Integration Tests", () => {
  let app: express.Application;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(() => {
    // Set up the express application
    app = express();
    app.use(express.json());
    app.use(authMiddleware);
    app.use("/api/urls", urlRoutes);
    app.use("/api/auth", authRoutes);

    request = supertest(app);
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe("POST /api/urls", () => {
    it("should create a new short URL", async () => {
      // Arrange
      const testUrl = {
        id: "url-uuid",
        originalUrl: "https://example.com",
        slug: "abc123",
        visitCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlRepo.findOne.mockResolvedValue(null);
      mockUrlRepo.create.mockReturnValue(testUrl as any);
      mockUrlRepo.save.mockResolvedValue(testUrl as any);

      // Act
      const response = await request
        .post("/api/urls")
        .send({ originalUrl: "https://example.com" });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data).toBeTruthy();
      expect(response.body.data.attributes).toBeTruthy();
      expect(response.body.data.attributes.originalUrl).toBe(
        "https://example.com"
      );
      expect(mockUrlRepo.save).toHaveBeenCalled();
    });

    it("should return validation error for invalid URL", async () => {
      // Act
      const response = await request
        .post("/api/urls")
        .send({ originalUrl: "not-a-valid-url" });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors[0]).toHaveProperty(
        "detail",
        "The provided URL is not valid"
      );
    });
  });

  describe("GET /api/urls/redirect/:slug", () => {
    it("should return redirect information for valid slug", async () => {
      // Arrange
      const testUrl = {
        id: "url-uuid",
        originalUrl: "https://example.com",
        slug: "abc123",
        visitCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlRepo.findOne.mockResolvedValue(testUrl as any);
      mockUrlRepo.save.mockResolvedValue({
        ...testUrl,
        visitCount: 1,
      } as any);

      // Act
      const response = await request.get("/api/urls/redirect/abc123");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "originalUrl",
        "https://example.com"
      );
      expect(mockUrlRepo.findOne).toHaveBeenCalledWith({
        where: { slug: "abc123" },
      });
    });

    it("should return 404 for non-existent slug", async () => {
      // Arrange
      mockUrlRepo.findOne.mockResolvedValue(null);

      // Act
      const response = await request.get("/api/urls/redirect/nonexistent");

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("errors");
    });
  });

  describe("GET /api/urls/user/urls", () => {
    it("should return user URLs when authenticated", async () => {
      // Arrange
      const testUser = {
        id: "user-uuid",
        email: "test@example.com",
      };

      (jwt.verify as jest.Mock).mockImplementation(() => testUser);

      const testUrls = [
        {
          id: "url-uuid-1",
          originalUrl: "https://example1.com",
          slug: "abc123",
          visitCount: 5,
        },
        {
          id: "url-uuid-2",
          originalUrl: "https://example2.com",
          slug: "def456",
          visitCount: 3,
        },
      ];

      mockUrlRepo.find.mockResolvedValue(testUrls as any);

      // Act
      const response = await request
        .get("/api/urls/user/urls")
        .set("Authorization", "Bearer test-token");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(mockUrlRepo.find).toHaveBeenCalledWith({
        where: { user: { id: testUser.id } },
        order: { createdAt: "DESC" },
      });
    });

    it("should return 401 when not authenticated", async () => {
      // Act
      const response = await request.get("/api/urls/user/urls");

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("errors");
    });
  });
});
