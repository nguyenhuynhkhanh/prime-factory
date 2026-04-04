# Scenario: Architect BLOCK for symptom-only fix results in debug-agent re-spawn for deeper analysis

## Type
edge-case

## Priority
medium — Verifies the BLOCK has a recovery path, not just a stop

## Preconditions
- `.claude/agents/architect-agent.md` exists with the updated bugfix evaluation section

## Action
Read `.claude/agents/architect-agent.md` and inspect the bugfix evaluation section for what happens after a BLOCK due to symptom-only fix.

## Expected Outcome
- When the architect BLOCKs a bugfix for being symptom-level only:
  - The BLOCK status is recorded in the review file
  - The existing architect review process spawns the debug-agent for updates (this already exists in the architecture)
  - The debug-agent is expected to deepen the root cause analysis and update the proposed fix
- This follows the existing BLOCKED flow (architect spawns debug-agent with feedback)
- No new pipeline stages or special recovery mechanisms are added

## Failure Mode
If no recovery path is documented, a BLOCK for symptom-only fix becomes a dead end instead of a prompt for deeper investigation.

## Notes
EC-8 covers this case. The existing architect review process already handles BLOCKED status with re-spawn — this scenario verifies that the regression risk BLOCK reason integrates with that existing flow.
