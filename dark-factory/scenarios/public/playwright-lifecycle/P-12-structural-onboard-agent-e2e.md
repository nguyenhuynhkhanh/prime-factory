# Scenario: Structural tests verify onboard-agent E2E test type detection

## Type
feature

## Priority
medium -- ensures onboard-agent documents E2E capabilities in project profile

## Preconditions
- `tests/dark-factory-setup.test.js` exists
- onboard-agent.md mentions E2E test type detection

## Action
Run `node --test tests/dark-factory-setup.test.js` and verify onboard-agent structural test passes.

## Expected Outcome
- At least 1 test assertion verifies onboard-agent mentions E2E or Playwright in the testing detection section
- The assertion checks for "e2e" or "E2E" in the onboard-agent content

## Notes
The onboard-agent currently mentions "e2e?" in test type detection. This test guards that reference. The playwright-onboard spec will expand this significantly; this test covers the baseline.
