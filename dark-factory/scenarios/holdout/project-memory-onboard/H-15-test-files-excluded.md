# Scenario: H-15 — Test files are excluded from invariant extraction scan

## Type
edge-case

## Priority
high — EC-5. Test fixtures define invariants for test data, not production — extracting them would produce false positives.

## Preconditions
- Phase 3.7a is present.

## Action
Structural test asserts Phase 3.7a explicitly excludes:
- Files in `tests/` directory
- Files in `__tests__/` directory
- Files matching `*.test.*` (any extension)
- Files matching `*.spec.*` (any extension)
- Files in `cypress/`, `playwright/`, `e2e/` test directories (any subset of these is acceptable, but common test dirs must be named)
- Files in `fixtures/`, `mocks/`, `__mocks__/`

The exclusion list should appear as an explicit allow-block in Phase 3.7a.

## Expected Outcome
- All listed exclusions documented.
- The rationale is stated: test files define test-only invariants, not production domain invariants.

## Failure Mode (if applicable)
If any test location is missing from the exclusion list, test names it. If there is no exclusion list at all, test fails — without it, the agent would extract from test fixtures and pollute memory.

## Notes
This is a critical false-positive guardrail. Scanning `tests/` on Dark Factory itself would produce candidates like "the test runner must have a `feature` field" — not a real invariant.
