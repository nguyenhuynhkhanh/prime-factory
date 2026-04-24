# Scenario: P-13 — Plugin mirror parity for all Phase 3.7 and related content

## Type
feature

## Priority
critical — FR-21. Mirror drift is one of the top failure modes for Dark Factory.

## Preconditions
- `.claude/agents/onboard-agent.md` and `plugins/dark-factory/agents/onboard-agent.md` have both been updated.

## Action
Contract test (in `tests/dark-factory-contracts.test.js`) asserts:
1. Byte-for-byte equality between `.claude/agents/onboard-agent.md` and `plugins/dark-factory/agents/onboard-agent.md` (this likely already exists as a generic mirror assertion — verify it still passes).
2. Additionally, a phrase-level assertion: both files contain `Phase 3.7: Memory Extraction`, `3.7a Invariants Extraction`, `3.7b Decisions Seeding`, `3.7c Ledger Retro-Backfill`, and `Bootstrap Write Exception`.

## Expected Outcome
- Byte equality holds.
- All required phrases present in both files.

## Failure Mode (if applicable)
On drift, the test must print the file path AND the first differing line. On missing phrases, the test must name which phrase is missing from which file.

## Notes
The generic mirror test already compares all agent files. The new phrase-level assertion is defensive coverage against subtle Unicode/whitespace drift that byte-equality might hide (unlikely but cheap to guard).
