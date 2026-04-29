# Scenario: findings file write failure in Step 0d stops the pipeline before code-agent spawn

## Type
failure-recovery

## Priority
high — if the write fails silently and the pipeline continues, code-agent gets empty findings when it expected real architect decisions. The developer has no visibility that architect decisions were lost.

## Preconditions
- `src/agents/implementation-agent.src.md` has been modified per this spec.

## Action
Read `src/agents/implementation-agent.src.md`. Inspect Step 0d for error handling around the findings file write operation.

## Expected Outcome
- Step 0d contains language about what happens if the findings file write fails (disk full, permission error, or equivalent).
- The specified behavior is: report the write error and STOP — do NOT proceed to Step 1.
- The language makes clear code-agent is never spawned if the findings file could not be written.

## Failure Mode
If Step 0d has no error handling for write failures, implementation-agent could proceed to Step 1 and spawn code-agent with an `architectFindingsPath` that points to a non-existent file (write failed silently), causing code-agent to operate without architect decisions.

## Notes
Validates EC-6, BR-3 (cannot satisfy ordering if write failed). The failure mode described in the Error Handling table must be present in the agent prose, not just in the spec.
