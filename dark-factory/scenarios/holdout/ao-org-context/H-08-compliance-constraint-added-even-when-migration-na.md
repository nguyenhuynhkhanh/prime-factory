# Scenario: Compliance constraint from Org Context appears in Migration section even when migration is otherwise N/A

## Type
edge-case

## Priority
high — the specific edge case where a feature has no DB migration but still has a compliance constraint affecting deployment

## Preconditions
- `spec-agent.md` updated per this feature
- Project profile contains:
  ```markdown
  ## Org Context
  - **Open constraints**: all DB migrations require DBA review; PII must not leave EU region; HIPAA BAA in effect
  ```
- Developer asks spec-agent to write a spec for a feature that adds a new in-memory cache (no DB schema changes)

## Action
Spec-agent writes the spec. The spec has no database schema changes, so Migration & Deployment would normally be written as:
"N/A — no existing data affected."

But the Open constraints include "all DB migrations require DBA review" and "HIPAA BAA in effect."

## Expected Outcome
- Migration & Deployment section is NOT a bare "N/A — no existing data affected"
- Section includes at least one compliance note, e.g.:
  - "No DB migration required for this feature. Compliance note: HIPAA BAA is in effect — verify no PHI is stored in the new cache layer."
  - Or: "DBA review required before any DB changes per team constraint; no DB changes in this feature."
- The constraint note is proportional — it does not bloat the section, but it ensures compliance is addressed

## Failure Mode
If the spec-agent writes bare N/A without addressing the compliance constraint, the architect review would need to add it back. This defeats the purpose of having org context in the first place.

## Notes
EC-6, FR-8. This is the hardest behavioral edge case: the feature logic says "N/A" but org context says "but you still need to note X." The holdout status prevents the code-agent from trivially satisfying this.
