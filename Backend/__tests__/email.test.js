

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
const mockResendSend = jest.fn();

jest.unstable_mockModule("nodemailer", () => ({
  default: {
    createTransport: jest.fn(() => ({
      sendMail: mockSendMail,
      verify: jest.fn().mockResolvedValue(true),
    })),
  },
}));

jest.unstable_mockModule("resend", () => ({
  Resend: jest.fn(() => ({
    emails: { send: mockResendSend },
  })),
}));

const { sendOtpEmail } = await import("../src/services/email.service.js");

describe("Email service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResendSend.mockResolvedValue({
      data: { id: "resend-message" },
      error: null,
    });
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

    try {
      await expect(
        sendOtpEmail("sipun@example.com", "123456", "registration")
      ).resolves.toEqual({ messageId: "resend-message" });

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "AuthFlow <noreply@example.com>",
          to: "sipun@example.com",
          html: expect.any(String),
        }),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
      expect(mockSendMail).not.toHaveBeenCalled();
    } finally {
      delete process.env.RESEND_API_KEY;
      delete process.env.EMAIL_FROM;
    }
  });
});
