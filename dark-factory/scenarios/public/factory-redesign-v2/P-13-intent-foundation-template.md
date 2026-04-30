# Scenario: P-13 — intent foundation template file exists with decision node schema

## Type
feature

## Priority
high — without a canonical template, agents write free-form decisions that cannot be queried by status, domain, or ID.

## Preconditions
- `dark-factory/memory/intent-foundation.md` has been created.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify:
1. `dark-factory/memory/intent-foundation.md` exists.
2. The file contains the decision node schema fields: Status, Superseded-by, Domain, Layer, Statement, Rationale, Impact, Effective.
3. The file contains at least one example decision node with status: active.
4. The file documents the max-20-decisions constraint.

## Expected Outcome
- File exists with schema, at least one example, and the size constraint documented.
- Test run reports no failures in the factory-redesign-v2 block.

## Failure Mode (if applicable)
Missing file or missing schema fields fail independently. The schema must be machine-readable enough that agents can produce conforming nodes without ambiguity.
