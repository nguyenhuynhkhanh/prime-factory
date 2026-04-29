# Scenario: Onboard-agent Phase 6 includes the Org Context question

## Type
feature

## Priority
critical — this is the primary capture mechanism; if the question is absent, org context can only be added manually

## Preconditions
- `.claude/agents/onboard-agent.md` has been updated by this feature

## Action
Read `.claude/agents/onboard-agent.md` and verify Phase 6 contains the org context question step.

Verification assertion:
```js
const onboard = fs.readFileSync(".../onboard-agent.md", "utf8");
// Must mention org context capture in Phase 6
assert.ok(
  onboard.includes("Org Context") || onboard.includes("org context") || onboard.includes("org-level"),
  "onboard-agent must include org context question in Phase 6"
);
// Must mention compliance or vocabulary or team structure (at least one key domain)
assert.ok(
  onboard.includes("compliance") || onboard.includes("vocabulary") || onboard.includes("team structure"),
  "onboard-agent org context question must mention at least one example domain"
);
```

## Expected Outcome
- `onboard-agent.md` Phase 6 contains a question step asking about org-level constraints
- The question mentions at least one of: compliance requirements, team structure, domain vocabulary, core values
- The question allows the developer to skip (press Enter to skip / no answer required)

## Notes
Validates FR-4, AC-7. The exact phrasing of the question can vary, but the intent must be clear: this is asking about org-level (not code-level) knowledge.
