declare module "mixpanel-browser" {
  export interface TrackOptions {
    [key: string]: unknown;
  }

  /**
   * Subset of mixpanel-browser's own Config that this app passes to init().
   * This ambient declaration shadows the types bundled with the package, so
   * anything added to the init() call has to be added here too.
   */
  export interface MixpanelConfig {
    ignore_dnt?: boolean;
    api_host?: string;
    record_sessions_percent?: number;
  }

  export interface Mixpanel {
    init(token: string, config?: MixpanelConfig): void;
    register(props: Record<string, unknown>): void;
    track(event: string, properties?: TrackOptions): void;
  }

  const mixpanel: Mixpanel;
  export default mixpanel;
}
