# Scenario: Spec lists same invariant under both Modifies AND Supersedes — architect BLOCKS for ambiguity

## Type
edge-case

## Priority
medium — adversarial / author-confusion guard

## Preconditions
- Memory contains `INV-0080` (active)
- A spec declares, due to author confusion:
  - Under `## Invariants > Modifies`: `INV-0080 — narrowed scope to exclude X`
  - Under `## Invariants > Supersedes`: `INV-TBD-a supersedes INV-0080`
- The owning-domain architect-agent spawns

## Action
Architect's probe reads both subsections.

## Expected Outcome
- Architect emits BLOCKER under `### Memory Findings (<domain>)`:
  ```
  Modified (declared in spec): INV-0080 → BLOCKER (INV-0080 listed under both Modifies and Supersedes — clarify which is intended; an invariant cannot be both modified and replaced)
  ```
- Review Status: BLOCKED
- spec-agent respawn: author picks ONE subsection and removes from the other. Rationale is updated accordingly.
- Round 2 probe sees the invariant in only one subsection; BLOCKER clears.

## Notes
Validates EC-8. This is an adversarial author-confusion scenario that the architect must catch deterministically.
