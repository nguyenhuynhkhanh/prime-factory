# Feature: ao-org-context

## Design Intent

Project profiles today capture what the codebase is (tech stack, architecture, patterns) but miss what the org is. A team optimizing for "zero-downtime deployments" makes different tradeoffs than one optimizing for "security first." A team with a DBA who must review migrations has a different workflow than one without. A codebase that uses "account" to mean "billing account" (not "user account") will confuse agents that apply generic domain terms. This leads to specs that are technically correct but organizationally wrong — specs that don't use the team's vocabulary, don't flag compliance constraints, and don't route PRs correctly.

The `## Org Context` section gives teams a place to record organizational knowledge that improves spec quality. It is entirely developer-authored (agents do not infer it), entirely optional (absence is not an error), and designed to be consumed only where it matters (spec-agent, onboard-agent question phase). It belongs in the full profile only — the slim profile is for architect reviews, which focus on technical correctness, not organizational context.

## Context

Dark Factory's project profile (`project-profile.md`) is the shared context for all pipeline agents. It captures technical facts about a codebase: stack, architecture, patterns, testing setup. What it does not capture is organizational knowledge that affects how specs should be written:

- Teams have domain vocabularies that agents don't know. "Account" can mean a billing account or a user account depending on the domain. Agents that use the wrong term produce specs that developers must correct.
- Teams have compliance constraints (HIPAA, PCI, GDPR) that must appear in specs — in the Migration section, the Error Handling table, the Business Rules. If the spec-agent doesn't know about them, they get retrofitted during architect review or missed entirely.
- Teams have PR routing conventions. If specs can recommend reviewers using the team's actual GitHub handles, PR setup is faster and less error-prone.
- Teams have core values that constrain spec decisions. "Zero-downtime is non-negotiable" changes how migration plans are written. "Security first" changes how auth is specified. Agents that don't know these values make recommendations that conflict with team culture.

This feature adds an optional `## Org Context` section to the project-profile template, teaches the onboard-agent to ask for it during the interactive phase, and teaches the spec-agent to apply it when writing specs.

## Scope

### In Scope (this spec)

- Add `## Org Context` section to `dark-factory/templates/project-profile-template.md` with 5 fields: Core values/priorities, Domain vocabulary, Team structure, Open constraints, PR reviewer handles
- Add a comment in `project-profile-slim-template.md` explicitly excluding Org Context from the slim profile
- Update `onboard-agent.md`: add Phase 6 question step to capture org context; handle re-run case (preserve existing section, offer update); onboard-agent does NOT infer org context from code
- Update `spec-agent.md`: read `## Org Context` when present; apply domain vocabulary, compliance constraints, and PR reviewer handles in spec output
- Add structural assertions to `tests/dark-factory-setup.test.js`: template contains `## Org Context` with all 5 fields; slim template does NOT contain `## Org Context`; plugin mirror parity for both templates and both agents
- Mirror all agent/template changes to `plugins/dark-factory/`

### Out of Scope (explicitly deferred)

- Org Context ingestion by code-agent, debug-agent, architect-agent, or test-agent — they have no use for organizational metadata; keeping the blast radius minimal
- Auto-population of Org Context by onboard-agent from code analysis (e.g., inferring GDPR compliance from presence of PII fields) — org context is developer-authored by definition
- Validation or enforcement of Org Context field values — these are free-form developer notes
- Structured machine-readable format for compliance constraints (e.g., a `compliance: [HIPAA, PCI]` YAML field) — out of scope; prose is sufficient for spec writing
- Org Context influencing onboard-agent's code analysis phases (Phases 1–5) — it has no effect on codebase scanning
- PR auto-assignment in the `ao-pipeline-mode` `--afk` feature — that spec consumes the `PR reviewer handles` field; it is authored here but consumed there

### Scaling Path

The Org Context section is plain markdown authored by developers. If structured machine-readable fields are needed in the future (e.g., for automated compliance checks or PR routing tooling), the section can be extended with YAML frontmatter blocks without breaking any existing consumer. The spec-agent and onboard-agent read it as prose — structured extensions are backward compatible.

## Requirements

### Functional

- FR-1: `project-profile-template.md` MUST contain a `## Org Context` section with 5 labeled fields: Core values/priorities, Domain vocabulary, Team structure, Open constraints, PR reviewer handles — rationale: agents need a consistent structure to look for
- FR-2: The `## Org Context` section in the template MUST include a comment warning developers not to store secrets, SLA penalty amounts, or NDA-covered information, because the profile is committed to git — rationale: prevent accidental secret commit
- FR-3: `project-profile-slim-template.md` MUST contain an explicit comment stating that Org Context is not included in the slim profile — rationale: architect-agents load the slim profile; they must not expect org context there and must know to load the full profile if needed
- FR-4: The onboard-agent MUST add a question step in Phase 6 asking the developer about org-level constraints (compliance, team structure, vocabulary, core values) — rationale: this is developer-authored content that cannot be inferred from code
- FR-5: On re-run, if `## Org Context` already exists in `project-profile.md`, the onboard-agent MUST preserve it and ask "Org Context already exists — update it? (y/N)" before making any changes — rationale: incremental refresh must not destroy previously authored content
- FR-6: The onboard-agent MUST NOT attempt to infer org context from code analysis — rationale: compliance constraints, team structure, and domain vocabulary are organizational facts, not code facts
- FR-7: The spec-agent MUST read the `## Org Context` section when present and apply domain vocabulary consistently throughout the spec — rationale: specs that use the team's actual terms are clearer and require fewer corrections
- FR-8: The spec-agent MUST include compliance constraints from `Open constraints` in relevant spec sections (Migration & Deployment, Business Rules, Error Handling) — rationale: compliance requirements must appear in specs before architect review, not after
- FR-9: The spec-agent MUST reference PR reviewer handles from Org Context when writing implementation notes or PR workflow guidance — rationale: enables the `ao-pipeline-mode` `--afk` flag to assign reviewers and reduces PR setup friction
- FR-10: All agent and template files changed by this feature MUST have exact content parity between `.claude/` and `plugins/dark-factory/` — rationale: existing dual-write invariant
- FR-11: Absence of `## Org Context` in any profile MUST be treated as empty by all agents — no warnings, no blocks, no degraded behavior — rationale: existing profiles (created before this feature) must work unchanged

### Non-Functional

- NFR-1: The Org Context section is optional. Its presence or absence does not affect any pipeline beyond spec quality — specifically, onboard-agent, spec-agent, and test execution all behave correctly without it
- NFR-2: Org Context is never read by code-agent, debug-agent, architect-agent, or test-agent — blast radius is limited to onboard-agent (capture) and spec-agent (consumption)
- NFR-3: The test assertions added to `dark-factory-setup.test.js` follow the existing promoted-section pattern: wrapped in `DF-PROMOTED-START/END: ao-org-context` markers, placed at the end of the file

## Data Model

No new data model. Changes are purely to markdown template and agent instruction files.

The `## Org Context` section added to `project-profile-template.md` has the following structure:

```markdown
## Org Context
> Optional. Capture organizational knowledge that helps agents write better specs.
> Do not store secrets, SLA penalty amounts, or NDA-covered information here — this file is committed to git.

- **Core values/priorities**: {What this team optimizes for — e.g., "security first", "zero-downtime is non-negotiable", "developer experience over performance"}
- **Domain vocabulary**: {Project-specific jargon agents should use consistently — e.g., "account = billing account, not user account; member = authenticated user with active subscription"}
- **Team structure**: {Who owns what, PR reviewer routing — e.g., "@backend-team reviews all API changes; default reviewer: @handle"}
- **Open constraints**: {Legal/compliance/SLA commitments affecting spec decisions — e.g., "PII must not leave EU region", "all DB migrations require DBA review", "HIPAA BAA in effect"}
- **PR reviewer handles**: {GitHub handles for auto-PR reviewer assignment — e.g., "@alice @bob for backend; @carol for frontend"}
```

## Migration & Deployment

N/A — no existing data affected. This feature adds a new optional section to template files and instruction text to agent files. Changes are additive and backward compatible:

- Existing `project-profile.md` files without `## Org Context`: all agents treat the missing section as empty. No migration required.
- Existing `project-profile-slim.md` files: the slim template update adds a comment only — no behavioral change to how slim profiles are generated or consumed.
- Plugin mirrors: must be updated in sync with source files. This is a manual dual-write, enforced by the test suite.
- No schema changes, no cache keys, no database state.

## API Endpoints

N/A — this feature modifies agent instruction files and templates, not API endpoints.

## Business Rules

- BR-1: Org Context is developer-authored only — the onboard-agent asks for it but never infers it from code analysis — rationale: compliance status, team structure, and domain vocabulary are org facts, not code facts; inferring them would produce unreliable data
- BR-2: Org Context belongs in the full profile only — the slim profile must explicitly note its absence — rationale: architect-agents read the slim profile; if they expected org context and didn't find it, they'd load the wrong file; the explicit comment prevents silent confusion
- BR-3: On re-run, existing Org Context must be preserved unless the developer explicitly opts to update — rationale: org context is carefully authored; an incremental re-run should not destroy it
- BR-4: The PR reviewer handles field is the authoritative source for reviewer routing consumed by `ao-pipeline-mode` — rationale: single source of truth for reviewer handles; changes in one place propagate everywhere
- BR-5: The git-commit warning in the template comment is non-negotiable — the profile IS committed to git and secrets MUST NOT appear in it — rationale: security invariant
- BR-6: Absence of `## Org Context` must never produce a warning, error, or degraded agent behavior — rationale: backward compatibility for all existing onboarded projects

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| Developer presses Enter (skips) in onboard Phase 6 Org Context question | Org Context section is omitted from profile (or preserved if already exists) | None — no error, no warning |
| `## Org Context` section absent from profile when spec-agent reads it | Spec-agent continues normally; no domain vocabulary application, no compliance note | No log output — silent absence is valid |
| `## Org Context` present but all fields are blank/placeholder text | Spec-agent reads and applies what is present; if all fields are placeholders (`{...}`), treats as effectively empty | No error |
| Developer answers "N" (default) to "update Org Context?" on re-run | Existing Org Context section preserved unchanged | No re-run of org context capture |
| Developer answers "y" to "update Org Context?" on re-run | Onboard-agent re-presents the org context question; developer provides new content; section is updated | Profile is rewritten with new Org Context |
| Plugin mirror not updated after agent/template change | Test suite fails with mirror parity assertion | Code-agent is blocked until mirror is updated |

## Acceptance Criteria

- [ ] AC-1: `dark-factory/templates/project-profile-template.md` contains a `## Org Context` section
- [ ] AC-2: The `## Org Context` section contains all 5 fields: Core values/priorities, Domain vocabulary, Team structure, Open constraints, PR reviewer handles
- [ ] AC-3: The `## Org Context` section contains a comment warning against storing secrets/SLA amounts/NDA content
- [ ] AC-4: `dark-factory/templates/project-profile-slim-template.md` does NOT contain a `## Org Context` section but does contain a comment stating it is excluded from the slim profile
- [ ] AC-5: `plugins/dark-factory/templates/project-profile-template.md` is byte-for-byte identical to `dark-factory/templates/project-profile-template.md`
- [ ] AC-6: `plugins/dark-factory/templates/project-profile-slim-template.md` is byte-for-byte identical to `dark-factory/templates/project-profile-slim-template.md`
- [ ] AC-7: `onboard-agent.md` Phase 6 contains a question step for org context capture (compliance, vocabulary, team structure, core values)
- [ ] AC-8: `onboard-agent.md` specifies preserve-on-re-run behavior: if `## Org Context` exists, ask "Org Context already exists — update it? (y/N)" before modifying
- [ ] AC-9: `onboard-agent.md` explicitly states that org context is NOT inferred from code
- [ ] AC-10: `plugins/dark-factory/agents/onboard-agent.md` is byte-for-byte identical to `.claude/agents/onboard-agent.md`
- [ ] AC-11: `spec-agent.md` instructs the agent to read `## Org Context` when present and apply domain vocabulary in specs
- [ ] AC-12: `spec-agent.md` instructs the agent to include compliance constraints in Migration & Deployment, Business Rules, and Error Handling sections
- [ ] AC-13: `spec-agent.md` instructs the agent to reference PR reviewer handles in implementation notes
- [ ] AC-14: `plugins/dark-factory/agents/spec-agent.md` is byte-for-byte identical to `.claude/agents/spec-agent.md`
- [ ] AC-15: `tests/dark-factory-setup.test.js` contains assertions verifying template structure (AC-1, AC-2, AC-4) and plugin mirror parity (AC-5, AC-6, AC-10, AC-14), wrapped in `DF-PROMOTED-START/END: ao-org-context` markers

## Edge Cases

- EC-1: Profile has `## Org Context` section with only placeholder text (e.g., `{What this team optimizes for...}`) — spec-agent must not emit the placeholder text verbatim in a spec; treat as effectively empty
- EC-2: Org Context `Domain vocabulary` contains a term that conflicts with a term used in the spec template structure (e.g., "spec = test case in our vocabulary") — spec-agent applies the vocabulary to prose only, not to template headings/section names
- EC-3: Re-run on a project where `## Org Context` was added manually (not by onboard-agent) — preserve-on-re-run must still apply; the section header `## Org Context` is the signal, not a metadata marker
- EC-4: Developer provides Org Context on initial onboard but later runs re-onboard and answers "y" to update — the updated content replaces the old content (no append)
- EC-5: `PR reviewer handles` field is empty or absent — spec-agent omits reviewer routing from implementation notes; no error
- EC-6: `Open constraints` mentions a compliance framework (e.g., "HIPAA") — spec-agent must include a constraint note in the Migration & Deployment section even when no migration is otherwise needed (i.e., cannot write N/A without addressing the compliance constraint)
- EC-7: Slim profile is regenerated by df-cleanup after this feature is deployed — slim template extraction rules still produce a slim profile without `## Org Context`; the explicit exclusion comment in the slim template is informational for the agent, not a runtime gate

## Dependencies

- **Depends on**: `ao-design-intent` (onboard-agent changes must be based on the settled version after Design Intent extraction is added — the Phase 6 question step for Org Context must be added after the ao-design-intent Phase changes are stable, to avoid conflicting edits to the same agent section)
- **Group**: `ao-pipeline-improvements`

## Implementation Size Estimate

- **Scope size**: medium (5–6 files touched: `project-profile-template.md`, `project-profile-slim-template.md`, `onboard-agent.md`, `spec-agent.md`, `tests/dark-factory-setup.test.js` — plus 4 plugin mirrors for the templates and agents)
- **Suggested parallel tracks**:
  - Track A: Update `project-profile-template.md` and `project-profile-slim-template.md` (source + plugin mirrors) — 4 file writes, no agent logic
  - Track B: Update `onboard-agent.md` (source + plugin mirror) — add Phase 6 org context question, re-run preservation logic
  - Track C: Update `spec-agent.md` (source + plugin mirror) — add Org Context read and application instructions
  - Track D: Add test assertions to `tests/dark-factory-setup.test.js` — depends on Track A (template structure must be known to write assertions); can run after Track A

## Architect Review Tier

- **Tier**: 2
- **Reason**: 5+ files touched (templates + agents + tests) but no migration section populated, no security/auth domain, no system-wide behavioral change. Cross-cutting concern limited to spec-agent and onboard-agent; other agents (code-agent, architect-agent, debug-agent, test-agent) are not affected.
- **Agents**: 3 domain agents
- **Rounds**: 2

Classification signals:
- Tier 1: ≤ 2 files, no migration section, no security/auth domain, no cross-cutting keywords
- Tier 2: 3–4 files, OR some cross-cutting concerns, not Tier 3 triggers
- Tier 3: 5+ files, OR populated migration section, OR cross-cutting keywords ("all agents", "pipeline", "system-wide"), OR shared templates/test contracts, OR security/auth domain

## Implementation Notes

- Follow the existing dual-write pattern: every change to `.claude/agents/` or `dark-factory/templates/` must be mirrored to `plugins/dark-factory/`. See `dark-factory/project-profile.md` Structural Notes.
- The `## Org Context` section must be added at the end of `project-profile-template.md`, after `## Developer Notes`. It is one of the last sections in the template because it is optional and project-specific.
- The slim template comment must go in the `## Notes` section at the bottom of `project-profile-slim-template.md`, or as an inline comment in the Derivation Rules Summary table (add a row noting the excluded section).
- For `onboard-agent.md`, the org context question step belongs in Phase 6 ("Ask the Developer") — it fits naturally alongside the existing questions about deployment pipelines, fragile areas, and quality bar. Batch it as question 5 (or add it to the existing batch of 3–5 questions). The re-run logic (preserve-on-re-run) must reference the existing incremental refresh pattern (Phase 1, step 2 of the onboard-agent).
- For `spec-agent.md`, add an explicit sub-step to Phase 1 (profile reading step) instructing the agent to read `## Org Context` if present and extract: (a) domain vocabulary map, (b) compliance/open constraints, (c) PR reviewer handles. Then add instructions at Phase 4 (spec writing) to apply these: use vocabulary terms in prose; inject compliance constraints into relevant sections; note reviewer handles in Implementation Notes.
- Test assertions follow the `describe/it` pattern with `assert.ok(content.includes(...))`. See lines 3224–3253 for the `playwright-onboard` pattern as reference.

## Invariants

### Preserves

- INV-TBD-preserve-1 — Plugin mirror parity: any agent or template file in `.claude/agents/` or `dark-factory/templates/` must have an exact byte-for-byte match in `plugins/dark-factory/`. This spec changes 4 files in both locations and the test suite verifies parity. Confirmed: this spec enforces, not weakens, this invariant.

### References

*None — no existing registered invariants in scope beyond the plugin mirror parity invariant above.*

### Introduces

- **INV-TBD-a**
  - **title**: Org Context is developer-authored; agents must not infer it from code
  - **rule**: The `## Org Context` section in project-profile.md MUST be written by the developer or left absent. No agent (including onboard-agent) may populate it via code analysis, inference, or heuristics.
  - **scope.modules**: `.claude/agents/onboard-agent.md`, `plugins/dark-factory/agents/onboard-agent.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (AC-9 assertion)
  - **rationale**: Compliance constraints, team structure, and domain vocabulary are organizational facts that cannot be reliably inferred from code. Incorrect inference would produce misleading profiles and spec errors.

- **INV-TBD-b**
  - **title**: Org Context is absent from the slim profile
  - **rule**: `dark-factory/project-profile-slim.md` and `dark-factory/templates/project-profile-slim-template.md` MUST NOT contain a `## Org Context` section.
  - **scope.modules**: `dark-factory/templates/project-profile-slim-template.md`, `plugins/dark-factory/templates/project-profile-slim-template.md`, `dark-factory/project-profile-slim.md` (runtime artifact)
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (AC-4 assertion)
  - **rationale**: Architect-agents load the slim profile for Tier 1/2 reviews. Org context is for spec writing quality (spec-agent only), not architectural review. Including it in slim profiles would expand token usage without benefit.

### Modifies

*None.*

### Supersedes

*None.*

## Decisions

### References

*None — no existing registered decisions in scope.*

### Introduces

- **DEC-TBD-a**
  - **title**: Org Context read scope limited to spec-agent and onboard-agent
  - **decision**: Only spec-agent (consumption) and onboard-agent (capture) read or write `## Org Context`. All other agents (code-agent, debug-agent, architect-agent, test-agent, promote-agent) do not load or use it.
  - **rationale**: Org context is relevant to spec quality (vocabulary, compliance in specs, reviewer routing). It is not relevant to code implementation, debugging, architectural review, or test execution. Keeping the blast radius minimal reduces the risk of agents applying org-specific terms or constraints in contexts where they don't apply.
  - **alternatives**: Considered making all agents load Org Context. Rejected because: (1) code-agent doesn't need vocabulary hints — it follows spec language; (2) debug-agent investigates code behavior, not org constraints; (3) architect-agent reviews architecture, not team structure; (4) test-agent runs tests, doesn't author them.
  - **scope.modules**: `.claude/agents/spec-agent.md`, `.claude/agents/onboard-agent.md`, `plugins/dark-factory/agents/spec-agent.md`, `plugins/dark-factory/agents/onboard-agent.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (NFR-2 negative assertions)

- **DEC-TBD-b**
  - **title**: Org Context section placement: full profile tail, excluded from slim
  - **decision**: `## Org Context` is placed at the end of `project-profile-template.md` (after `## Developer Notes`). It is explicitly excluded from `project-profile-slim-template.md` with a comment.
  - **rationale**: Placing it last keeps it out of the way for agents that scan the profile sequentially (they find the relevant technical sections first). The explicit slim exclusion comment prevents architect-agents from silently missing org context they don't need.
  - **alternatives**: Considered placing Org Context near the top of the profile for visibility. Rejected because agents (spec-agent, architect-agent) are instructed to read specific sections — moving org context to the top would not change what agents read.
  - **scope.modules**: `dark-factory/templates/project-profile-template.md`, `dark-factory/templates/project-profile-slim-template.md`
  - **domain**: architecture
  - **enforcement**: manual (code review)

### Supersedes

*None.*

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01 |
| FR-2 | P-02 |
| FR-3 | P-03 |
| FR-4 | P-04 |
| FR-5 | P-05, H-05 |
| FR-6 | H-06 |
| FR-7 | P-06, H-07 |
| FR-8 | P-07, H-08 |
| FR-9 | P-08 |
| FR-10 | P-09 |
| FR-11 | P-10, H-01 |
| BR-1 | H-06 |
| BR-2 | P-03, H-03 |
| BR-3 | P-05, H-05 |
| BR-4 | P-08 |
| BR-5 | P-02 |
| BR-6 | P-10, H-01 |
| EC-1 | H-02 |
| EC-2 | H-09 |
| EC-3 | H-05 |
| EC-4 | H-04 |
| EC-5 | H-10 |
| EC-6 | H-08 |
| EC-7 | H-03 |
| AC-1 | P-01 |
| AC-2 | P-01 |
| AC-3 | P-02 |
| AC-4 | P-03 |
| AC-5 | P-09 |
| AC-6 | P-09 |
| AC-7 | P-04 |
| AC-8 | P-05 |
| AC-9 | H-06 |
| AC-10 | P-09 |
| AC-11 | P-06 |
| AC-12 | P-07 |
| AC-13 | P-08 |
| AC-14 | P-09 |
| AC-15 | P-09 |
