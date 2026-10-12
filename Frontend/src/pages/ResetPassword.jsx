import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Mail, Check, X, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/common/Input";
import PasswordInput from "../components/common/PasswordInput";
import OtpInput from "../components/common/OtpInput";
import Button from "../components/common/Button";
import authService from "../services/authService";
import { validationRules, getPasswordStrength } from "../utils/validation";

export function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");

  const defaultEmail = location.state?.email || "";

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: defaultEmail,
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password") || "";
  const passwordStrength = getPasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    setServerError("");
    try {
      // Backend expects { email, otp, password }
      // Do NOT send confirmPassword
      const payload = {
        email: data.email.trim(),
        otp: data.otp.trim(),
        password: data.password,
      };

      const res = await authService.resetPassword(payload);
      toast.success(res.message || "Password reset successfully! Please sign in with your new password.");

      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err.message || "Failed to reset password. Please check your OTP and try again.";
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter the recovery code sent to your email and choose a new password"
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

        {/* Email Address */}
        <Input
          id="email"
          label="Account email address"
          type="email"
          required
          autoComplete="email"
          placeholder="name@company.com"
          leftIcon={Mail}
          error={errors.email?.message}
          {...register("email", validationRules.email)}
        />

        {/* 6-digit OTP */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            6-digit recovery code <span className="text-error">*</span>
          </label>
          <Controller
            name="otp"
            control={control}
            rules={validationRules.otp}
            render={({ field }) => (
              <OtpInput
                length={6}
                value={field.value}
                onChange={field.onChange}
                error={errors.otp?.message}
              />
            )}
          />
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <PasswordInput
            id="password"
            label="New password"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register("password", validationRules.password)}
          />

          {/* Live strength meter */}
          {passwordValue && (
            <div className="space-y-1.5 pt-1 animate-fadeIn">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-xs text-slate-500">
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

        {/* Confirm New Password */}
        <PasswordInput
          id="confirmPassword"
          label="Confirm new password"
          required
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your new password",
            validate: (val) => val === watch("password") || "Passwords do not match",
          })}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          leftIcon={CheckCircle}
          className="mt-2"
        >
          Reset password
        </Button>

        <div className="pt-2 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
