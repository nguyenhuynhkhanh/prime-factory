## Domain Review: Security & Data Integrity

### Feature: project-memory-consumers
### Status: APPROVED

### Memory Probe (Security Domain)
Read dark-factory/memory/index.md — empty registry (entryCount: 0). No active INV/DEC entries in security domain to probe.
Memory probe skipped — no active entries in security shard.

### Memory Findings (security)
- Preserved: none — registry empty
- Modified (declared in spec): none
- Potentially violated (BLOCKER): none
- New candidates declared: INV-TBD-a (domain: architecture — not security), INV-TBD-b (domain: architecture), INV-TBD-c (domain: architecture) — all declared in architecture domain, correctly owned by architecture reviewer
- Orphaned (SUGGESTION only): none

### Findings

**Blockers**: None.

**Concerns**: None.

**Suggestions**:
- INV-TBD-b (code-agent information barrier for enforced_by/guards) is the only security-adjacent candidate, but the spec correctly classifies it as domain: architecture. The security rationale is acknowledged inline: "worst outcome of under-scrutinizing a security entry is a production incident." The current classification is acceptable.

### Key Decisions
- The code-agent constraint-awareness rule (FR-12, INV-TBD-b) explicitly prohibits using memory's `enforced_by` and `guards` fields to infer holdout scenarios or test coverage. This STRENGTHENS the existing information barrier rather than weakening it — no security regression.
- Graceful degradation rules (FR-17 through FR-21) ensure agent invocations cannot be disrupted by missing memory files. No crash vectors introduced.
- The spec explicitly removes reference to old monolithic `invariants.md`/`decisions.md` paths. Negative test assertions enforce this. Breaking change handled correctly.

### Round 1 Summary (security):
- Resolved: initial review complete, no security blockers found
- Open blockers: None
- Key decisions: information barrier strengthened for code-agent; graceful degradation non-blocking
- Next round focus: N/A — APPROVED
