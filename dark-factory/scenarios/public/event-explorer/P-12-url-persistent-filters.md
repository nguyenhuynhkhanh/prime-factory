# Scenario: P-12 — Filter state is URL-persistent and shared via URL

## Type
feature

## Priority
high — URL-persistent filters enable the primary sharing/bookmarking use case

## Preconditions
- User is on the Event Explorer page at `/events`
- The page is rendered with no initial filters

## Action
1. User selects `command=df-orchestrate` in the filter bar
2. User selects `outcome=failed` in the filter bar
3. User waits 300ms (debounce interval)
4. User copies the current URL from the browser address bar
5. User opens the copied URL in a new tab

## Expected Outcome
- After step 3: The browser URL is updated to `/events?command=df-orchestrate&outcome=failed` without a full page reload (via `router.replace()` or similar)
- In the new tab (step 5): The page loads with `command=df-orchestrate` and `outcome=failed` pre-populated in the filter bar
- The event list in the new tab reflects the filtered results (same as the original tab)
- No filter is lost during URL round-trip

## Notes
Verifies FR-12. The Server Component reads `searchParams` prop (awaited in Next.js 16) and passes filter values to the data fetch. The `<EventFilters>` client component reads current URL search params to initialise its state on mount.
