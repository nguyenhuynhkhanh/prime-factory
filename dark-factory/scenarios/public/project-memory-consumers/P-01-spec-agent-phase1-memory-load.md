# Scenario: spec-agent reads all three memory files in Phase 1

## Type
feature

## Priority
critical — foundational; without this, no downstream memory logic in spec-agent can function

## Preconditions
- `dark-factory/memory/invariants.md` exists with at least one active entry (e.g., `INV-0001`, `domain: security`)
- `dark-factory/memory/decisions.md` exists with at least one active entry
- `dark-factory/memory/ledger.md` exists
- `dark-factory/project-profile.md` exists
- `dark-factory/code-map.md` exists
- spec-agent is spawned by df-intake for a new feature

## Action
Inspect the spec-agent prompt file `.claude/agents/spec-agent.md` for its Phase 1 load instructions. The agent's Phase 1 MUST direct it to read all three memory files alongside project-profile.md and code-map.md.

## Expected Outcome
- `.claude/agents/spec-agent.md` content includes references to `dark-factory/memory/invariants.md`, `dark-factory/memory/decisions.md`, and `dark-factory/memory/ledger.md` inside the Phase 1 (Understand the Request) section.
- The three reads are placed immediately adjacent to the existing `project-profile.md` / `code-map.md` reads (same load step).
- The graceful-degradation language is present: missing files result in a warning, not a block.
- The plugin mirror `plugins/dark-factory/agents/spec-agent.md` contains byte-identical content.

## Notes
Validates FR-1 and AC-1. This is a structural (string-matching) check on the agent prompt; no runtime execution needed. Test-agent will also verify the plugin mirror parity.
