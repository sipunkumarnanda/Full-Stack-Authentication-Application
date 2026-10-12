
import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";

describe("POST /api/auth/logout", () => {
  test("returns a successful logout response", async () => {
    const response = await request(app)
      .post("/api/auth/logout");

    expect([200, 204]).toContain(response.status);
  });

  test("clears the access token cookie", async () => {
    const response = await request(app)
      .post("/api/auth/logout");

    const cookies = response.headers["set-cookie"] || [];

    expect(
      cookies.some((cookie) =>
        /^accessToken=;/.test(cookie)
      )
    ).toBe(true);
  });
});
