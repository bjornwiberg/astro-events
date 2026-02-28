"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setDarkModeCookie } from "../actions";

type ThemeContextValue = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useV2Theme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useV2Theme must be used within V2ThemeRoot");
  return ctx;
}

type V2ThemeRootProps = {
  initialDark: boolean | null;
  children: ReactNode;
};

export function V2ThemeRoot({ initialDark, children }: V2ThemeRootProps) {
  const [darkMode, setDarkModeState] = useState(Boolean(initialDark));

  useEffect(() => {
    if (initialDark !== null) return;
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkModeState(dark);
    setDarkModeCookie(dark);
  }, [initialDark]);

  const setDarkMode = useCallback((value: boolean) => {
    setDarkModeState(value);
    setDarkModeCookie(value);
  }, []);

  const value = useMemo(() => ({ darkMode, setDarkMode }), [darkMode, setDarkMode]);

  const dataTheme = darkMode ? "dark" : "light";

  return (
    <ThemeContext.Provider value={value}>
      <div className="v2-theme-root" data-theme={dataTheme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
