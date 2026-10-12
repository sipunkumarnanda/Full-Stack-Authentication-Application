

import { beforeAll, afterAll, afterEach } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  // Set test environment variables before running tests.
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET =
    "test-jwt-secret-at-least-32-characters";
  process.env.OTP_SECRET = "test-otp-secret";
  process.env.JWT_EXPIRES_IN = "15m";

  // Start an isolated, in-memory MongoDB server.
  mongoServer = await MongoMemoryServer.create();

  // Connect Mongoose to the test database.
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  // Clear every collection after each test.
  const collections = mongoose.connection.collections;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Disconnect Mongoose and stop the test database.
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});
