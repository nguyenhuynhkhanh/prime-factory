# Scenario: H-12 — Manifest `bestOfN` object is written with correct fields after Best-of-N runs

## Type
feature

## Priority
high — FR-21. The `bestOfN` manifest field is the audit trail for Best-of-N decisions. Incorrect field values make post-run diagnostics misleading.

## Preconditions
- `--mode quality` flag, Tier 3 spec.
- Best-of-N ran and completed (either outcome).

## Action
Structural test verifies that `implementation-agent.md` documents the `bestOfN` manifest schema:
1. The object contains a `winner` field with value `"track-a"` or `"track-b"`.
2. The object contains a `loserResult` field with value `"failed-holdout"` or `"both-passed"`.
3. The `bestOfN` object is only written when Best-of-N actually ran (not for Tier 1/2 specs in quality mode, and not for non-quality mode runs).
4. When both tracks fail and Round 2 is entered, `bestOfN` is omitted from the manifest until Round 2 completes (or is superseded).

## Expected Outcome
- All four assertions pass: correct field names, correct value set, conditional write condition, omission during retry documented.

## Failure Mode (if applicable)
"implementation-agent.md should document bestOfN manifest fields: winner (track-a|track-b) and loserResult (failed-holdout|both-passed)."

## Notes
The `mode` field (FR-20) is verified separately in P-15. This scenario focuses on the `bestOfN` sub-object (FR-21).
