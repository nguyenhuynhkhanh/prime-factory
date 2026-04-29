# Scenario: P-02 — `--mode balanced` is a documented valid mode value

## Type
feature

## Priority
high — BR-1. All three mode values must be explicitly documented. Omitting any one would silently fail for users who try to use it.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` updated for this feature.
- `plugins/dark-factory/skills/df-orchestrate/SKILL.md` mirrored.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `df-orchestrate/SKILL.md` contains the string `balanced` as a mode value (e.g., in the trigger section or argument parsing section).

## Expected Outcome
- Assertion passes: `balanced` is present as a recognized mode value.
- The mode block or argument parsing section names all three modes: `lean`, `balanced`, `quality`.

## Failure Mode (if applicable)
If `balanced` is absent, the test fails with: "df-orchestrate SKILL.md should document 'balanced' as a valid mode value."

## Notes
BR-1 requires all three values to be explicitly listed. The test checks each individually to produce precise failure messages.
