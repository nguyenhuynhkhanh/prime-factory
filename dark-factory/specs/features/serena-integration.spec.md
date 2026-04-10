# Feature: serena-integration

## Context

Dark Factory agents — particularly code-agent and debug-agent — currently discover and modify code using Grep+Read+Edit patterns. A typical edit cycle looks like this: Grep to find the target function, Read the entire file to get context, then Edit with the full old function body as `old_string`. For files of any meaningful size, this means the entire file content flows through context on every mutation. Across 10–20 edits per implementation cycle, the cumulative token cost is significant and the majority of those tokens are context that the agent already has or could derive symbolically.

Serena MCP is an LSP-backed MCP server that provides symbol-level operations. It can locate a symbol by name and return its file path and position without reading the file. It can replace a function body by symbol name without the caller needing to supply the old content. This reduces the per-edit token cost from O(file size) to O(symbol size).

This feature integrates Serena MCP as a third layer in the search and editing policy for code-agent and debug-agent only. The two-layer policy established by `codemap-pipeline` (code-map.md for orientation, Read/Grep for precision) becomes a three-layer policy: code-map.md, then Serena semantic tools, then Read/Grep as last resort. Serena is opt-in and degrades gracefully — if it is not installed or not running, agents fall back to the existing Grep+Read+Edit pattern identically to today.

## Scope

### In Scope (this spec)

- 3-layer search policy added to `code-agent.md` and `debug-agent.md`
- Serena tool allowlist declared in agent frontmatter (both agents): five specific `mcp__serena__*` tools only
- `SERENA_MODE` context variable passed by df-orchestrate to agents: `full` (single worktree) or `read-only` (parallel multi-spec wave), determining which Serena tools are available
- `.serena/project.yml` written to each worktree directory by df-orchestrate before any agent is spawned, scoping Serena's LSP root to the worktree
- Post-edit verification step: after every `replace_symbol_body` or `insert_after_symbol`, agent reads the modified file to verify the edit landed; falls back to Edit on verification failure
- LSP warmup probe: first Serena tool use in an agent session calls `find_symbol` on a known entry point; if empty or error, Serena is marked unavailable for the entire session
- Graceful degradation: if Serena is unavailable (not installed, not running, warmup failed), agents fall back to Grep+Read+Edit with no errors or warnings to the developer
- Serena detection added to `onboard-agent.md` Phase 2 (Tech Stack identification); detection result written to project profile as `Serena MCP: detected — semantic queries enabled` or `Serena MCP: not detected — agents will use Read/Grep`
- `df-orchestrate/SKILL.md` updated to: write `.serena/project.yml` per worktree, detect single vs. multi-worktree mode, pass `SERENA_MODE` in agent context, clean up `.serena/project.yml` on worktree exit
- `scripts/init-dark-factory.js` updated to mirror all agent and skill prompt changes (dual-source-of-truth)
- `tests/dark-factory-setup.test.js` updated with new assertions for Serena policy phrases, allowlist presence, and worktree-scoping logic in df-orchestrate

### Out of Scope (explicitly deferred)

- Integration with agents other than code-agent and debug-agent (spec-agent, architect-agent, test-agent, promote-agent, onboard-agent, codemap-agent do not use Serena for mutations; the token impact is concentrated in code-agent and debug-agent, so v1 targets only those two)
- Serena server lifecycle management (starting, stopping, health-checking the Serena process is the developer's responsibility — Dark Factory does not manage the MCP server process)
- Concurrent-worktree Serena support (full mutation access for multiple simultaneous worktrees is blocked by the single-server race condition; this requires upstream Serena to support isolated sessions per worktree root, which is not available in v1)
- Serena tool telemetry or token-savings measurement (no instrumentation of tool call frequency or token counts)
- Automatic Serena installation or version pinning
- Per-symbol caching of Serena results across tool calls within a session

### Scaling Path

If Serena adds session isolation (a separate LSP instance per project root), the `read-only` restriction in parallel mode can be lifted without any other change — only the df-orchestrate mode detection and the conditional in agent prompts need updating. The `.serena/project.yml` worktree-scoping mechanism is already in place.

If Serena expands to other agents (e.g., codemap-agent for faster module scanning), the same 3-layer policy and allowlist pattern can be replicated into those agent files. The pattern is established in v1; adoption is incremental.

## Requirements

### Functional

- FR-1: `code-agent.md` MUST describe the 3-layer search policy: (1) read code-map.md for structural orientation, (2) use Serena semantic tools for symbol discovery and editing, (3) fall back to Read/Grep as last resort or when Serena is unavailable. — Formalizes the policy so the agent follows it consistently.
- FR-2: `debug-agent.md` MUST describe the same 3-layer policy, but Serena use is limited to discovery tools only (`find_symbol`, `symbol_overview`, `find_referencing_symbols`). Debug-agent NEVER uses mutation tools (`replace_symbol_body`, `insert_after_symbol`) even in single-worktree mode. — Debug-agent is a read-only investigator; mutations are not in its role.
- FR-3: Agent frontmatter for `code-agent.md` MUST include an explicit tool allowlist that permits exactly these five Serena tools: `mcp__serena__find_symbol`, `mcp__serena__symbol_overview`, `mcp__serena__find_referencing_symbols`, `mcp__serena__replace_symbol_body`, `mcp__serena__insert_after_symbol`. All other Serena tools (including `mcp__serena__execute_shell_command`) are excluded by omission. — Prevents privilege escalation via the MCP server.
- FR-4: Agent frontmatter for `debug-agent.md` MUST include an explicit tool allowlist permitting only the three discovery tools: `mcp__serena__find_symbol`, `mcp__serena__symbol_overview`, `mcp__serena__find_referencing_symbols`. Mutation tools are excluded. — Least-privilege for the investigator role.
- FR-5: `df-orchestrate/SKILL.md` MUST write `.serena/project.yml` into each worktree directory before spawning any agent. The file content is: `project_root: {absolute-path-to-worktree}`. — Without this, Serena returns paths from the main repo and agents corrupt main-branch files.
- FR-6: `df-orchestrate/SKILL.md` MUST detect whether a run is single-worktree (one spec) or multi-spec parallel (multiple specs in a wave). Single-worktree receives `SERENA_MODE=full`; multi-spec parallel receives `SERENA_MODE=read-only`. — Prevents the race condition where multiple agents simultaneously issue mutations through a single Serena server process.
- FR-7: `df-orchestrate/SKILL.md` MUST pass `SERENA_MODE` in the agent prompt context when spawning code-agents (not as an environment variable, but as an explicit line in the prompt context, e.g., "Serena mode: full" or "Serena mode: read-only"). — Claude Code agents do not read OS environment variables; context must be passed in the prompt.
- FR-8: After every `replace_symbol_body` or `insert_after_symbol` call, the agent MUST read the modified file section to verify the edit landed. If the read does not confirm the expected content, the agent MUST fall back to Edit with Grep-located content for that change. — LSP-backed edits can silently land at wrong positions if the file was modified since Serena's last index; post-edit verification is the safety net.
- FR-9: The first Serena tool call in any agent session MUST be a warmup probe: call `find_symbol` on a known entry point. If the result is empty or errors, mark Serena unavailable for the entire session and use Grep+Read for all subsequent work in that session. One probe, binary decision, no retries. — Avoids per-call latency from repeated fallback checks; a single upfront probe makes the decision session-wide.
- FR-10: `onboard-agent.md` Phase 2 MUST include a Serena detection step: check whether Serena MCP tools are available in the tool list. Write the detection result to the project profile. — Agents condition their Serena use on the project profile setting, so the profile must reflect current availability.
- FR-11: `scripts/init-dark-factory.js` MUST be updated to mirror every change made to `code-agent.md`, `debug-agent.md`, `onboard-agent.md`, and `df-orchestrate/SKILL.md`. — Dual-source-of-truth: agent files in this repo and the init script generator both define agent content. Changes in one must be reflected in the other.
- FR-12: `tests/dark-factory-setup.test.js` MUST include new assertions verifying: (a) code-agent contains the 3-layer policy phrase, (b) debug-agent contains the discovery-only restriction phrase, (c) code-agent frontmatter lists the five allowed Serena tools, (d) df-orchestrate writes `.serena/project.yml` per worktree (phrase check), (e) df-orchestrate passes SERENA_MODE in agent context (phrase check). — Structural tests are the project's quality gate; every new behavioral requirement must be backed by a test assertion.

### Non-Functional

- NFR-1: Serena unavailability MUST be fully transparent to the developer — no error messages, no warnings in output, no pipeline degradation. The fallback to Grep+Read+Edit must be indistinguishable from the pre-Serena pipeline from the developer's perspective. — Opt-in, fail-silent: the developer who doesn't have Serena installed experiences no change.
- NFR-2: The `.serena/project.yml` file written by df-orchestrate MUST use absolute paths for `project_root`. A relative path would resolve relative to whatever directory Serena's server process is running from, which may not be the worktree. — Correctness requirement: Serena must scope to the worktree, not an ambiguous relative path.
- NFR-3: `.serena/project.yml` MUST be cleaned up (deleted) by df-orchestrate after ExitWorktree completes. The file must not persist in the worktree or be merged back to the main branch. — Prevents stale scope config from affecting future runs on the same worktree path.

## Data Model

No database, schema, or config file changes. The only new persistent artifact is `.serena/project.yml`, a transient YAML file written per worktree and deleted on worktree exit.

Format:
```yaml
project_root: /absolute/path/to/worktree
```

This file is created and deleted within a single df-orchestrate run. It is never committed.

The project profile gains one new line in the Tech Stack section:
```
| Serena MCP | detected — semantic queries enabled |
```
or:
```
| Serena MCP | not detected — agents will use Read/Grep |
```

## Migration & Deployment

N/A — no existing data affected.

This feature modifies markdown agent/skill files and one JavaScript init script. There are no runtime data stores, no schema changes, no cached values, and no deployed services. Changes take effect immediately on next pipeline invocation. Rollback is a git revert with no data consequences.

The only files that change are:
- `.claude/agents/code-agent.md`
- `.claude/agents/debug-agent.md`
- `.claude/agents/onboard-agent.md`
- `.claude/skills/df-orchestrate/SKILL.md`
- `scripts/init-dark-factory.js`
- `tests/dark-factory-setup.test.js`

## API Endpoints

Not applicable. Dark Factory has no HTTP API.

## Business Rules

- BR-1: Serena mutation tools (`replace_symbol_body`, `insert_after_symbol`) are ONLY available when `SERENA_MODE=full`, which is set only in single-worktree mode. Multi-spec parallel mode always receives `SERENA_MODE=read-only`, disabling mutations regardless of Serena availability. — A single Serena server process cannot safely serve concurrent mutation requests across multiple worktrees pointing at different directory roots.
- BR-2: Debug-agent NEVER uses mutation tools, even in `SERENA_MODE=full`. Discovery tools only. — Debug-agent is a read-only investigator; its role contract prohibits code changes.
- BR-3: Post-edit verification is mandatory after every mutation tool call. It is not optional even when the mutation appears to succeed. — Silent wrong-position edits are the primary risk with LSP-backed mutations; verification is the safety net, not an optimization.
- BR-4: The warmup probe is performed once per session, on the first Serena tool call. It is not retried. If it fails, Serena is unavailable for that entire session — subsequent calls do NOT re-probe. — Retrying per-call would add latency on every tool invocation; binary session-level decision avoids this.
- BR-5: Agents read Serena availability from the project profile (`dark-factory/project-profile.md`) before attempting any Serena call. If the profile says "not detected", agents skip the warmup probe entirely and go directly to Grep+Read. — Avoids probe latency when Serena is known to be absent.
- BR-6: `.serena/project.yml` is written BEFORE any agent is spawned in a worktree, and deleted AFTER ExitWorktree completes. No agent session should begin before the scope file exists. — Race condition prevention: if the file is written after the agent starts, the agent may issue Serena calls before the scope is set.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| Serena not installed | Warmup probe fails → mark unavailable → use Grep+Read for all subsequent work | None visible to developer |
| Serena running but returns empty on warmup probe | Same as not installed — mark unavailable, use Grep+Read | None visible to developer |
| `replace_symbol_body` returns error | Log internal warning, fall back to Edit with Grep-located content for that change | Serena NOT marked unavailable for session; next symbol edit will try Serena again |
| `replace_symbol_body` succeeds but post-edit verification fails | Fall back to Edit with Grep-located content for that change | Same as above — Serena stays available |
| `find_symbol` returns empty (symbol not found) | Fall back to Grep for that specific symbol lookup | Serena stays available; empty result is not a failure |
| `.serena/project.yml` write fails (permissions, missing parent dir) | df-orchestrate logs error, proceeds with agent spawn without Serena scope file; agent will use Grep+Read (profile will likely say not detected) | Serena effectively unavailable for that worktree; pipeline continues |
| `SERENA_MODE` not present in agent context | Agent defaults to read-only mode (treat as `SERENA_MODE=read-only`) | Mutation tools not used; discovery tools available if warmup passes |

## Acceptance Criteria

- [ ] AC-1: `code-agent.md` contains the 3-layer search policy: code-map.md → Serena semantic tools → Read/Grep fallback.
- [ ] AC-2: `code-agent.md` frontmatter `tools` field lists exactly the five allowed `mcp__serena__*` tools. `mcp__serena__execute_shell_command` is absent.
- [ ] AC-3: `debug-agent.md` contains the 3-layer policy restricted to discovery tools only; mutation tools are explicitly excluded from its policy description and frontmatter.
- [ ] AC-4: `df-orchestrate/SKILL.md` writes `.serena/project.yml` with an absolute `project_root` path before spawning any agent in a worktree.
- [ ] AC-5: `df-orchestrate/SKILL.md` passes `SERENA_MODE=full` for single-worktree runs and `SERENA_MODE=read-only` for multi-spec parallel runs.
- [ ] AC-6: `onboard-agent.md` detects Serena MCP availability during Phase 2 and writes the detection result to the project profile.
- [ ] AC-7: When Serena is unavailable (not installed), pipeline execution is identical to pre-Serena behavior — no errors, no warnings, no degraded output.
- [ ] AC-8: After every `replace_symbol_body` or `insert_after_symbol`, the agent reads the modified file to verify the edit; if verification fails, it falls back to Edit.
- [ ] AC-9: `scripts/init-dark-factory.js` generator functions are updated to mirror all agent/skill content changes.
- [ ] AC-10: New assertions in `tests/dark-factory-setup.test.js` verify the Serena policy phrases, the tool allowlist, and the df-orchestrate worktree-scoping behavior.

## Edge Cases

- EC-1: Agent runs in a worktree where `.serena/project.yml` was not written (write failed, or df-orchestrate bug). Serena warmup probe may return paths from the main repo root. Agent must detect that paths returned by Serena do not fall within the expected worktree path prefix and treat Serena as unavailable for that session. — Prevents corruption of main-branch files from a misconfigured Serena scope.
- EC-2: Warmup probe succeeds (Serena is available), but mid-session the Serena server crashes. Subsequent Serena calls return errors. Each error triggers a per-call fallback to Grep+Read (not a session-level re-evaluation). The agent continues with the current task using Grep+Read for remaining edits. — Post-crash error handling is per-call, not session-level; the binary session decision was made at warmup.
- EC-3: `SERENA_MODE=full` is passed, but the agent is actually in a wave with multiple simultaneous worktrees (orchestrator misconfiguration). The agent must not detect this on its own — mode detection is the orchestrator's responsibility. The spec's correctness guarantee is at the df-orchestrate level. — Agents trust the mode they are given; they do not re-verify worktree count.
- EC-4: A symbol has the same name in multiple files (e.g., a `validate` function in two different modules). `find_symbol` returns multiple matches. Agent must use the result that matches the file context already established (from code-map.md or prior Grep), not arbitrarily pick the first result. — Ambiguous symbol names are common; agents must disambiguate using file context.
- EC-5: `replace_symbol_body` is called and reports success. Post-edit verification reads the file and the new content is present, but at a different line than expected (the symbol exists but the edit moved it). Verification passes if the content is correct — line number shift is not a failure. — LSP-backed edits may shift line numbers in surrounding code; content correctness is the criterion, not position.
- EC-6: Serena is detected in the project profile but the MCP server is not running when the agent session starts. The warmup probe fails. Agent falls back to Grep+Read for the entire session. No error is surfaced to the developer. — Detection in the profile reflects availability at onboard time, not at agent run time; runtime availability is determined by the warmup probe.
- EC-7: Two code-agents in `SERENA_MODE=read-only` both call `find_symbol` simultaneously for the same symbol. Both queries return correct results with no race condition, because Serena read operations are safe to parallelize. — Read-only mode safety: concurrent discovery queries do not conflict.

## Dependencies

- **Depends on**: `codemap-pipeline` — both `code-agent.md` and `debug-agent.md` are modified by `codemap-pipeline` to add the 2-layer search policy (code-map.md orientation + Read/Grep). This feature extends that policy to 3 layers. Implementing before `codemap-pipeline` would mean overwriting the 2-layer policy language with 3-layer language; then when `codemap-pipeline` implements, it would overwrite back to 2-layer, dropping Serena. The correct order is: `codemap-pipeline` establishes the 2-layer base, then `serena-integration` extends it to 3 layers.
- **Depended on by**: None currently active.
- **No overlap with**: `adaptive-lead-count` — zero shared files; can implement in parallel with `adaptive-lead-count` but only after `codemap-pipeline`.
- **Group**: null (standalone feature)

## Implementation Size Estimate

- **Scope size**: large (6 files changed across 4 categories)
- **File count**: 6 files (`code-agent.md`, `debug-agent.md`, `onboard-agent.md`, `df-orchestrate/SKILL.md`, `scripts/init-dark-factory.js`, `tests/dark-factory-setup.test.js`)

**Suggested parallel tracks (ZERO file overlap between tracks):**

Track A — Agent Policy Files:
- `.claude/agents/code-agent.md` — add 3-layer policy, Serena tool usage instructions (warmup probe, post-edit verification, `SERENA_MODE` branching), update frontmatter `tools` field with five Serena allowlist entries
- `.claude/agents/debug-agent.md` — add 3-layer policy (discovery only), update frontmatter `tools` field with three Serena discovery allowlist entries
- `.claude/agents/onboard-agent.md` — add Serena detection step to Phase 2 (check MCP tool list), write detection result to project profile

Track B — Orchestrate + Tests:
- `.claude/skills/df-orchestrate/SKILL.md` — add `.serena/project.yml` write before agent spawn, single vs. multi-worktree detection, `SERENA_MODE` context passing, cleanup on ExitWorktree
- `tests/dark-factory-setup.test.js` — add assertions for Serena policy phrases (code-agent, debug-agent), allowlist tool names, df-orchestrate worktree-scoping behavior

Track C — Init Script Mirror (depends on A + B completing first):
- `scripts/init-dark-factory.js` — update generator functions for code-agent, debug-agent, onboard-agent, and df-orchestrate to match the `.md` file changes from Tracks A and B

Track C must wait for Tracks A and B because the init script must mirror final content. Tracks A and B can execute in parallel.

## Implementation Notes

**What changes in each file:**

`.claude/agents/code-agent.md`:
- Update frontmatter `tools` field: add `mcp__serena__find_symbol`, `mcp__serena__symbol_overview`, `mcp__serena__find_referencing_symbols`, `mcp__serena__replace_symbol_body`, `mcp__serena__insert_after_symbol`
- Add a new "Search and Edit Policy" section (or update the existing "General Patterns" section) with the 3-layer policy:
  1. Read `dark-factory/code-map.md` for structural orientation (which modules, blast radius, entry points)
  2. Use Serena semantic tools for symbol discovery and editing (if available and `SERENA_MODE` permits)
  3. Fall back to Read/Grep as last resort or when Serena is unavailable
- Add `SERENA_MODE` branching: if `SERENA_MODE=full`, mutation tools (`replace_symbol_body`, `insert_after_symbol`) are available; if `SERENA_MODE=read-only`, use Serena for discovery only and Edit for mutations
- Add warmup probe instruction: first Serena call in session must be `find_symbol` on a known entry point; if empty/error, mark unavailable for session
- Add post-edit verification: after every `replace_symbol_body` or `insert_after_symbol`, read the modified file to verify; fallback to Edit if verification fails
- Add project profile check: read Serena availability from profile before attempting Serena; skip probe if profile says not detected

`.claude/agents/debug-agent.md`:
- Update frontmatter `tools` field: add `mcp__serena__find_symbol`, `mcp__serena__symbol_overview`, `mcp__serena__find_referencing_symbols`
- Add 3-layer policy to investigation instructions (Phase 2 / Phase 3): code-map.md → Serena discovery tools → Read/Grep. Explicitly state mutation tools are NOT available regardless of mode.
- Same warmup probe and graceful degradation instructions as code-agent, minus the mutation-tool sections

`.claude/agents/onboard-agent.md`:
- Add to Phase 2 (Tech Stack): a detection step after identifying external services: "Check whether Serena MCP tools are available in the MCP tool list. Write to project profile under Tech Stack: `| Serena MCP | detected — semantic queries enabled |` or `| Serena MCP | not detected — agents will use Read/Grep |`"

`.claude/skills/df-orchestrate/SKILL.md`:
- In the Worktree Isolation section: before spawning any agent, write `.serena/project.yml` to the worktree root:
  ```yaml
  project_root: {absolute-path-to-worktree}
  ```
- Single-spec mode: pass `SERENA_MODE=full` in agent prompt context
- Multi-spec wave mode (multiple code-agents simultaneously): pass `SERENA_MODE=read-only` in agent prompt context
- After ExitWorktree: delete `.serena/project.yml`

`scripts/init-dark-factory.js`:
- Update the generator functions for code-agent, debug-agent, onboard-agent, and df-orchestrate to match content of the updated `.md` files exactly
- These are template literal strings — escaped backticks are the main fragility; review carefully

`tests/dark-factory-setup.test.js`:
- Add assertions: code-agent contains "3-layer search policy" or the Serena tool policy phrase
- Add assertions: code-agent frontmatter tools includes all five `mcp__serena__*` tool names
- Add assertions: debug-agent contains discovery-only Serena restriction phrase
- Add assertions: debug-agent frontmatter tools includes three discovery `mcp__serena__*` tool names (and does NOT include mutation tool names)
- Add assertions: df-orchestrate contains `.serena/project.yml` phrase (worktree scoping)
- Add assertions: df-orchestrate contains `SERENA_MODE` phrase (mode passing)

**Dual-source-of-truth warning**: Per the project profile, agent content exists in BOTH the `.claude/agents/*.md` files AND the generator functions in `scripts/init-dark-factory.js`. Track C must update both. This is the most fragile part of the codebase due to escaped backticks in template literals.

**Pattern to follow**: See `.claude/agents/code-agent.md` "General Patterns" section for the existing code-map.md reference style. The 3-layer Serena policy extends that section rather than replacing it.

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01 (3-layer policy, Serena used for discovery + mutation) |
| FR-2 | P-01 notes (debug-agent discovery only); H-02 (execute_shell_command blocked for debug-agent) |
| FR-3 | P-04 (parallel mode, allowlist implicit); H-02 (execute_shell_command excluded) |
| FR-4 | H-02 (debug-agent discovery-only allowlist) |
| FR-5 | P-03 (worktree path scoping) |
| FR-6 | P-04 (parallel mode read-only) |
| FR-7 | P-04 (SERENA_MODE passed in context) |
| FR-8 | H-01 (post-edit verification) |
| FR-9 | H-03 (LSP warmup probe, session-wide decision) |
| FR-10 | P-01 notes (profile detection drives usage) |
| FR-11 | (covered by test assertions in AC-9, AC-10) |
| FR-12 | P-01, P-02, P-03, P-04 (all test assertions) |
| BR-1 | P-04 (multi-spec mode disables mutations) |
| BR-2 | H-02 (debug-agent never calls mutation tools) |
| BR-3 | H-01 (post-edit verification mandatory) |
| BR-4 | H-03 (warmup probe binary, no retry) |
| BR-5 | P-02 (graceful degradation when not installed) |
| BR-6 | P-03 (project.yml written before agent spawn) |
| EC-1 | P-03 (worktree path verification) |
| EC-2 | H-01 (mid-session fallback on verify failure) |
| EC-4 | (covered by design note; no dedicated scenario — symbol disambiguation is an implementation detail, not a behavioral contract) |
| EC-5 | H-01 (verification passes on content, not line number) |
| EC-6 | P-02 (runtime unavailability despite profile detection) |
| EC-7 | P-04 (concurrent read queries safe in read-only mode) |
