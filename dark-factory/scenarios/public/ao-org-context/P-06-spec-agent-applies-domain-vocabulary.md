# Scenario: Spec-agent reads Org Context domain vocabulary and applies it in specs

## Type
feature

## Priority
high — vocabulary consistency is one of the primary value propositions; specs that use wrong terms confuse developers

## Preconditions
- `.claude/agents/spec-agent.md` has been updated by this feature

## Action
Read `.claude/agents/spec-agent.md` and verify it instructs the agent to read Org Context and apply domain vocabulary.

Verification assertion:
```js
const spec = fs.readFileSync(".../spec-agent.md", "utf8");
assert.ok(
  spec.includes("Org Context") || spec.includes("org context"),
  "spec-agent must reference Org Context section"
);
assert.ok(
  spec.includes("domain vocabulary") || spec.includes("Domain vocabulary") || spec.includes("vocabulary"),
  "spec-agent must instruct vocabulary application"
);
```

## Expected Outcome
- `spec-agent.md` includes an instruction to read `## Org Context` from the project profile when present
- The instruction specifies that domain vocabulary terms should be applied consistently throughout the spec
- The instruction is in Phase 1 (profile reading) or early in the spec-writing workflow so vocabulary is loaded before any prose is written

## Notes
Validates FR-7, AC-11. The vocabulary application is the most impactful behavioral change for developers — specs should use "account" (or whatever the team calls it) rather than generic terms.
