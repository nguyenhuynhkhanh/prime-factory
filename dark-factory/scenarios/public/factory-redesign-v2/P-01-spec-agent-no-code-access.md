# Scenario: P-01 — spec-agent instructions forbid codebase access

## Type
feature

## Priority
critical — role boundary. spec-agent reading code is the primary source of architect/spec domain bleed.

## Preconditions
- `.claude/agents/spec-agent.md` has been updated for this feature.
- `plugins/dark-factory/agents/spec-agent.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/spec-agent.md` contains a prohibition on codebase access. Look for one of: "no code access", "must not access the codebase", "does not read the codebase", "reads project-profile.md and Layer 0 intent only" — any phrasing that explicitly constrains the agent to project-profile and intent files.

## Expected Outcome
- Assertion passes: spec-agent file contains an explicit codebase-access prohibition.
- Same assertion passes on `plugins/dark-factory/agents/spec-agent.md`.
- Test run reports no failures in the factory-redesign-v2 block.

## Failure Mode (if applicable)
If the prohibition is absent or only implied, test fails with a message identifying the missing constraint. Implicit scope ("only reads what's provided") is not sufficient — the prohibition must be stated.
