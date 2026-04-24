"use client";

import { type Driver, driver } from "driver.js";
import { useEffect, useRef } from "react";
import "driver.js/dist/driver.css";
import { track } from "../../../utils/mixpanel";
import { useAppContext } from "./AppProvider";
import { findTour, TOURS, type TourStep } from "./tours/definitions";

const SEEN_KEY = "v2:tours:seen";
const LEGACY_SEEN_KEY = "v2:tour:seen";
export const TOUR_START_EVENT = "v2:tour:start";

type SeenMap = Record<string, string[]>;

type StartOptions = { replay?: boolean };

function migrateLegacyIfNeeded(): void {
  if (typeof window === "undefined") return;
  try {
    const legacy = window.localStorage.getItem(LEGACY_SEEN_KEY);
    if (!legacy) return;
    const current = window.localStorage.getItem(SEEN_KEY);
    if (!current) {
      const intro = findTour("intro");
      const introSteps = intro ? intro.steps.map((s) => s.id) : [];
      const seed: SeenMap = { intro: introSteps };
      window.localStorage.setItem(SEEN_KEY, JSON.stringify(seed));
    }
    window.localStorage.removeItem(LEGACY_SEEN_KEY);
  } catch {
    // ignore
  }
}

function readSeen(): SeenMap {
  if (typeof window === "undefined") return {};
  migrateLegacyIfNeeded();
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: SeenMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(v)) out[k] = v.filter((x): x is string => typeof x === "string");
    }
    return out;
  } catch {
    return {};
  }
}

function markStepsSeen(tourId: string, stepIds: string[]): void {
  if (typeof window === "undefined" || stepIds.length === 0) return;
  try {
    const map = readSeen();
    const prev = new Set(map[tourId] ?? []);
    for (const id of stepIds) prev.add(id);
    map[tourId] = Array.from(prev);
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function hasUnseenSteps(tourId: string): boolean {
  if (typeof window === "undefined") return false;
  const tour = findTour(tourId);
  if (!tour) return false;
  const seen = new Set(readSeen()[tourId] ?? []);
  return tour.steps.some((s) => !seen.has(s.id));
}

export function startTour(id: string, opts?: StartOptions): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(TOUR_START_EVENT, {
      detail: { id, replay: opts?.replay === true },
    })
  );
}

export function Tour() {
  const { t, dir } = useAppContext();
  const activeDriverRef = useRef<Driver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const resolveSteps = (tourId: string, replay: boolean): TourStep[] => {
      const tour = findTour(tourId);
      if (!tour) return [];
      const seen = new Set(readSeen()[tourId] ?? []);
      const pool = replay ? tour.steps : tour.steps.filter((s) => !seen.has(s.id));
      return pool.filter((s) => !s.element || document.querySelector(s.element) != null);
    };

    const run = (tourId: string, trigger: "first-visit" | "manual", replay: boolean) => {
      activeDriverRef.current?.destroy();

      const tour = findTour(tourId);
      if (!tour) return;

      const hadSeenBefore = (readSeen()[tourId] ?? []).length > 0;
      const resolved = resolveSteps(tourId, replay);
      if (resolved.length === 0) return;

      const shownStepIds = resolved.map((s) => s.id);
      const totalShown = resolved.length;
      const newStepsOnly = !replay && hadSeenBefore;

      const d: Driver = driver({
        showProgress: true,
        allowClose: true,
        overlayClickBehavior: () => {
          track("Tour Backdrop Click", { tourId, step: d.getActiveIndex() });
        },
        overlayOpacity: 0.6,
        stagePadding: 6,
        stageRadius: 8,
        popoverClass: "v2-tour-popover",
        nextBtnText: t("tour.next"),
        prevBtnText: t("tour.previous"),
        doneBtnText: t("tour.done"),
        steps: resolved.map((s) => ({
          element: s.element,
          popover: {
            title: t(s.titleKey),
            description: t(s.descKey),
          },
        })),
        onHighlighted: () => {
          const idx = d.getActiveIndex();
          track("Tour Step Viewed", {
            tourId,
            step: idx,
            stepId: idx != null ? shownStepIds[idx] : undefined,
            totalShown,
          });
        },
        onDestroyStarted: () => {
          const activeIndex = d.getActiveIndex();
          const completed = activeIndex != null && activeIndex >= totalShown - 1;
          const seenNow = activeIndex != null ? shownStepIds.slice(0, activeIndex + 1) : [];
          markStepsSeen(tourId, seenNow);

          const payload = {
            tourId,
            shownSteps: shownStepIds,
            totalShown,
            newStepsOnly,
            replay,
          };
          if (completed) {
            track("Tour Complete", payload);
          } else {
            track("Tour Close", { ...payload, step: activeIndex });
          }
          d.destroy();
        },
        onNextClick: () => {
          track("Tour Next", { tourId, step: d.getActiveIndex(), totalShown });
          d.moveNext();
        },
        onPrevClick: () => {
          track("Tour Previous", { tourId, step: d.getActiveIndex(), totalShown });
          d.movePrevious();
        },
      });

      activeDriverRef.current = d;
      document.documentElement.setAttribute("data-driver-dir", dir);
      track("Tour Start", {
        tourId,
        trigger,
        replay,
        newStepsOnly,
        totalShown,
      });
      d.drive();
    };

    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as { id?: string; replay?: boolean } | undefined;
      if (!detail?.id) return;
      run(detail.id, "manual", detail.replay === true);
    };
    window.addEventListener(TOUR_START_EVENT, handler);

    const autoTour = TOURS.find((tour) => {
      if (tour.trigger !== "auto") return false;
      return resolveSteps(tour.id, false).length > 0;
    });
    let timer: number | null = null;
    if (autoTour) {
      timer = window.setTimeout(() => run(autoTour.id, "first-visit", false), 600);
    }

    return () => {
      if (timer != null) window.clearTimeout(timer);
      window.removeEventListener(TOUR_START_EVENT, handler);
      activeDriverRef.current?.destroy();
    };
  }, [t, dir]);

  return null;
}
