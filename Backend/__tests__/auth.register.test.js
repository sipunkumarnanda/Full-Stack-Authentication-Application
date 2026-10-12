

import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import request from "supertest";

jest.unstable_mockModule("../src/services/email.service.js", () => ({
  sendOtpEmail: jest.fn().mockResolvedValue({ messageId: "test-message" }),
  default: {
    sendOtpEmail: jest.fn().mockResolvedValue({ messageId: "test-message" }),
  },
}));

const { default: app } = await import("../src/app.js");

describe("POST /api/auth/register", () => {
  const validUser = {
    username: "sipun123",
    email: "sipun@example.com",
    password: "StrongPassword123!",
    firstName: "Sipun",
    lastName: "Nanda",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("accepts valid registration details and sends an OTP", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect([200, 201]).toContain(response.status);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toMatch(/otp/i);
  });

  test("rejects an invalid email", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, email: "invalid-email" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("rejects a password that is too short", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, password: "123" });

    expect(response.status).toBe(400);
  });

  test("rejects missing required fields", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: validUser.email });

    expect(response.status).toBe(400);
  });

  test("does not allow a client to assign a privileged role", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, role: "admin" });

    // Registration may succeed, but the client-supplied role
    // must never grant administrator privileges.
    if ([200, 201].includes(response.status)) {
      expect(response.body.user?.role).not.toBe("admin");
    } else {
      expect([400, 409]).toContain(response.status);
    }
  });
});
