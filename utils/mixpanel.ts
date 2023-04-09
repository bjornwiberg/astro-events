import mixpanel from "mixpanel-browser";

export function initMixpanel() {
  if (process.env.NODE_ENV === "production") {
    mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
      ignore_dnt: true,
    });
    mixpanel.register({ Environment: process.env.NODE_ENV });
    track("Enter page");
  }
}

export function track(message: string, options?: Record<string, any>) {
  if (process.env.NODE_ENV === "production") {
    mixpanel.track(message, options);
  }
}
