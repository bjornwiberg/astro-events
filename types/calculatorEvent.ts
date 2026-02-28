import type { EventBaseType } from "./events";

export type CalculatorEventType = EventBaseType & {
  /** API begtime (astronomical angle-based window start) */
  angleBegDate?: string;
  /** API endtime (astronomical angle-based window end) */
  angleEndDate?: string;
};
