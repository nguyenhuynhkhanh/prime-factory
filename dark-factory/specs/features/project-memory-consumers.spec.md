# Feature: project-memory-consumers

## Context

Dark Factory's cleanup pipeline deletes spec artifacts after promotion. Agents do not read git history. As a result, invariants established by one feature can be silently regressed by the next, past architectural decisions can be silently contradicted, and the "memory" of a feature evaporates the moment it ships.

The parent feature — **Project Memory** — introduces a persistent registry at `dark-factory/memory/` (three files: `invariants.md`, `decisions.md`, `ledger.md`) that survives cleanup. This registry is written EXCLUSIVELY by promote-agent at promotion time. Every other agent that drafts, reviews, or implements code reads it.

This sub-spec covers the **READ side** of project memory: the four consumer agents (`spec-agent`, `architect-agent`, `code-agent`, `debug-agent`) and the spec template that must declare memory references and candidate entries. No agent covered by this spec writes to the memory registry — they only read, reference, and propose.

The critical piece is the architect-agent's **per-domain invariant/decision probe**: rather than adding a fourth parallel architect (which would change the existing 3-domain review orchestration in implementation-agent), memory entries carry a `domain: security|architecture|api` field, and each domain reviewer only probes entries matching their domain. This preserves the existing parallel-review architecture while giving every invariant and decision a defender.

## Scope

### In Scope (this spec)

**Consumer agent changes (4 agents):**
- `.claude/agents/spec-agent.md` — Phase 1 memory load + drafting rules for the new spec sections (`## Invariants`, `## Decisions`).
- `.claude/agents/architect-agent.md` — per-domain invariant/decision probe in Round 1 with explicit BLOCKER/SUGGESTION rules and per-domain findings format.
- `.claude/agents/code-agent.md` — Phase 1 memory load + constraint-awareness rule (memory describes constraints; it is NOT a hint about holdout tests).
- `.claude/agents/debug-agent.md` — Phase 1 memory load + advisory cross-reference in root cause analysis (minor change; report structure unchanged otherwise).

**Template change:**
- `dark-factory/templates/spec-template.md` — add `## Invariants` and `## Decisions` sections with subsection structure (`Preserves`, `References`, `Introduces`, `Modifies`, `Supersedes`).

**Plugin mirrors (same content as source):**
- `plugins/dark-factory/agents/spec-agent.md`
- `plugins/dark-factory/agents/architect-agent.md`
- `plugins/dark-factory/agents/code-agent.md`
- `plugins/dark-factory/agents/debug-agent.md`
- `plugins/dark-factory/templates/spec-template.md`

**Test coverage:**
- `tests/dark-factory-setup.test.js` — new assertions that each consumer agent reads memory in Phase 1, that the spec-agent drafts memory sections in output, that the architect-agent per-domain probe is specified with BLOCKER rules, that the spec-template exposes the new sections, and that missing-memory graceful degradation language is present in each consumer.
- `tests/dark-factory-contracts.test.js` — new assertions that extend the plugin mirror comparison to cover all 5 changed source files (4 agents + 1 template).

### Out of Scope (explicitly deferred)

- Creating the `dark-factory/memory/` directory skeleton — owned by `project-memory-foundation`.
- Defining the YAML frontmatter schema for memory entries — owned by `project-memory-foundation`.
- Populating memory entries — `project-memory-onboard` does initial extraction from profile/code-map during Phase 3.7; `project-memory-lifecycle` handles write-through by promote-agent.
- promote-agent changes (materializing `INV-TBD-*`/`DEC-TBD-*` into sequential IDs, writing to memory files, ledger appends, supersession) — owned by `project-memory-lifecycle`.
- test-agent `mode` parameter, full-suite gate, and advisor mode — owned by `project-memory-lifecycle`.
- onboard-agent Phase 3.7 extraction + sign-off + retrobackfill — owned by `project-memory-onboard`.
- Memory-related changes to `df-*` skill files — none are planned; consumer agents are the only read points.
- Changes to `implementation-agent.md` — the 3-domain parallel review orchestration does NOT change; only the architect-agent's per-domain logic adds a memory probe. Owned by `project-memory-lifecycle` if orchestration ever needs to surface memory status in the synthesized review summary.

### Scaling Path

If the registry grows past ~200 entries per domain, the architect's per-domain probe could add a filter step (e.g., restrict to entries whose `scope.modules` overlap with the spec's touched modules) before evaluation. For v1, the filter happens inside each domain reviewer's prompt and is a reading discipline, not a structural change. The per-domain split gives horizontal scaling for free: new domains (e.g., `performance`, `data-integrity`) can be added without changing consumer agents — only the architect domain parameter would need to expand.

## Requirements

### Functional

- **FR-1: spec-agent Phase 1 memory load.** spec-agent MUST read all three memory files (`dark-factory/memory/invariants.md`, `dark-factory/memory/decisions.md`, `dark-factory/memory/ledger.md`) in Phase 1 (Understand the Request), alongside project-profile.md and code-map.md. If any file is missing, treat as "registry not yet populated" and log a warning; do NOT block.
- **FR-2: spec-agent references existing memory.** During spec drafting, if the spec's scope touches entities/modules referenced by an existing invariant or decision, spec-agent MUST list that entry by ID under the appropriate subsection: `## Invariants > Preserves` (rule continues to hold) or `## Invariants > References` (relevant but not directly enforced by this spec). Same structure for decisions.
- **FR-3: spec-agent declares new candidates.** If the spec introduces new cross-cutting rules, spec-agent MUST add them under `## Invariants > Introduces` (or `## Decisions > Introduces`) using placeholder IDs `INV-TBD-a`, `INV-TBD-b`, `DEC-TBD-a`, etc. (lowercase letters, sequential within this spec). Each candidate MUST include all required schema fields: `title`, `rule`, `scope` (modules/endpoints/entities), `domain` (security|architecture|api), and either `enforced_by: <test-path>` OR `enforcement: runtime|manual` (escape hatch), plus `rationale`.
- **FR-4: spec-agent declares modifications and supersessions.** If the spec intentionally changes an existing entry, spec-agent MUST declare it under `## Invariants > Modifies` (narrowing/adjusting) or `## Invariants > Supersedes` (replacing). Both require a mandatory `rationale`. Supersession uses the form `INV-TBD-X supersedes INV-NNNN`. Same structure for decisions.
- **FR-5: Empty memory sections are valid.** If the spec neither references nor introduces any invariants or decisions, the sections MUST still appear with explicit prose: `"None — this spec neither references nor introduces invariants."` (and equivalent for decisions). Silent omission is NOT permitted.
- **FR-6: architect-agent per-domain probe.** Each architect-agent spawned with a `domain` parameter MUST perform an invariant/decision probe restricted to entries whose `domain` field matches their own (security reviewer checks `domain: security`; architecture checks `domain: architecture`; api checks `domain: api`). Entries with no `domain` field default to `security` (safer). The probe MUST happen in Round 1 (initial review) and MUST re-run if the spec is updated in subsequent rounds.
- **FR-7: architect-agent findings format.** Each domain reviewer MUST emit a `### Memory Findings (<domain>)` block in their domain review file, with exactly these five categories (each can be empty-line "none"):
  - `Preserved: <IDs> — verified, <brief reason>`
  - `Modified (declared in spec): <ID> → rationale sound | concern | BLOCKER`
  - `Potentially violated (BLOCKER): <ID> — <how>`
  - `New candidates declared: <INV-TBD-X> (reviewed: fields complete | missing <field> — BLOCKER)`
  - `Orphaned (SUGGESTION only): <ID> — <referenced entity removed>`
- **FR-8: architect-agent BLOCKER rules.** The following MUST be treated as BLOCKERs by the domain reviewer that owns them:
  - Active invariant/decision in this domain is violated by the spec WITHOUT an explicit `Modifies` or `Supersedes` declaration.
  - A `Modifies` or `Supersedes` declaration in the spec has incomplete rationale or missing required schema fields.
  - A new candidate `INV-TBD-*` / `DEC-TBD-*` is missing a required schema field (title, rule, scope, domain, enforced_by-or-escape, rationale).
- **FR-9: architect-agent SUGGESTION rule.** Orphaned invariants/decisions (active entry whose `scope.modules` all reference files that have been deleted from the codebase) MUST be reported as SUGGESTION only, NEVER as a blocker. The suggestion is "consider retiring INV-NNNN in a future spec."
- **FR-10: code-agent Phase 1 memory load.** code-agent MUST read all three memory files in its general-patterns/Phase-1 step, alongside project-profile.md and code-map.md. Missing files: treat as "registry not yet populated", log warning, proceed.
- **FR-11: code-agent constraint filtering.** For each invariant/decision whose `scope.modules` overlaps with files code-agent will modify, code-agent MUST treat the entry's `rule` + `rationale` as a HARD CONSTRAINT on its implementation. Violating such a constraint is permitted ONLY IF the spec explicitly declares supersession or modification of that entry — in which case the spec's declaration is the authoritative override.
- **FR-12: code-agent constraint-awareness rule (information barrier).** The code-agent prompt MUST include a clear, unambiguous statement: *"Memory describes architectural constraints on your implementation; it does NOT enumerate what is tested. Do NOT use the `enforced_by` field in memory entries to infer holdout scenarios or test coverage."* This is a hard information-barrier rule.
- **FR-13: debug-agent Phase 1 memory load.** debug-agent MUST read all three memory files in Phase 2 (Investigate the Codebase), alongside project-profile.md and code-map.md. Missing files: treat as "registry not yet populated", log warning, proceed.
- **FR-14: debug-agent invariant cross-reference.** During root cause analysis (Phase 3), debug-agent MUST check whether the bug symptom or root cause maps to a known invariant. If a match is found, debug-agent MUST include a one-line note in the root cause section: "This bug is an invariant violation: INV-NNNN (<title>) — <how the bug violates it>." This is advisory; it does not change the debug report template structure.
- **FR-15: spec-template sections.** `dark-factory/templates/spec-template.md` MUST contain `## Invariants` and `## Decisions` sections. Each section MUST list its subsections inline with example prose:
  - `## Invariants`: `Preserves`, `References`, `Introduces`, `Modifies`, `Supersedes`
  - `## Decisions`: `References`, `Introduces`, `Supersedes` (no `Preserves`/`Modifies` — decisions are historical and either referenced or superseded)
- **FR-16: Plugin mirror parity.** All 5 changed source files MUST be mirrored exactly to their `plugins/dark-factory/` counterparts. Contracts test enforces byte-identical content.
- **FR-17: Graceful degradation across all consumers.** If the `dark-factory/memory/` directory does not exist, or any of the three files is missing or empty, every consumer (spec-agent, architect-agent, code-agent, debug-agent) MUST: (a) log a single-line warning identifying which file is missing, (b) treat the set of entries as empty, (c) proceed with its normal work. No consumer may crash, block, or refuse to run because memory is absent.
- **FR-18: Architect probe skipped when registry missing.** When memory files are missing, the architect's per-domain probe is skipped rather than treated as "no violations found." Each domain reviewer MUST emit a single line in their review: `Memory probe skipped — registry missing.` No BLOCKER may be issued on memory grounds when the registry is absent.

### Non-Functional

- **NFR-1: Single read per agent.** Each consumer reads the three memory files at most once per agent invocation (Phase 1/Phase 2 load). No per-decision or per-hunk re-reads.
- **NFR-2: No token explosion.** Consumer agents reference memory entries by ID (not full text) whenever they cite an entry in output. This keeps spec/review sizes bounded as the registry grows.
- **NFR-3: Deterministic domain classification.** The default-to-security rule for unclassified entries MUST be explicit in the architect-agent prompt so that domain ownership is never ambiguous at runtime.

## Data Model

No schema changes in this sub-spec. The memory file schema is defined by `project-memory-foundation`. This spec only READS the schema — the fields consumer agents rely on are:
- `id` (INV-NNNN / DEC-NNNN — sequential, assigned by promote-agent)
- `title`, `rule` (or `decision`), `rationale`
- `scope.modules[]` (used by code-agent to filter constraints; used by architect to detect orphaned entries)
- `domain` (used by architect to partition the probe across reviewers)
- `enforced_by` | `enforcement` (validated by architect; NOT used by code-agent for test inference)
- `status` (active | modified | superseded — architect skips non-active entries for violation checks; architect flags modifications/supersessions declared in the spec)

## Migration & Deployment

**Existing data.** This sub-spec introduces new sections to the spec template and new Phase 1 load steps in four agents. There are no historical spec files in active flight that would need retrofitting (cleaned specs are deleted; active specs are either pre-memory or will be rewritten through the new spec-agent). The only "stale data" class is:
- **Active specs authored before this change.** These may lack `## Invariants` / `## Decisions` sections. The architect-agent MUST tolerate their absence: if the spec has no memory sections at all, architect logs "Spec predates memory sections — probe limited to codebase evidence; no candidate/modification validation." This is NOT a blocker; it is a compatibility mode.
- **Ongoing specs that get re-spawned into spec-agent during architect rounds after deployment.** If the architect-agent is using the new logic but the spec file was drafted under the old template, the first architect round SHOULD note the missing sections as a `SUGGESTION` (`Spec uses legacy template — memory sections absent. If new invariants are introduced, request spec update via respawn.`), NOT as a BLOCKER. This prevents the migration from stalling the pipeline.

**Rollback plan.** If any consumer agent regresses after this change ships, revert the specific `.claude/agents/*.md` file and its plugin mirror. No persistent state is written; rollback is pure prompt revert.

**Zero-downtime.** Yes. Agent prompts are read at spawn time; next agent invocation picks up the change. No running process to restart.

**Deployment order.** This sub-spec depends on `project-memory-foundation` having:
1. Created the `dark-factory/memory/` directory (skeleton files acceptable, empty body acceptable).
2. Defined the YAML frontmatter schema in `dark-factory/templates/project-memory-template.md`.
3. Added the memory load directive to `.claude/rules/dark-factory-context.md`.

If foundation has not deployed, the consumer agents ship with the graceful-degradation path active — they warn and proceed with an empty registry. Once foundation deploys, consumers transparently pick up the populated files.

**Stale data/cache.** N/A — no caches or derived data.

**Plugin mirror sync.** After modifying any of the 5 source files, the identical content MUST be written to the `plugins/dark-factory/` counterpart in the same commit. Contracts test enforces exact content parity.

## API Endpoints

N/A — no API endpoints. This feature modifies agent prompts and a template file.

## Business Rules

- **BR-1: spec-agent is never the writer.** spec-agent declares candidates and references but NEVER writes to `dark-factory/memory/*`. Only promote-agent writes. This keeps the registry append-only and tied to shipped features.
- **BR-2: Per-domain probe ownership is absolute.** An invariant/decision is checked by EXACTLY ONE architect domain reviewer — the one whose domain matches the entry's `domain` field. No cross-domain duplication. No escalation across domains. (Contradictions between domain reviewers that happen to surface the same entry are resolved by implementation-agent's existing strictest-wins synthesis.)
- **BR-3: Violations in a domain are owned by that domain.** If security-domain reviewer finds a security-domain invariant violated, ONLY the security reviewer emits the BLOCKER. The architecture and api reviewers do not restate it. This keeps blocker counts accurate.
- **BR-4: Memory-silent spec is architecturally valid.** A spec with empty `## Invariants` and `## Decisions` sections (explicit "None —" prose) is a valid spec. Architect-agent does not treat empty sections as incomplete; it treats missing sections as legacy (migration-mode suggestion, not blocker).
- **BR-5: Code-agent does not reason about test coverage from memory.** The `enforced_by` field exists for human readers and for architect validation. The code-agent's prompt explicitly forbids using it as a signal about what is or is not in the holdout scenario set. This is an information-barrier rule on par with "NEVER read holdout scenarios."
- **BR-6: TBD IDs are spec-local.** `INV-TBD-a`, `INV-TBD-b` are unique within a single spec, not globally. Two concurrent specs can each declare `INV-TBD-a` without conflict — promote-agent assigns the permanent sequential ID at promotion.
- **BR-7: Unclassified entries default to security.** If an invariant/decision lacks a `domain` field (legacy entry, author oversight), the security-domain reviewer owns it. Rationale: security is the safest default — the worst outcome of over-scrutinizing a non-security entry is a SUGGESTION; the worst outcome of under-scrutinizing a security entry is a production incident.
- **BR-8: No supersession cascade.** When spec-X supersedes INV-0005 with INV-TBD-a, the architect validates that declaration but does NOT recursively check entries that referenced INV-0005. Cascade handling is a `project-memory-lifecycle` concern (if ever). For v1, the author of the superseding spec is responsible for listing any cascading references; architect flags suspicious patterns as SUGGESTION.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| `dark-factory/memory/` directory missing | Every consumer logs: `"Memory registry not found at dark-factory/memory/ — proceeding with empty set"`; architect additionally emits `"Memory probe skipped — registry missing."` in domain review | No BLOCKER; pipeline proceeds |
| Only `invariants.md` missing (other two present) | Log: `"Memory file missing: dark-factory/memory/invariants.md — treating invariants as empty"`; decisions and ledger still consulted | No BLOCKER |
| Memory file exists but is empty/header-only | Treat as "no entries" — no warning (valid post-foundation state before first promotion) | Normal flow |
| Memory file has malformed YAML frontmatter | Log: `"Memory file parse error: <file>:<line> — skipping malformed entry, proceeding with remaining entries"`; skip the malformed entry only | SUGGESTION on the next review: "memory file contains malformed entry; recommend `/df-cleanup` or manual fix" |
| Active invariant in this spec's scope violated without declaration | Architect domain reviewer that owns the entry's domain emits BLOCKER with entry ID + how-violated evidence | Spec-agent respawned with BLOCKER finding; round count increments |
| Candidate `INV-TBD-X` missing required field | Architect domain reviewer (whichever domain the candidate claims) emits BLOCKER listing missing fields | Spec-agent respawned to complete fields |
| `Modifies`/`Supersedes` declaration without rationale | Architect BLOCKER: "Modification/supersession without rationale" | Spec-agent respawned |
| Orphaned invariant (scope.modules all deleted) | Architect SUGGESTION only: "consider retiring INV-NNNN in a future spec" | Does NOT block |
| code-agent touches file covered by active invariant in a superseded spec | code-agent respects the NEW rule (as declared in the current spec); ignores the superseded entry | Normal flow — supersession is the override mechanism |
| spec-agent drafts spec without `## Invariants` / `## Decisions` sections | Architect SUGGESTION: "Spec uses legacy template — memory sections absent." Not a blocker during migration window | spec-agent should add empty sections on respawn |
| Architect spawned without domain parameter (full review mode) | Architect performs the memory probe across ALL domains in a single pass, same findings format but grouped per-domain inside one review file | Backward-compatible with single-architect mode |

## Acceptance Criteria

- [ ] **AC-1**: `.claude/agents/spec-agent.md` Phase 1 explicitly reads `dark-factory/memory/invariants.md`, `dark-factory/memory/decisions.md`, `dark-factory/memory/ledger.md`, with missing-file graceful degradation language.
- [ ] **AC-2**: `.claude/agents/spec-agent.md` drafting section instructs the agent to produce `## Invariants` and `## Decisions` sections in the spec, including the `Preserves / References / Introduces / Modifies / Supersedes` subsections.
- [ ] **AC-3**: `.claude/agents/spec-agent.md` specifies `INV-TBD-*` / `DEC-TBD-*` placeholder ID convention (letters, spec-local).
- [ ] **AC-4**: `.claude/agents/architect-agent.md` per-domain section specifies the invariant/decision probe, including the domain-filtered probe, the `### Memory Findings` emission format, the BLOCKER rules (FR-8), and the SUGGESTION rule for orphaned entries (FR-9).
- [ ] **AC-5**: `.claude/agents/architect-agent.md` describes the migration-compatibility behavior (legacy specs without sections = SUGGESTION, not blocker) and the registry-missing behavior (probe skipped, noted in review).
- [ ] **AC-6**: `.claude/agents/code-agent.md` General Patterns / Phase 1 includes memory load with graceful degradation.
- [ ] **AC-7**: `.claude/agents/code-agent.md` includes the constraint-awareness rule: memory entries whose `scope.modules` overlap with modified files become hard constraints; explicit statement that memory is NOT a signal about test coverage.
- [ ] **AC-8**: `.claude/agents/debug-agent.md` Phase 2 includes memory load with graceful degradation.
- [ ] **AC-9**: `.claude/agents/debug-agent.md` Phase 3 instructs the debug-agent to cross-reference the root cause against known invariants and note matches in the root cause analysis section.
- [ ] **AC-10**: `dark-factory/templates/spec-template.md` contains `## Invariants` and `## Decisions` sections with their subsection structure and "None — ..." example prose for empty cases.
- [ ] **AC-11**: Plugin mirrors for all 5 files byte-identical to source.
- [ ] **AC-12**: `tests/dark-factory-setup.test.js` contains assertions covering AC-1 through AC-10 (structural string-matching style consistent with existing test patterns).
- [ ] **AC-13**: `tests/dark-factory-contracts.test.js` extends the plugin mirror suite to cover all 5 changed files.
- [ ] **AC-14**: All 331+ existing tests still pass (no regression).

## Edge Cases

- **EC-1**: Memory directory exists but all three files are empty (post-foundation, pre-first-promotion). Every consumer proceeds normally with zero entries; architect's per-domain probe produces `Memory Findings (<domain>)` blocks with "none" in every category. NO warning — empty is a valid post-bootstrap state.
- **EC-2**: Only one of three memory files missing (e.g., `ledger.md` removed manually). Consumers log a targeted warning naming the missing file; they still read the two present files. Architect probe runs against the present files only.
- **EC-3**: Memory file has malformed YAML frontmatter in one entry. Consumers skip the malformed entry and continue processing the rest of the file. Architect emits a SUGGESTION about the malformed entry.
- **EC-4**: An active invariant's `scope.modules` list includes a file that has since been deleted. Architect flags it as SUGGESTION (orphaned), NOT BLOCKER. If ALL files in scope are deleted, still SUGGESTION only.
- **EC-5**: Spec-agent drafts a candidate `INV-TBD-a` with `domain: performance` (a domain that does not map to any architect reviewer). Architect's default-to-security rule promotes the entry into the security reviewer's queue. Security reviewer emits the findings and may suggest the author pick one of the three valid domains.
- **EC-6**: Spec-agent is respawned by architect after round 1 and adds a new candidate `INV-TBD-c`. Round 2 architect re-runs the probe against the updated spec — must detect the new candidate and validate its fields. (Probe re-runs on every architect round when spec changes.)
- **EC-7**: Two concurrent specs in different worktrees each declare `INV-TBD-a`. No conflict — TBD IDs are spec-local. Promote-agent (future spec) resolves to distinct sequential IDs at promotion time.
- **EC-8**: Spec supersedes `INV-0003` with `INV-TBD-a`, but the `Modifies` subsection also lists `INV-0003` (author confusion). Architect BLOCKER: "INV-0003 cannot be both modified and superseded — clarify which is intended."
- **EC-9**: code-agent must modify a file that appears in `scope.modules` of an active invariant whose `domain: security`. code-agent does NOT care about the domain field — it treats the invariant as a constraint regardless of who "owns" it in architect review.
- **EC-10**: code-agent sees a memory entry where `enforced_by: tests/auth/foo.test.js` references a test file that code-agent is asked to create. code-agent MUST NOT infer what the test asserts from memory; it MUST read the spec and public scenarios for behavior and only use memory's `rule` and `rationale` for constraint purposes. The `enforced_by` path is informational for humans and architect; code-agent treats it as opaque.
- **EC-11**: debug-agent investigates a bug and finds the root cause matches `INV-0007`. debug-agent adds the one-line note in root cause analysis. The debug report template structure does NOT change — the note is embedded inline, not a new section.
- **EC-12**: Legacy spec (authored before this feature ships) is handed to architect-agent for review. It has no `## Invariants` / `## Decisions` sections. Architect emits SUGGESTION (not BLOCKER): "Spec uses legacy template — memory sections absent. If new invariants are introduced, request spec update via respawn."
- **EC-13**: Architect spawned WITHOUT a domain parameter (legacy single-reviewer mode) encounters memory. It performs the probe across all three domains in a single pass and groups findings per-domain inside one review file. Backward-compatible.
- **EC-14**: Memory entry has `status: modified` (not `active`). Architect does NOT check it for violations (because it is no longer the canonical rule) but DOES surface it in `Preserved` if the spec explicitly references it, or in `Orphaned` if no one references it and all scope files are deleted.
- **EC-15**: Adversarial spec — the spec-agent's output declares a supersession of `INV-0001` with a one-word rationale ("refactor"). Architect BLOCKER: "Supersession rationale insufficient — must explain why the invariant no longer holds and what replaces it."

## Dependencies

- **Depends on**: `project-memory-foundation` — needs the memory directory, file skeletons, YAML schema, and the `.claude/rules/dark-factory-context.md` load directive in place so consumer agents know what shape to expect. Without foundation, consumers are in graceful-degradation mode permanently (which is acceptable but provides no value until foundation ships).
- **Depended on by**:
  - `project-memory-onboard` — once onboard populates invariants/decisions, the consumer agents defined here start doing real work against real entries.
  - `project-memory-lifecycle` — promote-agent writes memory; the validation that promote-agent's writes are correctly shaped depends on the schema fields consumer agents here require.
- **Group**: `project-memory`
- **Wave**: Wave 2 (parallel with `project-memory-onboard`, after Wave 1 foundation).

## Implementation Size Estimate

- **Scope size**: medium-to-large — 12 files total (5 source + 5 plugin mirrors + 2 test file edits). Individual agent edits are small to medium (sections added, no refactor).
- **Suggested parallel tracks**: 3 tracks with minimal file overlap.

  **Track A: spec-agent + spec-template (2 files + 2 mirrors + test assertions for those)**
  - Files: `.claude/agents/spec-agent.md`, `plugins/dark-factory/agents/spec-agent.md`, `dark-factory/templates/spec-template.md`, `plugins/dark-factory/templates/spec-template.md`
  - Test additions: AC-1, AC-2, AC-3, AC-10 assertions in `tests/dark-factory-setup.test.js`; mirror parity for spec-agent and spec-template in `tests/dark-factory-contracts.test.js`.

  **Track B: architect-agent (1 file + 1 mirror + test assertions)**
  - Files: `.claude/agents/architect-agent.md`, `plugins/dark-factory/agents/architect-agent.md`
  - Test additions: AC-4, AC-5 assertions; mirror parity for architect-agent.

  **Track C: code-agent + debug-agent (2 files + 2 mirrors + test assertions)**
  - Files: `.claude/agents/code-agent.md`, `plugins/dark-factory/agents/code-agent.md`, `.claude/agents/debug-agent.md`, `plugins/dark-factory/agents/debug-agent.md`
  - Test additions: AC-6, AC-7, AC-8, AC-9 assertions; mirror parity for code-agent and debug-agent.

  **Shared test files.** Both `tests/dark-factory-setup.test.js` and `tests/dark-factory-contracts.test.js` are edited by all three tracks. Each track appends its own assertions to distinct sections of each file — no line-level overlap is expected. If the implementation-agent detects write contention, run the test-append step serially at merge time. Track A goes first, then B, then C to minimize rebase friction.

- **File overlap between tracks**: zero on agent/template sources. Test files are shared but appended-to in distinct zones.

## Implementation Notes

**Where to place Phase 1 memory load in each agent.** Follow the existing pattern: every consumer already reads `dark-factory/project-profile.md` and `dark-factory/code-map.md` at the top of its process. Add the three memory file reads immediately after those existing reads, in the SAME step. Same file-missing-graceful-degrade language.

**Where to place the architect per-domain probe.** The architect-agent has a "Domain Parameter" section near the top and a "Step 1: Deep Review" section. Add the memory probe as a numbered substep at the END of Step 1 (after reading profile, code-map, and the spec). The findings emission (Step 3) already has a domain-review-file format block — add the `### Memory Findings (<domain>)` template inside the existing domain review file structure.

**Spec-agent drafting guidance.** The spec-agent currently has Phase 4: Write the Spec. Add a sub-bullet that says "If the spec's scope touches any module referenced in memory entries, populate `## Invariants > Preserves` or `References`. If the spec introduces new cross-cutting rules, populate `## Invariants > Introduces` with `INV-TBD-*` placeholders. If the spec intentionally changes or retires an existing entry, populate `Modifies` or `Supersedes` with mandatory rationale." The subsections go in the spec template so the agent has a concrete target to fill.

**Code-agent constraint-awareness rule placement.** code-agent has a "General Patterns" section with existing information-barrier statements. Add the constraint-awareness rule there as a bulleted item, phrased explicitly: *"Memory describes architectural constraints on your implementation; it does NOT enumerate what is tested. Do NOT use memory's `enforced_by` field to infer holdout scenarios or test coverage — that is a holdout leak and is forbidden."*

**Debug-agent minor edit.** Add one sentence in Phase 3 (Root Cause Analysis) under step 5: *"Cross-reference the root cause against known invariants in `dark-factory/memory/invariants.md`. If a match is found, add a one-line note in the debug report's root cause section: 'This bug is an invariant violation: INV-NNNN — <how>.'"*

**Test file patterns.** Match the style of existing assertions in `tests/dark-factory-setup.test.js`. For each new assertion, use `assert.ok(content.includes("..."))` with the exact phrase from the agent prompt. For plugin mirror parity, extend the existing file-list in the mirror-consistency suite.

**Token budget.** Adding memory load and the probe sections should add ~80-150 lines per agent. Overall token-cap test should still pass (the test budgets in `dark-factory-setup.test.js` have headroom; verify with `node --test tests/dark-factory-setup.test.js` after each track lands).

## Invariants

### Preserves
*None — the memory registry does not yet contain active invariants at the time this spec is authored. Once `project-memory-foundation` and `project-memory-onboard` complete and populate the registry, a re-review of this spec would populate this subsection with any invariants whose scope overlaps with the four consumer agents or the spec template.*

### References
*None — no existing registered invariants in scope for this spec.*

### Introduces

- **INV-TBD-a**
  - **title**: Every consumer agent treats missing memory as warn-and-proceed
  - **rule**: When any of the three memory files (`invariants.md`, `decisions.md`, `ledger.md`) is missing or empty, spec-agent, architect-agent, code-agent, and debug-agent MUST log a single-line warning identifying the missing file and MUST proceed with their normal work treating the entry set as empty. None may block, crash, or refuse to run on account of missing memory.
  - **scope.modules**: `.claude/agents/spec-agent.md`, `.claude/agents/architect-agent.md`, `.claude/agents/code-agent.md`, `.claude/agents/debug-agent.md`, and their plugin mirrors
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (assertion: each of the four agents contains graceful-degradation language referencing missing memory files)
  - **rationale**: Memory is a strictly-additive registry. Breaking agent invocation when the registry is absent would couple the foundation rollout to the consumer rollout and create a bootstrapping deadlock (foundation cannot populate until consumers run; consumers cannot run until foundation is populated). Warn-and-proceed decouples them.

- **INV-TBD-b**
  - **title**: code-agent memory load is for constraint awareness only, never for test inference
  - **rule**: code-agent MUST NOT use any field of a memory entry — especially `enforced_by` — to infer what scenarios are in the holdout set, what assertions the holdout tests make, or what test coverage exists. Memory provides `rule` and `rationale` as hard constraints on implementation; all other fields are opaque from code-agent's perspective.
  - **scope.modules**: `.claude/agents/code-agent.md`, `plugins/dark-factory/agents/code-agent.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (assertion: code-agent prompt contains the explicit barrier statement about `enforced_by` and test inference)
  - **rationale**: The holdout-test information barrier is a foundational Dark Factory guarantee. Memory introduces a new field (`enforced_by`) that POINTS AT test files. Without an explicit prohibition, code-agent could regress to test-inference — defeating the whole point of holdout isolation. This invariant makes the barrier explicit and testable.

- **INV-TBD-c**
  - **title**: Architect invariant-probe is per-domain; each domain owns violations in its domain
  - **rule**: When architect-agent is spawned with a `domain` parameter, its invariant/decision probe MUST cover ONLY entries whose `domain` field matches the reviewer's assigned domain. Violations in a domain MUST be reported by that domain's reviewer alone; no cross-domain restating. Unclassified entries default to the security domain.
  - **scope.modules**: `.claude/agents/architect-agent.md`, `plugins/dark-factory/agents/architect-agent.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (assertion: architect-agent prompt contains per-domain probe language, the default-to-security rule, and the "do not cross-state" discipline)
  - **rationale**: A fourth parallel domain would require changing `implementation-agent`'s orchestration of the three architect reviewers. Splitting the probe across existing domains preserves the orchestration shape. Clear per-domain ownership keeps blocker counts accurate (no double-counting) and makes it clear who re-reviews after a respawn.

### Modifies
*None.*

### Supersedes
*None.*

## Decisions

### References
*None — no existing decisions in scope.*

### Introduces

- **DEC-TBD-a**
  - **title**: Invariant-probe split across 3 existing architect domains (not a 4th parallel domain)
  - **decision**: The architect invariant/decision probe is performed by the three existing domain reviewers (security, architecture, api), each restricted to entries matching their own domain via the `domain` field. No fourth parallel architect is introduced.
  - **scope.modules**: `.claude/agents/architect-agent.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (assertion: architect spawn flow and domain assignment remain 3-parallel; architect prompt specifies the per-domain filter)
  - **rationale**: Preserves consistency with the existing parallel review architecture that `implementation-agent` orchestrates. Alternatives considered and rejected:
    - **Attach memory probe to Security only.** Rejected: poor scaling — the security reviewer would shoulder architecture and API invariants, diluting their focus and extending their review time past the other two reviewers (blocking the synthesis).
    - **Introduce a fourth parallel domain (memory reviewer).** Rejected: requires updating `implementation-agent`'s orchestration, round timing, and synthesis logic — a cross-cutting change that this sub-spec is not allowed to make (implementation-agent is owned by `project-memory-lifecycle`).
    - **Serial probe after the three domain reviews synthesize.** Rejected: adds a fourth round, extending the pipeline by ~1 round of latency.

- **DEC-TBD-b**
  - **title**: code-agent reads memory files directly (not via filtered summary passed through prompt)
  - **decision**: code-agent reads `dark-factory/memory/*` in its Phase 1 context load, exactly as it already reads project-profile.md and code-map.md. The implementation-agent does NOT pre-filter or summarize memory into the code-agent's prompt.
  - **scope.modules**: `.claude/agents/code-agent.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (assertion: code-agent prompt references memory files directly; no mention of an external filter or summary mechanism)
  - **rationale**: Consistency with the existing Phase 1 load pattern (profile + code-map). The alternative — implementation-agent filtering memory to only the entries relevant to this spec and injecting them into the code-agent prompt — was rejected because:
    1. It couples implementation-agent to the memory schema (schema changes ripple into orchestrator logic).
    2. The filter logic would duplicate architect's per-domain filtering, risking drift.
    3. Direct read is simpler to test (string-matching assertions on the agent prompt) and simpler to degrade (graceful missing-file handling lives in one place).
  - The risk of this direct-read approach — that code-agent could exploit `enforced_by` paths for test inference — is mitigated by the explicit constraint-awareness rule (see INV-TBD-b).

### Supersedes
*None.*

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 (spec-agent Phase 1 load) | P-01 |
| FR-2 (spec-agent references existing memory) | P-02, H-06 |
| FR-3 (spec-agent declares candidates) | P-03 |
| FR-4 (spec-agent declares mods/supersessions) | P-04, H-08 |
| FR-5 (empty memory sections valid) | P-05 |
| FR-6 (architect per-domain probe) | P-06, H-01 |
| FR-7 (architect findings format) | P-06, P-07 |
| FR-8 (architect BLOCKER rules) | H-01, H-02, H-03 |
| FR-9 (architect SUGGESTION rule) | P-07, H-04 |
| FR-10 (code-agent Phase 1 load) | P-08 |
| FR-11 (code-agent constraint filtering) | P-08, H-09 |
| FR-12 (code-agent constraint-awareness rule) | P-09, H-05 |
| FR-13 (debug-agent Phase 1 load) | P-10 |
| FR-14 (debug-agent invariant cross-reference) | P-10, H-07 |
| FR-15 (spec-template sections) | P-11 |
| FR-16 (plugin mirror parity) | P-12 |
| FR-17 (graceful degradation across consumers) | P-13, H-10 |
| FR-18 (architect probe skipped when missing) | P-13, H-10 |
| BR-1 | P-03 (spec-agent declares but does not write) |
| BR-2, BR-3 | H-01, H-11 |
| BR-4 | P-05 |
| BR-5 | P-09, H-05 |
| BR-6 | H-08 (TBD IDs are spec-local) |
| BR-7 | H-11 (default-to-security) |
| BR-8 | H-12 (no cascade) |
| EC-1 | P-05, P-13 |
| EC-2 | H-10 |
| EC-3 | H-13 |
| EC-4 | P-07, H-04 |
| EC-5 | H-11 |
| EC-6 | H-14 |
| EC-7 | H-08 |
| EC-8 | H-15 |
| EC-9 | P-08 |
| EC-10 | H-05 (adversarial information barrier) |
| EC-11 | P-10 |
| EC-12 | H-16 |
| EC-13 | H-17 |
| EC-14 | H-18 |
| EC-15 | H-03 |
| AC-1 through AC-14 | Covered collectively by P-01..P-13, H-01..H-18 and test-suite presence |
