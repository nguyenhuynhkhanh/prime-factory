# Scenario: Promote-agent adds structured annotations to promoted tests

## Type
feature

## Priority
high — Annotations make promoted tests understandable to future developers

## Preconditions
- `.claude/agents/promote-agent.md` exists and contains the test adaptation process

## Action
Read `.claude/agents/promote-agent.md` and inspect the test adaptation sections (3. Adapt Unit Tests and/or 4. Adapt Playwright E2E Tests).

## Expected Outcome
- The promote-agent requires structured annotations as comments in promoted tests:
  - Root cause pattern (what class of bug this guards against)
  - Guarded code locations (file:line references that, if changed, should trigger this test)
  - Related bug name (the Dark Factory bugfix name for traceability)
- The annotation format uses structured comments: `// Root cause:`, `// Guards:`, `// Bug:`
- The annotations are added as a header block alongside the existing `// Promoted from Dark Factory holdout: {name}` comment
- Fallback behavior is specified when root cause or guarded locations cannot be determined from the debug report

## Notes
The promote-agent already adds `// Promoted from Dark Factory holdout: {name}`. The new annotations extend this header with additional structured context.
