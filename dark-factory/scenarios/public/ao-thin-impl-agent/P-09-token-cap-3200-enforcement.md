# Scenario: compiled implementation-agent.md is at or below 3,200 tokens

## Type
feature

## Priority
critical — the token cap is the quantifiable measure of this feature's success. Exceeding it means the spec and scenario-reading prose was not fully removed.

## Preconditions
- `src/agents/implementation-agent.src.md` has been modified per this spec.
- `npm run build:agents` has been run to produce a current compiled output.
- Compiled `.claude/agents/implementation-agent.md` exists.

## Action
Read `.claude/agents/implementation-agent.md`. Measure its byte size using `Buffer.byteLength(content, 'utf8')`. Compute token estimate as `Math.ceil(bytes / 4)`.

Also check that `tests/dark-factory-setup.test.js` has been updated: the `"Token cap enforcement"` describe block should have `"implementation-agent": 3200` (changed from 4000).

## Expected Outcome
- `Math.ceil(Buffer.byteLength(content, 'utf8') / 4) <= 3200` is true for the compiled implementation-agent.md.
- The test file `tests/dark-factory-setup.test.js` reflects the new cap value of 3200 for implementation-agent.

## Failure Mode
If the compiled file exceeds 3,200 tokens, the feature did not achieve its stated goal. Likely cause: new prose was added to compensate for removed prose, OR the old read-and-forward prose was not fully removed.

## Notes
Validates NFR-1, AC-6, INV-TBD-a (secondary signal). This is the most objective assertion in the test suite.
