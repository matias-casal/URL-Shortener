import "reflect-metadata";
import { jest, beforeAll, afterAll } from "@jest/globals";
import dotenv from "dotenv";
import { AppDataSource } from "../config/database";
import { DataSource, DataSourceOptions } from "typeorm";

// Load environment variables
dotenv.config({ path: ".env.test" });

// Define mock return type
type MockReturnType = any;

// Mock Redis service
jest.mock("../config/redis", () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    increment: jest.fn(),
  },
  connectRedis: jest.fn().mockResolvedValue(true as MockReturnType),
}));

// Create a test database connection
let testConnection: DataSource;

beforeAll(async () => {
  // Setup test database connection if running integration tests
  if (process.env.TEST_TYPE === "integration") {
    const options = {
      ...AppDataSource.options,
      database: process.env.TEST_DB_NAME || "url_shortener_test",
      synchronize: true,
      dropSchema: true,
    } as DataSourceOptions;

    testConnection = new DataSource(options);
    await testConnection.initialize();
    console.log("Test database connected");
  }
});

afterAll(async () => {
  // Close database connection after tests
  if (testConnection?.isInitialized) {
    await testConnection.destroy();
    console.log("Test database connection closed");
  }
});
