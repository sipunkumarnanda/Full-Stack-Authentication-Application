const EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";
const EMAIL_TIMEOUT_MS = 15000;

function getEmailJsConfig() {
  const config = {
    serviceId: (process.env.EMAILJS_SERVICE_ID || "").trim(),
    templateId: (process.env.EMAILJS_TEMPLATE_ID || "").trim(),
    publicKey: (process.env.EMAILJS_PUBLIC_KEY || "").trim(),
    privateKey: (process.env.EMAILJS_PRIVATE_KEY || "").trim(),
  };

  const missing = [];
  if (!config.serviceId) missing.push("EMAILJS_SERVICE_ID");
  if (!config.templateId) missing.push("EMAILJS_TEMPLATE_ID");
  if (!config.publicKey) missing.push("EMAILJS_PUBLIC_KEY");

  if (missing.length) {
    const error = new Error(
      `Email service is not configured: ${missing.join(", ")}`
    );
    error.statusCode = 503;
    throw error;
  }

  return config;
}

function emailContent(purpose) {
  const isPasswordReset = purpose === "password-reset";

  return {
    subject: isPasswordReset
      ? "Reset your password"
      : "Verify your email address",
    heading: isPasswordReset
      ? "Password Reset"
      : "Email Verification",
    purposeLabel: isPasswordReset
      ? "password reset"
      : "email verification",
  };
}

export async function sendOtpEmail(email, otp, purpose = "registration") {
  const config = getEmailJsConfig();
  const content = emailContent(purpose);
  const payload = {
    service_id: config.serviceId,
    template_id: config.templateId,
    user_id: config.publicKey,
    template_params: {
      to_email: email,
      otp,
      passcode: otp,
      purpose,
      purpose_label: content.purposeLabel,
      subject: content.subject,
      heading: content.heading,
      expires_in: "5 minutes",
      app_name: "AuthFlow",
    },
  };

  if (config.privateKey) {
    payload.accessToken = config.privateKey;
  }

  let response;
  try {
    response = await fetch(EMAILJS_SEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
    });
  } catch (error) {
    const isTimeout =
      error?.name === "AbortError" || error?.name === "TimeoutError";
    const unavailable = new Error(
      isTimeout
        ? "Email delivery timed out. Please try again."
        : "Email delivery is temporarily unavailable."
    );
    unavailable.statusCode = isTimeout ? 504 : 502;
    throw unavailable;
  }

  if (!response.ok) {
    // Log only operational metadata. Never log keys, recipient addresses, or OTPs.
    console.error("EmailJS delivery failed", {
      status: response.status,
      statusText: response.statusText,
    });

    const error = new Error(
      response.status === 429
        ? "Email service is busy. Please wait before requesting another code."
        : "Email delivery is temporarily unavailable."
    );
    error.statusCode = response.status === 429 ? 503 : 502;
    throw error;
  }

  return { messageId: "emailjs-accepted" };
}

export default { sendOtpEmail };
