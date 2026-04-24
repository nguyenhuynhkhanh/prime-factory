# Scenario: implementation-agent forwards memory-entry summary to code-agent for Modifies scope

## Type
feature

## Priority
medium — convenience shortcut; code-agent also reads memory directly.

## Preconditions
- Spec declares `## Invariants > Modifies > INV-0003`.
- implementation-agent.md edited.

## Action
Read implementation-agent.md's code-agent-spawn section.

## Expected Outcome
- When spawning code-agents, implementation-agent optionally includes a short summary of memory entries that the spec's `## Invariants > Modifies` / `Supersedes` list references.
- The summary is advisory context, not the source of truth.
- Code-agent still reads memory directly per the consumers spec's rule plumbing.
- The summary is scoped tightly to Modifies/Supersedes — not the whole memory (avoid context bloat).

## Notes
Covers FR-23. This is a UX shortcut — the consumers spec owns code-agent's direct-read behavior.
