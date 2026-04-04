# Scenario: All 6 consuming agents have section-targeted code map reading instructions

## Type
feature

## Priority
critical -- if agents don't know how to read the code map, the feature provides no value

## Preconditions
- All 7 agent files exist (.claude/agents/*.md)
- Code map feature has been implemented

## Action
Read each of the 6 consuming agent files (spec, architect, code, debug, test, promote).

## Expected Outcome
- spec-agent.md instructs reading Dependency Graph and Hotspots sections
- architect-agent.md instructs reading the full code map
- code-agent.md instructs reading Entry Points and Contract Boundaries sections
- debug-agent.md instructs reading Entry Points and Dependency Graph sections
- test-agent.md instructs reading Entry Points and Hotspots sections
- promote-agent.md instructs reading Hotspots section
- All 6 agents include a conditional guard: only read code-map.md if it exists
- Each agent references `dark-factory/code-map.md` by exact path

## Notes
Validates FR-10 and BR-12. The consumption table in the spec defines which sections each agent reads.
