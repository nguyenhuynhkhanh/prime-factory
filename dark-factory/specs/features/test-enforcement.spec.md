# Feature: Test Enforcement

## Context

After Dark Factory promotes holdout tests into a project's permanent test suite, there is ZERO enforcement that those tests continue to exist, pass, or remain unskipped. The manifest entry is deleted during cleanup, leaving no record of what was promoted or where. Developers can delete, `.skip()`, or comment out promoted tests with no detection. Additionally, the code-agent in feature mode only runs "tests to verify implementation" (its own tests), while bugfix mode explicitly runs ALL existing tests for regression — an asymmetry that means feature implementations can silently break existing tests.

This feature closes the enforcement gap across the entire lifecycle: before implementation (pre-flight gate), during implementation (code-agent runs all tests), after promotion (persistent registry), and ongoing (health checks).

## Scope

### In Scope (this spec)

1. **Pre-implementation test gate** in df-orchestrate — run full test suite before architect review
2. **Promoted test registry** (`dark-factory/promoted-tests.json`) — persistent record of all promoted tests
3. **Health check** extending `/df-cleanup` — detect missing, skipped, failing, or stale promoted tests
4. **Optional git pre-commit hook** via df-onboard and `bin/cli.js init --hooks`
5. **Promote-agent registry integration** — write to registry after placing tests, add section markers
6. **Code-agent feature mode fix** — run ALL existing tests, not just new ones

### Out of Scope (explicitly deferred)

- CI/CD pipeline generation (too project-specific, every team has different CI)
- Automatic test updates when guarded source code changes (requires semantic analysis beyond string matching)
- Cross-project version sync (Dark Factory operates per-project)
- Periodic/scheduled health checks (DF operates in sessions, not as a daemon)
- Function-level staleness detection (semantic staleness requires human judgment — the `// Guards:` annotation is informational, not enforceable beyond file existence)

### Scaling Path

- v1: Registry + health check + pre-flight gate (this spec)
- v2: If teams want CI integration, the registry JSON format is machine-readable — CI scripts can consume `promoted-tests.json` directly to build targeted test suites
- v3: If cross-project enforcement is needed, a central aggregator could read each project's registry — but that's a separate tool

## Requirements

### Functional

- FR-1: df-orchestrate MUST run the project's full test suite before starting architect review — ensures no pre-existing failures pollute implementation. The test command comes from `dark-factory/project-profile.md` Testing section (`Run:` field). If no project profile exists, warn and skip the gate (do not block).
- FR-2: The pre-flight test gate MUST be bypassable with `--skip-tests` flag — sometimes tests are flaky or the developer knowingly has failures they want to fix as part of this spec. When bypassed, log `"testGateSkipped": true` in the manifest entry.
- FR-3: promote-agent MUST write an entry to `dark-factory/promoted-tests.json` after successfully placing tests — each entry records feature name, file path(s), promotion timestamp (ISO 8601), source holdout scenario count, and annotation format used.
- FR-4: For co-located tests (tests appended to a shared test file rather than placed in a new file), promote-agent MUST wrap promoted test blocks with section markers: `// DF-PROMOTED-START: {name}` and `// DF-PROMOTED-END: {name}` — enables precise deletion detection within shared files.
- FR-5: df-cleanup MUST read `dark-factory/promoted-tests.json` and verify each entry: file exists, no `.skip()` or `.only()` on promoted tests, `// Guards:` annotations reference files that still exist, and promoted tests pass when run.
- FR-6: df-cleanup `--rebuild` MUST reconstruct the registry by scanning the codebase for `// Promoted from Dark Factory holdout:` annotation headers — recovery path when registry is lost or corrupted.
- FR-7: code-agent feature mode MUST run ALL existing tests (not just new ones) after implementation — matching the bugfix mode behavior that already says "Run ALL existing tests and verify they still pass."
- FR-8: onboard-agent MUST offer to install a git pre-commit hook that runs the project's test command — opt-in, not mandatory.
- FR-9: The pre-commit hook installation MUST detect existing hook infrastructure (husky, lefthook, simple-git-hooks) and integrate rather than overwrite.
- FR-10: `bin/cli.js init --hooks` MUST install the same pre-commit hook without requiring onboard — for teams that want hooks but skip onboard.

### Non-Functional

- NFR-1: `promoted-tests.json` MUST NOT be gitignored — it is a shared team artifact, committed alongside the codebase.
- NFR-2: Health check MUST complete in a single pass (read registry, check files, run tests, report) — no multi-step interactive flow.
- NFR-3: Registry format MUST be forward-compatible — new fields can be added without breaking existing entries (use optional fields with defaults).
- NFR-4: Pre-flight test gate MUST fail fast — report ALL failures, not just the first one, so the developer sees the full picture.

## Data Model

### `dark-factory/promoted-tests.json`

```json
{
  "version": 1,
  "promotedTests": [
    {
      "feature": "user-auth",
      "type": "feature",
      "files": [
        {
          "path": "tests/user-auth.promoted.test.js",
          "colocated": false
        }
      ],
      "promotedAt": "2026-04-01T14:30:00.000Z",
      "holdoutScenarioCount": 5,
      "annotationFormat": "header-comment",
      "sectionMarkers": false
    },
    {
      "feature": "login-rate-limit",
      "type": "bugfix",
      "files": [
        {
          "path": "tests/auth/auth.test.js",
          "colocated": true,
          "startMarker": "// DF-PROMOTED-START: login-rate-limit",
          "endMarker": "// DF-PROMOTED-END: login-rate-limit"
        }
      ],
      "promotedAt": "2026-04-02T09:15:00.000Z",
      "holdoutScenarioCount": 3,
      "annotationFormat": "header-comment",
      "sectionMarkers": true
    }
  ]
}
```

**Field definitions:**
- `version` (integer): Schema version for forward compatibility. Current: 1.
- `promotedTests` (array): List of all promoted test entries.
- `feature` (string): Dark Factory feature/bugfix name.
- `type` (string): `"feature"` or `"bugfix"`.
- `files` (array of objects): Each promoted test file.
  - `path` (string): Relative path from project root.
  - `colocated` (boolean): Whether tests were appended to an existing file.
  - `startMarker` / `endMarker` (string, optional): Only present when `colocated: true`.
- `promotedAt` (string): ISO 8601 timestamp.
- `holdoutScenarioCount` (integer): Number of holdout scenarios that produced these tests.
- `annotationFormat` (string): Format of the annotation header (currently always `"header-comment"`).
- `sectionMarkers` (boolean): Whether section markers were used.

### Manifest entry additions

When `--skip-tests` is used in df-orchestrate, the manifest entry for that feature gains:

```json
{
  "testGateSkipped": true,
  "testGateSkippedAt": "2026-04-01T10:00:00.000Z"
}
```

## Migration & Deployment

- **Existing data**: No `promoted-tests.json` exists yet. First run of promote-agent after this change will create it. Previously promoted tests (from before this feature) have no registry entries — `--rebuild` reconstructs them from annotation headers.
- **Existing promote-agent behavior**: Current promote-agent does NOT write section markers. After this change, new promotions will have markers; old ones will not. Health check handles both cases: for entries with `sectionMarkers: false`, it checks the whole file; for `sectionMarkers: true`, it checks within markers.
- **Existing code-agent behavior**: Feature mode step 6 currently says "Run tests to verify implementation." This changes to "Run ALL existing tests to verify no regression." Backward compatible — running more tests is strictly safer.
- **Existing df-orchestrate**: Gains a new pre-flight check. Existing `--force` flag is unrelated (cross-group guard). New `--skip-tests` flag is additive.
- **Existing df-cleanup**: Gains a new section (step 2.5) between "Read Manifest" and "Identify Issues." Existing behavior unchanged.
- **Existing onboard-agent**: Gains a new Phase (after Phase 7, before Phase 8). Existing behavior unchanged.
- **Existing bin/cli.js**: Gains `--hooks` flag on `init` command. Existing behavior unchanged when flag is absent.
- **Rollback plan**: Remove the new sections from each file. `promoted-tests.json` can be deleted without affecting any other functionality (it's purely additive). No data migration needed.
- **Zero-downtime**: N/A — Dark Factory is not a running service.
- **Deployment order**: No ordering constraint. All changes are additive.
- **Stale data/cache**: N/A — no caching in Dark Factory.

## API Endpoints

N/A — Dark Factory is a prompt engineering framework. Changes are to agent/skill markdown files and the CLI script.

## Business Rules

- BR-1: The pre-flight test gate runs BEFORE architect review, not after — catching failures early prevents wasted architect and code-agent time.
- BR-2: `--skip-tests` MUST be logged in the manifest — team visibility into when the safety net was bypassed. This is an audit trail, not a punishment.
- BR-3: The promoted test registry is append-only during normal operation — entries are never removed by promote-agent. Only `--rebuild` replaces the entire registry (atomic overwrite).
- BR-4: Health check reports ALL issues, then asks the developer what to do — it does not auto-fix. Missing tests, skipped tests, and failing tests require human judgment.
- BR-5: Section markers (`DF-PROMOTED-START/END`) are only used for co-located tests. Standalone promoted test files do not need them (the entire file is the promoted test).
- BR-6: Pre-commit hook installation is opt-in during onboard AND independently installable via `bin/cli.js init --hooks` — two entry points, same outcome.
- BR-7: When existing hook infrastructure is detected (husky, lefthook, simple-git-hooks), the hook MUST integrate with it (e.g., add to `.husky/pre-commit` or `lefthook.yml`) rather than writing `.git/hooks/pre-commit` directly — overwriting managed hooks breaks the developer's existing setup.
- BR-8: The `--rebuild` command reads annotation headers (`// Promoted from Dark Factory holdout: {name}`) and reconstructs registry entries. Fields that cannot be derived from annotations (like `holdoutScenarioCount`) are set to `null` in rebuilt entries.
- BR-9: Health check handles zero promoted tests gracefully — "No promoted tests found. Run /df-orchestrate to promote tests." Not an error.
- BR-10: The pre-flight test gate extracts the test command from the project profile's `Testing > Run:` field. If the field is missing or the profile does not exist, warn the developer and skip the gate — do NOT block implementation when there is no test command to run.
- BR-11: Health check verifies `// Guards:` annotations by checking that each referenced file path still exists. It does NOT check line numbers (lines shift constantly). Missing files are flagged as "guard target missing — annotation may be stale."

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| Pre-flight tests fail | Report all failures clearly, STOP — do NOT proceed to architect review | None |
| `--skip-tests` used | Log warning, record `testGateSkipped: true` in manifest, proceed | Manifest updated |
| `promoted-tests.json` does not exist when promote-agent runs | Create it with `version: 1` and empty `promotedTests` array, then append | File created |
| `promoted-tests.json` is malformed JSON | Warn developer, offer `--rebuild` to reconstruct from annotations | None (no auto-fix) |
| `promoted-tests.json` does not exist when health check runs | Report "No promoted test registry found. No promoted tests to check." | None |
| Health check: promoted test file missing | Report "MISSING: {path} (promoted from {feature})" | None |
| Health check: `.skip()` detected | Report "SKIPPED: {path} contains .skip() on promoted tests" | None |
| Health check: test fails | Report "FAILING: {path} — {failure output}" | None |
| Health check: guard target file missing | Report "STALE GUARD: {path} references {guard-file} which no longer exists" | None |
| `--rebuild`: no annotation headers found | Report "No promoted test annotations found in codebase. Registry will be empty." Create empty registry. | Registry reset to empty |
| Hook install: husky detected | Add test command to `.husky/pre-commit` | Hook file modified |
| Hook install: lefthook detected | Add test command to `lefthook.yml` under `pre-commit > commands` | Config file modified |
| Hook install: simple-git-hooks detected | Add test command to `package.json` under `simple-git-hooks.pre-commit` | package.json modified |
| Hook install: no infrastructure detected | Write `.git/hooks/pre-commit` directly, make executable | Hook file created |
| Hook install: `.git/hooks/pre-commit` already exists (unmanaged) | Warn developer, show existing content, ask before overwriting | None until confirmed |
| Project profile missing test command | Warn "No test command found in project profile. Skipping pre-flight test gate." | None |
| Code-agent: all tests fail after implementation | Report failures — same as current behavior, but now includes pre-existing tests too | None |

## Acceptance Criteria

- [ ] AC-1: Running `/df-orchestrate my-feature` executes the full project test suite before architect review. If tests fail, implementation does not start.
- [ ] AC-2: Running `/df-orchestrate my-feature --skip-tests` skips the test gate and records `testGateSkipped: true` in the manifest.
- [ ] AC-3: After successful promotion, `dark-factory/promoted-tests.json` contains an entry with the feature name, file paths, timestamp, and scenario count.
- [ ] AC-4: For co-located promotions, promoted test blocks are wrapped with `// DF-PROMOTED-START: {name}` and `// DF-PROMOTED-END: {name}`.
- [ ] AC-5: Running `/df-cleanup` reports missing, skipped, failing, or stale promoted tests.
- [ ] AC-6: Running `/df-cleanup --rebuild` reconstructs the registry from annotation headers in the codebase.
- [ ] AC-7: code-agent in feature mode runs ALL existing tests after implementation, not just newly written ones.
- [ ] AC-8: `/df-onboard` offers to install a pre-commit hook that runs the project's test command.
- [ ] AC-9: `npx dark-factory init --hooks` installs the pre-commit hook without running onboard.
- [ ] AC-10: Hook installation detects husky/lefthook/simple-git-hooks and integrates rather than overwrites.
- [ ] AC-11: `promoted-tests.json` is NOT in `.gitignore`.
- [ ] AC-12: Health check with zero promoted tests reports gracefully, not errors.
- [ ] AC-13: Plugin mirrors for all modified agents/skills match their source files.

## Edge Cases

- EC-1: **No project profile exists** — pre-flight gate warns and skips (does not block). Code-agent falls back to whatever test command it can find.
- EC-2: **Project profile exists but has no test command** — same as EC-1, warn and skip.
- EC-3: **promoted-tests.json already exists when promote-agent runs** — read existing, append new entry, write back. Do NOT overwrite.
- EC-4: **Same feature promoted twice** (re-run after failure) — promote-agent should overwrite the existing entry for that feature name, not create a duplicate.
- EC-5: **Co-located test file deleted** — health check reports MISSING. Section markers are irrelevant because the file is gone.
- EC-6: **Section markers present but content between them is empty** — health check reports "EMPTY: {path} section for {feature} has no test content."
- EC-7: **`.skip()` inside non-promoted tests in same file** — health check only flags `.skip()` within section markers (for co-located) or in the entire file (for standalone promoted files). Does NOT scan the whole codebase for `.skip()`.
- EC-8: **`--rebuild` finds annotations but promoted-tests.json has different entries** — `--rebuild` does atomic overwrite. Old entries not found in codebase are dropped. New ones found in codebase are added. Developer is shown the diff before confirming.
- EC-9: **Multiple promoted test files for a single feature** (unit + e2e) — registry entry has `files` as an array, supporting multiple paths per feature.
- EC-10: **Test gate fails on first spec in a multi-spec orchestration** — fail fast: abort ALL specs, not just the failing one. The test suite is shared.
- EC-11: **Pre-commit hook already installed by Dark Factory** — detect by looking for `# dark-factory-hook` comment marker. Skip re-installation.
- EC-12: **Registry version mismatch** — if `version` field is higher than what the current code understands, warn "Registry version {n} is newer than supported (1). Some fields may be ignored." Do NOT error out.
- EC-13: **Guards annotation references file with colon-separated line number** (e.g., `src/auth.js:42`) — health check strips the line number portion and checks only the file path.

## Dependencies

### Files modified by this spec

1. `.claude/skills/df-orchestrate/SKILL.md` — Add pre-flight test gate, `--skip-tests` flag
2. `.claude/agents/promote-agent.md` — Write to registry after promotion, add section markers
3. `.claude/agents/code-agent.md` — Feature mode: run ALL tests
4. `.claude/skills/df-cleanup/SKILL.md` — Add promoted test health check
5. `.claude/agents/onboard-agent.md` — Add optional git hook setup phase
6. `bin/cli.js` — Add `--hooks` flag to init command
7. `tests/dark-factory-setup.test.js` — Assert registry, test gate, health check, hook integration
8. `plugins/dark-factory/skills/df-orchestrate/SKILL.md` — Mirror of source
9. `plugins/dark-factory/agents/promote-agent.md` — Mirror of source
10. `plugins/dark-factory/agents/code-agent.md` — Mirror of source
11. `plugins/dark-factory/skills/df-cleanup/SKILL.md` — Mirror of source
12. `plugins/dark-factory/agents/onboard-agent.md` — Mirror of source
13. `.claude/rules/dark-factory.md` — Document health check in df-cleanup description
14. `plugins/dark-factory/.claude/rules/dark-factory.md` — Mirror of rules

### Cross-feature impact

- **df-orchestrate**: Existing pre-flight checks (steps 1-7) are unaffected. New test gate inserts between current pre-flight checks and architect review. The `--skip-tests` flag is new and does not conflict with `--force`, `--group`, or `--all`.
- **promote-agent**: Currently has 6 steps. Registry write becomes Step 7. Section markers modify Step 5 (Place Tests) for co-located case only.
- **code-agent**: Only the feature mode step 6 text changes. Bugfix mode is already correct.
- **df-cleanup**: New health check section runs before existing issue identification. Does not interfere with stuck-state recovery.
- **onboard-agent**: New phase (hook setup) is the last phase before profile writing. Does not affect any existing phases.
- **Existing tests**: 113 existing tests in `dark-factory-setup.test.js` are unaffected. New tests are additive.
- **Plugin mirrors**: Tests already enforce source-plugin equality for df-orchestrate, df-intake, and dark-factory.md. New mirror tests needed for promote-agent, code-agent, df-cleanup, and onboard-agent.

## Implementation Size Estimate

- **Scope size**: large (14 files — 7 source + 7 plugin mirrors, plus tests and rules)
- **Estimated file count**: 14
- **Suggested parallel tracks**: 2 code-agents

  **Track 1: Agent and skill markdown changes**
  - `.claude/skills/df-orchestrate/SKILL.md` + plugin mirror
  - `.claude/agents/promote-agent.md` + plugin mirror
  - `.claude/agents/code-agent.md` + plugin mirror
  - `.claude/skills/df-cleanup/SKILL.md` + plugin mirror
  - `.claude/agents/onboard-agent.md` + plugin mirror
  - `.claude/rules/dark-factory.md` + plugin mirror

  **Track 2: CLI and tests**
  - `bin/cli.js` (add `--hooks` flag)
  - `tests/dark-factory-setup.test.js` (add new test suites)

  Zero file overlap between tracks. Track 2 depends on Track 1 (tests assert content of agent files), so these should run sequentially: Track 1 first, then Track 2.

## Implementation Notes

### Patterns to follow

- **Agent/skill edits are markdown text changes** — this project's "code" is prompt engineering. Follow the existing section/subsection structure (e.g., `### Step N:` numbered steps in df-orchestrate).
- **Tests are string-match assertions** — all existing tests use `content.includes()` or `assert.match()` to verify that required phrases exist in agent/skill files. Follow this pattern exactly.
- **Plugin mirrors must be byte-identical** — existing test in suite 12 (`assert.equal(source, plugin)`) enforces this. After editing any source file, copy it to the corresponding `plugins/dark-factory/` path.
- **CLI uses CommonJS** — `bin/cli.js` uses `require()`, `fs`, `path`. No ES modules, no dependencies.
- **Frontmatter must be preserved** — every agent `.md` starts with `---` YAML frontmatter. Do not change the `name`, `description`, or `tools` fields unless the spec explicitly requires it (this spec does not).

### Specific guidance per file

1. **df-orchestrate SKILL.md**: Insert new "Pre-flight Test Gate" section after the existing "Pre-flight Checks" section (after step 7) and before "Smart Re-run Detection." Add `--skip-tests` to the Trigger section's optional flags. Add parsing for `--skip-tests` in "Argument Parsing."
2. **promote-agent.md**: Add Step 7 "Update Registry" after Step 6 "Verify." In Step 5 "Place Tests," add section marker wrapping logic for co-located tests only.
3. **code-agent.md**: In Feature Mode, change step 6 from "Run tests to verify implementation" to "Run ALL existing tests to verify no regression" — mirror the bugfix mode wording.
4. **df-cleanup SKILL.md**: Add new section "### 2.5. Promoted Test Health Check" between "Read Manifest" and "Identify Issues." Add `--rebuild` flag handling.
5. **onboard-agent.md**: Add "Phase 7.5: Optional Git Hook Setup" between Phase 7 and Phase 8. Add to constraints that it may write `.git/hooks/pre-commit` or modify hook config files.
6. **bin/cli.js**: Add `--hooks` flag parsing in `main()`. Create `cmdInitHooks(targetDir)` function. When `init --hooks` is used, run ONLY the hook installation (not full init). When `init` is used without `--hooks`, do NOT install hooks (existing behavior preserved).
7. **dark-factory.md rules**: Update df-cleanup description to mention "health check for promoted tests."
8. **tests**: Add new `describe` suites: "Pre-flight test gate," "Promoted test registry," "Promoted test health check," "Git hook integration," and "Plugin mirrors for test-enforcement." Follow the existing test naming pattern (e.g., `it("df-orchestrate includes pre-flight test gate", () => { ... })`).

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01, P-02, H-01 |
| FR-2 | P-03, H-02 |
| FR-3 | P-04, P-05, H-03 |
| FR-4 | P-06, H-04 |
| FR-5 | P-07, P-08, P-09, P-10, H-05, H-06, H-07, H-08 |
| FR-6 | P-11, H-09, H-10 |
| FR-7 | P-12, H-11 |
| FR-8 | P-13, H-12 |
| FR-9 | P-14, H-13, H-14, H-15 |
| FR-10 | P-15, H-16 |
| BR-1 | P-01 |
| BR-2 | P-03 |
| BR-3 | P-04, H-03 |
| BR-4 | P-07, P-08, P-09, P-10 |
| BR-5 | P-06, H-04 |
| BR-6 | P-13, P-15 |
| BR-7 | P-14, H-13, H-14, H-15 |
| BR-8 | P-11, H-09, H-10 |
| BR-9 | P-16, H-17 |
| BR-10 | P-17, H-18 |
| BR-11 | P-10, H-08 |
| EC-1 | P-17, H-18 |
| EC-2 | P-17, H-18 |
| EC-3 | P-05, H-03 |
| EC-4 | H-19 |
| EC-5 | H-05 |
| EC-6 | H-06 |
| EC-7 | H-07 |
| EC-8 | H-10 |
| EC-9 | P-05 |
| EC-10 | H-01 |
| EC-11 | H-16 |
| EC-12 | H-20 |
| EC-13 | H-08 |
