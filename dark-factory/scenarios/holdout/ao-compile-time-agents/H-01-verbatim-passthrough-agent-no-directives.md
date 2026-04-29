# Scenario: H-01 — Verbatim passthrough: agent with no include directives assembles correctly

## Type
edge-case

## Priority
high — ensures agents with no shared blocks are not mangled by the build

## Preconditions
- `src/agents/onboard-agent.src.md` exists with NO `<!-- include: ... -->` directives
- The content is a verbatim copy of the current `onboard-agent.md` (minus the header comment)
- Build has not yet been run

## Action
Run `node bin/build-agents.js`. Read `.claude/agents/onboard-agent.md`.

## Expected Outcome
- `.claude/agents/onboard-agent.md` begins with the auto-generated header comment
- The rest of the file content is byte-for-byte identical to `src/agents/onboard-agent.src.md`
- No include directives appear in the output (there were none to resolve)
- No blank lines are added or removed from the content
- Trailing newline behavior is preserved as-is from the source

## Failure Mode (if applicable)
N/A.

## Notes
Exercises EC-1, EC-5, and DEC-TBD-a. The same applies to `codemap-agent.src.md`. If the build script adds unexpected whitespace, newlines, or otherwise transforms verbatim content, this scenario catches it.
