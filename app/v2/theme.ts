import { createTheme, type ThemeOptions } from "@mui/material/styles";

const themeTransition = "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease";

const shared: ThemeOptions = {
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { transition: themeTransition },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { transition: themeTransition },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { transition: themeTransition },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { transition: themeTransition },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: "light",
    primary: { main: "#1A1A2E", light: "#2D2D44", dark: "#0F0F1A" },
    secondary: { main: "#E8A838", light: "#F0C060", dark: "#C08820" },
    background: { default: "#FAFAFA", paper: "#FFFFFF" },
    text: { primary: "#1A1A2E", secondary: "#6B7280" },
  },
  components: {
    ...shared.components,
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: "1px solid #E5E7EB",
          transition: themeTransition,
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: "dark",
    primary: { main: "#C5CAE9", light: "#E8EAF6", dark: "#7986CB" },
    secondary: { main: "#E8A838", light: "#F0C060", dark: "#C08820" },
    background: { default: "#121212", paper: "#1E1E1E" },
    text: { primary: "#E0E0E0", secondary: "#9E9E9E" },
  },
  components: {
    ...shared.components,
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: "1px solid #2E2E2E",
          transition: themeTransition,
        },
      },
    },
  },
});
