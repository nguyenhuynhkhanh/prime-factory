# P-03: Status badge shows Pending for an unactivated install

**Spec refs:** FR-4, BR-2, BR-3, EC-3  
**Track:** Track A

## Type
feature

## Priority
high

## Preconditions

- Admin is authenticated.
- `GET /api/v1/dashboard/installs` returns four rows representing each badge state:

| Row | isActivated | revokedAt | lastSeenAt | Expected Badge |
|-----|-------------|-----------|------------|----------------|
| A | `false` | `null` | `null` | Pending (amber) |
| B | `true` | `null` | ISO string within 30 days | Active (green) |
| C | `true` | `null` | `null` | Inactive (gray) |
| D | `true` | ISO string (not null) | ISO string within 30 days | Revoked (red) |

## Action

Render the installs page and inspect the Status column for each row.

## Expected Outcomes

**Row A (Pending):**
- Badge text: "Pending"
- Badge classes include `bg-amber-100` and `text-amber-700`
- Revoke button is present and enabled (revokedAt is null)

**Row B (Active):**
- Badge text: "Active"
- Badge classes include `bg-green-100` and `text-green-800`
- Revoke button is present and enabled

**Row C (Inactive — lastSeenAt null):**
- Badge text: "Inactive"
- Badge classes include `bg-gray-100` and `text-gray-600`
- Revoke button is present and enabled

**Row D (Revoked — revokedAt not null):**
- Badge text: "Revoked"
- Badge classes include `bg-red-100` and `text-red-700`
- No enabled Revoke button in this row

## 30-Day Boundary Variant (EC-3)

Add a fifth row:

| Row | isActivated | revokedAt | lastSeenAt | Expected Badge |
|-----|-------------|-----------|------------|----------------|
| E | `true` | `null` | exactly 30 days ago (to the millisecond) | Inactive (gray) |

- Row E badge is Inactive, not Active.
- Confirms the exclusive boundary: `< 30 * 24 * 60 * 60 * 1000 ms`, not `<=`.

## Notes

- Badge classes are an observable implementation detail for this project because the design system is Tailwind-only — no component library wraps these badges.
- Row D confirms BR-1: even though `lastSeenAt` is within 30 days (which would normally be Active), `revokedAt IS NOT NULL` wins.
