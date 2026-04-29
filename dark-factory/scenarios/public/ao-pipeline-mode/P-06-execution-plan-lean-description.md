# Scenario: P-06 — Execution plan includes one-line description for lean mode

## Type
feature

## Priority
high — FR-3. Each mode's one-line description helps the developer make an informed choice. Without it, the mode name alone is not self-explanatory.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` updated for this feature.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `df-orchestrate/SKILL.md` contains a description for `lean` mode that communicates its use case (e.g., "rapid iteration", "prototyping", "low-risk changes", "Fast and cheap", or equivalent intent).

## Expected Outcome
- Assertion passes: lean mode has a purpose description beyond just the word "lean".

## Failure Mode (if applicable)
"df-orchestrate SKILL.md should include a use-case description for lean mode in the execution plan."

## Notes
All three modes need descriptions (lean/balanced/quality). Separate scenarios (P-06, P-07) isolate failures. `quality` mode description is checked in P-07.
