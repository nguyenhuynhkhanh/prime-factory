# Scenario: Architect reports orphaned invariant as SUGGESTION, not BLOCKER

## Type
feature

## Priority
high — orphan policy is explicit to avoid false blockers

## Preconditions
- Memory contains `INV-0009` (`scope.modules: ["src/legacy/foo.js"]`, `status: active`, domain: architecture)
- The file `src/legacy/foo.js` has been deleted from the codebase (not present on disk)
- A new spec is under review that does NOT touch `src/legacy/*`
- The architecture-domain architect-agent runs the probe

## Action
Architecture-domain architect-agent performs the memory probe. It finds `INV-0009` is active but all its `scope.modules` refer to a file that no longer exists.

## Expected Outcome
- `dark-factory/specs/features/{name}.review-architecture.md` contains under `### Memory Findings (Architecture)`:
  ```
  Orphaned (SUGGESTION only): INV-0009 — referenced entity src/legacy/foo.js removed; consider retiring in a future spec
  ```
- The review does NOT report `INV-0009` as a BLOCKER.
- The review does NOT report `INV-0009` under `Potentially violated`.
- The review Status MAY still be `APPROVED` or `APPROVED WITH NOTES` — orphan detection alone never forces BLOCKED.

## Notes
Validates FR-9, EC-4, AC-4. The SUGGESTION is informational; the actual retirement would be handled in a future spec (out of scope for this sub-spec).
