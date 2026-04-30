# Scenario: P-08 — Plugin mirror parity for implementation-agent and test-agent

## Type
feature

## Priority
critical — Dark Factory has a mandatory dual-write requirement. Any change to an agent source must appear in both `.claude/agents/` and `plugins/dark-factory/agents/`. Forgetting one side causes test failures in the plugin mirror consistency suite and means distributed users get stale agent behavior.

## Preconditions
- `npm run build:agents` has been run after editing both source files.
- Both compiled outputs exist:
  - `.claude/agents/implementation-agent.md`
  - `.claude/agents/test-agent.md`
  - `plugins/dark-factory/agents/implementation-agent.md`
  - `plugins/dark-factory/agents/test-agent.md`

## Action
Run the full test suite:
```
node --test tests/
```
The `dark-factory-contracts.test.js` plugin mirror consistency suite must pass for both `implementation-agent` and `test-agent`.

## Expected Outcome
- Mirror consistency tests pass for `implementation-agent.md`.
- Mirror consistency tests pass for `test-agent.md`.
- Both compiled files contain the new tee + grep content (covered by P-01 and P-04 respectively).
- No differences between `.claude/agents/` and `plugins/dark-factory/agents/` for these two files.

## Failure Mode (if applicable)
If one side was updated but not the other, the mirror consistency test will fail with a diff showing the missing changes. The agent would be non-functional for distributed plugin users.

## Notes
The `dark-factory-contracts.test.js` file already has mirror parity tests for both agents. This scenario verifies those existing tests still pass after the new changes are added — no new mirror tests need to be written. The P-01 through P-07 scenarios add new assertions to `dark-factory-setup.test.js`; this scenario verifies the contract tests stay clean.
