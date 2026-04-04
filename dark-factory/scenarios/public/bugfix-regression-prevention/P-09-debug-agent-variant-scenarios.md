# Scenario: Debug-agent writes variant scenarios in both public and holdout

## Type
feature

## Priority
high — Variant scenarios are what make holdout validation catch narrow fixes

## Preconditions
- `.claude/agents/debug-agent.md` exists and contains the scenario writing section (Phase 6)

## Action
Read `.claude/agents/debug-agent.md` and inspect Phase 6 (Write Regression Scenarios).

## Expected Outcome
- The scenario writing section requires variant scenarios that exercise the same root cause through different paths
- Variants appear in BOTH public scenarios (so code-agent knows what to design for) AND holdout scenarios (for validation)
- The debug-agent has explicit discretion to write zero variants for trivially isolated bugs with written justification
- A maximum cap of 3-5 variant scenarios is stated
- The existing scenario writing structure is preserved (public for reproduction, holdout for edge cases)

## Notes
The split between public and holdout variants ensures the code-agent has visibility into expected variant coverage while holdout variants verify the implementation handles them.
