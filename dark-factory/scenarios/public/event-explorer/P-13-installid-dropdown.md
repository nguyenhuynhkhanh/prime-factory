# Scenario: P-13 — installId dropdown is populated from dashboard installs endpoint

## Type
feature

## Priority
medium — the dropdown is a UX dependency on a cross-feature endpoint

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- `GET /api/v1/dashboard/installs` returns:
  ```json
  [
    { "id": "install-1", "computerName": "alice-macbook", "gitUserId": "alice" },
    { "id": "install-2", "computerName": "bob-laptop", "gitUserId": "bob" }
  ]
  ```
- User navigates to the Event Explorer page

## Action
User opens the `installId` filter dropdown in the `<EventFilters>` bar

## Expected Outcome
- The dropdown displays two options:
  - "alice (alice-macbook)"
  - "bob (bob-laptop)"
- Display format is `{gitUserId} ({computerName})`
- The value submitted to the URL search param is the install `id` (e.g., `install-1`), not the display label

## Notes
Verifies FR-13. This scenario depends on `GET /api/v1/dashboard/installs` existing. If that endpoint is unavailable, the dropdown should render empty (no error thrown to the user). That degradation path is covered in holdout scenario H-22.
