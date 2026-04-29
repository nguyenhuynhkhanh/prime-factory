# Scenario: P-02 — Shared blocks resolve correctly into agent context

## Type
feature

## Priority
critical — verifies the include resolution produces the correct assembled content

## Preconditions
- `src/agents/shared/context-loading.md` exists with the canonical code-map orientation sentence
- `src/agents/spec-agent.src.md` contains `<!-- include: shared/context-loading.md -->` at the location where the code-map orientation preamble belongs
- Build has not yet been run (or output files are stale)

## Action
Run `node bin/build-agents.js`. Then read `.claude/agents/spec-agent.md`.

## Expected Outcome
- The assembled `spec-agent.md` contains the canonical code-map orientation text from `src/agents/shared/context-loading.md`
- The assembled file does NOT contain the raw `<!-- include: shared/context-loading.md -->` comment
- The canonical text reads: `Read \`dark-factory/code-map.md\` — it is always present and current. Use it to understand module structure, blast radius, entry points, and hotspots. Do NOT use Grep or Glob to discover which modules exist or how they connect — that is what the map is for. DO use Read/Grep for precise implementation details on specific files the map directs you to.`
- The text appears at the correct position in the agent file (where the include directive was in the source)

## Failure Mode (if applicable)
N/A for this read-and-verify scenario.

## Notes
This scenario exercises FR-2, FR-11 (context-loading block), and DEC-TBD-a (inline substitution). Run the same verification for any other agent that includes `context-loading.md` (debug-agent, architect-agent, promote-agent, test-agent, code-agent).
