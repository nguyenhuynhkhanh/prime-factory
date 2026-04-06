# Scenario: H-24 — Debounce: rapid filter changes produce only one navigation after 300ms

## Type
edge-case

## Priority
medium — debounce prevents D1 query floods during interactive filtering

## Preconditions
- User is on the Event Explorer page at `/events` (browser environment)
- `<EventFilters>` component is mounted and the command filter is a text/select input

## Action
User changes the `command` filter 5 times in rapid succession within a 200ms window:
1. Select `df-intake` (t=0ms)
2. Select `df-debug` (t=50ms)
3. Select `df-orchestrate` (t=100ms)
4. Select `df-debug` (t=150ms)
5. Select `df-cleanup` (t=200ms)
Then wait 300ms from the last change (t=500ms total)

## Expected Outcome
- During the 200ms of rapid changes: the URL does NOT update; no navigation occurs
- At t=500ms (300ms after the last change): the URL updates ONCE to reflect `command=df-cleanup`
- Only 1 navigation (and therefore 1 server fetch) occurs — not 5
- The filter bar shows `df-cleanup` selected throughout (immediate UI state update is fine; only the URL/navigation is debounced)

## Notes
Verifies FR-12, NFR-5. The debounce must be implemented with `useEffect` + `setTimeout`/`clearTimeout` per the implementation notes. The test validates that intermediate selections do not trigger navigations — only the final settled state does.
