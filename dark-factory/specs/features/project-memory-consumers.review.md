## Architect Review: project-memory-consumers

### Rounds: 1

### Status: APPROVED

### Key Decisions Made
- Index-first memory load protocol: all four consumer agents read index.md first, then load only domain-relevant shards. Token cost bounded to index (≤ 4,000) + relevant shards (≤ 8,000 each) per invocation — NFR-4 satisfied.
- Shared `memory-index-load.md` block: consistent graceful-degradation text across spec-agent, code-agent, and debug-agent via compile-time include directive — no duplication risk.
- Per-domain shard selection in architect-agent preserves the 3-parallel-domain review architecture without adding a 4th reviewer (DEC-TBD-a). Token efficiency: each reviewer loads index + 2 own-domain shards only.
- INV-TBD-b (code-agent guards opaque): explicit information-barrier rule prohibiting `enforced_by`/`guards` fields from being used to infer holdout test coverage. Strengthens existing barrier.
- Migration: old monolithic `invariants.md`/`decisions.md` removed. Negative assertions in tests enforce no consumer references old paths. Legacy spec backward compatibility: SUGGESTION only (not BLOCKER) for specs without memory sections.
- Plugin mirror parity: all 5 changed source files have byte-identical plugin mirrors enforced by contracts tests.

### Memory Probe Summary
Registry is empty (entryCount: 0 across all domains). No active invariants to check for violations. INV-TBD-a, INV-TBD-b, INV-TBD-c reviewed — all fields complete.

### Tier Escalation
None — Tier 3 from the start (12 files, "all agents" cross-cutting keyword, shared templates/test contracts, migration section populated).
