# Scenario P-01: Happy path — list installs for authenticated CTO

## Type
feature

## Priority
critical — this is the primary read path for the entire developer-management feature

## Preconditions
- Org "acme" exists in D1 with `orgId = "org-acme"`
- CTO user `cto@acme.com` exists with `orgId = "org-acme"`, `role = "cto"`
- A valid unexpired session exists in `sessions` for this user; the `session` cookie is set
- Two installs exist for `org-acme`:
  - Install A: `id = "install-1"`, `computerName = "MacBook-Pro"`, `gitUserId = "alice"`,
    `createdAt = 2026-01-10T09:00:00Z`, `lastSeenAt = 2026-04-01T14:00:00Z` (within 30 days of 2026-04-06)
  - Install B: `id = "install-2"`, `computerName = "devbox"`, `gitUserId = "bob"`,
    `createdAt = 2026-02-20T11:00:00Z`, `lastSeenAt = 2026-03-08T08:00:00Z` (older than 30 days)
- Install A has 5 events; Install B has 2 events
- Page heading "Registered Machines" is expected in the rendered page

## Action
```
GET /api/v1/dashboard/installs
Headers:
  Cookie: session=<valid-session-id>
```

## Expected Outcome
- HTTP 200
- Response body:
  ```json
  {
    "installs": [
      {
        "id": "install-1",
        "computerName": "MacBook-Pro",
        "gitUserId": "alice",
        "createdAt": "2026-01-10T09:00:00.000Z",
        "lastSeenAt": "2026-04-01T14:00:00.000Z",
        "eventCount": 5,
        "lastEventAt": "<ISO 8601 string of the most recent event createdAt for install-1>"
      },
      {
        "id": "install-2",
        "computerName": "devbox",
        "gitUserId": "bob",
        "createdAt": "2026-02-20T11:00:00.000Z",
        "lastSeenAt": "2026-03-08T08:00:00.000Z",
        "eventCount": 2,
        "lastEventAt": "<ISO 8601 string of the most recent event createdAt for install-2>"
      }
    ]
  }
  ```
- Install A appears before Install B (ordered by `lastSeenAt DESC`)
- Response body does NOT contain the keys `apiKey`, `hmac`, `passwordHash`, or `userId`
- The `installs` array has exactly 2 elements

## Failure Mode
N/A — this is a read-only GET; no partial failure state is possible.

## Notes
- The page (UI layer) should render with the heading "Registered Machines" — verify in a browser
  render test or by inspecting the JSX output.
- `lastEventAt` values depend on seeded event data; the test should seed events with known
  `createdAt` values and assert the exact ISO string.
