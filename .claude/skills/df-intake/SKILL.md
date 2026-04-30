---
name: df-intake
description: "Start Dark Factory feature spec creation. Spawns 1 or 3 spec-agents based on scope, synthesizes into one spec. For bugs, use /df-debug instead."
---

# Dark Factory — Feature Intake (Adaptive Spec Investigation)

You are the orchestrator for the feature spec creation phase. To produce a well-rounded spec, you run spec investigations from 1 or 3 perspectives depending on feature scope, then synthesize findings into one unified spec.

## Iterative Draft-First Spec Loop

The spec-agent uses an iterative draft-first approach — it does NOT do a long silent pass. After initial developer input:

1. Spec-agent immediately produces a partial draft: "Here's what I understood — [draft]. Is this right?"
2. Spec-agent asks at most 3 questions per round about unclear items
3. Developer answers; spec-agent updates the draft in place
4. Loop ends when developer confirms the draft is complete
5. Spec-agent emits completed spec

The draft acts as a task tracker — the developer always sees the current understanding, not a changelog. This iterative draft-first pattern ensures rapid convergence and allows the developer to stop at any point with a usable partial spec.

## Trigger
```
/df-intake {raw description}
/df-intake --leads=1 {description}
/df-intake --leads=3 {description}
```

## Bug Detection
Before spawning agents, check if the developer's input describes a **bug** rather than a feature:
- Keywords: "broken", "error", "crash", "wrong", "failing", "bug", "fix", "doesn't work", "500", "null", "undefined"
- Pattern: describes current wrong behavior rather than desired new behavior

If the input looks like a bug report:
- Tell the developer: "This sounds like a bug report. Use `/df-debug {description}` instead — it uses a dedicated debug-agent that does forensic root cause analysis and impact assessment before any fix is attempted."
- **STOP** — do not spawn any agents

## Resume Detection (IMPORTANT — check before spawning any agents)

If the developer invokes `/df-intake {name}` and `dark-factory/specs/features/{name}.spec.md` already exists on disk:

1. Read `dark-factory/manifest.json`. Check if a manifest entry exists for `{name}`.
2. **Manifest entry exists AND `architectReviewedAt` is present**: architect review already completed. Tell the developer: "Spec `{name}` already has an approved architect review. Proceed with `/df-orchestrate {name}` to start implementation." Do NOT re-run Steps 1–5.6.
3. **Spec file exists BUT no manifest entry OR `architectReviewedAt` absent**: skip Steps 1–5 entirely. Resume from Step 5.6 (architect review) using the existing spec file.
4. **Spec file does NOT exist**: proceed with normal intake flow (Steps 1 through 7).

## Process

### Pre-Phase: Code Map Refresh

Before any other processing, ensure the code map is current:

1. Attempt to read `dark-factory/code-map.md` header. If the file does not exist, go to step 4.
2. Extract the `Git hash:` line value (trim whitespace). Validate it matches `/^[0-9a-f]{40}$/`. Run `git rev-parse HEAD`. If `git rev-parse HEAD` fails (no git repo, detached HEAD with no commits), log "Code map refresh skipped: git error" and proceed without a map.
3. **Hash matches exactly**: proceed immediately to Step 0. No codemap-agent invocation. Total overhead: 2 operations.
4. **Hash differs, invalid hash, or no map**: compute changed files via `git diff --name-only {stored_hash} HEAD` (or empty list if no stored hash). Invoke codemap-agent with `mode: "refresh"` (or `"full"` if no map exists), `stored_hash`, and `changed_files`.
5. **Greenfield repo** (no source files detected by codemap-agent): codemap-agent writes "No code map — no source code yet" and returns. Proceed without a map.
6. After codemap-agent completes: log a non-blocking suggestion to the developer: "Code map auto-generated. For a complete, reviewed map run `/df-onboard`."
7. Proceed to Step 0.

### Step 0: Scope Evaluation (inline — no agent spawn)

Before spawning any leads, evaluate the feature scope. This runs as YOUR reasoning, not an agent call. Emit the result block so the developer can interrupt if the evaluation is wrong.

**Parse --leads flag first:**
- If `--leads=1` and `--leads=3` are both present: emit error "Cannot specify both --leads=1 and --leads=3." and STOP.
- If `--leads=0`, `--leads=2`, or any other non-1/non-3 integer: emit error "Valid values are --leads=1 or --leads=3." and STOP.
- If `--leads=N` where N is not an integer: emit error "Valid values are --leads=1 or --leads=3." and STOP.
- Record the override value (1 or 3) if present, or null if no flag was supplied.

**Read context files:**
1. Read `dark-factory/code-map.md` — it is always present and current. Use it to understand module structure, blast radius, entry points, and hotspots. Do NOT use Grep or Glob to discover which modules exist or how they connect — that is what the map is for. DO use Read/Grep for precise implementation details on specific files the map directs you to. For scope evaluation, focus on:
   - **Shared Dependency Hotspots**: modules listed here have high blast radius
   - **Module Dependency Graph**: count modules named or implied by the description
2. Read `dark-factory/project-profile.md` if it exists. Use the Architecture section to understand module boundaries.

**Apply the five 1-lead criteria (evaluate ALL five — exhaustive, not short-circuit):**

| # | Criterion | 1-lead value |
|---|-----------|-------------|
| C1 | Files implied by description + code-map blast radius | ≤ 2 files (if code-map absent: unknown → FAILS → 3 leads) |
| C2 | Concern type | Single (no mix of user-facing + data model + operational in same description) |
| C3 | Cross-cutting keywords absent | None of: "all agents", "every", "pipeline", "system-wide", "cross-cutting", "orchestrate", "global" (case-insensitive) |
| C4 | Ambiguity markers absent | None of: "or", "not sure if", "either/or", "could also", "depends on how" (even "or" in normal phrases counts) |
| C5 | Code-map blast radius | ≤ 1 module (if code-map absent: unknown → FAILS → 3 leads) |

**Decision:**
- ALL five true → 1 lead
- ANY one false → 3 leads
- Signals conflict → 3 leads (conservative bias)

**Special cases:**
- Description is empty or whitespace-only → 3 leads ("empty description — defaulting to 3 leads")
- Description is a single word → 3 leads (insufficient signal)
- code-map.md missing → C1 and C5 both fail → 3 leads (note "code-map.md not found — defaulting to conservative 3-lead")
- project-profile.md missing → proceed without architecture context, note the gap

**Emit the scope evaluation block (BEFORE any agent spawn):**

```
Scope evaluation:
- Files implied: {N} ({source})
- Concern type: {single|mixed} — {reason}
- Cross-cutting keywords: {none|found: "{word}"}
- Ambiguity markers: {none|found: "{phrase}"}
- Code-map blast radius: {N modules|unknown — code-map.md not found}
→ {Algorithm result: 1 lead|Algorithm result: 3 leads}. {reason if not all criteria met, or "All criteria satisfied." if 1 lead}
{Override: --leads=N applied. Spawning N leads.|[omit if no override]}
```

**Record selected lead count:**
- If override present: use override value
- Otherwise: use algorithm result

---

### Step 1: Spawn spec leads

#### If 1 lead selected

Spawn **ONE spec-agent** (using the Agent tool with subagent_type `spec-agent`, `isolation: "worktree"`). This single lead covers all three original perspectives in a full-spectrum investigation.

**Full-spectrum prompt:**

> You are the sole spec lead for this feature. Cover all three perspectives: user/product, architecture, and reliability.
>
> Feature description: {raw input}
>
> Read `dark-factory/code-map.md` — it is always present and current. Use it to understand module structure, blast radius, entry points, and hotspots. Do NOT use Grep or Glob to discover which modules exist or how they connect — that is what the map is for. DO use Read/Grep for precise implementation details on specific files the map directs you to.
>
> Research the codebase, then output your findings as a structured report with ALL of these sections:
>
> **Users & Use Cases** — who uses this and how
> **Proposed Scope** — what's in/out for v1, with rationale
> **User-Facing Requirements** — functional requirements from the user's perspective
> **Acceptance Criteria** — how to verify this works for users
> **UX Edge Cases** — unexpected user behaviors to handle
> **Affected Systems** — which parts of the codebase this touches
> **Architecture Approach** — how to structure this within existing patterns
> **Data Model** — schema changes, new entities, relationships
> **API Design** — endpoints, contracts, compatibility
> **Integration Points** — how this connects to existing features
> **Technical Risks** — performance, scalability, migration concerns
> **Failure Modes** — what can go wrong and how to handle it
> **Concurrency & Race Conditions** — multi-user and timing issues
> **Security Considerations** — auth, input validation, data exposure
> **Data Integrity** — consistency guarantees needed
> **Backward Compatibility** — what existing behavior could break
> **Edge Cases** — boundary values, empty states, max limits
> **Questions for Developer** — anything unclear that needs confirmation
>
> Do NOT write any spec or scenario files — just report your findings.

#### If 3 leads selected

Take the developer's raw input and spawn **3 independent spec-agents simultaneously** (using the Agent tool with subagent_type `spec-agent`, `isolation: "worktree"`). Each gets the SAME feature description but a DIFFERENT perspective. Worktree isolation ensures each lead reads a consistent snapshot of the codebase without interference.

**All 3 must be launched in a single message** (parallel Agent tool calls).

**Lead A — User & Product Perspective**
> You are Lead A. Your perspective: **user experience and product value**.
> Focus on: who are the users, what problems this solves for them, user workflows and journeys, what "done" looks like from the user's point of view, acceptance criteria that a product manager would care about, UX edge cases (what happens when the user does something unexpected).
>
> Feature description: {raw input}
>
> Read `dark-factory/code-map.md` — it is always present and current. Use it to understand module structure, blast radius, entry points, and hotspots. Do NOT use Grep or Glob to discover which modules exist or how they connect — that is what the map is for. DO use Read/Grep for precise implementation details on specific files the map directs you to.
>
> Research the codebase, then output your findings as a structured report with these sections:
> - **Users & Use Cases**: who uses this and how
> - **Proposed Scope**: what's in/out for v1, with rationale
> - **User-Facing Requirements**: functional requirements from the user's perspective
> - **Acceptance Criteria**: how to verify this works for users
> - **UX Edge Cases**: unexpected user behaviors to handle
> - **Questions for Developer**: anything unclear from this perspective
>
> Do NOT write any spec or scenario files — just report your findings.

**Lead B — Architecture & Integration Perspective**
> You are Lead B. Your perspective: **technical architecture and system integration**.
> Focus on: how this fits into the existing architecture, which modules/services are affected, data model changes, API design, integration points with existing features, performance implications, migration strategy if needed.
>
> Feature description: {raw input}
>
> Read `dark-factory/code-map.md` — it is always present and current. Use it to understand module structure, blast radius, entry points, and hotspots. Do NOT use Grep or Glob to discover which modules exist or how they connect — that is what the map is for. DO use Read/Grep for precise implementation details on specific files the map directs you to.
>
> Research the codebase, then output your findings as a structured report with these sections:
> - **Affected Systems**: which parts of the codebase this touches
> - **Architecture Approach**: how to structure this within existing patterns
> - **Data Model**: schema changes, new entities, relationships
> - **API Design**: endpoints, contracts, compatibility
> - **Integration Points**: how this connects to existing features
> - **Technical Risks**: performance, scalability, migration concerns
> - **Questions for Developer**: anything unclear from this perspective
>
> Do NOT write any spec or scenario files — just report your findings.

**Lead C — Reliability & Edge Cases Perspective**
> You are Lead C. Your perspective: **production reliability, failure modes, and edge cases**.
> Focus on: what can go wrong, concurrency issues, partial failures, data consistency, error handling, security implications, operational concerns (monitoring, alerting, recovery), backward compatibility, what happens at scale.
>
> Feature description: {raw input}
>
> Read `dark-factory/code-map.md` — it is always present and current. Use it to understand module structure, blast radius, entry points, and hotspots. Do NOT use Grep or Glob to discover which modules exist or how they connect — that is what the map is for. DO use Read/Grep for precise implementation details on specific files the map directs you to.
>
> Research the codebase, then output your findings as a structured report with these sections:
> - **Failure Modes**: what can go wrong and how to handle it
> - **Concurrency & Race Conditions**: multi-user and timing issues
> - **Security Considerations**: auth, input validation, data exposure
> - **Data Integrity**: consistency guarantees needed
> - **Operational Concerns**: monitoring, alerting, recovery paths
> - **Backward Compatibility**: what existing behavior could break
> - **Edge Cases**: boundary values, empty states, max limits
> - **Questions for Developer**: anything unclear from this perspective
>
> Do NOT write any spec or scenario files — just report your findings.

---

### Step 2: Synthesize findings

#### If 1 lead was used

Skip synthesis — present the single lead's report directly to the developer. There are no disagreements to resolve, no perspectives to merge.

Proceed directly to Step 3.

#### If 3 leads were used

After all 3 leads complete, YOU (the orchestrator) synthesize:

1. **Merge scope proposals** — Lead A defines what users need, Lead B defines how to build it, Lead C defines what to protect against
2. **Collect all questions** — deduplicate questions from all 3 leads
3. **Identify disagreements** — where leads propose different approaches, note the tradeoffs
4. **Build unified picture**:
   - Combined scope (in/out) with rationale from all perspectives
   - Requirements that cover user needs, technical design, AND reliability
   - Edge cases from all three angles

---

### Step 3: Present to developer

#### If 1 lead was used

Present the investigation findings directly:
- Say: "Here is what the spec lead found..." or "The investigation found..."
- Do NOT say: "Lead A found...", "all leads agreed...", "there were disagreements between leads...", or any phrasing that implies multiple leads ran.
- Present the open questions from the single lead's report
- **Wait for developer to answer questions and confirm scope**

#### If 3 leads were used

Present a unified summary:
- What each lead found (brief)
- Combined proposed scope with in/out rationale
- All open questions (deduplicated, grouped by theme)
- Any disagreements between leads with tradeoff analysis
- **Wait for developer to answer questions and confirm scope**

---

### Step 4: Spec Decomposition Analysis (CRITICAL)

Before writing anything, analyze whether this feature should be **one spec or multiple smaller specs**. Smaller specs are better — they parallelize across worktrees, have fewer errors, and are easier to review.

**Decomposition rules:**

1. **Estimate total scope**: Count affected files, services, data models, API endpoints
2. **Apply the decomposition threshold**:
   - **small** (1-3 files): Keep as ONE spec
   - **medium** (4-6 files): Consider splitting if there are natural boundaries
   - **large** (7-10 files): SHOULD split into 2-3 specs
   - **x-large** (10+ files): MUST split into 3+ specs
3. **Find natural split boundaries** — each sub-spec should be independently implementable:
   - **By layer**: data model/migration → API endpoints → business logic → UI
   - **By domain**: user management, payment processing, notifications are separate domains
   - **By dependency**: foundation (schema, config, shared types) vs. features that build on it
   - **By service**: different microservices or modules are natural spec boundaries
4. **Validate independence**: Each sub-spec must be:
   - Implementable without the others being complete (or with a clear dependency order)
   - Testable in isolation (its own scenarios can pass without other specs)
   - Touching a mostly distinct set of files (minimal overlap)
5. **Check for dependencies on existing active specs**: Read `dark-factory/manifest.json` and check for existing active specs. Analyze file overlap between the new spec(s) and existing active specs. If the new spec modifies files that an existing active spec also modifies, or if the new spec depends on output from an existing active spec, mark the existing spec as a dependency. Only mark as independent if there is truly no overlap or dependency relationship.

**Dependency ordering:**
- If spec-B needs the data model from spec-A, mark spec-A as a **dependency** of spec-B
- Foundation specs (project setup, shared types, database schema) come first
- The orchestrator will use these dependencies to determine wave ordering

**Present the decomposition to the developer:**

```
## Spec Decomposition

This feature is large enough to benefit from splitting into 3 independent specs:

1. **{name}-data-model** (foundation — runs first)
   - Database schema, migrations, shared types
   - ~3 files, small scope
   - No dependencies

2. **{name}-api** (depends on: {name}-data-model)
   - REST endpoints, request validation, response formatting
   - ~4 files, medium scope

3. **{name}-business-logic** (depends on: {name}-data-model)
   - Core rules, event handlers, notifications
   - ~3 files, small scope

Execution plan: Wave 1: data-model → Wave 2: api + business-logic (parallel worktrees)

Alternatively, this could be kept as a single spec if you prefer.
```

Wait for the developer to confirm the decomposition (or choose single spec).

### Step 5: Write spec(s) and scenarios

**If single spec** (small scope or developer chose not to split):

Spawn ONE spec-agent to write the spec and scenarios:

> Write the feature spec and scenarios based on the following confirmed findings from the spec investigation.
>
> {synthesized findings}
> {developer's answers to questions}
> {developer's confirmed scope}
>
> Write the spec to `dark-factory/specs/features/{name}.spec.md`.
> Write public scenarios to `dark-factory/scenarios/public/{name}/`.
> Write holdout scenarios to `dark-factory/scenarios/holdout/{name}/`.
>
> IMPORTANT: Include an **Implementation Size Estimate** section at the end of the spec with:
> - **Scope size**: small (1-2 files changed) | medium (3-5 files) | large (6-10 files) | x-large (10+ files)
> - **Suggested parallel tracks**: how many independent code-agents could work simultaneously without conflicts. List what each track would implement. Tracks must have ZERO file overlap.
>
> The developer has confirmed the scope — proceed directly to writing.

**If multiple specs** (decomposed):

Spawn ONE spec-agent PER sub-spec **in parallel** (all in a single message, each with `isolation: "worktree"`):

For each sub-spec:
> Write a focused feature spec and scenarios for the **{sub-spec-name}** portion of the larger {name} feature.
>
> {synthesized findings from spec investigation — filtered to this sub-spec's scope}
> {developer's answers to questions}
> {this sub-spec's confirmed scope and boundaries}
>
> **Your scope is ONLY**: {specific requirements for this sub-spec}
> **Files you may touch**: {explicit file list}
> **Dependencies**: {list of other sub-specs this depends on, or "none"}
>
> Write the spec to `dark-factory/specs/features/{sub-spec-name}.spec.md`.
> Write public scenarios to `dark-factory/scenarios/public/{sub-spec-name}/`.
> Write holdout scenarios to `dark-factory/scenarios/holdout/{sub-spec-name}/`.
>
> IMPORTANT: Include a **Dependencies** section listing which other sub-specs must complete before this one can be implemented. If none, write "None — this spec is independently implementable."
>
> IMPORTANT: Include an **Implementation Size Estimate** section. This sub-spec should be small enough for 1-2 code-agents max.

After all spec-agents complete, merge their worktree branches back.

### Step 5.5: Test-Advisor Handoff

After writing spec(s) and scenarios (Step 5), before updating the manifest (Step 6), run a testability review.

1. **Spawn test-agent with `mode: advisor`** passing:
   - Spec file path(s)
   - Draft public scenario file paths
   - Draft holdout scenario file paths
   - `dark-factory/promoted-tests.json` path
   - `dark-factory/memory/index.md` path and relevant shard file paths

2. **test-agent returns structured advisory** covering: `feasibility`, `flakiness`, `dedup`, `missing` (INV-IDs only), `infrastructureGaps`.

3. **spec-agent reviews the advisory output** and MAY revise scenarios:
   - Remove scenarios flagged as `dedup` (already covered by promoted tests)
   - Flag scenarios with `infeasible` verdict
   - Add coverage for `missing` INV-IDs (if appropriate)
   - Note `infrastructureGaps` for developer awareness
   - spec-agent is authoritative — it MAY accept or reject any advisory item based on its own judgment

4. **Append a testability summary line to the intake output:**
   > Testability review: N kept, M revised, K removed as duplicate, J flagged for infrastructure.

5. **If advisor call fails or times out:**
   - If `status: timeout` or `status: error` or advisor does not complete within soft cap (~60s):
     - Proceed with original scenarios (no changes)
     - Emit warning: "Testability advisor unavailable — proceeding with original scenarios"
     - Set manifest flag `testAdvisoryCompleted: false` for this spec
   - Do NOT retry. Advisor is optional; its absence must not block.

**Information barrier:** advisor output is returned to spec-agent ONLY. It is NEVER forwarded to architect-agent. architect-agent reads only the spec — it does not see advisor output, scenario revisions, or advisory data of any kind.

### Step 5.6: Architect Review (Gate 1 — MANDATORY before manifest write)

After spec(s) and scenarios are written (and test-advisor handoff completed), run Gate 1 (architect spec review) for EACH spec. Do NOT write any manifest entry until Gate 1 passes for that spec.

**For decomposed specs**: Run architect reviews in wave order matching the `dependencies` array. Independent sub-specs (no unsatisfied dependencies) may be reviewed in parallel. A sub-spec that depends on another MUST wait until that dependency's Gate 1 is APPROVED before beginning its own review.

**Per-spec architect review process:**

1. Read the spec's `Architect Review Tier` field. If missing, unrecognized, or "Unset — architect self-assesses": default to Tier 3.

2. **Tier 1**: Spawn 1 combined architect-agent (`.claude/agents/architect-agent.md`, no domain parameter). Produces single `{name}.review.md`.

   **Tier 2/3**: Spawn 3 independent architect-agents in parallel, each with a domain parameter:
   - **Security & Data Integrity**
   - **Architecture & Performance**
   - **API Design & Backward Compatibility**

   Synthesize: **Strictest-wins** — any BLOCKED = overall BLOCKED; any APPROVED WITH NOTES = overall APPROVED WITH NOTES; otherwise APPROVED. Deduplicate overlapping findings. Write synthesized `{name}.review.md`.

3. **On BLOCKED verdict**: Spawn spec-agent with all findings. Re-spawn only blocked domains. Max 5 total rounds. If overall BLOCKED after max rounds: surface blocker details to developer (include domain, round count, specific blocker text). Do NOT write manifest entry. The spec file remains on disk. Developer re-runs `/df-intake {name}` to resume from this step.

4. **On APPROVED or APPROVED WITH NOTES verdict**:
   - Extract "Key Decisions Made" and "Remaining Notes" sections from `{name}.review.md`.
   - Write extracted findings to `dark-factory/specs/features/{name}.findings.md`. This file MUST be written before the manifest entry (Step 6). If the write fails: report the error and STOP — do NOT proceed to Step 6.
   - Proceed to Step 6 for this spec.

**Architect review rules:** The architect NEVER discusses tests or scenarios with the spec-agent. Information barrier is strictly enforced.

### Step 6: Update manifest

Update `dark-factory/manifest.json` for EACH spec (single or multiple) that passed Gate 1:
- Read the current manifest
- Run `git rev-parse HEAD` to capture the current code hash. If this fails (detached HEAD, no git repo): log "Unable to capture architectReviewedCodeHash: git error" and set hash to `null`.
- Add entries under `"features"` keyed by each spec name:
  ```json
  "{name}": {
    "type": "feature",
    "status": "active",
    "specPath": "dark-factory/specs/features/{name}.spec.md",
    "created": "{ISO timestamp}",
    "rounds": 0,
    "group": "{parent-feature-name or null}",
    "dependencies": ["{dep-spec-name}", "..."],
    "architectReviewedAt": "{ISO timestamp of Gate 1 approval}",
    "findingsPath": "dark-factory/specs/features/{name}.findings.md",
    "architectReviewedCodeHash": "{output of git rev-parse HEAD, or null if git error}"
  }
  ```
- **MANDATORY**: Every manifest entry MUST include both `group` and `dependencies` fields:
  - `"group"`: For decomposed specs, all sub-specs share the same `"group"` value (the parent feature name). For single/standalone specs, set to `null`. NEVER omit this field.
  - `"dependencies"`: Lists sub-spec names that must complete before this one. For independent specs (no dependencies), set to `[]` (empty array). NEVER omit this field.
- **MANDATORY**: Every manifest entry written after `token-opt-architect-phase` ships MUST also include `architectReviewedAt`, `findingsPath`, and `architectReviewedCodeHash`. These fields are the handshake contract with implementation-agent. A manifest entry without `architectReviewedAt` will cause implementation-agent to hard-fail.
- Write the updated manifest back

### Step 7: Present scenarios for review

After the spec(s) and scenarios are written, **show both public and holdout scenarios directly to the developer** for review. Do NOT just tell them to go read files — display the content inline:

1. Read each **public** scenario file from `dark-factory/scenarios/public/{name}/` (for each spec if decomposed)
2. Read each **holdout** scenario file from `dark-factory/scenarios/holdout/{name}/` (for each spec if decomposed)
3. Present them in a clear summary format, grouped by type:
   **Public scenarios** (visible to code-agent during implementation):
   - Scenario name, type, priority
   - Brief description of what it tests
   - The key assertion / expected outcome

   **Holdout scenarios** (hidden from code-agent, used for validation only):
   - Scenario name, type, priority
   - Brief description of what it tests
   - The key assertion / expected outcome
4. Ask the developer:
   > Here are all scenarios. Public ones guide the code-agent; holdout ones are hidden and used for validation. Do they look good?
   > - **Proceed** — start implementation with `/df-orchestrate {all-spec-names}`
   > - **Adjust** — tell me what to change and I'll update the scenarios
4. If the developer says proceed:
   - Single spec: invoke `/df-orchestrate {name}` automatically
   - Multiple specs: invoke `/df-orchestrate {name-1} {name-2} {name-3}` — the orchestrator handles dependency ordering and parallel worktrees
5. If the developer wants adjustments, update the scenarios and re-present

### Step 8: Report summary
- Spec file path(s)
- Decomposition summary (if split): how many specs, dependency order, parallel execution plan
- Number of public and holdout scenarios created per spec
- Implementation size estimate per spec

## Important
- **NEVER implement code directly.** This skill produces specs and scenarios ONLY. No code changes, no "quick fixes", no "let me just do this small thing." Every task goes through the full pipeline.
- Scope evaluation (Step 0) runs BEFORE any lead spawns — always emit the block first
- When 1 lead is selected, spawn exactly ONE spec-agent with the full-spectrum prompt
- When 3 leads are selected, ALL 3 MUST be spawned in PARALLEL (single message, 3 Agent tool calls)
- Each lead is FRESH and INDEPENDENT — no shared state
- Leads only REPORT findings — they do NOT write files
- Only the final spec-writing agent writes files
- This skill handles FEATURES only — redirect bugs to `/df-debug`
- Do NOT start implementation — only spec creation
- Do NOT read holdout scenarios yourself
- If the developer wants to refine an existing spec, read the existing spec and incorporate it into the lead prompts
