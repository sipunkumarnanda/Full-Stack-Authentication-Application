import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, RefreshCw, CheckCircle2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "../components/layout/AuthLayout";
import OtpInput from "../components/common/OtpInput";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import authService from "../services/authService";

const INITIAL_EXPIRY_SECONDS = 300; // 5 minutes matching backend REGISTRATION_TTL_SECONDS
const RESEND_COOLDOWN_SECONDS = 60; // 60 seconds matching backend 1 req/min rate limit

export function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [expirySeconds, setExpirySeconds] = useState(INITIAL_EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const expiryIntervalRef = useRef(null);
  const resendIntervalRef = useRef(null);

  // Expiry countdown timer (5 minutes)
  useEffect(() => {
    expiryIntervalRef.current = setInterval(() => {
      setExpirySeconds((prev) => {
        if (prev <= 1) {
          clearInterval(expiryIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (expiryIntervalRef.current) clearInterval(expiryIntervalRef.current);
    };
  }, []);

  // Resend cooldown timer (60 seconds)
  useEffect(() => {
    resendIntervalRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(resendIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    };
  }, []);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (newVal) => {
    setOtp(newVal);
    if (otpError) setOtpError("");
    if (serverError) setServerError("");
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();

    if (!email || !email.trim()) {
      setServerError("Please enter a valid email address.");
      return;
    }

    if (!otp || otp.length !== 6) {
      setOtpError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (expirySeconds === 0) {
      setOtpError("This code has expired. Please request a new code.");
      return;
    }

    setIsVerifying(true);
    setServerError("");
    setOtpError("");

    try {
      const res = await authService.verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
      });

      toast.success(res.message || "Registration completed successfully! Please log in.");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err.message || "Invalid or expired OTP. Please try again.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || !email.trim()) {
      toast.error("Please provide the registered email address.");
      return;
    }

    if (resendCooldown > 0) return;

    setIsResending(true);
    setServerError("");
    setOtpError("");

    try {
      const res = await authService.resendOtp({ email: email.trim() });
      toast.success(res.message || "A new code has been sent to your email.");

      // Reset timers
      setExpirySeconds(INITIAL_EXPIRY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp("");
    } catch (err) {
      const msg = err.message || "Failed to resend code. Please try again shortly.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We sent a 6-digit verification code to your email address"
    >
      <div className="space-y-6">
        {/* Email badge / fallback input */}
        {location.state?.email ? (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
              <Mail className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate">{email}</span>
            </div>
            <Link
              to="/register"
              className="text-xs font-semibold text-primary hover:text-primary-700 underline shrink-0 ml-2"
            >
              Change
            </Link>
          </div>
        ) : (
          <Input
            id="email"
            label="Registered email address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={Mail}
          />
        )}

        {serverError && (
          <div
            className="p-3.5 rounded-lg bg-error-50 border border-error-100 text-error text-sm font-medium animate-fadeIn"
            role="alert"
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6" noValidate>
          {/* 6 Digit OTP input */}
          <div className="space-y-2">
            <OtpInput
              length={6}
              value={otp}
              onChange={handleOtpChange}
              disabled={isVerifying || expirySeconds === 0}
              error={otpError}
            />

            {/* Expiry Countdown */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
              <span>Code expires in:</span>
              <span
                className={`font-semibold tabular-nums ${
                  expirySeconds < 60 ? "text-error" : "text-slate-700"
                }`}
              >
                {formatTimer(expirySeconds)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isVerifying}
            disabled={otp.length !== 6 || expirySeconds === 0}
            leftIcon={CheckCircle2}
          >
            Verify & complete registration
          </Button>
        </form>

        {/* Resend actions */}
        <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-3 text-center">
          <p className="text-xs text-slate-500">
            Didn&apos;t receive the code? Check spam or resend below.
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            isLoading={isResending}
            leftIcon={RefreshCw}
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Resend verification code"}
          </Button>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors pt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default VerifyOtp;
