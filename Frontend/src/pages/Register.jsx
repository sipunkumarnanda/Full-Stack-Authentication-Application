import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { User, Mail, Check, X, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/common/Input";
import PasswordInput from "../components/common/PasswordInput";
import Button from "../components/common/Button";
import authService from "../services/authService";
import { validationRules, getPasswordStrength } from "../utils/validation";

export function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const passwordValue = watch("password") || "";
  const passwordStrength = getPasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    setServerError("");
    try {
      // STRICT: Only send { firstName, lastName, username, email, password }
      // Do NOT send confirmPassword, agreeTerms, or role!
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        username: data.username.trim(),
        email: data.email.trim(),
        password: data.password,
      };

      const res = await authService.register(payload);
      toast.success(res.message || "OTP sent to your email. Please verify it.");

      // Navigate to OTP verification page with registered email in state
      navigate("/verify-otp", {
        state: { email: data.email.trim() },
        replace: true,
      });
    } catch (err) {
      const msg = err.message || "Failed to create account. Please check your information.";
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join AuthFlow today to manage your identity securely"
      cardWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div
            className="p-3.5 rounded-lg bg-error-50 border border-error-100 text-error text-sm font-medium animate-fadeIn"
            role="alert"
          >
            {serverError}
          </div>
        )}

        {/* First & Last Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="firstName"
            label="First name"
            required
            placeholder="John"
            error={errors.firstName?.message}
            {...register("firstName", validationRules.firstName)}
          />

          <Input
            id="lastName"
            label="Last name"
            required
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register("lastName", validationRules.lastName)}
          />
        </div>

        {/* Username */}
        <Input
          id="username"
          label="Username"
          required
          placeholder="johndoe_42"
          leftIcon={User}
          error={errors.username?.message}
          helperText="3–30 characters, letters, numbers, and underscores only."
          {...register("username", validationRules.username)}
        />

        {/* Email */}
        <Input
          id="email"
          label="Email address"
          type="email"
          required
          autoComplete="email"
          placeholder="name@company.com"
          leftIcon={Mail}
          error={errors.email?.message}
          {...register("email", validationRules.email)}
        />

        {/* Password */}
        <div className="space-y-2">
          <PasswordInput
            id="password"
            label="Password"
            required
            autoComplete="new-password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            {...register("password", validationRules.password)}
          />

          {/* Live Password Strength Meter */}
          {passwordValue && (
            <div className="space-y-2 pt-1 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Password strength:</span>
                <span className={`font-semibold ${passwordStrength.color.split(" ")[1]}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex gap-1">
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordStrength.score >= 1 ? passwordStrength.color.split(" ")[0] : "bg-transparent"
                  } w-1/4`}
                />
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordStrength.score >= 2 ? passwordStrength.color.split(" ")[0] : "bg-transparent"
                  } w-1/4`}
                />
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordStrength.score >= 3 ? passwordStrength.color.split(" ")[0] : "bg-transparent"
                  } w-1/4`}
                />
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordStrength.score >= 4 ? passwordStrength.color.split(" ")[0] : "bg-transparent"
                  } w-1/4`}
                />
              </div>

              {/* Password Requirements Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs text-slate-500">
                {passwordStrength.checks.map((item) => (
                  <div key={item.id} className="flex items-center gap-1.5">
                    {item.met ? (
                      <Check className="w-3.5 h-3.5 text-success shrink-0" aria-hidden="true" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300 shrink-0" aria-hidden="true" />
                    )}
                    <span className={item.met ? "text-slate-700 font-medium" : "text-slate-400"}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          required
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === watch("password") || "Passwords do not match",
          })}
        />

        {/* Terms & Conditions Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-600">
            <input
              type="checkbox"
              id="agreeTerms"
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-offset-0"
              {...register("agreeTerms", validationRules.terms)}
            />
            <span>
              I agree to the{" "}
              <a
                href="#terms"
                onClick={(e) => {
                  e.preventDefault();
                  toast("Terms of Service placeholder page", { icon: "ℹ️" });
                }}
                className="font-medium text-primary hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#privacy"
                onClick={(e) => {
                  e.preventDefault();
                  toast("Privacy Policy placeholder page", { icon: "ℹ️" });
                }}
                className="font-medium text-primary hover:underline"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="mt-1 text-xs text-error font-medium" role="alert">
              {errors.agreeTerms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          rightIcon={ArrowRight}
          className="mt-2"
        >
          Create account
        </Button>

        <p className="text-center text-sm text-slate-500 pt-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-primary-700 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Register;
