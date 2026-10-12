import sendEmail from "../../utils/sendEmail.js";

export async function sendOtpEmail(email, otp, purpose = "registration") {
  const recipientName =
    purpose === "password-reset" ? "AuthFlow user" : "New AuthFlow user";

  await sendEmail(email, recipientName, otp);

  return { messageId: "emailjs-accepted" };
}

export default { sendOtpEmail };
