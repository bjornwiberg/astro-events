declare module "mixpanel-browser" {
  export interface TrackOptions {
    [key: string]: unknown;
  }

  export interface Mixpanel {
    init(token: string, config?: { ignore_dnt?: boolean }): void;
    register(props: Record<string, unknown>): void;
    track(event: string, properties?: TrackOptions): void;
  }

  const mixpanel: Mixpanel;
  export default mixpanel;
}
