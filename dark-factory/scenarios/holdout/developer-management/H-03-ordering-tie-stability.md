# Scenario H-03: Ordering stability when multiple installs share the same lastSeenAt timestamp

## Type
edge-case

## Priority
medium — degenerate ordering case; ORDER BY on a non-unique column can produce non-deterministic results

## Preconditions
- Org "acme" exists with `orgId = "org-acme"`
- CTO has a valid session cookie
- Three installs exist, all with `lastSeenAt = 2026-04-04T10:00:00Z` (identical timestamps):
  - `id = "install-x"`, `computerName = "machine-x"`
  - `id = "install-y"`, `computerName = "machine-y"`
  - `id = "install-z"`, `computerName = "machine-z"`

## Action
```
GET /api/v1/dashboard/installs
Headers:
  Cookie: session=<valid-session-id>
```
Called twice in sequence.

## Expected Outcome
- Both calls return HTTP 200 with 3 elements in `installs`
- All three installs are present in both responses
- The order between the two responses is consistent (deterministic) — either always the same
  order or, at minimum, all three elements are present without any being dropped

## Failure Mode
N/A

## Notes
- FR-4 coverage for the degenerate case.
- SQLite does not guarantee a stable tie-breaking order when ORDER BY values are equal. If strict
  determinism is required for UX, a secondary sort on `installs.id ASC` should be added. This
  scenario validates presence but notes the ordering concern.
- This is a holdout scenario because adding a secondary sort is a quality-of-life detail the
  code-agent should discover independently.
