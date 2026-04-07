# P-01: Installs page renders with Label column and Generate API Key button

**Spec refs:** FR-1, FR-2, FR-3, FR-6, EC-8  
**Track:** Track A

## Context

The admin navigates to `/installs` after the `api-key-management-server` changes are deployed. The page now fetches from `GET /api/v1/dashboard/installs` instead of querying D1 directly.

## Setup

- Admin session cookie is valid.
- `GET /api/v1/dashboard/installs` returns a well-formed response with at least one install row that includes `label`, `revokedAt`, `isActivated`, `computerName`, `gitUserId`, `expiresAt`, `lastSeenAt`.

## Steps

1. Render `app/(dashboard)/installs/page.tsx` with a valid admin session.
2. Observe the page output.

## Expected Outcomes

- The page heading reads "API Keys" (or equivalent — implementer may choose the heading; this scenario validates the structural items, not the exact heading text).
- A "Generate API Key" button is present above the table.
- The table's first column header is "Label" (or equivalent).
- All rows include a non-empty label value from the API response.
- The `CopyInviteLink` component is NOT rendered anywhere on the page (no "Copy invite link" text or button).
- The `computerName` and `gitUserId` cells for rows where those values are non-null render the actual values.

## Empty-State Variant (EC-8)

- `GET /api/v1/dashboard/installs` returns an empty `installs` array.
- The page renders an empty-state message.
- The "Generate API Key" button is STILL present in the empty state (it does not disappear when the list is empty).

## Notes

- The fetch must use `cookies()` from `next/headers` forwarded as a `cookie` header, with `cache: "no-store"` (NFR-3).
- If the fetch fails, the page renders the error state ("Unable to load API keys. Please refresh the page.") and does not crash (NFR-4).
