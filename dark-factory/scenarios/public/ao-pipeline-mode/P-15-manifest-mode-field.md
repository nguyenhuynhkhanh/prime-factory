# Scenario: P-15 — Manifest `mode` field is documented in implementation-agent

## Type
feature

## Priority
high — FR-20, BR-11. The manifest schema change must be explicitly documented to ensure promote-agent and df-cleanup remain compatible.

## Preconditions
- `.claude/agents/implementation-agent.md` updated for this feature.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `implementation-agent.md` explicitly documents writing the `"mode"` field into the manifest entry. Acceptable evidence:
- The agent file mentions `"mode"` in the context of manifest updates.
- The agent file states that mode is recorded at spec start (before architect review).

## Expected Outcome
- Assertion passes: manifest mode field recording is documented.

## Failure Mode (if applicable)
"implementation-agent.md should document writing the 'mode' field to the manifest entry."

## Notes
BR-11 specifies that mode is recorded at spec start even if the spec ultimately fails. H-12 (holdout) verifies the `bestOfN` field.
