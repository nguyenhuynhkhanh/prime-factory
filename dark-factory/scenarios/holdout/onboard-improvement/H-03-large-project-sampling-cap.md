# Scenario: Very large project sampling is capped at reasonable limit

## Type
edge-case

## Priority
medium -- prevents unbounded file reading for large projects

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`
- The broader sampling instruction says "one file per top-level module/directory"

## Action
Read the onboard-agent file. Verify there is guidance for projects with many top-level directories (e.g., 50+).

## Expected Outcome
- The sampling instruction includes a cap or guidance for large projects (e.g., "if there are more than 20 top-level directories, sample a representative subset and note that sampling was partial")
- The cap is explicit (a number or a range like "15-20")
- The instruction includes a note to tell the developer that some directories were not sampled

## Failure Mode (if applicable)
Without a cap, the onboard-agent on a monorepo-like project with 100 directories would try to read 100 files, consuming excessive context and producing an unwieldy profile.

## Notes
The broader sampling (FR-5) replaces the current "3-5 representative files" but needs an upper bound for very large projects.
