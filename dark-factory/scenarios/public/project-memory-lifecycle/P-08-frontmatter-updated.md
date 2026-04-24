# Scenario: promote-agent updates top-level frontmatter on each written file

## Type
feature

## Priority
high — frontmatter freshness is how consumers validate schema version and recency.

## Preconditions
- Memory files have `version: 1`, `lastUpdated: <old-ISO>`, `gitHash: <old-hash>`.
- promote-agent runs and writes memory.

## Action
Read promote-agent.md's frontmatter-update documentation.

## Expected Outcome
- For each written file, `lastUpdated` is set to the current ISO timestamp.
- `gitHash` is set to the current `git rev-parse HEAD` at write time.
- `version` is unchanged (version bump is a separate, explicit operation).
- `generatedBy` is updated to `promote-agent`.

## Notes
Asserts these exact field names appear in the documented frontmatter-update step.
