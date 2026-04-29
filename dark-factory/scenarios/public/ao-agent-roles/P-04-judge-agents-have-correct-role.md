# Scenario: Judge agents (architect-agent, test-agent, promote-agent, implementation-agent) have model-role: judge

## Type
feature

## Priority
critical — if a judge agent is incorrectly labeled as generator, ao-pipeline-mode would use Opus for it, increasing cost without improving calibration quality (and potentially making it more confidently wrong)

## Preconditions
- All 9 `.claude/agents/*.md` files exist with a `model-role` field

## Action
For each of the 4 judge agents, read the frontmatter and assert `fm['model-role'] === 'judge'`.

Agents under test:
- `architect-agent`
- `test-agent`
- `promote-agent`
- `implementation-agent`

In test terms (separate assertions per agent):
```js
assert.equal(fm['model-role'], 'judge', `${name} should have model-role: judge`);
```

## Expected Outcome
- All 4 judge agents have `model-role` value `"judge"`
- Test output: 4 passing assertions

## Failure Mode
If any judge agent has `model-role: generator`, the `assert.equal` fails identifying the agent name and showing expected vs actual.

## Notes
The full 9-agent coverage is: 5 generators (P-03) + 4 judges (P-04) = 9 total, matching the spec role assignment table.
