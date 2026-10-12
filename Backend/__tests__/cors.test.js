import request from "supertest";

import app from "../src/app.js";

describe("CORS", () => {
  test("allows the deployed Vercel frontend and credentials", async () => {
    const origin = "https://full-stack-authentication-applicati.vercel.app";
    const response = await request(app)
      .options("/api/auth/login")
      .set("Origin", origin)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(origin);
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  test("does not grant CORS access to an unknown origin", async () => {
    const response = await request(app)
      .options("/api/auth/login")
      .set("Origin", "https://example.com")
      .set("Access-Control-Request-Method", "POST");

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
