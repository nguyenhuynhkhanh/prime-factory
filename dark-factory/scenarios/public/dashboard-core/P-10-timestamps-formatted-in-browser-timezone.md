# Scenario P-10: Recent events timestamps are formatted in browser local timezone

## Type
feature

## Priority
medium — timestamps shown in server timezone (e.g., UTC) would be misleading for CTOs in other timezones.

## Preconditions
- A CTO user exists with a valid session cookie.
- The org has at least 1 event with a known `created_at` value (e.g., Unix timestamp for 2026-04-06T14:23:00Z).
- The stats API returns `recentEvents[0].createdAt = "2026-04-06T14:23:00.000Z"`.

## Action
Navigate to the dashboard overview page. The browser's timezone is set to a non-UTC timezone (e.g., America/New_York, UTC-4).

## Expected Outcome
- The `createdAt` field for recent events is rendered via a client component that calls `new Date(iso).toLocaleString()` or equivalent.
- The rendered timestamp reflects the browser's local timezone, not UTC.
  - For UTC-4: the time displays as approximately "4/6/2026, 10:23:00 AM" rather than "4/6/2026, 2:23:00 PM".
- There is no hydration mismatch warning in the browser console — the server renders a placeholder or the ISO string, and the client component fills in the localized time.

## Failure Mode
If the timestamp is formatted server-side (e.g., using `.toISOString()` or a server-timezone string on the server), this test will fail for non-UTC timezones.

## Notes
The recommended implementation is a `'use client'` component (e.g., `LocalTimestamp`) that accepts an ISO 8601 string prop and renders it with `toLocaleString()`. This avoids SSR/hydration mismatch because the server either renders the ISO string as-is or uses `suppressHydrationWarning`.
