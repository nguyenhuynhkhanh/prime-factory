# Scenario: H-26 — Foundation template pre-seeds IDs; onboard starts at max+1

## Type
edge-case

## Priority
medium — EC-18, FR-17. Correct ID assignment is critical for downstream references.

## Preconditions
- Phase 3.7 / Phase 7 Memory Sign-Off documents ID assignment.

## Action
Structural test asserts the ID-assignment documentation:
1. Before writing, the agent scans each existing memory file (if present from foundation or prior run) for the highest `INV-NNNN` / `DEC-NNNN` / `FEAT-NNNN` numeric portion.
2. The first new entry gets max+1 (or 1 if none present).
3. This applies to BOTH bootstrap (where foundation may have pre-seeded example entries) AND refresh (where previous onboard entries exist).
4. IDs are sequential with zero-padding to 4 digits (`INV-0001`, `INV-0002`, ...).
5. IDs are NEVER reused, even if the developer rejects a candidate mid-sign-off — rejected candidates simply do not consume an ID in the final output; they held a `CANDIDATE-N` session ID that is discarded.

## Expected Outcome
- Max-scan rule documented.
- Zero-padding documented.
- ID non-reuse documented.
- Distinction between session-`CANDIDATE-N` IDs and permanent `NNNN` IDs is clear.

## Failure Mode (if applicable)
If ID collision on pre-seeded templates is not handled, test fails — it would produce duplicate IDs in the output.

## Notes
Foundation may seed `INV-0001` as a worked example showing the schema. Onboard must start at `INV-0002` in that case. Auto-detecting the max is the safest approach.
