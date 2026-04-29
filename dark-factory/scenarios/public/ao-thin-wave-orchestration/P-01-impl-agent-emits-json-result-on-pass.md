# Scenario: P-01 — Implementation-agent emits structured JSON result after successful promotion

## Type
feature

## Priority
critical — the structured JSON result emit is the foundation of the entire wave coordination contract; without it, wave agents cannot aggregate results and the orchestrator cannot make routing decisions.

## Preconditions
- `src/agents/implementation-agent.src.md` has been updated to add a result emit step
- A spec named `my-feature` has been processed: architect approved, code-agent passed, test-agent passed, promote-agent promoted, cleanup completed
- `promotedTestPath` is known from the promote step (e.g., `tests/my-feature.test.js`)

## Action
The implementation-agent completes its lifecycle for `my-feature` (feature mode). Inspect the structured result emitted at the end of the lifecycle (Step 6 or final step).

## Expected Outcome
The emitted result conforms to the schema:
```json
{
  "specName": "my-feature",
  "status": "passed",
  "promotedTestPath": "tests/my-feature.test.js"
}
```
- `specName` matches the spec identifier
- `status` is `"passed"`
- `promotedTestPath` is present and non-empty
- `error` field is absent (not emitted for `passed` status)
- `tierEscalation` field is absent (architect did not self-escalate in this scenario)

## Failure Mode
If the implementation-agent completes cleanup but does not emit a JSON result, the wave agent has no artifact to aggregate, causing the orchestrator to treat the spec as crashed.

## Notes
This scenario validates FR-1 and EC-8 (emit happens after cleanup, so `promotedTestPath` is final). The test suite assertion checks that implementation-agent.md contains result emit language — this scenario verifies the runtime behavior implied by that language.
