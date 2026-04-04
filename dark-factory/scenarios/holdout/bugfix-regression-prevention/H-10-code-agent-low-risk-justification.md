# Scenario: Code-agent requires explicit justification when writing zero variants for LOW risk bugs

## Type
edge-case

## Priority
medium — LOW risk is the common case; must have a clear justification requirement

## Preconditions
- `.claude/agents/code-agent.md` exists with the updated Red Phase

## Action
Read `.claude/agents/code-agent.md` and inspect Step 1 for LOW risk variant test guidance.

## Expected Outcome
- The Red Phase specifies that LOW risk bugs require just the reproduction case
- An explicit written justification is required when writing zero variant tests
- The justification is part of the code-agent's output/report, not a separate document

## Failure Mode
If no justification is required, the code-agent may default to zero variants for all bugs regardless of actual risk, defeating the purpose of the variant system.

## Notes
FR-10 specifies "LOW risk = just the reproduction case with explicit written justification for no variants."
