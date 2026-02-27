import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Astro Events",
  description: "Astrological events calendar",
  manifest: "/v2/manifest.json",
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

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
