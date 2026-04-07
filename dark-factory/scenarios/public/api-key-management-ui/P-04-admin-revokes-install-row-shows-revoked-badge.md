# P-04: Admin revokes install — row shows Revoked badge

**Spec refs:** FR-7, FR-8, FR-9, EC-6  
**Track:** Track A

## Type
feature

## Priority
critical

## Preconditions

- Admin is authenticated.
- The installs page is rendered with at least one row where `revokedAt IS NULL` (Active or Inactive or Pending badge).
- `PATCH /api/v1/installs/[id]/revoke` returns `200 { ok: true }` for this install's ID.

## Action

1. Locate a row with an enabled Revoke button.
2. Click the Revoke button.

## Expected Outcome After Click (Before Confirmation)

- A confirmation prompt appears (inline in the row, a modal, or an inline dialog — implementation choice).
- The `PATCH /api/v1/installs/[id]/revoke` API call has NOT yet been made.
- If the admin dismisses the confirmation (e.g., clicks Cancel), the row is unchanged.

## Action (Confirming Revoke)

3. Confirm the revoke action (e.g., click "Yes, revoke" or equivalent).

## Expected Outcome After Confirmation

- `PATCH /api/v1/installs/[id]/revoke` is called with the correct install ID.
- No full page navigation / reload occurs.
- The affected row's Status badge changes to Revoked (red badge: `bg-red-100 text-red-700`).
- The Revoke button in that row disappears or becomes disabled.
- All other rows are unaffected.

## Error Variant (EC-6)

- `PATCH /api/v1/installs/[id]/revoke` returns 404.
- After confirmation, an error message is shown (inline or as a notification).
- The row badge does NOT change to Revoked.
- The Revoke button remains enabled so the admin can retry or investigate.

## Notes

- FR-9 requires the badge to update without a full page reload. Because `installs/page.tsx` is a Server Component, this requires a client-side state mechanism in the interactive portion of the table.
- A loading state during the PATCH call is expected (button disabled while request is in flight).
