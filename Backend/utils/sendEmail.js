const EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";
const EMAIL_TIMEOUT_MS = 15000;
const OTP_EXPIRY_MINUTES = 5;

function requiredEnvironment(name) {
  const value = (process.env[name] || "").trim();
  if (!value) {
    const error = new Error(`Email service is not configured: ${name}`);
    error.statusCode = 503;
    throw error;
  }
  return value;
}

export async function sendEmail(to, name, otp) {
  const payload = {
    service_id: requiredEnvironment("EMAILJS_SERVICE_ID"),
    template_id: requiredEnvironment("EMAILJS_TEMPLATE_ID"),
    user_id: requiredEnvironment("EMAILJS_PUBLIC_KEY"),
    template_params: {
      to_email: to,
      to_name: name,
      otp,
      expiry_minutes: OTP_EXPIRY_MINUTES,
    },
  };

  const privateKey = (process.env.EMAILJS_PRIVATE_KEY || "").trim();
  if (privateKey) payload.accessToken = privateKey;

  let response;
  try {
    response = await fetch(EMAILJS_SEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut =
      error?.name === "AbortError" || error?.name === "TimeoutError";
    const deliveryError = new Error(
      timedOut
        ? "Email delivery timed out. Please try again."
        : "Email delivery is temporarily unavailable."
    );
    deliveryError.statusCode = timedOut ? 504 : 502;
    throw deliveryError;
  }

  if (!response.ok) {
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

  return true;
}

export default sendEmail;
