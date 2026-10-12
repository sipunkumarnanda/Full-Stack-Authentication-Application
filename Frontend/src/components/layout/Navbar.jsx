import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LayoutDashboard, LogOut, MapPin, Monitor, Moon, ShieldCheck, Sun, UserRound } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [themeOpen, setThemeOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const headerRef = useRef(null);

  const displayName = user?.fullName
    ? `${user.fullName.firstName} ${user.fullName.lastName}`.trim()
    : user?.username || "Account";
  const initials = user?.fullName
    ? `${user.fullName.firstName?.[0] || ""}${user.fullName.lastName?.[0] || ""}`
    : user?.username?.slice(0, 2) || "U";

  useEffect(() => {
    const closeMenus = (event) => {
      if (event.key === "Escape") {
        setThemeOpen(false);
        setAccountOpen(false);
      }
      if (event.type === "mousedown" && !headerRef.current?.contains(event.target)) {
        setThemeOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener("keydown", closeMenus);
    document.addEventListener("mousedown", closeMenus);
    return () => {
      document.removeEventListener("keydown", closeMenus);
      document.removeEventListener("mousedown", closeMenus);
    };
  }, []);

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const sections = [
    { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { path: "/profile", label: "Profile", icon: UserRound },
    { path: "/addresses", label: "Addresses", icon: MapPin },
  ];

  return (
    <header ref={headerRef} className="dashboard-header fixed inset-x-0 top-0 z-40 h-16 border-b border-slate-200 bg-white/95 dark:border-[#293548] dark:bg-[#0F172A]/95">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate("/dashboard")} className="flex shrink-0 items-center gap-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Go to dashboard overview">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="dashboard-brand block font-bold tracking-tight text-slate-900 dark:text-white sm:text-base">AuthFlow</span>
        </button>

        <nav className="dashboard-nav hidden items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-[#293548] dark:bg-slate-900/60 md:flex" aria-label="Dashboard navigation">
          {sections.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              aria-current={location.pathname === path ? "page" : undefined}
              className={`dashboard-nav-item flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary ${location.pathname === path ? "dashboard-nav-active bg-white text-primary shadow-sm dark:bg-slate-800 dark:text-primary-300" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => { setThemeOpen((open) => !open); setAccountOpen(false); }}
              className="theme-control flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary dark:border-[#293548] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label="Choose color theme"
              aria-expanded={themeOpen}
            >
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            {themeOpen && (
              <div className="dashboard-popover absolute right-0 top-11 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-elevated dark:border-[#293548] dark:bg-slate-800" role="menu">
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" role="menuitemradio" aria-checked={theme === value}
                    onClick={() => { setTheme(value); setThemeOpen(false); }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium ${theme === value ? "bg-primary-50 text-primary dark:bg-primary/20 dark:text-primary-300" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                    <Icon className="h-4 w-4" />{label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button type="button" onClick={() => { setAccountOpen((open) => !open); setThemeOpen(false); }}
              className="account-control flex items-center gap-2 rounded-xl border border-transparent bg-transparent p-1.5 text-left text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white dark:hover:bg-slate-800"
              aria-label="Open account menu" aria-expanded={accountOpen}>
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold uppercase text-white">{user?.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full object-cover" /> : initials}</span>
              <span className="hidden sm:block">
                <span className="account-name block max-w-36 truncate text-xs font-semibold text-slate-900 dark:text-white">{displayName}</span>
                <span className="account-username block max-w-36 truncate text-[10px] text-slate-500 dark:text-slate-400">@{user?.username}</span>
              </span>
              <ChevronDown className="account-chevron hidden h-3.5 w-3.5 text-slate-400 sm:block" />
            </button>
            {accountOpen && (
              <div className="dashboard-popover absolute right-0 top-12 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-elevated dark:border-[#293548] dark:bg-slate-800" role="menu">
                <button type="button" role="menuitem" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

export default Navbar;
