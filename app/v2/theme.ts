import { createTheme } from "@mui/material/styles";

export const v2Theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: [
      "Roboto",
      '"Noto Sans SC"',
      '"Noto Sans JP"',
      '"Noto Sans KR"',
      "sans-serif",
    ].join(","),
  },
});
