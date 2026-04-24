# Feature: project-memory-foundation

## Context

Dark Factory's cleanup phase deletes spec artifacts once a feature is promoted. Agents do not read git history for context. This causes three recurring failures:

1. New features silently break existing invariants that no one remembers declaring (e.g., "every employee must have a phone number").
2. New features contradict past architectural decisions (e.g., "we validate at middleware, not in services") without anyone noticing at review time.
3. The framework has no durable memory of what was shipped — the "feature ledger" lives only in git log, which no agent consults.

The Project Memory layer introduces a structured, committed artifact directory at `dark-factory/memory/` that captures invariants, decisions, and a feature ledger. Later sub-specs will wire agents to read and write it. **This spec delivers the structural foundation only** — no agent behavior changes yet.

The foundation must land first because every downstream sub-spec (`project-memory-onboard`, `project-memory-consumers`, `project-memory-lifecycle`) depends on the directory, the schema, the template, and the rule plumbing existing.

## Scope

### In Scope (this spec)

- **New directory** `dark-factory/memory/` containing three pre-populated skeleton files:
  - `invariants.md` — YAML frontmatter + one meaningful `## INV-TEMPLATE` example entry + human-readable prose explaining purpose.
  - `decisions.md` — YAML frontmatter + one meaningful `## DEC-TEMPLATE` example entry + human-readable prose.
  - `ledger.md` — YAML frontmatter + one meaningful `## FEAT-TEMPLATE` example entry + append-only note.
- **New canonical template** `dark-factory/templates/project-memory-template.md` documenting the schema for all three files, every field (name, type, required vs. optional), and one complete valid example entry per file type. This is the source of truth for onboard-agent and promote-agent.
- **Rule update** to `.claude/rules/dark-factory-context.md` adding `dark-factory/memory/` (with its three files) as a 4th always-load context source alongside project-profile, code-map, and manifest. Prose: "Read each memory file if it exists. Treat missing files as 'not yet onboarded' — warn and proceed."
- **Plugin mirror** of all new and changed files in `plugins/dark-factory/` (templates + rules) so contract tests pass.
- **Template cross-reference** in `dark-factory/templates/project-profile-template.md` — a short pointer note under Business Domain Entities that points to `dark-factory/memory/invariants.md` as the canonical registry. The existing "Invariants" bullet line stays as a human-readable summary.
- **Contract + structural tests** in `tests/dark-factory-setup.test.js` (schema + structure) and `tests/dark-factory-contracts.test.js` (plugin mirror parity) covering every new and changed file.
- **Gitignore check**: ensure `dark-factory/memory/` is NOT gitignored (committed project memory) and `dark-factory/results/` remains gitignored.

### Out of Scope (explicitly deferred)

- **Any agent behavior change.** No agent reads, writes, or parses memory yet. onboard-agent extraction is `project-memory-onboard`. spec-agent / architect-agent / code-agent declaration + probe is `project-memory-consumers`. promote-agent writing + test-agent advisor mode + impl-agent routing + df-cleanup health check is `project-memory-lifecycle`.
- **Real invariants / decisions.** The skeletons ship with TEMPLATE placeholders only. The first real entries are extracted by onboard (handled by `project-memory-onboard`).
- **ID assignment logic.** Permanent zero-padded IDs (`INV-0001`, `DEC-0001`, `FEAT-0001`) are assigned by promote-agent in the lifecycle sub-spec. This spec only documents the format.
- **Spec template sections** (`## Invariants` / `## Decisions`) in `dark-factory/templates/spec-template.md` — handled by `project-memory-consumers`.
- **Debug report template** updates — out of scope for v1 foundation.
- **Supersession cascade.** Past specs are frozen in git history; no cascade logic ships.
- **Domain-classification probe logic** — architect-agent changes are in `project-memory-consumers`. This spec only documents the `domain: security|architecture|api` field so the probe can later parse it.
- **Memory parsing helper module.** If a tiny helper is shipped as part of this spec it is scoped to structural tests only. Real consumer use (spec-agent, architect-agent reading memory) lives in later sub-specs.

### Scaling Path

Once the foundation is in place, three parallel sub-specs can extend it without changing the artifact layout:

- `project-memory-onboard` adds extraction during `/df-onboard` with per-entry developer sign-off and retro-backfill of the ledger from `promoted-tests.json` + git log.
- `project-memory-consumers` wires spec/architect/code agents to read memory, adds `## Invariants` / `## Decisions` sections to the spec template, and adds the 3-domain architect invariant probe.
- `project-memory-lifecycle` makes promote-agent the single writer that assigns permanent IDs, adds test-agent `advisor` / `validator` modes, and adds df-cleanup memory health checks.

If the volume of entries ever exceeds what a markdown file can hold comfortably, the schema is already machine-parseable (predictable headings `## INV-NNNN: <title>` and YAML frontmatter), so a future migration to a single JSON/YAML index or a sharded-by-domain layout is mechanical.

## Requirements

### Functional

- FR-1: The directory `dark-factory/memory/` MUST exist and contain exactly three files: `invariants.md`, `decisions.md`, `ledger.md`. — All downstream sub-specs assume this layout.
- FR-2: Each of the three memory files MUST ship with a valid YAML frontmatter block containing `version: 1`, `lastUpdated`, `generatedBy`, and `gitHash` keys. — Frontmatter is how consumers verify schema version; missing keys would break forward-compat.
- FR-3: `invariants.md` MUST contain one meaningful placeholder entry using the heading form `## INV-TEMPLATE: <title>` with every schema field populated (either with a realistic placeholder value or the explicit token `TBD`). — Agents reading memory need a reference entry to understand the format without external docs.
- FR-4: `decisions.md` MUST contain one meaningful placeholder entry using the heading form `## DEC-TEMPLATE: <title>` with every schema field populated. — Same reasoning as FR-3.
- FR-5: `ledger.md` MUST contain one meaningful placeholder entry using the heading form `## FEAT-TEMPLATE: <title>` with every schema field populated, plus a prominent append-only note. — Ledger entries are immutable; the note prevents edits.
- FR-6: The placeholder entries MUST be semantically meaningful (e.g., `INV-TEMPLATE: Every spec must declare the invariants it touches`) — NOT lorem ipsum. — Meaningful examples teach the format; lorem ipsum wastes the teaching opportunity and invites copy-paste errors.
- FR-7: A new file `dark-factory/templates/project-memory-template.md` MUST exist and MUST document the full schema for all three file types, listing every field with its type, whether it is required, and including one complete valid example entry per file type. — Onboard-agent and promote-agent will reference this template when writing real entries; if the template is incomplete, those agents will emit malformed memory.
- FR-8: The template MUST document the following invariants entry fields: `id` (format `INV-NNNN`), `title`, `rule` (markdown), `scope.modules` (list), `scope.entities` (list), `source` (enum: `derived-from-code` | `declared-by-spec` | `declared-by-developer`), `sourceRef`, `status` (enum: `active` | `superseded` | `deprecated`), `supersededBy`, `introducedBy` (spec name or `"baseline"`), `introducedAt` (ISO date), `rationale`, `domain` (enum: `security` | `architecture` | `api`), `enforced_by` (test path) OR `enforcement` (enum: `runtime` | `manual`), `guards` (list of `file:line`), `referencedBy` (list of spec names). — The full field list locks the schema so downstream agents emit consistent entries.
- FR-9: The template MUST document the following decisions entry fields: `id` (format `DEC-NNNN`), `title`, `context` (markdown), `decision` (markdown), `rationale`, `alternatives` (list of `{option, reason_rejected}`), `status` (enum: `active` | `superseded`), `supersededBy`, `introducedBy`, `introducedAt`, `domain`, `referencedBy`. — See FR-8.
- FR-10: The template MUST document the following ledger entry fields: `id` (format `FEAT-NNNN`), `name` (spec name), `summary`, `promotedAt`, `introducedInvariants` (list of INV-IDs), `introducedDecisions` (list of DEC-IDs), `promotedTests` (list of test paths), `gitSha` (cleanup commit SHA). — See FR-8.
- FR-11: The template MUST state that every invariant entry MUST carry either an `enforced_by` path OR an explicit `enforcement: runtime|manual` escape hatch, with a note that one of the two is required. — Locked by decision D4; this spec documents the rule even though enforcement is deferred to `project-memory-consumers`.
- FR-12: The template MUST state that IDs use zero-padded 4-digit sequential numbering (`INV-0001`, `DEC-0001`, `FEAT-0001`), are never reused, and are assigned only by promote-agent at promotion time (until then, specs carry `INV-TBD-*` / `DEC-TBD-*` placeholders). — Locked by decision D2; documented here to prevent accidental assignment by other agents.
- FR-13: `.claude/rules/dark-factory-context.md` MUST add `dark-factory/memory/` (with explicit mention of its three files) as a 4th always-load context source alongside project-profile.md, code-map.md, and manifest.json. — Without this rule update, no downstream agent will load memory.
- FR-14: The rule prose MUST state that missing memory files are treated as "not yet onboarded" — agents warn and proceed (non-blocking), matching the existing pattern for missing project-profile.md. — Greenfield and pre-onboard projects must not break.
- FR-15: Every source file added or modified under `.claude/` or `dark-factory/templates/` MUST have an exact mirror in `plugins/dark-factory/`. — Plugin mirror contract tests enforce exact content parity; this spec's changes must not break that suite.
- FR-16: `dark-factory/templates/project-profile-template.md` MUST gain a short pointer note under its Business Domain Entities section that points to `dark-factory/memory/invariants.md` as the canonical invariant registry. The existing `Invariants` bullet line MUST NOT be removed — it stays as a human-readable summary. — Preserves existing profile semantics while pointing readers to the new canonical source.
- FR-17: `dark-factory/memory/` MUST NOT be listed in `.gitignore`. `dark-factory/memory/*.md` MUST be tracked by git. — Memory is committed project state, not ephemeral output.
- FR-18: `tests/dark-factory-setup.test.js` MUST contain assertions verifying: (a) the memory directory and its three files exist, (b) each memory file has valid YAML frontmatter with the required keys, (c) each memory file contains its respective TEMPLATE example heading, (d) the template file exists and documents every field listed in FR-8 / FR-9 / FR-10, (e) the rule file references `dark-factory/memory/` as an always-load source, (f) memory is not gitignored. — Locks the foundation contract so later sub-specs cannot accidentally break it.
- FR-19: `tests/dark-factory-contracts.test.js` MUST contain plugin-mirror parity assertions for: `plugins/dark-factory/templates/project-memory-template.md`, `plugins/dark-factory/.claude/rules/dark-factory-context.md`, and `plugins/dark-factory/templates/project-profile-template.md`. — Ensures the distributed plugin ships the memory foundation to target projects.

### Non-Functional

- NFR-1: The template file MUST be human-readable — a developer opening it without prior context MUST be able to understand the schema from the file alone. — Developers will copy from this template when declaring invariants in specs; clarity is load-bearing.
- NFR-2: Skeleton files MUST be valid markdown that renders cleanly in GitHub and common markdown viewers (headings, code blocks, tables as applicable). — Memory is committed and reviewed like code; rendering matters.
- NFR-3: The YAML frontmatter format MUST be parseable by the same `parseFrontmatter()` helper used in existing tests (between `---` delimiters, simple `key: value` lines). — Reuse existing parsing rather than introducing a new dependency; zero external packages stays the project convention.
- NFR-4: The heading format `## <ID>: <title>` MUST be predictable enough that a grep-based probe can find entries without LLM ambiguity. — Later the architect invariant probe will parse these headings deterministically.

## Data Model

No runtime data model changes. This spec introduces three new markdown files as artifacts:

### `dark-factory/memory/invariants.md` (committed, edited only by promote-agent once lifecycle spec ships)

- Top-level YAML frontmatter:
  ```yaml
  ---
  version: 1
  lastUpdated: <ISO date>
  generatedBy: promote-agent | onboard-agent | bootstrap
  gitHash: <git SHA at last write>
  ---
  ```
- Body: zero or more entries of the form:
  ```
  ## INV-NNNN: <title>

  - **rule**: <markdown>
  - **scope.modules**: [<list>]
  - **scope.entities**: [<list>]
  - **source**: derived-from-code | declared-by-spec | declared-by-developer
  - **sourceRef**: <path or spec name>
  - **status**: active | superseded | deprecated
  - **supersededBy**: <ID or "">
  - **introducedBy**: <spec name or "baseline">
  - **introducedAt**: <ISO date>
  - **rationale**: <markdown>
  - **domain**: security | architecture | api
  - **enforced_by**: <test path>      # OR
  - **enforcement**: runtime | manual
  - **guards**: [<file:line>, ...]
  - **referencedBy**: [<spec names>]
  ```
- Ships with exactly ONE `## INV-TEMPLATE: <title>` entry.

### `dark-factory/memory/decisions.md` (committed, edited only by promote-agent once lifecycle spec ships)

- Same top-level YAML frontmatter structure.
- Body: zero or more entries of the form:
  ```
  ## DEC-NNNN: <title>

  - **context**: <markdown>
  - **decision**: <markdown>
  - **rationale**: <markdown>
  - **alternatives**: [{option, reason_rejected}, ...]
  - **status**: active | superseded
  - **supersededBy**: <ID or "">
  - **introducedBy**: <spec name>
  - **introducedAt**: <ISO date>
  - **domain**: security | architecture | api
  - **referencedBy**: [<spec names>]
  ```
- Ships with exactly ONE `## DEC-TEMPLATE: <title>` entry.

### `dark-factory/memory/ledger.md` (append-only; frontmatter updates still go through promote-agent)

- Same top-level YAML frontmatter structure.
- Body: zero or more entries of the form:
  ```
  ## FEAT-NNNN: <name>

  - **summary**: <markdown>
  - **promotedAt**: <ISO datetime>
  - **introducedInvariants**: [INV-NNNN, ...]
  - **introducedDecisions**: [DEC-NNNN, ...]
  - **promotedTests**: [<test path>, ...]
  - **gitSha**: <cleanup commit SHA>
  ```
- Ships with exactly ONE `## FEAT-TEMPLATE: <name>` entry plus a prominent "append-only" note near the top.

### `dark-factory/templates/project-memory-template.md` (canonical schema reference)

- Single file documenting all three formats above with one complete, valid example entry per file type. This is what onboard-agent and promote-agent read when they emit real entries in later sub-specs.

## Migration & Deployment

**Applies.** The rule file change (`.claude/rules/dark-factory-context.md`) and template addition affect how future agents load context. Existing projects without `dark-factory/memory/` must not break.

- **Existing data**: None — there is no pre-existing memory directory anywhere. Existing Dark Factory installations simply won't have the directory until `/df-onboard` is re-run (in a later sub-spec). The rule update is written so that missing memory files emit a warning and proceed (FR-14).
- **Rollback plan**: Revert the commit. All new files are additive; the only edits are to two template files and the context rule, all of which are backward-compatible (new rows / new pointer note / new load target that is tolerated as missing).
- **Zero-downtime**: Yes. There is no running service. Agents that have not yet been updated (in later sub-specs) will simply ignore memory; agents that are updated will tolerate its absence.
- **Deployment order**: Single wave. This spec ships alone, then Wave 2 (`project-memory-onboard` + `project-memory-consumers`) can run in parallel, then Wave 3 (`project-memory-lifecycle`).
- **Stale data/cache**: None — no caches touched.

## API Endpoints

N/A — this spec introduces no runtime APIs. All changes are artifacts + templates + rules + tests.

## Business Rules

- BR-1: **Memory files are single-writer.** Only promote-agent (once `project-memory-lifecycle` ships) writes to memory. During the foundation phase the files ship as skeletons committed by this spec's implementation; after that, only promote-agent edits them. — Locked by decision D2 (avoids worktree merge conflicts).
- BR-2: **Ledger is append-only.** Ledger entries once written are never edited. Frontmatter bookkeeping (lastUpdated, gitHash) still changes. — Locked by shared-context decision set; ensures ledger is a faithful history.
- BR-3: **IDs are never reused.** Even superseded or deprecated entries keep their ID forever. — Allows historical references in git to remain meaningful.
- BR-4: **Every invariant has a proof of enforcement.** Either an `enforced_by` test path or an explicit `enforcement: runtime|manual` field. — Locked by decision D4; prevents "invariants" that are just aspirations.
- BR-5: **Missing memory is tolerated, not fatal.** Agents warn and proceed when memory files are absent, matching the existing pattern for missing `project-profile.md`. — Greenfield and pre-onboard projects must not break.
- BR-6: **Placeholder entries are meaningful, not lorem ipsum.** Every TEMPLATE entry shipped in skeletons uses a realistic example that teaches the schema. — Locked by developer note in shared context.
- BR-7: **Plugin mirrors match source exactly.** Every source file added or edited under `.claude/` or `dark-factory/templates/` MUST have an exact mirror in `plugins/dark-factory/`. — Existing project convention; enforced by contract tests.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| Memory directory missing (e.g., legacy project) | Agents load context normally, emit a `memory: not-yet-onboarded` warning, proceed | None |
| Memory file missing (one of three) | Agents warn and treat the missing file as empty (zero entries), proceed | Warning logged |
| Malformed YAML frontmatter in a memory file | A defensive parser (if shipped) returns an empty entry set and emits a warning; does NOT throw. The rest of the file is skipped. Downstream agents proceed as if the file is empty for this load cycle | Warning logged; full file re-validation deferred to `project-memory-lifecycle` |
| Memory file exists but has zero entries beyond TEMPLATE | Treated as valid-but-empty; TEMPLATE entries are explicitly excluded from "real" entry counts by downstream parsers | None |
| Missing required field on an entry | Flagged by the schema-check test in `tests/dark-factory-setup.test.js` when validating the shipped skeletons; downstream runtime flagging is in `project-memory-consumers` | Test fails at build time if the skeleton is malformed |
| Plugin mirror out of sync | Contract test in `tests/dark-factory-contracts.test.js` fails | Build breaks until mirror matches |
| `dark-factory/memory/` accidentally gitignored | Test in `tests/dark-factory-setup.test.js` fails | Build breaks until `.gitignore` is corrected |

## Acceptance Criteria

- [ ] AC-1: `dark-factory/memory/invariants.md`, `decisions.md`, `ledger.md` all exist with valid YAML frontmatter (`version`, `lastUpdated`, `generatedBy`, `gitHash`).
- [ ] AC-2: Each skeleton file contains one meaningful `## <TYPE>-TEMPLATE: <title>` example entry with every schema field populated (real placeholder or `TBD`).
- [ ] AC-3: `dark-factory/templates/project-memory-template.md` exists and documents every field listed in FR-8 / FR-9 / FR-10, with one complete valid example per file type.
- [ ] AC-4: `.claude/rules/dark-factory-context.md` lists `dark-factory/memory/` (with its three files) as a 4th always-load context source and states that missing files are non-blocking (warn and proceed).
- [ ] AC-5: `plugins/dark-factory/templates/project-memory-template.md`, `plugins/dark-factory/.claude/rules/dark-factory-context.md`, and `plugins/dark-factory/templates/project-profile-template.md` match their sources exactly.
- [ ] AC-6: `dark-factory/templates/project-profile-template.md` Business Domain Entities section has a pointer note to `dark-factory/memory/invariants.md` and retains its existing `Invariants` bullet.
- [ ] AC-7: `.gitignore` does NOT list `dark-factory/memory/` or `dark-factory/memory/*.md`. `dark-factory/results/` remains gitignored.
- [ ] AC-8: `node --test tests/` passes. New tests in `tests/dark-factory-setup.test.js` and `tests/dark-factory-contracts.test.js` assert (a)–(f) from FR-18 and the parity assertions from FR-19.
- [ ] AC-9: No agent file (`.claude/agents/*.md` or plugin mirrors) is modified by this spec.
- [ ] AC-10: No skill file (`.claude/skills/*/SKILL.md` or plugin mirrors) is modified by this spec.
- [ ] AC-11: `dark-factory/templates/spec-template.md` and `dark-factory/templates/debug-report-template.md` are NOT modified by this spec.
- [ ] AC-12: `dark-factory/manifest.json` and `dark-factory/promoted-tests.json` are NOT modified by this spec.

## Edge Cases

- EC-1: **Fresh clone of an existing project that has never been onboarded** — The user clones a repo that uses older Dark Factory. `dark-factory/memory/` does not exist. Agents reading the updated rule file must warn and proceed. The next `/df-onboard` (in `project-memory-onboard`) will create the directory. **Expected behavior**: no crash, warning surfaced, pipelines continue.
- EC-2: **Malformed YAML frontmatter in a memory file** — Someone hand-edits `invariants.md` and breaks the frontmatter. A defensive parse returns an empty entry set and emits a warning; downstream agents do not throw. **Expected behavior**: warning in logs, file treated as empty for that load cycle, tests in `project-memory-consumers` catch it at runtime.
- EC-3: **Memory file contains ONLY the TEMPLATE entry** (just-onboarded or greenfield) — TEMPLATE entries must be excluded from "real" entry counts by downstream parsers. At foundation level, skeleton tests assert the TEMPLATE heading EXISTS. **Expected behavior**: valid state; 0 real entries.
- EC-4: **Plugin mirror drift** — A developer edits `.claude/rules/dark-factory-context.md` but forgets `plugins/dark-factory/.claude/rules/dark-factory-context.md`. **Expected behavior**: contract test fails, CI/local test run blocks until the mirror is synced.
- EC-5: **`.gitignore` accidentally matches `dark-factory/memory/`** — e.g., someone adds `dark-factory/*` and forgets to exempt memory. **Expected behavior**: setup test fails, forcing the `.gitignore` fix.
- EC-6: **Missing required field in shipped skeleton** — the skeleton invariants entry is missing `enforced_by` AND `enforcement`. **Expected behavior**: schema-check test in setup fails, blocking the landing.
- EC-7: **Skeleton placeholder is lorem ipsum / not meaningful** — BR-6 requires meaningful placeholders. **Expected behavior**: a content-check test asserts the TEMPLATE title is not literally "lorem ipsum" / empty / placeholder-gibberish.
- EC-8: **Template file omits a documented field** — e.g., `project-memory-template.md` forgets to document `enforced_by` for invariants. **Expected behavior**: template-completeness test in setup fails.
- EC-9: **Rule file updated but mirror stale** — dark-factory-context.md source mentions memory, mirror does not. **Expected behavior**: contract mirror test fails.
- EC-10: **Pre-existing `dark-factory/memory/` directory with random content** — defensive: onboard / foundation implementer must NOT overwrite existing memory. This spec's skeleton-write logic must check for an existing directory and refuse to clobber. (In the current repo, the directory does not yet exist, so this is a defensive contract on implementation.) **Expected behavior**: if the directory already exists with non-skeleton content, the foundation install step exits cleanly without overwrite, and the test run still passes structural checks.

## Dependencies

**None — this spec is independently implementable.**

- **Depends on**: no other sub-spec.
- **Depended on by**: `project-memory-onboard`, `project-memory-consumers`, `project-memory-lifecycle`. Each of those reads memory files, writes memory files, or depends on the rule / template being in place.
- **Group**: `project-memory`.
- **Wave**: 1 (alone). Wave 2 = `project-memory-onboard` + `project-memory-consumers` (parallel). Wave 3 = `project-memory-lifecycle`.

This spec introduces no runtime dependencies (no new npm packages, no new external services). All shared dependencies (`parseFrontmatter()` in tests, standard `fs`/`path` from node stdlib) already exist.

## Implementation Size Estimate

- **Scope size**: small-to-medium — approximately 9 files touched.
- **Suggested parallel tracks**: 1–2 code-agent tracks. If the orchestrator assigns two tracks, split as below with **zero file overlap**:
  - **Track A (memory artifacts + templates)**: creates `dark-factory/memory/invariants.md`, `dark-factory/memory/decisions.md`, `dark-factory/memory/ledger.md`, `dark-factory/templates/project-memory-template.md`, `plugins/dark-factory/templates/project-memory-template.md`; edits `dark-factory/templates/project-profile-template.md` + its plugin mirror.
  - **Track B (rule + tests + gitignore)**: edits `.claude/rules/dark-factory-context.md` + plugin mirror, adds assertions to `tests/dark-factory-setup.test.js` and `tests/dark-factory-contracts.test.js`, audits `.gitignore`.

Tracks are disjoint (no file is touched by both tracks). Track B's test assertions depend on Track A's files existing, so if the orchestrator runs these in parallel it must merge Track A first OR run the test suite only after both tracks land. A single-track implementation is perfectly acceptable — the split is an optimization.

## Invariants

**N/A — bootstrap.**

This spec DEFINES the memory mechanism; it does not yet declare project invariants. The first real invariants will be declared via `project-memory-onboard` extraction (developer-signed, retro-backfilled from the current project-profile architecture section). Once `project-memory-consumers` ships the spec template `## Invariants` section, every future spec will declare the invariants it touches.

## Decisions

The following architectural decisions are locked for this spec. They are worth preserving because they shape the entire memory foundation. `promote-agent` will assign permanent IDs (`DEC-NNNN`) at promotion time. Until then these carry `DEC-TBD-*` placeholders.

- **DEC-TBD-a: Memory file format is YAML frontmatter + structured markdown entries (per-entry headings).**
  - **Context**: Agents need a machine-parseable format for grep-based probes AND a human-readable format for developer review.
  - **Decision**: Each memory file is a single markdown document with top-level YAML frontmatter and one `## <ID>: <title>` heading per entry, with structured bullet fields inside each entry.
  - **Alternatives considered**: (1) pure JSON (rejected — not human-readable, diffs are noisy); (2) pure YAML file (rejected — review tooling is weaker than markdown); (3) one file per entry (rejected — directory explosion, harder to scan).
  - **Domain**: architecture.

- **DEC-TBD-b: Directory layout is `dark-factory/memory/` with three named files (`invariants.md`, `decisions.md`, `ledger.md`).**
  - **Context**: Need a stable layout that all downstream agents can hardcode.
  - **Decision**: Three-file layout under `dark-factory/memory/`. NOT flat (no `dark-factory/invariants.md`), NOT single file (no `dark-factory/memory.md` with all three types mashed together).
  - **Alternatives considered**: (1) flat (rejected — clutters the `dark-factory/` root); (2) single file (rejected — different write cadences: invariants and decisions are single-writer by promote-agent, ledger is append-only); (3) sharded by domain (rejected — premature).
  - **Domain**: architecture.

- **DEC-TBD-c: Single-writer protocol — only promote-agent writes memory (once the lifecycle sub-spec ships).**
  - **Context**: Multiple agents writing to the same files across parallel worktrees would create merge conflicts.
  - **Decision**: promote-agent is the sole writer at promotion time. Specs carry `INV-TBD-*` / `DEC-TBD-*` placeholders; promote-agent assigns permanent zero-padded sequential IDs (`INV-0001`, never reused).
  - **Alternatives considered**: (1) any agent may write (rejected — worktree conflicts); (2) onboard-agent writes initial entries but promote-agent takes over (partially accepted — onboard-agent does write the initial extraction in `project-memory-onboard`, but after that promotion is the only writer).
  - **Domain**: architecture.

- **DEC-TBD-d: Every invariant must carry `enforced_by` (test path) OR an explicit `enforcement: runtime|manual` escape hatch.**
  - **Context**: "Invariants" with no proof of enforcement decay into aspirations; the framework should refuse to accept undefended rules.
  - **Decision**: Schema requires one of the two fields. `manual` is a legitimate escape hatch for rules that cannot be automatically verified (e.g., code style conventions).
  - **Alternatives considered**: (1) always require a test (rejected — some rules genuinely can't be tested automatically); (2) optional field (rejected — every invariant decays over time without enforcement).
  - **Domain**: architecture.

- **DEC-TBD-e: Domain classification uses `domain: security | architecture | api` to enable the 3-parallel architect probe.**
  - **Context**: The architect-agent is already spawned in a 3-parallel domain pattern (Security & Data Integrity, Architecture & Performance, API Design & Backward Compatibility). Memory entries need a routing key.
  - **Decision**: Every invariant and decision entry carries a `domain` field with one of three values. The `project-memory-consumers` sub-spec will use this to route per-domain during architect probes.
  - **Alternatives considered**: (1) no domain, scan everything every time (rejected — wastes architect context); (2) free-form tags (rejected — fragments the taxonomy).
  - **Domain**: architecture.

- **DEC-TBD-f: Missing memory files are non-blocking — warn and proceed.**
  - **Context**: Existing projects without memory must not break. Greenfield projects must be able to onboard later.
  - **Decision**: All agents treat missing memory as "not yet onboarded" and proceed with a warning, matching the existing pattern for missing `project-profile.md`.
  - **Alternatives considered**: (1) block the pipeline until `/df-onboard` runs (rejected — forces an onboarding step on every existing project before they can use any other command); (2) silently ignore (rejected — developers need to know memory is missing).
  - **Domain**: architecture.

## Implementation Notes

Patterns to follow from the existing codebase:

- **Template file format**: follow `dark-factory/templates/project-profile-template.md` exactly. Top of file: a `> Auto-generated by ...` note. Then section headings with placeholders in `{curly braces}` where values go. Keep language concise and developer-facing.
- **Rule file pattern**: `.claude/rules/dark-factory-context.md` is a short (10-line) bullet list. Add a 4th bullet for memory. Keep the existing three bullets intact. Match the voice ("Read X if it exists"). Mention each of the three files explicitly.
- **Plugin mirror**: every edit to `.claude/rules/dark-factory-context.md` must be applied identically to `plugins/dark-factory/.claude/rules/dark-factory-context.md`. Likewise every template edit must be mirrored in `plugins/dark-factory/templates/`. Use the same exact bytes — contract tests do literal content comparison.
- **Test-file conventions**: tests use `node:test` + `node:assert/strict`, no external deps. Follow the structure of existing `describe`/`it` blocks in `tests/dark-factory-setup.test.js`. Reuse the existing `parseFrontmatter()` helper (do NOT reintroduce a copy).
- **Meaningful placeholders**: the shipped TEMPLATE entries should read like real invariants/decisions. Suggested placeholder text (implementer is free to refine):
  - `INV-TEMPLATE: Every spec must declare the invariants it touches` — with `domain: architecture`, `enforced_by: tests/dark-factory-contracts.test.js`, `source: declared-by-developer`, `status: active`, `introducedBy: baseline`.
  - `DEC-TEMPLATE: Memory files are single-writer, written only by promote-agent at promotion time` — `domain: architecture`, `status: active`, `introducedBy: project-memory-foundation`.
  - `FEAT-TEMPLATE: project-memory-foundation` — `summary: Structural foundation for Project Memory (directory, templates, rule plumbing, tests)`, `introducedInvariants: []`, `introducedDecisions: [DEC-TBD-a..f]`, `gitSha: TBD`. (This TEMPLATE ledger entry is purely illustrative; the REAL FEAT-0001 entry for this spec will be written by promote-agent when this spec itself is promoted via `project-memory-lifecycle` — which is fine: the ledger's TEMPLATE entry is a pedagogical placeholder, not the actual ledger record of this feature's completion.)
- **Schema machine-parseability**: every entry heading must match the regex `^## (INV|DEC|FEAT)-(\d{4}|TEMPLATE|TBD-[a-z0-9-]+): .+$`. Tests in setup assert this shape for shipped TEMPLATE entries.
- **No agent edits**: do not touch any file under `.claude/agents/` or `plugins/dark-factory/agents/`. Those are the territory of the other three sub-specs.
- **No skill edits**: do not touch any file under `.claude/skills/` or `plugins/dark-factory/skills/`.
- **No spec/debug template edits**: `spec-template.md` and `debug-report-template.md` are untouched by this spec.

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 (3 files under `dark-factory/memory/`) | P-01, P-02 |
| FR-2 (valid frontmatter, required keys) | P-03, H-01 |
| FR-3 (invariants TEMPLATE entry with all fields) | P-04, H-02 |
| FR-4 (decisions TEMPLATE entry with all fields) | P-05, H-02 |
| FR-5 (ledger TEMPLATE entry + append-only note) | P-06, H-02 |
| FR-6 (meaningful, non-lorem-ipsum placeholders) | H-03 |
| FR-7 (template file exists + documents schema) | P-07 |
| FR-8 (invariants fields documented) | P-07, H-04 |
| FR-9 (decisions fields documented) | P-07, H-04 |
| FR-10 (ledger fields documented) | P-07, H-04 |
| FR-11 (enforced_by OR enforcement escape hatch) | H-05 |
| FR-12 (ID format + assignment locus documented) | H-06 |
| FR-13 (rule file adds memory as 4th source) | P-08 |
| FR-14 (missing memory is warn-and-proceed) | H-07 |
| FR-15 (plugin mirror parity for all changed files) | P-09, H-08 |
| FR-16 (project-profile pointer note, existing Invariants bullet preserved) | P-10, H-09 |
| FR-17 (memory NOT gitignored; results still gitignored) | P-11, H-10 |
| FR-18 (setup tests assert structure) | P-12 |
| FR-19 (contract tests assert mirror parity) | P-09, H-08 |
| BR-1 (single-writer) | documented in template — H-06 |
| BR-2 (ledger append-only) | H-11 |
| BR-3 (IDs never reused) | documented in template — H-06 |
| BR-4 (enforcement required) | H-05 |
| BR-5 (missing memory tolerated) | H-07 |
| BR-6 (meaningful placeholders) | H-03 |
| BR-7 (plugin mirrors match) | P-09, H-08 |
| EC-1 (fresh clone without memory) | H-07 |
| EC-2 (malformed YAML frontmatter) | H-12 |
| EC-3 (only TEMPLATE entry = valid-but-empty) | H-13 |
| EC-4 (plugin mirror drift) | H-08 |
| EC-5 (.gitignore accidentally matches memory) | H-10 |
| EC-6 (missing required field in skeleton) | H-14 |
| EC-7 (lorem ipsum placeholder detection) | H-03 |
| EC-8 (template file omits a field) | H-04 |
| EC-9 (rule file updated but mirror stale) | H-08 |
| EC-10 (existing non-skeleton memory directory not clobbered) | H-15 |
| AC-9 / AC-10 / AC-11 / AC-12 (no out-of-scope files touched) | H-16 |
