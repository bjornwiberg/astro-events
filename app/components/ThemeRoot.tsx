"use client";

import {
  createContext,
  Fragment,
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

const fallbackTheme: ThemeContextValue = {
  darkMode: false,
  setDarkMode: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(fallbackTheme);

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

const BODY_THEME_CLASS = "app-theme-root";

type ThemeRootProps = {
  initialDark: boolean | null;
  children: ReactNode;
};

export function ThemeRoot({ initialDark, children }: ThemeRootProps) {
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

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.body.classList.add(BODY_THEME_CLASS);
    return () => {
      document.body.classList.remove(BODY_THEME_CLASS);
      document.documentElement.removeAttribute("data-theme");
    };
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={value}>
      <Fragment>{children}</Fragment>
    </ThemeContext.Provider>
  );
}
