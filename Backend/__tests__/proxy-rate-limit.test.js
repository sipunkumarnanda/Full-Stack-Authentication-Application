import request from "supertest";

import app from "../src/app.js";
import { rateLimitKeyGenerator } from "../src/middlewares/rateLimit.middleware.js";

describe("Proxy-aware rate limiting", () => {
  test("trusts exactly one proxy hop on Render", () => {
    expect(app.get("trust proxy")).toBe(1);
  });

  test("normalizes the Express-resolved client IP", () => {
    expect(rateLimitKeyGenerator({ ip: "2001:db8::1" })).toBe("2001:db8::/56");
  });

  test("accepts proxy headers without rate-limit validation errors", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "203.0.113.10")
      .set("Forwarded", "for=203.0.113.10;proto=https")
      .send({ email: "invalid@example.com", password: "Password123!" });

    expect(response.status).toBe(401);
  });
});
