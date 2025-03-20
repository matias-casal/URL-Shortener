import "@jest/globals";

declare global {
  namespace NodeJS {
    interface Global {
      testConnection: any;
    }
  }
}
