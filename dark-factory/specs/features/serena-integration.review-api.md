## Domain Review: API Design & Backward Compatibility

### Feature: serena-integration
### Status: APPROVED WITH NOTES

### Findings

**Blockers**: None

**Concerns**:

1. **`SERENA_MODE` default contract is under-specified** — The error table specifies: "If `SERENA_MODE` not present in agent context → agent defaults to read-only mode." This is a reasonable default, but it is only mentioned once in the error table, not in the business rules or requirements. BR-1 says `SERENA_MODE=read-only` is set for multi-spec parallel, and `SERENA_MODE=full` for single-spec. There is no explicit requirement stating what the default behavior is when neither is present. FR-7 says df-orchestrate MUST pass `SERENA_MODE`, so absence should never happen — but when it does (bugs, edge cases), the behavior should be explicitly defined in a business rule, not buried in the error table.

2. **Backward compatibility: existing code-agent and debug-agent callers** — This feature modifies `code-agent.md` and `debug-agent.md` which are spawned by df-orchestrate and the implementation-agent. Any existing caller that does not pass `SERENA_MODE` in the prompt context will get read-only behavior (per the error table default). This is backward-compatible. However, the spec does not explicitly state that existing df-orchestrate invocations without `SERENA_MODE` will continue to work. A backward-compatibility statement should be explicit.

3. **`onboard-agent.md` detection writes to project profile — format contract** — FR-10 and the Data Model section specify the exact strings to write:
   - `| Serena MCP | detected — semantic queries enabled |`
   - `| Serena MCP | not detected — agents will use Read/Grep |`
   These strings are consumed by agents (BR-5: "Agents read Serena availability from the project profile"). The consumption side specifies agents check for "not detected" — but if the profile was generated before this feature was implemented (i.e., no Serena row exists at all), what should agents do? The spec does not address the "row absent" case. Agents should default to attempting the warmup probe if the profile has no Serena row (treat "absent" as "unknown, probe at runtime").

4. **Init script — no version guard or migration path** — `scripts/init-dark-factory.js` generates agent content for target projects. Projects that have already run `init-dark-factory.js` will have old agent files (without Serena policy). There is no mechanism to update existing installed copies. The spec correctly defers installation management to the developer, but it should state explicitly that existing installations require re-running `init-dark-factory.js` to get Serena support. This is a deployment concern, not a breaking change, but should be documented.

5. **Dual-source-of-truth error surface** — The spec acknowledges the `.md` file / init script dual-source-of-truth problem. The test suite (AC-10, FR-12) verifies phrase presence in `.md` files but does NOT verify that the init script output matches the `.md` files. If the init script generator drifts from the `.md` file, target project installations will have different behavior than the source `.md` files — and no test will catch it. This is a structural gap in the test strategy. The spec should add an assertion: init script output for code-agent contains the Serena policy phrases (verifying the generator, not just the `.md` file). AC-9 says the init script is "updated to mirror" but AC-10 only tests the `.md` files and df-orchestrate.

**Suggestions**:

1. **Add BR for `SERENA_MODE` default** — Add a business rule: "If `SERENA_MODE` is absent from agent context, agent treats it as `read-only`. This ensures backward compatibility with any df-orchestrate invocation that predates this feature." Move this from the error table to the business rules section for clarity.

2. **Profile "absent" handling** — Add to BR-5: "If the project profile contains no Serena row (profile was generated before this feature), agents default to attempting the warmup probe — treat 'absent' as 'unknown.'" This completes the contract for partially-migrated installations.

3. **AC-9 refinement** — Strengthen AC-9: "init-dark-factory.js, when run on a Node.js/generic project, generates code-agent content that contains the 3-layer Serena policy phrase and the five Serena tool names in the tools list." This closes the test gap where the init script could silently drift from the `.md` source.

### Key Decisions

- **Opt-in, fail-silent design is the correct contract** for this feature: adds capability for users who have Serena, zero impact for users who don't. NFR-1 (transparent unavailability) is the right call.
- **Allowlist in frontmatter `tools` field** is the correct mechanism for MCP tool restriction. The five tools for code-agent and three for debug-agent are the right scope (least privilege).
- **Project profile as the configuration layer** (BR-5) is appropriate: one canonical source of truth for Serena availability, written at onboard time, consumed by all agents. Avoids each agent probing independently.
- **No version pinning, no lifecycle management** is the right scope for v1. Serena server management is a developer responsibility; Dark Factory is a consumer.
