import {
  jest,
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";

const originalFetch = global.fetch;

const { sendOtpEmail } = await import("../src/services/email.service.js");

describe("EmailJS email service", () => {
  beforeEach(() => {
    process.env.EMAILJS_SERVICE_ID = "service_test";
    process.env.EMAILJS_TEMPLATE_ID = "template_test";
    process.env.EMAILJS_PUBLIC_KEY = "public_test";
    process.env.EMAILJS_PRIVATE_KEY = "private_test";
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.EMAILJS_SERVICE_ID;
    delete process.env.EMAILJS_TEMPLATE_ID;
    delete process.env.EMAILJS_PUBLIC_KEY;
    delete process.env.EMAILJS_PRIVATE_KEY;
  });

  test.each(["registration", "password-reset"])(
    "sends the %s OTP through EmailJS",
    async (purpose) => {
    await expect(
      sendOtpEmail("sipun@example.com", "123456", purpose)
    ).resolves.toEqual({ messageId: "emailjs-accepted" });

    const [, options] = global.fetch.mock.calls[0];
    const payload = JSON.parse(options.body);

    expect(payload).toMatchObject({
      service_id: "service_test",
      template_id: "template_test",
      user_id: "public_test",
      accessToken: "private_test",
      template_params: {
        to_email: "sipun@example.com",
        to_name: expect.any(String),
        otp: "123456",
        expiry_minutes: 5,
      },
    });
      expect(options.signal).toBeInstanceOf(AbortSignal);
    }
  );

  test("fails safely when EmailJS rejects a request", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      text: jest.fn().mockResolvedValue(
        "Private key private_test rejected for sipun@example.com and OTP 123456"
      ),
    });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      await expect(
        sendOtpEmail("sipun@example.com", "123456")
      ).rejects.toMatchObject({
        statusCode: 502,
        message: "Email delivery is temporarily unavailable.",
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        "EmailJS delivery failed",
        {
          status: 403,
          statusText: "Forbidden",
          reason: "Private key [redacted] rejected for [redacted] and OTP [redacted]",
        }
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });

  test("requires the server-side EmailJS configuration", async () => {
    delete process.env.EMAILJS_SERVICE_ID;

    await expect(
      sendOtpEmail("sipun@example.com", "123456")
    ).rejects.toMatchObject({
      statusCode: 503,
      message: expect.stringContaining("EMAILJS_SERVICE_ID"),
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
