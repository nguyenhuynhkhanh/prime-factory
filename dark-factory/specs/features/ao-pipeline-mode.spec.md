# Feature: ao-pipeline-mode

## Context

Dark Factory currently runs every spec with the same agent selection and review intensity regardless of risk level. A developer prototyping a quick change and a developer shipping a critical migration receive identical treatment: same model (Sonnet), same review rounds, no parallel candidate tracks. This wastes effort for low-risk changes and under-invests confidence for high-risk ones.

This spec introduces a `--mode` flag on `df-orchestrate` that lets developers opt into a quality-vs-speed tradeoff explicitly, along with a `--afk` flag that automates PR creation after a successful run ends.

The feature is part of the `ao-pipeline-improvements` group that also includes `ao-design-intent` (adds `## Design Intent` sections to agents) and `ao-org-context` (adds `## Org Context` to project-profile). `ao-pipeline-mode` depends on `ao-design-intent` because changes to implementation-agent that route mode-based model selection must be based on the settled agent version from that spec.

## Design Intent

`--mode` should feel like a single, clear dial — not a collection of independent knobs. The three points on the dial (lean / balanced / quality) correspond to recognizable developer mental models: "just iterate", "standard workflow", and "ship with confidence". The developer never has to understand Sonnet vs. Opus directly — they pick a posture and the pipeline infers model selection.

`--afk` is a convenience for developers who treat successful pipeline runs as a natural PR trigger. It is intentionally narrow: it creates a draft PR with structured content and optionally assigns reviewers. It does not gate on test results (the pipeline already did that), push to remote (already done), or do anything else. Failures are logged and skipped, never blocking.

Best-of-N is not a general mechanism. It is a targeted confidence booster for the highest-risk tier (Tier 3) in the highest-confidence mode (quality). Running two independent code-agents and picking the survivor is expensive — it is only worth it when correctness matters more than cost.

## Scope

### In Scope (this spec)

- `--mode lean|balanced|quality` flag on `df-orchestrate` (default: `balanced`)
- Mode description shown in execution plan before developer confirmation
- Model selection table: lean → Sonnet everywhere; balanced → Sonnet for Tier 1/2, Opus for Tier 3; quality → Opus everywhere
- Judge agents (architect-agent, test-agent) always use `claude-sonnet` regardless of mode
- Implementation-agent receives mode as a spawn parameter and applies model selection per the table
- Best-of-N for Tier 3 specs in `quality` mode: two independent code-agent tracks, holdout validation against each, pick passing track
- Best-of-N worktree naming: `{spec-name}-track-a` and `{spec-name}-track-b`
- Best-of-N outcomes in execution plan and final summary
- Both-fail path: merge diagnosis, re-enter as single code-agent Round 2 (counts as 1 round against the 3-round max)
- `--afk` flag: post-run draft PR creation via `gh pr create --draft` for each promoted spec
- `--afk` reads spec's `## Context` and `## Acceptance Criteria` sections before spec file is deleted in cleanup
- `--afk` optionally assigns reviewers from project-profile `## Org Context` PR reviewer handles field
- `--afk` fails gracefully: log error, continue, never fail the pipeline run
- `--mode lean --best-of-n` invalid flag combination → clear error
- `--afk --skip-tests` → warning but not error
- Manifest records `mode` field and `bestOfN` outcome object per spec

### Out of Scope (explicitly deferred)

- Per-spec mode override (all specs in a run share the same mode)
- `--mode` on `df-intake` or `df-debug` (those pipelines have no model differentiation today)
- Non-draft PR creation (auto-merging, approval workflows)
- `--afk` pushing to remote (df-orchestrate already handles branch management)
- Best-of-N for Tier 1/2 specs (cost exceeds benefit)
- Best-of-N in lean or balanced modes
- Custom model IDs via CLI (model resolution stays inside the framework)
- Round budget expansion in quality mode beyond the 3-round cap (Tier 3 already gets full budget)
- Automated reviewer suggestion beyond the project-profile `## Org Context` field

### Scaling Path

If mode differentiation proves valuable, the dial could be extended with a `--mode custom` that exposes individual knobs (model, rounds, best-of-n). The current table design makes that easy to add: model selection is already a lookup by `(mode, tier)` — a custom mode just adds a fourth row. The `--afk` flag could grow toward `--afk --auto-merge` with appropriate gate conditions, but that is a separate product decision.

## Requirements

### Functional

- FR-1: `df-orchestrate` accepts `--mode lean|balanced|quality` flag — rationale: explicit quality-vs-speed tradeoff exposed at the call site
- FR-2: Default mode is `balanced` when `--mode` is omitted — rationale: preserves current behavior for existing users
- FR-3: Execution plan shows mode name, one-line description, and model mapping before developer confirmation — rationale: developer must understand what they are confirming
- FR-4: Mode is passed as a spawn parameter to each implementation-agent — rationale: implementation-agent controls agent spawning and must apply model selection
- FR-5: implementation-agent applies model selection table when spawning code-agents and spec-agents: lean → `claude-sonnet`; balanced → `claude-sonnet` (Tier 1/2) / `claude-opus` (Tier 3); quality → `claude-opus` — rationale: generator agents benefit from higher-capacity models for complex specs
- FR-6: architect-agent and test-agent always receive `claude-sonnet` regardless of mode — rationale: judge agents need calibrated uncertainty, not raw accuracy; Opus adds cost without benefit in evaluation roles
- FR-7: Best-of-N activates only for Tier 3 specs in `quality` mode — rationale: targeted confidence booster; cost is only justified at highest tier × highest mode
- FR-8: Best-of-N spawns two independent code-agents (Track A, Track B) in separate worktrees with identical inputs — rationale: independent tracks prevent shared assumptions from masking failures
- FR-9: Best-of-N holdout validation runs independently per track — rationale: promotion decision must reflect each track's actual correctness
- FR-10: Best-of-N promotion logic: one passes → promote it and log loser; both pass → promote Track A, note both passed; both fail → merge diagnosis, enter Round 2 as single code-agent — rationale: deterministic outcome in all four cases
- FR-11: Both-fail round counting: the Best-of-N attempt counts as 1 round (not 2) against the 3-round max — rationale: developer chose quality mode for more thorough coverage; penalizing them double is unfair
- FR-12: `--afk` flag triggers draft PR creation for each promoted spec after cleanup — rationale: removes a manual step from standard workflows
- FR-13: `--afk` checks `gh` CLI availability before attempting PR creation — rationale: fail gracefully if gh is not installed
- FR-14: `--afk` reads spec's `## Context` and `## Acceptance Criteria` before spec file deletion — rationale: cleanup deletes spec; PR body must be captured before that
- FR-15: `--afk` uses a temp file for `gh pr create --body-file` (not shell interpolation) — rationale: prevents shell injection from spec content
- FR-16: `--afk` optionally adds reviewers from project-profile `## Org Context` `PR reviewer handles` field — rationale: project-level reviewer defaults reduce per-PR manual work
- FR-17: `--afk` failure is non-blocking: log error message with manual fallback command, continue — rationale: a failed PR creation must never fail the pipeline
- FR-18: `--afk --skip-tests` emits a warning but proceeds — rationale: developer made an explicit choice; warn but respect it
- FR-19: `--mode lean --best-of-n` (explicit flag) is an error with clear message directing to `--mode quality` — rationale: best-of-n is not a standalone flag; it is part of quality mode
- FR-20: Manifest records `"mode"` field per spec entry — rationale: audit trail for what mode was used
- FR-21: Manifest records `"bestOfN"` outcome object per spec when Best-of-N ran — rationale: post-run diagnostics

### Non-Functional

- NFR-1: Mode display in execution plan must be human-readable in under 4 lines — rationale: developers read the execution plan before confirming; wall of text reduces comprehension
- NFR-2: Model IDs written as `claude-opus` and `claude-sonnet` WITHOUT version suffixes — rationale: the runtime resolves the current version; hardcoded version suffixes create upgrade friction
- NFR-3: Best-of-N worktree branches follow existing naming convention with `-track-a` / `-track-b` suffix — rationale: consistent with the project's existing worktree naming patterns
- NFR-4: The `--afk` temp file must be cleaned up after PR creation attempt (success or failure) — rationale: no stray temp files left in the workspace
- NFR-5: All new flag parsing must be documented alongside existing flags in df-orchestrate's `## Trigger` section — rationale: the trigger section is the canonical reference for all supported flags

## Data Model

No new files. Changes to existing runtime data:

### manifest.json — new fields per feature entry

```json
{
  "mode": "balanced",
  "bestOfN": {
    "winner": "track-a",
    "loserResult": "failed-holdout"
  }
}
```

`bestOfN` is only written when Best-of-N actually ran. `loserResult` values: `"failed-holdout"` | `"both-passed"` (when both passed and Track A was chosen). When both fail and a Round 2 retry occurs, `bestOfN` is omitted until the retry succeeds or is superseded.

## Migration & Deployment

N/A — no existing data affected. The `mode` and `bestOfN` fields are additive to the manifest schema. Existing manifest entries without these fields are treated as `"mode": "balanced"` (backward-compatible default). No existing stored formats, cache keys, or query behavior changes.

## API Endpoints

N/A — this is a CLI/agent framework with no HTTP API.

## Business Rules

- BR-1: Mode must be one of `lean`, `balanced`, `quality`. Any other value is an error with a clear message listing valid values.
- BR-2: Default mode is `balanced`; omitting `--mode` is identical to `--mode balanced`.
- BR-3: `--mode lean --best-of-n` is an error. `--best-of-n` does not exist as a standalone flag; best-of-n is exclusively a quality-mode behavior.
- BR-4: Best-of-N is only triggered for Tier 3 specs in quality mode. Tier 1/2 specs in quality mode skip Best-of-N and use a single code-agent with Opus.
- BR-5: judge agents (architect-agent, test-agent) use `claude-sonnet` regardless of mode. This rule is absolute and has no override path.
- BR-6: The Best-of-N attempt counts as exactly 1 round against the 3-round max, regardless of how many tracks ran.
- BR-7: When both Best-of-N tracks pass, Track A is always promoted. Track B is left for developer inspection.
- BR-8: `--afk` must capture spec content BEFORE the cleanup step deletes the spec file. If spec content capture fails, log a warning and create a PR with a minimal body (spec name + "Content not available — spec was deleted before capture").
- BR-9: `--afk` PR creation failures are always non-blocking. Pipeline run status reflects implementation outcomes only.
- BR-10: In multi-spec runs with `--afk`, PRs are created only for successfully promoted specs. Failed/blocked specs are listed in the summary with "PR skipped: spec failed".
- BR-11: Mode is recorded in the manifest entry at spec start (before architect review). If the spec fails, the mode is still recorded.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| `--mode invalid-value` | Error: "Unknown mode 'invalid-value'. Valid modes: lean, balanced, quality." Abort before execution plan. | None |
| `--mode lean --best-of-n` (explicit unknown flag) | Error: "Unknown flag '--best-of-n'. Best-of-N is automatically enabled in --mode quality for Tier 3 specs. Use --mode quality instead." | None |
| `--group` and `--mode` together | Valid — mode applies to all specs in the group | Mode shown in execution plan |
| `--all` and `--mode` together | Valid — mode applies to all active specs | Mode shown in execution plan |
| `--afk` without `gh` installed | Warning: "gh CLI not found — skipping auto-PR. Install from https://cli.github.com" | Pipeline completes normally |
| `--afk` with `gh pr create` failing (auth/network/existing PR) | Log: "Auto-PR failed for {spec-name}: {error}. Create manually: gh pr create --draft" | Pipeline continues; other specs' PRs attempted |
| `--afk --skip-tests` | Warning: "Running with --skip-tests and --afk — PR will be created for an implementation that skipped pre-flight tests." | PR is still created on success |
| Best-of-N both tracks fail | Merge both failure summaries into combined diagnosis; enter Round 2 as single code-agent | Counts as 1 round |
| Best-of-N Track A merge conflict | Hard stop for this spec; report with file details; continue independent specs | Track B is abandoned |
| Spec content capture fails for `--afk` | Warning logged; PR created with minimal body | PR is created (non-blocking content issue) |

## Acceptance Criteria

- [ ] AC-1: `df-orchestrate --mode lean spec-name` runs without error; execution plan shows "Mode: lean"
- [ ] AC-2: `df-orchestrate spec-name` (no `--mode`) runs as `balanced`; execution plan shows "Mode: balanced (default)"
- [ ] AC-3: `df-orchestrate --mode quality spec-name` runs without error; execution plan shows "Mode: quality"
- [ ] AC-4: `df-orchestrate --mode invalid` aborts with a clear error naming the invalid value and listing valid options
- [ ] AC-5: Execution plan mode block shows mode name, one-line description, and model mapping before confirmation prompt
- [ ] AC-6: implementation-agent spawns code-agents and spec-agents with the model determined by `(mode, tier)` table
- [ ] AC-7: architect-agent and test-agent always receive `claude-sonnet` regardless of mode
- [ ] AC-8: Tier 3 spec in `quality` mode triggers Best-of-N (two worktrees: `{spec-name}-track-a`, `{spec-name}-track-b`)
- [ ] AC-9: Tier 1 spec in `quality` mode does NOT trigger Best-of-N (single code-agent with Opus)
- [ ] AC-10: Best-of-N one-passes → passing track promoted; loser result logged in manifest
- [ ] AC-11: Best-of-N both pass → Track A promoted; manifest records `"loserResult": "both-passed"`
- [ ] AC-12: Best-of-N both fail → combined diagnosis → Round 2 single code-agent; round counter = 1 (not 2)
- [ ] AC-13: `--afk` with `gh` present creates draft PR for each promoted spec
- [ ] AC-14: `--afk` without `gh` logs warning and continues without error
- [ ] AC-15: `--afk` PR body is built from spec's `## Context` and `## Acceptance Criteria` sections
- [ ] AC-16: `--afk` assigns reviewers if `## Org Context` in project-profile contains `PR reviewer handles`
- [ ] AC-17: manifest entry includes `"mode"` field for every spec run through the pipeline
- [ ] AC-18: manifest entry includes `"bestOfN"` object when Best-of-N ran
- [ ] AC-19: `--mode lean --best-of-n` produces an error naming that `--best-of-n` does not exist as a standalone flag
- [ ] AC-20: `--afk --skip-tests` warns but does not abort; PR is still created on success

## Edge Cases

- EC-1: `--mode quality` applied to a spec with `Architect Review Tier: Tier 1` — Best-of-N must NOT trigger; single code-agent with Opus. Execution plan must note: "Tier 1 spec — Best-of-N skipped (quality mode applies Opus only)."
- EC-2: `--mode quality` multi-spec run where some specs are Tier 3 and some are Tier 1/2 — per-spec model selection applies independently; only Tier 3 specs get Best-of-N; execution plan shows per-spec breakdown.
- EC-3: Best-of-N Track A passes, Track B fails — Track A promoted normally; Track B worktree left for developer inspection; loser result in manifest.
- EC-4: Best-of-N Track B passes, Track A fails — Track B promoted; manifest records winner as "track-b".
- EC-5: Best-of-N both fail, Round 2 also fails — Round 2 failure triggers normal failure handling (spec stays active in manifest, developer notified). Round count is 2 (Round 1 Best-of-N + Round 2 single agent).
- EC-6: Best-of-N both fail, both-fail diagnosis is empty or malformed — implementation-agent falls back to running Round 2 with the original spec inputs, logging: "Best-of-N diagnosis unavailable — running Round 2 with original spec."
- EC-7: `--afk` run with multiple specs where one spec fails — PRs created for promoted specs only; failed spec listed in summary with "PR skipped: spec failed".
- EC-8: `--afk` spec content capture produces content with shell-special characters (backticks, `$`, quotes) — body-file approach must handle this safely; no shell injection possible.
- EC-9: `--afk` `gh pr create` returns "already exists" error for a branch that already has an open PR — log the error as a warning ("Auto-PR failed for {name}: a PR already exists for this branch"), do not retry, continue.
- EC-10: Existing manifest entries (from previous pipeline runs) that lack `"mode"` field — df-orchestrate reads and updates entries without writing the `mode` field retroactively; only new runs add the field.
- EC-11: `--mode` combined with `--skip-tests` — valid; mode affects model selection and Best-of-N; `--skip-tests` only affects the pre-flight test gate.
- EC-12: Best-of-N in a multi-spec wave — each Tier 3 spec gets its own Best-of-N independently; Track A/B worktrees are per-spec (e.g., `spec-a-track-a`, `spec-a-track-b`, `spec-b-track-a`, `spec-b-track-b`).

## Dependencies

- **Depends on**: `ao-design-intent` — implementation-agent changes that apply mode-based model selection must be based on the settled `implementation-agent.md` version from that spec
- **Depended on by**: none in the current group
- **Group**: `ao-pipeline-improvements`

## Implementation Size Estimate

- **Scope size**: large (6-8 files)
- **Files touched**: `.claude/skills/df-orchestrate/SKILL.md`, `.claude/agents/implementation-agent.md`, and their plugin mirrors in `plugins/dark-factory/skills/df-orchestrate/SKILL.md` and `plugins/dark-factory/agents/implementation-agent.md`. Also `tests/dark-factory-setup.test.js` for structural assertions.
- **Suggested parallel tracks**:
  - Track 1: `df-orchestrate/SKILL.md` + its plugin mirror — flag parsing, execution plan mode display, mode forwarding to implementation-agent, `--afk` post-run logic
  - Track 2: `implementation-agent.md` + its plugin mirror — mode parameter receipt, model selection table, Best-of-N spawn logic, manifest mode recording
  - Track 3: `tests/dark-factory-setup.test.js` — structural assertions for flag parsing, mode display, model selection rules, Best-of-N trigger conditions, manifest schema
  - Zero file overlap between tracks. Tracks 1 and 2 can run in parallel. Track 3 should run after 1 and 2 since it validates their outputs.

## Architect Review Tier

- **Tier**: 3
- **Reason**: Touches 6+ files including core pipeline agents and their plugin mirrors; introduces cross-cutting keywords ("all agents", "pipeline"); changes the contract of implementation-agent (how it spawns sub-agents); adds conditional branching to Best-of-N that creates new worktrees; touches test contracts; introduces new manifest schema fields
- **Agents**: 3 domain agents
- **Rounds**: 3+

## Implementation Notes

- The `--mode` flag follows the same parsing pattern as `--skip-tests`: extracted first in "Parse flags first" step before processing spec names.
- Model IDs must be written as `claude-opus` and `claude-sonnet` — no version suffixes (e.g., not `claude-opus-4-5`). The runtime resolves current version automatically.
- The execution plan mode block should follow the existing execution plan format. Insert it immediately after the plan header and before the wave breakdown, on its own block:
  ```
  Mode: balanced (default)
    → Tier 1/2 specs: claude-sonnet | Tier 3 specs: claude-opus | No Best-of-N
    Use --mode quality for maximum confidence, --mode lean for faster iteration.
  ```
- Best-of-N worktrees follow existing worktree naming conventions. Use `EnterWorktree` with branch names `{spec-name}-track-a` and `{spec-name}-track-b`. Both are created before either code-agent runs.
- The `--afk` spec content extraction step happens inside the cleanup phase, BEFORE the spec file is deleted. The implementation-agent's cleanup step (Step 5) must be modified: read and cache spec sections first, then delete, then attempt `gh pr create`.
- For the `--afk` reviewer lookup: search project-profile for a line matching `PR reviewer handles` or `PR reviewer` in the `## Org Context` section. If the line exists and has a value, pass it to `gh pr edit --add-reviewer`. If missing or empty, skip reviewer assignment silently.
- `bestOfN.loserResult` should be `"failed-holdout"` when the losing track failed validation, `"both-passed"` when both tracks passed and Track A was arbitrarily chosen.

## Invariants

### Preserves
- The existing information barrier rules remain unchanged: holdout content never passes to code-agent, public scenarios never pass to test-agent, tests/scenarios never pass to architect-agent (BR-5 reinforces this: judge agents always use claude-sonnet, which already aligns with their current invocation).

### References
- None — no existing registered invariants in scope for this spec.

### Introduces

- **INV-TBD-a**
  - **title**: Judge agents always use claude-sonnet regardless of pipeline mode
  - **rule**: architect-agent and test-agent must always be spawned with `claude-sonnet` regardless of the `--mode` flag value. No override path exists.
  - **scope.modules**: `.claude/agents/implementation-agent.md`, `.claude/skills/df-orchestrate/SKILL.md`
  - **domain**: architecture
  - **enforcement**: runtime
  - **rationale**: Judge agents need calibrated uncertainty for evaluation tasks. Using Opus in judge roles adds cost without benefit and risks over-confident approvals. This rule must survive future mode additions (e.g., `--mode custom`).

- **INV-TBD-b**
  - **title**: Best-of-N is exclusively a quality-mode, Tier-3 behavior
  - **rule**: Best-of-N (spawning two independent code-agent tracks) must only activate when BOTH conditions are true: (1) `--mode quality` and (2) spec tier is Tier 3. Neither condition alone is sufficient.
  - **scope.modules**: `.claude/agents/implementation-agent.md`
  - **domain**: architecture
  - **enforcement**: runtime
  - **rationale**: Best-of-N doubles code-agent cost. Activating it below Tier 3 or in non-quality modes wastes developer resources without proportionate confidence gain.

### Modifies
*None.*

### Supersedes
*None.*

## Decisions

### References
*None — no existing decisions in scope.*

### Introduces

- **DEC-TBD-a**
  - **title**: Model IDs without version suffixes
  - **decision**: Model identifiers are written as `claude-opus` and `claude-sonnet` without version suffixes throughout all agent and skill files.
  - **rationale**: Hardcoded version suffixes require coordinated updates across all agent files whenever Anthropic releases a new version. The runtime resolves the current version automatically from the base identifier.
  - **alternatives**: Pinned version suffixes (e.g., `claude-opus-4-5`) — rejected because they create upgrade friction and version skew across files.
  - **scope.modules**: `.claude/agents/implementation-agent.md`, `.claude/skills/df-orchestrate/SKILL.md`, and all plugin mirrors
  - **domain**: architecture
  - **enforcement**: manual (no automated version-suffix check exists today)

- **DEC-TBD-b**
  - **title**: Best-of-N round counting: attempt = 1 round
  - **decision**: A Best-of-N attempt (two tracks) counts as exactly 1 round against the 3-round max, even though it spawns two code-agents.
  - **rationale**: The developer chose quality mode to maximize confidence. Charging 2 rounds for a single attempt (which they did not choose explicitly) would mean Best-of-N exhausts the retry budget immediately on a complex spec, defeating its purpose.
  - **alternatives**: Count each track as 1 round (costs 2 rounds total) — rejected for the reason above. Count Best-of-N as 0 rounds — rejected because it is a real implementation attempt that consumes real compute.
  - **scope.modules**: `.claude/agents/implementation-agent.md`
  - **domain**: architecture
  - **enforcement**: runtime

### Supersedes
*None.*

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01, P-02, P-03 |
| FR-2 | P-04 |
| FR-3 | P-05, P-06, P-07 |
| FR-4 | P-08 |
| FR-5 | P-09, H-03 |
| FR-6 | P-10, H-04 |
| FR-7 | H-01, H-02 |
| FR-8 | H-01 |
| FR-9 | H-01 |
| FR-10 | H-01, H-02, H-05 |
| FR-11 | H-06 |
| FR-12 | P-11, H-07 |
| FR-13 | H-08 |
| FR-14 | P-12 |
| FR-15 | H-09 |
| FR-16 | H-10 |
| FR-17 | H-08, H-11 |
| FR-18 | P-13 |
| FR-19 | P-14 |
| FR-20 | P-15 |
| FR-21 | H-12 |
| BR-1 | P-02, P-03 |
| BR-2 | P-04 |
| BR-3 | P-14 |
| BR-4 | H-01, H-13 |
| BR-5 | P-10, H-04 |
| BR-6 | H-06 |
| BR-7 | H-02 |
| BR-8 | P-12 |
| BR-9 | H-08 |
| BR-10 | H-11 |
| BR-11 | P-15 |
| EC-1 | H-13 |
| EC-2 | H-14 |
| EC-3 | H-01 (track-A-passes variant) |
| EC-4 | H-02 |
| EC-5 | H-05 |
| EC-6 | H-06 |
| EC-7 | H-11 |
| EC-8 | H-09 |
| EC-9 | H-15 |
| EC-10 | H-16 |
| EC-11 | P-16 |
| EC-12 | H-17 |
