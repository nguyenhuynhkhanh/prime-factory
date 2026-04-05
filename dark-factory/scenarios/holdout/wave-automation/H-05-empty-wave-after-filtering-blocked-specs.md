# Scenario: Empty wave after filtering blocked specs is skipped

## Type
edge-case

## Priority
medium -- prevents the orchestrator from spawning a useless wave agent

## Preconditions
- SKILL.md has been updated
- Consider: Wave 1 [spec-a], Wave 2 [spec-b (depends on spec-a)], Wave 3 [spec-c (depends on spec-b)]
- spec-a fails in Wave 1

## Action
Read the wave execution flow. Trace what happens when all specs in Wave 2 are blocked.

## Expected Outcome
- spec-a fails, spec-b is blocked (depends on spec-a), spec-c is blocked (transitively depends on spec-a via spec-b)
- Wave 2 has only spec-b, which is blocked. After filtering, Wave 2 is empty.
- The orchestrator SKIPS Wave 2 entirely (does not spawn a wave agent for an empty wave)
- Wave 3 has only spec-c, which is also blocked. Wave 3 is also skipped.
- The orchestrator recognizes all remaining waves are empty, stops early, and produces the final summary
- The SKILL.md contains language about skipping empty waves or stopping when no executable specs remain

## Failure Mode
N/A -- logic trace

## Notes
Validates EC-6 and the "All remaining waves blocked" error handling row. The orchestrator should not spin up wave agents that have nothing to do.
