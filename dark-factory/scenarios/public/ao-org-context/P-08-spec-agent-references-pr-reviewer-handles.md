# Scenario: Spec-agent references PR reviewer handles in implementation notes

## Type
feature

## Priority
medium — PR routing quality-of-life improvement; enables ao-pipeline-mode --afk downstream

## Preconditions
- `.claude/agents/spec-agent.md` has been updated by this feature

## Action
Read `.claude/agents/spec-agent.md` and verify it instructs the agent to reference PR reviewer handles from Org Context.

Verification assertion:
```js
const spec = fs.readFileSync(".../spec-agent.md", "utf8");
assert.ok(
  spec.includes("PR reviewer") || spec.includes("reviewer handles") || spec.includes("PR routing"),
  "spec-agent must reference PR reviewer handles from Org Context"
);
```

## Expected Outcome
- `spec-agent.md` instructs the agent to reference the `PR reviewer handles` field from Org Context
- The handles are referenced in Implementation Notes or PR workflow guidance sections of specs
- If the PR reviewer handles field is empty or absent, the agent omits reviewer routing silently (no error, no placeholder)

## Notes
Validates FR-9, BR-4, AC-13. The PR reviewer handles field is the authoritative source for the ao-pipeline-mode --afk feature; this spec establishes it as a spec-agent output.
