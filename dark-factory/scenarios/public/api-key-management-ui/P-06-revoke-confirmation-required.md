# P-06: Revoke confirmation is required before executing

**Spec refs:** FR-8, EC-6  
**Track:** Track A

## Type
feature

## Priority
high — prevents accidental irreversible revocations

## Preconditions

- Admin is authenticated.
- The installs page is rendered with at least one row where `revokedAt IS NULL`.
- Network is reachable (we are testing the confirmation guard, not error handling).

## Action

1. Click the Revoke button on an active/inactive/pending row.

## Expected Outcome — Confirmation Required

- A confirmation step appears (inline confirmation in the row, a dialog, or an alert-style modal).
- The confirmation prompt communicates that the action is irreversible (e.g., "Are you sure? This action cannot be undone" or equivalent).
- The `PATCH /api/v1/installs/[id]/revoke` endpoint has NOT been called yet.

## Action — Cancel

2. Click Cancel (or dismiss the confirmation).

## Expected Outcome — Cancel

- The confirmation prompt is dismissed.
- The row is unchanged (badge unchanged, Revoke button still enabled).
- No API call was made.

## Action — Confirm

3. Repeat step 1, then confirm the action.

## Expected Outcome — Confirmed

- `PATCH /api/v1/installs/[id]/revoke` is called exactly once.
- Row updates to Revoked as in P-04.

## Notes

- This scenario is specifically about the two-step guard. The actual revoke-and-update behavior is fully covered by P-04. This scenario focuses on verifying the confirm/cancel branching.
- Implementation may use `window.confirm()`, an inline state toggle, or a small dialog — any of these satisfy FR-8 as long as a single click is never sufficient to revoke.
