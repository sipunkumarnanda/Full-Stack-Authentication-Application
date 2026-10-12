import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Button from "../components/common/Button";
import AuthLayout from "../components/layout/AuthLayout";

export function NotFound() {
  return (
    <AuthLayout cardWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mb-6 shadow-sm dark:bg-primary/15 dark:text-primary-300">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="auth-title text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">404</h1>
      <h2 className="auth-title text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">Page Not Found</h2>
      <p className="auth-secondary text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
        The page you are looking for doesn&apos;t exist or may have been moved.
      </p>

      <div className="mt-8">
        <Link to="/login">
          <Button variant="primary" size="md" leftIcon={ArrowLeft}>
            Back to Home
          </Button>
        </Link>
      </div>
      </div>
    </AuthLayout>
  );
}

export default NotFound;
