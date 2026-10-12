import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Skip rate limiting only during automated tests
const skipRateLimitInTests = () =>
  process.env.NODE_ENV === "test";

// req.ip is resolved from X-Forwarded-For using Express's one-hop proxy trust.
// A custom generator also prevents express-rate-limit from treating the
// additional RFC Forwarded header supplied by the hosting proxy as an error.
export const rateLimitKeyGenerator = (req) => ipKeyGenerator(req.ip);

const proxyAwareOptions = {
  keyGenerator: rateLimitKeyGenerator,
};

// Login: 5 requests per minute
export const loginLimiter = rateLimit({
  ...proxyAwareOptions,
  windowMs: 1 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimitInTests,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 1 minute.",
  },
});

// OTP-related routes: 1 request per minute
export const otpLimiter = rateLimit({
  ...proxyAwareOptions,
  windowMs: 1 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimitInTests,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after 1 minute.",
  },
});

// Reset password: 5 requests per minute
export const passwordResetLimiter = rateLimit({
  ...proxyAwareOptions,
  windowMs: 1 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimitInTests,
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again after 1 minute.",
  },
});
