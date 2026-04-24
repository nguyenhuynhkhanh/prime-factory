# Scenario: Architect spawned without domain parameter runs unified probe (backward-compat with single-reviewer mode)

## Type
edge-case

## Priority
medium — preserves legacy single-reviewer spawn path

## Preconditions
- Memory contains active entries across all three domains
- Architect-agent is spawned WITHOUT a `domain` parameter (e.g., by a legacy caller or a manual invocation)
- A spec is under review

## Action
The architect runs a unified review, covering all three domains in a single pass.

## Expected Outcome
- Architect produces `dark-factory/specs/features/{name}.review.md` (the unified file, not the three domain-split files).
- Inside the unified review, the Memory Findings section is grouped per-domain:
  ```
  ## Memory Findings

  ### Security
  - Preserved: INV-0002
  - Potentially violated (BLOCKER): INV-0005 — ...

  ### Architecture
  - Preserved: INV-0004
  - Orphaned (SUGGESTION only): INV-0021

  ### API
  - Preserved: INV-0006
  - New candidates declared: DEC-TBD-a (reviewed: fields complete)
  ```
- BLOCKER rules still apply (same thresholds).
- Review Status uses the same state machine (APPROVED / APPROVED WITH NOTES / BLOCKED).

## Notes
Validates EC-13. The parallel and unified modes produce equivalent coverage; only the file layout differs.
