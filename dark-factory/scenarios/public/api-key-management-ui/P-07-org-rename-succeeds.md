# P-07: Org rename succeeds and updates displayed name

**Spec refs:** FR-18, FR-19, FR-20, FR-21, FR-22, EC-11  
**Track:** Track B

## Type
feature

## Priority
high

## Preconditions

- Admin is authenticated.
- D1 has an org row for this admin's `orgId` with `name = "Acme Corp"`.
- `PATCH /api/v1/orgs` returns `200 { id, name }` when given a valid name.

## Action

1. Navigate to `/settings`.

## Expected Outcomes (Page Load)

- Page renders without crashing.
- `RenameOrgForm` is rendered with the text input pre-filled with `"Acme Corp"`.
- No error state is shown.
- Session gate works: unauthenticated request redirects to `/login`.

## Action (Submit New Name)

2. Clear the input and type `"New Corp Name"`.
3. Click Save.

## Expected Outcomes (During Submit)

- Save button is disabled.
- Loading state is visible (FR-22).

## Expected Outcomes (After 200 Response)

- A "Saved" success indicator is visible (FR-20).
- The text input now shows `"New Corp Name"` (the updated value from the response).
- No error message is shown.

## Error Variant

- `PATCH /api/v1/orgs` returns 400 `{ error: "name is required" }`.
- After submit, `<p className="text-sm text-red-600" role="alert">name is required</p>` is rendered (FR-21).
- Save button becomes re-enabled.

## Idempotent Variant (EC-11)

- The input still contains `"Acme Corp"` (the current name — no change).
- Click Save.
- `PATCH /api/v1/orgs` returns 200.
- "Saved" indicator is shown — no error.

## Notes

- The settings page is a Server Component and queries D1 directly (`SELECT name FROM orgs WHERE id = ?`) — same pattern as `installs/page.tsx` currently uses for its own data.
- `RenameOrgForm` receives `orgId` and `currentName` as props from the Server Component.
