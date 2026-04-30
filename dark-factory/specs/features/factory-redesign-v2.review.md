## Architect Review: factory-redesign-v2

### Rounds: 1 (Tier 3 — 3 domain pass)

### Status: APPROVED

### Key Decisions Made
- spec-agent codebase prohibition: The new prohibition must be explicit text, not implicit via omission. Constraint text "does not read the codebase" or equivalent is required in the agent body.
- architect ADR before approval: The requirement is gate-enforced — no APPROVED status without Layer 2 ADRs written using the decision node schema. All 7 schema fields (Status, Superseded-by, Domain, Layer, Statement, Rationale, Impact, Effective) must appear in the agent instructions.
- qa-agent as a new first-class agent: Must have valid YAML frontmatter (name: qa-agent, description, tools), must be created in both `.claude/agents/` and `plugins/dark-factory/agents/`.
- coverage-map-only restriction for architect scenario review: The restriction must be stated explicitly in architect-agent.md — not just implied by omission of scenario access.
- code-agent no-questions prohibition: Must be explicit, not general. "BLOCKED result" path must be named.
- State machine in df-orchestrate: All 17 states must be listed verbatim. Gate table must show correct max-round values (5, 3, 2, 3).
- intent-foundation.md: Must be a template file at `dark-factory/memory/intent-foundation.md` with schema fields and at least one example decision node.
- Plugin mirror parity: All 6 modified/created files must be byte-for-byte identical to their plugin counterparts.

### Remaining Notes
- Token caps: Pre-existing cap failures exist on spec-agent and architect-agent. Do NOT reduce content below what is functionally required. Cap test values are deferred.
- df-intake/SKILL.md update is listed in P-14 parity check — ensure it is included in plugin mirror sync.
- The qa-agent's `tools` field in frontmatter should include at minimum: Read, Write — it does not need Bash/Grep since it must not access the codebase directly.
