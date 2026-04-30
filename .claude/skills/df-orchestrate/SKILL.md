---
name: df-orchestrate
description: "Run Dark Factory implementation cycle. Spawns implementation-agents to handle per-spec lifecycle in isolated worktrees."
---

# Dark Factory — Orchestrate Implementation

You are the orchestrator for the implementation phase. You are a thin coordinator: you resolve dependencies, manage waves, and spawn implementation-agents. You do NOT perform architect review, code-agent spawning, or holdout validation directly.

## Trigger

`/df-orchestrate {name} [name2...]` — explicit spec names
`/df-orchestrate --group {group-name}` — all active specs in a group
`/df-orchestrate --all` — every active spec in the manifest
Optional: `--force` — override cross-group guard in explicit mode
Optional: `--skip-tests` — bypass the pre-flight test gate (logged in manifest)
Optional: `--mode lean|balanced|quality` — quality-vs-speed tradeoff (default: balanced). lean = claude-sonnet everywhere, no Best-of-N; balanced = claude-sonnet Tier 1/2, claude-opus Tier 3, no Best-of-N; quality = claude-opus everywhere + Best-of-N for Tier 3
Optional: `--afk` — post-run draft PR creation via `gh pr create --draft` for each promoted spec. Reads spec `## Context`/`## Acceptance Criteria` before cleanup. Non-blocking failures. `--afk --skip-tests`: warn but don't error

### Argument Parsing

1. **Parse flags**: `--group`, `--all`, `--force`, `--skip-tests`, `--mode`, `--afk`; everything else is a spec name.
   - `--mode` validation: must be `lean`, `balanced`, or `quality`. Invalid → "Unknown mode '{value}'. Valid modes: lean, balanced, quality." Abort.
   - `--best-of-n` is not a standalone flag → "Unknown flag '--best-of-n'. Best-of-N is automatically enabled in --mode quality for Tier 3 specs. Use --mode quality instead."
   - `--mode` and `--skip-tests` are orthogonal — NOT mutually exclusive. Do NOT add a mutual-exclusivity check for this combination.
2. **Mutual exclusivity** (fail fast): `--group` + `--all` → "Cannot use --group and --all together." `--group`/`--all` + explicit names → "Cannot combine --group/--all with explicit spec names." `--group` with no argument → "--group requires a group name."
3. **`--force` warnings**: With `--group`/`--all`, warn: "--force has no effect with --group/--all (it only applies to explicit mode cross-group guard)." Not an error.
4. **Determine mode**: `--group` → Group Mode; `--all` → All Mode; names → Explicit Mode

---

## Execution Plan Mode Block

Include BEFORE the developer confirmation prompt:

```
Mode: {mode} (default)
  → lean:     Fast and cheap — rapid iteration and low-risk changes. All specs: claude-sonnet | No Best-of-N
  → balanced: Standard workflow — Tier 1/2 specs: claude-sonnet | Tier 3 specs: claude-opus | No Best-of-N
  → quality:  Maximum confidence — claude-opus for all specs. Tier 3 specs: Best-of-N (two independent tracks)
```

For quality runs, note per-spec: "Tier 1 spec — Best-of-N skipped" or "Tier 3 spec — Best-of-N enabled."

---

## Group Mode (`--group {name}`)

1. **Query manifest**: Read `dark-factory/manifest.json`. Find entries where `group` exactly equals the given name AND `status == "active"`. If no active specs match: check if any specs (any status) have that group name. If none at all: "No group named '{name}' found. Available groups: [list]". If all completed: "All specs in group '{name}' are already completed. Nothing to do."
2. **Resolve dependencies into waves** and show "already completed (skipped)" for removed dependencies.
3. **Display execution plan** (including Mode Block) and wait for developer confirmation.
4. **Execute waves** in order.

---

## All Mode (`--all`)

1. **Query manifest**: Find every entry with `status == "active"`. If none: "No active specs found. Nothing to do."
2. **Partition by `group` field**: Entries with `group: null` are standalone — each is independent.
3. **Resolve waves per group** independently. Display execution plan. Wait for developer confirmation.
4. **Execute**: Run independent groups' waves in parallel. Standalone specs run in parallel with everything. Within each group, waves are sequential.

---

## Cross-Group Guard (Explicit Mode Only)

Single spec: no guard. Multiple specs: collect unique non-null groups. All same group → proceed. Different groups → warn "Specs belong to different groups: {spec-a} ({group-a}), {spec-b} ({group-b}). Use --force to proceed anyway." and stop. `--force` present → skip warning, proceed.

---

## Resume Semantics

Both modes resume after partial failures: only `status: "active"` specs run. Dependencies not in the manifest = satisfied (already completed). Show removed dependencies as "already completed (skipped)".

---

## Wave Resolution Algorithm

Build a DAG from `dependencies` fields. Dependencies not in manifest = satisfied (completed). Topological sort: Wave 1 = specs with no unsatisfied deps; Wave N = specs whose deps are all in waves < N or satisfied. Must be deterministic — same manifest = same plan.

---

## Backward Compatibility for Missing Fields

- Missing `group` field → treat as `null` (standalone)
- Missing `dependencies` field → treat as `[]` (no dependencies)

## Pre-Phase: Code Map Refresh

Ensure code map is current before pre-flight. Read `dark-factory/code-map.md` header, extract `Git hash:` line. Run `git rev-parse HEAD`. Hash matches → proceed. Hash differs/missing → invoke codemap-agent. Greenfield → proceed without map.

## Pre-flight Checks

Fail fast — check all before starting:
1. Check `dark-factory/project-profile.md` — if missing, warn but do NOT block.
2. Verify spec, public scenarios, and holdout scenarios exist. Abort if any missing.
3. **Circular dependency detection**: "Circular dependency detected: spec-a -> spec-b -> spec-c -> spec-a. Fix the dependency declarations in the manifest." Abort.
4. **Cross-group dependency validation**: Dependencies must be within the same group. Abort violations.

## Pre-flight Test Gate

Run the project's test suite ONCE before any implementation. This gate catches failures early — preventing wasted architect and code-agent time.

1. Read `dark-factory/project-profile.md`, extract test command from `Run:` field. If profile or `Run:` missing: warn "No test command found in project profile. Skipping pre-flight test gate." Proceed.
2. If `--skip-tests`: log "Pre-flight test gate skipped." Record `"testGateSkipped": true` and `"testGateSkippedAt"` in manifest. Proceed.
3. Run test suite. If failures: report ALL failures, abort ALL specs. The test gate runs ONCE before any specs are processed.

## Detect Mode

- Spec in `dark-factory/specs/features/` → **Feature mode**
- Spec in `dark-factory/specs/bugfixes/` → **Bugfix mode**

## Worktree Isolation

Each spec runs in its own git worktree. Worktree is created BEFORE implementation and merged back AFTER.

### Serena Worktree Setup

Before spawning any agent, write `.serena/project.yml` to the worktree root with `project_root: /absolute/path/to/worktree` (absolute path — required). On write failure, pass "Serena scope file not written — use Read/Grep for all operations." in prompt context.

After ExitWorktree completes, delete `.serena/project.yml` from the worktree.

### Serena Mode Detection

Pass `SERENA_MODE` as explicit prompt context line (Claude Code agents do not read OS environment variables):
- Single-worktree: `SERENA_MODE=full`
- Multi-spec parallel wave: `SERENA_MODE=read-only`

Default when absent: `read-only`.

### Single spec: `/df-orchestrate my-feature`
1. Enter worktree (EnterWorktree), write `.serena/project.yml` to worktree root (absolute path).
2. Spawn **implementation-agent** (`.claude/agents/implementation-agent.md`) with: spec name, spec path, mode, branch name, skip-tests flag, pipeline mode, afk flag, and "Serena mode: full" in prompt context.
3. Exit worktree (ExitWorktree). Delete `.serena/project.yml` from the worktree.
4. If `--afk` flag is set and spec promoted: proceed to AFK PR Creation.

### Multiple specs: `/df-orchestrate spec-a spec-b spec-c`

Build dependency graph, resolve into waves, present plan, get confirmation. Execute by Waves (see Autonomous Wave Execution).

---

## Autonomous Wave Execution

For multi-spec invocations, the orchestrator uses a **wave agent architecture**.

### Wave Agent Spawning

For each wave, spawn an **independent** agent that receives: spec names, spec paths, branch, pipeline mode, afk flag, and "Serena mode: read-only" (for multi-spec waves).

Each wave agent:
1. Writes `.serena/project.yml` to each worktree root with the worktree's absolute path (before spawning implementation-agents)
2. Spawns **implementation-agents** (`.claude/agents/implementation-agent.md`) for each spec in its wave, each in its own worktree with `isolation: "worktree"`, passing "Serena mode: read-only" in the prompt context. Each implementation-agent handles the full per-spec lifecycle: Architect review (spawning `.claude/agents/architect-agent.md`), Code agents, Holdout validation, Promotion (spawning `.claude/agents/promote-agent.md`), Cleanup (archive to git history).
3. After ExitWorktree for each spec, deletes `.serena/project.yml` from the worktree
4. Collects the structured JSON result from each implementation-agent and returns a per-wave JSON array to the orchestrator

**Wave agent freshness**: Each wave spawns a NEW wave agent with no carryover context from prior waves. The orchestrator passes only: spec names, spec paths, branch, pipeline mode, afk flag — no spec file contents, no scenario text.

**Structured JSON result schema** (returned by each implementation-agent, collected by wave agent):

```json
{
  "specName": "my-feature",
  "status": "passed | failed | blocked | token-cap",
  "error": "reason (required when status is failed or blocked)",
  "promotedTestPath": "path/to/test (required when status is passed)",
  "tierEscalation": { "from": 2, "to": 3, "reason": "..." }
}
```

Field rules: `specName` always present. `error` required when `status` is `failed` or `blocked`. `promotedTestPath` required when `status` is `passed`. `tierEscalation` optional. `token-cap` is a distinguishable sentinel — not `failed` — surface message: "Spec {name} hit token cap — re-run with `--mode lean` or split the spec."

**Malformed or missing results**: If a wave agent returns unparseable JSON, treat all specs in that wave as `status: "failed"` with `error: "result-parse-error"`. If partial results, process valid ones normally and mark missing specs as `error: "wave-agent-crash"`. Empty array `[]` = all specs failed with `error: "wave-agent-crash"`.

The orchestrator reads ONLY JSON results from wave agents — no spec prose, no scenario text. Collect all wave results before computing which specs are blocked for the next wave (no early exit within a wave).

### Smart Re-run Detection (in implementation-agent)

The implementation-agent checks if `dark-factory/results/{name}/` has previous results. In autonomous mode, it will default to "new": wipe previous results and run a full cycle. It does NOT prompt the developer.

### Single-Spec Mode Exception

When only one spec is being executed (single name, or --group/--all resolves to one active spec), the wave agent architecture is NOT used. The orchestrator spawns the implementation-agent directly in a worktree (see Single spec above). This avoids unnecessary overhead.

### Progress Reporting

Report wave completions without blocking for developer acknowledgment. After all specs in wave N complete, automatically proceeds to wave N+1. No developer acknowledgment is needed between waves.

After developer confirms the execution plan, execute ALL waves without further developer interaction. The only conditions that stop execution: merge conflict (hard stop), or all remaining specs blocked by prior failures.

---

## Failure Handling Within Groups

Mark failed spec (stays `active`), pause transitive dependents, continue independent specs. Report failures in final summary with actionable next steps after all executable specs finish.

### Failure Semantics

- Spec fails / Architect blocks → block transitive dependents, continue independent specs
- **Merge conflict**: Hard stop the entire pipeline
- **Promoted test failure**: Hard stop for that spec, continue others
- **All remaining specs blocked**: Stop pipeline early
- **Wave agent crash**: All specs treated as failed (partial crash: valid results processed, rest failed)

ALL failures reported in final summary with actionable next steps.

### Final Summary Report

```
=== Dark Factory Orchestration Complete ===

Completed specs:
  - spec-a: passed/promoted (tests: path/to/promoted/tests)

Failed specs:
  - spec-b: failed (reason) → Next step: fix and re-run

Blocked specs (dependency on failed spec):
  - spec-d: blocked by spec-b

Summary: 1 passed, 1 failed, 1 blocked
```

## AFK PR Creation

When `--afk` is set, create a draft PR (`gh pr create --draft`) for each promoted spec after cleanup. Write PR body to a temp file. Search project-profile for reviewer. On failure: log and continue. Failed specs → "PR skipped: spec failed".

---

## Lifecycle Integrity and Information Barriers

Bugfix mode: test FAILS in red phase, test PASSES in green phase, checks for regression. If the Architect Review returns BLOCKED after all passes, do NOT proceed to implementation.

## Information Barrier Rules

- NEVER pass holdout scenario content to the code-agent
- NEVER pass public scenario content to the test-agent
- NEVER pass test/scenario content to the architect-agent
- Each agent spawn is completely independent (fresh context)
- Only pass: spec name, spec path, mode, pipeline mode, afk flag, and branch name to implementation-agents
- The implementation-agent forwards to code-agents: Extract ONLY the "Key Decisions Made" and "Remaining Notes" sections. Strip round-by-round discussion.
- Passes the feature name and spec file path or debug report path to the test-agent
- Passes the feature name and results path to promote-agent

## State Machine

All 17 states: INTAKE, INTERVIEW, SPEC_DRAFT, ARCH_INVESTIGATE, ARCH_SPEC_REVIEW, SPEC_REVISION, QA_SCENARIO, QA_SELF_REVIEW, ARCH_SCENARIO_REVIEW, APPROVED, IMPLEMENTING, ARCH_DRIFT_CHECK, TESTING, PROMOTING, DONE, BLOCKED, STALE.

Terminal states: BLOCKED (max retries exceeded — escalate to developer with full context), STALE (no activity 48h).

## Gate Definitions

| Gate | State | Condition | Max Rounds |
|------|-------|-----------|------------|
| Gate 1 | ARCH_SPEC_REVIEW | Architect marks spec APPROVED | max 5 rounds |
| Gate 2 | ARCH_SCENARIO_REVIEW | Architect marks ADR coverage APPROVED | max 3 rounds |
| Gate 3 | ARCH_DRIFT_CHECK | Architect marks implementation CLEAN | max 2 rounds |
| Gate 4 | TESTING | Test-agent reports all holdout PASS | max 3 rounds |

When any gate exceeds its max rounds: set state = BLOCKED. Surface escalation to developer with: gate name, last round output, specific blocker, required action. Never silently loop.
