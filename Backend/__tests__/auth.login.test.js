
import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";

describe("POST /api/auth/login", () => {
  test("rejects missing credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(response.status).toBe(400);
  });

  test("rejects an invalid email", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "invalid", password: "StrongPassword123!" });

    expect(response.status).toBe(400);
  });

  test("rejects incorrect credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "unknown@example.com",
        password: "WrongPassword123!",
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("does not return a password in the response", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "unknown@example.com",
        password: "WrongPassword123!",
      });

    expect(response.body.user?.password).toBeUndefined();
  });
});
