---
name: df-orchestrate
description: "Run Dark Factory implementation cycle. Spawns independent code-agent and test-agent to implement and validate a feature/bugfix."
---

# Dark Factory — Orchestrate Implementation

You are the orchestrator for the implementation phase.

## Trigger
`/df-orchestrate {feature-name}` or `/df-orchestrate {name-1} {name-2} ...`

## Worktree Isolation (IMPORTANT)

**Each independent spec implementation runs in its own git worktree.** This is the core mechanism that enables concurrent spec implementations — but only when specs are truly independent.

### Single spec: `/df-orchestrate my-feature`
1. **Enter a worktree** at the start: use the `EnterWorktree` tool to create an isolated working directory on its own branch
2. Run the entire implementation cycle (architect review → code agents → test agent → promote) inside the worktree
3. **Exit the worktree** at the end: use `ExitWorktree` to merge the branch back to the original branch

### Multiple specs: `/df-orchestrate spec-a spec-b spec-c`

**Step 1: Dependency Analysis (MANDATORY)**

Before spawning any agents, analyze ALL specs to build a dependency graph:

1. **Check the manifest first**: Read `dark-factory/manifest.json` — if specs were created by `/df-intake` decomposition, they already have `"dependencies"` and `"group"` fields that define the ordering. Use these as the primary source of truth.
2. Read every spec file provided — check the **Dependencies** section for declared dependencies on other specs
3. For each spec, also identify:
   - **Files it will create or modify** (from the spec's implementation details or your own analysis)
   - **Dependencies on other specs**: Does it reference types, APIs, schemas, or infrastructure from another spec?
   - **Foundation indicators**: Is this spec establishing architecture, data models, shared services, or project scaffolding that others build on?
4. Build a dependency graph (manifest declarations take priority, then spec declarations, then your analysis) and identify:
   - **Independent specs**: No file overlap, no dependency on other specs in the batch → can run in parallel worktrees
   - **Foundation specs**: Other specs depend on their output (e.g., project init, shared data model, core service) → must complete first
   - **Dependent specs**: Require a foundation spec to complete before they can start → run sequentially after their dependency

4. Present the execution plan to the developer:
   ```
   Dependency analysis for 4 specs:

   Wave 1 (sequential — foundation):
     - project-init (other specs depend on this architecture)

   Wave 2 (parallel worktrees):
     - user-auth (independent)
     - payment-api (independent)

   Wave 3 (sequential — depends on wave 2):
     - billing-reports (depends on payment-api data models)
   ```
5. Proceed after developer confirms the execution plan

**Step 2: Execute by Waves**

- **Wave 1**: Run foundation specs sequentially, each in its own worktree. Wait for each to complete and merge back before starting the next.
- **Wave 2+**: Run independent specs in parallel, each in its own worktree:
  - For each spec in the wave, spawn an **independent background agent** (Agent tool with `run_in_background: true`, `isolation: "worktree"`) that runs the full orchestration cycle
  - Each agent gets its own worktree — completely isolated branch and directory
  - Up to `number_of_parallel_specs × 4` code-agents can run simultaneously
  - As each agent completes, its worktree branch merges back automatically
  - Wait for ALL specs in a wave to complete before starting the next wave
- Report results to the developer as each spec completes

**Dependency detection heuristics:**
- Spec A creates a database schema → Spec B references that schema's tables → B depends on A
- Spec A sets up project structure/config → all other specs build within it → A is foundation
- Spec A creates an API → Spec B calls that API → B depends on A
- Spec A and B touch completely different files and domains → independent, can parallel
- When uncertain, ask the developer: "Does spec-b depend on spec-a completing first?"

**Worktree rules:**
- The worktree is created BEFORE any implementation work begins
- ALL implementation work happens inside the worktree (architect review, code agents, test, promote)
- Code-agents within a single spec's worktree do NOT need their own worktrees — they share the spec's worktree (use `isolation: "worktree"` only for multi-track parallel code-agents within a spec)
- Cleanup (Step 5) happens after exiting the worktree, back on the original branch
- Foundation specs MUST merge back before dependent specs start their worktrees

## Pre-flight Checks
Run these for EVERY spec name provided (fail fast — check all before starting any):
1. Check if `dark-factory/project-profile.md` exists:
   - If missing → warn the developer: "No project profile found. Run `/df-onboard` first for best results. Agents will work without it, but may miss project conventions."
   - Do NOT block — proceed with the warning
2. Verify spec exists: `dark-factory/specs/features/{name}.spec.md` OR `dark-factory/specs/bugfixes/{name}.spec.md`
3. Verify public scenarios exist: `dark-factory/scenarios/public/{name}/` has files
4. Verify holdout scenarios exist: `dark-factory/scenarios/holdout/{name}/` has files
5. If ANY spec or scenarios missing → abort with clear message listing what's missing

## Smart Re-run Detection
Check if `dark-factory/results/{name}/` has previous results:
- **No results** → proceed as "new" (full run)
- **Results exist** → ask the developer:
  - **new** — wipe results, full code-agent → test-agent cycle
  - **test-only** — skip code-agent, only run test-agent against existing code
  - **fix** — load last failure summary, send to code-agent for targeted fixes

## Detect Mode
- If spec is in `dark-factory/specs/features/` → **Feature mode**
- If spec is in `dark-factory/specs/bugfixes/` → **Bugfix mode**

---

## Architect Review (MANDATORY — both modes)

**Every spec gets 3 parallel domain-focused architect reviews. No exceptions. No gating. No skipping. Quality is non-negotiable.**

### Step 0: Extract Estimated File Count

Read the spec file and look for the **Implementation Size Estimate** section:
- If present, extract the `Estimated file count` field and record it in `dark-factory/manifest.json` as `"estimatedFiles"` (integer or null)
- If missing, set `"estimatedFiles"` to null
- Also set `"actualFiles"` to null (updated post-implementation)

### Parallel Domain Review

- Check if `{name}.review.md` already exists with APPROVED or APPROVED WITH NOTES:
  - If yes → skip review, extract and forward findings (see Findings Forwarding below)
  - If individual domain review files exist but synthesized review is missing → re-synthesize from domain files (do not re-run architects)
  - If BLOCKED or no review → run parallel domain review

**Parallel Domain Review (Pass 1):**

Spawn 3 architect-agents **in parallel** (all in a single message, each using `.claude/agents/architect-agent.md`), each with a domain parameter:

1. **Security & Data Integrity domain** — Spawn architect-agent with:
   - The spec file path, feature name, feature/bugfix mode
   - Domain: "Security & Data Integrity"
   - Instruction: focus ONLY on auth, sanitization, data exposure, migrations, concurrent writes
   - Output file: `{name}.review-security.md`

2. **Architecture & Performance domain** — Spawn architect-agent with:
   - The spec file path, feature name, feature/bugfix mode
   - Domain: "Architecture & Performance"
   - Instruction: focus ONLY on module boundaries, patterns, N+1 queries, caching, scalability
   - Output file: `{name}.review-architecture.md`

3. **API Design & Backward Compatibility domain** — Spawn architect-agent with:
   - The spec file path, feature name, feature/bugfix mode
   - Domain: "API Design & Backward Compatibility"
   - Instruction: focus ONLY on contracts, versioning, error handling, observability
   - Output file: `{name}.review-api.md`

**Critical rule**: In parallel review mode, architect-agents produce domain-specific review files but do NOT spawn spec-agents or write to the spec. Only the orchestrator synthesizes and spawns a single spec-agent for all changes.

Wait for all three to complete.

**Synthesis:**
- Read all three domain review files
- **Strictest-wins**: If ANY domain returns BLOCKED → overall status is BLOCKED
- **Contradiction detection**: If domain reviews contain contradictory recommendations (e.g., one says "add encryption" and another says "keep simple"), escalate both positions to the developer and wait for resolution
- **Deduplicate**: Remove overlapping findings that appear in multiple domain reviews
- Write synthesized review to `{name}.review.md` with backward-compatible format:
  ```
  ## Architect Review: {name}
  ### Status: {strictest status across all domains}
  ### Key Decisions Made
  - {deduplicated decisions from all domains with domain attribution}
  ### Remaining Notes
  - {deduplicated notes from all domains with domain attribution}
  ### Blockers (if BLOCKED)
  - [{domain}] {blocker description}
  ```

**If BLOCKED:**
- Spawn ONE spec-agent (features) or debug-agent (bugfixes) with all findings from all three domains
- After spec update, run verification round (Pass 2)

**Follow-up Verification (Pass 2-3):**
- Maximum 3 total passes: initial parallel (Pass 1) + up to 2 follow-ups (Pass 2, 3)
- Verification can be a single architect round covering all domains, or parallel — use judgment based on what was blocked
- If Pass 3 still has blockers → report to developer and STOP
- Update synthesized review file with final status

**If APPROVED:**
- Extract and forward findings, proceed to implementation

### Findings Forwarding to Code-Agents

After architect review completes (APPROVED or APPROVED WITH NOTES), extract findings for the code-agent:

1. Read `{name}.review.md`
2. Extract ONLY these sections (whitelist-based):
   - **"Key Decisions Made"** — architectural decisions and their rationale
   - **"Remaining Notes"** — notes on acceptable trade-offs
3. **Strip everything else** — round-by-round discussion, blocker history, domain attribution details, and any other content is NOT forwarded
4. Pass the extracted findings to code-agents as supplementary context alongside the spec and public scenarios

**If the review file has no "Key Decisions Made" section**: pass empty findings (no-op, not an error).

**For cached reviews** (re-runs where APPROVED review already exists): still read and forward findings. Cached reviews must not degrade implementation quality.

**Important rules for architect review:**
- The architect NEVER discusses tests or scenarios with the spec/debug agent
- The architect can ONLY provide information about spec gaps and ask the spec/debug agent to update the spec
- The spec/debug agent may independently update scenarios based on spec changes — that is their own decision
- If the architect and spec agent disagree, the architect escalates to the developer

---

## Feature Mode — Implementation Cycle

### Step 0.5: Determine Parallelism

Read the spec file and look for the **Implementation Size Estimate** section:
- If the section exists, read the **Suggested parallel tracks** to determine how many code-agents to spawn and what each one implements
- If the section is missing, analyze the spec yourself:
  - **small** (1-2 files): 1 code-agent
  - **medium** (3-5 files): 1-2 code-agents
  - **large** (6-10 files): 2-3 code-agents
  - **x-large** (10+ files): 3-4 code-agents

**Rules for parallel tracks:**
- Each track MUST have **zero file overlap** — no two code-agents can touch the same file
- If tracks have dependencies (e.g., Track 2 needs the data model from Track 1), run them **sequentially**, not in parallel
- When in doubt, fewer agents is safer — merging conflicting changes wastes more time than sequential execution
- Maximum 4 parallel code-agents (diminishing returns beyond that)

Tell the developer how many parallel code-agents you plan to spawn and what each will do. Proceed after confirmation (or immediately if the spec already defined the tracks).

### Round N (max 3 rounds):

**Step 1: Code Agents** (skip in test-only mode)
- Read the spec file content
- Read all public scenario files content
- If architect review findings exist (from Findings Forwarding above): include "Key Decisions Made" and "Remaining Notes" as supplementary context
- If fix mode: also include the sanitized failure summary from previous round

**If single track (small scope):**
- Spawn ONE **independent** code-agent (Agent tool) with the full spec and public scenarios
  - Tell the code-agent it is in **feature mode**
- Wait for completion

**If multiple tracks (medium-to-xlarge scope):**
- For each track, spawn an **independent** code-agent **in parallel** (all in a single message) with:
  - **`isolation: "worktree"`** — each agent gets its own git worktree (isolated branch + directory)
  - The full spec (for context)
  - All public scenarios (for context)
  - **Explicit track assignment**: which specific requirements/sections of the spec this agent is responsible for
  - **Explicit file boundaries**: which files this agent may create/modify (ONLY these files)
  - **Instruction**: "You are implementing Track N of M. ONLY create/modify the files listed in your track assignment. Other tracks are being implemented in parallel by other agents."
- Wait for ALL code-agents to complete
- **Merge worktree branches**: Each agent returns its worktree branch. Merge all branches back to the current branch sequentially:
  - `git merge <branch-1> --no-edit` then `git merge <branch-2> --no-edit` etc.
  - If a merge conflict occurs, report to developer with the conflicting files and stop
- **Verify no file conflicts**: check that no two agents modified the same file. If conflicts exist, report to developer and resolve before proceeding.

**Step 2: Test Agent**
- Spawn an **independent** test-agent (Agent tool) with:
  - The feature name (test-agent reads holdout scenarios itself)
  - The spec file path
- Wait for completion
- Read the results file from `dark-factory/results/{name}/`

**Step 3: Evaluate**
- If all passed → proceed to Step 4 (Promote)
- If failures and rounds < 3:
  - Extract ONLY the behavioral failure descriptions (NO holdout content)
  - Identify which track(s) likely caused the failure based on affected files
  - In the next round, only re-spawn code-agents for the failing tracks (unchanged tracks keep their code)
  - Go to Round N+1 with this sanitized summary
- If failures and rounds = 3 → report to developer, suggest manual review

---

## Bugfix Mode — Red-Green Cycle

The bugfix cycle enforces strict integrity: test and implementation are written in separate, verified phases. This ensures the fix actually addresses the root cause and introduces no regressions.

### Step 1: Red Phase (Prove the Bug)
- Read the debug report content
- Read all public scenario files content (reproduction cases)
- If architect review findings exist (from Findings Forwarding above): include "Key Decisions Made" and "Remaining Notes" as supplementary context
- Spawn an **independent** code-agent (Agent tool) with:
  - The debug report content
  - The public scenarios
  - If available: architect review findings (Key Decisions + Remaining Notes only)
  - Explicit instruction: **bugfix mode, Step 1 only — write the failing test, NO source code changes**
- Wait for completion
- **Verify**: Check that the code-agent ONLY created/modified test files (no source code changes)
- **Verify**: Run the test and confirm it FAILS (this proves the bug)
- If the test passes instead of failing → the test is wrong. Report to developer, do NOT proceed.

### Step 2: Green Phase (Fix the Bug)
- Spawn an **independent** code-agent (Agent tool) with:
  - The debug report content
  - The public scenarios
  - If available: architect review findings (Key Decisions + Remaining Notes only)
  - The test file path from Step 1
  - Explicit instruction: **bugfix mode, Step 2 only — implement the fix, NO test file changes**
- Wait for completion
- **Verify**: Check that the code-agent ONLY modified source files (no test changes)
- **Verify**: Run the failing test from Step 1 and confirm it now PASSES
- **Verify**: Run ALL existing tests and confirm they still pass (no regression)
- If the test still fails → the fix didn't address the root cause. Report to developer.
- If existing tests break → the fix has regression. Go back to Step 2 (max 3 rounds).

### Step 3: Holdout Validation
- Spawn an **independent** test-agent (Agent tool) with:
  - The feature name (test-agent reads holdout scenarios itself)
  - The debug report path
- Wait for completion
- Read the results file from `dark-factory/results/{name}/`
- If all passed → proceed to Step 4 (Promote)
- If failures and rounds < 3 → extract behavioral descriptions, go back to Step 2
- If failures and rounds = 3 → report to developer

## Post-Implementation Lifecycle

When all holdout tests pass:

**Step 3.1: Post-Hoc File Count**
- Count the distinct files modified during implementation (using `git diff --name-only` against the pre-implementation commit)
- Update `dark-factory/manifest.json`: set `"actualFiles"` to the count
- The delta between `estimatedFiles` and `actualFiles` is informational only — no automatic action is taken
- If the count cannot be determined, set `"actualFiles"` to null and log a warning

**Step 3.5: Exit Worktree**
- Use `ExitWorktree` to merge the spec's worktree branch back to the original branch
- All implementation work is now on the main branch
- If merge conflicts occur, report to developer and stop

**Step 4: Promote**
- Update `dark-factory/manifest.json`: set feature status to `"passed"`, record `"passed"` timestamp
- Spawn an **independent** promote-agent (Agent tool with `.claude/agents/promote-agent.md`) with:
  - The feature name
  - The holdout test file path from `dark-factory/results/{name}/`
- Wait for completion
- If promoted tests pass:
  - Update manifest: set status to `"promoted"`, record `"promotedTestPath"` and `"promoted"` timestamp
- If promoted tests fail:
  - Update manifest: set status to `"passed"` (do NOT archive)
  - Report failure to developer and STOP — do not proceed to Step 5

**Step 5: Cleanup (replaces archive)**

Tests are promoted. Specs and scenarios are in git history. No need to keep files around.

- **Commit first**: Before deleting, ensure all spec and scenario files are committed to git. Run `git status` to check. If there are uncommitted changes in the feature's files, commit them with message: "Archive {name}: spec + scenarios (promoted to permanent tests)"
- **Delete all feature artifacts**:
  - Delete `dark-factory/specs/features/{name}.spec.md` (or `bugfixes/{name}.spec.md`)
  - Delete `dark-factory/specs/features/{name}.review.md` (and any domain review files)
  - Delete `dark-factory/scenarios/public/{name}/` directory
  - Delete `dark-factory/scenarios/holdout/{name}/` directory
  - Delete `dark-factory/results/{name}/` directory
- **Remove from manifest**: Remove the feature entry from `dark-factory/manifest.json` entirely (don't let it grow forever)
- **Commit the deletion**: `git add -A dark-factory/ && git commit -m "Cleanup {name}: artifacts deleted, tests promoted"`
- Report: promoted test path, all artifacts cleaned up

## Information Barrier Rules
- NEVER pass holdout scenario content to the code-agent
- NEVER pass public scenario content to the test-agent
- NEVER pass test/scenario content to the architect-agent
- The architect-agent communicates ONLY about spec content with spec/debug agents — never about tests
- Each agent spawn is completely independent (fresh context)
- Only pass: spec content, scenario content (appropriate type), sanitized failure summaries, and architect review findings (Key Decisions Made + Remaining Notes ONLY)
- Findings forwarding is whitelist-based: ONLY "Key Decisions Made" and "Remaining Notes" sections from the review file are forwarded to code-agents — all other content (round discussion, blocker history, domain details) is stripped
