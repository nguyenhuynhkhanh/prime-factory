# Scenario: P-03 — Worktree Path Correctly Scoped — Edits Land in Worktree, Not Main Branch

## Type
feature

## Priority
critical — incorrect Serena scoping is a data-corruption risk. If Serena returns paths from the main repo instead of the worktree, agents overwrite main-branch files during implementation. This is the highest-severity failure mode.

## Preconditions
- df-orchestrate is implementing spec `my-feature` in a git worktree at path `/Users/dev/project/.worktrees/my-feature-abc123`
- Main repo is at `/Users/dev/project`
- Serena MCP server is running
- `dark-factory/project-profile.md` contains: `| Serena MCP | detected — semantic queries enabled |`
- code-agent has been spawned with `SERENA_MODE=full`

## Action
df-orchestrate performs the worktree setup sequence:
1. Creates the worktree at `/Users/dev/project/.worktrees/my-feature-abc123`
2. Writes `.serena/project.yml` to `/Users/dev/project/.worktrees/my-feature-abc123/.serena/project.yml` with content:
   ```yaml
   project_root: /Users/dev/project/.worktrees/my-feature-abc123
   ```
3. Spawns code-agent in the worktree context

Then the code-agent:
4. Calls `mcp__serena__find_symbol` with `{"name": "processOrder"}` as warmup probe
5. Serena returns path: `/Users/dev/project/.worktrees/my-feature-abc123/src/orders/order.service.js`
6. Calls `mcp__serena__replace_symbol_body` targeting that path
7. Reads the worktree copy of the file to verify the edit

After implementation:
8. df-orchestrate calls ExitWorktree
9. df-orchestrate deletes `/Users/dev/project/.worktrees/my-feature-abc123/.serena/project.yml`

## Expected Outcome
- `.serena/project.yml` exists in the worktree root BEFORE code-agent is spawned
- The `project_root` value is an absolute path pointing to the worktree, NOT the main repo
- Serena returns file paths prefixed with the worktree root (`/Users/dev/project/.worktrees/my-feature-abc123/...`)
- `replace_symbol_body` modifies the file at `/Users/dev/project/.worktrees/my-feature-abc123/src/orders/order.service.js`
- The main repo file at `/Users/dev/project/src/orders/order.service.js` is NOT modified
- After ExitWorktree, `.serena/project.yml` no longer exists in the worktree directory

## Failure Mode (if applicable)
If `.serena/project.yml` is written with a relative path or omitted entirely, Serena scopes to its own working directory, which may be the main repo. In that case, Serena returns paths under the main repo and `replace_symbol_body` corrupts main-branch files — the most severe possible failure for this feature.

## Notes
The agent should verify that Serena-returned paths contain the expected worktree prefix. Per EC-1: if Serena returns paths that do NOT start with the worktree root, the agent must treat Serena as unavailable and fall back to Grep+Read+Edit for the session.
