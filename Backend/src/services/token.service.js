

import jwt from "jsonwebtoken";

export function generateAccessToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      issuer: "login-registration-api",
      audience: "login-registration-client",
    }
  );
}

export function verifyAccessToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: "login-registration-api",
    audience: "login-registration-client",
  });
}

export default {
  generateAccessToken,
  verifyAccessToken,
};
