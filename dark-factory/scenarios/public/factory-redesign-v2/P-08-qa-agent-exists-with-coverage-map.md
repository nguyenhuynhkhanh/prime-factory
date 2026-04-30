# Scenario: P-08 — qa-agent file exists and contains coverage map instruction

## Type
feature

## Priority
critical — without a QA-agent, the architect continues to own scenario quality, which is the wrong role boundary.

## Preconditions
- `.claude/agents/qa-agent.md` has been created for this feature.
- `plugins/dark-factory/agents/qa-agent.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify:
1. `.claude/agents/qa-agent.md` exists (file presence check).
2. The file contains a coverage map production instruction. Look for: "coverage map", "ADR ID to scenario", "which scenarios cover which ADRs".
3. `plugins/dark-factory/agents/qa-agent.md` exists and matches.

## Expected Outcome
- Both files exist.
- Both contain coverage map instruction.
- Test run reports no failures in the factory-redesign-v2 block.

## Failure Mode (if applicable)
If qa-agent.md does not exist or contains no coverage map instruction, test fails. The coverage map is the primary interface between QA and architect — its absence breaks the review chain.
