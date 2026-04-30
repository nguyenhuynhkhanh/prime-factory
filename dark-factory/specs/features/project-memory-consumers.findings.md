## Key Decisions Made

- Index-first memory load: all four consumers read index.md first, then load only domain-relevant shards. Token cost bounded per NFR-4.
- Shared `memory-index-load.md` block ensures consistent graceful-degradation text across spec-agent, code-agent, and debug-agent.
- Per-domain shard selection in architect-agent preserves 3-parallel-domain review architecture without adding a 4th reviewer.
- INV-TBD-b: code-agent must NOT use `enforced_by` or `guards` fields to infer holdout test coverage — explicit barrier statement required.
- INV-TBD-c: architect-agent loads ONLY own-domain shards (index + 2 shards), never other-domain shards.
- Old monolithic `invariants.md`/`decisions.md` paths must NOT appear in any consumer — negative assertions enforce this.
- Legacy spec backward compatibility: missing memory sections → SUGGESTION (not BLOCKER).
- Plugin mirror parity: all 5 source files must have byte-identical plugin mirrors.

## Remaining Notes

- INV-TBD-a, INV-TBD-b, INV-TBD-c all have complete required fields — no schema gaps to address.
- All three domain reviewers APPROVED with no blockers or concerns.
