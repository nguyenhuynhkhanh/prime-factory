# Scenario: Profile without Org Context section causes no degraded behavior in any agent

## Type
feature

## Priority
critical — backward compatibility for all existing onboarded projects; this is the most common case initially

## Preconditions
- `.claude/agents/spec-agent.md` and `.claude/agents/onboard-agent.md` have been updated
- A project profile exists at `dark-factory/project-profile.md` WITHOUT an `## Org Context` section (i.e., any profile created before this feature)

## Action
Read `.claude/agents/spec-agent.md` and verify it explicitly handles absent Org Context gracefully.

Conceptual test: an agent reads a profile without `## Org Context` and attempts to apply org context. Expected: no error thrown, no warning emitted, spec proceeds normally.

Structural assertion:
```js
const spec = fs.readFileSync(".../spec-agent.md", "utf8");
// Must explicitly state what to do when section is absent
assert.ok(
  spec.includes("if present") || spec.includes("when present") || spec.includes("absent") || spec.includes("optional"),
  "spec-agent must state that Org Context reading is conditional on presence"
);
```

## Expected Outcome
- Spec-agent behavior is identical whether or not `## Org Context` is present
- No log warning is emitted for missing Org Context
- No spec section is left incomplete due to absent org context
- Onboard-agent on re-run does not add an empty Org Context section if the developer skips the question

## Notes
Validates FR-11, BR-6. This scenario covers all pre-existing projects that were onboarded before this feature shipped. They must continue to work without any manual intervention.
