
import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";

describe("POST /api/auth/reset-password", () => {
  test("rejects missing reset details", async () => {
    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({});

    expect(response.status).toBe(400);
  });

  test("rejects an invalid OTP format", async () => {
    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({
        email: "user@example.com",
        otp: "123",
        newPassword: "NewStrongPassword123!",
      });

    expect(response.status).toBe(400);
  });

  test("rejects a weak new password", async () => {
    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({
        email: "user@example.com",
        otp: "123456",
        newPassword: "123",
      });

    expect(response.status).toBe(400);
  });

  test("rejects an incorrect OTP", async () => {
    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({
        email: "user@example.com",
        otp: "123456",
        newPassword: "NewStrongPassword123!",
      });

    expect([400, 401, 404]).toContain(response.status);
  });
});
