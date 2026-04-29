# Scenario: H-05 — Duplicate include in one source file is deduplicated (appears once in output)

## Type
edge-case

## Priority
medium — prevents accidentally doubling a shared block if a developer copies a directive

## Preconditions
- `src/agents/spec-agent.src.md` contains `<!-- include: shared/context-loading.md -->` appearing TWICE (e.g., accidentally copy-pasted)
- `src/agents/shared/context-loading.md` exists with the canonical text

## Action
Run `node bin/build-agents.js`. Read `.claude/agents/spec-agent.md`.

## Expected Outcome
- The assembled `spec-agent.md` contains the `context-loading.md` content exactly ONCE (not twice)
- The second occurrence of the include directive is removed, not resolved
- Exit code 0 (deduplication is not an error)
- The content appears at the position of the FIRST occurrence

## Failure Mode (if applicable)
N/A.

## Notes
Exercises FR-5, EC-4, and BR-5. Important: deduplication is within a single source file. Two DIFFERENT source files each including `context-loading.md` is correct behavior — this scenario is only about the same directive appearing twice in ONE source file.
