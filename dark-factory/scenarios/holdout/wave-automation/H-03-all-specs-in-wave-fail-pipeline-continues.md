# Scenario: All specs in a wave fail -- pipeline continues to next wave for independent specs

## Type
edge-case

## Priority
high -- tests failure isolation when an entire wave is wiped out

## Preconditions
- SKILL.md has been updated with autonomous failure handling
- Consider a 3-wave group: Wave 1 [spec-a], Wave 2 [spec-b (depends on spec-a), spec-c (independent)], Wave 3 [spec-d (depends on spec-c)]

## Action
Read the failure handling and wave execution sections. Trace the logic when spec-a (Wave 1) fails.

## Expected Outcome
- spec-a fails in Wave 1
- The orchestrator computes transitive dependents: spec-b depends on spec-a, so spec-b is blocked
- Wave 2 has two specs: spec-b (blocked) and spec-c (independent, NOT blocked)
- The orchestrator spawns Wave 2 agent with ONLY spec-c (spec-b is filtered out)
- spec-c completes successfully
- Wave 3: spec-d depends on spec-c (which passed), so spec-d is executable
- The orchestrator spawns Wave 3 agent with spec-d
- Final summary shows: spec-a (failed), spec-b (blocked by spec-a), spec-c (passed), spec-d (passed)

## Failure Mode
N/A -- logic trace through SKILL.md content

## Notes
Validates FR-8, BR-2, EC-2, EC-3. This is the most complex failure scenario because it tests: whole-wave failure, mixed blocked/unblocked in next wave, and transitive dependency resolution across waves.
