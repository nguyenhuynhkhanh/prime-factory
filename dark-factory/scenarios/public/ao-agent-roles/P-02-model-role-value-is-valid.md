# Scenario: model-role value is exactly "generator" or "judge" for every agent

## Type
feature

## Priority
critical — an invalid value (typo, alias, capitalization variant) would cause ao-pipeline-mode to fail silently at spawn time

## Preconditions
- All 9 `.claude/agents/*.md` files have a `model-role` field (covered by P-01)
- Valid values are the string literals `generator` and `judge` only

## Action
For each of the 9 agent files, read the frontmatter `model-role` value and assert it is exactly one of the two valid values.

In test terms (within the describe block introduced by P-01):
```js
const validRoles = ['generator', 'judge'];
assert.ok(
  validRoles.includes(fm['model-role']),
  `${name} model-role must be "generator" or "judge", got: ${fm['model-role']}`
);
```

## Expected Outcome
- All 9 agents have `model-role` value of either `"generator"` or `"judge"`
- Test output: 9 passing assertions

## Failure Mode
If any agent has a value like `"Generator"`, `"gen"`, `"producer"`, or an empty string, the assertion fails with the agent name and the bad value in the error message.

## Notes
The `parseFrontmatter()` helper in `dark-factory-setup.test.js` strips surrounding quotes, so `model-role: "generator"` and `model-role: generator` both produce the string `generator`. Both forms pass. The spec mandates unquoted style, but either will pass this test.
