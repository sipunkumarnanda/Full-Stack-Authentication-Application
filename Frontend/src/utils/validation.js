export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const OTP_REGEX = /^\d{6}$/;

export const validationRules = {
  username: {
    required: "Username is required",
    minLength: {
      value: 3,
      message: "Username must be 3–30 characters",
    },
    maxLength: {
      value: 30,
      message: "Username must be 3–30 characters",
    },
    pattern: {
      value: USERNAME_REGEX,
      message: "Username can contain letters, numbers and underscores",
    },
  },
  email: {
    required: "Email is required",
    pattern: {
      value: EMAIL_REGEX,
      message: "Enter a valid email address",
    },
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
    maxLength: {
      value: 72,
      message: "Password must be no more than 72 characters",
    },
  },
  firstName: {
    required: "First name is required",
    validate: (val) => (val && val.trim().length > 0) || "First name is required",
  },
  lastName: {
    required: "Last name is required",
    validate: (val) => (val && val.trim().length > 0) || "Last name is required",
  },
  otp: {
    required: "OTP is required",
    pattern: {
      value: OTP_REGEX,
      message: "OTP must contain exactly 6 digits",
    },
  },
  terms: {
    required: "You must agree to the terms and privacy policy",
  },
  address: {
    street: {
      required: "Street address is required",
      maxLength: {
        value: 150,
        message: "Street must not exceed 150 characters",
      },
      validate: (v) => {
        if (!v || !v.trim()) return "Street address is required";
        if (v.trim().length > 150) return "Street must not exceed 150 characters";
        if (!/^[a-zA-Z0-9\s,.'#/-]+$/.test(v.trim())) {
          return "Street can contain letters, numbers, spaces, and address punctuation (, . ' # / -)";
        }
        return true;
      },
    },
    city: {
      required: "City is required",
      validate: (v) => {
        if (!v || !v.trim()) return "City is required";
        if (!/^[a-zA-Z\s.'-]+$/.test(v.trim())) {
          return "City must contain valid letters and punctuation";
        }
        return true;
      },
    },
    state: {
      required: "State is required",
      validate: (v) => {
        if (!v || !v.trim()) return "State is required";
        if (!/^[a-zA-Z\s.'-]+$/.test(v.trim())) {
          return "State must contain valid letters and punctuation";
        }
        return true;
      },
    },
    pincode: {
      required: "Pincode is required",
      validate: (v) => {
        if (!v || !String(v).trim()) return "Pincode is required";
        const clean = String(v).trim();
        if (!/^\d{6}$/.test(clean)) {
          return "Pincode must be exactly 6 digits";
        }
        const num = Number(clean);
        if (num < 100000 || num > 999999) {
          return "Pincode must be a 6-digit number";
        }
        return true;
      },
    },
    country: {
      required: "Country is required",
      validate: (v) => {
        if (!v || !v.trim()) return "Country is required";
        if (!/^[a-zA-Z\s.'-]+$/.test(v.trim())) {
          return "Country must contain valid letters and punctuation";
        }
        return true;
      },
    },
    phone: {
      required: "Phone number is required",
      validate: (v) => {
        if (!v || !String(v).trim()) return "Phone number is required";
        const clean = String(v).trim();
        if (!/^[6-9]\d{9}$/.test(clean)) {
          return "Phone must be a valid 10-digit number starting with 6–9";
        }
        return true;
      },
    },
  },
};

/**
 * Calculates password strength and checks individual criteria.
 * @param {string} password
 * @returns {{ score: number, label: string, color: string, checks: Array<{ label: string, met: boolean }> }}
 */
export function getPasswordStrength(password = "") {
  const checks = [
    { id: "length", label: "At least 8 characters", met: password.length >= 8 && password.length <= 72 },
    { id: "lower", label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { id: "upper", label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { id: "number", label: "At least one number", met: /[0-9]/.test(password) },
    { id: "special", label: "At least one special character", met: /[^a-zA-Z0-9]/.test(password) },
  ];

  const metCount = checks.filter((c) => c.met).length;

  let score = 0;
  let label = "Too weak";
  let color = "bg-slate-200 text-slate-500";

  if (!password) {
    return { score: 0, label: "Empty", color, checks };
  }

  if (metCount <= 1) {
    score = 1;
    label = "Weak";
    color = "bg-error text-error";
  } else if (metCount <= 3) {
    score = 2;
    label = "Fair";
    color = "bg-amber-500 text-amber-500";
  } else if (metCount === 4) {
    score = 3;
    label = "Good";
    color = "bg-blue-500 text-blue-500";
  } else {
    score = 4;
    label = "Strong";
    color = "bg-success text-success";
  }

  return { score, label, color, checks };
}
