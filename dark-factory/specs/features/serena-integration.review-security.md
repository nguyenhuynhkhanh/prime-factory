## Domain Review: Security & Data Integrity

### Feature: serena-integration
### Status: APPROVED WITH NOTES

### Findings

**Blockers**: None

**Concerns**:

1. **MCP privilege escalation via tool allowlist omission** — The spec correctly requires an explicit tool allowlist in agent frontmatter (FR-3, FR-4) and explicitly excludes `mcp__serena__execute_shell_command`. However, the spec does not enumerate ALL Serena tools that must be excluded. If Serena adds new tools (e.g., `mcp__serena__write_file`, `mcp__serena__read_file_range`, `mcp__serena__run_lsp_command`), the allowlist-by-inclusion approach handles this correctly — any new tool is excluded by omission. This is good design. No action needed, but note: the allowlist is the primary security control and must be verified in tests (AC-10 covers this).

2. **Worktree path escape / directory traversal via Serena** — EC-1 addresses the case where Serena returns paths outside the worktree root. The spec requires agents to verify path prefixes. However, the spec does not specify what "treat Serena as unavailable" means for an already-in-progress session: if the warmup probe passes (correct paths) but a mid-session `find_symbol` returns an out-of-scope path (e.g., Serena's internal state drifted after a project.yml reload), the agent must not blindly pass that path to `replace_symbol_body`. The concern is a silent mid-session path drift. This is a low-probability scenario given `.serena/project.yml` is static per session, but agents should verify paths on each Serena call, not just at warmup. The spec only describes session-level decisions at warmup, not per-call path verification.

3. **`.serena/project.yml` write failure handling** — The spec's error table says "df-orchestrate logs error, proceeds with agent spawn without Serena scope file." This is correct. However, it also notes "agent will use Grep+Read (profile will likely say not detected)" — this is imprecise. The profile detection happens at onboard time, not at run time. An agent spawned without a project.yml but with a profile saying "detected" will attempt the warmup probe. The warmup probe may succeed (if Serena uses a default project root) and return main-branch paths, leading to potential main-branch corruption. The spec should clarify: if `.serena/project.yml` write fails, df-orchestrate must override the agent's Serena availability by passing `SERENA_MODE=disabled` or equivalent, not rely on the profile or agent self-detection.

4. **No `.serena/project.yml` gitignore coverage** — NFR-3 says the file "must not persist in the worktree or be merged back to the main branch." The spec relies entirely on df-orchestrate deleting it after ExitWorktree. There is no mention of adding `.serena/project.yml` (or `.serena/`) to `.gitignore` as a defense-in-depth measure. If df-orchestrate crashes or the cleanup step is skipped, the file will be committed and merged. Consider adding `.serena/` to the project's `.gitignore`.

**Suggestions**:

1. **Per-call path verification on mutation tools** — Rather than only verifying at warmup, add a requirement that before calling `replace_symbol_body` or `insert_after_symbol`, the agent checks that the target file path returned by Serena is within the known worktree root. This is a one-line guard and prevents any mid-session path drift from corrupting files outside the worktree.

2. **`SERENA_MODE=disabled` as explicit fallback** — Add `disabled` as a valid value for `SERENA_MODE` that df-orchestrate can pass when `.serena/project.yml` write fails. This removes ambiguity about whether agents should attempt Serena at all in that case.

### Key Decisions

- **Allowlist-by-inclusion is correct**: Including only specific tools in the frontmatter `tools` field is the right security model for MCP tools. Any Serena tool not listed is unavailable to the agent. The spec correctly identifies `mcp__serena__execute_shell_command` as the key exclusion.
- **Graceful degradation is the primary security mitigation for availability risks**: If Serena misbehaves (wrong paths, errors), the fallback to Grep+Read+Edit is safe. The agent never _requires_ Serena to succeed, so availability failures are contained.
- **Worktree path scoping is the primary integrity control**: Writing `.serena/project.yml` before agent spawn is the correct mechanism to prevent cross-worktree pollution. The spec's ordering guarantee (BR-6) is appropriate.
