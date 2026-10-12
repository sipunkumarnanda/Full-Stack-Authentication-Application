import { describe, test, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/user.model.js";
import { generateAccessToken } from "../src/services/token.service.js";

describe("User addresses", () => {
  test("requires authentication to retrieve addresses", async () => {
    const response = await request(app)
      .get("/api/auth/users/me/addresses");

    expect(response.status).toBe(401);
  });

  test("requires authentication to add an address", async () => {
    const response = await request(app)
      .post("/api/auth/users/me/addresses")
      .send({
        street: "Main Street",
        city: "Baripada",
        state: "Odisha",
        pincode: 757001,
        country: "India",
        phone: 9999999999,
      });

    expect(response.status).toBe(401);
  });

  test("requires authentication to delete an address", async () => {
    const response = await request(app)
      .delete(
        "/api/auth/users/me/addresses/507f1f77bcf86cd799439011"
      );

    expect(response.status).toBe(401);
  });
});

describe("Address input validation (authenticated)", () => {
  let user;
  let authCookie;

  const validAddress = {
    street: "123 Innovation Boulevard",
    city: "Rairangpur",
    state: "Odisha",
    pincode: 757001,
    country: "India",
    phone: 9876543210,
    isDefault: true,
  };

  beforeEach(async () => {
    user = await User.create({
      username: "address_tester",
      email: "tester@example.com",
      password: "HashedPassword123!",
      fullName: { firstName: "Tester", lastName: "User" },
      role: "user",
      isEmailVerified: true,
      addresses: [],
    });
    const token = generateAccessToken(user._id);
    authCookie = [`accessToken=${token}`];
  });

  test("rejects string 'apple' for pincode with 400 Bad Request", async () => {
    const response = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", authCookie)
      .send({
        ...validAddress,
        pincode: "apple",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "pincode" }),
      ])
    );
  });

  test("rejects string 'Apples good' for phone with 400 Bad Request", async () => {
    const response = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", authCookie)
      .send({
        ...validAddress,
        phone: "Apples good",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "phone" }),
      ])
    );
  });

  test("rejects numeric strings for both pincode and phone", async () => {
    const response = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", authCookie)
      .send({
        ...validAddress,
        pincode: "757001",
        phone: "9876543210",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors.some((e) => e.field === "pincode")).toBe(true);
    expect(response.body.errors.some((e) => e.field === "phone")).toBe(true);
  });

  test("rejects PIN codes shorter than 6 digits (e.g. 12345)", async () => {
    const response = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", authCookie)
      .send({
        ...validAddress,
        pincode: 12345,
      });

    expect(response.status).toBe(400);
    expect(response.body.errors.some((e) => e.field === "pincode")).toBe(true);
  });

  test("rejects PIN codes longer than 6 digits (e.g. 1234567)", async () => {
    const response = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", authCookie)
      .send({
        ...validAddress,
        pincode: 1234567,
      });

    expect(response.status).toBe(400);
    expect(response.body.errors.some((e) => e.field === "pincode")).toBe(true);
  });

  test("rejects phone numbers with incorrect length (e.g. 9 digits)", async () => {
    const response = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", authCookie)
      .send({
        ...validAddress,
        phone: 987654321,
      });

    expect(response.status).toBe(400);
    expect(response.body.errors.some((e) => e.field === "phone")).toBe(true);
  });

  test("rejects phone numbers that do not start with 6-9 (e.g. 1234567890)", async () => {
    const response = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", authCookie)
      .send({
        ...validAddress,
        phone: 1234567890,
      });

    expect(response.status).toBe(400);
    expect(response.body.errors.some((e) => e.field === "phone")).toBe(true);
  });

  test("rejects missing required fields", async () => {
    const response = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", authCookie)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  test("rejects invalid city/state/country input containing numbers or symbols", async () => {
    const response = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", authCookie)
      .send({
        ...validAddress,
        city: "City123",
        state: "State@#$",
        country: "Country99",
      });

    expect(response.status).toBe(400);
    expect(response.body.errors.some((e) => e.field === "city")).toBe(true);
    expect(response.body.errors.some((e) => e.field === "state")).toBe(true);
    expect(response.body.errors.some((e) => e.field === "country")).toBe(true);
  });

  test("rejects street exceeding 150 characters", async () => {
    const response = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", authCookie)
      .send({
        ...validAddress,
        street: "A".repeat(151),
      });

    expect(response.status).toBe(400);
    expect(response.body.errors.some((e) => e.field === "street")).toBe(true);
  });

  test("accepts valid address data with JSON numbers for pincode and phone", async () => {
    const response = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", authCookie)
      .send(validAddress);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.addresses).toHaveLength(1);
    expect(response.body.addresses[0].pincode).toBe(757001);
    expect(response.body.addresses[0].phone).toBe(9876543210);
  });

  test("confirms invalid request does not save to MongoDB", async () => {
    // Attempt invalid request with apple and Apples good
    const response = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", authCookie)
      .send({
        street: "Main Road",
        city: "Rairangpur",
        state: "Odisha",
        pincode: "apple",
        country: "India",
        phone: "Apples good",
        isDefault: false,
      });

    expect(response.status).toBe(400);

    // Verify database document remains completely unchanged
    const freshUser = await User.findById(user._id);
    expect(freshUser.addresses).toHaveLength(0);
  });

  test("updates an existing address via PUT /api/auth/users/me/addresses/:addressId", async () => {
    // Create initial address
    user.addresses.push({
      street: "Old Street",
      city: "Old City",
      state: "Odisha",
      pincode: 757001,
      country: "India",
      phone: 9876543210,
      isDefault: true,
    });
    await user.save();
    const addressId = user.addresses[0]._id;

    const response = await request(app)
      .put(`/api/auth/users/me/addresses/${addressId}`)
      .set("Cookie", authCookie)
      .send({
        street: "Updated Street 456",
        city: "Rairangpur",
        state: "Odisha",
        pincode: 757050,
        country: "India",
        phone: 9668187490,
        isDefault: true,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Address updated successfully");
    expect(response.body.address._id).toBe(String(addressId));
    expect(response.body.address.street).toBe("Updated Street 456");
    expect(response.body.addresses[0].street).toBe("Updated Street 456");
    expect(response.body.addresses[0].pincode).toBe(757050);
    expect(response.body.addresses[0].phone).toBe(9668187490);
  });

  test("rejects PUT update with invalid pincode", async () => {
    user.addresses.push({
      street: "Old Street",
      city: "Old City",
      state: "Odisha",
      pincode: 757001,
      country: "India",
      phone: 9876543210,
      isDefault: true,
    });
    await user.save();
    const addressId = user.addresses[0]._id;

    const response = await request(app)
      .put(`/api/auth/users/me/addresses/${addressId}`)
      .set("Cookie", authCookie)
      .send({
        street: "Updated Street 456",
        city: "Rairangpur",
        state: "Odisha",
        pincode: "invalid_pincode",
        country: "India",
        phone: 9668187490,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("returns 404 when updating non-existent address ID", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const response = await request(app)
      .put(`/api/auth/users/me/addresses/${fakeId}`)
      .set("Cookie", authCookie)
      .send(validAddress);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Address not found");
  });
});
