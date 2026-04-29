# Scenario: plugin mirror matches compiled implementation-agent and code-agent after npm run build:agents

## Type
edge-case

## Priority
critical — plugin mirror parity is a load-bearing pipeline invariant. If the plugin copy diverges from the compiled source, all projects using the plugin run the old code while the source repo has the new behavior.

## Preconditions
- `src/agents/implementation-agent.src.md` and `src/agents/code-agent.src.md` have been modified per this spec.
- `npm run build:agents` has been run to produce compiled outputs.
- Both `.claude/agents/implementation-agent.md` and `.claude/agents/code-agent.md` reflect the new behavior.

## Action
1. Read `.claude/agents/implementation-agent.md`.
2. Read `plugins/dark-factory/agents/implementation-agent.md`.
3. Compare — they must be byte-for-byte identical.
4. Read `.claude/agents/code-agent.md`.
5. Read `plugins/dark-factory/agents/code-agent.md`.
6. Compare — they must be byte-for-byte identical.

Also verify that `tests/dark-factory-contracts.test.js` has the `ao-thin-impl-agent` section asserting plugin mirror parity for both agents (or that the existing `ao-agent-roles` parity test already covers them, which it does — verify it runs after build).

## Expected Outcome
- `.claude/agents/implementation-agent.md` equals `plugins/dark-factory/agents/implementation-agent.md` exactly.
- `.claude/agents/code-agent.md` equals `plugins/dark-factory/agents/code-agent.md` exactly.
- The `ao-agent-roles` plugin mirror parity test in `dark-factory-contracts.test.js` passes for both agents.

## Notes
Validates AC-8. Holdout because plugin mirror parity is tested by the existing ao-agent-roles section, but this scenario verifies the specific agents changed by this feature are covered. The dual-write requirement (both .claude/ and plugins/) is the most common forgetting point.
