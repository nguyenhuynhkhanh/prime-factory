# Scenario: Re-running onboard-agent preserves existing Org Context and offers update

## Type
feature

## Priority
critical — developers invest time authoring Org Context; a re-run must not silently destroy it

## Preconditions
- `.claude/agents/onboard-agent.md` has been updated by this feature
- Target project already has `dark-factory/project-profile.md` with an `## Org Context` section containing authored content

## Action
The developer runs `/df-onboard` on a project that already has an `## Org Context` section in its profile.

The onboard-agent encounters the section during Phase 1 incremental refresh (existing profile check).

Read `.claude/agents/onboard-agent.md` and verify the re-run preservation behavior is documented.

Verification assertion:
```js
const onboard = fs.readFileSync(".../onboard-agent.md", "utf8");
assert.ok(
  onboard.includes("Org Context already exists") || onboard.includes("update it") || onboard.includes("preserve"),
  "onboard-agent must specify preserve-on-rerun behavior for Org Context"
);
```

## Expected Outcome
- When `## Org Context` already exists in the profile, the onboard-agent presents: "Org Context already exists — update it? (y/N)"
- Default answer is N — existing content is preserved
- If developer answers N (or presses Enter): Org Context section is kept unchanged in the final profile
- If developer answers Y: org context question is re-presented and developer can provide new content

## Failure Mode
If the preservation check is missing and the re-run silently overwrites Org Context with empty/placeholder content, teams will lose their compliance constraints and vocabulary definitions. This would be a data loss bug.

## Notes
Validates FR-5, BR-3, AC-8. The "(y/N)" notation (uppercase N = default) follows Unix convention and must be reflected in the agent instructions.
