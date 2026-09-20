import { cookies, headers } from "next/headers";
import type { Metadata, Viewport } from "next";
import { getPreferredLocale, isRtl } from "../lib/i18n";
import { ThemeRoot } from "./components/ThemeRoot";
import "./global.css";
import "./theme-init.css";

export const metadata: Metadata = {
  title: "Astro Events",
  description: "Astrological events calendar",
  manifest: "/manifest.json",
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const cookieStore = await cookies();
  const darkCookie = cookieStore.get("darkMode")?.value;
  const dataTheme = darkCookie === "true" ? "dark" : "light";
  const bodyClassName = "app-theme-root";

  const langCookie = cookieStore.get("lang")?.value ?? null;
  const locale = getPreferredLocale(langCookie, headerList.get("accept-language"));
  const dir = isRtl(locale) ? "rtl" : "ltr";

  const initialDark = darkCookie === "true" ? true : darkCookie === "false" ? false : null;

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={dataTheme}
    >
      <head>
        <title>Astro Events</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪐</text></svg>"
        />
      </head>
      <body className={bodyClassName}>
        <ThemeRoot initialDark={initialDark}>{children}</ThemeRoot>
      </body>
    </html>
  );
}
