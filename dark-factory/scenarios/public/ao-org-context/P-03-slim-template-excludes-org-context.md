# Scenario: Slim profile template does NOT contain Org Context section and notes its exclusion

## Type
feature

## Priority
critical — architect-agents load the slim profile; they must not find Org Context there (it would be out of place) and must not silently miss an expected section

## Preconditions
- `dark-factory/templates/project-profile-slim-template.md` has been updated by this feature

## Action
Read `dark-factory/templates/project-profile-slim-template.md` and perform two checks:

1. The file does NOT contain `## Org Context`
2. The file DOES contain text noting that Org Context is excluded / not included in the slim profile

Verification assertions:
```js
const slim = fs.readFileSync(".../project-profile-slim-template.md", "utf8");
assert.ok(!slim.includes("## Org Context"), "Slim template must NOT contain ## Org Context section");
assert.ok(
  slim.includes("Org Context") && (slim.includes("not included") || slim.includes("excluded") || slim.includes("full profile")),
  "Slim template must note that Org Context is excluded (available in full profile)"
);
```

## Expected Outcome
- `## Org Context` heading is absent from the slim template
- A comment or note in the slim template mentions that Org Context is not included and is available in the full profile
- The slim profile extraction rules in the Derivation Rules Summary table do not include an Org Context row

## Notes
Validates FR-3, BR-2, AC-4. The explicit exclusion note is important: without it, the onboard-agent generating the slim profile would need to know from context that Org Context is excluded. The comment makes it self-documenting.
