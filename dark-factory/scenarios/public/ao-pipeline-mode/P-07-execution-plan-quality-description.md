# Scenario: P-07 — Execution plan includes one-line description for quality mode

## Type
feature

## Priority
high — FR-3. Same rationale as P-06 for the quality mode description.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` updated for this feature.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `df-orchestrate/SKILL.md` contains a description for `quality` mode that communicates its use case (e.g., "critical features", "pre-release", "complex migrations", "Maximum confidence", or equivalent intent).

## Expected Outcome
- Assertion passes: quality mode has a purpose description beyond just the word "quality".

## Failure Mode (if applicable)
"df-orchestrate SKILL.md should include a use-case description for quality mode in the execution plan."

## Notes
The quality description is also where Best-of-N is mentioned (EC-1 notes: "This spec is Tier 3 — running Best-of-N in quality mode"). That specific phrasing is tested in holdout scenario H-01.
