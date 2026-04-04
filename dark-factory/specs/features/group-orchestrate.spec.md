# Feature: group-orchestrate

## Context

When `/df-intake` decomposes a large feature into multiple sub-specs with dependency ordering, the developer must currently list every sub-spec name explicitly: `/df-orchestrate spec-a spec-b spec-c spec-d`. This is tedious and error-prone -- the developer must remember every sub-spec name, get the order right, and manually re-invoke the command after partial failures. There is no way to say "orchestrate everything in the auth-redesign group" or "run all pending specs."

Additionally, when a developer accidentally mixes specs from different groups in explicit mode, nothing warns them that cross-group execution may produce unexpected results (different architectural contexts, unrelated dependency chains).

**Business value**: Reduces friction for multi-spec features from "remember and type every name" to `--group auth-redesign` or `--all`. Enables safe resume after partial failures without re-specifying completed work. Guards against accidental cross-group orchestration.

## Scope

### In Scope (this spec)
- `--group X` flag: query manifest, resolve dependency waves, execute pending specs in order
- `--all` flag: find all active specs, group by `group` field, run independent groups in parallel with intra-group dependency ordering
- Cross-group guard for explicit mode (warn + require `--force`)
- Resume semantics: filter out completed specs, show them as "already completed"
- Failure handling within groups: pause failed spec + dependents, continue independent specs, ask developer
- Manifest field enforcement: `/df-intake` always writes `group` and `dependencies`
- Argument parsing: mutual exclusivity, exact match, helpful error messages
- Pre-flight validation: dependency references exist, no circular dependencies, dependencies in same group
- Intake integration: check existing active specs for dependency overlap when creating new specs

### Out of Scope (explicitly deferred)
- Cross-group dependencies (all dependencies must be within the same group)
- Group management commands (list groups, rename groups, merge groups)
- Automatic retry of failed specs (developer must decide)
- Priority ordering within a wave (all specs in a wave are equal)
- Group-level architect review (each spec still gets its own review)
- Manifest migration tooling for old entries missing group/dependencies fields (backward compat handles this silently)

### Scaling Path
- If cross-group dependencies become needed, the wave resolver can be extended to build a global dependency graph across groups. The current same-group constraint simplifies the initial implementation.
- Group management commands (`/df-groups list`, `/df-groups rename`) could be added if developers accumulate many groups.

## Requirements

### Functional

- FR-1: **`--group X` mode** -- When invoked as `/df-orchestrate --group X`, read `dark-factory/manifest.json`, find all entries where `group == X` and `status == "active"`, resolve their `dependencies` into execution waves, present the plan (showing completed specs as skipped), and execute pending specs in wave order. Rationale: primary UX for multi-spec features.

- FR-2: **`--all` mode** -- When invoked as `/df-orchestrate --all`, find every `status: "active"` entry in the manifest. Group by `group` field (entries with `group: null` are standalone). Run independent groups in parallel. Within each group, respect dependency order via waves. Independent groups run at wave-level parallelism (e.g., group A wave 1 and group B wave 1 can run simultaneously). Rationale: resume-all for developers managing multiple features.

- FR-3: **Cross-group guard** -- When explicit spec names are provided (`/df-orchestrate spec-a spec-b`) and the specs belong to different groups, warn the developer and require `--force` to proceed. Single-spec explicit mode never triggers the guard. `--force` is only meaningful for explicit mode; warn if used with `--group` or `--all`. Rationale: prevents accidental mixing of unrelated dependency contexts.

- FR-4: **Resume semantics** -- Both `--group` and `--all` filter out specs where `status != "active"`. Completed specs are shown as "already completed (skipped)" in the execution plan. Re-running after partial failure picks up remaining active specs. A dependency on a spec that has been removed from the manifest (completed + cleaned up) is treated as satisfied. A dependency on a spec with `status: "active"` means it must wait for that spec to complete in the current run. Rationale: natural resume behavior without manual bookkeeping.

- FR-5: **Failure handling within groups** -- If a spec fails (architect blocks it or implementation fails after 3 rounds), pause that spec and mark all its transitive dependents as blocked. Continue executing independent specs in the same group that do not depend on the failed spec. After all executable specs complete, report what failed and what was blocked, and ask the developer to decide next steps. Rationale: maximizes progress despite failures.

- FR-6: **Manifest field enforcement in intake** -- `/df-intake` must ALWAYS write `group` (null for single/standalone specs) and `dependencies` (empty array for independent specs) to every manifest entry. Rationale: ensures orchestrator can always rely on these fields.

- FR-7: **Backward compatibility for missing fields** -- The orchestrator treats a missing `group` field as `null` and a missing `dependencies` field as `[]`. Rationale: existing manifest entries (like `pipeline-velocity` which lacks these fields) must not break.

- FR-8: **Argument parsing** -- `--group` takes exactly one argument (exact match on group name, not substring). `--all` takes no arguments. `--group` and `--all` are mutually exclusive. `--group`/`--all` and explicit spec names are mutually exclusive. On invalid combinations, report a clear error. If `--group X` finds no matching group, error with a list of available groups. Rationale: unambiguous CLI semantics.

- FR-9: **Pre-flight validation** -- Before executing any specs, validate: (a) all dependency references point to specs that exist in the manifest or have been removed (satisfied), (b) no circular dependencies exist within the group, (c) all dependencies are within the same group. Report all violations before starting. Rationale: fail fast with actionable errors.

- FR-10: **Wave resolution algorithm** -- Build a directed acyclic graph from `dependencies` fields. Topologically sort into waves where wave N contains specs whose dependencies are all in waves < N or satisfied (removed from manifest). Present waves to developer before execution. Rationale: deterministic, predictable execution ordering.

- FR-11: **Intake dependency detection** -- During `/df-intake`, when creating new specs, check the manifest for existing active specs. Analyze file overlap between the new spec and existing active specs. If overlap is detected, write the existing spec as a dependency. Only mark as independent if truly independent. Rationale: prevents undeclared dependencies from causing implementation conflicts.

- FR-12: **Execution plan display** -- Before executing, show the developer a clear plan including: group name(s), wave breakdown, which specs are already completed (skipped), which specs will run, and dependency relationships. Wait for developer confirmation before proceeding. Rationale: transparency and developer control.

### Non-Functional

- NFR-1: **No new dependencies** -- All changes use only existing tools and patterns (markdown prompt files, JSON manifest). Rationale: zero-dependency project constraint.

- NFR-2: **Backward compatibility** -- Existing `/df-orchestrate spec-a spec-b` explicit mode continues to work unchanged. The only new behavior in explicit mode is the cross-group guard. Rationale: no breaking changes for current workflows.

- NFR-3: **Deterministic wave ordering** -- Given the same manifest state, the wave resolution must produce the same execution plan every time. Rationale: predictability for developers and debuggability.

## Data Model

### Manifest Schema (no structural changes)

The manifest already supports `group` and `dependencies` fields (added in the intake spec template). This feature enforces their presence and adds orchestrator logic to consume them.

Existing fields used:
```json
{
  "features": {
    "example-spec": {
      "type": "feature",
      "status": "active",
      "specPath": "dark-factory/specs/features/example-spec.spec.md",
      "created": "2026-04-03T00:00:00.000Z",
      "rounds": 0,
      "group": "parent-feature-name",
      "dependencies": ["foundation-spec"]
    }
  }
}
```

- `group`: string or null. Null means standalone (no group).
- `dependencies`: array of spec name strings. Empty array means no dependencies.
- `status`: "active" | "passed" | "promoted". Only "active" specs are candidates for execution.

No new fields are added to the manifest schema.

## Migration & Deployment

**Existing manifest entries**: The `pipeline-velocity` entry in the current manifest lacks `group` and `dependencies` fields. The orchestrator treats missing `group` as `null` and missing `dependencies` as `[]` (FR-7). No migration needed -- backward compatibility handles this at read time.

**Deployment order**: This spec modifies df-orchestrate SKILL.md (which pipeline-velocity also modifies). Per developer decision, this spec is sequenced AFTER pipeline-velocity. The two specs modify different sections of df-orchestrate SKILL.md:
- pipeline-velocity: replaces the Architect Review section and adds findings forwarding to code-agent steps
- group-orchestrate: adds new sections (Trigger/argument parsing, Group Mode, All Mode, Cross-group guard, Resume, Failure handling) and modifies Pre-flight Checks

**Stale data/cache**: N/A -- no cached values or derived data affected.

**Rollback plan**: All changes are to markdown prompt files and a JSON manifest. Reverting the git commit fully restores previous behavior.

## API Endpoints

N/A -- This feature modifies agent/skill definitions (markdown prompt files) and test assertions. There are no HTTP APIs.

## Business Rules

- BR-1: **Group exact match** -- `--group` uses exact string equality on the `group` field. No substring matching, no case-insensitive matching. Rationale: groups are programmatically set by intake, not typed by developers, so exact match is sufficient and unambiguous.

- BR-2: **Null group means standalone** -- Specs with `group: null` (or missing group field) are treated as standalone. In `--all` mode, each standalone spec is its own independent unit (no wave ordering needed). In `--group` mode, standalone specs are never included. Rationale: standalone specs have no group context to query.

- BR-3: **Satisfied dependency = removed from manifest** -- If a dependency spec name does not exist in the manifest at all, the dependency is considered satisfied (the spec completed its full lifecycle and was cleaned up). If a dependency exists with `status: "active"`, it must be executed first. Rationale: the manifest removes entries after promotion + cleanup, so absence = completion.

- BR-4: **Cross-group guard only in explicit mode** -- The cross-group guard (`--force` required) only applies when the developer explicitly names specs. `--group` and `--all` are inherently group-aware and do not need the guard. Rationale: `--group` and `--all` already handle grouping correctly by definition.

- BR-5: **Failure isolation within group** -- When a spec fails, only its transitive dependents are paused. Specs in the same group that do not depend (directly or transitively) on the failed spec continue execution. Rationale: maximize progress despite failures.

- BR-6: **Circular dependency is a hard error** -- If the dependency graph contains a cycle, abort with a clear error listing the cycle path. Do not attempt to break cycles. Rationale: cycles indicate a spec decomposition error that the developer must fix.

- BR-7: **Cross-group dependency is a pre-flight error** -- If spec A depends on spec B and they are in different groups, abort with an error. Dependencies must be within the same group. Rationale: cross-group dependencies would require a global dependency resolver, which is out of scope.

- BR-8: **`--force` only meaningful for explicit mode** -- If `--force` is used with `--group` or `--all`, warn the developer that `--force` has no effect in these modes (it is not an error, just a warning). Rationale: `--force` exists specifically to override the cross-group guard, which only applies in explicit mode.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| `--group` and `--all` used together | Error: "Cannot use --group and --all together. Use --group to orchestrate a specific group, or --all to run everything." | None |
| `--group`/`--all` with explicit spec names | Error: "Cannot combine --group/--all with explicit spec names. Use one mode at a time." | None |
| `--group X` where X does not match any group | Error: "No group named 'X' found. Available groups: [list]" | None |
| `--group X` where all specs in group are completed | Info: "All specs in group 'X' are already completed. Nothing to do." | None |
| Circular dependency detected | Error: "Circular dependency detected: spec-a -> spec-b -> spec-c -> spec-a. Fix the dependency declarations in the manifest." | None |
| Cross-group dependency detected | Error: "spec-a (group: auth) depends on spec-b (group: payments). Dependencies must be within the same group." | None |
| Dependency references non-existent spec still in manifest | Treated as satisfied (removed = completed). Not an error. | None |
| Explicit mode with cross-group specs, no --force | Warning: "Specs belong to different groups: spec-a (auth), spec-b (payments). Use --force to proceed anyway." Then stop. | None |
| Spec fails during execution (architect BLOCKED or 3 rounds failed) | Pause spec + transitive dependents. Continue independent specs. Report failures and ask developer. | Manifest status unchanged for failed spec (remains "active") |
| `--force` used with `--group` or `--all` | Warning: "--force has no effect with --group/--all (it only applies to explicit mode cross-group guard)." Proceed normally. | None |
| `--group` with no argument | Error: "--group requires a group name. Usage: /df-orchestrate --group <name>" | None |
| Manifest missing group/dependencies fields on an entry | Treat as group: null, dependencies: []. Proceed normally. | None |

## Acceptance Criteria

- [ ] AC-1: `/df-orchestrate --group X` finds all active specs in group X and executes them in dependency wave order
- [ ] AC-2: `/df-orchestrate --all` finds all active specs, groups them, and runs independent groups in parallel with intra-group wave ordering
- [ ] AC-3: Completed specs are shown as "already completed (skipped)" in the execution plan
- [ ] AC-4: Re-running `--group` or `--all` after partial failure picks up only remaining active specs
- [ ] AC-5: Cross-group guard warns and requires `--force` in explicit mode
- [ ] AC-6: Single-spec explicit mode does not trigger cross-group guard
- [ ] AC-7: `--force` with `--group`/`--all` produces a warning (not error)
- [ ] AC-8: Failed spec pauses transitive dependents; independent specs continue
- [ ] AC-9: Developer is asked to decide after failure (not auto-retry)
- [ ] AC-10: `/df-intake` always writes `group` and `dependencies` to manifest entries
- [ ] AC-11: Missing `group` treated as null, missing `dependencies` treated as []
- [ ] AC-12: Circular dependencies detected and reported with cycle path
- [ ] AC-13: Cross-group dependencies detected and reported
- [ ] AC-14: `--group` and `--all` are mutually exclusive (clear error)
- [ ] AC-15: `--group`/`--all` and explicit names are mutually exclusive (clear error)
- [ ] AC-16: `--group X` with non-existent X errors with list of available groups
- [ ] AC-17: Wave resolution is deterministic given the same manifest state
- [ ] AC-18: Execution plan displayed and developer confirms before execution begins
- [ ] AC-19: `--all` parallelizes across independent groups at the wave level
- [ ] AC-20: Dependency on a spec removed from manifest is treated as satisfied
- [ ] AC-21: All changes mirrored in plugin directory (`plugins/dark-factory/`)
- [ ] AC-22: Tests updated for new flag parsing, group validation, and resume semantics

## Edge Cases

- EC-1: **Group with single spec** -- `--group X` where only one spec has that group. Should work identically to explicit single-spec mode (one wave, one spec).

- EC-2: **All specs in group already completed** -- `--group X` where every spec in the group has been promoted and removed from manifest. The group name no longer appears in the manifest. Error: "No group named 'X' found."

- EC-3: **Mixed completed and active in group** -- `--group X` where 2 of 4 specs are completed (removed from manifest). Show the 2 completed as satisfied dependencies, execute the remaining 2 in correct wave order.

- EC-4: **Standalone specs in --all mode** -- Multiple specs with `group: null`. Each is treated as independent and can run in parallel with each other and with any group waves.

- EC-5: **Diamond dependency** -- spec-d depends on spec-b and spec-c, which both depend on spec-a. Wave 1: spec-a, Wave 2: spec-b + spec-c (parallel), Wave 3: spec-d. Must not duplicate execution.

- EC-6: **Failure mid-wave** -- Wave 2 has spec-b and spec-c running in parallel. spec-b fails. spec-c continues. Wave 3 spec-d (depends on spec-b) is paused. Wave 3 spec-e (depends only on spec-c) proceeds.

- EC-7: **Empty manifest** -- `--all` with no active specs. Info: "No active specs found. Nothing to do."

- EC-8: **Legacy manifest entry without group/dependencies** -- `pipeline-velocity` in current manifest has no group or dependencies. Treated as standalone with no dependencies. Works with `--all`, not matched by any `--group`.

- EC-9: **Self-dependency** -- spec-a lists itself in dependencies. Detected as circular dependency (cycle of length 1). Error reported.

- EC-10: **Dependency on spec in different group** -- Pre-flight catches this and reports error before execution starts.

- EC-11: **`--group` with empty string** -- Error: "--group requires a group name."

- EC-12: **Multiple groups with interleaved wave depths** -- Group A has 4 waves, Group B has 2 waves. In `--all` mode, Group B finishes earlier. Group A continues independently. No waiting.

- EC-13: **Explicit mode with all specs from same group** -- Cross-group guard does not trigger (all same group). Proceeds normally without `--force`.

- EC-14: **`--all` with only standalone specs** -- All specs have `group: null`. Each runs independently in parallel. No wave ordering needed.

## Dependencies

### Sequencing
- **Depends on**: `pipeline-velocity` -- Both modify `df-orchestrate SKILL.md`, but different sections. pipeline-velocity must complete first so this spec builds on the updated orchestrator. Specifically:
  - pipeline-velocity modifies: Architect Review section, code-agent findings forwarding, post-hoc file count
  - group-orchestrate modifies: Trigger section, new Group/All/Resume/Failure sections, Pre-flight Checks, argument parsing

### Files Modified
1. **`.claude/skills/df-orchestrate/SKILL.md`** -- Major: add `--group`/`--all`/`--force` argument parsing in Trigger section, add Group Mode section, add All Mode section, add cross-group guard logic, add resume filtering, add cycle detection in pre-flight, add failure handling with dependent pausing
2. **`plugins/dark-factory/skills/df-orchestrate/SKILL.md`** -- Mirror of file 1
3. **`.claude/skills/df-intake/SKILL.md`** -- Minor: enforce `group` and `dependencies` fields in Step 6 manifest update, add intake dependency detection in Step 4
4. **`plugins/dark-factory/skills/df-intake/SKILL.md`** -- Mirror of file 3
5. **`.claude/rules/dark-factory.md`** -- Minor: update `/df-orchestrate` command signature to show `--group`/`--all`/`--force` flags
6. **`plugins/dark-factory/.claude/rules/dark-factory.md`** -- Mirror of file 5
7. **`CLAUDE.md`** -- Minor: update `/df-orchestrate` command signature
8. **`tests/dark-factory-setup.test.js`** -- Moderate: add tests for new flag documentation in CLAUDE.md and dark-factory.md, verify intake writes group/dependencies fields

### Modules NOT Affected
- Agent files (spec-agent.md, debug-agent.md, architect-agent.md, code-agent.md, test-agent.md, promote-agent.md, onboard-agent.md) -- no changes
- df-debug, df-onboard, df-cleanup, df-spec, df-scenario skills -- no changes
- Manifest schema -- no new fields (just enforcement of existing optional fields)

### Cross-Feature Impact
- **pipeline-velocity**: Both modify df-orchestrate SKILL.md. Sequencing avoids conflicts. This spec adds NEW sections rather than modifying sections that pipeline-velocity changes.
- **Existing explicit orchestration**: The current `/df-orchestrate spec-a spec-b` behavior is unchanged. The only addition is the cross-group guard, which is opt-in (only triggers when specs are in different groups).
- **Manifest consumers**: df-cleanup reads the manifest for stuck states. The `group` and `dependencies` fields are additive and do not affect cleanup logic (cleanup looks at `status`, not `group`).

## Implementation Size Estimate

- **Scope size**: medium (8 files modified, but most changes are mirroring or minor updates)
- **Estimated file count**: 8
- **Suggested parallel tracks**: 2

  **Track 1 -- Core Orchestrate + Rules** (files 1, 5, 7):
  - `.claude/skills/df-orchestrate/SKILL.md` (major: argument parsing, group mode, all mode, cross-group guard, resume, failure handling, cycle detection)
  - `.claude/rules/dark-factory.md` (minor: command signature update)
  - `CLAUDE.md` (minor: command signature update)

  **Track 2 -- Intake + Mirrors + Tests** (files 2, 3, 4, 6, 8):
  - `.claude/skills/df-intake/SKILL.md` (minor: enforce group/dependencies, intake dependency detection)
  - `plugins/dark-factory/skills/df-orchestrate/SKILL.md` (mirror Track 1 file 1)
  - `plugins/dark-factory/skills/df-intake/SKILL.md` (mirror file 3)
  - `plugins/dark-factory/.claude/rules/dark-factory.md` (mirror file 5)
  - `tests/dark-factory-setup.test.js` (moderate: new test assertions)

  **Dependency**: Track 2's mirroring of df-orchestrate depends on Track 1 completing first. The intake changes and test updates can run in parallel with Track 1. Recommended execution: run Track 1 first, then Track 2.

## Implementation Notes

### Patterns to Follow
- The df-orchestrate SKILL.md already has a "Trigger" section and "Multiple specs" section. The new argument parsing should extend the Trigger section. The new Group Mode and All Mode logic should be added as new subsections within or after the existing "Multiple specs" section.
- The manifest update pattern in df-intake Step 6 already shows `group` and `dependencies` fields in the JSON example. The enforcement change is to make the surrounding prose mandatory ("MUST always include") rather than optional.
- The cross-group guard follows the same "check condition -> warn developer -> wait for confirmation" pattern already used in the dependency analysis step.
- The wave resolution algorithm described in the existing "Step 1: Dependency Analysis" section of df-orchestrate already builds waves from dependencies. The new code should extend this existing pattern rather than creating a parallel implementation.

### Key Implementation Details
- The Trigger section currently says: `/df-orchestrate {feature-name}` or `/df-orchestrate {name-1} {name-2} ...`. This should be extended to: `/df-orchestrate {name} [name2...]` or `/df-orchestrate --group {group-name}` or `/df-orchestrate --all` with optional `--force`.
- For cycle detection, a simple DFS-based topological sort is sufficient. The orchestrator instructions should describe the algorithm in natural language (not code) since this is a markdown prompt file.
- The "Dependency Analysis (MANDATORY)" step currently starts with "Check the manifest first." The resume filtering (skip non-active specs) should be added at the beginning of this step.
- Failure handling should be described as a new section after the existing "Execute by Waves" step, extending the current wave execution logic with pause-and-continue semantics.
- The `--all` cross-group parallelism should be described as: "Treat each group as an independent orchestration unit. Run independent groups' waves in parallel (group A wave 1 and group B wave 1 can run simultaneously). Within each group, waves are sequential."
- Pre-flight validation (cycle detection, cross-group deps) should be added to the existing "Pre-flight Checks" section.

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01, P-02 |
| FR-2 | P-03, P-04 |
| FR-3 | P-05, P-06 |
| FR-4 | P-07, P-08 |
| FR-5 | P-09 |
| FR-6 | P-10 |
| FR-7 | P-11 |
| FR-8 | P-12, P-13, P-14 |
| FR-9 | P-15, P-16 |
| FR-10 | P-02 |
| FR-11 | P-10 |
| FR-12 | P-01, P-03 |
| BR-1 | H-01 |
| BR-2 | P-04, H-02 |
| BR-3 | P-08, H-03 |
| BR-4 | P-05, P-06 |
| BR-5 | P-09, H-07 |
| BR-6 | P-15, H-04 |
| BR-7 | P-16 |
| BR-8 | P-14 |
| EC-1 | H-05 |
| EC-2 | H-06 |
| EC-3 | P-07 |
| EC-4 | H-02 |
| EC-5 | H-08 |
| EC-6 | H-07 |
| EC-7 | H-09 |
| EC-8 | P-11 |
| EC-9 | H-04 |
| EC-10 | P-16 |
| EC-11 | H-10 |
| EC-12 | H-11 |
| EC-13 | H-12 |
| EC-14 | H-13 |
