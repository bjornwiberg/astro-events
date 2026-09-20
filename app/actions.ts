"use server";

import { cookies } from "next/headers";

export async function setDarkModeCookie(value: boolean) {
  const store = await cookies();
  store.set("darkMode", value ? "true" : "false", {
    path: "/",
    maxAge: 31536000, // 1 year
    sameSite: "lax",
  });
}
