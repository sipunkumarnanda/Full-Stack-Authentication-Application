
import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  generateOtp,
  verifyOtp,
  deleteOtp,
} from "../src/services/otp.service.js";

describe("OTP service", () => {
  beforeEach(() => {
    process.env.OTP_SECRET = "test-otp-secret";
  });

  test("generates a six-digit OTP", async () => {
    const otp = await generateOtp(
      "otp-test@example.com",
      "registration"
    );

    expect(otp).toMatch(/^\d{6}$/);
  });

  test("accepts a correct OTP only once", async () => {
    const email = "once@example.com";
    const otp = await generateOtp(email, "registration");

    expect(
      await verifyOtp(email, otp, "registration")
    ).toEqual({ valid: true });

    expect(
      await verifyOtp(email, otp, "registration")
    ).toMatchObject({ valid: false });
  });

  test("rejects an incorrect OTP", async () => {
    const email = "wrong@example.com";

    await generateOtp(email, "registration");

    const result = await verifyOtp(
      email,
      "000000",
      "registration"
    );

    expect(result.valid).toBe(false);
  });

  test("rejects an OTP with the wrong format", async () => {
    const result = await verifyOtp(
      "format@example.com",
      "123",
      "registration"
    );

    expect(result).toMatchObject({
      valid: false,
      reason: "INVALID_OTP",
    });
  });

  test("allows OTP deletion", async () => {
    const email = "delete@example.com";

    await generateOtp(email, "registration");
    await deleteOtp(email, "registration");

    const result = await verifyOtp(
      email,
      "123456",
      "registration"
    );

    expect(result.valid).toBe(false);
  });
});
