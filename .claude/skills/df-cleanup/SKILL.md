---
name: df-cleanup
description: "Recovery and maintenance for Dark Factory lifecycle. Retries stuck promotions, cleans up completed features, and lists stale features."
---

# Dark Factory — Cleanup & Recovery

You are the cleanup/recovery handler for the Dark Factory lifecycle.

## Trigger
`/df-cleanup` — no arguments needed
Optional: `--rebuild` — reconstruct the promoted test registry from annotation headers in the codebase
Optional: `--rebuild-index` — regenerate `dark-factory/memory/index.md` from all shard files (maintenance exception to single-writer rule; outputs diff before writing; never touches shards)
Optional: `--rebuild-memory` — rebuild `dark-factory/memory/ledger.md` from `dark-factory/promoted-tests.json`, then also rebuild `index.md` (same as `--rebuild-index`); shard files are never rebuilt by this flag

## Process

### 1. Read Manifest
- Read `dark-factory/manifest.json`
- If manifest doesn't exist or is empty, report "No features tracked" and stop

### 1.5. Slim File Refresh

Before checking promoted test health, re-generate both slim files from the current full files.

- **Profile slim refresh**: Check whether `dark-factory/project-profile.md` exists.
  - If yes: re-generate `dark-factory/project-profile-slim.md` from it using the extraction rules in `dark-factory/templates/project-profile-slim-template.md`. Log: "Generated project-profile-slim.md from project-profile.md."
  - If no: skip. Log: "project-profile.md not found — skipping slim profile refresh."
- **Code map slim refresh**: Check whether `dark-factory/code-map.md` exists.
  - If yes: re-generate `dark-factory/code-map-slim.md` from it. Preserve the `Git hash:` header from the full file (copy the identical hash value). Log: "Generated code-map-slim.md from code-map.md."
  - If no: skip. Log: "code-map.md not found — skipping slim map refresh."
- This step is **unconditional** — always regenerate when the full file exists. Do not check whether the slim files are already fresh; a cheap re-generation is safer than a staleness check with edge cases.
- If a slim file write fails, log the failure and continue. Do NOT abort cleanup.

### 2. Promoted Test Health Check

Before scanning the manifest for stuck features, verify the health of all promoted tests.

#### 2a. Handle `--rebuild` flag

If `--rebuild` was provided:
1. Scan the codebase for files containing `// Promoted from Dark Factory holdout:` annotation headers.
2. For each match, extract the feature name from the annotation.
3. Detect section markers (`// DF-PROMOTED-START:` / `// DF-PROMOTED-END:`) to determine if the test is co-located.
4. Reconstruct `dark-factory/promoted-tests.json` with entries for each found annotation. Fields that cannot be derived from annotations (like `holdoutScenarioCount`) are set to `null` in rebuilt entries.
5. Show the developer the reconstructed registry before writing. If no annotation headers are found, report: "No promoted test annotations found in codebase. Registry will be empty." and create an empty registry.
6. After rebuild, continue to the health check below with the new registry.

#### 2b. Read the registry

- If `dark-factory/promoted-tests.json` does not exist → report: "No promoted test registry found. No promoted tests to check." Skip to step 3.
- If it exists but is malformed JSON → warn: "promoted-tests.json is malformed. Run `/df-cleanup --rebuild` to reconstruct from annotations." Skip to step 3.
- If `promotedTests` array is empty → report: "No promoted tests found. Run /df-orchestrate to promote tests." Skip to step 3.
- **Version check**: Read the `version` field from the registry. The current supported version is `1`. If the registry `version` is higher than supported, warn: "Registry version {v} is newer than supported ({supported}). Some fields may be ignored." Then continue the health check with best-effort parsing of known fields. Do NOT error out or refuse to check.

#### 2c. Verify each promoted test entry

For each entry in the `promotedTests` array, check ALL of the following in a single pass:

1. **File existence**: Check that each file in the entry's `files` array exists.
   - If missing → report: "MISSING: {path} (promoted from {feature})"

2. **Empty section detection** (co-located tests only): For entries with `sectionMarkers: true`, check whether there is any test content between the `// DF-PROMOTED-START: {feature}` and `// DF-PROMOTED-END: {feature}` markers. If both markers exist but there is no test code between them (only whitespace or blank lines), report: "EMPTY: {path} section for {feature} has no test content". Do NOT report this as MISSING — the file and markers exist, but the section is empty. This is a distinct classification.

3. **Skip detection**: Read each promoted test file and check for `.skip()`, `test.skip(`, `it.skip(`, `describe.skip(`, `xit(`, `xdescribe(`, `xtest(` patterns.
   - For co-located tests with `sectionMarkers: true`, only check within the section markers.
   - For standalone promoted test files, check the entire file.
   - If found → report: "SKIPPED: {path} contains .skip() on promoted tests"

4. **Test execution**: Run the promoted tests using the project's test command.
   - If tests fail → report: "FAILING: {path}" with failure output.
   - Continue checking other promoted tests (do not stop at first failure).

5. **Guard annotation check**: Read `// Guards:` annotations in each promoted test file. For each referenced file path:
   - Strip line numbers (e.g., `src/auth.js:42` → check only `src/auth.js`).
   - Check that the referenced file still exists.
   - If missing → report: "STALE GUARD: {path} references {guard-file} which no longer exists"

Report ALL issues at once, then ask the developer what to do. Do NOT auto-fix — missing tests, skipped tests, and failing tests require human judgment.

### 2.5. Memory Health Check

After the Promoted Test Health Check (step 2), check the health of project memory files. If `dark-factory/memory/` directory does not exist: emit "Memory not yet onboarded — skipping health check. Run `/df-onboard` to initialize." and skip this entire step.

#### 2.5a. Handle `--rebuild-memory` flag

If `--rebuild-memory` was provided:
1. Check that `dark-factory/promoted-tests.json` exists. If missing: report "Cannot rebuild ledger — `promoted-tests.json` not found." Do NOT delete existing ledger. Skip to 2.5b.
2. Check that `dark-factory/memory/` directory exists. If missing: report "Memory directory not found. Run `/df-onboard` first." Skip to 2.5b.
3. Rebuild `dark-factory/memory/ledger.md` from `dark-factory/promoted-tests.json` entries — write one FEAT-NNNN entry per promoted test entry in the registry.
4. After rebuilding the ledger: also rebuild `index.md` using the same logic as `--rebuild-index` (see 2.5b). A single `--rebuild-memory` invocation covers both ledger AND index.
5. Invariant/decision shard files are NOT rebuilt. If invoked when those files are malformed: emit "Invariants/decisions cannot be auto-rebuilt. Run `/df-onboard` to re-extract."

#### 2.5b. Handle `--rebuild-index` flag (also triggered by `--rebuild-memory` after ledger rebuild)

df-cleanup is the ONLY agent besides promote-agent permitted to write `index.md`. This is a documented maintenance exception to the single-writer rule.

If `--rebuild-index` was provided (or triggered by `--rebuild-memory`):
1. Scan all files matching `invariants-*.md`, `decisions-*.md` (and `ledger.md` for FEAT IDs) in `dark-factory/memory/`.
2. For each file, read all headings matching `## {ID}` pattern (e.g., `## INV-0001`, `## DEC-0003`, `## FEAT-0005`).
3. For each heading, parse bracket fields: `[type:...]`, `[domain:...]`, `[tags:...]`, `[status:...]`, `[shard:...]`.
4. Generate new `index.md` content from scratch: one heading row per entry found in all shards.
5. Compute a diff against the existing `index.md` (or "index.md does not exist — creating from scratch").
6. **Output the diff to the developer** before writing.
7. Write the new `index.md`. Note: in non-interactive mode (e.g., called by `--rebuild-memory`), write unconditionally. In interactive mode, offer developer review before writing.
8. Shard files are NEVER modified by this operation.

#### 2.5c. Parse memory files

Read `dark-factory/memory/index.md` and all shard files. If any file is malformed (unparseable YAML frontmatter or heading format): flag `MALFORMED_MEMORY` (see 2.5d).

#### 2.5d. Per-entry checks (all entries in all shard files)

For each entry in each shard file:

1. **MALFORMED_MEMORY**: file YAML frontmatter is unparseable or heading format is invalid. Severity: ERROR.
2. **STALE_ENFORCEMENT**: entry has `enforced_by: {test-path}` and that test file does not exist. Severity: WARNING.
3. **STALE_SOURCE**: entry has `sourceRef: {file-path}` and that source file does not exist. Severity: WARNING.
4. **STALE_LEDGER**: for FEAT entries in `ledger.md`, each `promotedTests` path is not present in `dark-factory/promoted-tests.json`. Severity: WARNING.

#### 2.5e. Shard/index consistency checks

1. **ORPHANED_SHARD**: an entry heading (`## INV-NNNN` or `## DEC-NNNN`) exists in a shard file but has NO corresponding row in `index.md`.
   - Severity: WARNING
   - Report: "ORPHANED_SHARD: {ID} found in {shard-file} but missing from index.md. Run `--rebuild-index` to repair."
   - Does NOT auto-fix.

2. **PHANTOM_INDEX**: the index references an entry ID for which NO shard file contains a matching heading.
   - Severity: ERROR (data loss condition)
   - Report: "PHANTOM_INDEX: {ID} referenced in index.md but not found in any shard. This is a data-loss condition. Run `--rebuild-index` to remove the phantom row."
   - Does NOT auto-fix.

3. **INDEX_HASH_MISMATCH**: the index frontmatter `gitHash` differs from the `gitHash` frontmatter of one or more shard files it references.
   - Severity: WARNING
   - Report: "INDEX_HASH_MISMATCH: index gitHash `{hash}` differs from {shard-file} gitHash `{shard-hash}`. A write may have been interrupted mid-operation."
   - Does NOT auto-fix.

#### 2.5f. Token budget observability

Count the number of entry rows in `index.md` (lines matching `## {ID}` pattern). If count exceeds 500: emit WARNING: "Memory index has grown large ({N} entries). Consider archiving stale entries." This is advisory only — does not block.

#### Memory Health Check Report

Report ALL issues at once after scanning all files. Do NOT auto-fix any issue. Leave resolution to the developer. Suggested resolutions:
- ORPHANED_SHARD, PHANTOM_INDEX, INDEX_HASH_MISMATCH → `--rebuild-index`
- MALFORMED_MEMORY → manual edit or `/df-onboard` to re-extract
- STALE_ENFORCEMENT, STALE_SOURCE, STALE_LEDGER → manual review; consider `/df-cleanup --rebuild-memory` for ledger issues

### 3. Identify Issues
Scan all features and categorize:

- **Stuck at `passed`**: Holdout tests passed but promotion didn't complete. Retry promotion by spawning promote-agent.
- **Stuck at `promoted`**: Promotion succeeded but cleanup didn't complete. Run cleanup (commit artifacts to git, delete files, remove from manifest).
- **Stale `active`**: Status is `active` but created more than 7 days ago. List these for developer attention — they may be abandoned.

### 4. Report
Display a table:

```
Feature          Status     Created      Action
─────────────────────────────────────────────────
broken-feature   passed     2026-03-18   Retrying promotion...
old-thing        active     2026-03-01   ⚠ Stale (23 days) — review or remove
done-feature     promoted   2026-03-20   Running cleanup...
```

### 5. Execute Fixes
For each stuck feature:
- **passed → promote**: Spawn promote-agent, then cleanup on success
- **promoted → cleanup**: Commit all feature artifacts to git, delete files, remove from manifest

### 6. Cleanup Steps (for promoted features)
1. Verify all feature artifacts are committed to git (`git status` to check for uncommitted changes)
2. If uncommitted, commit: `"Archive {name}: spec + scenarios (promoted to permanent tests)"`
3. Delete all feature artifacts:
   - `dark-factory/specs/features/{name}.spec.md` (or `bugfixes/{name}.spec.md`)
   - `dark-factory/specs/features/{name}.review.md` (and any domain review files)
   - `dark-factory/scenarios/public/{name}/` directory
   - `dark-factory/scenarios/holdout/{name}/` directory
   - `dark-factory/results/{name}/` directory
4. Remove the feature entry from `dark-factory/manifest.json`
5. Commit the deletion: `"Cleanup {name}: artifacts deleted, tests promoted"`

### 7. Handle Stale Features
For stale `active` features, ask the developer:
- **Keep** — leave it, maybe it's still in progress
- **Remove** — commit artifacts to git, delete files, remove from manifest

### 8. Confirm
After all fixes, re-read manifest and display updated status table.

## Important
- Always read the current manifest state — don't rely on cached data
- If a retry fails, report the failure but continue processing other features
- ALWAYS commit artifacts to git before deleting — git history is the permanent archive
- After cleanup, the manifest should only contain actively in-progress features
