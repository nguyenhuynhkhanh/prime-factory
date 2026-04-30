# Feature: token-opt-trimming

## Context

Two test-heavy pipeline stages currently flood agent context with raw TAP output. The implementation-agent pre-flight gate and test-agent Step 2.75 regression gate each run `npm test`, and the full TAP stream (~216 KB, ~54k tokens for 885 assertions on a clean run) lands unfiltered into context. This is the single largest preventable token cost in the implementation cycle.

Additionally, Step 0.5 of implementation-agent reads the entire spec file (up to 88 KB, 500+ lines) to extract one header field: `Implementation Size Estimate`. Both fields the agent needs at that point are always in the first 40 lines of a valid spec.

This spec fixes both waste points with minimal, targeted changes to two source files.

## Design Intent

**Intent introduced**: `DI-TBD-a` — Context budget as a first-class constraint. Any pipeline step that runs a full test suite must filter its output before landing in agent context; raw TAP streams must never flow directly into an agent's working context. The survival criterion: future additions to implementation-agent, test-agent, or any agent that runs test commands must default to filtered output, not raw output. This is fragile because adding a new test-run step is the natural path of least resistance, and inline raw output is what most developers reach for first.

`DI-TBD-b` — Spec reads should be proportional to the data needed. When an agent reads a spec only to extract header-level fields, it must scope the read to the header region (limit: 40). Full spec reads are reserved for agents that need the complete content. This intent is fragile because convenience reads (`Read` with no limit) will gradually creep back in as the spec grows.

**Existing intents touched**: None — design-intent-architecture.md shard is empty (bootstrap state).

**Drift risk**: The test-output filter pattern is the most vulnerable. Future steps that run `npm test` or similar commands will be added without the `tee + grep` pattern — especially in quick patches. The canonical filter expression (`grep -E '^not ok|^# (tests|pass|fail)'`) must be treated as a protocol, not a one-off implementation detail. The spec read limit risk is lower (single callsite, easy to audit) but will erode if spec structure changes and the limit is not updated.

## Scope

### In Scope (this spec)

- Pre-flight test gate (implementation-agent): pipe `npm test` output to `/tmp/preflight-{specName}.tap`; filter with `grep -E '^not ok|^# (tests|pass|fail)'`; pass only filtered output to agent context.
- Step 2.75 regression gate (test-agent): same piped-tee-grep pattern; temp file at `/tmp/regression-{specName}.tap`.
- Step 0.5 spec read (implementation-agent): add `limit: 40` to the `Read` call that extracts `Implementation Size Estimate`; if field not found in first 40 lines, warn and default to `medium`.
- Test assertions in `tests/dark-factory-setup.test.js` verifying the above behaviors are described in the agent source files.

### Out of Scope (explicitly deferred)

- Any other agent that may run test commands (e.g., code-agent running unit tests inline) — addressed separately if needed.
- Test output filtering for Playwright E2E tests — TAP filter is unit-test specific; E2E output has a different format.
- Streaming partial output to the developer (progress UX) — separate concern.
- Persistent storage of filtered output beyond the current session — `/tmp` is intentionally ephemeral.
- Compressing or truncating the full TAP file — full output is preserved on disk for debugging; only context injection is filtered.

### Scaling Path

This spec establishes a pattern. If more test-run callsites are added in future agents, each must apply the same `tee + grep` protocol (see `DI-TBD-a`). The canonical filter expression is captured as `DEC-TBD-a` and should be referenced, not re-derived.

## Requirements

### Functional

- FR-1: Pre-flight gate must pipe `npm test` output through `tee /tmp/preflight-{specName}.tap` before filtering, so the full TAP stream is always recoverable from disk. — Ensures debugging capability is not lost.
- FR-2: Pre-flight gate must filter test output with `grep -E '^not ok|^# (tests|pass|fail)'` before injecting into agent context. — Reduces context from ~54k tokens to ~20 tokens on a clean run.
- FR-3: Pass/fail decision in the pre-flight gate must be based on the filtered output (presence of `not ok` lines or non-zero exit code from the test command), not on the raw output. — Behavioral equivalence: the gate still stops on failure.
- FR-4: test-agent Step 2.75 must pipe the full-suite test run through `tee /tmp/regression-{specName}.tap` and apply the same grep filter before injecting output into context. — Symmetric fix in the second test-run callsite.
- FR-5: implementation-agent Step 0.5 must use `limit: 40` when reading the spec to extract `Implementation Size Estimate`. — Prevents full-spec read for a header-only lookup.
- FR-6: If `Implementation Size Estimate` is not found in the first 40 lines, implementation-agent must log a warning and default to `medium`. — Defensive fallback for malformed or non-conforming specs.

### Non-Functional

- NFR-1: No behavioral change to pass/fail decisions in either gate — only the volume of output in agent context changes. — Correctness invariant: the optimization must be transparent to pipeline outcomes.
- NFR-2: Full TAP output must be accessible at the temp file path for the duration of the implementation session. — Debugging requirement; OS manages `/tmp` cleanup.
- NFR-3: The grep filter must be a single pipeline stage — no intermediate files beyond the `/tmp` tap file. — Keep the implementation simple and auditable.

## Data Model

N/A — this feature modifies agent prompt text only. No data schema changes.

## Migration & Deployment

N/A — no existing data affected. Agent source files are prompt text; there is no stored state, cache, or data format to migrate. The change takes effect when the agents are rebuilt from source (`npm run build:agents`) and redeployed.

Rollback: revert the two source file edits and rebuild. No data recovery needed.

## API Endpoints

N/A — Dark Factory has no HTTP API. Changes are to agent prompt text.

## Business Rules

- BR-1: The canonical test output filter is `grep -E '^not ok|^# (tests|pass|fail)'`. This expression is the single source of truth and must be identical in both callsites (pre-flight gate and Step 2.75). Divergence between the two sites is a bug.
- BR-2: The temp file path for the pre-flight gate is `/tmp/preflight-{specName}.tap`. The temp file path for the Step 2.75 regression gate is `/tmp/regression-{specName}.tap`. These paths are fixed by convention; agents must not compute alternative paths.
- BR-3: The `limit: 40` constraint for spec header reads applies only when the read's purpose is to extract header-level fields (tier, size estimate). Reads that require the full spec content (code-agent, architect-agent, spec-agent self-revision) must continue to read without a limit.
- BR-4: The failure decision in both gates does not change. A failing test (non-zero exit code or `not ok` lines present) still stops or routes as before. The filter changes what the agent sees, not what the agent decides.
- BR-5: If `Implementation Size Estimate` is absent from the first 40 lines, the default is `medium` and a warning is logged. The implementation cycle continues; the warning is informational only.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| `tee` write fails (e.g., `/tmp` full) | Pipe fails; test output lost; treat as test infrastructure failure; warn and stop pre-flight gate | No context injection; spec name logged |
| `grep` filter returns zero lines (clean run) | Zero lines = clean run; pre-flight gate passes | No context injection of test output; this is expected |
| `grep` finds `not ok` lines | Gate treats as failure; reports filtered lines; stops pipeline | Same as today — only the reporting volume changes |
| `Implementation Size Estimate` not in first 40 lines | Log: "Implementation Size Estimate not found in first 40 lines of spec — defaulting to medium"; use `medium` | Pipeline continues with medium parallelism assumption |
| Test command not in project profile | Existing behavior: warn and skip gate | No change |

## Acceptance Criteria

- [ ] AC-1: Pre-flight gate command uses `tee /tmp/preflight-{specName}.tap` to preserve full output on disk.
- [ ] AC-2: Pre-flight gate injects only grep-filtered output into agent context (matching `^not ok` or `^# (tests|pass|fail)`).
- [ ] AC-3: On a clean run, pre-flight context injection is approximately 1–3 lines (the summary line), not the full TAP stream.
- [ ] AC-4: On a failing run, pre-flight context injection shows only the failed test lines and the summary line.
- [ ] AC-5: test-agent Step 2.75 uses `tee /tmp/regression-{specName}.tap` and the same grep filter.
- [ ] AC-6: Pass/fail decisions in both gates are unchanged — filtering is transparent to pipeline outcomes.
- [ ] AC-7: implementation-agent Step 0.5 reads spec with `limit: 40`.
- [ ] AC-8: If `Implementation Size Estimate` is absent from first 40 lines, agent logs a warning and defaults to `medium`.
- [ ] AC-9: Test assertions in `tests/dark-factory-setup.test.js` verify AC-1 through AC-8 against compiled agent content.
- [ ] AC-10: Plugin mirror parity — compiled agents in `.claude/agents/` and `plugins/dark-factory/agents/` match.

## Edge Cases

- EC-1: Clean run — grep filter returns zero lines (no `not ok`, no summary matching the pattern). Expected: pre-flight gate passes; no test output injected into context; this is the happy-path optimized case.
- EC-2: All 885 tests fail simultaneously. Expected: grep filter returns ~885 `not ok` lines plus the summary. Context is still much smaller than raw TAP but may be large. Gate stops pipeline with filtered output.
- EC-3: Spec file has `Implementation Size Estimate` on line 41 or later (non-conforming spec). Expected: limit:40 read misses it; agent logs warning and defaults to `medium`.
- EC-4: Spec file has `Implementation Size Estimate` on line 1 (unusually terse spec). Expected: limit:40 read finds it; no warning; normal parallelism logic proceeds.
- EC-5: `specName` contains special characters (spaces, slashes). Expected: the temp file path must safely compose; implementation must ensure `{specName}` is sanitized or the shell command is quoted.
- EC-6: Step 2.75 runs on a project with no promoted tests (empty promoted-tests.json). Expected: test suite runs, grep filter applies, zero lines returned, gate passes cleanly.
- EC-7: Both the pre-flight gate and Step 2.75 run in the same implementation cycle (normal case). Expected: both write to their respective `/tmp` paths without conflict; paths are distinct by convention (preflight vs regression prefix).

## Dependencies

- **Depends on**: `token-opt-architect-phase` — after that spec ships, Step 0a (reading the spec for Architect Review Tier) is removed from implementation-agent. The remaining spec read is Step 0.5, which is what this fix addresses. These are different lines in `implementation-agent.src.md`, so the edits do not conflict — but deploying this spec before `token-opt-architect-phase` means Step 0a (the full-spec tier read) still exists alongside the new limited Step 0.5 read. Deploying in dependency order is cleaner.
- **Depended on by**: none currently.
- **Group**: token-opt

## Implementation Size Estimate

- **Scope size**: small (2 source files + tests)
- **Suggested parallel tracks**:
  - Track A (single agent): Edit `src/agents/implementation-agent.src.md` (pre-flight gate filter + Step 0.5 limit), edit `src/agents/test-agent.src.md` (Step 2.75 filter), add `tests/dark-factory-setup.test.js` assertions, rebuild both compiled agent outputs.
  - No parallelism warranted — all changes are small, sequential, and in related files. A second track would require splitting test authoring from source edits, creating coordination overhead that exceeds the benefit.

## Architect Review Tier

- **Tier**: 1
- **Reason**: 2 source files touched (`implementation-agent.src.md`, `test-agent.src.md`), no migration section, no security/auth domain, no cross-cutting keywords. Changes are text edits to prompt content with no API or data model impact.
- **Agents**: 1 combined
- **Rounds**: 1

## Implementation Notes

- Agent source files are in `src/agents/*.src.md`. The build step (`npm run build:agents`) compiles them to `.claude/agents/*.md` and `plugins/dark-factory/agents/*.md`. Edits must be to the `src/` source files only — never to the compiled outputs directly.
- The pre-flight gate is in `implementation-agent.src.md` under the `## Pre-flight Test Gate` heading (around line 51–57 in current source). The `npm test` command comes from the `Run:` field of the project profile.
- Step 2.75 is in `test-agent.src.md` under the `## Step 2.75: Full-Suite Regression Gate` heading (around line 114–123).
- Step 0.5 is in `implementation-agent.src.md` under `### Step 0.5: Determine Parallelism` (around line 90–92). The `Read` call for the spec is implicit in the description ("Read spec's **Implementation Size Estimate**") — the code-agent must make this explicit as a `Read` call with `limit: 40`.
- The canonical grep filter is: `grep -E '^not ok|^# (tests|pass|fail)'` — copy this exactly in both callsites.
- Test assertions follow the pattern in `dark-factory-setup.test.js`: `content.includes(expectedPhrase)` on the compiled agent `.md` file content. The promoted test section marker for this feature will be `token-opt-trimming`.
- Plugin mirror: after editing source files and running `npm run build:agents`, verify `.claude/agents/implementation-agent.md` and `plugins/dark-factory/agents/implementation-agent.md` match (same for test-agent). The test suite (`dark-factory-contracts.test.js`) enforces this.

## Invariants

### Preserves

None — this spec neither preserves nor references existing invariants (memory shards are in bootstrap state with no entries).

### References

None — no existing registered invariants in scope for this spec.

### Introduces

- **INV-TBD-a**
  - **title**: Test output must be filtered before agent context injection
  - **rule**: Any pipeline step that runs a test suite command (`npm test`, `node --test`, or equivalent) MUST filter its output with `grep -E '^not ok|^# (tests|pass|fail)'` (or an equivalent filter that retains only failures and the summary line) before injecting output into agent context. Raw TAP streams must never flow directly into an agent's working context.
  - **scope.modules**: `src/agents/implementation-agent.src.md`, `src/agents/test-agent.src.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (token-opt-trimming section)
  - **rationale**: Unfiltered test output is the single largest preventable token cost in the implementation cycle (~54k tokens per clean run). This rule prevents future test-run additions from silently re-introducing the same waste.

- **INV-TBD-b**
  - **title**: Spec header reads must use limit:40
  - **rule**: When an agent reads a spec file for the sole purpose of extracting header-level fields (Architect Review Tier, Implementation Size Estimate, or any field expected in the first 40 lines by spec template convention), the Read call MUST use `limit: 40`. Full reads are reserved for agents that require the complete spec content.
  - **scope.modules**: `src/agents/implementation-agent.src.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (token-opt-trimming section)
  - **rationale**: Full spec reads for header-only lookups waste up to 88 KB of context. The spec template guarantees header fields appear in the first 40 lines — a limit:40 read is always sufficient and the waste is never justified.

### Modifies

None.

### Supersedes

None.

## Decisions

### References

None — no existing decisions in scope.

### Introduces

- **DEC-TBD-a**
  - **title**: Canonical test output filter expression
  - **decision**: The canonical filter for TAP test output is `grep -E '^not ok|^# (tests|pass|fail)'`. This exact expression is the single source of truth for both pre-flight gate and Step 2.75 regression gate.
  - **rationale**: A canonical expression prevents divergence between callsites. The pattern captures TAP `not ok` lines (test failures) and the summary block (`# tests N`, `# pass N`, `# fail N`) which is all the information an agent needs to make a pass/fail decision or report failures to the developer.
  - **alternatives**: (a) Capture only exit code — rejected because the agent needs to report which tests failed; (b) Use `tail -N` to capture last N lines — rejected because TAP summary line position is not guaranteed and failures may be in the middle; (c) Parse TAP format with a dedicated tool — over-engineered for this use case.
  - **scope.modules**: `src/agents/implementation-agent.src.md`, `src/agents/test-agent.src.md`
  - **domain**: architecture
  - **enforcement**: manual (grep expression reviewed at code review; enforced by INV-TBD-a test)

- **DEC-TBD-b**
  - **title**: Temp file naming convention for filtered test output
  - **decision**: Pre-flight gate writes full TAP to `/tmp/preflight-{specName}.tap`; Step 2.75 regression gate writes to `/tmp/regression-{specName}.tap`. No cleanup needed — OS manages `/tmp`.
  - **rationale**: Distinct prefixes (`preflight` vs `regression`) prevent path collision when both gates run in the same session. `/tmp` is used because the output is ephemeral (debugging aid for the current session) and requires no lifecycle management.
  - **alternatives**: (a) Use a project-local directory (e.g., `dark-factory/results/{name}/`) — rejected because test output is not a spec artifact and the results directory is used for holdout test results, not raw TAP; (b) Single shared path — rejected because both gates can run in the same implementation cycle.
  - **scope.modules**: `src/agents/implementation-agent.src.md`, `src/agents/test-agent.src.md`
  - **domain**: architecture
  - **enforcement**: manual

### Supersedes

None.

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| AC-1 (pre-flight tee command) | P-01, P-02 |
| AC-2 (pre-flight grep filter) | P-01, P-02, P-03 |
| AC-3 (clean run output volume) | P-01 |
| AC-4 (failing run shows failures) | P-03 |
| AC-5 (Step 2.75 filter) | P-04, P-05 |
| AC-6 (pass/fail decisions unchanged) | P-03, P-05, H-01, H-06 |
| AC-7 (Step 0.5 limit:40) | P-06 |
| AC-8 (missing field warning + default) | P-07 |
| AC-9 (test assertions) | P-01 through P-07 (structural) |
| AC-10 (plugin mirror parity) | P-08 |
| BR-1 (canonical filter identical in both callsites) | H-02 |
| BR-2 (temp file paths) | P-02, P-04, H-03 |
| BR-3 (limit:40 scope) | P-06, H-04 |
| BR-4 (failure decision unchanged) | H-01, H-06 |
| BR-5 (default medium warning) | P-07 |
| EC-1 (clean run zero lines) | P-01 |
| EC-2 (all tests fail) | H-01 |
| EC-3 (field on line 41+) | P-07 |
| EC-4 (field on line 1) | H-05 |
| EC-5 (specName special chars) | H-07 |
| EC-6 (no promoted tests) | H-06 |
| EC-7 (both gates run same cycle) | H-03 |
