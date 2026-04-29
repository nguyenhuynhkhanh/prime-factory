# Scenario: H-03 — token-cap sentinel produces distinct actionable message, even with error field present

## Type
edge-case

## Priority
high — if `token-cap` is conflated with `failed`, the developer receives guidance to fix their code when the actual problem is resource exhaustion; EC-7 explicitly covers the case where an `error` field is also present.

## Preconditions
- A wave contains two specs: `big-feature` and `small-feature`
- `big-feature` implementation-agent hit token cap and emitted:
  ```json
  {
    "specName": "big-feature",
    "status": "token-cap",
    "error": "context window exhausted at code-agent round 2"
  }
  ```
- `small-feature` emitted `status: "passed"` normally
- `downstream-feature` depends on `big-feature`

## Action
The orchestrator processes the wave result. It encounters `big-feature`'s `status: "token-cap"`.

## Expected Outcome
- `small-feature` is promoted normally (independent of `big-feature`)
- `big-feature` is treated as failed for dependency purposes — `downstream-feature` is blocked
- The final summary for `big-feature` reads:
  "big-feature: token-cap — Re-run with `--mode lean` or split the spec."
  NOT: "big-feature: failed — Fix the implementation and retry."
- The `error` field value ("context window exhausted at code-agent round 2") is logged but does NOT override the token-cap display message (BR-7 + EC-7)
- The developer's next-step guidance is specific to resource exhaustion, not to code logic failure

## Failure Mode
If the orchestrator displays the generic "failed" message for `token-cap` specs, the developer spends time trying to fix code that is not broken — the spec just needs to be split or run in a cheaper mode.

## Notes
FR-7: `token-cap` as distinguishable sentinel. BR-7: token-cap produces a distinct message. EC-7: `token-cap` with `error` field present — `error` is logged but token-cap message takes precedence.
