# Feature: ao-thin-impl-agent

## Context

implementation-agent currently reads the spec file and ALL public scenario files into its own context window, then passes that content inline to code-agent's spawn prompt. This is the primary per-spec token sink in the pipeline: every spec run, implementation-agent's context fills with spec prose and scenario text it does not need itself — it only forwards them.

The fix is to eliminate that unnecessary reading. Instead, implementation-agent writes the architect findings to a file and passes PATHS to code-agent. code-agent self-loads from those paths, exactly as it already does for project-profile.md and code-map.md. This reduces implementation-agent's token budget from 4,000 to 3,200 and removes a category of content from its context window permanently.

## Design Intent

**Intent introduced**: The implementation-agent must never read spec or public scenario file content into its own context for the purpose of forwarding that content to code-agent. It passes paths only; code-agent is the reader.

This is DI-TBD-a. The survival criterion: future edits to implementation-agent that add "read the spec to decide X" violate this intent even if the intent is to read for routing purposes — the agent should read only what it needs for its own decisions, not what code-agent needs to read.

**Existing intents touched**: None (no DI entries currently registered).

**Drift risk**: This spec changes a handoff contract between implementation-agent and code-agent. Future AI edits that "helpfully" restore inline content passing (e.g., to make code-agent's brief more self-contained) would silently violate the intent. The test assertions on implementation-agent source content ("must NOT contain 'Read spec file and all public scenario files'") are the primary guard. The token cap test (≤ 3,200) acts as a secondary canary.

## Scope

### In Scope (this spec)
- Remove "read spec file" and "read all public scenario files" logic from implementation-agent's Step 1 (Feature Mode, code-agent spawn)
- Remove same logic from Step 1 of Bugfix Mode (red-phase and green-phase code-agent spawns)
- Write architect findings to `dark-factory/specs/features/{name}.findings.md` (or `bugfixes/{name}.findings.md`) in Step 0d, immediately after synthesis
- Pass `specPath`, `publicScenariosDir`, and `architectFindingsPath` to code-agent as path parameters in the spawn brief
- Update code-agent's self-load instructions to read from those three paths
- Update token cap test: implementation-agent cap 4,000 → 3,200
- Add structural tests asserting the new contract in `tests/dark-factory-setup.test.js`
- Add contract test asserting plugin mirror parity for the updated agents in `tests/dark-factory-contracts.test.js`
- Add findings file cleanup to Step 5 (cleanup step) of implementation-agent

### Out of Scope (explicitly deferred)
- Changes to df-orchestrate (the skill layer) — implementation-agent is the only agent that changes
- Changes to architect-agent, test-agent, promote-agent — their spawn contracts are unchanged
- Wave isolation changes — still handled by df-orchestrate, not affected
- JSON result contracts between test-agent and implementation-agent — unchanged
- Changes to holdout-barrier.md shared block — information barrier rule text is unchanged
- Any UI or developer-visible change to `/df-orchestrate` invocation syntax
- Compressing or summarizing public scenarios before passing — paths are passed as-is

### Scaling Path
If the spec file itself grows too large for code-agent's context (e.g., a very large spec with embedded diagrams), a future spec could have implementation-agent produce a spec-slim.md derivative following the same slim-file pattern used by architect-agent. That is not needed now.

## Requirements

### Functional

- FR-1: implementation-agent Step 0d writes architect findings to `dark-factory/specs/features/{name}.findings.md` (feature mode) or `dark-factory/specs/bugfixes/{name}.findings.md` (bugfix mode) immediately after synthesis — rationale: findings must exist as a file before code-agent is spawned in Step 1.
- FR-2: implementation-agent Step 1 passes `specPath`, `publicScenariosDir`, and `architectFindingsPath` to code-agent as explicit path parameters in the spawn brief — rationale: code-agent must know where to read from without implementation-agent loading the content.
- FR-3: implementation-agent Step 1 does NOT read spec file content or public scenario file content into its own context for the purpose of forwarding to code-agent — rationale: eliminates the primary token sink.
- FR-4: code-agent self-loads from the three paths: reads the spec file from `specPath`, globs and reads all files from `publicScenariosDir`, and reads findings from `architectFindingsPath` — rationale: code-agent already self-loads project-profile and code-map; this is the same pattern.
- FR-5: code-agent MUST use the explicit `publicScenariosDir` path from the brief for scenario loading — it must NOT glob `dark-factory/scenarios/` broadly — rationale: information barrier protection (prevents accidental holdout discovery).
- FR-6: if `architectFindingsPath` points to a file that does not exist (e.g., Tier 1 skip, pre-Step-0d failure), code-agent treats missing findings as empty and continues — rationale: Tier 1 specs may skip or produce no findings file.
- FR-7: the findings file is deleted as part of Step 5 cleanup, alongside the spec file and review files — rationale: findings are a pipeline artifact, not a permanent record.
- FR-8: Bugfix mode (red phase and green phase) applies the same path-passing pattern — implementation-agent passes `specPath` (debug report path), `publicScenariosDir`, and `architectFindingsPath` rather than reading and inlining the content.

### Non-Functional

- NFR-1: compiled implementation-agent.md is at most 3,200 tokens (measured as `ceil(bytes / 4)`) — rationale: this is the target reduction from eliminating inline scenario-reading prose; the token cap test enforces it.
- NFR-2: the spec source file `src/agents/implementation-agent.src.md` decreases in byte count after this change relative to its pre-change size — rationale: the change removes prose, not adds it; any increase would indicate gold-plating.
- NFR-3: information barrier is not weakened — code-agent must never receive holdout scenario content, whether inline or via path — rationale: holdout isolation is a pipeline invariant.

## Data Model

N/A — no database, no persistent schema changes. The `{name}.findings.md` file is a transient pipeline artifact written and deleted within a single implementation run.

## Migration & Deployment

N/A — no existing data affected. This change modifies agent prompt text (Markdown files). There are no stored values, cached keys, or data records in the old format that need migration.

The only "migration" concern is behavioral: after this change, any in-flight implementation run started before the agent files are updated will use the old inline-content pattern until that run completes. Since implementation runs are one-shot (each spec starts fresh), partial-migration state cannot occur mid-run.

## API Endpoints

N/A — this project has no HTTP API layer. The "API" here is the spawn brief contract between implementation-agent and code-agent.

## Business Rules

- BR-1: implementation-agent is NOT allowed to read spec file content OR public scenario file content into its own context for the purpose of forwarding to code-agent. Path passing is the only permitted handoff mechanism — rationale: eliminates the token sink; enforced by structural tests.
- BR-2: code-agent must glob ONLY `publicScenariosDir` (the explicit path from its brief), never a broad `dark-factory/scenarios/` glob — rationale: holdout isolation; if code-agent globbed broadly it could discover holdout scenarios by accident.
- BR-3: the findings file must be written BEFORE code-agent is spawned — Step 0d writes, Step 1 spawns. This ordering is mandatory — rationale: code-agent self-loads at startup; the file must exist before it starts.
- BR-4: a missing findings file is not an error — code-agent logs "No architect findings file at {path} — proceeding with empty findings" and continues — rationale: Tier 1 specs may produce no findings file when review is skipped.
- BR-5: findings file cleanup is part of Step 5 and happens before the commit — rationale: pipeline artifacts must not be left in the repository.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| `architectFindingsPath` file does not exist at code-agent spawn time | code-agent logs warning and proceeds with empty findings | None — not a blocker |
| `specPath` file does not exist | code-agent fails with a clear error message and stops | Implementation-agent receives failure from code-agent spawn; reports to developer |
| `publicScenariosDir` directory does not exist or is empty | code-agent logs warning and proceeds with no scenario context | None — warns but does not block |
| Step 0d write fails (disk full, permission error) | implementation-agent reports error and stops — does NOT proceed to Step 1 | Code-agent is never spawned; no partial state |
| Findings file cleanup in Step 5 fails | Log warning; do NOT block cleanup of other artifacts | Stale findings file may persist; surfaced in df-cleanup health check |

## Acceptance Criteria

- [ ] AC-1: `src/agents/implementation-agent.src.md` does NOT contain the phrase "Read spec file and all public scenario files" (or equivalent read-and-forward prose) in any Step 1 or Step 2 code-agent spawn section.
- [ ] AC-2: `src/agents/implementation-agent.src.md` Step 0d contains language about writing findings to `{name}.findings.md` before spawning code-agent.
- [ ] AC-3: `src/agents/implementation-agent.src.md` Step 1 code-agent spawn brief contains `specPath`, `publicScenariosDir`, and `architectFindingsPath` as explicit parameters.
- [ ] AC-4: `src/agents/code-agent.src.md` (or compiled code-agent.md) documents self-loading from `specPath`, `publicScenariosDir`, and `architectFindingsPath`.
- [ ] AC-5: code-agent.md contains language saying it must use the explicit `publicScenariosDir` path, NOT a broad glob of `dark-factory/scenarios/`.
- [ ] AC-6: compiled `implementation-agent.md` token count is ≤ 3,200 (test passes: `ceil(bytes / 4) <= 3200`).
- [ ] AC-7: `tests/dark-factory-setup.test.js` has a section for `ao-thin-impl-agent` asserting the structural properties above.
- [ ] AC-8: `tests/dark-factory-contracts.test.js` asserts plugin mirror parity for both `implementation-agent.md` and `code-agent.md` (if code-agent.md changes).
- [ ] AC-9: Step 5 cleanup section of `src/agents/implementation-agent.src.md` lists `{name}.findings.md` among files to delete.
- [ ] AC-10: the holdout-barrier.md shared block is unchanged (information barrier rules are not weakened).

## Edge Cases

- EC-1: Tier 1 spec where architect review is skipped or produces no findings — code-agent starts self-loading, finds no findings file, logs and proceeds with empty findings. Implementation must complete successfully.
- EC-2: Best-of-N mode (quality + Tier 3) — two parallel code-agents receive the same three path parameters; each self-loads independently. No shared state. Both must correctly self-load spec and scenarios.
- EC-3: Bugfix mode red phase — code-agent receives `specPath` pointing to a `.debug.md` file, `publicScenariosDir` pointing to the bugfix's public scenario directory, and `architectFindingsPath` pointing to the bugfix findings file. The path-passing pattern is identical; the file types differ.
- EC-4: Multiple tracks (parallel code-agents for a medium/large spec) — each track receives the same three paths. Concurrent read of the same spec file by multiple code-agents is safe (read-only).
- EC-5: AFK mode — findings file is captured before cleanup per existing AFK ordering rules (spec content captured before deletion). The findings file must also be captured before Step 5 deletes it if needed for PR body.
- EC-6: findings file write fails after successful architect approval — implementation-agent reports the write error and stops. Code-agent is NOT spawned. Developer must re-run.
- EC-7: `publicScenariosDir` directory exists but contains no `.md` files (empty scenario set) — code-agent logs and proceeds without scenario context; does not error.
- EC-8: code-agent attempts a broad `dark-factory/scenarios/` glob (attempted holdout discovery) — this must be prevented by explicit instruction in code-agent's brief. Test asserts the instruction is present.

## Dependencies

- **Depends on**: None — this spec is independently implementable.
- **Depended on by**: None within the `ao-thin-orchestrator` group that requires this to complete first.
- **Group**: ao-thin-orchestrator

## Implementation Size Estimate

- **Scope size**: small (2-3 source files changed — `src/agents/implementation-agent.src.md` is the primary change; `src/agents/code-agent.src.md` receives minor additions to document self-load from paths; test files receive new assertions but are not architecturally new).
- **Suggested parallel tracks**: 1 — all changes are in the same agent source file and its compiled outputs. The test additions depend on the agent source changes being complete first.
- **Estimated file count**: 5 (implementation-agent.src.md, code-agent.src.md, compiled .claude/agents/implementation-agent.md, compiled plugins/dark-factory/agents/implementation-agent.md, tests/dark-factory-setup.test.js). dark-factory-contracts.test.js may need a minor assertion update if the implementation-agent → code-agent handoff contract changes materially.

## Architect Review Tier

- **Tier**: Tier 3
- **Reason**: 5+ files touched (implementation-agent.src.md, code-agent.src.md, two compiled outputs, two test files). Additionally, this spec modifies the code-agent spawn contract — a shared handoff boundary tested in dark-factory-contracts.test.js and central to the information barrier cross-cutting concern.
- **Agents**: 3 domain agents
- **Rounds**: 3+

## Implementation Notes

- The compile-time build system (`bin/build-agents.js`) assembles source files via `<!-- include: shared/X.md -->` directives. Edit `src/agents/implementation-agent.src.md` and run `npm run build:agents` to produce compiled outputs. Do NOT hand-edit the compiled `.md` files directly.
- `holdout-barrier.md` is a shared block included in code-agent. Its text ("NEVER read `dark-factory/scenarios/holdout/` from previous features") must remain unchanged. The new rule about `publicScenariosDir` is additive prose in the code-agent's own `## Your Inputs` and `## Feature Mode` sections.
- Current Step 0d text: "Read `{name}.review.md`. Extract ONLY 'Key Decisions Made' and 'Remaining Notes' sections." The new step adds: "Write extracted findings to `dark-factory/specs/features/{name}.findings.md` (or `bugfixes/{name}.findings.md`). This file must be written before code-agent is spawned."
- Current Step 1 text includes "Read spec file and all public scenario files." Replace with: "Pass `specPath`, `publicScenariosDir`, and `architectFindingsPath` to code-agent. code-agent self-loads from these paths."
- Token cap test is in `tests/dark-factory-setup.test.js` under the `"Token cap enforcement"` describe block. Change `"implementation-agent": 4000` → `"implementation-agent": 3200`.
- Step 5 cleanup already lists specific files to delete. Add `dark-factory/specs/features/{name}.findings.md` (and bugfixes variant) to that list.
- The existing plugin mirror test in `tests/dark-factory-contracts.test.js` under `"ao-agent-roles — plugin mirror parity"` already covers all 9 agents including implementation-agent and code-agent. No new mirror test is needed if the existing one runs after `npm run build:agents`.

## Invariants

### Preserves

- The holdout information barrier: code-agent NEVER reads `dark-factory/scenarios/holdout/` — this spec does not weaken it. The barrier is enforced by the existing `holdout-barrier.md` shared block and 50+ existing test assertions.

### References

*None — no INV-NNNN entries currently registered in memory shards.*

### Introduces

- **INV-TBD-a**
  - **title**: implementation-agent passes paths to code-agent, never inline content
  - **rule**: implementation-agent MUST NOT read spec file content or public scenario content into its own context for the purpose of forwarding that content to code-agent's spawn brief. Only `specPath`, `publicScenariosDir`, and `architectFindingsPath` (file paths) may be passed.
  - **scope.modules**: `src/agents/implementation-agent.src.md`, `.claude/agents/implementation-agent.md`, `plugins/dark-factory/agents/implementation-agent.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (ao-thin-impl-agent section)
  - **rationale**: prevents implementation-agent's context from filling with content it only proxies; the token budget reduction from 4,000 to 3,200 is the quantifiable invariant. If this rule is violated, the token cap test will catch it as a secondary signal.

- **INV-TBD-b**
  - **title**: code-agent globs only the explicit publicScenariosDir, not the broad scenarios root
  - **rule**: code-agent MUST use only the `publicScenariosDir` path provided in its spawn brief when globbing for scenario files. It MUST NOT glob `dark-factory/scenarios/` broadly or any path that could traverse into `dark-factory/scenarios/holdout/`.
  - **scope.modules**: `src/agents/code-agent.src.md`, `.claude/agents/code-agent.md`, `plugins/dark-factory/agents/code-agent.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (ao-thin-impl-agent section)
  - **rationale**: holdout information barrier — broad glob could accidentally discover holdout scenarios in the same filesystem tree. The explicit path from the brief is the only safe mechanism.

### Modifies

*None.*

### Supersedes

*None.*

## Decisions

### References

*None — no DEC-NNNN entries currently registered.*

### Introduces

- **DEC-TBD-a**
  - **title**: findings file as handoff mechanism for architect review output
  - **decision**: architect findings (Key Decisions Made + Remaining Notes) are written to a `{name}.findings.md` file in the spec directory immediately after architect review synthesis. code-agent receives the file path, not the content inline.
  - **rationale**: consistent with the path-passing pattern being applied to spec and scenarios. Keeps all three code-agent inputs (spec, scenarios, findings) as files rather than inline content. Allows code-agent to decide whether to read findings based on whether the file exists.
  - **alternatives**: (1) inline findings in spawn brief only — rejected because it adds back inline content to the brief; (2) skip findings file entirely, pass nothing — rejected because code-agent needs architect decisions as architectural constraints; (3) embed findings in the review file and pass the review path — rejected because review files contain full round-by-round discussion that violates the information barrier (code-agent must only see Key Decisions and Remaining Notes).
  - **scope.modules**: `src/agents/implementation-agent.src.md`, `src/agents/code-agent.src.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (ao-thin-impl-agent section)

### Supersedes

*None.*

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 (findings file written in Step 0d) | P-01, P-02 |
| FR-2 (paths passed to code-agent) | P-03, P-04 |
| FR-3 (impl-agent does NOT read inline content) | P-05, H-01 |
| FR-4 (code-agent self-loads from paths) | P-04 |
| FR-5 (code-agent uses publicScenariosDir only) | P-06, H-02 |
| FR-6 (missing findings file is non-blocking) | P-07, H-03 |
| FR-7 (findings file cleaned up) | P-08 |
| FR-8 (bugfix mode same pattern) | H-04 |
| BR-1 (impl-agent no inline forwarding) | P-05, H-01 |
| BR-2 (publicScenariosDir only) | P-06, H-02 |
| BR-3 (findings written before spawn) | P-02, H-05 |
| BR-4 (missing findings non-blocking) | P-07, H-03 |
| BR-5 (cleanup includes findings file) | P-08, H-09 |
| NFR-1 (token cap ≤ 3,200) | P-09 |
| NFR-2 (source file shrinks) | H-01 |
| NFR-3 (barrier not weakened) | P-10 |
| EC-1 (Tier 1 no findings) | P-07, H-03 |
| EC-2 (Best-of-N parallel self-load) | H-06 |
| EC-3 (bugfix mode paths) | H-04 |
| EC-4 (multiple tracks concurrent read) | H-07 |
| EC-5 (AFK mode findings capture) | H-08 |
| EC-6 (findings write failure stops pipeline) | H-05 |
| EC-7 (empty scenario directory) | H-10 |
| EC-8 (broad glob prevention) | P-06, H-02 |
| AC-6 (token cap) | P-09 |
| AC-7 (test section completeness) | H-12 |
| AC-8 (plugin mirror parity) | H-11 |
| AC-10 (holdout barrier unchanged) | P-10 |
