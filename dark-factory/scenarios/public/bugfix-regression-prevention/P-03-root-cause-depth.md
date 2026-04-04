# Scenario: Debug report template distinguishes immediate cause from deeper enabling pattern

## Type
feature

## Priority
high — Root cause depth drives whether tests catch variants or just reproductions

## Preconditions
- `.claude/agents/debug-agent.md` exists and contains the debug report template

## Action
Read `.claude/agents/debug-agent.md` and inspect the Root Cause section of the debug report template.

## Expected Outcome
- The Root Cause section (or a subsection within it) explicitly distinguishes between:
  - The immediate cause (the specific code that fails)
  - The deeper enabling pattern (the design assumption, missing abstraction, or structural issue)
- The template states that the test should target the deeper enabling pattern
- The template includes guidance for cases where there is no deeper pattern (immediate cause IS the root cause)

## Notes
This distinction is what makes tests catch root-cause classes instead of just exact reproductions.
