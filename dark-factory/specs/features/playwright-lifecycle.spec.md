# Feature: playwright-lifecycle

## Context

Dark Factory added Playwright E2E support across the test-agent and promote-agent, but the lifecycle management has gaps. The promote-agent records test entries in `promoted-tests.json` but does not distinguish unit tests from E2E tests at the file level. The df-cleanup skill runs a single test command for all promoted tests, but Playwright E2E tests require `npx playwright test` instead of the project's unit test runner. Without differentiation, E2E promoted tests either get skipped during health checks or fail because the wrong runner is used.

Additionally, zero structural tests cover any of the Playwright-related logic across agents. The existing test-agent Playwright detection, promote-agent E2E adaptation, and future df-cleanup E2E awareness could all regress silently.

## Scope

### In Scope (this spec)

1. **promote-agent: file-level `testType` field** -- Add a `testType` field (`"unit"` or `"e2e"`) to each entry in the `files` array of `promoted-tests.json`. The promote-agent instructions must specify that E2E test files get `"testType": "e2e"` and unit test files get `"testType": "unit"`.
2. **df-cleanup: E2E-aware health check** -- Update Step 2c.4 (test execution) to partition promoted test files by `testType`. Run unit tests with the project's test command and E2E tests with `npx playwright test`. Handle entries without a `testType` field gracefully (default to `"unit"` for backward compatibility).
3. **Structural tests** -- Add test assertions in `tests/dark-factory-setup.test.js` verifying Playwright-related content across all agents:
   - test-agent: Playwright detection, classification by test type, E2E writing, E2E running, backend-only exclusion, dev server management, retry/flakiness
   - promote-agent: E2E adaptation section, `testType` field in registry schema
   - df-cleanup: E2E-aware health check (partitioned test execution)
   - onboard-agent: E2E test type detection in testing section
4. **Plugin mirrors** -- Both promote-agent and df-cleanup changes must be mirrored to `plugins/dark-factory/`.

### Out of Scope (explicitly deferred)

- **Playwright installation orchestration** -- The test-agent already handles prompting for Playwright installation. No changes needed here.
- **E2E test writing logic in test-agent** -- Already implemented in the test-agent. This spec only adds structural tests to guard it.
- **onboard-agent UI layer detection** -- Covered by `playwright-onboard` spec. This spec only adds structural tests asserting the onboard-agent mentions E2E test type detection.
- **test-agent Playwright hardening** -- Covered by `playwright-test-hardening` spec. This spec only adds structural tests asserting existing content.
- **Migration of existing promoted-tests.json entries** -- Existing entries without `testType` are handled via backward-compatible default (`"unit"`). No data migration needed.

### Scaling Path

The `testType` field at the file level is extensible. If future test types emerge (e.g., `"integration"`, `"visual-regression"`), df-cleanup can add new runner mappings without schema changes. The partitioned execution pattern generalizes naturally.

## Requirements

### Functional

- FR-1: promote-agent MUST include `"testType": "unit"` or `"testType": "e2e"` in each file entry in the `files` array of the registry entry -- enables df-cleanup to select the correct runner.
- FR-2: df-cleanup Step 2c.4 MUST partition promoted test files by `testType` and run E2E files with `npx playwright test {path}` separately from unit tests -- prevents runner mismatch failures.
- FR-3: df-cleanup MUST treat files with no `testType` field as `"unit"` -- backward compatibility with existing promoted-tests.json entries.
- FR-4: Structural tests MUST verify test-agent contains Playwright detection logic (checking for `@playwright/test`, `playwright.config`, E2E patterns) -- guards against regression.
- FR-5: Structural tests MUST verify test-agent contains backend-only exclusion logic -- guards against regression.
- FR-6: Structural tests MUST verify test-agent contains dev server management logic -- guards against regression.
- FR-7: Structural tests MUST verify test-agent contains retry/flakiness handling -- guards against regression.
- FR-8: Structural tests MUST verify promote-agent contains E2E adaptation section and `testType` in registry schema -- guards against regression.
- FR-9: Structural tests MUST verify df-cleanup contains E2E-aware health check with partitioned execution -- guards against regression.
- FR-10: Structural tests MUST verify onboard-agent mentions E2E test type detection -- guards against regression.
- FR-11: Plugin mirrors for promote-agent.md and df-cleanup SKILL.md MUST match source files -- enforced by existing mirror test pattern plus new mirror tests for these specific files.

### Non-Functional

- NFR-1: No new npm dependencies -- structural tests use only `node:test` and `node:assert/strict`.
- NFR-2: All new tests must pass with `node --test tests/` -- consistent with existing test runner.

## Data Model

### promoted-tests.json schema change

**Current** file entry schema (inside `files` array):
```json
{
  "path": "tests/dark-factory-setup.test.js",
  "colocated": true,
  "startMarker": "// DF-PROMOTED-START: {name}",
  "endMarker": "// DF-PROMOTED-END: {name}"
}
```

**New** file entry schema (added field):
```json
{
  "path": "tests/dark-factory-setup.test.js",
  "testType": "unit",
  "colocated": true,
  "startMarker": "// DF-PROMOTED-START: {name}",
  "endMarker": "// DF-PROMOTED-END: {name}"
}
```

The `testType` field is OPTIONAL for backward compatibility. Valid values: `"unit"`, `"e2e"`. Default when absent: `"unit"`.

## Migration & Deployment

N/A in the traditional sense -- this is a prompt engineering framework, not a running service. However:

- **Existing promoted-tests.json entries**: The two existing entries (`adaptive-lead-count`, `token-measurement`) lack `testType`. FR-3 ensures df-cleanup defaults these to `"unit"`, so no migration is needed.
- **Rollback**: Reverting the promote-agent and df-cleanup changes is safe -- old entries without `testType` continue to work with the default. New entries with `testType` are simply ignored by the old df-cleanup (it doesn't read the field).
- **Deployment order**: No ordering constraint. The promote-agent change and df-cleanup change are independently safe.

## Business Rules

- BR-1: The `testType` field belongs on each FILE entry, not on the top-level registry entry -- a single feature promotion may include both unit and E2E files.
- BR-2: df-cleanup MUST NOT fail or skip the health check if `testType` is absent from a file entry -- backward compatibility is mandatory.
- BR-3: Structural tests MUST use string-matching against agent/skill content (consistent with existing 331 tests) -- no mocking, no agent execution.
- BR-4: Each structural test suite for a specific agent must be in its own `describe` block with a descriptive name following the pattern `"playwright-lifecycle -- {agent-name} Playwright {aspect}"`.

## Error Handling

| Scenario | Expected Behavior | Side Effects |
|----------|-------------------|--------------|
| `testType` field missing from file entry | df-cleanup defaults to `"unit"` | None -- silent fallback |
| `testType` has unknown value (not `"unit"` or `"e2e"`) | df-cleanup warns and defaults to `"unit"` | Warning in output |
| Playwright not installed when running E2E health check | df-cleanup reports: "PLAYWRIGHT_MISSING: {path} requires Playwright but `npx playwright test` is not available" | Continues checking other tests |
| E2E test file exists but Playwright test fails | df-cleanup reports: "FAILING: {path}" with failure output | Continues checking other tests |

## Acceptance Criteria

- [ ] AC-1: promote-agent.md includes `"testType"` field in the registry entry JSON example within the `files` array
- [ ] AC-2: promote-agent.md instructs the agent to set `"testType": "e2e"` for Playwright test files and `"testType": "unit"` for unit test files
- [ ] AC-3: df-cleanup SKILL.md Step 2c.4 describes partitioned test execution by `testType`
- [ ] AC-4: df-cleanup SKILL.md handles missing `testType` by defaulting to `"unit"`
- [ ] AC-5: df-cleanup SKILL.md handles E2E tests with `npx playwright test {path}`
- [ ] AC-6: Structural tests exist for test-agent Playwright detection (at least 3 assertions)
- [ ] AC-7: Structural tests exist for test-agent backend-only exclusion
- [ ] AC-8: Structural tests exist for test-agent dev server management
- [ ] AC-9: Structural tests exist for test-agent retry/flakiness handling
- [ ] AC-10: Structural tests exist for promote-agent E2E adaptation and testType tracking
- [ ] AC-11: Structural tests exist for df-cleanup E2E-aware health check
- [ ] AC-12: Structural tests exist for onboard-agent E2E test type detection
- [ ] AC-13: Plugin mirror for promote-agent.md matches source
- [ ] AC-14: Plugin mirror for df-cleanup SKILL.md matches source
- [ ] AC-15: All tests pass with `node --test tests/`

## Edge Cases

- EC-1: Promoted entry has `files` array with mixed types (one unit, one E2E) -- df-cleanup must run each with correct runner, not batch them together.
- EC-2: `testType` field present but set to empty string -- df-cleanup should treat as `"unit"` (same as absent).
- EC-3: All files in an entry are E2E (no unit tests) -- df-cleanup must not attempt to run a unit test command with zero files.
- EC-4: Existing promoted-tests.json has entries from before this feature (no `testType` on any file) -- all should run as unit tests with no errors.

## Dependencies

- **Depends on**: `playwright-onboard`, `playwright-test-hardening` -- the structural tests verify content that those specs add to onboard-agent, test-agent respectively. This spec's structural tests for those agents will fail until those specs are implemented.
- **Depended on by**: None
- **Group**: playwright-e2e

## Implementation Size Estimate

- **Scope size**: small (3-4 files modified, plus plugin mirrors)
- **Suggested parallel tracks**: 1 code-agent
  - Track 1: All changes -- promote-agent.md `testType` field, df-cleanup SKILL.md E2E partitioning, structural tests in `dark-factory-setup.test.js`, plugin mirrors. The changes are small and tightly coupled (the tests verify the agent/skill content), so splitting would create unnecessary coordination overhead.

## Implementation Notes

### promote-agent.md changes

In Step 7 (Update Registry), the JSON example for the `files` array entry needs `"testType"` added. Also add an instruction paragraph after the JSON example:

> Set `"testType": "e2e"` for Playwright E2E test files (those placed in E2E directories or with `.e2e.spec.` in the filename). Set `"testType": "unit"` for all other test files. The `testType` field is per-file, not per-entry, because a single feature may promote both unit and E2E tests.

### df-cleanup SKILL.md changes

In Step 2c, item 4 (Test execution), replace the single test command with partitioned execution:

> **4. Test execution**: Partition promoted test files by `testType` field (default `"unit"` if absent or empty).
>   - **Unit tests**: Run with the project's test command (e.g., `node --test {paths}`).
>   - **E2E tests**: Run with `npx playwright test {paths}`. If Playwright is not available, report: "PLAYWRIGHT_MISSING: {path} requires Playwright but npx playwright test is not available" and continue.
>   - Run each partition separately. Report failures per file as before.

### Structural tests

Follow the existing pattern in `dark-factory-setup.test.js`:
- Use `readAgent("test-agent")` and check `.includes()` for specific strings
- Use `readAgent("promote-agent")` and check for `testType` in registry docs
- Use `readSkill("df-cleanup")` and check for E2E partitioning language
- Use `readAgent("onboard-agent")` and check for E2E detection mention
- Group under `describe("playwright-lifecycle -- ...")` blocks
- Place at the end of the file, before any DF-PROMOTED section markers (or after the last promoted block)

### Plugin mirrors

After modifying `.claude/agents/promote-agent.md`, copy the exact content to `plugins/dark-factory/agents/promote-agent.md`. Same for `.claude/skills/df-cleanup/SKILL.md` to `plugins/dark-factory/skills/df-cleanup/SKILL.md`. Existing mirror consistency tests will catch mismatches.

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01, P-02 |
| FR-2 | P-03, P-04, H-05 |
| FR-3 | P-05, H-01 |
| FR-4 | P-06 |
| FR-5 | P-07 |
| FR-6 | P-08 |
| FR-7 | P-09 |
| FR-8 | P-10 |
| FR-9 | P-11 |
| FR-10 | P-12 |
| FR-11 | P-13 |
| BR-1 | P-01, H-05 |
| BR-2 | P-05, H-01 |
| BR-3 | P-06, P-07, P-08, P-09, P-10, P-11, P-12 |
| BR-4 | P-06 |
| EC-1 | H-05 |
| EC-2 | H-02 |
| EC-3 | H-03 |
| EC-4 | H-01 |
| EH-1 (unknown testType) | H-04 |
| EH-2 (Playwright missing) | H-06 |
