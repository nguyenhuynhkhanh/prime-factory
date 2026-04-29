# Scenario: H-05 — tierEscalation in result object is recorded; manifest updated correctly

## Type
edge-case

## Priority
medium — EC-5: if the orchestrator silently drops `tierEscalation` from the result, the manifest loses important audit information about which specs were escalated by the architect.

## Preconditions
- A spec `complex-feature` was classified as Tier 2 in the spec
- During architect review, the architect self-escalated from Tier 2 to Tier 3 (reading it as "architecture" cross-cutting)
- The implementation-agent emits:
  ```json
  {
    "specName": "complex-feature",
    "status": "passed",
    "promotedTestPath": "tests/complex-feature.test.js",
    "tierEscalation": {
      "from": 2,
      "to": 3,
      "reason": "Spec touches 5 shared agent files — escalated from Tier 2 to Tier 3 by architecture reviewer"
    }
  }
  ```

## Action
The orchestrator processes the result. It encounters the optional `tierEscalation` field.

## Expected Outcome
- The spec is promoted normally (`status: "passed"`)
- The manifest entry for `complex-feature` contains the `tierEscalation` object:
  ```json
  "tierEscalation": {
    "from": 2,
    "to": 3,
    "reason": "Spec touches 5 shared agent files — escalated from Tier 2 to Tier 3 by architecture reviewer"
  }
  ```
- The orchestrator does not validate or re-interpret the `tierEscalation` field — it records it as-is (EC-5: implementation-agent is the authority)
- The final summary does not include tier escalation details (they are in the manifest, not the summary)

## Failure Mode
If the orchestrator silently drops `tierEscalation`, the manifest shows only `"status": "promoted"` with no escalation record — the audit trail is lost.

## Notes
FR-9: `tierEscalation` in result must be recorded in the manifest. EC-5: orchestrator records without re-validation. The implementation-agent already records this in the manifest during its lifecycle; the JSON result schema formalizes the passthrough contract.
