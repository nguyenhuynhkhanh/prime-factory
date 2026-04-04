# Scenario: Investigator C prompt requires structured mandatory output with file:line refs and bounded scope

## Type
feature

## Priority
critical — Without structured output, pattern findings are vague and get discarded during synthesis

## Preconditions
- `.claude/skills/df-debug/SKILL.md` exists and contains the Investigator C prompt

## Action
Read `.claude/skills/df-debug/SKILL.md` and inspect the Investigator C prompt block.

## Expected Outcome
- Investigator C's prompt specifies mandatory structured output sections:
  - "Similar Patterns Found" with explicit requirement for file:line references
  - "Search Scope" indicating which directories/modules were searched and why
  - "Classification" (isolated incident / systemic pattern / shared-code risk)
  - "Regression Risk Assessment" (risk level + reintroduction vectors)
- The prompt specifies module-first search scope: search same module/directory first, expand to codebase-wide only if pattern is in shared/core code
- The prompt requires file:line references for every similar pattern found (not just descriptions)
- The existing output format ("Similar Patterns Found, Edge Cases, Systemic Issues, Root Cause Hypothesis, Evidence") is preserved or evolved (not discarded)

## Notes
The prompt is in a blockquote format starting with `> You are Investigator C.` Verify the restructured prompt maintains the blockquote format and is self-contained.
