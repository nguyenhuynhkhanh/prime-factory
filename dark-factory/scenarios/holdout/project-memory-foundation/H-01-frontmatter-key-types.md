# Scenario: Frontmatter key types and values validate strictly

## Type
edge-case

## Priority
high — string-vs-number confusion in frontmatter would break downstream parsing.

## Preconditions
- All three memory files exist with frontmatter.

## Action
Parse each memory file's frontmatter. Check the TYPE and value constraints of each required key:
- `version` MUST equal `1` (number or string `"1"` acceptable — parseFrontmatter returns strings).
- `lastUpdated` MUST be a non-empty string; format should look like an ISO date (matches `/^\d{4}-\d{2}-\d{2}/`).
- `generatedBy` MUST be a non-empty string from a known enum-ish set: `promote-agent`, `onboard-agent`, or `bootstrap` (skeleton ships with `bootstrap` since promote-agent hasn't touched it yet).
- `gitHash` MUST be a non-empty string (7 to 40 hex chars, or the literal token `TBD` for skeletons).

## Expected Outcome
- All three files satisfy the constraints above.
- If any file uses a different `generatedBy` value, it is flagged.

## Notes
Validates FR-2 at the value level. Public scenario P-03 only checks presence; this tightens the contract.
