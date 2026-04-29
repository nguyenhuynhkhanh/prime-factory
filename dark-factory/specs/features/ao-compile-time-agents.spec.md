# Feature: ao-compile-time-agents

## Context

Four or more agent files contain near-identical "code-map orientation" and "index-first memory load" preamble blocks. When one copy drifts from the others, the existing mirror-parity tests (`.claude/` vs `plugins/`) catch file-level divergence but cannot catch semantic drift between the supposedly-identical copies inside different agent files. The result is a maintenance liability: a correction to one copy of a shared block must be manually applied to 4–6 other files, and there is no automated check that they stay synchronized.

This feature introduces a compile-time agent assembly system. Shared blocks are defined once in `src/agents/shared/*.md` files. Agent source files (`src/agents/*.src.md`) reference them via `<!-- include: shared/... -->` directives. A build script (`bin/build-agents.js`) resolves those directives and writes the assembled output to both `.claude/agents/{name}.md` and `plugins/dark-factory/agents/{name}.md`. The build runs automatically before every test run via a `pretest` npm hook and as the first step in `scripts/deploy.sh`.

**Phase 1 scope (this spec):** Extract the 4 highest-priority shared blocks and migrate the agents that use each block to `<!-- include: ... -->` directives.

**Problem confirmed from codebase investigation:**

`context-loading.md` (code-map orientation preamble — the sentence "Read `dark-factory/code-map.md` — it is always present and current…"):
- spec-agent.md (line 39) — with `DO use Read/Grep` suffix
- debug-agent.md (line 48) — with `DO use Read/Grep` suffix
- architect-agent.md (line 122) — with `DO use Read/Grep` suffix, prefixed with tier-conditional context
- promote-agent.md (line 19) — with `DO use Read/Grep` suffix
- test-agent.md (line 27) — abbreviated variant (missing `DO use Read/Grep`)
- code-agent.md (line 104) — missing `DO use Read/Grep` suffix (diverged)

`memory-index-load.md` (index-first memory load protocol):
- spec-agent.md (Phase 2a block, lines 41–47)
- code-agent.md (lines 90–97 — "Index-first memory load (Phase 1)" block)
- debug-agent.md (lines 51–56 — "Index-first memory load" block)

`holdout-barrier.md` (NEVER read holdout scenarios — cross-feature isolation):
- spec-agent.md (Constraints section: `NEVER read dark-factory/scenarios/holdout/ from previous features`)
- debug-agent.md (Constraints section: same phrasing)
- code-agent.md (Constraints section: `NEVER read files under dark-factory/scenarios/holdout/`)

`model-role-dispatch.md` (quality-mode model selection table — from `ao-pipeline-mode` spec):
- implementation-agent.md (will contain this block once ao-pipeline-mode is shipped)

Note: the context-loading block has already drifted — `test-agent.md` and `code-agent.md` have abbreviated/diverged variants. The canonical form (from spec-agent, debug-agent, promote-agent) is: `Read \`dark-factory/code-map.md\` — it is always present and current. Use it to understand module structure, blast radius, entry points, and hotspots. Do NOT use Grep or Glob to discover which modules exist or how they connect — that is what the map is for. DO use Read/Grep for precise implementation details on specific files the map directs you to.`

## Design Intent

This is a build-time infrastructure change, not an agent behavior change. The output files produced by `bin/build-agents.js` must be byte-for-byte identical to what a human would produce by copy-pasting the shared block content into each agent file. Agents read and behave exactly as before; the only difference is that their source of truth has moved from `.claude/agents/*.md` (direct edit) to `src/agents/*.src.md` (assembled edit).

The header comment in each assembled file — `<!-- AUTO-GENERATED — edit src/agents/{name}.src.md then run: npm run build:agents -->` — is the information architecture that prevents accidental direct edits. This comment is the first line of each output file, before the YAML frontmatter.

The `src/agents/` directory is NOT distributed to target projects. `bin/cli.js` copies from `plugins/dark-factory/` only; it continues to do so unchanged. The `src/` directory is a build-time artifact of the Dark Factory repository itself.

## Scope

### In Scope (this spec)

- `bin/build-agents.js` — Node.js stdlib-only build script:
  - Reads `src/agents/*.src.md` source files
  - Resolves `<!-- include: shared/X.md -->` directives (inline replacement — comment replaced by file content, not appended)
  - Detects circular includes, errors loudly with the include chain
  - Deduplicates: if the same include appears twice in one source file, the second occurrence is removed (not doubled)
  - Writes to `.claude/agents/{name}.md` AND `plugins/dark-factory/agents/{name}.md`
  - Adds auto-generated header comment as the first line of each output file
  - Idempotent: running twice produces identical output
  - Errors loudly on missing include files (never silently produces agents with missing blocks)
  - Exits with non-zero code on any error so `pretest` / deploy fail fast

- `src/agents/shared/` directory with 4 files:
  - `context-loading.md` — canonical code-map orientation sentence (with `DO use Read/Grep` suffix)
  - `memory-index-load.md` — index-first memory load protocol block
  - `holdout-barrier.md` — NEVER read holdout scenarios declaration
  - `model-role-dispatch.md` — quality-mode model selection table (placeholder pending `ao-pipeline-mode`; may be a minimal stub at Phase 1 if that spec is not yet shipped)

- `src/agents/*.src.md` for each of the 9 agents:
  - Agents that use shared blocks: replace the inline block with the corresponding `<!-- include: shared/... -->` directive
  - Agents that use no shared blocks (from the 4 blocks above): copied verbatim as `.src.md` (no directives — functionally a passthrough)
  - All 9 agents MUST have a `.src.md` source file — the build script processes all of them

- `package.json` additions:
  - `"build:agents": "node bin/build-agents.js"` in `scripts`
  - `"pretest": "node bin/build-agents.js"` — runs before every `node --test tests/`

- `scripts/deploy.sh` addition:
  - `node bin/build-agents.js` as the FIRST step (before the pre-flight checks section, i.e., before the npm version bump)

- `tests/dark-factory-contracts.test.js` addition:
  - "built output matches source" test: runs the build to a temp directory, compares output vs `.claude/agents/*.md`, asserts equal. This verifies the assembled output is in sync with `src/`

- `tests/dark-factory-setup.test.js` additions:
  - Each assembled output file contains the auto-generated header comment
  - Each agent that uses `shared/context-loading.md` contains the resolved context-loading text in its assembled output

### Out of Scope (explicitly deferred)

- Extracting additional shared blocks beyond the 4 defined above (Phase 2+)
- A watch mode or file watcher for auto-rebuilding on source change
- Source maps or reverse-tracing from built output back to source line numbers
- Validation that `.src.md` files are syntactically correct Markdown
- Linting or formatting enforcement on shared block files
- A `<!-- include: -->` directive with path variables or conditional logic
- Any change to how `bin/cli.js` distributes files to target projects
- Any change to agent behavior — the shared blocks are extracted verbatim from existing content

### Scaling Path

Phase 2+ can extract additional shared blocks (e.g., the Serena 3-layer search policy, the memory probe logic in architect-agent, the slim-file fallback protocol) as drift is detected. The build infrastructure established in Phase 1 supports arbitrary future extractions with no changes to `bin/build-agents.js`.

If the number of shared blocks grows large, the `shared/` directory can be organized into subdirectories (e.g., `shared/memory/`, `shared/search/`). The include path syntax already supports this: `<!-- include: shared/memory/index-load.md -->`.

## Requirements

### Functional

- FR-1: `bin/build-agents.js` reads every `src/agents/*.src.md` file and writes a corresponding assembled file to `.claude/agents/{name}.md` and `plugins/dark-factory/agents/{name}.md` — `name` is derived by stripping `.src.md` from the source filename.
- FR-2: `<!-- include: shared/X.md -->` directives in source files are replaced inline by the content of `src/agents/shared/X.md`. The comment line is removed and its content substituted in place.
- FR-3: The first line of every assembled output file is the auto-generated header comment: `<!-- AUTO-GENERATED — edit src/agents/{name}.src.md then run: npm run build:agents -->`
- FR-4: The build script detects circular includes (A includes B which includes A) and exits with a non-zero code and a human-readable error naming the circular chain.
- FR-5: If the same include directive appears more than once in a source file, the first occurrence is resolved and subsequent occurrences are removed (deduplication).
- FR-6: If a referenced shared file does not exist, the build script exits with a non-zero code and a human-readable error naming the missing file. It NEVER produces an output file with an unresolved directive.
- FR-7: `package.json` gains `"build:agents": "node bin/build-agents.js"` and `"pretest": "node bin/build-agents.js"` in the `scripts` object.
- FR-8: `scripts/deploy.sh` gains `node bin/build-agents.js` as its first step (before pre-flight checks).
- FR-9: `tests/dark-factory-contracts.test.js` gains a test that runs the build script to a temp directory and asserts the output matches the current `.claude/agents/*.md` files.
- FR-10: `tests/dark-factory-setup.test.js` gains tests that verify: (a) each assembled output file contains the auto-generated header comment, and (b) each agent that includes `shared/context-loading.md` contains the resolved context-loading text.
- FR-11: The 4 shared block files are created in `src/agents/shared/`:
  - `context-loading.md` — canonical code-map orientation text
  - `memory-index-load.md` — index-first memory load protocol
  - `holdout-barrier.md` — holdout isolation barrier declaration
  - `model-role-dispatch.md` — quality-mode model+tier dispatch table (or a minimal stub if `ao-pipeline-mode` is not yet shipped)
- FR-12: All 9 agents are migrated to `src/agents/*.src.md`. Agents that use a shared block have the inline copy replaced with the corresponding include directive. Agents with no shared blocks from this set are verbatim copies.
- FR-13: The `src/agents/` directory is NOT added to the `files` array in `package.json` and is NOT copied by `bin/cli.js`. Only the assembled output in `plugins/dark-factory/agents/` is distributed.
- FR-14: The build script is idempotent: running it twice with unchanged inputs produces byte-for-byte identical outputs.

### Non-Functional

- NFR-1: `bin/build-agents.js` uses ONLY Node.js stdlib (`fs`, `path`) — zero npm dependencies. Consistent with `bin/cli.js`.
- NFR-2: Build time must be fast enough not to noticeably slow down `npm test`. Given the project has 9 agents and 4 shared files, target < 50ms total.
- NFR-3: Error messages from the build script must be actionable: name the specific missing file or the specific circular include chain, not a generic failure.
- NFR-4: The `src/agents/` directory structure must be clear to contributors: a `README` comment at the top of each `.src.md` file is NOT needed — the auto-generated header in the output file is sufficient guidance.

## Data Model

No database or schema changes. This feature is entirely file-system–level:

**New files created:**
- `bin/build-agents.js`
- `src/agents/shared/context-loading.md`
- `src/agents/shared/memory-index-load.md`
- `src/agents/shared/holdout-barrier.md`
- `src/agents/shared/model-role-dispatch.md`
- `src/agents/spec-agent.src.md`
- `src/agents/architect-agent.src.md`
- `src/agents/code-agent.src.md`
- `src/agents/debug-agent.src.md`
- `src/agents/test-agent.src.md`
- `src/agents/onboard-agent.src.md`
- `src/agents/promote-agent.src.md`
- `src/agents/codemap-agent.src.md`
- `src/agents/implementation-agent.src.md`

**Modified files:**
- `package.json` — add `build:agents` and `pretest` scripts
- `scripts/deploy.sh` — add build step
- `tests/dark-factory-contracts.test.js` — add "built output matches source" test
- `tests/dark-factory-setup.test.js` — add header comment and context-loading content tests
- `.claude/agents/*.md` (all 9) — overwritten with assembled output (content identical to current except for: header comment added, inline shared blocks replaced with the canonical shared block text, and any drifted copies corrected to the canonical form)
- `plugins/dark-factory/agents/*.md` (all 9) — same as above

## Migration & Deployment

**Existing data:** The assembled `.claude/agents/*.md` and `plugins/dark-factory/agents/*.md` files ARE existing data — they are checked into git and read by tests. This feature overwrites them. The key constraint: after running `bin/build-agents.js`, the content of each assembled agent file must pass all existing tests. This means:

1. The shared blocks must be extracted verbatim from the current agent content (not rewritten or reformatted).
2. Any diverged copies (e.g., `test-agent.md` line 27 has an abbreviated code-map orientation) must be normalized to the canonical form. This is a deliberate correction — the spec author confirms this is the intent.
3. The auto-generated header comment is added as a new first line; existing tests do string-matching on content inside the file and will continue to pass because the header does not conflict with any existing test assertion.

**Rollback plan:** The `src/agents/*.src.md` files and `bin/build-agents.js` can be deleted. The `.claude/agents/*.md` and `plugins/dark-factory/agents/*.md` files revert to direct-edit mode by removing the `pretest` hook. The `.md` files themselves remain valid after rollback because their content is identical to what a human would write.

**Zero-downtime:** Yes — this is a build-time change only. No running services, no API contracts changed.

**Deployment order:**
1. Create `src/agents/shared/*.md` files (canonical block content)
2. Create `src/agents/*.src.md` files (agent sources with include directives)
3. Create `bin/build-agents.js`
4. Run `node bin/build-agents.js` — assembles and overwrites all 9 agents in both locations
5. Update `package.json` (scripts)
6. Update `scripts/deploy.sh` (build step)
7. Update test files (new assertions)
8. Run `npm test` — all existing tests pass, new tests pass

**Stale data:** The `plugins/dark-factory/agents/*.md` files are checked into git. After the build step in deployment order above, they are overwritten with assembled output. The mirror-parity tests confirm both sides match. No stale state after a successful build.

**Important note about drifted copies:** `test-agent.md` and `code-agent.md` currently have abbreviated/diverged code-map orientation text. The build will normalize these to the canonical form. This is the correct behavior — the canonical form includes the `DO use Read/Grep` suffix that the diverged copies omit. Existing tests do NOT assert the exact abbreviated text; they test for substrings like `"it is always present and current"` which the canonical form also contains.

## API Endpoints

N/A — this is build infrastructure, not an API feature.

## Business Rules

- BR-1: `src/agents/` is the authoritative source for agent content. The `.claude/agents/` and `plugins/dark-factory/agents/` directories contain only assembled output. Direct edits to assembled output files are OVERWRITTEN by the next build. The header comment in each output file declares this.
- BR-2: The build script must process ALL 9 agent files, even those with no `<!-- include: -->` directives. Agents without directives are assembled by prepending the header comment to their verbatim source content.
- BR-3: If any shared file is missing or any include resolves to a circular chain, the build must fail loudly with a non-zero exit code. The `pretest` hook ensures test runs fail fast rather than silently validating stale output.
- BR-4: The `model-role-dispatch.md` shared file exists in Phase 1. If `ao-pipeline-mode` has not shipped yet, it contains a minimal stub (e.g., a comment noting it is reserved for quality-mode dispatch). The stub is included in any agent source file that references it but the content is inert.
- BR-5: Deduplication applies within a single source file only. Two different source files may each include the same shared block — that is the point of the system.
- BR-6: `bin/cli.js` does NOT copy `src/agents/`. It continues to copy from `plugins/dark-factory/agents/` unchanged. The `files` field in `package.json` does NOT include `src/`.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| Missing shared file (`shared/X.md` not found) | Build exits with code 1; prints `Error: include file not found: src/agents/shared/X.md (referenced in src/agents/Y.src.md)` | No output files written for the agent that triggered the error; other agents may have been written already |
| Circular include (`A.md` includes `B.md` which includes `A.md`) | Build exits with code 1; prints `Error: circular include detected: A.md -> B.md -> A.md` | Same as above |
| `src/agents/` directory missing | Build exits with code 1; prints `Error: source directory not found: src/agents/` | No output files written |
| Output directory missing (`.claude/agents/` or `plugins/dark-factory/agents/`) | Build creates the directory (using `fs.mkdirSync` with `recursive: true`) and writes normally | Directory created as side effect |
| `pretest` hook build failure | `npm test` exits before running tests; developer sees build error message | Tests do not run until build is fixed |
| deploy.sh build failure | Deploy script exits at step 1 (before version bump); no version is bumped, no tag is created | Deploy does not proceed |

## Acceptance Criteria

- [ ] AC-1: `bin/build-agents.js` exists and uses only Node.js stdlib imports (`fs`, `path`).
- [ ] AC-2: Running `node bin/build-agents.js` produces `.claude/agents/{name}.md` and `plugins/dark-factory/agents/{name}.md` for all 9 agents.
- [ ] AC-3: Each assembled output file begins with `<!-- AUTO-GENERATED — edit src/agents/{name}.src.md then run: npm run build:agents -->`.
- [ ] AC-4: `src/agents/shared/context-loading.md` contains the canonical code-map orientation text (with `DO use Read/Grep` suffix).
- [ ] AC-5: `src/agents/shared/memory-index-load.md` contains the index-first memory load protocol.
- [ ] AC-6: `src/agents/shared/holdout-barrier.md` contains the holdout isolation barrier declaration.
- [ ] AC-7: `src/agents/shared/model-role-dispatch.md` exists (stub or full content).
- [ ] AC-8: All 9 `src/agents/*.src.md` files exist.
- [ ] AC-9: Agents known to share the context-loading block (spec-agent, debug-agent, architect-agent, promote-agent, test-agent, code-agent) have `<!-- include: shared/context-loading.md -->` in their `.src.md` files where the inline text previously appeared.
- [ ] AC-10: Agents known to share the memory-index-load block (spec-agent, code-agent, debug-agent) have `<!-- include: shared/memory-index-load.md -->` in their `.src.md` files.
- [ ] AC-11: Agents known to share the holdout-barrier block (spec-agent, debug-agent, code-agent) have `<!-- include: shared/holdout-barrier.md -->` in their `.src.md` files.
- [ ] AC-12: `package.json` `scripts` object contains `"build:agents": "node bin/build-agents.js"` and `"pretest": "node bin/build-agents.js"`.
- [ ] AC-13: `scripts/deploy.sh` calls `node bin/build-agents.js` before the pre-flight checks section.
- [ ] AC-14: `npm test` runs the build before the test suite (via `pretest`).
- [ ] AC-15: All existing tests pass after the migration (assembled output is functionally identical to current agent content).
- [ ] AC-16: The "built output matches source" test in `dark-factory-contracts.test.js` passes.
- [ ] AC-17: The "auto-generated header" and "context-loading content" tests in `dark-factory-setup.test.js` pass.
- [ ] AC-18: Running `bin/build-agents.js` twice produces byte-for-byte identical output on both runs (idempotency).
- [ ] AC-19: A build with a missing shared file exits with code 1 and a descriptive error message.
- [ ] AC-20: `src/agents/` is NOT referenced in `package.json` `files` array and NOT copied by `bin/cli.js`.

## Edge Cases

- EC-1: An agent source file has ZERO include directives. The build script adds the header comment and writes the verbatim source content. No include resolution is attempted.
- EC-2: An include directive appears at the beginning of the file (before frontmatter). The build script must handle this gracefully — the header comment goes first, then the resolved content.
- EC-3: An include directive appears mid-sentence or mid-paragraph in the source. Inline substitution preserves the surrounding text and replaces only the comment line.
- EC-4: The same include appears twice in one source file. First occurrence is resolved; second is removed. The assembled output contains the block exactly once.
- EC-5: A shared file contains a blank line at the end. The assembled output preserves the blank line as-is. The build does not strip trailing whitespace from included content.
- EC-6: Two different agents include the same shared file. Both are assembled correctly with no interference.
- EC-7: `bin/build-agents.js` is run in a git worktree (during parallel code-agent execution). It must write to both `.claude/agents/` and `plugins/dark-factory/agents/` relative to the worktree root, not relative to any hardcoded path.
- EC-8: The `pretest` hook is triggered in a CI environment where `src/agents/` does not exist (e.g., a target project that installed Dark Factory via npm). This must not cause the build to fail for target project test runs — `bin/cli.js` does NOT install `src/agents/`, and the `pretest` script is only in the Dark Factory development `package.json`, not in target projects.
- EC-9: A shared file itself contains an `<!-- include: ... -->` directive (nested include). The build script resolves nested includes recursively before checking for circularity.
- EC-10: `scripts/deploy.sh` is run with a dirty working tree (the script already checks for this). The build step runs first; if it modifies any tracked files (it should not, if already in sync), the dirty-tree check will catch it. This is expected behavior and the developer must commit the built output before deploying.

## Dependencies

- **Depends on**: `ao-agent-roles` — all agent files must be settled before this spec migrates their content into `src/`. Any change to agent content from `ao-agent-roles` must be applied to the `.src.md` files, not to `.md` files directly.
- **Depended on by**: `ao-pipeline-mode` may provide the content for `shared/model-role-dispatch.md`. If `ao-pipeline-mode` ships before this spec, its dispatch table is placed directly into `shared/model-role-dispatch.md`. If this spec ships first, a stub is used and `ao-pipeline-mode` must update the stub.
- **Group**: `ao-pipeline-improvements`

## Implementation Size Estimate

- **Scope size**: x-large (10+ files touched across `bin/`, `src/`, `tests/`, `scripts/`, and all 9 agent files in two locations each)
- **Estimated file count**: ~28 files (14 new files in `src/`, 1 new `bin/build-agents.js`, 18 agent files overwritten across `.claude/` and `plugins/`, 2 test files modified, `package.json`, `scripts/deploy.sh`)
- **Suggested parallel tracks**:
  - **Track A — Build script + shared blocks**: Create `bin/build-agents.js`, create `src/agents/shared/*.md` (4 files), verify build runs correctly against existing agent files
  - **Track B — Agent source migration**: Create all 9 `src/agents/*.src.md` files with correct include directives; depends on Track A completing `src/agents/shared/*.md` first
  - **Track C — Test + infra updates**: Update `package.json`, `scripts/deploy.sh`, `tests/dark-factory-contracts.test.js`, `tests/dark-factory-setup.test.js`; can start in parallel once build script interface is known from Track A
  - Note: Track B depends on Track A (needs shared files to exist). Track C can start after Track A defines the output format. Tracks B and C may run in parallel once Track A is complete. Recommend: Track A first (1 agent), then Tracks B + C in parallel.

## Architect Review Tier

- **Tier**: Tier 3
- **Reason**: 10+ files touched; cross-cutting build infrastructure change that affects all 9 agent files and both output locations; touches shared test contracts (`dark-factory-contracts.test.js`); modifies `scripts/deploy.sh` (release pipeline); introduces new `src/` build-time layer that changes the source-of-truth contract for all agents
- **Agents**: 3 domain agents
- **Rounds**: 3+ minimum

## Implementation Notes

**Build script design (`bin/build-agents.js`):**
```
// Zero-dep, stdlib only
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src', 'agents');
const SHARED_DIR = path.join(SRC_DIR, 'shared');
const TARGETS = [
  path.join(ROOT, '.claude', 'agents'),
  path.join(ROOT, 'plugins', 'dark-factory', 'agents'),
];

// HEADER_TEMPLATE uses {name} placeholder, filled per agent
// resolveIncludes(content, srcFile, visitedStack) — recursive, checks visitedStack for cycles
// deduplicateIncludes(content) — second pass to remove duplicate include comments
// main() — glob src/*.src.md, process each, write to both targets
```

**Include directive format (exact HTML comment syntax):**
```
<!-- include: shared/context-loading.md -->
```
The comment is replaced wholesale by the file content of `src/agents/shared/context-loading.md`. No surrounding whitespace is added beyond what is in the shared file itself.

**Agent migration decisions (confirmed from investigation):**
- `spec-agent.src.md`: includes `context-loading`, `memory-index-load`, `holdout-barrier`
- `debug-agent.src.md`: includes `context-loading`, `memory-index-load`, `holdout-barrier`
- `code-agent.src.md`: includes `context-loading`, `memory-index-load`, `holdout-barrier`
- `architect-agent.src.md`: includes `context-loading` (NOTE: architect-agent's code-map paragraph has a tier-conditional prefix — "Load `dark-factory/code-map.md` per the tier-conditional loading rules above —". The include replaces only the suffix sentence `it is always present and current…` after that prefix, OR the entire paragraph is restructured so the tier-conditional prefix is in the `.src.md` and the include provides only the shared sentence. Code-agent must resolve this precisely — the canonical shared block is the full standalone sentence.)
- `promote-agent.src.md`: includes `context-loading`
- `test-agent.src.md`: includes `context-loading`
- `implementation-agent.src.md`: includes `model-role-dispatch` (when that block is non-empty)
- `onboard-agent.src.md`: no shared blocks from this set — verbatim copy
- `codemap-agent.src.md`: no shared blocks from this set — verbatim copy

**Architect-agent note (see above):** The tier-conditional prefix in architect-agent ("Load `dark-factory/code-map.md` per the tier-conditional loading rules above —") is NOT part of the shared block. The shared block `context-loading.md` contains the canonical standalone sentence beginning with "Read `dark-factory/code-map.md`". The `.src.md` for architect-agent either: (a) keeps the tier-conditional sentence and adds the include after it, or (b) replaces the full sentence (including the tier-conditional prefix) with a combined approach. Approach (a) is recommended to preserve the existing behavioral text while using the shared include for the canonical code-map orientation rule.

**Test assertions to add (contracts test):**
```js
it("built output matches src/ + shared resolution", () => {
  // Run build to temp dir
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'df-build-'));
  execSync(`node bin/build-agents.js --output-dir ${tmpDir}`, { cwd: ROOT });
  // Compare each agent
  for (const name of AGENT_NAMES) {
    const built = fs.readFileSync(path.join(tmpDir, `${name}.md`), 'utf8');
    const current = fs.readFileSync(path.join(ROOT, '.claude', 'agents', `${name}.md`), 'utf8');
    assert.equal(built, current, `${name}.md is out of sync with src/`);
  }
  fs.rmSync(tmpDir, { recursive: true });
});
```
Note: `bin/build-agents.js` needs to support an `--output-dir` flag (or equivalent) for the test to write to a temp directory without overwriting the real output. Alternative: run build normally into a copy of the directory structure, then compare.

**Simpler test approach (avoids `--output-dir` flag):**
Build to a temp directory by having the test temporarily redirect the build's output — or, simpler, re-implement the include resolution inline in the test and compare results. Given this is a string-matching test suite, the simplest approach may be: resolve includes in-test using the same algorithm, compare to current `.claude/agents/*.md`.

**`pretest` hook behavior:**
Node.js `scripts.pretest` runs automatically before `node --test tests/`. The build overwrites assembled output files. If the assembled output was already up-to-date, the overwrite is idempotent. If `src/` files were edited without running the build, the assembled files are updated before tests run, meaning the tests validate the freshly assembled output.

**deploy.sh change (exact placement):**
```bash
# --- Build agents ---
step "Building agents from src/"
node bin/build-agents.js
info "Agents assembled"

# --- Pre-flight checks ---  (existing content follows)
step "Pre-flight checks"
...
```

## Invariants

### Preserves
*None — no active invariants registered in the project memory registry that overlap with build infrastructure.*

### References
*None — no existing registered invariants in scope for this spec.*

### Introduces

- **INV-TBD-a**
  - **title**: agent-source-of-truth — `src/agents/` is authoritative, assembled output is derived
  - **rule**: `.claude/agents/*.md` and `plugins/dark-factory/agents/*.md` are assembled output files. They MUST NOT be edited directly. All agent content changes go through `src/agents/*.src.md` and `src/agents/shared/*.md`, then `node bin/build-agents.js`.
  - **scope.modules**: `src/agents/`, `src/agents/shared/`, `.claude/agents/`, `plugins/dark-factory/agents/`, `bin/build-agents.js`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-contracts.test.js` (built output matches source test)
  - **rationale**: Without this invariant, developers will edit assembled output directly, the `src/` source will drift from the output, and the deduplication guarantee is lost.

- **INV-TBD-b**
  - **title**: build-before-test — the `pretest` hook ensures tests always validate assembled output
  - **rule**: `node bin/build-agents.js` MUST run before every `node --test tests/` invocation. The `pretest` script in `package.json` enforces this for npm-managed test runs.
  - **scope.modules**: `package.json`, `bin/build-agents.js`
  - **domain**: architecture
  - **enforcement**: runtime (npm lifecycle hook)
  - **rationale**: Without this invariant, a developer can edit `src/` and run tests without building, causing tests to validate stale output and pass incorrectly.

- **INV-TBD-c**
  - **title**: build-zero-deps — `bin/build-agents.js` uses only Node.js stdlib
  - **rule**: `bin/build-agents.js` MUST NOT `require()` any package from `node_modules`. Only `fs`, `path`, and other Node.js built-in modules are permitted.
  - **scope.modules**: `bin/build-agents.js`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-contracts.test.js` (or manual audit) — a test that reads `bin/build-agents.js` and asserts no non-stdlib `require()` calls
  - **rationale**: Consistent with `bin/cli.js`. A zero-dep build script ensures it works in any environment where Node.js 18+ is available, including fresh CI containers and target project contexts.

### Modifies
*None.*

### Supersedes
*None.*

## Decisions

### References
*None — no existing registered decisions in scope.*

### Introduces

- **DEC-TBD-a**
  - **title**: inline-substitution over append — include directives are replaced, not appended
  - **decision**: `<!-- include: shared/X.md -->` comments are replaced inline by the included content. The comment line disappears; the included content takes its exact position in the output.
  - **rationale**: Appending after the comment would leave the comment in the assembled output, which would require agents to parse/skip it. Inline replacement produces clean output identical to a manual copy-paste.
  - **alternatives**: (1) Append after the directive comment — rejected because it leaves structural noise in the output. (2) Use a dedicated token like `{{include shared/X.md}}` — rejected because HTML comment syntax is already invisible in Markdown renderers and is consistent with how auto-generated headers work.
  - **scope.modules**: `bin/build-agents.js`, `src/agents/*.src.md`
  - **domain**: architecture
  - **enforcement**: manual (design decision; tested implicitly by AC-3 and the built-output-matches test)

- **DEC-TBD-b**
  - **title**: `src/agents/` not distributed to target projects
  - **decision**: `src/agents/` is a development-time directory of the Dark Factory repository itself. It is NOT included in the npm `files` field and NOT copied by `bin/cli.js`. Target projects receive only the assembled `.claude/agents/*.md` files via the plugin installation.
  - **rationale**: Target projects have no build system for Dark Factory agent source files. They need ready-to-use agent files, not source files requiring a build step. The build system is a concern of the Dark Factory maintainers, not its users.
  - **alternatives**: Distribute `src/agents/` so advanced users can customize shared blocks — rejected because it creates support burden and version drift in target projects.
  - **scope.modules**: `bin/cli.js`, `package.json`, `src/agents/`
  - **domain**: architecture
  - **enforcement**: manual (tested by AC-20)

### Supersedes
*None.*

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01, P-02 |
| FR-2 | P-01, P-03, H-01 |
| FR-3 | P-04 |
| FR-4 | H-04 |
| FR-5 | H-05 |
| FR-6 | H-03 |
| FR-7 | P-05 |
| FR-8 | P-06 |
| FR-9 | P-07 |
| FR-10 | P-08 |
| FR-11 | P-02, P-03 |
| FR-12 | P-01, P-03 |
| FR-13 | H-08 |
| FR-14 | H-02 |
| BR-1 | P-04, H-07 |
| BR-2 | P-01 |
| BR-3 | H-03, H-04 |
| BR-4 | H-09 |
| BR-5 | H-05 |
| BR-6 | H-08 |
| EC-1 | H-01 |
| EC-2 | H-06 |
| EC-3 | H-06 |
| EC-4 | H-05 |
| EC-5 | H-01 |
| EC-6 | P-03 |
| EC-7 | H-10 |
| EC-8 | H-08 |
| EC-9 | H-04 |
| EC-10 | H-11 |
| NFR-1 | P-09 |
| NFR-2 | H-12 |
| INV-TBD-a | P-07 |
| INV-TBD-b | P-05, P-07 |
| INV-TBD-c | P-09 |
| DEC-TBD-a | P-03, H-01 |
| DEC-TBD-b | H-08 |
