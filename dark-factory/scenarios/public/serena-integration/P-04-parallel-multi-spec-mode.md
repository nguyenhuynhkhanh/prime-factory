# Scenario: P-04 — Parallel Multi-Spec Mode — Discovery Only, No Mutations via Serena

## Type
feature

## Priority
high — parallel mode is the common path when running multiple specs simultaneously. Mutations in parallel mode risk race conditions through a single Serena server; this scenario verifies the restriction is enforced.

## Preconditions
- df-orchestrate is running a wave with two specs simultaneously: `spec-alpha` and `spec-beta`
- Two worktrees are active:
  - `/Users/dev/project/.worktrees/spec-alpha-abc111`
  - `/Users/dev/project/.worktrees/spec-beta-abc222`
- `.serena/project.yml` has been written to both worktree roots with their respective absolute paths
- Serena MCP server is running and responsive
- `dark-factory/project-profile.md` contains: `| Serena MCP | detected — semantic queries enabled |`
- BOTH code-agents are spawned with `SERENA_MODE=read-only` in their prompt context

## Action
Both code-agents implement their respective specs concurrently. For each agent:
1. Reads `dark-factory/code-map.md` for orientation (Layer 1)
2. Warmup probe: calls `mcp__serena__find_symbol` on a known entry point — succeeds
3. Uses `mcp__serena__symbol_overview` to inspect file structure (discovery, allowed in read-only mode)
4. Uses `mcp__serena__find_referencing_symbols` to find callers (discovery, allowed)
5. Needs to edit a function body — agent recognizes `SERENA_MODE=read-only` and does NOT call `replace_symbol_body`
6. Instead, reads the target function's section with Read (Layer 3 fallback for mutations)
7. Uses Edit with `old_string` / `new_string` to apply the change

## Expected Outcome
- `mcp__serena__find_symbol` IS called (discovery — allowed in read-only mode)
- `mcp__serena__symbol_overview` IS called (discovery — allowed)
- `mcp__serena__find_referencing_symbols` IS called (discovery — allowed)
- `mcp__serena__replace_symbol_body` is NOT called by either agent
- `mcp__serena__insert_after_symbol` is NOT called by either agent
- All mutations use the Edit tool with Read-located content
- Both agents complete successfully without race conditions or Serena errors
- Both worktree edits are independent and do not interfere with each other

## Failure Mode (if applicable)
If either agent calls `replace_symbol_body` in read-only mode, both agents may attempt to mutate through the same Serena server process simultaneously, risking wrong-file edits, symbol index corruption, or silent wrong-position replacements. The restriction must be enforced by the agent's awareness of `SERENA_MODE`, not by Serena itself.

## Notes
Serena's read operations (`find_symbol`, `symbol_overview`, `find_referencing_symbols`) are safe to parallelize — they do not modify any state. The restriction is specifically on mutation operations that write through the LSP layer. Per EC-7: concurrent read queries from two agents do not conflict.
