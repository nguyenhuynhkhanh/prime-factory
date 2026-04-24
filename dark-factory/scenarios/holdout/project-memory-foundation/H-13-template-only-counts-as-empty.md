# Scenario: Memory file with only a TEMPLATE entry is valid-but-empty in downstream parsing semantics

## Type
edge-case

## Priority
high — the greenfield state (just-onboarded, no real entries yet) must be indistinguishable from "zero real entries". If TEMPLATE entries are counted as real, every new project starts with 3 fake invariants.

## Preconditions
- All three memory files exist, each containing exactly one TEMPLATE entry and no `INV-NNNN` / `DEC-NNNN` / `FEAT-NNNN` entries.

## Action
For each memory file, count entries using the regex contract from H-02, then separate them into two buckets:
- "Real entries": `## (INV|DEC|FEAT)-\d{4}: <title>`
- "Placeholder entries": `## (INV|DEC|FEAT)-TEMPLATE: <title>` and `## (INV|DEC|FEAT)-TBD-...: <title>`

## Expected Outcome
- Every file has 0 "real entries" and exactly 1 "placeholder entry" (the TEMPLATE).
- The template file `project-memory-template.md` documents this separation: TEMPLATE and TBD entries are schema examples / spec-phase placeholders, not real memory, and downstream parsers must exclude them from "real entry" counts.

## Notes
Validates EC-3. This contract is what lets `project-memory-consumers` compute "is this invariant referenced by any spec?" without being tricked by the TEMPLATE.
