# Scenario: df-intake Step 5.5 advisor timeout → proceed + manifest flag

## Type
feature

## Priority
high — advisor must not block intake.

## Preconditions
- df-intake/SKILL.md edited.

## Action
Read df-intake/SKILL.md's Step 5.5 error-handling documentation.

## Expected Outcome
- On advisor `status: timeout` OR `status: error` OR no response within cap: proceed with original scenarios.
- Emit warning line: "Testability advisor unavailable — proceeding with original scenarios" (or equivalent).
- Set manifest flag `testAdvisoryCompleted: false` for this spec.
- Do NOT retry the advisor (one round max).

## Notes
Covers FR-25, EC-18. Ensures intake is always completable.
