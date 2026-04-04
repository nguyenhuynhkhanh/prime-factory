# Scenario: Root Cause Depth handles case where immediate cause IS the root cause

## Type
edge-case

## Priority
medium — Common case for simple bugs; must have explicit guidance, not silence

## Preconditions
- `.claude/agents/debug-agent.md` exists with the updated debug report template

## Action
Read `.claude/agents/debug-agent.md` and inspect the Root Cause Depth section for handling the case where immediate cause and deeper pattern are identical.

## Expected Outcome
- The template provides explicit guidance for when there is no deeper enabling pattern
- The guidance includes wording like "No deeper enabling pattern identified" or "Immediate cause and deeper pattern are identical"
- The template states that in this case, the test targets the immediate cause
- The template does NOT require fabricating a deeper pattern when none exists

## Failure Mode
If no guidance exists for this case, the debug-agent may either fabricate a deeper pattern or leave the section empty, both of which confuse the code-agent.

## Notes
EC-4 covers this case. BR-5 states: "If the debug report identifies only an immediate cause with no deeper pattern, the test targets the immediate cause."
