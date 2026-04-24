# Scenario: df-cleanup handles Playwright not installed for E2E health check

## Type
failure-recovery

## Priority
high -- common scenario in projects that remove Playwright after initial setup

## Preconditions
- df-cleanup SKILL.md has been updated with E2E-aware partitioning
- promoted-tests.json contains an entry with E2E files

## Action
Read df-cleanup SKILL.md and verify it handles the case where Playwright is not available when running E2E health checks.

## Expected Outcome
- df-cleanup SKILL.md contains instructions for handling Playwright not being installed/available
- The instruction specifies reporting a specific error message (e.g., "PLAYWRIGHT_MISSING") rather than crashing
- df-cleanup continues checking other promoted tests after the Playwright failure
- Unit tests in the same or other entries are still checked normally

## Failure Mode
If df-cleanup does not handle missing Playwright, the entire health check aborts on the first E2E file, leaving all subsequent promoted tests unchecked.

## Notes
This is a production scenario: a project could have promoted E2E tests, then later removed Playwright from dependencies. The health check should report the issue without crashing.
