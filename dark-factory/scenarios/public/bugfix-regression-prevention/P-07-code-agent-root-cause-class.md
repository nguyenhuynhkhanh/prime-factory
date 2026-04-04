# Scenario: Code-agent Red Phase requires root-cause-class test targeting

## Type
feature

## Priority
critical — This is what makes tests catch reintroduction through different paths

## Preconditions
- `.claude/agents/code-agent.md` exists and contains the Bugfix Mode Red Phase (Step 1)

## Action
Read `.claude/agents/code-agent.md` and inspect Step 1 (PROVE THE BUG / Red Phase).

## Expected Outcome
- The Red Phase requires the failing test to target the root cause CLASS (the deeper enabling pattern from the debug report), not the exact symptom
- The Red Phase specifies that the test name must reference the root cause, not the symptom
- An example or guidance is provided (e.g., `test_unbounded_query_without_limit` not `test_api_returns_500`)
- The existing Red Phase constraints are preserved (no source code changes, test must FAIL, etc.)

## Notes
This changes what the code-agent aims for in the red phase without changing the mechanical constraints of the red-green cycle.
