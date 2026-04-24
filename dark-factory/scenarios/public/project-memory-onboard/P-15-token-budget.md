# Scenario: P-15 — Token budget preserved after Phase 3.7 addition

## Type
feature

## Priority
high — NFR-1. Token caps are enforced by the existing `token-measurement` suite; overflow breaks orchestration.

## Preconditions
- onboard-agent file has been updated with Phase 3.7 content.
- `tests/dark-factory-setup.test.js` has the existing token-measurement suite (section marker `token-measurement`).

## Action
Run the token-measurement suite:
```
node --test tests/dark-factory-setup.test.js
```

The test reads the onboard-agent file, estimates its token count using the project's existing estimation method (likely character/word based), and asserts the count is below the configured per-agent cap.

## Expected Outcome
- Token measurement for `.claude/agents/onboard-agent.md` passes the cap.
- Token measurement for `plugins/dark-factory/agents/onboard-agent.md` passes the cap.
- No regression vs. pre-change token count that would push it over.

## Failure Mode (if applicable)
If over budget, factor Phase 3.7 into denser bullet form:
- Remove any inline multi-line ORM schema examples — keep only short phrase references.
- Compress repeated "MUST" statements into a single enumerated list.
- Merge Phase 3.7 subsections into a single section with three bullet groups if absolutely necessary (last resort, as it degrades P-02 structural assertions).

## Notes
The token-measurement suite is the canonical enforcement point. Do not introduce a new token-counting utility; reuse the existing one.
