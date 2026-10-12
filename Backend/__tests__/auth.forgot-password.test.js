
import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";

describe("POST /api/auth/forgot-password", () => {
  test("rejects a missing email", async () => {
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({});

    expect(response.status).toBe(400);
  });

  test("rejects an invalid email", async () => {
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "invalid-email" });

    expect(response.status).toBe(400);
  });

  test("does not return an internal server error for an unknown email", async () => {
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "unknown@example.com" });

    expect(response.status).not.toBe(500);
  });
});
