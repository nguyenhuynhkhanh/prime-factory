# Scenario: Existing promoted-tests.json entries without testType work correctly

## Type
edge-case

## Priority
critical -- backward compatibility must not break

## Preconditions
- `dark-factory/promoted-tests.json` contains the two existing entries (`adaptive-lead-count`, `token-measurement`)
- Neither entry's files array contains a `testType` field
- df-cleanup SKILL.md has been updated with E2E-aware partitioning

## Action
Read df-cleanup SKILL.md and verify it explicitly handles the case where `testType` is absent from file entries.

## Expected Outcome
- df-cleanup SKILL.md contains explicit text about defaulting to `"unit"` when `testType` is missing
- The default behavior means existing entries are treated as unit tests
- No error, warning, or skip for entries without `testType`

## Failure Mode
If df-cleanup does not default missing testType, existing promoted tests would be skipped or error during health check, breaking the cleanup pipeline for all previously promoted features.

## Notes
This tests the actual content of the skill file, not runtime behavior. The existing two entries in promoted-tests.json are the real-world test case for this backward compatibility requirement.
