# Scenario: Test file contains assertions for all new required phrases

## Type
feature

## Priority
critical — Structural tests are the quality gate for agent definitions

## Preconditions
- `tests/dark-factory-setup.test.js` exists

## Action
Read `tests/dark-factory-setup.test.js` and inspect for new assertions covering this feature's additions.

## Expected Outcome
- Test assertions exist for debug-agent.md containing:
  - "Systemic Analysis" (or equivalent phrase for the new section)
  - "Regression Risk Assessment" (or equivalent phrase)
  - "deeper enabling pattern" or "Root Cause Depth" (or equivalent phrase for immediate vs deeper distinction)
  - Variant scenario requirements (e.g., "variant" in the context of scenarios)
- Test assertions exist for code-agent.md containing:
  - Root cause class targeting (e.g., "root cause" in the context of test targeting, not symptom)
  - Variant test coverage (e.g., "variant" in the context of tests)
- Test assertions exist for architect-agent.md containing:
  - Regression risk evaluation for bugfixes (e.g., "regression risk" in bugfix context)
- Test assertions exist for promote-agent.md containing:
  - Structured annotation requirements (e.g., "Root cause:" or "Guards:" or annotation-related phrases)
- Test assertions exist for df-debug SKILL.md containing:
  - Structured Investigator C output requirements (e.g., "Regression Risk" in Investigator C context)
  - Regression risk as synthesis dimension
- All new tests pass when run with `node --test tests/dark-factory-setup.test.js`

## Notes
Follow the existing test pattern: `content.includes("phrase")` assertions. New assertions should be grouped logically (new describe block or extension of existing suite).
