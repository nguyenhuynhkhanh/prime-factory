# Scenario: H-10 — Build script runs correctly inside a git worktree

## Type
edge-case

## Priority
medium — code-agents for this feature run in worktrees; the build must not use hardcoded absolute paths

## Preconditions
- A git worktree has been created for this feature (e.g., at `.claude/worktrees/ao-compile-time-agents/`)
- The worktree has its own checkout with `src/agents/`, `bin/build-agents.js`, `.claude/agents/`, and `plugins/dark-factory/agents/`

## Action
From INSIDE the git worktree directory (not the main repo root), run `node bin/build-agents.js`.

## Expected Outcome
- Build resolves `src/agents/`, `src/agents/shared/`, `.claude/agents/`, and `plugins/dark-factory/agents/` relative to the worktree root
- Assembled output is written to `.claude/agents/` and `plugins/dark-factory/agents/` WITHIN the worktree (not the main repo)
- Exit code 0
- The built output is identical to what the build produces in the main repo

## Failure Mode (if applicable)
If the build script uses `__dirname` correctly (relative to `bin/build-agents.js`), it will resolve paths correctly in any worktree. If it uses `process.cwd()` without resolving from `__dirname`, a worktree with a different cwd would fail.

## Notes
Exercises EC-7. The safe pattern is to use `path.resolve(__dirname, '..')` as the project root (consistent with `bin/cli.js` which uses `path.join(__dirname, '..', 'plugins', 'dark-factory')`).
