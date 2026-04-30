# Scenario: H-04 — Full spec reads in other agents are not inadvertently limited (BR-3)

## Type
edge-case

## Priority
medium — The `limit: 40` constraint applies only to Step 0.5 header-only reads. code-agent, architect-agent, and spec-agent need the full spec. This scenario verifies that `limit: 40` does not appear in those agents' spec read instructions.

## Preconditions
- `src/agents/implementation-agent.src.md` has been updated.
- The change is scoped to Step 0.5 only — not to Step 1 (code-agent spawn) or other spec reads.
- Compiled agents for code-agent, architect-agent, and spec-agent exist.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify:
1. `code-agent.md` does NOT contain `limit: 40` in the context of its spec read instructions (the self-load contract — full spec is needed).
2. `architect-agent.md` does NOT contain `limit: 40` in the context of its spec read instructions.
3. `implementation-agent.md` contains `limit: 40` in Step 0.5 context (the limited read) AND does not apply the same limit to other spec interactions.

## Expected Outcome
- `limit: 40` is present exactly in implementation-agent's Step 0.5 section.
- Other agents' spec read instructions are unchanged.
- The optimization is surgically scoped.

## Failure Mode (if applicable)
If `limit: 40` is added globally to "spec read" instructions without scoping, code-agent would only see the first 40 lines of the spec — missing all requirements, business rules, and edge cases. This would produce catastrophically incomplete implementations.

## Notes
BR-3 states the limit applies "only when the read's purpose is to extract header-level fields." The test is a safety check that the code-agent did not over-apply the optimization.
