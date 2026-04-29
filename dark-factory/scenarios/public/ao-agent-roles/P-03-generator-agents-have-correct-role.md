# Scenario: Generator agents (spec-agent, code-agent, debug-agent, onboard-agent, codemap-agent) have model-role: generator

## Type
feature

## Priority
critical — if a generator agent is incorrectly labeled as judge, ao-pipeline-mode would use Sonnet for it instead of Opus in quality mode, silently degrading output quality

## Preconditions
- All 9 `.claude/agents/*.md` files exist with a `model-role` field

## Action
For each of the 5 generator agents, read the frontmatter and assert `fm['model-role'] === 'generator'`.

Agents under test:
- `spec-agent`
- `code-agent`
- `debug-agent`
- `onboard-agent`
- `codemap-agent`

In test terms (separate assertions per agent):
```js
assert.equal(fm['model-role'], 'generator', `${name} should have model-role: generator`);
```

## Expected Outcome
- All 5 generator agents have `model-role` value `"generator"`
- Test output: 5 passing assertions

## Failure Mode
If any generator agent has `model-role: judge`, the `assert.equal` fails identifying the agent name and showing expected vs actual.

## Notes
Per-agent assertions are preferred over a loop assertion so that test failure messages are immediately actionable (shows exactly which agent is wrong, not just that "some agent" is wrong).
