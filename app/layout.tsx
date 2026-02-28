import { cookies, headers } from "next/headers";
import { getPreferredLocale, isRtl } from "../lib/i18n";
import "./global.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  const isV2 = pathname.startsWith("/v2");
  const cookieStore = await cookies();
  const darkCookie = cookieStore.get("darkMode")?.value;
  const dataTheme = isV2 ? (darkCookie === "true" ? "dark" : "light") : undefined;
  const bodyClassName = isV2 ? "v2-theme-root" : undefined;

  const langCookie = cookieStore.get("lang")?.value ?? null;
  const locale = isV2 ? getPreferredLocale(langCookie, headerList.get("accept-language")) : "en";
  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      {...(dataTheme != null && { "data-theme": dataTheme })}
    >
      <head>
        <title>Astro Events</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪐</text></svg>"
        />
      </head>
      <body className={bodyClassName}>{children}</body>
    </html>
  );
}
