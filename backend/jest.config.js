module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        isolatedModules: true,
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/src/tests/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/tests/**/*.ts", "!src/index.ts"],
};
