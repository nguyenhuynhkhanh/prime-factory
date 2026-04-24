# Scenario: Spec supersedes INV-0005 but does not reference entries that referenced INV-0005 — architect flags SUGGESTION, not BLOCKER

## Type
edge-case

## Priority
medium — defines the cascade policy boundary

## Preconditions
- Memory contains:
  - `INV-0005` (active, the entry being superseded)
  - `INV-0012` which has `references: ["INV-0005"]` in its frontmatter (INV-0012's rule builds on INV-0005)
  - `DEC-0008` which also references INV-0005 in its rationale
- A spec declares `INV-TBD-a supersedes INV-0005` with proper rationale
- The spec does NOT mention INV-0012 or DEC-0008

## Action
The owning-domain architect-agent runs the probe.

## Expected Outcome
- The supersession of INV-0005 is VALIDATED (rationale present, candidate well-formed).
- The architect DOES NOT recursively mark INV-0012 and DEC-0008 as BLOCKERs.
- The architect MAY emit a SUGGESTION: `"INV-TBD-a supersedes INV-0005; INV-0012 and DEC-0008 reference INV-0005. Consider whether they also need review in a follow-up spec."`
- Review Status: APPROVED or APPROVED WITH NOTES, NOT BLOCKED on cascade grounds.
- The architect-agent prompt should contain language stating "No cascade enforcement — cascade handling is the author's responsibility; architect flags patterns as SUGGESTION only."

## Notes
Validates BR-8. For v1, cascade is NOT enforced. A full cascade verification would require dependency analysis across the entire registry, which is out of scope for this sub-spec (and arguably for the entire Project Memory feature).
