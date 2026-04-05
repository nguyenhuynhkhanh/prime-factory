# Scenario: Wave agent crash with partial or no results

## Type
failure-recovery

## Priority
high -- agent crashes are a real production scenario

## Preconditions
- SKILL.md has been updated with wave agent result handling

## Action
Read the SKILL.md for how the orchestrator handles a wave agent that returns no result or a partial result.

## Expected Outcome
- If a wave agent fails to return any result (crash, timeout): ALL specs in that wave are treated as failed
- Transitive dependents of those specs are blocked in subsequent waves
- The orchestrator does NOT crash itself -- it handles the missing result gracefully
- If a wave agent returns partial results (some specs completed, others missing): completed specs are processed normally, missing specs are treated as failed
- The final summary includes the wave agent failure as an error with details

## Failure Mode
N/A -- content assertion

## Notes
Validates EC-5 and the "Wave agent crashes" error handling row. In practice, agent crashes manifest as missing or malformed return values. The orchestrator must be defensive.
