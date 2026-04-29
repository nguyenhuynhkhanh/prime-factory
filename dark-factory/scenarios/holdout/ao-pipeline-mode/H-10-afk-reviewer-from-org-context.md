# Scenario: H-10 — `--afk` assigns reviewers from project-profile Org Context when present

## Type
feature

## Priority
medium — FR-16. Reviewer assignment is optional (only when the field is present) but must be correctly implemented. An incorrect field name lookup would silently skip reviewers even when configured.

## Preconditions
- `--afk` flag passed.
- `gh` CLI is available.
- `dark-factory/project-profile.md` contains a `## Org Context` section with a line matching `PR reviewer handles: @handle1 @handle2`.
- Spec was promoted successfully.

## Action
Structural test verifies that `implementation-agent.md` (or df-orchestrate SKILL.md) documents:
1. The reviewer lookup searches for `PR reviewer handles` (or `PR reviewer`) in the `## Org Context` section of project-profile.
2. If the field is present and has a value: run `gh pr edit --add-reviewer {handles}`.
3. If the field is absent or empty: skip reviewer assignment silently (no warning, no error).

## Expected Outcome
- All three assertions pass: field name documented, `gh pr edit --add-reviewer` command documented, silent-skip for missing field documented.

## Failure Mode (if applicable)
"implementation-agent.md should document reviewer lookup from '## Org Context PR reviewer handles' field."

## Notes
The `ao-org-context` spec (a sibling in this group) defines the `## Org Context` section format. This scenario verifies that `ao-pipeline-mode`'s `--afk` correctly references that section. If `ao-org-context` is not yet implemented, the reviewer assignment is a no-op (field absent → skip silently).
