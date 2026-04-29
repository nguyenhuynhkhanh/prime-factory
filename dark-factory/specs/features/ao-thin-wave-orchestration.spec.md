# Feature: ao-thin-wave-orchestration

## Context

When a developer runs `/df-orchestrate --all` or `--group` against a manifest with 6+ active specs, the high-level orchestrator accumulates prose summaries across waves. Each wave agent returns a narrative text block; the orchestrator carries all prior-wave summaries in its context window. By wave 3 of a large run, the orchestrator context is bloated with spec prose, scenario text, and narrative analysis — none of which helps the orchestrator make its only real decisions: "did this wave pass?" and "which specs should run next?".

This feature replaces the prose result exchange between the orchestrator and wave agents with a structured JSON result contract. Each implementation-agent returns a small JSON object. Each wave agent aggregates those objects into a per-wave JSON summary. The orchestrator reads only JSON summaries — no spec prose, no scenario text, no narrative. Wave agents are fresh per wave, receiving no carryover context from prior waves.

The result is a predictable, token-bounded coordination layer that maintains quality regardless of how many waves run.

## Design Intent

**Intent introduced**: Structured JSON result contract between orchestrator and wave agents.

- **DI-TBD-a**: The orchestrator MUST NOT read spec file contents, scenario text, or narrative prose during wave execution. It coordinates exclusively through the structured JSON result schema. The survival criterion: the orchestrator's context token budget must remain bounded by the number of active specs, not by the size of their content. This is fragile because future authors may be tempted to "enrich" wave summaries with context snippets for debugging convenience, which would silently erode the token guarantee.

- **DI-TBD-b**: Wave agents MUST be fresh per wave — no carryover context from prior waves. The survival criterion: a wave agent spawned for wave 3 has no knowledge of what wave 1 or wave 2 produced beyond what the orchestrator explicitly passes in the JSON summary it receives. This is fragile because the agent-spawning interface makes it tempting to pass "full context" payloads for convenience.

**Existing intents touched**: None — the memory index is empty (bootstrap state). No existing DI-NNNN entries in scope.

**Drift risk**: The orchestrator SKILL.md is the primary drift target. Any future author adding a "rich context pass-through" to improve debugging UX would silently violate DI-TBD-a. The 3,500-token file-size cap (tested by the token-cap assertion) acts as a structural tripwire — bloat is detectable before it erodes the contract. Cross-cutting: this spec uses "pipeline" language and introduces a system-wide result schema; both signals require this field to be populated (per template rules).

## Scope

### In Scope (this spec)

- Structured JSON result schema for implementation-agent end-of-lifecycle emission
- Wave agent aggregation of per-spec JSON results into a per-wave JSON summary
- Orchestrator (df-orchestrate SKILL.md) changes to consume JSON summaries exclusively during wave execution
- Wave isolation: each wave spawns a fresh wave agent with no carryover context from prior waves
- Failure handling for malformed JSON results (treat as `failed` + `result-parse-error`)
- Token-cap enforcement as a static test assertion in `tests/dark-factory-setup.test.js`
- Plugin mirror update for `plugins/dark-factory/skills/df-orchestrate/SKILL.md`
- New tests in `tests/dark-factory-setup.test.js` verifying schema, wave isolation language, and token cap
- Contracts test assertion in `tests/dark-factory-contracts.test.js` verifying df-orchestrate plugin mirror parity post-change

### Out of Scope (explicitly deferred)

- Changes to how specialist agents (architect, code, test, promote) do their work internally
- Changes to code-agent spawning (that is ao-thin-impl-agent, a parallel spec)
- AFK flow — unchanged
- Manifest schema — unchanged
- Disk persistence of wave result JSON — not required (confirmed by developer); results live only in the orchestrator's active context during a run
- Richer result fields beyond the confirmed schema (e.g., timing data, per-round metrics)
- UI or developer-facing output changes beyond the progress messages already present

### Scaling Path

If wave result JSON needs to persist for debugging or retry purposes, the `promotedTestPath` field already provides a stable file reference. Disk persistence can be added as a future spec without breaking the schema contract. If spec counts grow beyond 100 per wave, the token budget calculation (tested statically) provides an early warning because the SKILL.md size cap becomes binding before the per-result overhead does.

## Requirements

### Functional

- FR-1: Each implementation-agent MUST emit a structured JSON result at the end of its lifecycle — this is additive to existing steps, not a replacement. The result MUST conform to the schema: `specName` (required), `status` (required), `error` (required when status is `failed` or `blocked`), `promotedTestPath` (required when status is `passed`), `tierEscalation` (optional).
- FR-2: The wave agent MUST collect per-spec JSON results and return a per-wave JSON summary to the orchestrator. The summary is an array of result objects, one per spec in the wave.
- FR-3: The orchestrator MUST process only JSON results from wave agents — no spec prose, no scenario text, no narrative summaries — during wave execution.
- FR-4: Each wave agent MUST be spawned fresh with no carryover context from prior waves. The orchestrator passes only: list of spec names, spec paths, branch, pipeline mode, afk flag.
- FR-5: If a wave agent returns malformed or unparseable JSON, the orchestrator MUST treat all specs in that wave as `status: "failed"` with `error: "result-parse-error"`.
- FR-6: If only some specs in a wave return parseable results (partial wave result), the orchestrator MUST process the valid results normally and treat missing specs as `status: "failed"` with `error: "result-parse-error"`.
- FR-7: An implementation-agent that hits a token-cap condition MUST emit `status: "token-cap"` as a distinguishable sentinel (not `failed`), allowing the orchestrator to surface a different actionable message.
- FR-8: The orchestrator MUST collect all wave results before computing which specs are blocked for the next wave — no early exit within a wave.
- FR-9: `tierEscalation` in the result object, when present, MUST be recorded in the manifest by the orchestrator (or passed through for the implementation-agent to record — implementation-agent already records this; the schema just formalizes it).
- FR-10: The df-orchestrate SKILL.md file size MUST remain at or below 3,500 tokens after this change.

### Non-Functional

- NFR-1: The combined token cost of the orchestrator context window during wave execution (SKILL.md content + all per-spec result objects for a wave) MUST be calculably bounded: target ≤ 20,000 tokens for any realistic wave size (≤ 100 specs per wave). This is enforced by a static test assertion.
- NFR-2: Developer-facing output is externally identical — same flags, same progress messages, same final summary format. No developer behavior change.
- NFR-3: Backward compatibility: in-flight specs in the manifest continue to work. The implementation-agent lifecycle adds a JSON emit step at the end; existing lifecycle steps are unchanged.
- NFR-4: df-cleanup compatibility: unchanged — it reads `manifest.json` and `promoted-tests.json`, not wave result JSON. No change required.

## Data Model

No new persistent data structures. The JSON result object is transient — it exists only in the active context of a running orchestration session.

**Result object schema (transient):**

```json
{
  "specName": "my-feature",
  "status": "passed" | "failed" | "blocked" | "token-cap",
  "error": "optional: reason string (required when status is failed or blocked)",
  "promotedTestPath": "optional: path to promoted test file (required when status is passed)",
  "tierEscalation": {
    "from": 2,
    "to": 3,
    "reason": "..."
  }
}
```

**Field rules (enforced by implementation-agent and by tests):**

| Field | Required when | Notes |
|-------|---------------|-------|
| `specName` | Always | Must match the spec identifier from the manifest |
| `status` | Always | One of: `passed`, `failed`, `blocked`, `token-cap` |
| `error` | `status` is `failed` or `blocked` | Omit for `passed` and `token-cap` |
| `promotedTestPath` | `status` is `passed` | Omit for all other statuses |
| `tierEscalation` | When architect self-escalated | Object with `from`, `to`, `reason` |

**Per-wave summary (transient, returned by wave agent to orchestrator):**

An array of result objects. If the wave fails entirely, the wave agent returns an empty array or a parse-error sentinel. The orchestrator treats an empty/malformed wave response as all-failed for that wave's specs.

## Migration & Deployment

N/A — no existing data affected. The result schema is transient (in-context only during a live orchestration run). No schema changes to `manifest.json`. No changes to `promoted-tests.json`. No cached values or stored formats are altered.

The additive nature of this change means zero migration risk: implementation-agent adds a JSON emit step at the end of its existing lifecycle. Specs currently in-flight in the manifest are unaffected — they will simply emit a JSON result at the end of their next completed lifecycle pass.

## API Endpoints

N/A — this is a prompt-engineering framework. There are no HTTP endpoints. The "API" is the agent-to-agent handoff contract defined in the result schema above.

## Business Rules

- BR-1: `status` is the single authoritative signal for downstream decisions. The orchestrator MUST NOT inspect any other field to determine pass/fail/block routing. If `status` is `passed`, the spec succeeded. If `status` is `failed` or `blocked`, its dependents are paused. If `status` is `token-cap`, it is treated as failed for dependency purposes but surfaces a distinct message.
- BR-2: `error` is REQUIRED when `status` is `failed` or `blocked`. An implementation-agent that emits `status: "failed"` without an `error` field produces a malformed result, which the orchestrator treats as `error: "result-parse-error"`. The test suite asserts the schema contract.
- BR-3: `promotedTestPath` is REQUIRED when `status` is `passed`. An implementation-agent that emits `status: "passed"` without a `promotedTestPath` produces a malformed result.
- BR-4: Wave agents MUST NOT pass spec file contents, scenario text, or any prose-form context to the orchestrator. The per-wave summary is strictly an array of JSON result objects.
- BR-5: The orchestrator MUST NOT pass spec file contents to wave agents. Wave agents receive only: spec names, spec paths (as identifiers), branch name, pipeline mode, afk flag.
- BR-6: A wave agent crash with NO result is treated as all specs in that wave failed with `error: "wave-agent-crash"`. A wave agent crash with PARTIAL results processes valid results normally and marks the rest as `error: "wave-agent-crash"`.
- BR-7: `token-cap` is a distinguishable sentinel. The orchestrator surfaces: "Spec {name} hit token cap — re-run with `--mode lean` or split the spec." It does NOT surface the generic failure message for `token-cap`.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| `status: "failed"` with `error` present | Block transitive dependents; report in final summary | Manifest entry stays `active` |
| `status: "blocked"` with `error` present | Block transitive dependents; report architect BLOCKED | Manifest entry stays `active` |
| `status: "token-cap"` | Block transitive dependents; surface token-cap message | Manifest entry stays `active` |
| Malformed JSON (unparseable result) | Treat as `failed` + `error: "result-parse-error"` | Block transitive dependents |
| Wave agent crashes with no result | All specs in wave treated as `failed` + `error: "wave-agent-crash"` | Block all transitive dependents |
| Wave agent returns partial results | Valid results processed normally; missing specs treated as `failed` + `error: "wave-agent-crash"` | Partial blocking |
| `status: "passed"` but `promotedTestPath` missing | Treat as malformed; log warning; report as `failed` + `error: "result-parse-error"` | Block transitive dependents |
| `status: "failed"` or `"blocked"` but `error` missing | Treat as malformed; log warning; report with `error: "result-parse-error"` | Block transitive dependents |

## Acceptance Criteria

- [ ] AC-1: df-orchestrate SKILL.md Autonomous Wave Execution section instructs wave agents to return structured JSON results (not prose summaries).
- [ ] AC-2: df-orchestrate SKILL.md instructs the orchestrator to read only JSON results from wave agents during wave execution — no spec prose, no scenario text.
- [ ] AC-3: df-orchestrate SKILL.md describes what the orchestrator passes to each wave agent: spec names, spec paths, branch, pipeline mode, afk flag — no spec file contents.
- [ ] AC-4: df-orchestrate SKILL.md describes wave agent freshness: each wave spawns a new wave agent with no carryover context from prior waves.
- [ ] AC-5: implementation-agent.src.md adds a structured JSON result emit step at the end of the feature-mode and bugfix-mode lifecycle (after promote/cleanup or at failure).
- [ ] AC-6: The JSON result schema is defined in the implementation-agent (or SKILL.md) with all required fields and their conditionality rules.
- [ ] AC-7: Malformed JSON and wave agent crash error handling is documented in df-orchestrate SKILL.md.
- [ ] AC-8: `token-cap` sentinel is defined in implementation-agent.src.md and handled distinctly in df-orchestrate SKILL.md.
- [ ] AC-9: df-orchestrate SKILL.md file is ≤ 3,500 tokens after the change (enforced by test).
- [ ] AC-10: `tests/dark-factory-setup.test.js` has a new promoted section (between `DF-PROMOTED-START: ao-thin-wave-orchestration` and `DF-PROMOTED-END: ao-thin-wave-orchestration`) with assertions for: result schema language, wave isolation language, token cap, and `token-cap` sentinel.
- [ ] AC-11: `tests/dark-factory-contracts.test.js` has an assertion that `plugins/dark-factory/skills/df-orchestrate/SKILL.md` matches `.claude/skills/df-orchestrate/SKILL.md` (or the existing plugin mirror assertion covers it — verify the existing serena-integration assertion is still present and sufficient, otherwise add a dedicated ao-thin-wave-orchestration mirror assertion).
- [ ] AC-12: `plugins/dark-factory/skills/df-orchestrate/SKILL.md` is manually updated to match `.claude/skills/df-orchestrate/SKILL.md`.
- [ ] AC-13: `plugins/dark-factory/agents/implementation-agent.md` is rebuilt from `src/agents/implementation-agent.src.md` via `npm run build:agents`.

## Edge Cases

- EC-1: Wave with a single spec — wave agent returns a JSON array with one element. Orchestrator processes it identically to a multi-spec wave. The single-spec mode exception (spawning implementation-agent directly) still applies when the manifest resolves to exactly one spec; EC-1 only applies when the wave architecture is in use.
- EC-2: All specs in a wave fail — orchestrator computes all dependents as blocked, reports each in the final summary, but does NOT abort early if independent specs remain in later waves.
- EC-3: Token-cap and passed results in the same wave — orchestrator processes the passed results normally (promote their test paths) and surfaces the token-cap message separately for the affected spec(s).
- EC-4: Wave agent returns an empty array `[]` — treated as all specs in the wave failed with `error: "wave-agent-crash"`. Not treated as a valid "all succeeded" response.
- EC-5: `tierEscalation` field present in result but architect did not actually self-escalate — implementation-agent is the authority; if it emits `tierEscalation`, the orchestrator records it without re-validation.
- EC-6: Very large wave (e.g., 100 specs) — token budget remains ≤ 20,000 tokens (6,200 by the calculation in the synthesis findings). The static test assertion acts as an ongoing guard.
- EC-7: `status: "token-cap"` with an `error` field present — the `error` field is logged but the display message uses the `token-cap`-specific text (BR-7 takes precedence).
- EC-8: Implementation-agent emits result BEFORE cleanup completes — result must be emitted at the very end, after all cleanup steps, so `promotedTestPath` reflects the final promoted location.
- EC-9: In-flight run interrupted mid-wave — partial wave results are not persisted to disk (no disk persistence in scope). On re-run, the orchestrator re-executes from the manifest's `active` entries, treating all specs without `promoted` status as needing a full cycle.

## Dependencies

- **Depends on**: None — this spec is independently implementable (can run in parallel with ao-thin-impl-agent).
- **Depended on by**: None within the `ao-thin-orchestrator` group — this spec stands alone.
- **Group**: ao-thin-orchestrator

## Implementation Size Estimate

- **Scope size**: small (2-3 source files + 1 compiled output pair + test additions)
- **Suggested parallel tracks**: 1 (sequential)
  - Track 1 (single): Update `.claude/skills/df-orchestrate/SKILL.md` → mirror to `plugins/dark-factory/skills/df-orchestrate/SKILL.md` → update `src/agents/implementation-agent.src.md` → run `npm run build:agents` to produce compiled outputs → add test assertions to `tests/dark-factory-setup.test.js` and verify `tests/dark-factory-contracts.test.js`.
  - Rationale: df-orchestrate SKILL.md is the primary change. The implementation-agent addition is purely additive (a new emit step at lifecycle end). Both depend on the schema definition being settled first, so sequential is correct.

**Estimated file count**: 5 files (`.claude/skills/df-orchestrate/SKILL.md`, `plugins/dark-factory/skills/df-orchestrate/SKILL.md`, `src/agents/implementation-agent.src.md`, `.claude/agents/implementation-agent.md`, `plugins/dark-factory/agents/implementation-agent.md`) + test file additions.

## Architect Review Tier

- **Tier**: Tier 3
- **Reason**: Cross-cutting keywords present ("pipeline", "system-wide" result contract across all implementation-agents). 5+ files touched. Introduces a new agent-to-agent contract that all future wave execution depends on. Security/integrity domain: the result schema is the trust boundary between wave agents and the orchestrator — malformed results must be handled safely without halting independent specs.
- **Agents**: 3 domain agents
- **Rounds**: 3+

## Implementation Notes

**df-orchestrate SKILL.md changes (Autonomous Wave Execution section):**
- The "Wave Agent Spawning" subsection currently says "Each wave agent returns structured results with per-spec status: passed/failed/blocked, error details, promoted test paths." — this is a stub. Replace with explicit JSON schema definition and the processing rules.
- Add to the orchestrator responsibilities list: "Reads only JSON results from wave agents — no spec prose."
- Document what is passed to each wave agent (spec names, spec paths, branch, mode, afk — nothing else).
- Document the malformed-JSON and wave-agent-crash handling.
- Document `token-cap` sentinel handling.
- Keep the final summary format identical to today's — it is developer-facing and must not change.

**implementation-agent.src.md addition (additive only):**
- After the existing Post-Implementation Lifecycle (Step 5: Cleanup) section in Feature Mode, add a "Step 6: Emit Structured Result" step.
- After the Bugfix Mode Step 3 holdout validation path, add the same emit step.
- On any failure path (architect BLOCKED after all rounds, implementation rounds exhausted, token cap), emit the result before surfacing to the developer.
- The emit step must run AFTER cleanup so `promotedTestPath` is the final promoted file location.
- Use the exact schema from the Data Model section — no fields beyond what is specified.

**Build system note:**
- `src/agents/implementation-agent.src.md` is the source. Run `npm run build:agents` after editing it — this produces `.claude/agents/implementation-agent.md` AND `plugins/dark-factory/agents/implementation-agent.md` simultaneously.
- `df-orchestrate/SKILL.md` is NOT compiled by the build system — it must be manually mirrored to `plugins/dark-factory/skills/df-orchestrate/SKILL.md`.

**Test additions (dark-factory-setup.test.js):**
- Add a new promoted section at the end of the file, between `DF-PROMOTED-START: ao-thin-wave-orchestration` and `DF-PROMOTED-END: ao-thin-wave-orchestration`.
- Assert df-orchestrate SKILL.md contains JSON result schema language.
- Assert df-orchestrate SKILL.md contains wave isolation language (no carryover context).
- Assert df-orchestrate SKILL.md specifies what is NOT passed to wave agents (no spec prose/scenario text).
- Assert token cap: SKILL.md character count ≤ 14,000 characters (≈ 3,500 tokens at ~4 chars/token) — use `fs.readFileSync` and `content.length`.
- Assert implementation-agent contains `token-cap` sentinel language.
- Assert implementation-agent contains result emit step language.

**Contracts test (dark-factory-contracts.test.js):**
- The existing serena-integration section already asserts `plugins df-orchestrate SKILL.md matches source after serena-integration`. Verify this assertion still covers the updated files — it should, since it does an exact-match comparison. No new assertion required unless the existing one is removed.

## Invariants

### Preserves
- The orchestrator information barrier rules remain fully in force: NEVER pass holdout scenario content to code-agent, NEVER pass public scenario content to test-agent, NEVER pass test/scenario content to architect-agent. This spec does not weaken any existing barrier.
- Plugin mirror consistency: any change to `.claude/skills/df-orchestrate/SKILL.md` must be mirrored to `plugins/dark-factory/skills/df-orchestrate/SKILL.md`. Enforced by contracts test.

### References
*None — no existing registered INV-NNNN invariants in the memory index.*

### Introduces

- **INV-TBD-a**
  - **title**: Orchestrator JSON-only wave result contract
  - **rule**: df-orchestrate MUST NOT read spec file contents, scenario text, or prose summaries from wave agents during wave execution. All inter-agent results between the orchestrator and wave agents MUST conform to the structured JSON result schema defined in this spec.
  - **scope.modules**: `.claude/skills/df-orchestrate/SKILL.md`, `plugins/dark-factory/skills/df-orchestrate/SKILL.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (ao-thin-wave-orchestration section)
  - **rationale**: Without this invariant, future authors will enrich wave summaries with prose context "for debugging convenience," silently destroying the token budget guarantee and allowing orchestrator context bloat to return.

- **INV-TBD-b**
  - **title**: Wave agent freshness — no cross-wave carryover
  - **rule**: Each wave spawned by df-orchestrate MUST be a fresh agent instance receiving only: spec names, spec paths, branch, pipeline mode, afk flag. No context from prior waves is permitted.
  - **scope.modules**: `.claude/skills/df-orchestrate/SKILL.md`, `plugins/dark-factory/skills/df-orchestrate/SKILL.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (ao-thin-wave-orchestration section)
  - **rationale**: Cross-wave context carryover is the root cause of the orchestrator bloat problem this spec fixes. Formalizing this as an invariant ensures it survives cleanup and future refactors.

- **INV-TBD-c**
  - **title**: Implementation-agent structured result emit
  - **rule**: Every implementation-agent lifecycle MUST end with a structured JSON result emit conforming to the schema: `specName` (always), `status` (always), `error` (when failed/blocked), `promotedTestPath` (when passed), `tierEscalation` (when escalated).
  - **scope.modules**: `src/agents/implementation-agent.src.md`, `.claude/agents/implementation-agent.md`, `plugins/dark-factory/agents/implementation-agent.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (ao-thin-wave-orchestration section)
  - **rationale**: Without this invariant, implementation-agents could silently omit the structured result, causing the wave agent to produce a malformed summary and blocking all specs in the wave unnecessarily.

### Modifies
*None.*

### Supersedes
*None.*

## Decisions

### References
*None — no existing DEC-NNNN decisions in the memory index.*

### Introduces

- **DEC-TBD-a**
  - **title**: No disk persistence for wave result JSON
  - **decision**: Wave result JSON lives only in the orchestrator's active context window during a run. It is not written to disk.
  - **rationale**: Disk persistence adds complexity (file naming, cleanup, retry-reads) with no benefit for the normal case. The `promotedTestPath` field in the result already provides a stable reference to any permanent artifact. Wave results are inherently ephemeral — they exist only to inform the next scheduling decision.
  - **alternatives**: Persist to `dark-factory/results/{wave-N}/wave-summary.json`. Rejected: adds cleanup burden, creates a partial-run state artifact that could confuse df-cleanup, and provides no recovery value since the orchestrator re-resolves from manifest state on re-run.
  - **scope.modules**: `.claude/skills/df-orchestrate/SKILL.md`
  - **domain**: architecture
  - **enforcement**: manual (design constraint, not mechanically testable)

- **DEC-TBD-b**
  - **title**: `token-cap` as a distinguishable status sentinel
  - **decision**: Token-cap conditions emit `status: "token-cap"` rather than `status: "failed"`.
  - **rationale**: Token cap is a resource constraint, not a logic failure. The correct remediation (reduce mode, split spec) is different from a failed implementation (fix the code). Conflating them under `"failed"` produces a misleading actionable message for the developer.
  - **alternatives**: Emit `status: "failed"` with `error: "token-cap"` and have the orchestrator inspect the `error` field. Rejected: BR-1 says `status` is the single authoritative signal; parsing `error` for routing decisions violates that rule and makes the contract fragile.
  - **scope.modules**: `src/agents/implementation-agent.src.md`, `.claude/skills/df-orchestrate/SKILL.md`
  - **domain**: architecture
  - **enforcement**: manual (test asserts the sentinel language exists in both files)

### Supersedes
*None.*

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 (impl-agent JSON emit) | P-01, P-02 |
| FR-2 (wave agent aggregation) | P-03 |
| FR-3 (orchestrator JSON-only) | P-04 |
| FR-4 (wave freshness) | P-05 |
| FR-5 (malformed JSON → failed) | H-01 |
| FR-6 (partial wave results) | H-02 |
| FR-7 (token-cap sentinel) | H-03, P-06 |
| FR-8 (collect all before blocking) | H-04 |
| FR-9 (tierEscalation passthrough) | H-05 |
| FR-10 (SKILL.md ≤ 3,500 tokens) | P-07 |
| BR-1 (status is authoritative) | P-04, H-01 |
| BR-2 (error required when failed/blocked) | H-06 |
| BR-3 (promotedTestPath required when passed) | H-07 |
| BR-4 (wave agents no prose) | P-03, P-04 |
| BR-5 (orchestrator no spec prose to wave) | P-05 |
| BR-6 (wave agent crash handling) | H-02, H-08 |
| BR-7 (token-cap distinct message) | H-03 |
| EC-1 (single-spec wave) | P-03 |
| EC-2 (all specs fail) | H-04 |
| EC-3 (mixed token-cap + passed) | H-09 |
| EC-4 (empty array response) | H-08 |
| EC-5 (tierEscalation recorded) | H-05 |
| EC-6 (large wave token budget) | P-07 |
| EC-7 (token-cap with error field) | H-03 |
| EC-8 (emit after cleanup) | P-02 |
| EC-9 (interrupted run re-runs from manifest) | H-10 |
| AC-9 (SKILL.md token cap) | P-07 |
| AC-10 (test section exists) | P-07 |
| AC-11 (plugin mirror) | P-08 |
