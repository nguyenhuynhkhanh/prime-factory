# Scenario: H-06 — Include directive in mid-document position: surrounding text preserved

## Type
edge-case

## Priority
medium — verifies inline substitution doesn't corrupt surrounding content

## Preconditions
- `src/agents/architect-agent.src.md` has the code-map orientation preamble structured as:
  ```
  3. Load `dark-factory/code-map.md` per the tier-conditional loading rules above —
  <!-- include: shared/context-loading.md -->
  ```
  (Or similar — the include appears mid-step, with text before it on the preceding line)
- `src/agents/shared/context-loading.md` contains the canonical code-map orientation sentence

## Action
Run `node bin/build-agents.js`. Read `.claude/agents/architect-agent.md`.

## Expected Outcome
- The text before the include directive (the tier-conditional prefix) is preserved verbatim
- The include directive comment line is replaced by the shared block content
- The text after the include directive (if any) follows immediately after the inserted block
- No extra blank lines are introduced between the prefix and the inserted content beyond what the shared file itself contains

## Failure Mode (if applicable)
N/A.

## Notes
Exercises EC-2 and EC-3. The architect-agent case is the most complex because its code-map reference has a tier-conditional prefix that is NOT part of the shared block. The build script must replace only the comment line, not the entire paragraph.
