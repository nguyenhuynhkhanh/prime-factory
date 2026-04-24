# Scenario: advisor mode reads expected inputs and surfaces dedup findings

## Type
feature

## Priority
high — advisor's primary value-add is dedup detection.

## Preconditions
- test-agent.md edited with advisor-mode section.
- spec-agent spawns test-agent in advisor mode (via df-intake Step 5.5).

## Action
Read test-agent.md's advisor-mode section.

## Expected Outcome
- Advisor-mode inputs documented: spec draft file, draft public + holdout scenario files, `dark-factory/promoted-tests.json`, the three memory files.
- Advisor-mode process documented: reads all inputs; returns structured advisory.
- Advisor surfaces `dedup: [{ scenario: <path>, matchedFeature: <feat-name>, matchedPath: <promoted-test-path> }]` when a draft scenario duplicates behavior already covered by an existing promoted test.
- Advisor prohibitions documented: NO writes, NO test execution, NO scenario edits, NO spec edits, NO re-investigation.

## Notes
Covers FR-16, EC-13. Dedup is the primary productivity win — prevents redundant scenarios that the full-suite gate already covers.
