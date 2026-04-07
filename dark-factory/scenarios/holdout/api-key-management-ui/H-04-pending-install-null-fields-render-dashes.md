# H-04: Pending install row with null computerName and gitUserId renders dashes

**Spec refs:** FR-3, FR-4, BR-2, EC-10  
**Track:** Track A

## Type
edge-case

## Priority
medium — a Pending install is the most likely row to have null nullable fields, since the developer hasn't run df-onboard yet

## Preconditions

One install row seeded:

| Field | Value |
|-------|-------|
| `isActivated` | `false` |
| `revokedAt` | `null` |
| `lastSeenAt` | `null` |
| `computerName` | `null` |
| `gitUserId` | `null` |
| `label` | `"mobile-dev-key"` |

This represents a key that was generated but the developer has not run df-onboard. Neither the computer name nor the git user ID has been populated yet.

## Action

Render the installs page.

## Expected Outcomes

**Badge:**
- Status badge is "Pending" (amber: `bg-amber-100 text-amber-700`)

**Null field rendering (FR-3):**
- The `computerName` cell renders `"—"` (an em dash or equivalent null placeholder, NOT an empty cell, NOT the string `"null"`, NOT a blank space)
- The `gitUserId` cell renders `"—"`

**Revoke button:**
- Present and enabled (revokedAt is null)

## XSS Variant (EC-10)

Seed an install row where:
- `computerName` = `"<script>alert(1)</script>"`
- `gitUserId` = `"<img src=x onerror=alert(2)>"`

### Expected Outcome
- The values are rendered as literal text (React JSX escapes HTML characters automatically).
- No script executes.
- The rendered HTML contains `&lt;script&gt;` or similar escaped form — NOT raw `<script>` tags in the DOM.

## Notes

- The "—" pattern for null values is already established in `app/(dashboard)/page.tsx` (`event.computerName ?? "—"`) and `events/page.tsx` (`event.computerName || "—"`). The installs page must follow the same pattern for consistency.
- This scenario is holdout because the code-agent should handle null rendering naturally — we test this specific combination (Pending + all nullable fields null) because it's the most realistic production state for a newly generated, not-yet-activated key.
