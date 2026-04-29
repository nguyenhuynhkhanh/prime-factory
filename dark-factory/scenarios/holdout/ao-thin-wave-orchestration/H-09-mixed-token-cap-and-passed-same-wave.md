# Scenario: H-09 — Wave with mixed token-cap and passed results; each is handled independently

## Type
edge-case

## Priority
medium — EC-3: the orchestrator must not let a token-cap result in one spec prevent normal promotion of passed specs in the same wave.

## Preconditions
- A wave contains three specs: `big-spec` (token-cap), `medium-spec` (passed), `small-spec` (passed)
- Wave result array:
  ```json
  [
    {
      "specName": "big-spec",
      "status": "token-cap"
    },
    {
      "specName": "medium-spec",
      "status": "passed",
      "promotedTestPath": "tests/medium-spec.test.js"
    },
    {
      "specName": "small-spec",
      "status": "passed",
      "promotedTestPath": "tests/small-spec.test.js"
    }
  ]
  ```
- `downstream-spec` depends on `big-spec`

## Action
The orchestrator processes all three results.

## Expected Outcome
- `medium-spec` is promoted: `promotedTestPath` is recorded, final summary shows passed
- `small-spec` is promoted: `promotedTestPath` is recorded, final summary shows passed
- `big-spec` is treated as failed for dependency purposes: `downstream-spec` is blocked
- The final summary shows:
  - "medium-spec: passed (tests: tests/medium-spec.test.js)"
  - "small-spec: passed (tests: tests/small-spec.test.js)"
  - "big-spec: token-cap — Re-run with `--mode lean` or split the spec."
  - "downstream-spec: blocked by big-spec"
- The token-cap for `big-spec` does NOT prevent the promotion of `medium-spec` and `small-spec`

## Failure Mode
If the orchestrator aborts the entire wave processing on encountering `status: "token-cap"`, the two passed specs are never promoted even though they succeeded.

## Notes
EC-3: mixed token-cap and passed in the same wave. FR-8: collect all results before computing blocking. The token-cap handling runs after all results are processed, not as an early exit.
