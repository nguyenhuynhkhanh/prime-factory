# Scenario H-04: Active count excludes revoked installs

**Spec**: api-key-management-server
**Requirement**: FR-14, BR-8, EC-1, EC-2
**Track**: B (admin routes)
**Classification**: HOLDOUT — do not include in public training data

---

## Setup

Install four rows for org `org-abc`:

| id | label | revoked_at | computer_name | last_seen_at |
|----|-------|-----------|---------------|--------------|
| `install-active-1` | `"active-1"` | NULL | `"machine-1"` | `now - 5d` (within 30d) |
| `install-active-2` | `"active-2"` | NULL | `"machine-2"` | `now - 10d` (within 30d) |
| `install-revoked` | `"revoked"` | `now - 1d` (revoked yesterday) | `"machine-3"` | `now - 2d` (would have counted without filter) |
| `install-unactivated` | `"pending"` | NULL | NULL | NULL (never activated, never seen) |

Also insert three events linked to `install-revoked` (historical telemetry from before the revocation).

---

## Assertion 1: Active count in stats API excludes revoked installs

### Steps

1. `GET /api/v1/dashboard/stats` with a valid admin session for `org-abc`.

### Expected

- `activeInstalls = 2` (only `install-active-1` and `install-active-2` count)
- `install-revoked` is excluded from the count (`revoked_at IS NOT NULL`)
- `install-unactivated` is excluded from the count (`last_seen_at = NULL`, does not satisfy `last_seen_at > thirtyDaysAgo`)

---

## Assertion 2: Active count in dashboard page excludes revoked installs

The dashboard page (`app/(dashboard)/page.tsx`) runs the same active-installs query as the stats API.

### Steps

1. Render `GET /` (dashboard page) with a valid admin session for `org-abc`.

### Expected

- The "Active in last 30 days" stat card shows `2`.

---

## Assertion 3: Dashboard installs list still shows revoked install (EC-1)

### Steps

1. `GET /api/v1/dashboard/installs` with a valid admin session for `org-abc`.

### Expected

- Response includes all four installs (200 row limit is not exceeded here).
- `install-revoked` row is present with:
  - `revokedAt` is a non-null ISO timestamp string
  - `isActivated: true` (because `computerName` is not null)
  - `eventCount: 3` (historical events are preserved and counted)
- `install-unactivated` row is present with:
  - `revokedAt: null`
  - `isActivated: false` (because `computerName` is null)
  - `computerName: null`
  - `gitUserId: null`
  - `eventCount: 0`

---

## Assertion 4: Extended response shape on dashboard installs

For each install row in the `GET /api/v1/dashboard/installs` response, verify the new fields are present:

| Field | Type | Nullable |
|-------|------|----------|
| `label` | string | no |
| `revokedAt` | ISO string | yes (null if not revoked) |
| `expiresAt` | ISO string | no |
| `isActivated` | boolean | no |
| `computerName` | string \| null | yes |
| `gitUserId` | string \| null | yes |

Legacy fields (`id`, `createdAt`, `lastSeenAt`, `eventCount`, `lastEventAt`) must still be present.

---

## Assertion 5: apiKey is absent from dashboard installs response

Verify that none of the four install rows in the `GET /api/v1/dashboard/installs` response contains an `apiKey` field (NFR-2, BR-3).
