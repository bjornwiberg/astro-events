import { cookies } from "next/headers";
import type { Metadata, Viewport } from "next";
import { V2_BASE_PATH } from "./constants";
import { V2ThemeRoot } from "./components/V2ThemeRoot";
import "./theme-init.css";

export const metadata: Metadata = {
  title: "Astro Events",
  description: "Astrological events calendar",
  manifest: `${V2_BASE_PATH}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Astro Events",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1A2E",
  width: "device-width",
  initialScale: 1,
};

export default async function V2Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const darkModeCookie = cookieStore.get("darkMode")?.value;
  const initialDark =
    darkModeCookie === "true" ? true : darkModeCookie === "false" ? false : null;

  return <V2ThemeRoot initialDark={initialDark}>{children}</V2ThemeRoot>;
}
