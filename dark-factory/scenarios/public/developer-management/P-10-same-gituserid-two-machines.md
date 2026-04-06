# Scenario P-10: Same gitUserId, two machines — appears as two separate rows

## Type
feature

## Priority
medium — verifies the "machines not people" mental model is correctly reflected in the data

## Preconditions
- Org "acme" exists with `orgId = "org-acme"`
- CTO has a valid session cookie
- Two installs exist for org-acme with the same `gitUserId = "dave"` but different machine identities:
  - Install A: `id = "install-dave-macbook"`, `computerName = "MacBook-Pro-Dave"`,
    `lastSeenAt = 2026-04-04T09:00:00Z`
  - Install B: `id = "install-dave-linux"`, `computerName = "ubuntu-workstation"`,
    `lastSeenAt = 2026-03-20T15:00:00Z`

## Action
```
GET /api/v1/dashboard/installs
Headers:
  Cookie: session=<valid-session-id>
```

## Expected Outcome
- HTTP 200
- The `installs` array contains exactly 2 elements
- Both rows are present:
  - One with `id = "install-dave-macbook"` and `computerName = "MacBook-Pro-Dave"`
  - One with `id = "install-dave-linux"` and `computerName = "ubuntu-workstation"`
- Both rows show `gitUserId = "dave"` independently
- Install A appears before Install B (more recent `lastSeenAt`)

## Failure Mode
N/A

## Notes
- EC-8 coverage: same developer, two machines = two rows. The GROUP BY is on `installs.id`,
  not `gitUserId`, so deduplication by developer identity must NOT occur.
