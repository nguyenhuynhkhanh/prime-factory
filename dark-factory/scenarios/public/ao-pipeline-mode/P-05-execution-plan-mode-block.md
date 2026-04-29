# Scenario: P-05 — Execution plan mode block is documented in df-orchestrate

## Type
feature

## Priority
critical — FR-3. The execution plan is the developer's only window into what the pipeline will do before they confirm. A missing or incorrect mode block causes uninformed consent.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` updated for this feature.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `df-orchestrate/SKILL.md` describes the execution plan mode display. Specifically:
1. The skill file contains text describing the mode display format (e.g., "Mode:" label in the execution plan).
2. The skill file describes that model mapping is shown (e.g., "Sonnet" or "Opus" with tier association).
3. The skill file states that the mode block appears BEFORE the developer confirmation prompt.

## Expected Outcome
- All three assertions pass: mode label documented, model mapping documented, placement before confirmation documented.

## Failure Mode (if applicable)
If any assertion fails, the test identifies which element is missing (mode label, model mapping, or placement timing).

## Notes
NFR-1 limits the mode display to under 4 lines. This is checked by H-19 (holdout). This scenario checks structural documentation only.
