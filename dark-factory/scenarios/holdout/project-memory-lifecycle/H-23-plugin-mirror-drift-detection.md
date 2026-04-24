# Scenario: Contract test detects any edited file's plugin mirror drift

## Type
regression

## Priority
critical — plugin distribution contract.

## Preconditions
- `.claude/agents/test-agent.md` has been edited with the new mode parameter.
- `plugins/dark-factory/agents/test-agent.md` has NOT been updated (simulated drift).

## Action
`node --test tests/dark-factory-contracts.test.js` runs.

## Expected Outcome
- Mirror parity test for `test-agent.md` FAILS with a clear diff-style error.
- Error message names both the source and mirror paths.
- Similarly, drift in any of the other 5 edited files (promote-agent, implementation-agent, df-intake, df-orchestrate, df-cleanup) is detected.
- The 6 mirror-parity tests are independent — one failing does not mask others.

## Notes
Covers FR-31, EC-23. The contract test is the enforcement mechanism for the dual-write requirement.
