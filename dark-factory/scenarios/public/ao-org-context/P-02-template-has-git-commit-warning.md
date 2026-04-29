# Scenario: Org Context section in template warns against committing secrets

## Type
feature

## Priority
high — security invariant; the profile is committed to git and developers must be warned not to put secrets in Org Context

## Preconditions
- `dark-factory/templates/project-profile-template.md` has been updated by this feature

## Action
Read `dark-factory/templates/project-profile-template.md` and verify the `## Org Context` section contains the git-commit warning.

Verification assertion:
```js
const template = fs.readFileSync(".../project-profile-template.md", "utf8");
const orgCtxIdx = template.indexOf("## Org Context");
assert.ok(orgCtxIdx !== -1);
const afterOrgCtx = template.slice(orgCtxIdx);
// Warning must mention secrets AND git commit
assert.ok(
  afterOrgCtx.includes("committed to git") || afterOrgCtx.includes("not store secrets"),
  "Org Context section must warn against committing secrets"
);
```

## Expected Outcome
- The `## Org Context` section contains a comment that warns developers not to store secrets, SLA penalty amounts, or NDA-covered information, because the profile is committed to git
- Warning appears before the 5 field definitions (i.e., it is the first thing a developer reads in the section)

## Notes
Validates FR-2, BR-5. The exact phrasing is flexible, but both "secrets" and "committed to git" (or equivalent) must appear in the section.
