# Scenario H-04: LIMIT 200 safety cap — 201st install is not returned; advisory note shown

## Type
edge-case

## Priority
high — the LIMIT 200 cap is a non-negotiable server-side constraint

## Preconditions
- Org "acme" exists with `orgId = "org-acme"`
- CTO has a valid session cookie
- 201 installs exist for org-acme in D1:
  - 200 installs each with a unique `lastSeenAt` timestamp spanning the last year
  - 1 install (the "oldest") with `lastSeenAt` older than all others

## Action
```
GET /api/v1/dashboard/installs
Headers:
  Cookie: session=<valid-session-id>
```

## Expected Outcome
- HTTP 200
- The `installs` array has exactly 200 elements
- The oldest install (the 201st when ordered by `lastSeenAt DESC`) is absent from the response
- The UI renders an advisory note: "Showing the 200 most recently active machines" (or equivalent
  text indicating truncation)

## Failure Mode
N/A — if D1 returns fewer than 200, no note is shown and no truncation occurs.

## Notes
- FR-5 and BR-7 coverage; EC-5 coverage.
- This is a holdout scenario because the code-agent must decide independently where to apply the
  LIMIT and how to surface the advisory note.
- In practice, seeding 201 records is expensive in a test; consider a mock that returns a 201-row
  array from the D1 layer and verify the route handler applies LIMIT 200 before returning.
