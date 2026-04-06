# Scenario: P-01 — Authenticated CTO receives org-scoped paginated events

## Type
feature

## Priority
critical — this is the primary success path and the foundation for all other scenarios

## Preconditions
- Org "acme" has `orgId = "org-acme"`
- CTO user `cto@acme.com` is authenticated; valid session cookie present
- 3 events exist for org-acme:
  - Event A: `installId=install-1`, `command=df-orchestrate`, `outcome=success`, `startedAt=2026-04-05T10:00:00Z`, `durationMs=83000`, `computerName=alice-macbook`, `gitUserId=alice`, `promptText="secret prompt"`
  - Event B: `installId=install-1`, `command=df-debug`, `outcome=failed`, `startedAt=2026-04-05T09:00:00Z`, `durationMs=5000`, `computerName=alice-macbook`, `gitUserId=alice`
  - Event C: `installId=install-2`, `command=df-intake`, `outcome=success`, `startedAt=2026-04-05T08:00:00Z`, `durationMs=1200`, `computerName=bob-laptop`, `gitUserId=bob`
- 2 events exist for a different org "rival" — these must NOT appear
- No query params supplied (uses defaults: from=now-7d, page=1, limit=50)

## Action
```
GET /api/v1/dashboard/events
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- `Cache-Control: no-store` header present
- Response body contains `events` array with exactly 3 items
- Events are sorted by `startedAt DESC` (Event A first, then B, then C)
- Each event object contains: `id`, `installId`, `computerName`, `gitUserId`, `command`, `subcommand`, `startedAt`, `endedAt`, `durationMs`, `outcome`, `featureName`, `roundCount`, `sessionId`, `createdAt`
- `promptText` is ABSENT from every event object — not present as key, not null, not empty string
- `computerName` and `gitUserId` reflect values from the joined `installs` table
- `pagination` object: `{ "page": 1, "limit": 50, "total": 3, "hasMore": false }`
- The 2 rival-org events do NOT appear anywhere in the response

## Notes
This scenario verifies org isolation (FR-1, BR-1), promptText exclusion (FR-11, BR-7), JOIN correctness (BR-8), and the pagination shape (FR-9).
