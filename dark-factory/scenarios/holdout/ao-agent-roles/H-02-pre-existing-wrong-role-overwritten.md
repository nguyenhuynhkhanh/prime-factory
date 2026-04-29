# Scenario: Pre-existing model-role with wrong value is corrected, not preserved

## Type
edge-case

## Priority
medium — if a developer previously added model-role manually with the wrong value, the code-agent must overwrite it with the spec-defined correct value

## Preconditions
- One or more agent files already have a `model-role` field, but with an incorrect value
- Example: `architect-agent.md` has `model-role: generator` (wrong — should be `judge`)

## Action
Run the implementation (code-agent writes the correct frontmatter to all 9 agents) and then run the test suite.

## Expected Outcome
- After implementation, `architect-agent.md` has `model-role: judge` (corrected)
- The per-agent role assertion `assert.equal(fm['model-role'], 'judge', 'architect-agent should have model-role: judge')` passes
- The plugin mirror assertion also passes (plugin file updated to match corrected source)

## Failure Mode (if implementation is wrong)
If the code-agent only adds `model-role` when absent (skips files that already have it), a pre-existing wrong value survives. The per-agent role assertion catches this because it asserts the exact expected value, not just presence.

## Notes
EC-1 in the spec covers this case. The key implementation requirement: when writing `model-role` to a file, always write the spec-defined value, regardless of what was there before. This is not an upsert-only operation — it is an idempotent set.
