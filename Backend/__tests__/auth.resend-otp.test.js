

import {
  jest,
  describe,
  test,
  expect,
} from "@jest/globals";

import request from "supertest";

jest.unstable_mockModule("../src/services/email.service.js", () => {
  const sendOtpEmail = jest.fn().mockResolvedValue({
    messageId: "test-message",
  });

  return {
    sendOtpEmail,
    default: { sendOtpEmail },
  };
});

const { default: app } = await import("../src/app.js");

describe("POST /api/auth/resend-otp", () => {
  test("rejects a missing email", async () => {
    const response = await request(app)
      .post("/api/auth/resend-otp")
      .send({});

    expect(response.status).toBe(400);
  });

  test("rejects an invalid email", async () => {
    const response = await request(app)
      .post("/api/auth/resend-otp")
      .send({ email: "not-an-email" });

    expect(response.status).toBe(400);
  });

  test("does not expose internal errors for an unknown email", async () => {
    const response = await request(app)
      .post("/api/auth/resend-otp")
      .send({ email: "unknown@example.com" });

    expect(response.status).not.toBe(500);
  });
});
