import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import authService from "../services/authService";
import { validationRules } from "../utils/validation";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await authService.forgotPassword({
        email: data.email.trim(),
      });

      toast.success(
        res.message || "If an account exists, a password reset code has been sent."
      );

      // Navigate to Reset Password page passing email in state
      navigate("/reset-password", {
        state: { email: data.email.trim() },
      });
    } catch (err) {
      const msg = err.message || "Failed to process request. Please try again.";
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your account email to receive a password recovery code"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <div
            className="p-3.5 rounded-lg bg-error-50 border border-error-100 text-error text-sm font-medium animate-fadeIn"
            role="alert"
          >
            {serverError}
          </div>
        )}

        <Input
          id="email"
          label="Account email address"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          leftIcon={Mail}
          error={errors.email?.message}
          helperText="We will send a 6-digit recovery OTP to this address."
          {...register("email", validationRules.email)}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          rightIcon={ArrowRight}
          leftIcon={KeyRound}
        >
          Send recovery code
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

export default ForgotPassword;
