# Scenario: Promote-agent uses fallback annotation when debug report lacks root cause data

## Type
edge-case

## Priority
medium — Covers backward compat with pre-existing bugfixes that lack new report sections

## Preconditions
- `.claude/agents/promote-agent.md` exists with the updated adaptation sections

## Action
Read `.claude/agents/promote-agent.md` and inspect the annotation section for fallback behavior.

## Expected Outcome
- The promote-agent specifies fallback behavior when root cause or guarded locations cannot be determined:
  - Root cause fallback: `// Root cause: see debug report {name}` (or similar pointer to the report)
  - Guarded locations fallback: `// Guards: see debug report {name}` (or similar pointer)
- The fallback does NOT block test promotion (annotation failure is non-fatal)
- The fallback produces a valid, grep-searchable comment (not an empty line or omission)

## Failure Mode
If no fallback exists, the promote-agent may either crash, produce malformed comments, or skip the annotation entirely for pre-existing bugfixes.

## Notes
EC-7 covers this case. Error handling table specifies the fallback format.
