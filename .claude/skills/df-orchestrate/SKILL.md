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

1. **Parse flags first**: Extract `--group`, `--all`, `--force`, `--skip-tests`, `--mode`, `--afk` from the arguments. Everything else is an explicit spec name.
   - `--mode` validation: must be `lean`, `balanced`, or `quality`. Invalid → Error: "Unknown mode '{value}'. Valid modes: lean, balanced, quality." Abort before execution plan.
   - `--best-of-n` is not a standalone flag → Error: "Unknown flag '--best-of-n'. Best-of-N is automatically enabled in --mode quality for Tier 3 specs. Use --mode quality instead."
   - `--mode` and `--skip-tests` are orthogonal — NOT mutually exclusive. Do NOT add a mutual-exclusivity check for this combination.
2. **Mutual exclusivity checks** (fail fast):
   - `--group` + `--all` → Error: "Cannot use --group and --all together."
   - `--group`/`--all` + explicit names → Error: "Cannot combine --group/--all with explicit spec names."
   - `--group` with no argument → Error: "--group requires a group name."
3. **`--force` warnings**: With `--group`/`--all`, warn: "--force has no effect with --group/--all (it only applies to explicit mode cross-group guard)." Not an error.
4. **Determine mode**: `--group` → Group Mode; `--all` → All Mode; names → Explicit Mode

---

## Execution Plan Mode Block

Include this block in the execution plan BEFORE the developer confirmation prompt (after the plan header, before the wave breakdown):

```
Mode: {mode} (default)    ← append "(default)" only when --mode was omitted
  → lean:     Fast and cheap — rapid iteration and low-risk changes. All specs: claude-sonnet | No Best-of-N
  → balanced: Standard workflow — Tier 1/2 specs: claude-sonnet | Tier 3 specs: claude-opus | No Best-of-N
  → quality:  Maximum confidence — claude-opus for all specs. Tier 3 specs: Best-of-N (two independent tracks)
```

For multi-spec quality runs, note per-spec: "Tier 1 spec — Best-of-N skipped" or "Tier 3 spec — Best-of-N enabled."

---

## Group Mode (`--group {name}`)

1. **Query manifest**: Read `dark-factory/manifest.json`. Find all entries where the `group` field exactly equals the given name (exact string match, not substring) AND `status == "active"`.
2. **Group not found**: If no active specs match the group name, check if ANY specs (any status) have that group name. If none at all, list all available groups: "No group named '{name}' found. Available groups: [list unique non-null group values from manifest]". If all specs in the group are completed (removed from manifest), show: "All specs in group '{name}' are already completed. Nothing to do."
3. **Resolve dependencies into waves**: Using the active specs found, build the dependency graph and resolve into execution waves (see Wave Resolution below).
4. **Show completed specs**: For any dependency that references a spec NOT in the manifest (removed = completed), show it as "already completed (skipped)" in the execution plan.
5. **Display execution plan** (including the Mode Block above) and wait for developer confirmation before executing.
6. **Execute waves** in order (see Execute by Waves below).

---

## All Mode (`--all`)

1. **Query manifest**: Read `dark-factory/manifest.json`. Find every entry with `status == "active"`.
2. **No active specs**: If none found, show: "No active specs found. Nothing to do." and stop.
3. **Group by `group` field**: Partition active specs by their `group` value. Entries with `group: null` (or missing group field) are **standalone** — each is an independent unit.
4. **Resolve waves per group**: For each group, build the dependency graph and resolve into execution waves independently.
5. **Display execution plan**: Show all groups with their wave breakdowns, plus standalone specs.
6. Wait for developer confirmation.
7. **Execute**: Run independent groups' waves in parallel. Standalone specs run in parallel with everything. Within each group, waves are sequential.

---

## Cross-Group Guard (Explicit Mode Only)

When explicit spec names are provided (no `--group` or `--all`):

1. **Single spec**: Never triggers the guard. Proceed normally.
2. **Multiple specs**: Look up each spec's `group` field in the manifest. Collect unique non-null groups.
   - If all specs in the **same group** (or all standalone) → no guard, proceed normally.
   - If specs span **different groups** → warn: "Specs belong to different groups: {spec-a} ({group-a}), {spec-b} ({group-b}). Use --force to proceed anyway." Then **stop** (do not execute).
   - If `--force` is present → skip the warning, proceed with execution.

---

## Resume Semantics

Both `--group` and `--all` modes automatically handle resume after partial failures:

1. **Filter out non-active specs**: Only specs with `status: "active"` are candidates.
2. **Satisfied dependencies**: A dependency on a spec NOT in the manifest is treated as **satisfied** (completed and cleaned up).
3. **Active dependencies**: Must wait for that spec to complete in current run.
4. **Display**: Show completed/removed dependencies as "already completed (skipped)".

---

## Wave Resolution Algorithm

Build a directed acyclic graph from the `dependencies` fields:

1. For each spec, check its `dependencies` array (treat missing field as `[]`).
2. For each dependency:
   - NOT in manifest → **satisfied** (removed = completed)
   - In manifest with `status: "active"` → must be in earlier wave
   - In manifest with non-active status → **satisfied**
3. **Topological sort into waves**:
   - Wave 1: specs with no unsatisfied dependencies
   - Wave N: specs whose dependencies are all in waves < N or satisfied
4. Must be **deterministic** — same manifest state = same plan.

---

## Backward Compatibility for Missing Fields

- Missing `group` field → treat as `null` (standalone)
- Missing `dependencies` field → treat as `[]` (no dependencies)

## Pre-Phase: Code Map Refresh

Before pre-flight checks, ensure the code map is current:

1. Attempt to read `dark-factory/code-map.md` header. If the file does not exist, go to step 4.
2. Extract the `Git hash:` line value (trim whitespace). Validate it matches `/^[0-9a-f]{40}$/`. Run `git rev-parse HEAD`. If `git rev-parse HEAD` fails, log "Code map refresh skipped: git error" and proceed.
3. **Hash matches exactly**: proceed to Pre-flight Checks. No codemap-agent invocation. Total overhead: 2 operations.
4. **Hash differs, invalid hash, or no map**: compute changed files via `git diff --name-only {stored_hash} HEAD` (or empty list if no stored hash). Invoke codemap-agent with `mode: "refresh"` (or `"full"` if no map exists), `stored_hash`, and `changed_files`.
5. **Greenfield repo** (no source files detected): proceed without a map.
6. After codemap-agent completes: log a non-blocking suggestion: "Code map auto-generated. For a complete, reviewed map run `/df-onboard`."
7. Proceed to Pre-flight Checks.

## Pre-flight Checks

Run for EVERY spec name (fail fast — check all before starting any):
1. Check if `dark-factory/project-profile.md` exists — if missing, warn but do NOT block.
2. Verify spec exists: `dark-factory/specs/features/{name}.spec.md` OR `dark-factory/specs/bugfixes/{name}.spec.md`
3. Verify public scenarios exist: `dark-factory/scenarios/public/{name}/` has files
4. Verify holdout scenarios exist: `dark-factory/scenarios/holdout/{name}/` has files
5. If ANY spec or scenarios missing → abort with clear message
6. **Circular dependency detection**: DFS-based topological sort — if back edge found, report: "Circular dependency detected: spec-a -> spec-b -> spec-c -> spec-a. Fix the dependency declarations in the manifest." Abort before execution. Self-dependency is a cycle of length 1.
7. **Cross-group dependency validation**: Dependencies must be within the same group. Report violations and abort.

## Pre-flight Test Gate

Before any implementation begins (before Architect Review in the implementation-agent), run the project's test suite ONCE for all specs. This gate catches failures early — preventing wasted architect and code-agent time.

1. Read `dark-factory/project-profile.md`, extract test command from `Run:` field.
2. If profile or `Run:` field missing: warn "No test command found in project profile. Skipping pre-flight test gate." Proceed.
3. If `--skip-tests`: log "Pre-flight test gate skipped." Record `"testGateSkipped": true` and `"testGateSkippedAt"` in manifest. Proceed.
4. Run test suite. If failures: report ALL failures, abort ALL specs. The test gate runs ONCE before any specs are processed (EC-10).

## Detect Mode

- Spec in `dark-factory/specs/features/` → **Feature mode**
- Spec in `dark-factory/specs/bugfixes/` → **Bugfix mode**

## Worktree Isolation

Each spec runs in its own git worktree. Worktree is created BEFORE implementation and merged back AFTER.

### Serena Worktree Setup

Before spawning any agent, write `.serena/project.yml` to the worktree root with `project_root: /absolute/path/to/worktree` (absolute path — required). Create `.serena/` directory if missing. On write failure, pass "Serena scope file not written — use Read/Grep for all operations." in prompt context. Ensure `.serena/` is in `.gitignore`.

After ExitWorktree completes, delete `.serena/project.yml` from the worktree (must not merge back to main branch).

### Serena Mode Detection

Set `SERENA_MODE` based on run type (pass as explicit prompt context line — Claude Code agents do not read OS environment variables):
- Single-worktree (one spec): `SERENA_MODE=full` — all Serena tools including mutation.
- Multi-spec parallel wave: `SERENA_MODE=read-only` — discovery tools only; prevents race conditions from concurrent mutations.

Default when absent: `read-only`.

### Single spec: `/df-orchestrate my-feature`
1. Enter worktree (EnterWorktree tool)
2. Write `.serena/project.yml` to the worktree root (absolute path, see Serena Worktree Setup above)
3. Spawn **implementation-agent** (`.claude/agents/implementation-agent.md`) with: spec name, spec path, mode (feature/bugfix), branch name, skip-tests flag, pipeline mode (`--mode` value, default `balanced`), afk flag, and "Serena mode: full" in prompt context
4. Implementation-agent handles: architect review, code agents, holdout validation, promotion, cleanup
5. Exit worktree (ExitWorktree) — merges back to original branch
6. Delete `.serena/project.yml` from the worktree after ExitWorktree completes
7. If `--afk` flag is set and spec was successfully promoted: proceed to AFK PR Creation (see below)

### Multiple specs: `/df-orchestrate spec-a spec-b spec-c`

**Step 1: Dependency Analysis (MANDATORY)** — same as before: check manifest, read specs, build dependency graph, resolve into waves, present plan, get confirmation.

**Step 2: Execute by Waves** — see Autonomous Wave Execution below.

---

## Autonomous Wave Execution

For multi-spec invocations, the orchestrator uses a **high-level orchestrator / wave agent architecture**.

### High-Level Orchestrator Responsibilities
The high-level orchestrator ONLY:
1. Reads manifest and resolves dependencies into waves
2. Presents execution plan for ONE developer confirmation
3. Spawns each wave as an independent wave agent sequentially
4. Collects results from each wave agent
5. Computes transitive blocked specs after each wave
6. Reports non-blocking progress between waves
7. Produces comprehensive final summary report

### Wave Agent Spawning

For each wave, spawn an **independent** agent (`run_in_background: true`) that receives:
- The list of spec names for that wave
- The current branch name
- The mode (feature or bugfix) for each spec
- The pipeline mode (`--mode` value, default `balanced`) — forwarded to implementation-agent
- The afk flag — forwarded to implementation-agent
- Serena mode: `read-only` for all specs in a multi-spec wave (multiple simultaneous worktrees)

Each wave agent:
1. Writes `.serena/project.yml` to each worktree root with the worktree's absolute path (before spawning implementation-agents)
2. Spawns **implementation-agents** (`.claude/agents/implementation-agent.md`) for each spec in its wave, each in its own worktree with `isolation: "worktree"`, passing "Serena mode: read-only" in the prompt context
3. After ExitWorktree for each spec, deletes `.serena/project.yml` from the worktree

Each implementation-agent handles the full per-spec lifecycle:
- Architect review (spawning `.claude/agents/architect-agent.md` — 3 domain agents in parallel)
- Code agents (spawning code-agents with spec + public scenarios + architect findings)
- Holdout validation (spawning test-agents)
- Promotion (spawning `.claude/agents/promote-agent.md`)
- Cleanup (deleting artifacts after promotion, archive to git history)

The implementation-agent enforces the red-green cycle for bugfix mode: test FAILS in red phase, test PASSES in green phase, checks for regression against existing tests. If architect returns BLOCKED after all passes, do NOT proceed to implementation — report to developer.

Each wave agent returns structured results with per-spec status: passed/failed/blocked, error details, promoted test paths.

### Smart Re-run Detection (in implementation-agent)

The implementation-agent checks if `dark-factory/results/{name}/` has previous results. In autonomous mode, it will default to "new": wipe previous results and run a full cycle. It does NOT prompt the developer.

### Single-Spec Mode Exception

When only one spec is being executed (single name, or --group/--all resolves to one active spec), the wave agent architecture is NOT used. The orchestrator spawns the implementation-agent directly in a worktree (see Single spec above). This avoids unnecessary overhead.

### Progress Reporting

Report wave completions as non-blocking progress messages:
```
Wave 1 complete (project-init: passed/promoted). Starting Wave 2...
Wave 2 complete (user-auth: passed/promoted, payment-api: failed). Starting Wave 3...
```
Report without blocking for developer acknowledgment. After all specs in wave N complete, automatically proceeds to wave N+1. No developer acknowledgment is needed between waves.

After developer confirms the execution plan, execute ALL waves without further developer interaction. The only conditions that stop execution: merge conflict (hard stop), or all remaining specs blocked by prior failures.

---

## Failure Handling Within Groups

When a spec fails (architect blocks it or implementation fails after 3 rounds):

1. **Mark the failed spec**: Note it as failed (remains `status: "active"` in manifest).
2. **Pause transitive dependents**: Find ALL specs depending on failed spec, directly or transitively. Do NOT attempt to execute them.
3. **Continue independent specs**: Specs not depending on failed spec continue normally.
4. **Report after all executable specs finish**: Include all failures in final summary with actionable next steps. Do NOT pause mid-pipeline.

### Failure Semantics

- **Spec fails after 3 implementation rounds**: Mark failed, block transitive dependents, continue independent specs
- **Architect blocks a spec**: Same (mark failed, block dependents, continue others)
- **Merge conflict**: Hard stop the entire pipeline, report with file details
- **Promoted test failure**: Hard stop for that spec (do not cleanup), continue others
- **All remaining specs blocked**: Stop pipeline early
- **Wave agent crash (no result)**: Treat all specs in wave as failed, block dependents
- **Wave agent crash with partial results**: Process completed specs normally, treat missing specs as failed

ALL failures reported in final summary with actionable next steps.

### Final Summary Report

```
=== Dark Factory Orchestration Complete ===

Completed specs:
  - spec-a: passed/promoted (tests: path/to/promoted/tests)

Failed specs:
  - spec-b: failed (architect BLOCKED — reason)
    → Next step: Fix spec-b and re-run with `/df-orchestrate spec-b`

Blocked specs (dependency on failed spec):
  - spec-d: blocked by spec-b (dependency chain: spec-d → spec-b)
    → Next step: Re-run with `/df-orchestrate --group X` after fixing spec-b

Summary: 1 passed, 1 failed, 1 blocked
```

## AFK PR Creation

When `--afk` is set, create a draft PR for each promoted spec after cleanup completes.

1. Check `gh` CLI: `gh --version`. Not found → warn "gh CLI not found — skipping auto-PR. Install from https://cli.github.com" (non-blocking).
2. PR body: use `--body-file` with a temp file (NOT shell interpolation — prevents injection from backticks/`$`/quotes in spec content). Clean up temp file after attempt regardless of success or failure.
3. Run: `gh pr create --draft --title "{spec-name}" --body-file {temp-file}`
4. Reviewer: search project-profile `## Org Context` for `PR reviewer handles`. If found → `gh pr edit --add-reviewer {value}`. If missing, skip silently.
5. Failure: log "Auto-PR failed for {spec-name}: {error}. Create manually: gh pr create --draft" and continue. Never abort.
6. Multi-spec: PRs for promoted specs only. Failed specs → "PR skipped: spec failed" in summary.

---

## Information Barrier Rules

These apply at the coordination level — the orchestrator enforces what context is passed to implementation-agents and wave agents:

- NEVER pass holdout scenario content to the code-agent
- NEVER pass public scenario content to the test-agent
- NEVER pass test/scenario content to the architect-agent
- The architect-agent communicates ONLY about spec content with spec/debug agents — never about tests
- Each agent spawn is completely independent (fresh context)
- Only pass: spec name, spec path, mode (feature/bugfix), pipeline mode (`--mode` value), afk flag, and branch name to implementation-agents
- The implementation-agent forwards architect findings to code-agents: Extract ONLY the "Key Decisions Made" and "Remaining Notes" sections from the review. Strip round-by-round discussion content.
- The implementation-agent passes the feature name (test-agent reads holdout scenarios itself) and the spec file path or debug report path to the test-agent
- The implementation-agent passes the feature name and holdout test file path from `dark-factory/results/{name}/` to the promote-agent
