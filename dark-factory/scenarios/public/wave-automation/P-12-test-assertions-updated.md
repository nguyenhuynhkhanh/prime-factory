# Scenario: Test file assertions updated for autonomous behavior

## Type
feature

## Priority
high -- tests must pass after the changes

## Preconditions
- `tests/dark-factory-setup.test.js` has been updated

## Action
Read the updated test file. Verify new assertions exist and old assertions are updated.

## Expected Outcome
- New test assertions exist that verify:
  - The SKILL.md contains autonomous wave execution language (e.g., "autonomous", "auto-continue", or "automatically proceeds")
  - The SKILL.md does NOT contain inter-wave confirmation prompts (no "Ready to proceed with Wave" or equivalent blocking language between waves)
  - Wave agent spawning is described in SKILL.md
- Existing test assertions that may reference removed content (like smart re-run interactive prompts) are updated or removed
- All existing test sections (1-12) that are unrelated to the changes still pass (no regressions from content changes)

## Failure Mode
N/A -- content assertion on test file

## Notes
Validates AC-12. The test file uses `content.includes(...)` pattern -- new assertions should follow the same style.
