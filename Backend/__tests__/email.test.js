

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
});
