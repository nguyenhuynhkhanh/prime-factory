# Scenario: tests/dark-factory-setup.test.js asserts the lifecycle contract

## Type
feature

## Priority
critical — locks the contract.

## Preconditions
- `tests/dark-factory-setup.test.js` edited per this spec.

## Action
Run `node --test tests/dark-factory-setup.test.js` or read the added assertions.

## Expected Outcome
- New assertions exist for: promote-agent memory write process, ID assignment rules, Modifies/Supersedes/References handling, ledger append, gitSha commit-before documentation, legacy spec tolerance, sole-writer rule, test-agent mode parameter, Step 2.75 classification categories, structured output fields, advisor barriers, implementation-agent routing rules, hard-rule no-advisor-spawn, df-intake Step 5.5 structure, advisor timeout behavior, df-orchestrate regression-gate documentation, df-orchestrate pre-existing surfacing, df-cleanup memory health check categories, `--rebuild-memory` behavior.
- All new assertions pass.

## Notes
Covers FR-30. The assertions are string-matching against agent/skill content — no runtime integration tests.
