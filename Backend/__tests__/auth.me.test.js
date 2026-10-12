
import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";

describe("GET /api/auth/me", () => {
  test("rejects a request without authentication", async () => {
    const response = await request(app)
      .get("/api/auth/me");

    expect(response.status).toBe(401);
  });

  test("rejects an invalid JWT", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", ["accessToken=invalid-token"]);

    expect(response.status).toBe(401);
  });
});
