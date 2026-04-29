# Scenario: P-11 — `--afk` flag is documented in df-orchestrate trigger section

## Type
feature

## Priority
high — FR-12. The `--afk` flag must be discoverable in the trigger section alongside other flags.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` updated for this feature.
- `plugins/dark-factory/skills/df-orchestrate/SKILL.md` mirrored.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `df-orchestrate/SKILL.md` contains:
1. `--afk` in the trigger/flag documentation section.
2. A description that mentions draft PR creation (e.g., "auto-PR", "gh pr create", "draft PR", or equivalent).

## Expected Outcome
- Both assertions pass: `--afk` is documented with a meaningful description.

## Failure Mode (if applicable)
"df-orchestrate SKILL.md should document --afk flag with PR creation description."

## Notes
The PR creation flow details (gh check, body-file, reviewer assignment) are in the implementation section of the skill file — tested in holdout scenarios H-07 through H-11.
