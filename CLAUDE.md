# astro-events — contributor notes

## Tours (v2)

Guided tours live under `app/v2/components/tours/` + `app/v2/components/Tour.tsx`. Seen state is tracked **per step** in `localStorage["v2:tours:seen"]` as `{ [tourId]: stepId[] }`.

### The three scenarios

**1. New tour for a new feature** (e.g. a new "Share" dialog needs its own walkthrough):

1. Append a `TourDefinition` to `TOURS` in `app/v2/components/tours/definitions.ts`:
   ```ts
   {
     id: "share-dialog",              // stable kebab-case
     trigger: "manual",               // "auto" for first-visit app tours
     labelKey: "tour.shareDialog.label",
     steps: [
       { id: "welcome", titleKey: "tour.shareDialog.welcome.title", descKey: "tour.shareDialog.welcome.description" },
       { id: "link",   element: '[data-tour="share-link"]', titleKey: "tour.shareDialog.link.title", descKey: "tour.shareDialog.link.description" },
     ],
   }
   ```
2. Add `tour.shareDialog.*` keys to `locales/en.json` (LibreTranslate auto-translates on source-hash change — see `lib/translate.ts`).
3. Add `data-tour="share-link"` anchors on the DOM elements the steps target.
4. In the component that reveals the feature:
   ```ts
   import { hasUnseenSteps, startTour } from "./Tour";

   // On first reveal (dialog open, route enter, …):
   if (hasUnseenSteps("share-dialog")) {
     window.setTimeout(() => startTour("share-dialog"), 350); // 350ms covers MUI dialog enter
   }
   ```
5. Co-locate a replay `?` icon in the same context:
   ```tsx
   <IconButton
     size="small"
     onClick={() => startTour("share-dialog", { replay: true })}
     aria-label={t("tour.replayShareTour")}
   >
     <HelpOutlineIcon fontSize="small" />
   </IconButton>
   ```
6. Copy `tests/v2/calendar-tour.spec.ts` as a template for the new tour's coverage.

**2. Adding new steps to an existing tour** (e.g. Calendar dialog just got a "Share" button — surface it to everyone, show only the new step to returning users):

> **Do NOT create a `calendar-dialog-v2` tour.** That's exactly what per-step tracking prevents.

1. Append a step with a brand-new `id` to the existing tour's `steps`:
   ```ts
   // inside the calendar-dialog definition
   { id: "share", element: '[data-tour="calendar-share"]', titleKey: "tour.calendarDialog.share.title", descKey: "tour.calendarDialog.share.description" },
   ```
2. Add `tour.calendarDialog.share.*` locale keys.
3. Add `data-tour="calendar-share"` on the new button.
4. Done.

What happens automatically:
- **Returning user** (seen = `["welcome","url","copy"]`): runner computes unseen = `["share"]` → tour shows just the one new step. Seen list becomes `["welcome","url","copy","share"]`.
- **New user**: sees all 4 steps in order.
- **Replay via `?` icon**: always shows all steps.

**3. Updating both at once** (adding a feature tour AND updating the main tour for that dialog):

Do both #1 and #2 in the same PR. They're independent entries in `TOURS`, and the per-step seen map is keyed by `tourId` so they don't interfere.

### Close vs complete

Both close (X button) and complete ("Got it" on the last step) write to the seen map, but they write **different things**:

- **Complete**: marks just the steps shown in this run. For a delta run (returning user with new steps), that's only the new ones — the rest were already in seen.
- **Close**: marks **all current step ids** for the tour, regardless of how many were shown. This is the "I dismissed this tour, stop nagging me on every reload" signal. Autostart only fires when there are unseen steps in the tour definition, so once everything is marked seen via close, future page loads won't auto-trigger. Adding **new** step ids to the tour later still triggers autostart for those — exactly the behaviour we want.

Don't change close to "mark only what was viewed" — that re-introduces the bug where closing on step 1 left steps 2–N unseen, and the autostart re-fired on every reload until the user clicked through every step. Mixpanel caught this with three `Tour Start` events in 30 seconds for the same `distinct_id`. Locked in by `tests/v2/intro-tour.spec.ts:closing mid-tour marks all current step ids so the auto-tour does not re-fire`.

### Forcing a re-see after a major rewrite

Two options if you rewrite an existing step's copy and want everyone to see it again:

- **Per-step reset**: give the rewritten step a new `id` (e.g. `copy` → `copy-2026q2`). Old id in seen maps is inert; new id is treated as unseen.
- **Tour-wide reset**: add a migration inside `readSeen()` / `migrateLegacyIfNeeded()` in `Tour.tsx` that drops the tour's key from the seen map under a specific condition (e.g. a version bump stored alongside).

Prefer the per-step reset — it only re-shows what actually changed.

### Worked example — changing copy to require double-click

Say the Copy button behaviour changes: single-click copies → double-click copies. You want returning users to see ONLY a heads-up about the new interaction; new users should see the full tour but with the updated description on the copy step. Three files change.

**1. `app/v2/components/tours/definitions.ts`** — rename the step id and point it at new translation keys:

```diff
-  { id: "copy",             element: '[data-tour="calendar-copy"]',
-    titleKey: "tour.calendarDialog.copy.title",
-    descKey:  "tour.calendarDialog.copy.description" },
+  { id: "copy-doubleclick", element: '[data-tour="calendar-copy"]',
+    titleKey: "tour.calendarDialog.copyDoubleclick.title",
+    descKey:  "tour.calendarDialog.copyDoubleclick.description" },
```

**2. `locales/en.json`** — replace the subtree (delete the old `copy` keys; LibreTranslate drops them from cache on source-hash change):

```diff
     "calendarDialog": {
       ...
-      "copy": {
-        "title":       "One-tap copy",
-        "description": "Tap to copy the URL to your clipboard. …"
-      }
+      "copyDoubleclick": {
+        "title":       "Double-click to copy",
+        "description": "The copy button now requires a double-click — double-tap the icon to copy the URL."
+      }
     },
```

**3. `CalendarSubscribe.tsx`** — swap the handler. `data-tour="calendar-copy"` anchor stays the same:

```diff
-<IconButton onClick={handleCopy} ... data-tour="calendar-copy">
+<IconButton onDoubleClick={handleCopy} ... data-tour="calendar-copy">
```

#### What the runner does

| User at T-1 (before change) | Seen ids before | Current step ids | Unseen (shown) | Seen ids after |
|---|---|---|---|---|
| Returning, completed old tour | `[welcome, url, copy]` | `[welcome, url, copy-doubleclick]` | `[copy-doubleclick]` | `[welcome, url, copy, copy-doubleclick]` |
| Brand-new | `[]` | `[welcome, url, copy-doubleclick]` | full | `[welcome, url, copy-doubleclick]` |
| Replay via `?` | any | as above | ALL (replay bypasses seen) | unchanged by replay |

The leftover `"copy"` in the returning user's seen map is **inert** — the runner only checks set membership against step ids currently in the definition. The test `delta after a step rename …` in `tests/v2/calendar-tour.spec.ts` locks this behaviour in.

#### The rule, in one sentence

If the **behaviour** of a step changes, rename its `id`. If a **genuinely new capability** appears, add a new step with its own `id`. Either way, per-step seen tracking takes care of the rest — never fork the tour into `calendar-dialog-v2`.

### Key files

| File | Purpose |
|---|---|
| `app/v2/components/tours/definitions.ts` | Registry of tours + steps. Start here. |
| `app/v2/components/Tour.tsx` | Driver.js runner, seen-map helpers, `startTour` / `hasUnseenSteps` exports. Rarely needs edits. |
| `app/v2/components/Footer.tsx` | Hosts the `?` replay icon for the `intro` tour. |
| `app/v2/components/CalendarSubscribe.tsx` | Example of a context-scoped tour: first-open trigger + in-dialog `?` replay. |
| `locales/en.json` | `tour.*` keys. LibreTranslate regenerates per-language on source-hash change. |

### Mixpanel events

All tour events carry `tourId`. Close/complete/start additionally carry:
- `shownSteps: string[]` — which step ids were in this run (unseen-only for partial runs, all for replays)
- `totalShown: number`
- `newStepsOnly: boolean` — true when the seen set was non-empty before this run (i.e. delta run for a returning user)
- `replay: boolean` (start + close/complete)

Useful funnels: `Tour Start` → `Tour Step Viewed` per step → `Tour Complete` vs `Tour Close`.

## Testing

Playwright e2e lives in `tests/v2/`. The mock calculator API at `tests/mock-calculator.ts` replaces the external service so tests are deterministic.

- **Run**: `yarn test:e2e` (does `next build && playwright test`)
- **Interactive**: `yarn test:e2e:ui`
- **Watch**: `yarn test:e2e:headed`
- **Port**: 3457 (`next start`; not `next dev` — Next 16 forbids a second dev instance per project)

Conventions:
- Seed state with `seedSeenTours(context, { tourId: [stepIds] })` and `seedLocationCookie(context)` BEFORE `page.goto`. `addInitScript` runs pre-hydration so SSR + client both see the seeded values.
- Use `waitForTourPopover(page)` and `readSeen(page)` from `tests/v2/helpers.ts`.
- Tour "Next" button collides with "Next month" in Navigation — always use `getByRole("button", { name: "Next", exact: true })` for the tour.
- For partial-replay tests, seed a subset of a tour's step ids and assert only the missing ones are shown (count the popover transitions or assert the final seen list).

## CI

Single workflow `.github/workflows/ci.yml`:
- `lint` — `yarn check` (biome)
- `build` — `yarn build` with dummy `CALCULATOR_API_*` env
- `playwright` — `yarn test:e2e`; uploads `playwright-report/` always and `test-results/` on failure
- `ci-status` — `if: always()` aggregator. **Point branch protection at "CI Status" only** so adding new jobs doesn't require changing the required-checks list.

## Other gotchas

- `utils/mixpanel.ts` `track()` is gated on an `initialized` flag. If `NEXT_PUBLIC_MIXPANEL_TOKEN` is missing in a production build, `track` no-ops instead of throwing `before_track` (which previously killed the tour startup).
- v1 (`app/(index)/`) is legacy and intentionally untested. Only v2 has e2e coverage.
