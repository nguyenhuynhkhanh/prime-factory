# Scenario: Code-agent writes 3-5 variant tests for HIGH regression risk bugs

## Type
feature

## Priority
high — HIGH risk is the most important tier; must have clear guidance

## Preconditions
- `.claude/agents/code-agent.md` exists with the updated Red Phase

## Action
Read `.claude/agents/code-agent.md` and inspect Step 1 for HIGH risk variant test guidance.

## Expected Outcome
- The Red Phase specifies that HIGH risk bugs require 3-5 variant tests
- The variant tests exercise the root cause through different paths (not just different inputs to the same path)
- The variant tests are in addition to the primary reproduction test
- The maximum cap of 3-5 is explicit

## Failure Mode
If HIGH risk guidance is missing or vague, the code-agent may write only 1-2 variants for a high-risk bug, leaving the regression surface under-tested.

## Notes
FR-10 specifies the tiers. The cap prevents variant explosion while ensuring meaningful coverage.
