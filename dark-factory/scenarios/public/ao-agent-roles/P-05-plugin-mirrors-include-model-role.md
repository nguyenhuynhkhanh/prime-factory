# Scenario: Plugin mirrors for all 9 agents include model-role and match source exactly

## Type
feature

## Priority
critical — npx dark-factory update distributes plugin files to target projects; if plugin mirrors are stale, installed projects will not have model-role and ao-pipeline-mode will silently fall back

## Preconditions
- All 9 `.claude/agents/*.md` files have `model-role` (covered by P-01 through P-04)
- All 9 `plugins/dark-factory/agents/*.md` files exist

## Action
For each of the 9 agents, read the source file from `.claude/agents/{name}.md` and the plugin file from `plugins/dark-factory/agents/{name}.md`, then assert exact string equality.

In test terms — a new describe block in `tests/dark-factory-contracts.test.js` labeled `ao-agent-roles — plugin mirror parity`:
```js
const allAgents = [
  'spec-agent', 'code-agent', 'debug-agent', 'onboard-agent', 'codemap-agent',
  'architect-agent', 'test-agent', 'promote-agent', 'implementation-agent'
];
for (const name of allAgents) {
  it(`plugins ${name}.md matches source (includes model-role)`, () => {
    const source = readAgent(name);
    const plugin = readPlugin('agent', name);
    assert.equal(source, plugin, `Plugin ${name}.md must match source exactly (ao-agent-roles)`);
  });
}
```

## Expected Outcome
- All 9 plugin agent files are byte-exact copies of their `.claude/agents/` counterparts
- The `model-role` field is implicitly verified because the assertion is full-file equality
- Test output: 9 passing assertions

## Failure Mode
If any plugin file is stale (missing `model-role` or differs in any way), `assert.equal` fails with the agent name in the error message. Even a trailing newline difference will fail.

## Notes
This mirrors the established pattern from the `project-memory-consumers` describe block in `dark-factory-contracts.test.js`. The same `readAgent()` and `readPlugin()` helpers are used. No new test infrastructure is needed.

Some agents (spec-agent, architect-agent, code-agent, debug-agent) already have explicit mirror parity tests in the `Plugin mirror parity (uncovered pairs)` describe block and the `project-memory-consumers` describe block. The new block covers ALL 9 agents explicitly as a single coherent assertion set for `ao-agent-roles`, regardless of pre-existing individual checks.
