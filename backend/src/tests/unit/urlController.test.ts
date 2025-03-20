import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Request, Response } from "express";
import { AppDataSource } from "../../config/database";
import { Url } from "../../entities/Url";
import { User } from "../../entities/User";

// Define mock return type
type MockReturnType = any;

// Mock typeorm repository
jest.mock("../../config/database", () => {
  const mockUrlRepo = {
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

  return {
    AppDataSource: {
      getRepository: jest.fn((entity: any) => {
        if (entity === Url) return mockUrlRepo;
        if (entity === User) return mockUserRepo;
        return null;
      }),
    },
  };
});

// Import controllers after mocking the database
import {
  createShortUrl,
  redirectToOriginalUrl,
  getUrlDetails,
} from "../../controllers/urlController";

describe("URL Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUrlRepo: any;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis() as MockReturnType,
      json: jest.fn().mockReturnThis() as MockReturnType,
      redirect: jest.fn().mockReturnThis() as MockReturnType,
    };

    mockUrlRepo = AppDataSource.getRepository(Url);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("createShortUrl", () => {
    it("should create a short URL successfully", async () => {
      // Arrange
      mockRequest.body = { originalUrl: "https://example.com" };
      mockUrlRepo.findOne.mockResolvedValue(null);
      mockUrlRepo.save.mockResolvedValue({
        id: "some-uuid",
        originalUrl: "https://example.com",
        slug: "abc123",
        visitCount: 0,
        createdAt: new Date(),
      });

      // Mock for QRCode.toDataURL
      jest.mock("qrcode", () => ({
        toDataURL: jest
          .fn()
          .mockResolvedValue("mocked-qrcode-data" as MockReturnType),
      }));

      // Act
      await createShortUrl(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUrlRepo.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "urls",
            attributes: expect.objectContaining({
              originalUrl: "https://example.com",
            }),
          }),
        })
      );
    });

    it("should return error if URL creation fails", async () => {
      // Arrange
      mockRequest.body = { originalUrl: "https://example.com" };
      mockUrlRepo.findOne.mockResolvedValue(null);
      mockUrlRepo.save.mockRejectedValue(new Error("Database error"));

      // Act
      await createShortUrl(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              status: "500",
            }),
          ]),
        })
      );
    });
  });

  describe("redirectToOriginalUrl", () => {
    it("should redirect to original URL", async () => {
      // Arrange
      mockRequest.params = { slug: "abc123" };
      const mockUrl = {
        id: "some-uuid",
        originalUrl: "https://example.com",
        slug: "abc123",
        visitCount: 0,
      };
      mockUrlRepo.findOne.mockResolvedValue(mockUrl);
      mockUrlRepo.save.mockResolvedValue({
        ...mockUrl,
        visitCount: 1,
      });

      // Act
      await redirectToOriginalUrl(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockUrlRepo.findOne).toHaveBeenCalledWith({
        where: { slug: "abc123" },
      });
      expect(mockUrlRepo.save).toHaveBeenCalledWith({
        ...mockUrl,
        visitCount: 1,
      });
      expect(mockResponse.redirect).toHaveBeenCalledWith("https://example.com");
    });

    it("should return 404 if URL not found", async () => {
      // Arrange
      mockRequest.params = { slug: "nonexistent" };
      mockUrlRepo.findOne.mockResolvedValue(null);

      // Act
      await redirectToOriginalUrl(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              status: "404",
              title: "Not Found",
            }),
          ]),
        })
      );
    });
  });

  describe("getUrlDetails", () => {
    it("should return URL details", async () => {
      // Arrange
      mockRequest.params = { id: "some-uuid" };
      mockUrlRepo.findOne.mockResolvedValue({
        id: "some-uuid",
        originalUrl: "https://example.com",
        slug: "abc123",
        visitCount: 5,
        createdAt: new Date(),
        user: null,
      });

      // Act
      await getUrlDetails(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUrlRepo.findOne).toHaveBeenCalledWith({
        where: { id: "some-uuid" },
        relations: { user: true },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "urls",
            id: "some-uuid",
            attributes: expect.objectContaining({
              originalUrl: "https://example.com",
              slug: "abc123",
              visitCount: 5,
            }),
          }),
        })
      );
    });

    it("should return 404 if URL not found", async () => {
      // Arrange
      mockRequest.params = { id: "nonexistent" };
      mockUrlRepo.findOne.mockResolvedValue(null);

      // Act
      await getUrlDetails(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              status: "404",
            }),
          ]),
        })
      );
    });
  });
});
