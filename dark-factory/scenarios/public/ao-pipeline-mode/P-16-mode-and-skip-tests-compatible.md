# Scenario: P-16 — `--mode` and `--skip-tests` are compatible flags

## Type
feature

## Priority
medium — EC-11. These two flags operate on different axes (model selection vs. test gate). Their compatibility should be explicitly documented to prevent incorrect mutual-exclusivity checks being added later.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` updated for this feature.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `df-orchestrate/SKILL.md` does NOT list `--mode` and `--skip-tests` as mutually exclusive in its mutual-exclusivity checks section. (Verify the mutual-exclusivity block only covers `--group`/`--all` and `--best-of-n` conflicts, not `--mode`/`--skip-tests`.)

## Expected Outcome
- Assertion passes: no mutual-exclusivity error is specified for the `--mode` + `--skip-tests` combination.

## Failure Mode (if applicable)
"df-orchestrate SKILL.md should not treat --mode and --skip-tests as mutually exclusive."

## Notes
EC-11: `--mode` affects model selection and Best-of-N trigger; `--skip-tests` affects only the pre-flight test gate. They are orthogonal and valid in combination.
