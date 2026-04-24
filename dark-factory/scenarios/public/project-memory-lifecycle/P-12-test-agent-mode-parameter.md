# Scenario: test-agent.md documents the `mode` input parameter

## Type
feature

## Priority
critical — mode parameter is the switch between validator and advisor.

## Preconditions
- `.claude/agents/test-agent.md` edited per this spec.

## Action
Read test-agent.md's Inputs section.

## Expected Outcome
- `mode` is listed as an input parameter with enum values `validator` and `advisor`.
- Default value is documented as `validator` (preserves existing caller behavior).
- test-agent.md documents validating the mode at process start.
- test-agent.md documents refusing to proceed if the mode is missing, misspelled, or ambiguous (both provided).

## Notes
Covers FR-12, FR-19. Mode validation at start is the enforcement mechanism for mode isolation.
