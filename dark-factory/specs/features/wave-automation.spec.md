# Feature: wave-automation

## Context
The current `df-orchestrate` skill runs the entire multi-wave pipeline within a single agent context. This causes two problems:

1. **Context window exhaustion**: A single agent managing architect review, code agents, test agents, promotion, and cleanup across multiple waves accumulates so much context that it degrades or fails on large pipelines.
2. **Unnecessary pause points**: The orchestrator pauses 7 times during execution, requiring developer interaction at points where no human judgment is needed. This defeats the automation purpose of the pipeline.

The solution is to restructure df-orchestrate into a lightweight high-level orchestrator that spawns independent wave agents, and to remove 4 of the 7 pause points so that only one developer confirmation is needed before the pipeline runs autonomously to completion.

Additionally, `dark-factory.md` rules claim spec creation and implementation are "FULLY DECOUPLED -- never auto-triggered," but df-intake already auto-invokes `/df-orchestrate` when the developer says "proceed" (Step 7, line 252). The rules should be updated to match the actual (correct) behavior.

## Scope
### In Scope (this spec)
- FR-1 through FR-8 below: restructure SKILL.md wave execution, remove 4 pause points, add autonomous wave agent spawning, add progress reporting, fix rules contradiction, define smart re-run default, define failure semantics
- Update test assertions for the new behavior

### Out of Scope (explicitly deferred)
- `--confirm-waves` opt-in flag for interactive mode (can be added later if developers want per-wave control)
- `--rerun` CLI flag (defaulting to "new" is sufficient for v1; targeted resume uses existing `--group` mechanism)
- Real-time progress dashboard (non-blocking progress messages are sufficient)
- Self-checkpointing mechanism (wave agents already get fresh context from latest main)

### Scaling Path
If the pipeline grows beyond 5-6 waves, the high-level orchestrator could write checkpoint state to `dark-factory/results/{group}/orchestrator-state.json` so it can be resumed after a crash. Not needed now because wave agents are independent and the orchestrator itself is lightweight.

## Requirements
### Functional

- **FR-1: High-level orchestrator architecture** -- The orchestrator MUST be restructured as a lightweight coordinator that spawns independent wave agents rather than executing everything inline. The orchestrator reads the manifest, resolves dependencies into waves, presents the execution plan, gets ONE developer confirmation, then spawns wave agents sequentially. It does NOT perform architect review, implementation, or holdout validation itself.

- **FR-2: Wave agent independence** -- Each wave agent MUST be spawned as an independent agent (Agent tool with `run_in_background: true`) that receives: the list of spec names for that wave, the current branch name (which includes merged changes from prior waves), and the mode (feature/bugfix). The wave agent handles the full lifecycle for each spec in its wave: architect review, code agents, holdout validation, promotion, and cleanup. The wave agent returns a structured result (per-spec status: passed/failed/blocked, error details, promoted test paths).

- **FR-3: Remove parallelism confirmation pause** -- Step 0.5 currently asks the developer to confirm parallelism decisions. REMOVE this pause. The spec already defines parallel tracks in its "Implementation Size Estimate" section. If the spec defines tracks, use them. If not, the wave agent auto-determines parallelism. No confirmation needed.

- **FR-4: Remove smart re-run detection pause** -- The current "Smart Re-run Detection" section asks the developer to choose between new/test-only/fix when previous results exist. In autonomous mode, DEFAULT to "new" (wipe results, full run). Remove the interactive prompt. Rationale: "new" is the safe default since holdout validation catches regressions, and targeted resume is handled by `--group` after failure.

- **FR-5: Remove inter-wave pause** -- The current "Execute by Waves" section has an implicit pause between waves (the developer must acknowledge wave completion before proceeding). Add EXPLICIT language that the orchestrator auto-continues to the next wave after the current wave completes. The only things that stop inter-wave progression are: all specs in remaining waves are blocked by failures, or a merge conflict occurs.

- **FR-6: Non-blocking progress reporting** -- The orchestrator MUST report wave completions as they happen, without blocking for developer acknowledgment. Format: "Wave N complete (spec-a: passed/promoted, spec-b: failed). Starting Wave N+1..." A comprehensive final summary MUST be produced when all waves are done, listing: completed specs with promoted test paths, failed specs with error details and actionable next steps, blocked specs with the dependency chain that caused blocking.

- **FR-7: Fix rules contradiction** -- In `dark-factory.md`, the Rules section line "Spec creation and implementation are FULLY DECOUPLED -- never auto-triggered" MUST be updated to reflect that df-intake auto-invokes `/df-orchestrate` when the developer confirms (which is the correct behavior). The new wording should state that implementation requires developer confirmation but can be auto-triggered from intake after that confirmation.

- **FR-8: Failure semantics** -- Define explicit failure handling for each failure type:
  - Spec fails after 3 implementation rounds: mark failed, block transitive dependents, continue independent specs in the same and subsequent waves
  - Architect blocks a spec: same as above (mark failed, block dependents, continue others)
  - Merge conflict: hard stop the entire pipeline, report the conflict with file details
  - Promoted test failure: hard stop for that spec (do not cleanup), continue other specs
  - ALL failures MUST be reported in the final summary with actionable next steps (e.g., "Re-run with `/df-orchestrate --group X` after fixing spec-b")

### Non-Functional
- **NFR-1: Context efficiency** -- Each wave agent MUST start with a fresh context. The high-level orchestrator MUST remain lightweight (no spec content, no code, no test output -- only manifest data, wave assignments, and result summaries).
- **NFR-2: Git isolation** -- Wave agents create worktrees from the latest main branch (which includes merged changes from prior waves). This is the existing worktree mechanism -- no change to git isolation semantics.
- **NFR-3: Backward compatibility** -- Single-spec invocation (`/df-orchestrate my-feature`) MUST continue to work identically. The wave agent architecture only activates for multi-spec invocations (group/all/explicit multi-spec).

## Data Model
No schema changes. No new files or data stores. The manifest format is unchanged.

## Migration & Deployment
N/A -- no existing data affected. This feature modifies skill/rule markdown files and test assertions only. There is no stored data, cache, or configuration that uses the old format. All changes take effect immediately upon file update.

## API Endpoints
N/A -- this feature modifies Dark Factory skill files, not application APIs.

## Business Rules

- **BR-1: Single confirmation gate** -- The developer confirms ONCE at the execution plan stage. Everything after that is autonomous. Rationale: the execution plan shows exactly what will happen; requiring per-wave confirmation adds latency without new information.

- **BR-2: Failure isolation** -- A failed spec blocks ONLY its transitive dependents, not the entire pipeline. Independent specs in the same or later waves continue executing. Rationale: if spec-a and spec-b are independent, spec-b failing should not prevent spec-a from completing.

- **BR-3: Merge conflict is a hard stop** -- Unlike other failures, merge conflicts stop the ENTIRE pipeline immediately. Rationale: merge conflicts indicate unexpected file overlap that requires human judgment -- auto-continuing could produce corrupt code.

- **BR-4: Smart re-run defaults to "new"** -- When previous results exist, autonomous mode wipes them and runs fresh. Rationale: stale results from a prior run could mask new issues. The holdout validation step catches any regressions regardless.

- **BR-5: Wave agents handle full lifecycle** -- Each wave agent runs: architect review, code agents, holdout validation, promotion, cleanup. The high-level orchestrator does NOT participate in any of these steps. Rationale: this is what ensures fresh context per wave.

- **BR-6: Single-spec mode is unchanged** -- When only one spec is provided, the current behavior is preserved (no wave agent spawning, direct execution). The wave architecture is only for multi-spec runs.

- **BR-7: df-intake auto-invocation is sanctioned** -- df-intake invoking `/df-orchestrate` after developer confirmation is correct and documented behavior. The rules file must not contradict this.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| Wave agent returns failure for a spec | Log failure, mark spec as failed, compute transitive dependents, block them, continue independent specs | Failed/blocked specs noted in final summary |
| Wave agent crashes (no result returned) | Treat all specs in that wave as failed, block their dependents | Error details in final summary |
| Merge conflict during worktree exit | Hard stop entire pipeline, report conflicting files | All remaining waves skipped |
| All specs in remaining waves are blocked | Stop pipeline early (no work left to do) | Summary shows blocked dependency chains |
| Manifest read fails | Abort before any execution | Error message with manifest path |
| Spec/scenario files missing (pre-flight) | Abort before any execution (existing behavior) | List missing files |

## Acceptance Criteria
- [ ] AC-1: Running `/df-orchestrate --group X` with a 3-wave group completes all waves with only ONE developer confirmation (the execution plan)
- [ ] AC-2: Each wave runs in a separate agent context (spawned via Agent tool)
- [ ] AC-3: A spec failure in Wave 1 blocks its dependents in Wave 2 but does not block independent specs in Wave 2
- [ ] AC-4: Progress messages appear after each wave completes (non-blocking)
- [ ] AC-5: A comprehensive final summary is produced listing all spec statuses and next steps
- [ ] AC-6: Single-spec invocation (`/df-orchestrate my-feature`) works identically to current behavior
- [ ] AC-7: Smart re-run detection no longer prompts -- defaults to "new"
- [ ] AC-8: Step 0.5 parallelism confirmation is removed (auto-proceeds based on spec)
- [ ] AC-9: `dark-factory.md` rules no longer say "never auto-triggered" -- updated to reflect intake auto-invocation
- [ ] AC-10: Merge conflicts cause a hard stop with clear error reporting
- [ ] AC-11: Plugin mirrors (`plugins/dark-factory/`) match source files exactly (test 12 in test suite)
- [ ] AC-12: All existing tests pass after changes (no regressions)

## Edge Cases

- **EC-1: Single-spec invocation** -- Must skip wave agent spawning entirely and run directly (current behavior preserved). Detected by: only one spec name provided and no --group/--all flags.
- **EC-2: All specs in a wave fail** -- The orchestrator should compute transitive blocked specs and check if any remaining waves have executable (non-blocked) specs. If none, stop early with summary.
- **EC-3: Wave with mix of independent and dependent specs** -- Within a single wave, all specs are independent by definition (dependencies were resolved into earlier waves). But a failure in a prior wave may block SOME specs in the current wave while others remain executable.
- **EC-4: Group with only one active spec** -- Should behave like single-spec mode (no wave agent overhead). The one spec runs directly.
- **EC-5: Wave agent returns partial results** -- If a wave agent completes some specs but crashes before finishing others, treat unfinished specs as failed. The orchestrator should handle partial result parsing gracefully.
- **EC-6: Empty wave after filtering blocked specs** -- If all specs in a wave are blocked by prior failures, skip that wave entirely and proceed to the next (or finish if no more waves).
- **EC-7: Existing "Ask developer" language in failure handling** -- The current "Failure Handling Within Groups" section says "Ask the developer to decide next steps. Do NOT auto-retry." This must be changed to: report failures in the final summary with actionable next steps, but do NOT pause mid-pipeline.

## Dependencies
**Files modified by this spec:**
1. `.claude/skills/df-orchestrate/SKILL.md` -- Major restructure (primary target)
2. `.claude/rules/dark-factory.md` -- Fix "FULLY DECOUPLED" contradiction (1 line change)
3. `plugins/dark-factory/skills/df-orchestrate/SKILL.md` -- Mirror of (1)
4. `plugins/dark-factory/.claude/rules/dark-factory.md` -- Mirror of (2)
5. `tests/dark-factory-setup.test.js` -- Update/add assertions for autonomous behavior
6. `CLAUDE.md` -- Update pipeline description if wording implies interactive waves

**Cross-feature impact:**
- df-intake Step 7 auto-invokes `/df-orchestrate`. The orchestrate changes are backward-compatible (intake passes spec names, orchestrate resolves waves). No changes to df-intake required.
- df-cleanup handles stuck states by checking manifest status. No change to manifest status values, so df-cleanup is unaffected.
- All existing agent files (architect-agent, code-agent, test-agent, promote-agent) are invoked by the wave agent, not the high-level orchestrator. Their interfaces are unchanged.

## Implementation Size Estimate
- **Scope size**: medium (5 files changed + 1 optional)
- **Estimated file count**: 6
- **Suggested parallel tracks**: 2 code-agents

  **Track 1 -- Skill and rule files** (3-4 files, no test changes):
  - `.claude/skills/df-orchestrate/SKILL.md`
  - `.claude/rules/dark-factory.md`
  - `plugins/dark-factory/skills/df-orchestrate/SKILL.md` (mirror copy)
  - `plugins/dark-factory/.claude/rules/dark-factory.md` (mirror copy)
  - `CLAUDE.md` (if pipeline description needs updating)

  **Track 2 -- Test assertions** (1 file):
  - `tests/dark-factory-setup.test.js`

  Zero file overlap between tracks. Track 2 depends on Track 1 (tests assert against SKILL.md content), so they should run **sequentially** (Track 1 first, then Track 2).

## Implementation Notes

### Patterns to follow
- The existing SKILL.md uses markdown sections with `##` headings and `---` dividers. Maintain this structure.
- Agent spawning uses the pattern: "Spawn an **independent** agent (Agent tool) with..." followed by bullet points of what the agent receives. Follow this pattern for wave agent spawning.
- The existing test suite (Section 12) asserts that plugin mirrors match source exactly. After modifying source files, the mirrors MUST be updated to match byte-for-byte.
- Test assertions use `content.includes(...)` string matching against file content. New assertions should follow this pattern.

### Key structural changes to SKILL.md
1. Add a new top-level section "## Autonomous Wave Execution" after the "Execute by Waves" section that describes the high-level orchestrator / wave agent architecture.
2. Modify "Step 0.5: Determine Parallelism" to remove the confirmation pause (keep the logic, remove the "Tell the developer... Proceed after confirmation" sentence).
3. Modify "Smart Re-run Detection" to state the default behavior (wipe and run fresh) without prompting.
4. Modify "Failure Handling Within Groups" to remove "Ask the developer to decide next steps" and replace with autonomous reporting in the final summary.
5. Add explicit auto-continue language in the wave execution flow: "After all specs in wave N complete, the orchestrator automatically proceeds to wave N+1."
6. Add a "Final Summary Report" section describing the comprehensive output format.

### dark-factory.md change
Replace:
```
- Spec creation and implementation are FULLY DECOUPLED — never auto-triggered
```
With wording that acknowledges df-intake can auto-invoke orchestrate after developer confirmation.

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01, P-02, H-01 |
| FR-2 | P-02, H-01, H-06 |
| FR-3 | P-03, H-07 |
| FR-4 | P-04, H-08 |
| FR-5 | P-02, P-05, H-02 |
| FR-6 | P-05, P-06, H-09 |
| FR-7 | P-07, H-10 |
| FR-8 | P-06, P-08, P-09, H-03, H-04, H-05 |
| BR-1 | P-01, P-02 |
| BR-2 | P-08, H-03 |
| BR-3 | P-09, H-04 |
| BR-4 | P-04, H-08 |
| BR-5 | P-02, H-01 |
| BR-6 | P-10, H-12 |
| BR-7 | P-07, H-10 |
| EC-1 | P-10, H-12 |
| EC-2 | H-03 |
| EC-3 | P-08, H-03 |
| EC-4 | H-12 |
| EC-5 | H-06 |
| EC-6 | H-05 |
| EC-7 | P-06, H-09 |
| Error: Wave agent crash | H-06 |
| Error: Merge conflict | P-09, H-04 |
| Error: All remaining waves blocked | H-05 |
| Error: Manifest read fails | H-11 |
| Error: Missing spec/scenario files | (existing pre-flight behavior, no new scenario needed) |
