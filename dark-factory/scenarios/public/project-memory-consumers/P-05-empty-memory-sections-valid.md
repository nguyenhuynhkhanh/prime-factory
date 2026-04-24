# Scenario: Spec with empty memory sections uses explicit "None" prose and is accepted as valid

## Type
feature

## Priority
medium — prevents silent omissions and documents absence

## Preconditions
- Memory registry is populated with some entries but none overlap with the feature's scope
- Developer requests a small feature with no new invariants or decisions
- spec-agent is drafting the spec

## Action
spec-agent drafts the spec. After scope analysis, no existing memory entry overlaps with this feature's scope, and the feature introduces no new cross-cutting rules.

## Expected Outcome
- The spec file STILL contains both `## Invariants` and `## Decisions` sections.
- Each subsection contains explicit prose stating the absence, e.g.:
  ```
  ## Invariants
  ### Preserves
  *None — this spec neither references nor introduces invariants.*

  ### References
  *None.*

  ### Introduces
  *None.*

  ### Modifies
  *None.*

  ### Supersedes
  *None.*
  ```
- The architect-agent round 1 does NOT emit a BLOCKER about empty sections.
- The architect-agent round 1 may emit an informational note ("Spec declares no invariant impact — verified against scope") but does not respawn on account of emptiness.

## Notes
Validates FR-5, BR-4, EC-1. The explicit "None — ..." prose is how the spec proves the author considered memory and found nothing applicable, rather than silently omitting the sections.
