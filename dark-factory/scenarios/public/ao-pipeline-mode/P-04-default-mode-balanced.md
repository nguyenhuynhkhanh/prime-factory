# Scenario: P-04 — Default mode is `balanced` when `--mode` is omitted

## Type
feature

## Priority
critical — BR-2. The default must be explicitly documented. An undocumented default is an invisible contract that breaks when developers assume different behavior.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` updated for this feature.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `df-orchestrate/SKILL.md` explicitly states that the default mode is `balanced`. Acceptable forms include:
- `(default: balanced)`
- `default mode is balanced`
- `balanced` followed closely by `default` on the same or adjacent line

## Expected Outcome
- Assertion passes: the default value is unambiguously documented.

## Failure Mode (if applicable)
If the default is not documented: "df-orchestrate SKILL.md should document balanced as the default --mode value."

## Notes
FR-2 and BR-2 both depend on this. The execution plan must show "balanced (default)" when no flag is passed (FR-3), which is only testable at runtime — this scenario tests the documented intent.
