

import nodemailer from "nodemailer";

let transporter;

function getSmtpTransporter() {
  if (!transporter) {
    const emailPort = Number(process.env.EMAIL_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return transporter;
}

async function sendWithResend(message) {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) {
    const error = new Error("Email service is not configured");
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
    signal: AbortSignal.timeout(15000),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Email provider rejected the message");
    error.statusCode = response.status >= 400 && response.status <= 599
      ? response.status
      : 502;
    throw error;
  }

  return { messageId: data.id };
}

export async function sendOtpEmail(email, otp, purpose = "registration") {
  const subject =
    purpose === "password-reset"
      ? "Reset your password"
      : "Verify your email address";

  const heading =
    purpose === "password-reset"
      ? "Password Reset"
      : "Email Verification";

  const text = [
    `Your ${purpose === "password-reset" ? "password reset" : "email verification"} OTP is: ${otp}`,
    "",
    "This OTP expires in 5 minutes.",
    "Do not share this code with anyone.",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2>${heading}</h2>
      <p>Use the following code to continue:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">
        ${otp}
      </p>
      <p>This code expires in 5 minutes.</p>
      <p>Do not share this code with anyone.</p>
      <p>If you did not request this, ignore this email.</p>
    </div>
  `;

  const message = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject,
    text,
    html,
  };

  // Render free services block outbound SMTP ports. Resend uses HTTPS (443)
  // and is selected automatically whenever its API key is configured.
  if (process.env.RESEND_API_KEY) {
    return sendWithResend(message);
  }

  try {
    const result = await getSmtpTransporter().sendMail(message);

    return { messageId: result.messageId };
  } catch (error) {
    if (error?.code === "ETIMEDOUT") {
      const unavailable = new Error(
        "Email service is unavailable. Configure RESEND_API_KEY on Render or use a paid service that permits SMTP."
      );
      unavailable.statusCode = 503;
      throw unavailable;
    }
    throw error;
  }
}

export default { sendOtpEmail };
