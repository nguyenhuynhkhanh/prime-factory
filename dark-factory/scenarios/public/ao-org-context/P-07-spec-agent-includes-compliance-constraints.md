# Scenario: Spec-agent includes compliance constraints from Org Context in spec sections

## Type
feature

## Priority
high — compliance constraints in specs before architect review prevents last-minute surprises and back-and-forth

## Preconditions
- `.claude/agents/spec-agent.md` has been updated by this feature

## Action
Read `.claude/agents/spec-agent.md` and verify it instructs the agent to include Open constraints in relevant spec sections.

Verification assertion:
```js
const spec = fs.readFileSync(".../spec-agent.md", "utf8");
assert.ok(
  spec.includes("Open constraints") || spec.includes("compliance") || spec.includes("constraints"),
  "spec-agent must mention compliance/constraint application from Org Context"
);
assert.ok(
  spec.includes("Migration") || spec.includes("Business Rules") || spec.includes("Error Handling"),
  "spec-agent must name at least one target spec section for compliance injection"
);
```

## Expected Outcome
- `spec-agent.md` specifies that compliance constraints from `Open constraints` should appear in relevant spec sections
- The instruction names at least one of: Migration & Deployment, Business Rules, Error Handling as target sections
- The instruction handles the special case where a compliance constraint exists even when migration would otherwise be N/A (EC-6)

## Notes
Validates FR-8, AC-12. The key risk is specs where a developer writes "N/A — no existing data affected" in Migration but the team has "all DB migrations require DBA review." Without this spec item, that constraint would be silently dropped.
