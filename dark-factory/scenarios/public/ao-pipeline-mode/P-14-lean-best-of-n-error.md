# Scenario: P-14 — `--mode lean --best-of-n` is documented as an error

## Type
feature

## Priority
high — BR-3, FR-19. Best-of-N is not a standalone flag. Its error handling must be documented to prevent confusion.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` updated for this feature.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `df-orchestrate/SKILL.md` documents the `--best-of-n` flag as invalid/not-existing, and directs users to `--mode quality` instead. Acceptable forms:
- "best-of-n is part of quality mode"
- "--best-of-n ... not a standalone flag"
- "use --mode quality" (in the context of best-of-n)

## Expected Outcome
- Assertion passes: the error path is explicitly documented.

## Failure Mode (if applicable)
"df-orchestrate SKILL.md should document that --best-of-n is not a standalone flag and direct users to --mode quality."

## Notes
The error message is: "Unknown flag '--best-of-n'. Best-of-N is automatically enabled in --mode quality for Tier 3 specs. Use --mode quality instead."
