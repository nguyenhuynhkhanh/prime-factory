# Scenario: P-03 — `--mode quality` is a documented valid mode value

## Type
feature

## Priority
high — BR-1. Same rationale as P-02 for the `quality` value.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` updated for this feature.
- `plugins/dark-factory/skills/df-orchestrate/SKILL.md` mirrored.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `df-orchestrate/SKILL.md` contains the string `quality` as a mode value.

## Expected Outcome
- Assertion passes: `quality` is present as a recognized mode value.

## Failure Mode (if applicable)
If `quality` is absent: "df-orchestrate SKILL.md should document 'quality' as a valid mode value."

## Notes
FR-1 covers all three mode values. Three separate test assertions (P-01, P-02, P-03) produce targeted failure messages rather than a single combined check.
