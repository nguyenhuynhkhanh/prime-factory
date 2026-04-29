# Scenario: H-06 — status: failed without error field is treated as malformed

## Type
edge-case

## Priority
high — BR-2: `error` is REQUIRED when `status` is `failed` or `blocked`. Without it, the developer's final summary is missing actionable information. The malformed-result path must activate.

## Preconditions
- An implementation-agent emits a result without the required `error` field:
  ```json
  {
    "specName": "broken-feature",
    "status": "failed"
  }
  ```
- No `error` field is present

## Action
The wave agent attempts to include this result in its summary. The orchestrator processes the summary.

## Expected Outcome
- The orchestrator (or wave agent) detects the missing `error` field for a `failed` status
- A warning is logged: "Result for broken-feature: status is 'failed' but 'error' field is missing — treating as malformed"
- The result is treated equivalently to malformed JSON: `status: "failed"` with `error: "result-parse-error"`
- Transitive dependents of `broken-feature` are blocked
- The final summary shows: "broken-feature: failed (result-parse-error — missing error field)"

## Failure Mode
If the orchestrator accepts a `failed` result without an `error` field and displays nothing in the developer summary's "error" column, the developer has no information about why the spec failed or what to do next.

## Notes
BR-2: `error` required when `status` is `failed` or `blocked`. The test suite assertion checks that the SKILL.md describes the field requirements — this scenario validates the runtime enforcement of that contract. Analogously applies to `blocked` status.
