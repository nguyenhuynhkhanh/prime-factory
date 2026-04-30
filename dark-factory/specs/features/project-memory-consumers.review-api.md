## Domain Review: API Design & Backward Compatibility

### Feature: project-memory-consumers
### Status: APPROVED

### Memory Probe (API Domain)
Read dark-factory/memory/index.md — empty registry (entryCount: 0). No active INV/DEC entries in api domain to probe.
Memory probe skipped — no active entries in api shard.

### Memory Findings (api)
- Preserved: none — registry empty
- Modified (declared in spec): none
- Potentially violated (BLOCKER): none
- New candidates declared: none in api domain (all INV-TBD-*/DEC-TBD-* candidates are domain: architecture)
- Orphaned (SUGGESTION only): none

### Findings

**Blockers**: None.

**Concerns**: None.

**Suggestions**:
- The spec has no API endpoints (correctly noted: "N/A — no API endpoints"). This feature modifies agent prompts and a template file only. No external API contract review needed.
- Migration & Deployment correctly identifies the breaking change (old monolithic `invariants.md`/`decisions.md` removed) and declares backward compatibility mechanism: legacy specs without memory sections → SUGGESTION (not BLOCKER). This is a clean migration pattern.

### Key Decisions
- Breaking change from monolithic memory files to domain-sharded files: handled via negative test assertions (`!content.includes("memory/invariants.md")`) across all four consumer agents.
- Legacy spec backward compatibility: architect-agent emits SUGGESTION for specs without `## Invariants`/`## Decisions` sections — not a BLOCKER. This prevents the migration from stalling the pipeline during the transition window.
- Plugin mirror parity (FR-16): all 5 changed source files have byte-identical plugin mirrors. The `bin/build-agents.js` build system writes both targets simultaneously — contracts tests enforce exact content match.
- Rollback plan correctly noted: "revert the specific .claude/agents/*.md file and its plugin mirror" — pure prompt revert, no persistent state.
- Zero-downtime deployment: agent prompts are read at spawn time; no running process to restart.

### Round 1 Summary (api):
- Resolved: initial review complete, no API/backward-compatibility blockers found
- Open blockers: None
- Key decisions: breaking change handled via negative assertions + legacy compat mode; plugin mirror enforced by contracts tests
- Next round focus: N/A — APPROVED
