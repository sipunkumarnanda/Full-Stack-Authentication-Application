import React from "react";
import { Link } from "react-router-dom";
import { Monitor, Moon, ShieldCheck, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const themeOptions = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export function AuthLayout({
  title,
  subtitle,
  children,
  cardWidth = "max-w-md",
  footer,
}) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="auth-page relative flex min-h-screen min-h-[100dvh] items-center justify-center overflow-x-hidden bg-slate-50 px-4 py-24 dark:bg-[#0B1120] sm:px-6 sm:py-20 lg:px-8">
      <div
        className="auth-theme-switcher fixed right-4 top-4 z-20 flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-[#293548] dark:bg-[#151E2E] sm:right-6 sm:top-6"
        role="group"
        aria-label="Color theme"
      >
        {themeOptions.map(({ value, label, Icon }) => {
          const selected = theme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-label={`Use ${label.toLowerCase()} theme`}
              aria-pressed={selected}
              title={`${label} theme`}
              className={`auth-theme-option flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                selected
                  ? "auth-theme-option-active bg-primary text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
      <div className={`auth-shell my-auto w-full ${cardWidth}`}>
        {/* Brand Header */}
        <div className="mx-auto w-full text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-primary font-bold text-2xl tracking-tight hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/30">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <span className="auth-title text-slate-900 dark:text-slate-50">Auth<span className="text-primary">Flow</span></span>
        </Link>
        {title && (
          <h1 className="auth-title mt-5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="auth-muted mx-auto mt-2 max-w-sm text-balance text-sm leading-6 text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

        {/* Main Card */}
        <div className="mx-auto mt-7 w-full sm:mt-8">
        <div className="auth-card rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-card dark:border-[#293548] dark:bg-[#151E2E] min-[380px]:px-6 sm:px-10 sm:py-8">
          {children}
        </div>

        {footer && <div className="auth-secondary mt-6 text-center text-xs text-slate-500 dark:text-slate-400">{footer}</div>}

        {/* Global Minimalist Footer Note */}
        <p className="auth-secondary mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} AuthFlow Platform. End-to-end encrypted session security.
        </p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
