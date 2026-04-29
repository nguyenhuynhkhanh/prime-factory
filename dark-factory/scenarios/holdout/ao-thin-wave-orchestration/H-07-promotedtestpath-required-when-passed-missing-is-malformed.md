# Scenario: H-07 — status: passed without promotedTestPath is treated as malformed

## Type
edge-case

## Priority
high — BR-3: `promotedTestPath` is REQUIRED when `status` is `passed`. Without it, the final summary cannot link to the promoted tests, and the orchestrator cannot verify the promotion completed.

## Preconditions
- An implementation-agent emits a result without the required `promotedTestPath` field:
  ```json
  {
    "specName": "incomplete-feature",
    "status": "passed"
  }
  ```
- No `promotedTestPath` field is present

## Action
The wave agent includes this result in its summary. The orchestrator processes the summary.

## Expected Outcome
- The orchestrator detects the missing `promotedTestPath` field for a `passed` status
- A warning is logged: "Result for incomplete-feature: status is 'passed' but 'promotedTestPath' field is missing — treating as malformed"
- The result is treated as malformed: effectively `status: "failed"` with `error: "result-parse-error"`
- The final summary shows `incomplete-feature` as failed, not passed
- The developer is NOT told "incomplete-feature: passed (tests: [missing])" — that would be a silent data loss

## Failure Mode
If the orchestrator silently accepts a `passed` result without `promotedTestPath` and reports it as passed, the developer believes the spec was promoted and the promoted tests path is somewhere — but it is not. The next `df-cleanup` run may surface a health-check failure for a spec that was never actually promoted.

## Notes
BR-3: `promotedTestPath` required when `status` is `passed`. Error handling table row: "status: 'passed' but promotedTestPath missing → treat as malformed → report as failed + result-parse-error". This scenario is the counterpart to H-06 (which covers the `failed`/`blocked` + missing `error` case).
