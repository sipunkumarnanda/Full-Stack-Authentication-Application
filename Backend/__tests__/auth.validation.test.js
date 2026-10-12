
import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";

describe("Authentication request validation", () => {
  test("rejects malformed registration input", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: "ab",
        email: "invalid",
        password: "123",
        firstName: "",
        lastName: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  test("rejects an OTP containing non-numeric characters", async () => {
    const response = await request(app)
      .post("/api/auth/verify-otp")
      .send({
        email: "user@example.com",
        otp: "12AB56",
      });

    expect(response.status).toBe(400);
  });

  test("rejects a registration request with an invalid username", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: "invalid username!",
        email: "user@example.com",
        password: "StrongPassword123!",
        firstName: "Test",
        lastName: "User",
      });

    expect(response.status).toBe(400);
  });
});
