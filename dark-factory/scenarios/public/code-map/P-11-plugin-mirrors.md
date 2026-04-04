# Scenario: Plugin mirrors match all modified source files

## Type
feature

## Priority
critical -- plugin distribution must stay in sync with source; existing test enforces parity

## Preconditions
- All source agent and skill files have been modified with code map instructions
- Plugin mirror files exist at plugins/dark-factory/agents/ and plugins/dark-factory/skills/

## Action
Compare each modified source file with its plugin mirror counterpart.

## Expected Outcome
- plugins/dark-factory/agents/onboard-agent.md == .claude/agents/onboard-agent.md
- plugins/dark-factory/agents/spec-agent.md == .claude/agents/spec-agent.md
- plugins/dark-factory/agents/architect-agent.md == .claude/agents/architect-agent.md
- plugins/dark-factory/agents/code-agent.md == .claude/agents/code-agent.md
- plugins/dark-factory/agents/debug-agent.md == .claude/agents/debug-agent.md
- plugins/dark-factory/agents/test-agent.md == .claude/agents/test-agent.md
- plugins/dark-factory/agents/promote-agent.md == .claude/agents/promote-agent.md
- plugins/dark-factory/skills/df-intake/SKILL.md == .claude/skills/df-intake/SKILL.md
- plugins/dark-factory/skills/df-debug/SKILL.md == .claude/skills/df-debug/SKILL.md
- Byte-for-byte identical (no drift)

## Notes
Validates FR-12. The existing test suite already checks some of these pairs -- new test assertions should cover all 9 pairs.
