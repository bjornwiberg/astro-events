import type { TrackOptions } from "mixpanel-browser";
import mixpanel from "mixpanel-browser";

let initialized = false;

export function initMixpanel() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
    if (token) {
      mixpanel.init(token, {
        ignore_dnt: true,
      });
      mixpanel.register({ Environment: process.env.NODE_ENV });
      initialized = true;
      track("Enter page");
    }
  }
}

export function track(message: string, options?: TrackOptions) {
  if (!initialized) return;
  mixpanel.track(message, options);
}
