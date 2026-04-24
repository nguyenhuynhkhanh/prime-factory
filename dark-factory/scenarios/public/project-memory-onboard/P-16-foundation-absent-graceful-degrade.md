# Scenario: P-16 — Foundation not yet installed: onboard degrades gracefully

## Type
feature

## Priority
high — BR-10, EC-1. If foundation ships after onboard (deployment order accident), onboard must not break.

## Preconditions
- onboard-agent file has been updated with Phase 3.7.
- A deployment scenario is simulated where the target project has the updated onboard-agent but the foundation template and `dark-factory/memory/` directory have NOT yet been installed.

## Action
Structural test asserts Phase 3.7 documents:
1. A precondition check: if `dark-factory/memory/` directory does not exist AND `dark-factory/templates/project-memory-template.md` does not exist → foundation is not installed.
2. Behavior when foundation is absent: warn (in sign-off summary), skip all memory writes, continue to Phase 4. Do not throw.
3. The warning message includes actionable guidance (e.g., "re-run `/df-onboard` after foundation is installed").

## Expected Outcome
- All three elements documented explicitly in Phase 3.7.
- The warning language is user-friendly and actionable.

## Failure Mode (if applicable)
If the precondition check is not documented, or the skip-and-continue behavior is not explicit, test names the missing element.

## Notes
Out-of-order plugin updates are rare but possible (e.g., a developer pulls in onboard changes via `npx dark-factory update` before the foundation sub-spec has landed in the release). This scenario ensures soft failure.
