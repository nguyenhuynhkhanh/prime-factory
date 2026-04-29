# Scenario: P-09 — Model selection table is documented in implementation-agent

## Type
feature

## Priority
critical — FR-5. The model selection table is the heart of this feature. If it is absent or incorrect in implementation-agent, the flag has no effect on what models get used.

## Preconditions
- `.claude/agents/implementation-agent.md` updated for this feature.
- `plugins/dark-factory/agents/implementation-agent.md` mirrored.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `implementation-agent.md` contains the model selection table mapping. Specifically:
1. The agent file mentions `claude-sonnet` as the model for code-agents in lean mode (or Tier 1/2 in balanced mode).
2. The agent file mentions `claude-opus` as the model for code-agents in quality mode (or Tier 3 in balanced mode).
3. No version suffixes appear on the model IDs (i.e., `claude-opus-` followed by digits must NOT be present, and `claude-sonnet-` followed by digits must NOT be present).

## Expected Outcome
- All three assertions pass: both model IDs present without version suffixes.

## Failure Mode (if applicable)
If version suffix detected: "implementation-agent.md should use model IDs without version suffixes (found 'claude-opus-X.X' or 'claude-sonnet-X.X')."

## Notes
NFR-2 makes the no-version-suffix rule explicit. This scenario is the primary enforcement test for that rule.
