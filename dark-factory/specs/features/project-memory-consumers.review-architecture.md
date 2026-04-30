## Domain Review: Architecture & Performance

### Feature: project-memory-consumers
### Status: APPROVED

### Memory Probe (Architecture Domain)
Read dark-factory/memory/index.md — empty registry (entryCount: 0). No active INV/DEC entries in architecture domain to probe.
Memory probe skipped — no active entries in architecture shard.

### Memory Findings (architecture)
- Preserved: none — registry empty
- Modified (declared in spec): none
- Potentially violated (BLOCKER): none
- New candidates declared:
  - INV-TBD-a — reviewed: fields complete (title, rule, scope.modules, domain: architecture, enforced_by: tests/dark-factory-setup.test.js, rationale)
  - INV-TBD-b — reviewed: fields complete (title, rule, scope.modules, domain: architecture, enforced_by: tests/dark-factory-setup.test.js, rationale)
  - INV-TBD-c — reviewed: fields complete (title, rule, scope.modules, domain: architecture, enforced_by: tests/dark-factory-setup.test.js, rationale)
  - DEC-TBD-a — reviewed: fields complete (title, decision, scope.modules, domain: architecture, enforced_by: tests/dark-factory-setup.test.js, rationale)
  - DEC-TBD-b — reviewed: fields complete (title, decision, scope.modules, domain: architecture, enforced_by: tests/dark-factory-setup.test.js, rationale)
- Orphaned (SUGGESTION only): none

### Findings

**Blockers**: None.

**Concerns**: None.

**Suggestions**:
- The `memory-index-load.md` shared block is cleanly reused across spec-agent, code-agent, and debug-agent via `<!-- include: shared/memory-index-load.md -->`. This ensures consistent graceful-degradation behavior without duplication — good architectural pattern.
- NFR-1 (single read per agent invocation) is enforced by design in agent prompts: "run once at the start, snapshot is final for this session." This is documented but not machine-testable — acceptable for prompt engineering context.

### Key Decisions
- Index-first protocol correctly bounds token cost: index (≤ 4,000 tokens) + at most relevant shards (≤ 8,000 tokens each). Each agent reads only its relevant domain shards — NFR-4 satisfied.
- The build system (`bin/build-agents.js`) resolves `<!-- include: shared/memory-index-load.md -->` at compile time. All three consumers (spec-agent, code-agent, debug-agent) get identical graceful-degradation text from this shared block.
- Per-domain shard selection in architect-agent preserves the existing 3-parallel-domain review architecture without adding a 4th reviewer — DEC-TBD-a correctly captures this decision.
- INV-TBD-c (architect shard-selective loading) correctly classifies domain ownership: architect loads index + 2 own-domain shards, never other-domain shards.
- DEC-TBD-b correctly rejects the "implementation-agent pre-filters memory" alternative — direct read is simpler and avoids schema coupling to orchestration layer.
- All 5 source files have plugin mirrors enforced by contracts tests — dual-write pattern consistent with project conventions.

### Round 1 Summary (architecture):
- Resolved: initial review complete, no architecture blockers found
- Open blockers: None
- Key decisions: index-first load, shard-selective loading, shared block for graceful degradation, per-domain probe for architect
- Next round focus: N/A — APPROVED
