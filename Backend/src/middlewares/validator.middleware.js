import { body, validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

const registerUserValidation = [
  body("username")
    .isString()
    .withMessage("Username must be a string")
    .bail()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3–30 characters")
    .bail()
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can contain letters, numbers and underscores"),

  body("email")
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be between 8 and 72 characters"),

  body("firstName")
    .isString()
    .withMessage("First name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("First name is required"),

  body("lastName")
    .isString()
    .withMessage("Last name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),

  validateRequest,
];

const loginUserValidation = [
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .notEmpty()
    .withMessage("Password is required"),

  validateRequest,
];

const verifyOtpValidation = [
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("otp")
    .isString()
    .withMessage("OTP must be a string")
    .bail()
    .matches(/^\d{6}$/)
    .withMessage("OTP must contain exactly 6 digits"),

  validateRequest,
];

const resendOtpValidation = [
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  validateRequest,
];

const forgotPasswordValidation = [
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  validateRequest,
];

const resetPasswordValidation = [
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("otp")
    .isString()
    .withMessage("OTP must be a string")
    .bail()
    .matches(/^\d{6}$/)
    .withMessage("OTP must contain exactly 6 digits"),

  // Must match the resetPassword controller's req.body.password
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be between 8 and 72 characters"),

  validateRequest,
];

const addressUserValidator = [
  // Street: required text, maximum 150 characters
  body("street")
    .isString()
    .withMessage("Street must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Street is required")
    .bail()
    .isLength({ max: 150 })
    .withMessage("Street must not exceed 150 characters"),

  // City: letters, spaces and common name punctuation
  body("city")
    .isString()
    .withMessage("City must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .bail()
    .matches(/^[\p{L}\s.'-]+$/u)
    .withMessage("City must contain valid letters"),

  // State
  body("state")
    .isString()
    .withMessage("State must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .bail()
    .matches(/^[\p{L}\s.'-]+$/u)
    .withMessage("State must contain valid letters"),

  // Pincode: strictly a JSON number with 6 digits
  body("pincode")
    .custom((value) => {
      if (
        typeof value !== "number" ||
        !Number.isSafeInteger(value) ||
        value < 100000 ||
        value > 999999
      ) {
        throw new Error(
          "Pincode must be a 6-digit number"
        );
      }

      return true;
    }),

  // Country
  body("country")
    .isString()
    .withMessage("Country must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .bail()
    .matches(/^[\p{L}\s.'-]+$/u)
    .withMessage("Country must contain valid letters"),

  // Phone: strictly a JSON number, 10 digits starting 6-9
  body("phone")
    .custom((value) => {
      if (
        typeof value !== "number" ||
        !Number.isSafeInteger(value) ||
        value < 6000000000 ||
        value > 9999999999
      ) {
        throw new Error(
          "Phone must be a valid 10-digit Indian mobile number"
        );
      }

      return true;
    }),

  // Default address
  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),

  validateRequest,
];

const updateProfileValidator = [
  body("firstName").isString().trim().isLength({ min: 1, max: 50 }).withMessage("First name is required and must not exceed 50 characters"),
  body("lastName").isString().trim().isLength({ min: 1, max: 50 }).withMessage("Last name is required and must not exceed 50 characters"),
  body("username").isString().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage("Username must be 3-30 characters using letters, numbers, or underscores"),
  body("phone").optional({ values: "falsy" }).matches(/^[6-9]\d{9}$/).withMessage("Phone must be a valid 10-digit Indian mobile number"),
  body("removeProfileImage").optional().isBoolean().withMessage("removeProfileImage must be a boolean"),
  validateRequest,
];

export default {
  registerUserValidation,
  loginUserValidation,
  verifyOtpValidation,
  resendOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  addressUserValidator,
  updateProfileValidator,
};
