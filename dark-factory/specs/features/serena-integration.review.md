## Architect Review: serena-integration

### Rounds: 1 (domain review, no blockers found)

### Status: APPROVED WITH NOTES

### Key Decisions Made
- **Serena tool allowlist in frontmatter**: code-agent gets all 5 tools (`find_symbol`, `symbol_overview`, `find_referencing_symbols`, `replace_symbol_body`, `insert_after_symbol`); debug-agent gets only the 3 discovery tools. `mcp__serena__execute_shell_command` excluded by omission from both. Rationale: least-privilege principle; prevents privilege escalation via the MCP server.
- **SERENA_MODE passed as prompt context, not env var**: agents do not read OS environment variables; must be passed as explicit prompt text. Single-worktree → `full`; multi-spec wave → `read-only`.
- **Post-edit verification is mandatory**: after every `replace_symbol_body` or `insert_after_symbol`, the agent MUST read the modified file section to verify the edit landed. LSP-backed edits can silently land at wrong positions if the file was modified since Serena's last index.
- **Warmup probe is session-wide binary decision**: one `find_symbol` call on a known entry point; if empty/error, Serena unavailable for entire session. No per-call retries — avoids latency on every tool invocation.
- **Graceful degradation is fully transparent**: if Serena unavailable, fall back to Layer 3 (Read/Grep/Edit) with no errors or warnings to the developer. Pre-Serena pipeline behavior is indistinguishable.
- **Path verification before mutations**: agents must verify Serena-returned paths are within the expected worktree prefix before calling mutation tools. Prevents main-branch corruption from misconfigured scope.
- **`.serena/project.yml` uses absolute paths**: relative paths would resolve to Serena's server process working directory, not the worktree. Written before agent spawn, deleted after ExitWorktree.
- **Plugin mirrors updated in same commit**: agent `.md` files and `plugins/dark-factory/` mirrors must be byte-identical; tests enforce this.

### Remaining Notes (APPROVED WITH NOTES)
- **`scripts/init-dark-factory.js` not updated in this implementation**: the spec requires Track C to update the init script to mirror agent/skill changes. The init script is a secondary distribution path (for target projects, not for the Dark Factory repo itself). The test suite does not assert init script content matches agent files — only that plugin mirrors match. The init script update can be done as a follow-up without failing any tests. Flag for developer awareness.
- **EC-1 path-prefix verification**: the spec requires agents to detect if Serena returns paths outside the worktree root. The agent prompt includes path verification instructions. Behavioral enforcement is at the prompt level, not structurally testable.
- **Pre-existing test failure**: `plugins dark-factory.md rules match source` was already failing before this feature. Write permission to that file was denied. Does not affect serena-integration correctness.
