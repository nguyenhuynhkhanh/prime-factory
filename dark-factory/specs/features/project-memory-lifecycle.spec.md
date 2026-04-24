# Feature: project-memory-lifecycle

## Context

The Project Memory foundation (`project-memory-foundation`) ships the `dark-factory/memory/` directory with three skeleton files (`invariants.md`, `decisions.md`, `ledger.md`). The onboard sub-spec extracts the first real entries. The consumers sub-spec teaches spec/architect/code agents to READ memory and emit `## Invariants` / `## Decisions` / `## References` declarations in specs.

**This sub-spec delivers the WRITE side + the enforcement gates that make memory a durable regression shield.** Without this spec, memory is a read-only registry that never grows — promote-agent does not materialize the `INV-TBD-*` / `DEC-TBD-*` placeholders emitted by spec-agent, the ledger never appends, and there is no regression gate catching a newly-written feature that quietly breaks a prior invariant.

Concretely, this spec implements:

1. **Single-writer write protocol.** promote-agent becomes the sole runtime writer of `dark-factory/memory/*`. At promotion, it parses the spec's `## Invariants` / `## Decisions` sections, assigns permanent zero-padded IDs (`INV-NNNN`, `DEC-NNNN`, `FEAT-NNNN`), materializes full entries with introducedBy/introducedAt metadata, handles Modifies/Supersedes/References, and appends a ledger row.
2. **Full-suite regression gate (test-agent validator mode, Step 2.75).** After the feature's new holdout scenarios pass (existing Step 2.5 behavior), test-agent runs the ENTIRE promoted test suite plus the new holdout and classifies any failures into four distinct classes: new-holdout failure (existing), invariant regression (touched file + guarded test failed), pre-existing regression (guarded test failed but does NOT overlap touched files — warn, do not block), and expected regression (spec declared Modifies on the invariant whose guard test failed — do not loop back to code-agent).
3. **Advisor mode for test-agent.** A distinct spawn pattern (`mode: advisor`) invoked by spec-agent in df-intake Step 5.5 that returns structured advisory feedback on scenario feasibility/flakiness/dedup/missing coverage, with a hard information barrier preventing holdout content from leaking.
4. **Orchestration for new failure classes** in implementation-agent.
5. **df-cleanup memory health check** mirroring the existing promoted-test STALE GUARD check.

Lead investigation produced three converging recommendations: (a) single-writer is THE key concurrency mitigation because waves serialize promote-agent runs; (b) pre-existing regression must warn-and-proceed or a single flaky old test halts the entire shop; (c) advisor-mode's information barrier must be defended by a distinct spawn and structured-output-only protocol — a normal validator-mode test-agent could accidentally dump holdout content if the boundary is not enforced at the spawn level.

The pre-flight test gate (before architect review) and this Step 2.75 post-implementation regression gate are DIFFERENT checkpoints. All three lead reports flagged this confusion explicitly — the spec below documents both as distinct and both as required.

## Scope

### In Scope (this spec)

- **promote-agent changes** (`.claude/agents/promote-agent.md` + plugin mirror): memory read, next-sequential ID assignment, materialization of `INV-TBD-*` / `DEC-TBD-*` placeholders, handling of Introduces / Modifies / Supersedes / References declarations, ledger append on every promotion (always), top-level frontmatter update (`lastUpdated`, `gitHash`), atomic best-effort write with rollback note, explicit single-writer invariant documentation.
- **test-agent changes** (`.claude/agents/test-agent.md` + plugin mirror):
  - New `mode` parameter (`validator` default; `advisor` distinct spawn).
  - New **Step 2.75: Full-suite regression gate** (validator mode only), run after existing Step 2.5 per-scenario holdout validation.
  - Four-class failure classification: new-holdout, invariant-regression, pre-existing-regression, expected-regression.
  - Structured result output with `preExistingRegression` and `expectedRegression` booleans.
  - Advisor-mode process: reads spec draft, draft public+holdout scenarios, `promoted-tests.json`, memory files; returns structured advisory (feasibility/flakiness/dedup/missing/gaps); does NOT write tests, run tests, or modify scenarios; soft-cap ~60s; one round max.
  - Advisor-mode information barrier enforced by (a) distinct spawn protocol, (b) structured output with enumerated categories + scenario IDs (no free-form prose), (c) prose constraint forbidding quoting scenario text.
- **implementation-agent changes** (`.claude/agents/implementation-agent.md` + plugin mirror):
  - Route new failure classes: invariant-regression → code-agent loop (with behavioral description, no holdout leak); pre-existing-regression → proceed + warning + manifest flag; expected-regression → proceed + note for future promote-agent.
  - Hard rule: implementation-agent NEVER spawns test-agent in advisor mode.
  - Pre-flight gate vs. Step 2.75 gate documented as distinct checkpoints, both required.
  - Forward memory-entry summary to code-agent for this spec's Modifies list (shortcut; code-agent still reads memory directly per consumers spec).
- **df-intake skill change** (`.claude/skills/df-intake/SKILL.md` + plugin mirror): new **Step 5.5 Test-Advisor Handoff** inserted between existing Step 5 (write spec) and Step 6 (manifest update). Spawns advisor-mode test-agent; spec-agent revises scenarios; summary line emitted to intake output; advisor timeout/error → proceed with original scenarios, warn, set manifest `testAdvisoryCompleted: false`.
- **df-orchestrate skill change** (`.claude/skills/df-orchestrate/SKILL.md` + plugin mirror): documents Step 2.75 regression gate; adds loud warning UX for pre-existing regression (suggest `/df-debug` for the old feature); tracks `preExistingRegression` and `expectedRegression` in manifest.
- **df-cleanup skill change** (`.claude/skills/df-cleanup/SKILL.md` + plugin mirror): new memory health check step (parse each memory file, detect `MALFORMED_MEMORY`; verify `enforced_by` test paths → `STALE_ENFORCEMENT`; verify `sourceRef` file paths → `STALE_SOURCE`; cross-check ledger `promotedTests` against `promoted-tests.json`); optional `--rebuild-memory` flag rebuilds ledger from `promoted-tests.json` (does NOT auto-rebuild invariants/decisions).
- **Structural tests** (`tests/dark-factory-setup.test.js`) asserting promote-agent ID assignment rules, ledger append behavior, test-agent mode parameter, Step 2.75 classification categories, implementation-agent routing rules, df-intake Step 5.5 structure, df-cleanup memory health check categories and `--rebuild-memory` behavior, advisor-mode information barriers.
- **Contract tests** (`tests/dark-factory-contracts.test.js`) asserting plugin mirror parity for every edited file.

### Out of Scope (explicitly deferred)

- Memory directory, template files, and rule plumbing — owned by `project-memory-foundation`.
- Initial population of memory from existing project state (retro-backfill, developer sign-off, extraction heuristics) — owned by `project-memory-onboard`.
- `## Invariants` / `## Decisions` section additions to `spec-template.md`, spec-agent emitting those sections, architect-agent probe, code-agent reading memory — owned by `project-memory-consumers`. This spec consumes the consumers spec's emitted sections but does not itself teach spec-agent how to write them.
- Supersession cascade — explicitly locked out by shared context decision. Only direct `supersedes: <ID>` is handled.
- Architect-agent behavior changes — consumers-owned.
- Debug-agent behavior changes — consumers-owned (if any).
- onboard-agent changes — onboard-owned.
- Tiering / impacted-test-selection optimization of the Step 2.75 gate — v2. v1 always runs the full suite. Manifest future-field `fullSuiteRuntime` is not introduced here; deferred.
- Automatic rebuild of invariants/decisions from source code — fundamentally not recoverable without onboarding; `--rebuild-memory` is ledger-only.
- Full-suite runtime budget / parallelization of the regression gate — deferred.

### Scaling Path

- **If the full-suite gate becomes too slow**: v2 introduces impacted-test selection driven by `Guards:` annotation overlap with touched files. The classification logic already computes this overlap, so the optimization is purely narrowing the set of tests to run.
- **If promote-agent ID contention becomes real**: today's mitigation is serialized waves. If a future deployment parallelizes promotion across non-conflicting waves, ID assignment can move to a centralized allocator (e.g., `dark-factory/memory/.id-counter.json`) without changing the entry format.
- **If advisor-mode becomes a bottleneck**: it is bounded to one round and ~60s. A richer back-and-forth would need a new pipeline phase; the current design explicitly forbids ping-pong to keep the information barrier narrow.
- **If pre-existing regressions accumulate**: df-cleanup can be extended to list every manifest entry with `preExistingRegression: true` and suggest batch `/df-debug` runs.

## Requirements

### Functional

- FR-1: promote-agent MUST read all three memory files (`dark-factory/memory/invariants.md`, `decisions.md`, `ledger.md`) at the start of every promotion. — Required to compute next-available IDs and to update referencedBy links on existing entries.
- FR-2: promote-agent MUST parse all existing entry IDs in each file and compute the next available zero-padded 4-digit sequential ID for each type (`INV-NNNN`, `DEC-NNNN`, `FEAT-NNNN`), skipping any gaps left by superseded/deprecated entries but NEVER reusing a retired ID. — Locked by foundation DEC: IDs are append-only and monotonic; reuse would break historical references.
- FR-3: For each `INV-TBD-*` / `DEC-TBD-*` placeholder declared in the spec's `## Invariants` / `## Decisions` Introduces subsections, promote-agent MUST assign a permanent ID, materialize the full entry in the corresponding memory file with every schema field populated from the spec's declaration (rule, scope, rationale, domain, enforced_by OR enforcement, guards, referencedBy, etc.), and set `introducedBy: <spec-name>` + `introducedAt: <ISO now>`. — Materialization is the entire point of the TBD placeholder mechanism.
- FR-4: For each Modifies declaration in the spec, promote-agent MUST locate the existing entry by ID, update the `rule` (for invariants) or `decision` (for decisions) field to the spec's new value, append a record to the entry's `history:` array preserving the prior value + the modifying spec name + the ISO date, set `lastModifiedBy: <spec-name>`, and bump `lastUpdated` in the frontmatter. — Required for durable decision evolution; without history the "why did this change?" question has no answer.
- FR-5: For each Supersedes declaration (format: `supersedes: <existing-ID>` with the spec also declaring a fresh `INV-TBD-*` / `DEC-TBD-*` replacement), promote-agent MUST assign the new entry a fresh permanent ID, set the old entry's `status: superseded`, `supersededBy: <new-ID>`, `supersededAt: <ISO now>`, `supersededBySpec: <spec-name>`. The old entry remains in the file (NOT deleted) — locked by foundation BR-3 (IDs never reused). — Supersession is the schema-aware "replace" operation; without it, invariants can only ever be appended.
- FR-6: For each References declaration (read-only linkage, no modification), promote-agent MUST append the current spec's name to the `referencedBy:` array of each referenced entry, deduplicating. — Tracks reverse linkages for the architect probe and for df-cleanup stale-source detection.
- FR-7: promote-agent MUST append a new `FEAT-NNNN` entry to the ledger on EVERY successful promotion (even when the spec declared zero invariants/decisions), populating: `name`, `summary` (from the spec's Context or Summary section), `promotedAt` (ISO now), `introducedInvariants` (list of newly-assigned INV IDs), `introducedDecisions` (list of newly-assigned DEC IDs), `promotedTests` (list of test file paths from this promotion, sourced from promote-agent's own output), `gitSha` (the commit-BEFORE the cleanup commit — see NFR-3). — Ledger is the append-only feature history; zero-decl specs still appear.
- FR-8: promote-agent MUST update each written memory file's top-level YAML frontmatter: set `lastUpdated` to ISO now, set `gitHash` to the current git HEAD at write time. — Frontmatter is how consumers validate freshness.
- FR-9: promote-agent MUST perform the memory write as part of the existing cleanup commit — no separate commit. The `gitSha` field in the ledger entry SHALL reference the commit-BEFORE this cleanup commit (the last commit on main before promotion). The ledger entry's prose or a note MUST clarify this to readers, so they do not expect the `gitSha` to be tautologically self-referential. — The self-referential alternative would require a two-pass write + amend, which adds complexity and commit-rewrite risk.
- FR-10: promote-agent MUST tolerate specs that do NOT contain `## Invariants` / `## Decisions` sections (legacy pre-consumers specs). In that case, no entries are materialized, but the ledger entry is still appended (per FR-7) with `introducedInvariants: []` and `introducedDecisions: []`. — Backward compatibility during the rollout window; legacy specs must not crash promotion.
- FR-11: promote-agent MUST be documented as the SOLE runtime writer of `dark-factory/memory/*.md`. The only other writer is onboard-agent at bootstrap (fenced exception, owned by `project-memory-onboard`). No other agent writes at runtime. — Single-writer invariant locked by DEC-TBD-a below.
- FR-12: test-agent MUST accept a new `mode` input parameter. Legal values: `validator` (default if omitted — existing behavior) and `advisor`. The agent's behavior branches on this parameter at the start of its process. — Mode parameter is the enforcement mechanism for advisor vs validator information barriers.
- FR-13: test-agent in `validator` mode MUST, after existing Step 2 / 2.5 holdout validation, run a new **Step 2.75: Full-suite regression gate** that executes the project's full test command (from project-profile `Run:`) covering ALL promoted tests plus the new holdout tests in one combined pass. — Catches invariants broken silently by the new feature.
- FR-14: In Step 2.75, test-agent MUST classify each failing test into one of four mutually exclusive classes:
  1. **new-holdout** — the failing test is from this feature's new holdout (route back to code-agent — existing behavior).
  2. **invariant-regression** — a promoted test failed AND its `Guards:` annotation lists at least one file that this spec's implementation touched (route back to code-agent with a behavioral description; do NOT leak holdout content — use the promoted test's behavioral description from `promoted-tests.json` plus the guard annotation).
  3. **pre-existing-regression** — a promoted test failed AND its `Guards:` annotation references ZERO files that this spec touched (warn loudly, flag `preExistingRegression: true` in structured output and in manifest; do NOT block; do NOT loop back).
  4. **expected-regression** — the failing promoted test is the enforcer (matched via `enforced_by: <test-path>` on the INV/DEC it guards) of an invariant/decision that THIS spec's `## Invariants > Modifies` or `## Invariants > Supersedes` explicitly declared (architect pre-approved the change; promoted test is obsolete → route to a future promote-agent cycle to update the promoted test; do NOT loop back to code-agent; flag `expectedRegression: true` in structured output and manifest). — The four classes are exhaustive and mutually exclusive by the classification order above; a single failing test picks the first matching class.
- FR-15: test-agent's Step 2.75 output MUST be structured as an object (recorded in `dark-factory/results/{feature}/run-{timestamp}.md` metadata block) containing: `status`, `newHoldoutResult` (PASS/FAIL summary per scenario), `regressionResult: { class, failingTests: [{ path, class, guardAnnotation, behavioralDescription }] }`, `preExistingRegression: boolean`, `expectedRegression: boolean`. — Machine-readable structure enables implementation-agent routing.
- FR-16: test-agent in `advisor` mode MUST read: the draft spec file, draft public + holdout scenario files, `dark-factory/promoted-tests.json`, and the three memory files. It MUST NOT: write test files, execute any test, modify scenarios, edit the spec, or re-investigate the feature. — Advisor is a read-only analyst.
- FR-17: test-agent in `advisor` mode MUST return a structured advisory report with the following enumerated categories only: `feasibility` (per scenario: `feasible` | `infeasible` | `infrastructure-gap` + short reason), `flakiness` (per scenario: `low` | `medium` | `high` + reason), `dedup` (per scenario: pointer to existing promoted test feature name + file path, if any), `missing` (list of invariant IDs referenced by the spec without a corresponding scenario), `infrastructureGaps` (list of required fixtures/helpers that don't exist). Each item references scenarios BY FILE PATH or scenario ID only. **The advisory output MUST NOT contain free-form prose that quotes or paraphrases holdout scenario content.** — Structured output is the mechanism that prevents holdout leakage; prose quoting is the primary leakage vector.
- FR-18: test-agent in `advisor` mode runs ONE ROUND MAX with a soft-cap of approximately 60 seconds. If timeout or error, it returns a structured `{ status: "timeout" }` or `{ status: "error", reason }` and the calling spec-agent proceeds with the original scenarios. — Bounded execution; no ping-pong with spec-agent.
- FR-19: advisor-mode and validator-mode MUST be distinct spawn invocations. An agent invoked in one mode MUST NOT process inputs for the other mode in the same spawn. test-agent MUST validate the mode parameter at spawn start and refuse to proceed if the parameter is missing, misspelled, or mixed (e.g., both provided). — The spawn barrier is enforced at the agent level; orchestrators/skills must spawn separately for separate modes.
- FR-20: implementation-agent MUST route each Step 2.75 result class correctly:
  - `new-holdout` failures → existing behavior (extract behavioral failures, re-spawn failing code-agent tracks — subject to 3-round max).
  - `invariant-regression` → same loop as new-holdout failure (behavioral description only, no holdout content), BUT the behavioral description comes from the promoted test's annotation in `promoted-tests.json` / its header comment, NOT from the holdout.
  - `pre-existing-regression` → do NOT loop back. Emit loud warning: "Pre-existing regression detected in {promoted-test-path}. This feature does not touch files in its Guards annotation. Proceeding with promotion. Consider running `/df-debug` to investigate {owning-feature}." Set manifest `preExistingRegression: true` for this spec. Proceed.
  - `expected-regression` → do NOT loop back to code-agent. Emit note: "Expected regression: promoted test {path} enforces {INV-ID} which this spec declared Modifies/Supersedes. Promoted test will be updated at promotion time." Set manifest `expectedRegression: true`. Proceed with promotion; promote-agent will update the promoted test in a follow-up step.
- FR-21: implementation-agent MUST NEVER spawn test-agent with `mode: advisor`. Advisor mode is spawned exclusively by spec-agent (via df-intake Step 5.5). This is a hard prompt-level rule in implementation-agent.md. — Preserves mode isolation; implementation-agent only ever needs validator behavior.
- FR-22: implementation-agent MUST document the pre-flight test gate (before architect review, existing) and the Step 2.75 regression gate (after code-agent implementation, new) as DISTINCT checkpoints. The pre-flight gate catches failures before expensive architect+code work; the Step 2.75 gate catches invariant regressions after implementation. Both run in every feature cycle; neither replaces the other. — All three lead reports flagged this confusion — documentation is load-bearing.
- FR-23: When spawning a code-agent, implementation-agent MAY include a short memory-entry summary scoped to the spec's `## Invariants > Modifies` list (a convenience shortcut). Code-agent independently reads memory via the consumers-spec rule. This summary is advisory context, not the source of truth. — Code-agent reads memory directly; implementation-agent's pass-through is only a UX shortcut.
- FR-24: df-intake skill MUST insert a new **Step 5.5: Test-Advisor Handoff** between current Step 5 (write spec) and current Step 6 (update manifest). Step 5.5 spawns test-agent with `mode: advisor`, passing spec path + scenario draft paths + memory files. spec-agent reads the advisory output and MAY revise scenarios (remove dedups, flag infeasible, add missing coverage). A summary line MUST be appended to the intake output: "Testability review: N kept, M revised, K removed as duplicate, J flagged for infrastructure." — Advisor handoff is the spec-side quality gate.
- FR-25: If the advisor call returns `status: timeout` OR `status: error` OR fails to complete within the soft cap, df-intake MUST proceed with the original scenarios, emit a warning line ("Testability advisor unavailable — proceeding with original scenarios"), and set manifest flag `testAdvisoryCompleted: false` for this spec. — Advisor is optional; its absence must not block.
- FR-26: df-orchestrate skill MUST document the Step 2.75 full-suite regression gate in its process narrative, distinct from the existing pre-flight gate. — Orchestrator-level documentation so developers understand the two checkpoints.
- FR-27: df-orchestrate skill MUST surface pre-existing regressions loudly in the final summary report (new block: "Pre-existing regressions flagged: {list of specs with preExistingRegression=true, with suggested `/df-debug` targets}") and MUST NOT count them as failures. — Pre-existing regressions are informational signals, not blockers.
- FR-28: df-cleanup skill MUST add a new **Memory Health Check** step after the existing Promoted Test Health Check (step 2). For each memory file:
  - If unparseable as YAML frontmatter + structured markdown → flag `MALFORMED_MEMORY: {path}`, offer hint: "Run `/df-cleanup --rebuild-memory` to rebuild ledger from promoted-tests.json (invariants/decisions cannot be auto-rebuilt — re-run /df-onboard)."
  - For each invariant entry with `enforced_by: <test-path>` → verify test file exists → flag `STALE_ENFORCEMENT: INV-NNNN references deleted test {path}` if missing.
  - For each entry (invariant or decision) with `sourceRef: <path>` → verify file/directory exists → flag `STALE_SOURCE: {entry-id} references removed source {path}` if missing.
  - For each FEAT entry in ledger with `promotedTests: [...]` → cross-check each listed test path against `promoted-tests.json` entries → flag `STALE_LEDGER: FEAT-NNNN references test path not in promoted-tests.json`.
  - Report ALL issues at once; do NOT auto-fix; leave resolution to the developer. — Mirrors existing STALE GUARD pattern for promoted tests.
- FR-29: df-cleanup skill MUST accept a new `--rebuild-memory` flag that reconstructs `dark-factory/memory/ledger.md` from `dark-factory/promoted-tests.json` entries. It MUST NOT rebuild `invariants.md` or `decisions.md` (those are not recoverable without re-onboarding); instead, if invoked when those files are malformed, it emits: "Invariants/decisions cannot be auto-rebuilt. Run `/df-onboard` to re-extract." — Ledger is derivable from promoted-tests.json; invariants/decisions require developer sign-off.
- FR-30: `tests/dark-factory-setup.test.js` MUST gain structural assertions for every process rule in FR-1..FR-29 (see Acceptance Criteria AC-* for the specific assertion set). — Locks the lifecycle contract; any drift breaks the test suite.
- FR-31: `tests/dark-factory-contracts.test.js` MUST gain plugin-mirror parity assertions for every edited file listed in "Files You May Touch" (promote-agent, test-agent, implementation-agent, df-intake, df-orchestrate, df-cleanup mirrors). — Plugin mirror contract is the existing project invariant.

### Non-Functional

- NFR-1: promote-agent memory write MUST be best-effort atomic — all three files staged before any commit; if any stage fails, the agent restores the in-memory pre-write snapshot (which it kept) and re-emits the failure to the implementation-agent caller. It MUST NOT leave memory in a partially-written state on disk. — Partial writes would break the single-writer invariant.
- NFR-2: Step 2.75 runtime is not bounded in v1 (full suite), but the manifest SHOULD record `fullSuiteRuntimeMs` on the manifest entry under `regressionGate: { runtimeMs: N, failingClass: ... }` for future v2 tiering data. — Low-cost observability for a future optimization.
- NFR-3: The commit-before SHA used for the ledger `gitSha` field MUST be computed deterministically as `git rev-parse HEAD` BEFORE promote-agent creates the cleanup commit. promote-agent documents this clearly in its process narrative to prevent developer confusion about the seeming self-reference. — Deterministic SHA; no amend / rewrite complexity.
- NFR-4: Advisor-mode runtime MUST be soft-capped at ~60s wall clock. On overage, advisor returns `status: timeout` with whatever partial advisory it has. spec-agent MUST treat the partial advisory as optional. — Bounded latency in df-intake.
- NFR-5: All edits preserve plugin mirror parity — every `.claude/agents/*.md` and `.claude/skills/*/SKILL.md` edit MUST be mirrored byte-for-byte in `plugins/dark-factory/`. — Existing project convention.
- NFR-6: No new npm dependencies. No external services. Zero-dep posture is preserved. — Project convention (see project-profile "No node_modules").

## Data Model

No runtime data-model changes. The schema for memory files is defined by `project-memory-foundation`. This spec adds the following FIELDS on existing entries (documented in foundation schema but first materialized here):

- **On invariants/decisions**: `history: [{ previousValue, modifiedBy, modifiedAt }]` (written by FR-4); `lastModifiedBy`, `supersededAt`, `supersededBySpec` (written by FR-4/FR-5).
- **On ledger FEAT entries**: fields already defined by foundation; this spec is the first to WRITE them at runtime.

This spec also adds the following MANIFEST fields on feature entries:

- `preExistingRegression: boolean` — set by implementation-agent when Step 2.75 classifies at least one failure as pre-existing.
- `expectedRegression: boolean` — set by implementation-agent when Step 2.75 classifies at least one failure as expected.
- `testAdvisoryCompleted: boolean` — set by df-intake; `false` on advisor timeout/error, `true` on clean completion.
- `regressionGate: { runtimeMs, failingClass }` — optional, recorded by implementation-agent after Step 2.75 (per NFR-2).

## Migration & Deployment

**Applies — behavioral changes to existing agents and skills.**

- **Existing data**: None on disk — memory directory/files shipped by foundation; first entries written by onboard; promote-agent's first write will populate INV-0001 / DEC-0001 / FEAT-0001 when the first feature promoted under this spec lands. Pre-existing promoted tests (4 in `promoted-tests.json`) are unaffected — they have no corresponding memory entry and are exempt from the invariant-regression classification (they will ONLY be classified as pre-existing or new-holdout in Step 2.75).
- **Rollback plan**: Revert the commit. All agent/skill edits are additive (new sections, new parameters). Legacy specs without `## Invariants` sections continue to promote correctly (FR-10). Rolling back is safe; no on-disk data corruption.
- **Zero-downtime**: Yes. There is no running service. The new `mode` parameter on test-agent is optional (defaults to `validator`, preserving existing callers). The new Step 2.75 gate runs on every feature going forward; pre-existing features don't re-run it.
- **Deployment order**: Wave 3 in the project-memory rollout. `project-memory-foundation` ships first (Wave 1). `project-memory-onboard` + `project-memory-consumers` run in parallel (Wave 2). This spec is Wave 3 — it depends on memory existing (foundation) and on spec-agent emitting `## Invariants` / `## Decisions` sections (consumers) to have anything to materialize. The ledger retro-backfill (onboard) should land before this spec promotes its first feature, so the ledger has FEAT entries for pre-lifecycle features and the first FEAT-NNNN assigned here starts after the retro-backfilled range (avoids ID collision with any backfilled entries).
- **Stale data/cache**: Existing `dark-factory/results/` output files are consumed in-cycle and not migrated. The new Step 2.75 output is additive (new metadata fields in `run-{timestamp}.md`).
- **Coordination with playwright-lifecycle**: `playwright-lifecycle` (currently active) also touches `implementation-agent.md` and `test-agent.md`. Merge must be serialized — whichever ships later rebases onto the other. This spec's edits concentrate on (a) new test-agent sections and a new mode parameter, (b) new implementation-agent routing blocks — both additive and localized, minimizing conflict surface.

## API Endpoints

N/A — no runtime APIs. All behavior is in agent/skill prompts.

## Business Rules

- BR-1: **Memory files are single-writer at runtime.** promote-agent is the only agent that writes `dark-factory/memory/*.md` at runtime. onboard-agent writes at bootstrap (foundation / onboard specs); after bootstrap, only promote-agent writes. Any other runtime writer is a bug. — Prevents worktree merge conflicts; locked by DEC-TBD-a below.
- BR-2: **IDs are zero-padded 4-digit sequential, monotonic, never reused.** promote-agent computes `max(existing) + 1` per type. Superseded/deprecated entries keep their IDs forever. — Locked by foundation BR-3.
- BR-3: **Ledger appends on every promotion, even when zero invariants/decisions declared.** FEAT-NNNN entries reflect promoted features regardless of whether they introduced memory entries. — Ledger is the authoritative feature history; silent gaps hurt forensic value.
- BR-4: **Pre-existing regressions warn but do NOT block promotion.** A failing promoted test whose Guards do not reference this spec's files is a signal, not a failure — the responsible feature is likely stale or flaky. — Locked by shared context decision; prevents "one stale test halts the whole shop" failure mode.
- BR-5: **Expected regressions do NOT loop back to code-agent.** If the spec declared `## Invariants > Modifies INV-X` or `Supersedes INV-X`, architect pre-approved the change; the promoted test enforcing INV-X is obsolete and will be updated by a future promote-agent cycle. — Supports legitimate invariant evolution.
- BR-6: **Advisor-mode and validator-mode are NEVER mixed in one spawn.** A test-agent invocation processes inputs for exactly one mode. Mode-mixing is a hard barrier enforced at the agent's own process start. — Mode isolation is the mechanism that prevents accidental holdout leakage during advisory calls.
- BR-7: **Advisor-mode output is structurally constrained to enumerated categories + scenario pointers.** Free-form prose is forbidden because it is the primary holdout-leakage vector. — The barrier's practical enforcement.
- BR-8: **Holdout content NEVER leaks to architect-agent via advisor output.** Advisor output is returned to spec-agent, which revises scenarios (not spec). architect-agent reads only the spec — it does not see advisor output. — Existing architect information barrier preserved.
- BR-9: **implementation-agent NEVER spawns test-agent with `mode: advisor`.** Advisor is a spec-agent tool; implementation-agent only runs validator. — Mode boundary enforcement at the orchestration layer.
- BR-10: **The ledger `gitSha` is the commit-BEFORE the cleanup commit**, not the cleanup commit itself. Documented in promote-agent.md so readers don't expect tautology. — Deterministic; avoids amend complexity.
- BR-11: **promote-agent ALWAYS re-reads memory at commit time** (not cached from start of run). If a developer manually edits memory between phases, promote-agent's ID assignment reflects the latest state. — Robustness to out-of-band edits.
- BR-12: **Concurrency across specs in the same wave**: each promote-agent invocation runs serially at the end of its implementation-agent's lifecycle. Because waves are serialized (df-orchestrate's wave-execution semantics), two specs in the same wave do NOT both promote simultaneously — they promote in implementation-agent completion order. Each sees the prior promote's memory state. — This is the "single-writer serialized by wave" guarantee.
- BR-13: **Memory health issues are reported, never auto-fixed.** df-cleanup surfaces `MALFORMED_MEMORY`, `STALE_ENFORCEMENT`, `STALE_SOURCE`, `STALE_LEDGER`; developer resolves. — Mirrors existing promoted-test health check behavior.
- BR-14: **`--rebuild-memory` rebuilds ledger only.** Invariants and decisions require onboarding to re-extract; they are not auto-rebuilt. — Scope of rebuild.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| promote-agent reads memory and finds a gap in IDs (e.g., INV-0005 missing, INV-0006 exists) | Treat the sequence as already-consumed up to max; next ID is `max + 1`. Do NOT fill the gap. | Warning logged: "ID gap detected — proceeding with next-max" |
| promote-agent encounters malformed YAML frontmatter in memory | Log error; write nothing to memory; report to implementation-agent as promotion failure; preserve on-disk state | Manifest status stays `passed` (not `promoted`); developer must fix memory before retry |
| promote-agent encounters a Modifies declaration whose target ID doesn't exist | Log error "Modifies target INV-NNNN not found"; do NOT write; fail promotion | Developer must correct spec |
| promote-agent encounters a Supersedes declaration whose target ID doesn't exist | Same as above — fail promotion | Developer must correct spec |
| Spec declares a `INV-TBD-x` placeholder without the required fields (e.g., missing `enforced_by` and `enforcement`) | promote-agent fails with "Invariant TBD-x missing mandatory field `enforced_by` OR `enforcement`"; promotion halts | Developer must correct spec; matches foundation schema requirement |
| test-agent in validator mode fails Step 2.75 because the project's test command can't be found | Log "No test command in project-profile.md — skipping Step 2.75"; set `regressionGate: { status: "skipped", reason: "no test command" }`; proceed with existing Step 2 result | Warning in run output |
| test-agent invoked with both `mode: validator` AND `mode: advisor` (caller bug) | Refuse to proceed; output error "Mode parameter ambiguous — exactly one of `validator` or `advisor` required"; exit | Caller must fix invocation |
| test-agent invoked with unknown mode string | Refuse to proceed; output error "Unknown mode `{value}` — legal values are `validator` or `advisor`"; exit | Caller must fix invocation |
| Advisor mode called without memory files present | Proceed; advisor output omits `missing` category and emits warning "memory not-yet-onboarded — missing-coverage check skipped" | Partial advisory |
| Advisor mode timeout | Return `{ status: "timeout", partial: {...} }`; spec-agent proceeds with original scenarios | Manifest `testAdvisoryCompleted: false` |
| implementation-agent receives a pre-existing-regression classification from test-agent | Emit loud warning block with the promoted test path, the guarding feature (derivable from annotation), and the suggestion `/df-debug {feature}`; proceed with promotion | Manifest `preExistingRegression: true` |
| implementation-agent receives an expected-regression classification | Emit info note; proceed with promotion; flag for future promote-agent to update the guarded promoted test | Manifest `expectedRegression: true` |
| df-cleanup memory health check finds malformed memory | Report `MALFORMED_MEMORY`; suggest `--rebuild-memory`; do NOT auto-fix | None |
| df-cleanup `--rebuild-memory` invoked when no `promoted-tests.json` exists | Report "No promoted tests to rebuild ledger from. Ledger rebuild is a no-op." | None |
| df-cleanup `--rebuild-memory` invoked when memory dir doesn't exist | Report "Memory directory not found. Run `/df-onboard` first." | None |
| Two specs in the same wave both declare `INV-TBD-a` | Sequential promotion → first gets `INV-NNNN`, second re-reads memory, gets `INV-(NNNN+1)` | Documented in BR-12 |

## Acceptance Criteria

- [ ] AC-1: `.claude/agents/promote-agent.md` documents Step 7-extended (or new Step 8) memory write process: reads all three files, parses existing IDs, assigns next sequential, materializes Introduces/Modifies/Supersedes/References, appends ledger, updates frontmatter.
- [ ] AC-2: `.claude/agents/promote-agent.md` contains the phrase "single-writer" in reference to memory files and names itself as the sole runtime writer.
- [ ] AC-3: `.claude/agents/promote-agent.md` documents `gitSha` as the commit-BEFORE the cleanup commit and explains why (no amend).
- [ ] AC-4: `.claude/agents/promote-agent.md` documents the always-append ledger rule (FR-7, BR-3) including zero-invariant specs.
- [ ] AC-5: `.claude/agents/promote-agent.md` documents tolerance for legacy specs without `## Invariants` / `## Decisions` sections (FR-10).
- [ ] AC-6: `.claude/agents/test-agent.md` documents the `mode` parameter with enum `validator` | `advisor`.
- [ ] AC-7: `.claude/agents/test-agent.md` contains a Step 2.75 section describing the full-suite regression gate and the four classification classes (new-holdout, invariant-regression, pre-existing-regression, expected-regression).
- [ ] AC-8: `.claude/agents/test-agent.md` documents the structured output schema including `preExistingRegression` and `expectedRegression` booleans.
- [ ] AC-9: `.claude/agents/test-agent.md` documents the advisor-mode process including inputs (spec, scenarios, memory, promoted-tests), outputs (enumerated categories), prohibited behaviors (no writes, no test execution, no scenario edits), the soft cap (~60s), one-round-max, and the structural-output barrier.
- [ ] AC-10: `.claude/agents/test-agent.md` contains an explicit statement that advisor and validator modes are NEVER mixed in one spawn and that mode must be validated at spawn start.
- [ ] AC-11: `.claude/agents/implementation-agent.md` documents routing for all four Step 2.75 result classes (new-holdout → code-agent, invariant-regression → code-agent with sanitized description, pre-existing-regression → warn+proceed, expected-regression → note+proceed).
- [ ] AC-12: `.claude/agents/implementation-agent.md` contains a hard rule: "implementation-agent MUST NEVER spawn test-agent with `mode: advisor`".
- [ ] AC-13: `.claude/agents/implementation-agent.md` documents pre-flight gate and Step 2.75 gate as distinct checkpoints, both required.
- [ ] AC-14: `.claude/skills/df-intake/SKILL.md` contains a Step 5.5 Test-Advisor Handoff section between Step 5 and Step 6 with the process: spawn advisor → spec-agent revises → summary line emitted.
- [ ] AC-15: `.claude/skills/df-intake/SKILL.md` documents advisor timeout/error → proceed with original scenarios, set `testAdvisoryCompleted: false`.
- [ ] AC-16: `.claude/skills/df-orchestrate/SKILL.md` documents the Step 2.75 full-suite regression gate as distinct from the pre-flight gate.
- [ ] AC-17: `.claude/skills/df-orchestrate/SKILL.md` documents the pre-existing regression UX (loud warning, suggest `/df-debug`) and mentions manifest `preExistingRegression` / `expectedRegression` fields.
- [ ] AC-18: `.claude/skills/df-cleanup/SKILL.md` documents a Memory Health Check step with the four detection categories (MALFORMED_MEMORY, STALE_ENFORCEMENT, STALE_SOURCE, STALE_LEDGER).
- [ ] AC-19: `.claude/skills/df-cleanup/SKILL.md` documents the `--rebuild-memory` flag and its ledger-only scope (invariants/decisions not auto-rebuilt).
- [ ] AC-20: Every changed `.claude/agents/*.md` and `.claude/skills/*/SKILL.md` file has an exact-content mirror in `plugins/dark-factory/`.
- [ ] AC-21: `tests/dark-factory-setup.test.js` contains assertions locking FR-1..FR-29 (see Edge Cases and traceability below for the specific assertion mapping).
- [ ] AC-22: `tests/dark-factory-contracts.test.js` contains plugin-mirror parity assertions for every edited file.
- [ ] AC-23: `node --test tests/` passes after these changes.
- [ ] AC-24: The spec does NOT edit `.claude/agents/onboard-agent.md`, `spec-agent.md`, `architect-agent.md`, `code-agent.md`, `debug-agent.md`, or `codemap-agent.md` (those are owned by other sub-specs).
- [ ] AC-25: The spec does NOT edit `dark-factory/memory/*.md` in source form (memory is runtime-written).
- [ ] AC-26: The spec does NOT edit `dark-factory/templates/*.md` except where consumers-owned files would dictate (none in this spec).
- [ ] AC-27: The spec does NOT edit `.claude/rules/*.md` (foundation-owned).

## Edge Cases

- EC-1: **Spec declares `INV-TBD-a` and `INV-TBD-b`; both introduces.** promote-agent assigns INV-0001 and INV-0002 (or next-available pair), preserving the spec-declared order. Both are materialized in `invariants.md`. Both are listed in the ledger's `introducedInvariants`. **Expected**: predictable sequential assignment; no collisions.
- EC-2: **Spec declares `INV-TBD-a` that Supersedes INV-0003.** promote-agent assigns a new permanent ID to `INV-TBD-a` (e.g., INV-0008), sets INV-0003's `status: superseded`, `supersededBy: INV-0008`, `supersededAt`, `supersededBySpec`. INV-0003 remains in file (BR-3). **Expected**: supersession chain preserved; old entry not deleted.
- EC-3: **Spec declares Modifies on INV-0003's `rule` field.** promote-agent updates INV-0003 in place: new `rule`, `lastModifiedBy: <this-spec>`, `lastUpdated`, and appends `{ previousValue, modifiedBy, modifiedAt }` to INV-0003's `history` array. **Expected**: rule updated, history preserves prior value.
- EC-4: **Spec declares References to INV-0003 without modification.** promote-agent appends the spec name to INV-0003's `referencedBy` array, deduplicating. No other changes. **Expected**: referencedBy link added.
- EC-5: **Two specs in the SAME wave both introduce invariants.** Wave executes implementation-agents in parallel, but each waits for its own promote-agent serially. Whichever finishes first writes INV-0001; the second re-reads memory, sees INV-0001, writes INV-0002. **Expected**: no collision; BR-12.
- EC-6: **Spec declares zero invariants, zero decisions.** promote-agent still appends a FEAT entry with empty `introducedInvariants: []`, `introducedDecisions: []`, populated `promotedTests` and `gitSha`. **Expected**: ledger grows by one row; no memory entry writes.
- EC-7: **Legacy spec without `## Invariants` / `## Decisions` sections** (pre-consumers-spec spec). promote-agent skips the materialization step; appends FEAT entry with empty invariants/decisions. **Expected**: no crash; ledger still records the promotion.
- EC-8: **Developer manually edits memory during a spec's implementation phase** (between df-intake and promotion). When promote-agent runs, it re-reads memory and computes IDs off the current state. The developer's edit is preserved. **Expected**: no stomping; BR-11.
- EC-9: **Step 2.75 finds a promoted test failure where the Guards annotation is empty or missing.** Classification rule: treat empty/missing Guards as "references zero files" → matches pre-existing-regression (the weakest class). Rationale: without a guard annotation, we cannot prove overlap; conservative default is "not-our-problem" but warn. **Expected**: classified as pre-existing-regression; warning includes "Guards annotation missing on {path}".
- EC-10: **Step 2.75 finds a promoted test failure where Guards lists multiple files, SOME overlapping touched files and SOME not.** Classification: ANY overlap → invariant-regression. Rationale: a partial overlap is still a signal that this spec's code affects that test. **Expected**: invariant-regression; behavioral description cites the overlapping files specifically.
- EC-11: **Step 2.75 finds a promoted test that enforces INV-0003, and this spec's `## Invariants > Modifies: INV-0003`.** Classification: expected-regression (BR-5). Route: do NOT loop back. **Expected**: `expectedRegression: true` in manifest; note surfaced; promote-agent will refresh the promoted test in a follow-up.
- EC-12: **Step 2.75 finds both an invariant-regression AND a pre-existing-regression in the same run.** Both classes are recorded. invariant-regression triggers the code-agent loop; pre-existing-regression is deferred (warn+proceed). Rounds count only for invariant-regression. **Expected**: both flags surface correctly; no conflation.
- EC-13: **Advisor-mode test-agent finds scenario duplication** — an existing promoted test (per `promoted-tests.json`) already covers the same behavior as a proposed new scenario. Output category `dedup` is populated with the existing promoted test's feature name + path. spec-agent decides whether to remove the duplicate. **Expected**: advisor surfaces, spec-agent acts.
- EC-14: **Advisor-mode test-agent finds missing coverage** — spec references INV-0003 (via Modifies/References) but the scenarios do not include a test that exercises INV-0003's behavior. Output category `missing: [INV-0003]`. spec-agent adds a scenario. **Expected**: advisor surfaces; spec-agent adds coverage.
- EC-15: **Advisor-mode output accidentally includes a free-form sentence describing holdout content.** This is a bug — the structural barrier should prevent free-form prose. Defense: the structural-output schema validates each field is enumerated (`feasible`|`infeasible`|...) + pointer-only (scenario path); any string field is short and categorical. **Expected**: schema validation rejects malformed advisor output; test asserts the output schema.
- EC-16: **Advisor-mode spawned alongside validator-mode in the same message.** Both are DIFFERENT spawns (separate Agent tool invocations). Each agent validates its own `mode` at start. Mixing in one message is permissible if both are distinct invocations; mixing in one spawn is rejected (FR-19). **Expected**: two valid separate spawns OR one reject.
- EC-17: **implementation-agent accidentally spawns test-agent with `mode: advisor`.** This is a hard-rule violation. test-agent detects caller is implementation-agent (via prompt context or absent spec-agent linkage) and refuses. **Expected**: invocation fails with clear error; assertion in setup test that implementation-agent's prompt never contains `mode: advisor`.
- EC-18: **df-intake Step 5.5 advisor timeout.** spec-agent proceeds with original scenarios, emits warning, writes manifest `testAdvisoryCompleted: false`. Does NOT retry. **Expected**: intake completes; no blocker.
- EC-19: **df-intake Step 5.5 advisor returns but spec-agent disagrees with its recommendation.** spec-agent is authoritative; it MAY accept or reject any advisory item. The advisor is advisory, not mandatory. **Expected**: spec-agent revises based on its own judgment; summary line reflects what was actually changed, not what was recommended.
- EC-20: **df-orchestrate final summary with mix of passed/failed/pre-existing/expected.** Final block shows: standard passed list, failed list, blocked list, PLUS new "Pre-existing regressions flagged" block and "Expected regressions (invariant evolution)" block. **Expected**: clean separation; pre-existing does not count as failure.
- EC-21: **df-cleanup on a repo where memory/ doesn't exist (greenfield or pre-onboarded).** Memory Health Check emits "Memory not yet onboarded — skipping health check. Run `/df-onboard` to initialize." Cleanup proceeds with other steps. **Expected**: not-yet-onboarded is tolerated; no crash.
- EC-22: **df-cleanup with `--rebuild-memory` on a repo whose ledger has entries but promoted-tests.json is missing.** Report "Cannot rebuild ledger — `promoted-tests.json` not found." Do NOT delete existing ledger. **Expected**: non-destructive failure.
- EC-23: **Plugin mirror drift after these edits** — developer edits `.claude/agents/test-agent.md` but forgets the plugin mirror. Contract test fails. **Expected**: build blocks until synced.
- EC-24: **promote-agent runs but memory write fails mid-sequence** (e.g., invariants.md succeeds, decisions.md errors out on disk write). promote-agent rolls back invariants.md to its pre-write state from the in-memory snapshot, fails promotion, reports. No partial state on disk. **Expected**: atomic best-effort recovery; NFR-1.
- EC-25: **Ledger `gitSha` appears to reference the commit that the ledger entry is in.** This is the commit-BEFORE the cleanup commit (BR-10, NFR-3). promote-agent.md documents this clearly. **Expected**: no reader confusion; documentation load-bearing.
- EC-26: **Spec declares both Introduces `INV-TBD-a` and References `INV-0003`.** Both are processed: INV-TBD-a gets a new ID + materialization, INV-0003 gets the spec name appended to its `referencedBy`. Ledger records `introducedInvariants: [INV-NNNN-new]`. **Expected**: both ops succeed independently.
- EC-27: **FEAT ledger entry for `project-memory-foundation` did not get retro-backfilled** (onboard was skipped or incomplete). When the first post-lifecycle feature promotes, it gets FEAT-0001 (or whatever is next in `max + 1`); the absence of a FEAT entry for foundation is a visible gap. df-cleanup memory health check will flag "Ledger missing expected feature: project-memory-foundation" via promoted-tests.json cross-check (STALE_LEDGER). **Expected**: gap is surfaced; developer runs `/df-onboard` or `/df-cleanup --rebuild-memory`.

## Dependencies

**Depends on**: `project-memory-foundation` (memory directory + templates + rule plumbing), `project-memory-consumers` (spec-agent emits `## Invariants` / `## Decisions` sections that promote-agent parses), `project-memory-onboard` (ledger retro-backfill so ledger exists at first lifecycle promotion — not strictly required for runtime correctness but avoids ID gap).

**Depended on by**: none (lifecycle is the terminal wave).

**Group**: `project-memory`.

**Wave**: 3. Wave 1 = foundation. Wave 2 = onboard + consumers (parallel). Wave 3 = this spec.

**Serialization with active unrelated specs**: `playwright-lifecycle` is currently active and touches `implementation-agent.md` and `test-agent.md`. The merge must be serialized — whichever ships second rebases onto the first. Conflict surface is minimized because this spec's edits are (a) new sections (Step 2.75, mode parameter, new routing blocks) and (b) localized additions, not rewrites of existing behavior.

This spec introduces no new npm dependencies (zero-dep posture preserved).

## Implementation Size Estimate

- **Scope size**: large — approximately 14 files across agents, skills, mirrors, and tests.
- **File list**:
  - `.claude/agents/promote-agent.md` + `plugins/dark-factory/agents/promote-agent.md`
  - `.claude/agents/test-agent.md` + `plugins/dark-factory/agents/test-agent.md`
  - `.claude/agents/implementation-agent.md` + `plugins/dark-factory/agents/implementation-agent.md`
  - `.claude/skills/df-intake/SKILL.md` + `plugins/dark-factory/skills/df-intake/SKILL.md`
  - `.claude/skills/df-orchestrate/SKILL.md` + `plugins/dark-factory/skills/df-orchestrate/SKILL.md`
  - `.claude/skills/df-cleanup/SKILL.md` + `plugins/dark-factory/skills/df-cleanup/SKILL.md`
  - `tests/dark-factory-setup.test.js` (assertions added only; file not replaced)
  - `tests/dark-factory-contracts.test.js` (mirror parity assertions added only)

- **Suggested parallel tracks**: 3–4 tracks with ZERO file overlap.

  - **Track A — promote-agent (memory write)**:
    - `.claude/agents/promote-agent.md`
    - `plugins/dark-factory/agents/promote-agent.md`
    - Scope: memory read, ID assignment, materialization, Modifies/Supersedes/References handling, ledger append, frontmatter update, atomicity, documentation of gitSha commit-before.

  - **Track B — test-agent (advisor + validator Step 2.75)**:
    - `.claude/agents/test-agent.md`
    - `plugins/dark-factory/agents/test-agent.md`
    - Scope: mode parameter, advisor mode process + barriers, validator Step 2.75 full-suite gate + four-class classification, structured output schema.

  - **Track C — implementation-agent (routing)**:
    - `.claude/agents/implementation-agent.md`
    - `plugins/dark-factory/agents/implementation-agent.md`
    - Scope: route new result classes, hard-rule no-advisor-spawn, pre-flight vs Step 2.75 documentation, memory-entry summary forwarding to code-agent.

  - **Track D — skills (df-intake Step 5.5, df-orchestrate docs, df-cleanup health + --rebuild-memory) + tests**:
    - `.claude/skills/df-intake/SKILL.md` + mirror
    - `.claude/skills/df-orchestrate/SKILL.md` + mirror
    - `.claude/skills/df-cleanup/SKILL.md` + mirror
    - `tests/dark-factory-setup.test.js` (append assertions only)
    - `tests/dark-factory-contracts.test.js` (append mirror parity only)

- **Coordination notes**:
  - Tracks B and C coordinate on routing contract: Track B defines the Step 2.75 output schema; Track C consumes it. Keep ONE owner per file — if both tracks need to edit `implementation-agent.md`, Track C owns the file; Track B provides the schema spec via comment/contract that Track C inlines. Recommended: Track B lands first (defines schema), then Track C consumes.
  - Track D's tests depend on A/B/C landing first (tests assert their phrases). Land D last, OR have D add assertions that tolerate absence gracefully and enable them after A/B/C merge.
  - Every track MUST mirror each `.claude/` edit to `plugins/dark-factory/`. Contract tests (Track D) enforce parity.

## Invariants

This spec introduces the following invariants. `promote-agent` will assign permanent IDs at promotion time; until then they carry `INV-TBD-*` placeholders.

### Introduces

- **INV-TBD-a: Memory is a single-writer resource at runtime — only promote-agent writes `dark-factory/memory/*.md`.**
  - **rule**: At runtime, the only agent that may write to `dark-factory/memory/invariants.md`, `dark-factory/memory/decisions.md`, or `dark-factory/memory/ledger.md` is promote-agent. onboard-agent writes at bootstrap only (fenced exception, owned by `project-memory-onboard`). No other agent writes these files at runtime.
  - **scope.modules**: `.claude/agents/`, `plugins/dark-factory/agents/`
  - **scope.entities**: `dark-factory/memory/invariants.md`, `dark-factory/memory/decisions.md`, `dark-factory/memory/ledger.md`
  - **source**: `declared-by-spec`
  - **sourceRef**: `dark-factory/specs/features/project-memory-lifecycle.spec.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (assertions checking no other agent's prompt contains write operations against `dark-factory/memory/`)
  - **guards**: `.claude/agents/promote-agent.md`, `plugins/dark-factory/agents/promote-agent.md`, and every other agent file (asserts negative case)
  - **rationale**: Prevents merge conflicts across parallel worktrees; DEC-TBD-a.

- **INV-TBD-b: test-agent mode isolation — advisor-mode and validator-mode are NEVER mixed in one spawn and NEVER co-invoked as the same agent instance.**
  - **rule**: A test-agent spawn processes inputs for exactly one `mode` value (`validator` or `advisor`). The agent validates the mode parameter at process start and refuses to proceed on ambiguity or missing value.
  - **scope.modules**: `.claude/agents/test-agent.md`, `plugins/dark-factory/agents/test-agent.md`, `.claude/skills/df-intake/SKILL.md`, `.claude/agents/implementation-agent.md`
  - **scope.entities**: test-agent spawn protocol
  - **source**: `declared-by-spec`
  - **sourceRef**: `dark-factory/specs/features/project-memory-lifecycle.spec.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (assertion: test-agent.md contains mode-validation prose + refusal phrase; df-intake.md only spawns advisor; implementation-agent.md never mentions `mode: advisor`)
  - **guards**: `.claude/agents/test-agent.md`, `.claude/skills/df-intake/SKILL.md`, `.claude/agents/implementation-agent.md`, and their plugin mirrors
  - **rationale**: Spawn-level barrier is the only defense against mode-mixing; without it, an advisor call could accidentally execute validator-scope writes or vice versa.

- **INV-TBD-c: Holdout content NEVER leaks to architect-agent via advisor-mode output.**
  - **rule**: Advisor-mode test-agent returns structured output with enumerated categories + scenario-path pointers. The output contains no free-form prose that quotes, paraphrases, or summarizes holdout scenario text. architect-agent NEVER receives advisor output — it reads only the spec. spec-agent receives advisor output and uses it to revise scenarios; the revised scenarios remain under the existing holdout barrier (architect does not see them).
  - **scope.modules**: `.claude/agents/test-agent.md`, `.claude/agents/architect-agent.md`, `.claude/skills/df-intake/SKILL.md`
  - **scope.entities**: advisor-mode output schema, information-barrier graph
  - **source**: `declared-by-spec`
  - **sourceRef**: `dark-factory/specs/features/project-memory-lifecycle.spec.md`
  - **domain**: security
  - **enforced_by**: `tests/dark-factory-setup.test.js` (assertion: test-agent.md advisor-mode output schema is enumerated-only; df-intake.md does not pass advisor output to architect-agent; architect-agent.md is unchanged — no advisor input path)
  - **guards**: `.claude/agents/test-agent.md`, `.claude/skills/df-intake/SKILL.md`, `.claude/agents/architect-agent.md`
  - **rationale**: Free-form prose is the primary leakage vector; structured-output-only narrows the surface to near-zero. Lead C flagged this explicitly.

- **INV-TBD-d: Pre-existing regression does not block feature promotion — surface to developer, record in manifest, proceed.**
  - **rule**: When Step 2.75 classifies a failing promoted test as pre-existing-regression (Guards annotation references zero files touched by this spec), implementation-agent emits a loud warning, sets manifest `preExistingRegression: true`, and proceeds with promotion. It does NOT loop back to code-agent.
  - **scope.modules**: `.claude/agents/implementation-agent.md`, `.claude/agents/test-agent.md`, `.claude/skills/df-orchestrate/SKILL.md`
  - **scope.entities**: Step 2.75 classification routing
  - **source**: `declared-by-spec`
  - **sourceRef**: `dark-factory/specs/features/project-memory-lifecycle.spec.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (assertion: implementation-agent.md contains "pre-existing regression" routing prose with "do not loop" + "proceed"; df-orchestrate.md surfaces the warning in final summary)
  - **guards**: `.claude/agents/implementation-agent.md`, `.claude/skills/df-orchestrate/SKILL.md`, `.claude/agents/test-agent.md`
  - **rationale**: Prevents "one flaky old test halts the whole shop" failure mode. Lead C emphasized this explicitly.

### Modifies

None. This spec introduces new invariants but does not modify any existing ones. (Project memory is still being bootstrapped; the first real invariants are introduced by this wave.)

### Supersedes

None.

### References

- (From `project-memory-foundation` — once promote-agent has materialized foundation's decisions into DEC-NNNN): the DEC entries locking YAML+markdown format, three-file layout, single-writer protocol, enforced_by escape hatch, domain taxonomy, and non-blocking missing-memory. This spec operationalizes all six. At promotion time, promote-agent will append this spec's name to each of those entries' `referencedBy`.

## Decisions

This spec introduces the following decisions. `promote-agent` will assign permanent IDs at promotion time.

### Introduces

- **DEC-TBD-a: promote-agent is the sole runtime writer of project memory, serialized per wave.**
  - **context**: Multiple agents writing to memory files across parallel worktrees would create merge conflicts on every promotion. Need a concurrency-safe write protocol.
  - **decision**: promote-agent is the single runtime writer. It runs serially at the end of each implementation-agent's lifecycle. Because df-orchestrate serializes waves, and within a wave each implementation-agent's promote-agent runs after its own code-agents complete, no two promote-agent invocations write memory simultaneously. onboard-agent is the fenced bootstrap-time exception.
  - **rationale**: Simplest concurrency model that works given existing wave semantics. No new coordination primitives needed.
  - **alternatives considered**:
    - Each implementation-agent writes at ExitWorktree — **rejected**: high merge conflict risk on shared files; every wave would have N-way conflicts on `memory/*.md`.
    - Pending-invariants staging directory applied by orchestrator — **rejected**: adds coordination complexity (a new staging protocol, a new reconcile step); low value-add over sole-writer.
    - Per-worktree memory copies, merged on main — **rejected**: requires a merge algorithm for YAML+markdown which doesn't exist; three-way merges on structured markdown are brittle.
  - **domain**: architecture
  - **status**: active
  - **introducedBy**: `project-memory-lifecycle`

- **DEC-TBD-b: Full-suite regression gate always runs in Step 2.75 (no tiering in v1).**
  - **context**: Step 2.75 catches invariants broken silently by new features. Running the full promoted test suite is the simplest way to guarantee coverage but may become slow as the suite grows.
  - **decision**: v1 always runs the full project test command + new holdout in one combined pass. No impacted-test selection, no `--skip` flag. Manifest records `regressionGate: { runtimeMs }` per NFR-2 to enable data-driven v2 optimization.
  - **rationale**: Simplicity and correctness first. Impacted-test selection (based on Guards overlap) is tempting but risks missing regressions when a promoted test's guards are stale or incomplete. A `--skip` flag would be a loophole that invites people to bypass the gate precisely when they shouldn't. Observability via `fullSuiteRuntimeMs` means v2 can make a data-driven tiering decision later.
  - **alternatives considered**:
    - Impacted-test selection via Guards overlap — **rejected (v1)**: risk of missing regressions when Guards are stale; adds complexity; benefit is speculative (we don't know the suite is slow yet).
    - `--skip-regression` flag — **rejected**: loophole. The pre-flight gate already has `--skip-tests`; adding a second skip weakens the entire enforcement story.
    - Sampling (run random N%) — **rejected**: non-deterministic; hides regressions intermittently.
  - **domain**: architecture
  - **status**: active
  - **introducedBy**: `project-memory-lifecycle`

### Modifies

None.

### Supersedes

None.

### References

- Foundation's DEC locking single-writer protocol (promote-agent is the writer) — this spec OPERATIONALIZES that decision rather than modifying it. Expected to appear in `referencedBy` after promotion.

## Implementation Notes

Patterns to follow from the existing codebase:

- **Agent prompt style**: follow the existing tone of `promote-agent.md`, `test-agent.md`, `implementation-agent.md` — numbered step-by-step process, explicit "Your Constraints" block, explicit inputs/outputs. Keep edits additive (new sections / new steps) rather than rewriting existing sections. The existing Step numbering (Step 0, Step 0a, Step 0b, etc.) supports insertion — Step 2.75 is deliberately named to fit between 2.5 and 3.
- **Skill prompt style**: `df-intake/SKILL.md`, `df-orchestrate/SKILL.md`, `df-cleanup/SKILL.md` all use numbered step headings (`### Step 1`, `### 5. Execute Fixes`, etc.). New steps should follow the same heading depth and format.
- **Plugin mirror**: every edit must be mirrored byte-for-byte in `plugins/dark-factory/`. Contract tests do literal content comparison.
- **Test style**: `tests/dark-factory-setup.test.js` uses `describe`/`it` blocks with `node:test`. Assertions are string-matching against agent/skill content. Follow the existing pattern — `const content = readFileSync(path, 'utf8'); assert.match(content, /expected phrase/);`. Group assertions into a `describe('project-memory-lifecycle')` block at the end of the file (follow promoted-test section marker conventions, but this spec's tests are structural, not promoted — they live in the main body, not between DF-PROMOTED markers).
- **Information barriers**: every agent file declares "NEVER" constraints. test-agent's new advisor-mode section must declare "NEVER write tests, NEVER run tests, NEVER edit scenarios, NEVER include free-form prose from holdout content". implementation-agent must declare "NEVER spawn test-agent with `mode: advisor`".
- **Mode parameter pattern**: follow the existing `--skip-tests` flag pattern in `implementation-agent.md` — flags are declared in the Inputs block, validated at start, referenced by name throughout. `mode` is an input to test-agent, not a command-line flag; document it in test-agent's Inputs section.
- **Step 2.75 classification pseudocode**: document the classification as a deterministic sequence: (1) is it a new-holdout? (2) does its Guards overlap touched files? (3) does this spec's Modifies/Supersedes declare the enforced INV-ID? Each question narrows the class. Order matters — first match wins.
- **Memory write process in promote-agent**: document as a sub-process with explicit steps — (1) read all three files, (2) compute next IDs, (3) for each section in spec's `## Invariants`, dispatch to Introduces/Modifies/Supersedes/References handler, (4) for each section in spec's `## Decisions`, same, (5) always append FEAT entry to ledger, (6) update frontmatter `lastUpdated` and `gitHash`, (7) write all three files, (8) if write fails, restore from pre-write snapshot and report failure.
- **gitSha commit-before**: add a prominent note in promote-agent.md under its ledger-write sub-step: "Note on gitSha: the ledger entry's `gitSha` field refers to the commit-BEFORE this spec's cleanup commit (i.e., `git rev-parse HEAD` at the moment we write the ledger, before `git commit`). This avoids the self-referential commit-SHA problem that would otherwise require `git commit --amend`."
- **Advisor output schema**: document as JSON-ish table in test-agent.md — `{ status, feasibility: [{ scenario, verdict }], flakiness: [{ scenario, verdict }], dedup: [{ scenario, matchedFeature, matchedPath }], missing: [INV-ID], infrastructureGaps: [{ scenario, missingFixture }] }`. Every field is enumerated or a pointer; no `description` / `summary` / free-form string fields.
- **Structural test pattern for information barriers**: follow the existing 50+ barrier assertions — each assertion reads the agent file content and checks that a forbidden operation is NOT mentioned OR that an explicit "NEVER" phrase IS present. Example: `assert.match(implAgentContent, /NEVER spawn test-agent with `mode: advisor`/)`.
- **df-cleanup health check extension**: follow the existing Step 2 Promoted Test Health Check structure (2a rebuild, 2b read registry, 2c verify each entry with file-existence + skip + run). The new Memory Health Check should be Step 2.5 (between 2 and 3) with analogous sub-steps: (2.5a) handle `--rebuild-memory`, (2.5b) parse memory files, (2.5c) per-entry enforcement / sourceRef / ledger cross-check.
- **Zero-dep posture**: no new `require()`s. All parsing uses existing `parseFrontmatter()` helper in tests. Agent/skill text is plain markdown — no new infra.

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 (promote-agent reads all three memory files) | P-01 |
| FR-2 (next-sequential ID assignment; no reuse) | P-02, H-01 |
| FR-3 (materialize INV-TBD / DEC-TBD placeholders) | P-03, H-02 |
| FR-4 (Modifies: update + append to history) | P-04, H-03 |
| FR-5 (Supersedes: old stays with status=superseded, new assigned) | P-05, H-04 |
| FR-6 (References: append to referencedBy, dedupe) | P-06, H-05 |
| FR-7 (ledger appends every promotion, even zero decls) | P-07, H-06 |
| FR-8 (frontmatter updated: lastUpdated, gitHash) | P-08 |
| FR-9 (gitSha = commit-before cleanup commit) | P-09, H-07 |
| FR-10 (legacy specs without `## Invariants` tolerated) | P-10, H-08 |
| FR-11 (promote-agent documented as sole writer) | P-11 |
| FR-12 (test-agent mode parameter: validator default, advisor explicit) | P-12, H-09 |
| FR-13 (Step 2.75 runs full test suite) | P-13 |
| FR-14 (four-class classification, mutually exclusive) | P-14, P-15, P-16, P-17, H-10, H-11, H-12 |
| FR-15 (structured output schema with both regression booleans) | P-18 |
| FR-16 (advisor mode inputs + forbidden behaviors) | P-19, H-13 |
| FR-17 (advisor structured output — enumerated categories only) | P-20, H-14 |
| FR-18 (advisor one round, ~60s cap, timeout → structured error) | P-21, H-15 |
| FR-19 (mode isolation — distinct spawns, mode validation) | P-22, H-16 |
| FR-20 (implementation-agent routing per class) | P-14, P-15, P-16, P-17 |
| FR-21 (implementation-agent NEVER spawns advisor) | P-23, H-17 |
| FR-22 (pre-flight vs Step 2.75 documented as distinct) | P-24 |
| FR-23 (memory-entry summary forwarded to code-agent) | P-25 |
| FR-24 (df-intake Step 5.5 structure) | P-26 |
| FR-25 (df-intake advisor timeout → proceed + `testAdvisoryCompleted: false`) | P-27, H-15 |
| FR-26 (df-orchestrate documents Step 2.75) | P-28 |
| FR-27 (df-orchestrate surfaces pre-existing regressions in final summary) | P-29, H-18 |
| FR-28 (df-cleanup memory health check categories) | P-30, H-19, H-20, H-21 |
| FR-29 (df-cleanup `--rebuild-memory` ledger-only) | P-31, H-22 |
| FR-30 (setup test assertions) | P-32 |
| FR-31 (contract test mirror parity) | P-33, H-23 |
| BR-1 (single-writer at runtime) | P-11, H-24 |
| BR-2 (IDs never reused) | H-01 |
| BR-3 (ledger always appends) | P-07, H-06 |
| BR-4 (pre-existing does not block) | P-16, H-11 |
| BR-5 (expected does not loop back) | P-17, H-12 |
| BR-6 (advisor/validator never mixed) | H-16 |
| BR-7 (advisor structured only) | H-14 |
| BR-8 (no holdout leak to architect via advisor) | H-25 |
| BR-9 (implementation-agent never spawns advisor) | H-17 |
| BR-10 (gitSha commit-before) | P-09, H-07 |
| BR-11 (re-read at commit time) | H-26 |
| BR-12 (same-wave serialization) | H-27 |
| BR-13 (health issues reported, not auto-fixed) | P-30, H-19 |
| BR-14 (--rebuild-memory ledger-only) | H-22 |
| EC-1 (two Introduces → sequential IDs) | P-02 |
| EC-2 (Supersedes chain) | P-05, H-04 |
| EC-3 (Modifies + history) | P-04, H-03 |
| EC-4 (References dedup) | P-06 |
| EC-5 (same-wave serialization) | H-27 |
| EC-6 (zero-decl spec still appends ledger) | P-07 |
| EC-7 (legacy spec tolerance) | P-10, H-08 |
| EC-8 (developer manual edit between phases) | H-26 |
| EC-9 (empty Guards → pre-existing) | H-28 |
| EC-10 (multi-file Guards with partial overlap → invariant) | H-10 |
| EC-11 (Modifies + promoted test enforces = expected) | P-17, H-12 |
| EC-12 (mixed invariant + pre-existing) | H-29 |
| EC-13 (advisor dedup surfaced) | P-19 |
| EC-14 (advisor missing-coverage) | H-30 |
| EC-15 (advisor free-form prose rejected) | H-14 |
| EC-16 (two spawns in one message — OK if distinct invocations) | H-16 |
| EC-17 (impl-agent advisor-spawn rejected) | H-17 |
| EC-18 (advisor timeout) | H-15 |
| EC-19 (spec-agent can reject advisor recommendations) | H-31 |
| EC-20 (final summary with pre-existing + expected) | H-18 |
| EC-21 (df-cleanup without memory) | H-32 |
| EC-22 (--rebuild-memory without promoted-tests.json) | H-33 |
| EC-23 (plugin mirror drift) | P-33, H-23 |
| EC-24 (atomic write rollback) | H-34 |
| EC-25 (gitSha documented to prevent confusion) | P-09 |
| EC-26 (Introduces + References combined) | P-06 |
| EC-27 (STALE_LEDGER detection) | H-21 |
| AC-24 / AC-25 / AC-26 / AC-27 (out-of-scope files not touched) | H-35 |
