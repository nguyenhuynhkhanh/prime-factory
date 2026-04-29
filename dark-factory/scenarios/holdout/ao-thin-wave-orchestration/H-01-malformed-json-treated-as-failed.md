# Scenario: H-01 — Malformed or unparseable JSON result is treated as failed with result-parse-error

## Type
edge-case

## Priority
critical — this is the primary safety net; if malformed JSON causes an unhandled parse exception in the orchestrator, the entire pipeline crashes rather than degrading gracefully.

## Preconditions
- A wave contains three specs: `spec-a`, `spec-b`, `spec-c`
- `spec-a` returns a valid JSON result with `status: "passed"`
- `spec-b` returns malformed JSON (e.g., a prose paragraph, a JSON object missing the closing brace, or an empty string)
- `spec-c` returns a valid JSON result with `status: "passed"`
- `spec-d` depends on `spec-b` (in a later wave)

## Action
The wave agent attempts to aggregate results. It collects the result from `spec-b` but cannot parse it. The wave agent returns its per-wave summary. The orchestrator processes the summary.

## Expected Outcome
- `spec-a` is treated as `status: "passed"` — promoted normally
- `spec-b` is treated as `status: "failed"` with `error: "result-parse-error"` — NOT an unhandled exception
- `spec-c` is treated as `status: "passed"` — promoted normally
- `spec-d` is blocked by `spec-b`'s failure (transitive dependency rule applies)
- The final summary report shows `spec-b: failed (result-parse-error)` with an actionable next step
- The orchestrator continues normally after processing the malformed result — it does NOT halt for all specs

## Failure Mode
If the orchestrator throws an unhandled exception on `spec-b`'s malformed result, `spec-a` and `spec-c` are not promoted even though they succeeded. This is the worst-case failure mode — a bug in one spec crashes the entire wave.

## Notes
FR-5: malformed JSON treated as `failed` + `error: "result-parse-error"`. BR-1: `status` is the authoritative signal — the parse-error handler synthesizes a result object with `status: "failed"` rather than allowing the exception to propagate. The orchestrator must be able to handle this without developer intervention during the run.
