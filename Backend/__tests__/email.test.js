

import {
  jest,
  describe,
  test,
  expect,
  beforeEach,
} from "@jest/globals";

const mockSendMail = jest.fn().mockResolvedValue({
  messageId: "test-message",
});

jest.unstable_mockModule("nodemailer", () => ({
  default: {
    createTransport: jest.fn(() => ({
      sendMail: mockSendMail,
      verify: jest.fn().mockResolvedValue(true),
    })),
  },
}));

const { sendOtpEmail } = await import("../src/services/email.service.js");

describe("Email service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.RESEND_API_KEY;
  });

  test("sends a registration OTP email", async () => {
    await sendOtpEmail(
      "sipun@example.com",
      "123456",
      "registration"
    );

    expect(mockSendMail).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "sipun@example.com",
        subject: expect.any(String),
      })
    );
  });

  test("uses the Resend HTTPS API when configured", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "AuthFlow <noreply@example.com>";
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ id: "resend-message" }),
    });

    try {
      await expect(
        sendOtpEmail("sipun@example.com", "123456", "registration")
      ).resolves.toEqual({ messageId: "resend-message" });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({ method: "POST" })
      );
      expect(mockSendMail).not.toHaveBeenCalled();
    } finally {
      global.fetch = originalFetch;
      delete process.env.RESEND_API_KEY;
      delete process.env.EMAIL_FROM;
    }
  });
});
