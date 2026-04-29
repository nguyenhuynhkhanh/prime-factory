# Scenario: P-13 — `--afk --skip-tests` combination is documented with a warning (not error)

## Type
feature

## Priority
medium — FR-18. The combination should warn but proceed. Documenting this explicitly prevents a future implementer from treating it as an error.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` updated for this feature.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `df-orchestrate/SKILL.md` describes the `--afk --skip-tests` combination and indicates it emits a warning (not an error). Acceptable phrases: "warn but don't error", "warning", "Warn (but don't error)", "warn but proceed".

## Expected Outcome
- Assertion passes: the combination is documented as a warning path.

## Failure Mode (if applicable)
"df-orchestrate SKILL.md should document --afk --skip-tests as a warning (not an error)."

## Notes
The actual warning text is: "Running with --skip-tests and --afk — PR will be created for an implementation that skipped pre-flight tests." This is tested in H-09 (holdout).
