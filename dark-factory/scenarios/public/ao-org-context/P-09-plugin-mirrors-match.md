# Scenario: Plugin mirrors match source files for all four changed files

## Type
feature

## Priority
critical — the dual-write requirement is a hard invariant; mirror parity failures block distribution users from getting the feature

## Preconditions
- All four source files have been updated by this feature:
  - `dark-factory/templates/project-profile-template.md`
  - `dark-factory/templates/project-profile-slim-template.md`
  - `.claude/agents/onboard-agent.md`
  - `.claude/agents/spec-agent.md`

## Action
Compare each source file with its plugin mirror:

```js
const pairs = [
  [".../dark-factory/templates/project-profile-template.md",
   ".../plugins/dark-factory/templates/project-profile-template.md"],
  [".../dark-factory/templates/project-profile-slim-template.md",
   ".../plugins/dark-factory/templates/project-profile-slim-template.md"],
  [".../.claude/agents/onboard-agent.md",
   ".../plugins/dark-factory/agents/onboard-agent.md"],
  [".../.claude/agents/spec-agent.md",
   ".../plugins/dark-factory/agents/spec-agent.md"],
];
for (const [source, mirror] of pairs) {
  assert.equal(fs.readFileSync(source, "utf8"), fs.readFileSync(mirror, "utf8"));
}
```

## Expected Outcome
- All 4 source files have byte-for-byte identical mirrors in `plugins/dark-factory/`
- Tests pass for all 4 mirror parity assertions
- Any difference (including a single character) is a test failure

## Failure Mode
If mirrors are not updated, the npm package and Claude Code plugin distribution will not include the Org Context feature. Users who installed Dark Factory via `npx dark-factory init` would get a broken or incomplete feature.

## Notes
Validates FR-10, AC-5, AC-6, AC-10, AC-14, AC-15. The test assertions should be added as part of the `ao-org-context` promoted test section (DF-PROMOTED-START/END markers).
