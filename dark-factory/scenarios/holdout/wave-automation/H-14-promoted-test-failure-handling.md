# Scenario: Promoted test failure stops that spec but continues others

## Type
edge-case

## Priority
high -- promoted test failure is a distinct failure type from implementation failure

## Preconditions
- SKILL.md has been updated with failure semantics

## Action
Read the updated SKILL.md for how promoted test failures are handled.

## Expected Outcome
- If a promoted test fails (Step 4 in the lifecycle): that specific spec is stopped (does NOT proceed to cleanup), but other specs in the same wave continue
- The spec remains at "passed" status in the manifest (not promoted, not cleaned up)
- The failure is reported in the final summary with actionable next steps
- This is distinct from: implementation failure (3 rounds exhausted) and architect block -- both of which block dependents. A promoted test failure occurs AFTER the spec has been implemented and validated, so dependents may have already started.

## Failure Mode
N/A -- content assertion

## Notes
Validates the "Promoted test failure" row in FR-8. This is a subtle case because the spec already passed holdout validation -- the failure happens during the promotion step. Dependents are NOT blocked because the code changes already merged successfully.
