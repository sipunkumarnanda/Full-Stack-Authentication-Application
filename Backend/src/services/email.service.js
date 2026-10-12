import nodemailer from "nodemailer";

const emailPort = Number(process.env.EMAIL_PORT || 587);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

  const result = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject,
    text,
    html,
  });

  return {
    messageId: result.messageId,
  };
}

export default { sendOtpEmail };
