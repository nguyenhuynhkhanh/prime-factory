# Scenario: H-02 — Canonical grep filter expression is identical in both callsites (BR-1)

## Type
edge-case

## Priority
high — Divergence between the pre-flight filter and the Step 2.75 filter would create inconsistent failure visibility: one gate could see failures the other misses. BR-1 mandates the filter expressions are identical.

## Preconditions
- Both `src/agents/implementation-agent.src.md` and `src/agents/test-agent.src.md` have been updated.
- Both compiled agents exist.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must extract the grep filter expression from each compiled agent and assert they are identical. Specifically:
1. Extract the text matching `grep -E '...'` from `implementation-agent.md`'s pre-flight section.
2. Extract the same from `test-agent.md`'s Step 2.75 section.
3. Assert both strings are equal.

## Expected Outcome
- Both agents contain the expression `grep -E '^not ok|^# (tests|pass|fail)'` (exact match).
- No whitespace, flag, or alternation-order divergence between the two.

## Failure Mode (if applicable)
If one callsite uses `grep -E '^not ok'` (partial filter) and the other uses the full expression, the summary line would be present in one gate but not the other — inconsistent behavior across gates.

## Notes
The canonical expression from DEC-TBD-a is: `grep -E '^not ok|^# (tests|pass|fail)'`. The test can assert `implementationAgentContent.includes(canonicalFilter) && testAgentContent.includes(canonicalFilter)` where `canonicalFilter` is the exact string.
