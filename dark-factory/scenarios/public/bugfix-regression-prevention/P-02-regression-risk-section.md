# Scenario: Debug report template contains Regression Risk Assessment section

## Type
feature

## Priority
critical — Regression risk level drives variant test/scenario counts downstream

## Preconditions
- `.claude/agents/debug-agent.md` exists and contains the debug report template

## Action
Read `.claude/agents/debug-agent.md` and inspect the debug report template.

## Expected Outcome
- The debug report template contains a "Regression Risk Assessment" section
- The section includes: risk level (high/medium/low)
- The section includes: what future changes could reintroduce this bug with concrete code references
- The section includes: variant paths that exercise the same root cause
- The section includes: recommended regression coverage
- The section appears after "Systemic Analysis" and before "Proposed Fix"
- No existing sections are renamed or removed

## Notes
This section is the input that the code-agent and debug-agent use to determine how many variant tests/scenarios to write.
