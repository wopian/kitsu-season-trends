# 001 — Stabilize history loading handoff

- **Status**: DONE
- **Commit**: ac03a73a
- **Severity**: MEDIUM
- **Category**: Missed opportunities; preventing a jarring change
- **Estimated scope**: 3 files; dashboard markup/state, scoped global CSS, browser coverage

## Problem

`X:/GitHub/wopian/kitsu-season-trends/app/components/SeasonDashboard.vue:446–469` inserts recorded range and replaces short loading text with 360px chart. Modal body grows when data arrives. Ready chart appears without bridge.

Current code, verbatim:

```vue
          <p
            v-if="recordedRange"
            class="muted"
            aria-label="Recorded history range"
          >
            {{ recordedRange }}
          </p>
          <div v-if="animeHistoryError" class="error-banner" role="alert">
            {{ animeHistoryError }}.
            <button @click="retryAnimeHistory">Retry anime history</button>
          </div>
          <p v-else-if="animeHistoryLoading" role="status">
            Loading anime history…
          </p>
          <TrendChart
            v-else-if="fullHistoryAnime && graphs.length"
            :anime="fullHistoryAnime"
            :metrics="graphs"
            use-laplace="auto"
            :days="Number(days)"
            :weekly="weeklyHistory"
            :height="360"
          />
          <p v-else-if="!graphs.length">Select graph metrics above.</p>
```

`X:/GitHub/wopian/kitsu-season-trends/app/composables/useAnimeHistory.ts:10–51` already handles aborts, ID checks, retries, and cached archives. Preserve this behavior.

## Target

Reserve chart space immediately. On successful pending request, reveal ready chart once with opacity transition. Do not animate chart geometry or delay chart interaction.

- Standard reveal: opacity 0 to 1, **150ms**, `var(--ease-out)`.
- Existing token resolves to **cubic-bezier(0, 0, 0.2, 1)** in `node_modules/tailwindcss/theme.css:435`. Reuse existing token; do not override it globally with playbook's stronger curve.
- Reduced motion: opacity 0 to 1, **80ms**, same curve. No movement in either mode.
- No exit transition, delay, transform, stagger, height animation, or crossfade of loading text with chart.
- Cached reopening, metric toggles, and range changes have no new reveal.
- Preserve current UModal entrance. Do not add `appear` to inner transition.

Target CSS in `X:/GitHub/wopian/kitsu-season-trends/app/assets/css/main.css`:

```css
.history-range {
  min-block-size: 1lh;
}
.history-chart-slot {
  min-block-size: 360px;
}
.history-ready-enter-active {
  transition: opacity 150ms var(--ease-out);
}
.history-ready-enter-from {
  opacity: 0;
}
.history-ready-enter-to {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .history-ready-enter-active {
    transition: opacity 80ms var(--ease-out) !important;
  }
}
```

Use narrow `!important` exception because existing universal reduced-motion rule declares `transition: none !important`. Keep that rule intact. No hover styles needed.

## Repo conventions to follow

- Nuxt 4.5.2, Vue 3.5.43, Nuxt UI 4.11.3, Tailwind CSS; no added motion dependency.
- Global styles live in `X:/GitHub/wopian/kitsu-season-trends/app/assets/css/main.css`.
- `.nuxt/ui/modal.ts:16–17` uses existing `--ease-out` for 200ms modal fade/scale. Read generated file as exemplar; never edit it.
- `X:/GitHub/wopian/kitsu-season-trends/app/components/TrendChart.vue:79–105` reserves supplied chart height and uses ClientOnly fallback. Preserve chart component and its props.
- Existing body scroll and footer layout keep downloads visible. Reserve space inside scrolling body, not outside modal.
- Frequency: occasional asynchronous history requests. Purpose: prevent abrupt content handoff. Keyboard open/close and focus restoration get no additional motion or delay.

## Steps

1. Edit only history detail area in `X:/GitHub/wopian/kitsu-season-trends/app/components/SeasonDashboard.vue`. Keep range paragraph mounted while modal body exists. Add `history-range` alongside `muted`. Replace conditional paragraph rendering with conditional label and hidden blank state:

   ```vue
   <p
     class="muted history-range"
     :aria-label="recordedRange ? 'Recorded history range' : undefined"
     :aria-hidden="recordedRange ? undefined : true"
   >{{ recordedRange || '\u00a0' }}</p>
   ```

   Paragraph reserves one line before metadata arrives. Preserve natural wrapping for long ranges. One-line reservation does not guarantee identical modal height when text wraps; verify narrow screens explicitly.

2. Place error, loading, ready chart, and no-metrics states inside one always-mounted `.history-chart-slot` within `.detail-body`. Set `:aria-busy="animeHistoryLoading"` on slot. Preserve error priority, exact messages, `role="alert"`, `role="status"`, Retry handler, and chart props.

3. Wrap ready chart in plain `.history-chart-ready` element. Keep Vue `<Transition name="history-ready">` mounted around its conditional child. Place loading/error messages outside Transition. Ready child renders only when `!animeHistoryError && !animeHistoryLoading && fullHistoryAnime && graphs.length`. Keep no-metrics message mutually exclusive with loading/error. Do not key ready child by metrics, days, weekly mode, or sample count.

4. Add local boolean controlling Transition `:css`. Initialize false. Set true only when `animeHistoryLoading` becomes true. Reset false on expanded ID change, load failure, transition completion (`@after-enter`), or transition cancellation (`@enter-cancelled`). Use synchronous watchers so reset happens before next DOM update. If request finishes with zero graph metrics, consume flag immediately; enabling graphs later must not reveal. Cached opening never enters loading state, so flag remains false. No `appear`, timers, requestAnimationFrame loops, new fetches, or cache changes.

   Keep flag true across loading-to-success render, then consume after enter. Test cached opening and interrupted request explicitly. Metric/range changes during reveal must preserve same ready wrapper and never restart reveal.

5. Append target CSS near existing history styles. Keep reduced-motion exception scoped exactly to `.history-ready-enter-active`. Do not remove universal reduced-motion protection. Do not animate chart slot size or metadata.

6. Extend `X:/GitHub/wopian/kitsu-season-trends/tests/browser/full-history.spec.ts` using existing Playwright routing and MessagePack fixture pattern. Gate mocked response with promise released by test, rather than arbitrary network sleeps. Assert loading slot reserves at least 360px, error has no chart, retry succeeds, cached reopening avoids fetch/reveal, and range/metric changes do not add enter classes. For transition timing, sample computed transition while response-driven entrance is active; expect 0.15s normally and 0.08s under reduced motion. Verify property is opacity only. Release all held routes during cleanup.

## Boundaries

- Source remains unchanged while writing this plan. Implementation occurs only when separately requested.
- Do not modify useAnimeHistory, TrendChart, card charts, overview, stats, routes, sampling, downloads, or data formats.
- Do not change UModal transition, focus trap, focus restoration, scroll lock, or footer structure.
- Do not add chart line animation, button feedback, banner animation, dependencies, global easing changes, or unrelated cleanup.
- Do not add minimum loading duration. Fast data stays fast.
- If cited source differs materially from commit stamp, stop and report drift before edits.

## Verification

Run these commands from `X:/GitHub/wopian/kitsu-season-trends` during implementation, not planning:

```powershell
bun run typecheck
bun run build
bun run test:browser tests/browser/full-history.spec.ts tests/browser/history-scroll.spec.ts
```

Expected: typecheck and static build pass. Both configured desktop/mobile browser projects pass. Mobile project emulates iPhone 13 using Chromium; do not describe it as Safari or real-device validation.

Feel check in both development (`bun run dev`) and production preview (`bun run preview`):

- Open uncached history with delayed response. Slot already occupies 360px. Chart fades once after readiness. Footer does not jump because loading text is shorter than chart.
- Inspect DevTools animation playback at 10%. Only ready wrapper opacity changes; no doubled text, moving axes, or height interpolation.
- Open cached history. Chart appears immediately alongside existing modal entrance, without extra fade.
- Change 30/90/full history and graph metrics repeatedly. No reveal restarts. Turn every metric off during loading, then enable one after completion; no delayed reveal.
- Fail request, retry, close while pending, and quickly open another anime. No stale archive, stuck opacity, lost Retry, delayed dismissal, or stale reveal flag.
- Test keyboard Enter opening and Escape closing. Preserve focus and scroll assertions from history-scroll.spec.ts.
- At 390×844 and desktop viewport, inspect dialog bounds before/after successful load. Metadata wrapping may add natural height; chart replacement must not add 360px after request completion. Body scrolls when necessary; footer downloads stay visible.
- Emulate prefers-reduced-motion. Only targeted 80ms fade remains; unrelated motion remains disabled.
- Check available Chrome, Firefox, and Safari separately. Record browser availability and any checks not performed. Code review/build results alone do not establish feel or GPU performance.

**Done when:** pending/success/error states retain reserved chart space; fresh successful load fades once; cached and control changes add no reveal; failures, cancellation, focus, scrolling, downloads, and sampling retain existing behavior. Report visual validation separately from automated results.

## Execution evidence — 2026-10-20

- Added reserved metadata line and 360px chart slot in SeasonDashboard.vue. Fresh pending requests reveal once through Vue Transition. Cached opening, metric changes, and range changes add no reveal.
- Added 150ms opacity transition and narrowly scoped 80ms reduced-motion exception. Existing modal entrance and global reduced-motion protection remain intact.
- `bun run typecheck` passes. `git diff --check` passes.
- Bun production generation fails during prerender directory creation with `EPERM: operation not permitted, mkdir`. No source workaround added. `node node_modules/nuxt/bin/nuxt.mjs generate` passes, prerendering 96 routes. `bun scripts/verify-static.ts` passes: 42 routes, all JSON/MessagePack archives, 6340 release files.
- Production Chromium desktop/mobile: all 12 history/sampling/scroll tests pass. Development: all 12 pass across initial run and targeted sampling rerun after hydration-readiness fix. Updated transition-style observer also passes all six focused Chromium production checks.
- Production Firefox/WebKit: functional sampling/scroll tests pass; all six focused handoff tests pass after replacing transition-event observation with active-style observation. All six focused Firefox/WebKit development checks pass.
- Browser tests cover 150ms/80ms opacity-only styles, stable slot/dialog size, visible downloads, failure/retry, cache, hidden metrics, cancelled requests, sampling, focus, and scroll restoration.
- Chrome screenshots reviewed at 1280×900 and 390×844. Slow playback inspection uses 10% speed. Slot geometry stays identical before/after readiness; final opacity reaches 1. Development screenshots confirm same behavior.
- Validation uses headless browsers and mobile emulation. Installed WebKit engine is not Safari. Real Safari, real-device interaction, and GPU/performance benchmarks remain unverified.
