## Key Decisions Made
- spec-agent codebase prohibition must be explicit text (not implicit): "does not read the codebase" or equivalent phrase required.
- Architect ADR writing is gate-enforced: no APPROVED without Layer 2 ADRs. All 7 decision node schema fields (Status, Superseded-by, Domain, Layer, Statement, Rationale, Impact, Effective) must appear in architect-agent.md.
- qa-agent is a new first-class agent with valid YAML frontmatter (name: qa-agent, description, tools). Must be created in both `.claude/agents/` and `plugins/dark-factory/agents/`.
- Coverage-map-only restriction for architect scenario review must be explicit in architect-agent.md.
- Code-agent no-questions prohibition must be explicit; "BLOCKED result" path must be named verbatim.
- All 17 state machine states must be listed in df-orchestrate/SKILL.md verbatim: INTAKE, INTERVIEW, SPEC_DRAFT, ARCH_INVESTIGATE, ARCH_SPEC_REVIEW, SPEC_REVISION, QA_SCENARIO, QA_SELF_REVIEW, ARCH_SCENARIO_REVIEW, APPROVED, IMPLEMENTING, ARCH_DRIFT_CHECK, TESTING, PROMOTING, DONE, BLOCKED, STALE.
- Gate table in df-orchestrate must show: Gate 1 = max 5 rounds, Gate 2 = max 3 rounds, Gate 3 = max 2 rounds, Gate 4 = max 3 rounds. BLOCKED outcome documented.
- intent-foundation.md must exist at `dark-factory/memory/intent-foundation.md` with schema, at least one example, and max-20 constraint.
- Plugin mirror parity for all 6 files: spec-agent.md, architect-agent.md, qa-agent.md, code-agent.md, df-orchestrate/SKILL.md, df-intake/SKILL.md.

## Remaining Notes
- Do NOT reduce agent file content below what the spec requires. Pre-existing token cap failures are deferred and must not drive content decisions.
- qa-agent tools field: minimum Read, Write (does not need Bash/Grep per its no-codebase-access constraint).
- df-intake/SKILL.md update: add description of the iterative draft-first loop. This is verified by P-14 parity but not by a standalone P-02-style test for df-intake. The parity check is sufficient.
