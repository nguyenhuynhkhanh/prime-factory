# Scenario: Developer rejection during sign-off triggers revision cycle

## Type
feature

## Priority
high -- validates the sign-off is a real gate, not just a formality

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`
- The sign-off step is present (FR-3)

## Action
Read the onboard-agent file. Verify the sign-off step handles rejection (not just confirmation).

## Expected Outcome
- The sign-off step explicitly addresses what happens when the developer says "no" or provides corrections
- The agent must revise the profile based on the developer's feedback
- The agent must re-present the revised profile for another round of sign-off
- The constraint that the profile must NOT be written before confirmation is clear and applies to ALL rounds (not just the first)

## Failure Mode (if applicable)
If the sign-off only has a happy path ("developer confirms"), the agent might write the profile on any response that isn't a clear rejection.

## Notes
This tests BR-2 (sign-off is blocking). The process should be a loop: present -> confirm/reject -> if reject, revise -> present again.
