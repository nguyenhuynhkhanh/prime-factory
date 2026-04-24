# Scenario: H-12 — Foundation-missing warning is actionable and non-blocking

## Type
edge-case

## Priority
medium — BR-10, EC-1. The warning text itself must be high-quality.

## Preconditions
- Phase 3.7 precondition check is documented.

## Action
Structural test asserts the foundation-missing warning documentation includes:
1. Detection signal (both `dark-factory/memory/` directory AND `dark-factory/templates/project-memory-template.md` are absent).
2. The exact (or very close paraphrase) warning message template, including actionable guidance.
3. That the warning is logged to the sign-off summary (not a modal that blocks progress).
4. That Phase 3.7 returns early and control flow proceeds to Phase 4 without any other side effect.

## Expected Outcome
- Detection signal is two-pronged (directory + template).
- Warning is logged, not modal.
- Actionable guidance included (e.g., "re-run `/df-onboard` after the foundation is installed").
- Early return documented.

## Failure Mode (if applicable)
If detection is single-pronged and could be fooled, test flags it. If the warning would block developer workflow (modal), test fails. If no actionable guidance, test names the omission.

## Notes
Detection must be robust: a user might have created `dark-factory/memory/` by hand without the template, or vice versa. Both checks avoid false positives.
