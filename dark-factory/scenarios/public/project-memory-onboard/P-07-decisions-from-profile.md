# Scenario: P-07 — Decisions are sourced from project-profile.md only (no code-body inference)

## Type
feature

## Priority
high — FR-7, FR-8, and DEC-TBD-a are aligned on this. Code-body inference would produce noisy candidates.

## Preconditions
- Phase 3.7b is present in onboard-agent file.

## Action
Structural test extracts the Phase 3.7b body and asserts:
1. It cites `project-profile.md` as the source (phrase `project-profile.md` present).
2. It specifies that decisions are NOT inferred from code function bodies (look for a phrase like `not inferred from code`, `no LLM inference`, or equivalent).
3. It lists the decision candidate shape keys: `id`, `title`, `context`, `decision`, `alternatives`, `rationale`, `domain`, `source`, `sourceRef`, `confidence`.
4. It sets `source: derived-from-profile` as the exact default value.
5. The `sourceRef` format is documented as `dark-factory/project-profile.md#<section>`.

## Expected Outcome
- All five assertions pass.
- No phrase in Phase 3.7b suggests inferring decisions from code bodies.

## Failure Mode (if applicable)
If any key is missing, or the "no code-body inference" clause is absent, test names the missing element.

## Notes
This ties directly to DEC-TBD-a. The scenario enforces both the positive rule (use profile) and the negative rule (don't infer from code).
