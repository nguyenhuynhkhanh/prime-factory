# Scenario: project-profile-template.md contains the Org Context section with all 5 fields

## Type
feature

## Priority
critical — this is the primary structural contract; all other behaviors depend on the section existing with the right fields

## Preconditions
- `dark-factory/templates/project-profile-template.md` has been updated by this feature
- File is readable

## Action
Read `dark-factory/templates/project-profile-template.md` and check for the `## Org Context` section and its 5 fields.

Verification assertions (as would appear in the test file):
```js
const template = fs.readFileSync(".../project-profile-template.md", "utf8");
assert.ok(template.includes("## Org Context"));
assert.ok(template.includes("Core values/priorities"));
assert.ok(template.includes("Domain vocabulary"));
assert.ok(template.includes("Team structure"));
assert.ok(template.includes("Open constraints"));
assert.ok(template.includes("PR reviewer handles"));
```

## Expected Outcome
- `## Org Context` heading is present in the template
- All 5 fields are present: Core values/priorities, Domain vocabulary, Team structure, Open constraints, PR reviewer handles
- The section is placed at the tail of the template (after `## Developer Notes`)

## Notes
Validates FR-1, AC-1, AC-2. The field names must match exactly to allow spec-agent and test assertions to find them reliably.
