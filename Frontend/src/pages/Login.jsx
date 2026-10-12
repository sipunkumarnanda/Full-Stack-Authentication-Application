import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AlertCircle, Mail, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/common/Input";
import PasswordInput from "../components/common/PasswordInput";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";
import { validationRules } from "../utils/validation";

const REMEMBER_EMAIL_KEY = "authflow_remember_email";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Pre-fill email if previously remembered
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (savedEmail) {
        setValue("email", savedEmail, { shouldValidate: true });
        setRememberMe(true);
      }
    } catch {
      // Ignore localStorage exceptions in restricted contexts
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setServerError("");
    try {
      // Only send { email, password } to the backend
      await login({
        email: data.email.trim(),
        password: data.password,
      });

      // Manage remember me email locally
      try {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, data.email.trim());
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      } catch {
        // Safe fallback
      }

      toast.success("Welcome back! Login successful.");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || "Invalid email or password. Please try again.";
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to access your secure dashboard"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          leftIcon={Mail}
          error={errors.email?.message}
          {...register("email", validationRules.email)}
        />

        <div className="space-y-1.5">
          <PasswordInput
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password", validationRules.password)}
          />

          {serverError && (
            <p
              className="flex items-center gap-1.5 pt-0.5 text-xs font-medium text-error animate-fadeIn dark:text-red-400"
              role="alert"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{serverError}</span>
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <label className="auth-secondary flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-offset-0"
              />
              <span>Remember my email</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-primary hover:text-primary-700 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          rightIcon={ArrowRight}
        >
          Sign in
        </Button>

        <p className="auth-secondary text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary hover:text-primary-700 hover:underline transition-colors"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;
