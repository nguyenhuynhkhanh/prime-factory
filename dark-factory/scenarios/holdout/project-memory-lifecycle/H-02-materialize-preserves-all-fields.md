# Scenario: Materialization preserves ALL fields from spec declaration, even unusual ones

## Type
edge-case

## Priority
high — no field can be dropped during materialization.

## Preconditions
- Spec declares an `INV-TBD-x` with:
  - `enforcement: manual` (escape hatch, NOT enforced_by)
  - `guards: []` (empty list)
  - `scope.modules: [module-a, module-b, module-c, module-d]` (multi-element)
  - `rationale:` containing markdown (bullets, emphasis)
  - `referencedBy: []` (empty initially; would be populated by later specs via References)

## Action
promote-agent materializes the entry.

## Expected Outcome
- `enforcement: manual` is preserved (NOT silently replaced by `enforced_by: <some-test>`).
- `guards: []` is preserved verbatim.
- Multi-element `scope.modules` preserved as a list.
- Markdown in `rationale` is preserved (not flattened).
- `referencedBy: []` is preserved.
- The written entry round-trips through a YAML+markdown parser (no corruption).

## Notes
Adversarial — a naive materializer might substitute defaults for empty lists or collapse markdown. Test inputs a spec with these edges and asserts the written memory file round-trips cleanly.
