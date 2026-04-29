# Scenario: P-08 — df-orchestrate documents forwarding mode to implementation-agent

## Type
feature

## Priority
critical — FR-4. The mode flag is useless if it is parsed by df-orchestrate but never forwarded to the agent that controls model selection.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` updated for this feature.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `df-orchestrate/SKILL.md` explicitly documents passing the mode as a spawn parameter to implementation-agent. Acceptable evidence: the implementation-agent spawn section lists "mode" as one of the parameters passed.

## Expected Outcome
- Assertion passes: mode is listed in the parameters forwarded to implementation-agent spawn.

## Failure Mode (if applicable)
"df-orchestrate SKILL.md should document forwarding mode to implementation-agent spawn."

## Notes
The existing spawn parameter list in df-orchestrate is: "spec name, spec path, mode, branch name, skip-tests flag." Verify the updated list includes the pipeline mode.
