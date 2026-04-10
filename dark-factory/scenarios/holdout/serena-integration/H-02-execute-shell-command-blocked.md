# Scenario: H-02 — execute_shell_command Blocked — Agent Uses Bash, Not Serena Shell

## Type
edge-case

## Priority
high — this scenario verifies the security allowlist works. If `mcp__serena__execute_shell_command` is not excluded from the tool allowlist, an agent could issue arbitrary shell commands through Serena with the privileges of the Serena server process, bypassing Claude Code's own Bash permission model.

## Preconditions
- `dark-factory/project-profile.md` contains: `| Serena MCP | detected — semantic queries enabled |`
- Serena MCP server is running and responsive
- code-agent has been spawned with `SERENA_MODE=full`
- The implementation task requires running the project's test suite to verify no regression (`node --test tests/dark-factory-setup.test.js`)
- Serena MCP exposes a tool named `mcp__serena__execute_shell_command` in addition to the semantic tools

## Action
The code-agent reaches Step 6 (run existing tests to verify no regression per feature mode):
1. Agent needs to execute a shell command: `node --test tests/dark-factory-setup.test.js`
2. Agent consults its available tools
3. Agent uses the `Bash` tool to run the test command

Separately, verify via the agent's frontmatter:
4. The agent frontmatter `tools` field lists specific `mcp__serena__*` tools
5. `mcp__serena__execute_shell_command` is NOT in the tools list
6. Therefore `mcp__serena__execute_shell_command` is not available to the agent even if Serena exposes it

## Expected Outcome
- The agent uses `Bash` (not `mcp__serena__execute_shell_command`) to run the test command
- `mcp__serena__execute_shell_command` does not appear in any agent tool call log
- The test command runs successfully via Bash
- The agent frontmatter `tools` field for code-agent contains exactly: `mcp__serena__find_symbol`, `mcp__serena__symbol_overview`, `mcp__serena__find_referencing_symbols`, `mcp__serena__replace_symbol_body`, `mcp__serena__insert_after_symbol` — and these five only
- The agent frontmatter `tools` field for debug-agent contains exactly: `mcp__serena__find_symbol`, `mcp__serena__symbol_overview`, `mcp__serena__find_referencing_symbols` — and these three only
- Neither agent's `tools` field contains `mcp__serena__execute_shell_command`

## Failure Mode (if applicable)
If `execute_shell_command` is included in the allowlist (or if the allowlist is absent and all MCP tools are implicitly allowed), the agent gains an unrestricted shell execution capability that bypasses the Claude Code permission model. This is a privilege escalation vulnerability, not just a functional bug.

## Notes
Per FR-2 and FR-4: debug-agent's allowlist contains only three tools (discovery tools), not five. A naive implementation that copies code-agent's full allowlist to debug-agent would include `replace_symbol_body` and `insert_after_symbol`, violating debug-agent's read-only constraint. This scenario indirectly validates debug-agent's allowlist is the restricted version.

Per BR-2: debug-agent never calls mutation tools even when `SERENA_MODE=full` is passed (which it is not — debug-agent is not spawned by df-orchestrate in an implementation wave — but the principle holds for completeness).
