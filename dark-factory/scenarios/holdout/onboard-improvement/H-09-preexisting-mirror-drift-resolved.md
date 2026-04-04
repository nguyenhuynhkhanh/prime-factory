# Scenario: Pre-existing mirror drift is resolved for files this feature touches

## Type
edge-case

## Priority
high -- ensures distribution copy is correct after implementation

## Preconditions
- architect-agent.md has pre-existing differences between `.claude/agents/` and `plugins/dark-factory/agents/` (confirmed: migration-related additions in plugins/ version)
- debug-agent.md has pre-existing differences between `.claude/agents/` and `plugins/dark-factory/agents/` (confirmed: migration plan and re-spawn sections in plugins/ version)

## Action
Compare the `.claude/agents/architect-agent.md` with `plugins/dark-factory/agents/architect-agent.md` after implementation. Same for debug-agent.md.

## Expected Outcome
- `.claude/agents/architect-agent.md` and `plugins/dark-factory/agents/architect-agent.md` are byte-for-byte identical after this feature
- `.claude/agents/debug-agent.md` and `plugins/dark-factory/agents/debug-agent.md` are byte-for-byte identical after this feature
- The `.claude/agents/` version is the one that gets section-targeted reading instructions added
- The `plugins/` version is overwritten with the complete updated `.claude/` version (not just the new additions patched onto the old plugins/ version)

## Failure Mode (if applicable)
If the code-agent adds section targeting to `.claude/agents/architect-agent.md` and then copies it to `plugins/`, but the `.claude/` version was missing the migration-related additions that were only in the `plugins/` version, those additions would be lost. The code-agent needs to understand that `.claude/` is the source of truth for this project's own usage, and `plugins/` is the distribution copy that must match.

## Notes
This is tricky because the pre-existing drift means the plugins/ versions currently have MORE content than the .claude/ versions (for architect-agent and debug-agent). BR-6 says "byte-for-byte identical" -- the implementation must decide which direction to resolve the drift. The spec says .claude/ is source of truth, so plugins/ should match .claude/ after changes.
