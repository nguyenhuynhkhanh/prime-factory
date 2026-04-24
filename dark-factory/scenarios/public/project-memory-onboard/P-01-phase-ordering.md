# Scenario: P-01 — Phase 3.7 is positioned between Phase 3.5 and Phase 4

## Type
feature

## Priority
critical — Phase ordering is a structural invariant enforced by BR-1. Downstream consumers depend on code map + memory candidates being available together.

## Preconditions
- `.claude/agents/onboard-agent.md` has been updated for this feature.
- `plugins/dark-factory/agents/onboard-agent.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the new project-memory-onboard assertion block.

## Action
Run the structural test suite against the updated onboard-agent file:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that, when reading `.claude/agents/onboard-agent.md`, the byte offset of the heading `### Phase 3.7: Memory Extraction` is strictly greater than the byte offset of `### Phase 3.5: Code Map Construction` and strictly less than the byte offset of `### Phase 4: Quality Bar`.

## Expected Outcome
- Assertion passes: `offset(Phase 3.7) > offset(Phase 3.5)` AND `offset(Phase 3.7) < offset(Phase 4)`.
- Test run reports no failures in the project-memory-onboard block.
- The same assertion applied to `plugins/dark-factory/agents/onboard-agent.md` also passes (enforced by mirror parity).

## Failure Mode (if applicable)
If the ordering assertion fails, the test output must clearly identify which heading is out of order (e.g., "Phase 3.7 appears before Phase 3.5" or "Phase 3.7 appears after Phase 4"). No partial success allowed.

## Notes
Use simple `content.indexOf()` on the heading strings — this matches the pattern used elsewhere in `dark-factory-setup.test.js` for structural assertions.
