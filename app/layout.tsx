import { cookies } from "next/headers";
import "./global.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const darkMode = cookieStore.get("darkMode")?.value === "true";
  const dataTheme = darkMode ? "dark" : "light";

  return (
    <html lang="en" data-theme={dataTheme}>
      <head>
        <title>Astro Events</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪐</text></svg>"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
