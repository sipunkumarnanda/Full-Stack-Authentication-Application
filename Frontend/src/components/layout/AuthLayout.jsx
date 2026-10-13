import React from "react";
import { Link } from "react-router-dom";
import { Moon, ShieldCheck, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function AuthLayout({
  title,
  subtitle,
  children,
  cardWidth = "max-w-md",
  footer,
}) {
  const { isDark, setTheme } = useTheme();

  return (
    <div className="auth-page relative flex min-h-screen min-h-[100dvh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-24 dark:bg-[#0B1120] sm:px-6 sm:py-20 lg:px-8">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-glow auth-glow-one" aria-hidden="true" />
      <div className="auth-glow auth-glow-two" aria-hidden="true" />
      <header className="auth-navbar fixed inset-x-0 top-0 z-30 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-black/70">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Authentication navigation">
          <Link to="/login" className="group inline-flex items-center gap-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" aria-label="AuthFlow home">
            <span className="brand-mark flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white transition-transform group-hover:scale-105 dark:bg-white dark:text-black">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="auth-navbar-brand text-base font-semibold tracking-tight text-zinc-950 dark:text-white">Auth<span className="text-primary">Flow</span></span>
          </Link>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="auth-theme-switcher flex h-9 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 shadow-sm transition-all hover:border-zinc-300 hover:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-primary dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-white"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            <span>{isDark ? "Light" : "Dark"}</span>
          </button>
        </nav>
      </header>
      <div className={`auth-shell relative z-10 my-auto w-full ${cardWidth}`}>
        {/* Form Header */}
        <div className="mx-auto w-full text-center">
        {title && (
          <h1 className="auth-title text-2xl font-bold tracking-tight text-white">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="auth-muted mx-auto mt-2 max-w-sm text-balance text-sm leading-6 text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>

        {/* Main Card */}
        <div className="mx-auto mt-8 w-full">
        <div className="auth-card relative px-0 py-0">
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
