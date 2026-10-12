import express from "express";
import validators from "../middlewares/validator.middleware.js";
import authControllers from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { profileImageUpload } from "../middlewares/upload.middleware.js";

import {
  loginLimiter,
  otpLimiter,
  passwordResetLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// POST /api/auth/register
router.post(
  "/register",
  otpLimiter,
  validators.registerUserValidation,
  authControllers.registerUser
);

// POST /api/auth/verify-otp
router.post(
  "/verify-otp",
  otpLimiter,
  validators.verifyOtpValidation,
  authControllers.verifyOtp
);

// POST /api/auth/resend-otp
router.post(
  "/resend-otp",
  otpLimiter,
  validators.resendOtpValidation,
  authControllers.resendOtp
);

// POST /api/auth/login
router.post(
  "/login",
  loginLimiter,
  validators.loginUserValidation,
  authControllers.loginUser
);

// GET /api/auth/me
router.get(
  "/me",
  authMiddleware.authMiddleware,
  authControllers.getCurrentUser
);

router.put(
  "/users/me/profile",
  authMiddleware.authMiddleware,
  profileImageUpload,
  validators.updateProfileValidator,
  authControllers.updateUserProfile
);

// POST /api/auth/logout
router.post(
  "/logout",
  authControllers.logoutUser
);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  otpLimiter,
  validators.forgotPasswordValidation,
  authControllers.forgotPassword
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  passwordResetLimiter,
  validators.resetPasswordValidation,
  authControllers.resetPassword
);

// POST /api/auth/users/me/addresses
router.post(
  "/users/me/addresses",
  authMiddleware.authMiddleware,
  validators.addressUserValidator,
  authControllers.addUserAddress
);

// GET /api/auth/users/me/addresses
router.get(
  "/users/me/addresses",
  authMiddleware.authMiddleware,
  authControllers.getUserAddresses
);

// PUT /api/auth/users/me/addresses/:addressId
router.put(
  "/users/me/addresses/:addressId",
  authMiddleware.authMiddleware,
  validators.addressUserValidator,
  authControllers.updateUserAddress
);

// DELETE /api/auth/users/me/addresses/:addressId
router.delete(
  "/users/me/addresses/:addressId",
  authMiddleware.authMiddleware,
  authControllers.deleteUserAddress
);

export default router;
