# Scenario: P-11 — df-orchestrate skill documents the state machine with all required states

## Type
feature

## Priority
critical — the state machine is the factory's coordination spine. Undocumented states become invisible and unenforced.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` has been updated for this feature.
- `plugins/dark-factory/skills/df-orchestrate/SKILL.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/skills/df-orchestrate/SKILL.md` contains all required states. Check for presence of each:
INTAKE, INTERVIEW, SPEC_DRAFT, ARCH_INVESTIGATE, ARCH_SPEC_REVIEW, SPEC_REVISION, QA_SCENARIO, QA_SELF_REVIEW, ARCH_SCENARIO_REVIEW, APPROVED, IMPLEMENTING, ARCH_DRIFT_CHECK, TESTING, PROMOTING, DONE, BLOCKED, STALE.

## Expected Outcome
- All 17 state names appear in the skill file.
- Same assertion passes on plugin mirror.

## Failure Mode (if applicable)
If any state is absent, test fails identifying the missing state by name. Partial state machine = partial coordination = silent gaps.
