# Scenario: P-02 — Implementation-agent emits result AFTER cleanup, not before

## Type
feature

## Priority
critical — emitting before cleanup would produce a stale or incorrect `promotedTestPath`; the ordering is a contract invariant.

## Preconditions
- A spec `order-feature` completes the full lifecycle: architect approved, implementation passed, holdout passed, promote-agent ran and assigned `promotedTestPath: "tests/promoted/order-feature.test.js"`, cleanup deleted the spec file and scenarios
- The implementation-agent reaches the result emit step (Step 6)

## Action
Observe when during the lifecycle the structured JSON result is emitted. Specifically: does it include the final `promotedTestPath` from the promote-agent output, and does the spec file still exist at emit time?

## Expected Outcome
- The emitted result contains `"promotedTestPath": "tests/promoted/order-feature.test.js"` — the value assigned by the promote-agent, not a placeholder
- The spec file (`dark-factory/specs/features/order-feature.spec.md`) has already been deleted before the result is emitted
- The result is emitted as the last action of the lifecycle, confirming ordering: cleanup → emit

## Failure Mode
If the result is emitted before cleanup, `promotedTestPath` may be a temporary path or empty, and the spec file still exists when the result is produced — this would be caught by checking whether the path in the result matches the promote-agent's output.

## Notes
EC-8: "Implementation-agent emits result BEFORE cleanup completes — result must be emitted at the very end, after all cleanup steps, so promotedTestPath reflects the final promoted location." This scenario directly validates that ordering requirement.
