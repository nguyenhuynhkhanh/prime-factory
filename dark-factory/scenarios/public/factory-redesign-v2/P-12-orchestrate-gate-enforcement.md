# Scenario: P-12 — df-orchestrate skill documents all 4 gates with max-round limits

## Type
feature

## Priority
critical — gates without explicit max-round limits can loop indefinitely and never escalate to BLOCKED.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` has been updated for this feature.
- `plugins/dark-factory/skills/df-orchestrate/SKILL.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/skills/df-orchestrate/SKILL.md` documents all 4 gates with their max-round limits:
- Gate 1 (ARCH_SPEC_REVIEW): max 5 rounds
- Gate 2 (ARCH_SCENARIO_REVIEW): max 3 rounds
- Gate 3 (ARCH_DRIFT_CHECK): max 2 rounds
- Gate 4 (TESTING): max 3 rounds

Also verify BLOCKED state is described as the outcome when any gate exceeds its max.

## Expected Outcome
- All 4 gates documented with correct max-round values.
- BLOCKED outcome documented.
- Same assertions pass on plugin mirror.

## Failure Mode (if applicable)
Wrong max-round value for any gate fails. Missing BLOCKED escalation description fails.
