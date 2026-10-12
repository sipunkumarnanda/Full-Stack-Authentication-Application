

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

import User from "../models/user.model.js";
import redis from "../db/redis.js";

import {
  generateAccessToken,
} from "../services/token.service.js";

import {
  generateOtp,
  verifyOtp,
  deleteOtp,
} from "../services/otp.service.js";

import {
  sendOtpEmail,
} from "../services/email.service.js";
import uploadFile, { deleteImage } from "../services/imagekit.service.js";

const SALT_ROUNDS = 12;
const REGISTRATION_TTL_SECONDS = 300;
const REGISTRATION_KEY_PREFIX = "registration-pending:";

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function normalizeUsername(username) {
  return typeof username === "string"
    ? username.trim().toLowerCase()
    : "";
}

function registrationKey(email) {
  return `${REGISTRATION_KEY_PREFIX}${email}`;
}

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    phone: user.phone || "",
    profileImage: user.profileImage || "",
    addresses: user.addresses,
  };
}

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

function isDuplicateKeyError(error) {
  return error?.code === 11000;
}

function getCookieMaxAge() {
  const value = process.env.JWT_EXPIRES_IN || "15m";
  const match = value.match(/^(\d+)(s|m|h|d)?$/i);

  if (!match) {
    return 15 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = (match[2] || "s").toLowerCase();

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
}

function accessCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    // The Vercel frontend and Render API are different sites, so the
    // production cookie must explicitly opt in to cross-site requests.
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: getCookieMaxAge(),
  };
}

function clearAccessCookieOptions() {
  const { maxAge, ...options } = accessCookieOptions();
  return options;
}

// 1. REGISTER: save pending details in Redis and send an OTP.
async function registerUser(req, res, next) {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
    } = req.body;

    if (
      !username ||
      !email ||
      !password ||
      !firstName ||
      !lastName
    ) {
      return sendError(
        res,
        400,
        "Username, email, password, first name, and last name are required"
      );
    }

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof firstName !== "string" ||
      typeof lastName !== "string"
    ) {
      return sendError(res, 400, "Invalid registration data");
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = normalizeUsername(username);
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();

    if (
      !normalizedEmail ||
      !normalizedUsername ||
      !normalizedFirstName ||
      !normalizedLastName
    ) {
      return sendError(res, 400, "All registration fields are required");
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return sendError(
        res,
        400,
        "Password must be at least 8 characters and no more than 72 bytes"
      );
    }

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    }).select("_id");

    if (existingUser) {
      return sendError(
        res,
        409,
        "Email or username is already registered"
      );
    }

    // Hash before temporarily storing registration details.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const pendingRegistration = {
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
    };

    const pendingKey = registrationKey(normalizedEmail);

    // Create the OTP first, then save pending details and send the email.
    const otp = await generateOtp(normalizedEmail, "registration");

    try {
      await redis.set(
        pendingKey,
        JSON.stringify(pendingRegistration),
        "EX",
        REGISTRATION_TTL_SECONDS
      );

      await sendOtpEmail(normalizedEmail, otp, "registration");
    } catch (error) {
      await Promise.allSettled([
        deleteOtp(normalizedEmail, "registration"),
        redis.del(pendingKey),
      ]);

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify it.",
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return sendError(
        res,
        409,
        "Email or username is already registered"
      );
    }

    return next(error);
  }
}

// 2. VERIFY REGISTRATION OTP: create the actual MongoDB user.
async function verifyOtpController(req, res, next) {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) {
      return sendError(res, 400, "Email and OTP are required");
    }

    const pendingKey = registrationKey(normalizedEmail);
    const pendingData = await redis.get(pendingKey);

    if (!pendingData) {
      return sendError(
        res,
        400,
        "Registration expired or not found. Please register again."
      );
    }

    let pending;

    try {
      pending = JSON.parse(pendingData);
    } catch {
      await redis.del(pendingKey);
      return sendError(
        res,
        400,
        "Registration data is invalid. Please register again."
      );
    }

    // Check duplicates again because another request could have registered
    // the same email or username after the initial registration request.
    const existingUser = await User.findOne({
      $or: [
        { email: pending.email },
        { username: pending.username },
      ],
    }).select("_id");

    if (existingUser) {
      await Promise.allSettled([
        redis.del(pendingKey),
        deleteOtp(normalizedEmail, "registration"),
      ]);

      return sendError(
        res,
        409,
        "Email or username is already registered"
      );
    }

    const result = await verifyOtp(
      normalizedEmail,
      otp,
      "registration"
    );

    if (!result.valid) {
      return sendError(
        res,
        400,
        result.reason || "Invalid or expired OTP"
      );
    }

    try {
      const user = await User.create({
        username: pending.username,
        email: pending.email,
        password: pending.password,
        fullName: {
          firstName: pending.firstName,
          lastName: pending.lastName,
        },
        // Never accept role from registration input.
        role: "user",
        isEmailVerified: true,
      });

      await redis.del(pendingKey);

      return res.status(201).json({
        success: true,
        message: "Registration completed successfully",
        user: publicUser(user),
      });
    } catch (error) {
      // OTPs are single-use. If creation fails, remove stale pending data
      // rather than leave an unusable registration in Redis.
      await redis.del(pendingKey).catch(() => {});

      if (isDuplicateKeyError(error)) {
        return sendError(
          res,
          409,
          "Email or username is already registered"
        );
      }

      throw error;
    }
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return sendError(
        res,
        409,
        "Email or username is already registered"
      );
    }

    return next(error);
  }
}

// 3. RESEND REGISTRATION OTP.
async function resendOtp(req, res, next) {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail) {
      return sendError(res, 400, "Email is required");
    }

    const pendingKey = registrationKey(normalizedEmail);
    const pendingData = await redis.get(pendingKey);

    if (!pendingData) {
      return sendError(
        res,
        400,
        "Registration expired or not found. Please register again."
      );
    }

    const pending = JSON.parse(pendingData);

    // Do not send registration OTPs to an already-registered account.
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: pending.username },
      ],
    }).select("_id");

    if (existingUser) {
      await Promise.allSettled([
        redis.del(pendingKey),
        deleteOtp(normalizedEmail, "registration"),
      ]);

      return sendError(
        res,
        409,
        "Email or username is already registered"
      );
    }

    const otp = await generateOtp(normalizedEmail, "registration");

    try {
      await sendOtpEmail(normalizedEmail, otp, "registration");
    } catch (error) {
      await deleteOtp(normalizedEmail, "registration");
      throw error;
    }

    // Refresh the pending registration TTL when a new OTP is sent.
    await redis.set(
      pendingKey,
      JSON.stringify(pending),
      "EX",
      REGISTRATION_TTL_SECONDS
    );

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    return next(error);
  }
}

// 4. LOGIN.
async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return sendError(
        res,
        400,
        "Email and password are required"
      );
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return sendError(res, 401, "Invalid email or password");
    }

    if (!user.isEmailVerified) {
      return sendError(
        res,
        403,
        "Please verify your email before logging in"
      );
    }

    const accessToken = generateAccessToken(user._id);

    res.cookie(
      "accessToken",
      accessToken,
      accessCookieOptions()
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

// 5. LOGOUT.
function logoutUser(req, res) {
  res.clearCookie(
    "accessToken",
    clearAccessCookieOptions()
  );

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

// 6. GET CURRENT USER.
async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return sendError(res, 401, "Authentication required");
    }

    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return res.status(200).json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

// 7. FORGOT PASSWORD: send a password-reset OTP.
async function forgotPassword(req, res, next) {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail) {
      return sendError(res, 400, "Email is required");
    }

    const genericResponse = {
      success: true,
      message:
        "If the account exists, a password-reset OTP will be sent.",
    };

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("_id");

    // Do not reveal whether an email is registered.
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const otp = await generateOtp(
      normalizedEmail,
      "password-reset"
    );

    try {
      await sendOtpEmail(
        normalizedEmail,
        otp,
        "password-reset"
      );
    } catch (error) {
      await deleteOtp(normalizedEmail, "password-reset");
      throw error;
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    return next(error);
  }
}

// 8. RESET PASSWORD.
async function resetPassword(req, res, next) {
  try {
    const { email, otp, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp || !password) {
      return sendError(
        res,
        400,
        "Email, OTP, and new password are required"
      );
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return sendError(
        res,
        400,
        "Password must be at least 8 characters and no more than 72 bytes"
      );
    }

    // Confirm the account exists before consuming the single-use OTP.
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return sendError(
        res,
        404,
        "Unable to reset password for this account"
      );
    }

    const result = await verifyOtp(
      normalizedEmail,
      otp,
      "password-reset"
    );

    if (!result.valid) {
      return sendError(
        res,
        400,
        result.reason || "Invalid or expired OTP"
      );
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return next(error);
  }
}

// 9. ADD ADDRESS.
async function addUserAddress(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return sendError(res, 401, "Authentication required");
    }

    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const {
      street,
      city,
      state,
      pincode,
      country,
      phone,
      isDefault,
    } = req.body;

    if (
      !street ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !phone
    ) {
      return sendError(
        res,
        400,
        "Street, city, state, pincode, country, and phone are required"
      );
    }

    const shouldBeDefault =
      isDefault === true || user.addresses.length === 0;

    if (shouldBeDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: typeof pincode === "number" ? pincode : Number(pincode),
      country: country.trim(),
      phone: typeof phone === "number" ? phone : Number(phone),
      isDefault: shouldBeDefault,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    return next(error);
  }
}

// 10. GET USER ADDRESSES.
async function getUserAddresses(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return sendError(res, 401, "Authentication required");
    }

    const user = await User.findById(userId).select("addresses");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    return next(error);
  }
}

// 11. DELETE USER ADDRESS.
async function deleteUserAddress(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return sendError(res, 401, "Authentication required");
    }

    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return sendError(res, 404, "Address not found");
    }

    const wasDefault = address.isDefault;
    address.deleteOne();

    // If the default address was removed, promote the first remaining one.
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    if (
      error instanceof mongoose.Error.CastError &&
      error.path === "_id"
    ) {
      return sendError(res, 400, "Invalid address ID");
    }

    return next(error);
  }
}

// 12. UPDATE USER ADDRESS.
async function updateUserAddress(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return sendError(res, 401, "Authentication required");
    }

    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return sendError(res, 404, "Address not found");
    }

    const {
      street,
      city,
      state,
      pincode,
      country,
      phone,
      isDefault,
    } = req.body;

    if (
      !street ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !phone
    ) {
      return sendError(
        res,
        400,
        "Street, city, state, pincode, country, and phone are required"
      );
    }

    const shouldBeDefault = isDefault === true;

    if (shouldBeDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    address.street = street.trim();
    address.city = city.trim();
    address.state = state.trim();
    address.pincode = typeof pincode === "number" ? pincode : Number(pincode);
    address.country = country.trim();
    address.phone = typeof phone === "number" ? phone : Number(phone);

    if (typeof isDefault === "boolean") {
      address.isDefault = shouldBeDefault;
    }

    const hasDefault = user.addresses.some((a) => a.isDefault);
    if (!hasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
      addresses: user.addresses,
    });
  } catch (error) {
    if (
      error instanceof mongoose.Error.CastError &&
      error.path === "_id"
    ) {
      return sendError(res, 400, "Invalid address ID");
    }

    return next(error);
  }
}

async function updateUserProfile(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).select("+profileImageFileId");
    if (!user) return sendError(res, 404, "User not found");

    const file = req.file;
    const { firstName, lastName, username, phone = "", removeProfileImage } = req.body;
    const normalizedUsername = normalizeUsername(username);
    const usernameOwner = await User.findOne({ username: normalizedUsername, _id: { $ne: user._id } });
    if (usernameOwner) return sendError(res, 409, "Username is already in use");

    user.fullName.firstName = firstName.trim();
    user.fullName.lastName = lastName.trim();
    user.username = normalizedUsername;
    user.phone = phone.trim();

    const previousFileId = user.profileImageFileId;

    if (file) {
      const extension = file.originalname.includes(".")
        ? file.originalname.slice(file.originalname.lastIndexOf("."))
        : "";
      const result = await uploadFile(file.buffer, `${randomUUID()}${extension}`);

      user.profileImage = result.url;
      user.profileImageFileId = result.fileId;
    } else if (removeProfileImage === "true" || removeProfileImage === true) {
      user.profileImage = "";
      user.profileImageFileId = "";
    }
    await user.save();

    if (previousFileId && (file || removeProfileImage === "true" || removeProfileImage === true)) {
      deleteImage(previousFileId).catch(() => {});
    }

    return res.status(200).json({ success: true, message: "Profile updated successfully", user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export default {
  registerUser,
  verifyOtp: verifyOtpController,
  resendOtp,
  loginUser,
  logoutUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  addUserAddress,
  getUserAddresses,
  updateUserAddress,
  deleteUserAddress,
  updateUserProfile,
};
