

import {
  createHmac,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

import redis from "../db/redis.js";

const OTP_TTL_SECONDS = 5 * 60;
const MAX_OTP_ATTEMPTS = 5;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function createOtpHash(otp) {
  const secret = process.env.OTP_SECRET;

  if (!secret) {
    throw new Error("OTP_SECRET is not configured");
  }

  return createHmac("sha256", secret)
    .update(otp)
    .digest("hex");
}

function hashesMatch(storedHash, submittedHash) {
  const stored = Buffer.from(storedHash, "hex");
  const submitted = Buffer.from(submittedHash, "hex");

  return (
    stored.length === submitted.length &&
    timingSafeEqual(stored, submitted)
  );
}

function getOtpKey(email, purpose) {
  return `otp:${purpose}:${normalizeEmail(email)}`;
}

function getAttemptsKey(email, purpose) {
  return `otp-attempts:${purpose}:${normalizeEmail(email)}`;
}

function validatePurpose(purpose) {
  const allowedPurposes = ["registration", "password-reset"];

  if (!allowedPurposes.includes(purpose)) {
    throw new Error("Invalid OTP purpose");
  }
}

/**
 * Generate an OTP and store its hash in Redis.
 * Returns the raw OTP so the caller can email it.
 * Never log or return this OTP in an API response.
 */
export async function generateOtp(email, purpose = "registration") {
  validatePurpose(purpose);

  const normalizedEmail = normalizeEmail(email);
  const otp = String(randomInt(100000, 1000000));

  const otpKey = getOtpKey(normalizedEmail, purpose);
  const attemptsKey = getAttemptsKey(normalizedEmail, purpose);

  await redis.set(
    otpKey,
    createOtpHash(otp),
    "EX",
    OTP_TTL_SECONDS
  );

  await redis.del(attemptsKey);

  // The controller passes this value to the email service.
  return otp;
}

/**
 * Verify an OTP, limit failed attempts, and invalidate it on success.
 */
export async function verifyOtp(
  email,
  submittedOtp,
  purpose = "registration"
) {
  validatePurpose(purpose);

  if (!/^\d{6}$/.test(submittedOtp)) {
    return { valid: false, reason: "INVALID_OTP" };
  }

  const normalizedEmail = normalizeEmail(email);
  const otpKey = getOtpKey(normalizedEmail, purpose);
  const attemptsKey = getAttemptsKey(normalizedEmail, purpose);

  const storedHash = await redis.get(otpKey);

  if (!storedHash) {
    return { valid: false, reason: "OTP_EXPIRED_OR_NOT_FOUND" };
  }

  const attempts = Number(await redis.get(attemptsKey) || 0);

  if (attempts >= MAX_OTP_ATTEMPTS) {
    await redis.del(otpKey);
    await redis.del(attemptsKey);

    return { valid: false, reason: "TOO_MANY_ATTEMPTS" };
  }

  const submittedHash = createOtpHash(submittedOtp);

  if (!hashesMatch(storedHash, submittedHash)) {
    const nextAttempts = attempts + 1;
    const remainingTtl = await redis.ttl(otpKey);

    if (nextAttempts >= MAX_OTP_ATTEMPTS) {
      await redis.del(otpKey);
      await redis.del(attemptsKey);

      return { valid: false, reason: "TOO_MANY_ATTEMPTS" };
    }

    // Keep the attempts counter alive for no longer than the OTP.
    await redis.set(
      attemptsKey,
      String(nextAttempts),
      "EX",
      Math.max(remainingTtl, 1)
    );

    return { valid: false, reason: "INVALID_OTP" };
  }

  // One-time use: a successful OTP cannot be reused.
  await redis.del(otpKey);
  await redis.del(attemptsKey);

  return { valid: true };
}

/**
 * Remove a pending OTP, for example when resending or cancelling.
 */
export async function deleteOtp(email, purpose = "registration") {
  validatePurpose(purpose);

  await redis.del(getOtpKey(email, purpose));
  await redis.del(getAttemptsKey(email, purpose));
}
