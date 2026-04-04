# Scenario: Code-agent Red Phase requires variant tests proportional to regression risk

## Type
feature

## Priority
high — Variant tests are what catch reintroduction through non-obvious paths

## Preconditions
- `.claude/agents/code-agent.md` exists and contains the Bugfix Mode Red Phase (Step 1)

## Action
Read `.claude/agents/code-agent.md` and inspect Step 1 (PROVE THE BUG / Red Phase).

## Expected Outcome
- The Red Phase includes variant test coverage proportional to the regression risk level from the debug report:
  - HIGH risk: 3-5 variant tests exercising the root cause through different paths
  - MEDIUM risk: 1-2 variants
  - LOW risk: just the reproduction case with explicit written justification for no variants
- A maximum cap of 3-5 variant tests per bugfix is stated
- The variant test requirement does NOT override the existing Red Phase constraints (no source code changes, etc.)

## Notes
The variant count guidance uses the Regression Risk Assessment from the debug report as input. If the debug report has no risk level, the code-agent defaults to LOW (reproduction only).
