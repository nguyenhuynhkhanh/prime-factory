# Scenario: P-03 — Wave agent collects per-spec JSON results and returns per-wave JSON summary

## Type
feature

## Priority
critical — the wave aggregation step is the bridge between implementation-agents and the orchestrator; if it returns prose or a non-array structure, the orchestrator cannot parse it.

## Preconditions
- A wave contains two specs: `spec-alpha` and `spec-beta`
- Both implementation-agents have completed their lifecycles
- `spec-alpha` succeeded with `promotedTestPath: "tests/spec-alpha.test.js"`
- `spec-beta` failed with `error: "architect-blocked"`

## Action
The wave agent collects results from both implementation-agents and returns its per-wave summary to the orchestrator.

## Expected Outcome
The wave agent returns a JSON array:
```json
[
  {
    "specName": "spec-alpha",
    "status": "passed",
    "promotedTestPath": "tests/spec-alpha.test.js"
  },
  {
    "specName": "spec-beta",
    "status": "failed",
    "error": "architect-blocked"
  }
]
```
- The return value is a JSON array (not prose, not a nested object, not a numbered list)
- Each element corresponds to exactly one spec in the wave
- No spec file contents, scenario text, or narrative summaries are present in the return value
- The array has exactly 2 elements (one per spec in the wave)

## Failure Mode
If the wave agent returns a prose narrative ("spec-alpha passed successfully; spec-beta was blocked by the architect because..."), the orchestrator cannot parse it and must treat all specs as failed.

## Notes
FR-2: wave agent aggregates per-spec JSON results into a per-wave JSON summary. BR-4: wave agents must not pass spec prose/scenario text to the orchestrator. EC-1: a wave with a single spec returns a single-element array — not a bare object.
