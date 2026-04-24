# Scenario: code-agent prompt contains explicit constraint-awareness rule (information barrier)

## Type
feature

## Priority
critical — prevents holdout-leak via memory's enforced_by field

## Preconditions
- `.claude/agents/code-agent.md` has been updated per this spec
- Plugin mirror `plugins/dark-factory/agents/code-agent.md` has been updated to match

## Action
Inspect the code-agent prompt and verify that it contains an explicit information-barrier statement about memory and test inference.

## Expected Outcome
The code-agent prompt contains a passage substantively matching:
> Memory describes architectural constraints on your implementation; it does NOT enumerate what is tested. Do NOT use memory's `enforced_by` field to infer holdout scenarios or test coverage — that is a holdout leak and is forbidden.

- The statement appears in a visible location (General Patterns, Constraints, or an equivalent prominent section — not buried).
- The statement explicitly names `enforced_by` as the at-risk field.
- The plugin mirror contains byte-identical text.

## Notes
Validates FR-12, BR-5, AC-7. This is the HARD information barrier that makes direct memory reads safe for code-agent (DEC-TBD-b hinges on this). H-05 in the holdout suite verifies adversarial attempts to exploit `enforced_by`.
