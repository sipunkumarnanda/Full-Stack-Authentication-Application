import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({ theme: "system", setTheme: () => {}, isDark: false });
const STORAGE_KEY = "authflow-theme";

function resolveDarkTheme(preference, mediaMatches) {
  return preference === "dark" || (preference === "system" && mediaMatches);
}

function applyDocumentTheme(preference, mediaMatches) {
  const dark = resolveDarkTheme(preference, mediaMatches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
  root.dataset.theme = dark ? "dark" : "light";
  root.style.colorScheme = dark ? "dark" : "light";
  return dark;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem(STORAGE_KEY) || "system");
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      setIsDark(applyDocumentTheme(theme, media.matches));
    };

    applyTheme();
    media.addEventListener?.("change", applyTheme);
    return () => media.removeEventListener?.("change", applyTheme);
  }, [theme]);

  const setTheme = (value) => {
    const mediaMatches = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(applyDocumentTheme(value, mediaMatches));
    setThemeState(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const value = useMemo(() => ({ theme, setTheme, isDark }), [theme, isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
