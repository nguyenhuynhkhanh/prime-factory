# Scenario: H-08 — df-orchestrate enforces onboarding prerequisite before first feature

## Type
edge-case

## Priority
high — agents working without a project-profile start blind. Onboarding is the most consistently missed step in multi-agent pipelines.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` has been updated with INTAKE handling.

## Action
Structural test verifies:
1. df-orchestrate SKILL.md describes a check for project-profile.md existence at INTAKE.
2. The file describes routing to an ONBOARDING state (or equivalent) when project-profile.md is missing.
3. The file does NOT describe proceeding to INTERVIEW without this check.

Also check for the onboarding-before-interview ordering: INTAKE → [ONBOARDING if missing] → INTERVIEW. This ordering must be unambiguous.

## Expected Outcome
- Prerequisite check is documented.
- Routing to onboarding on missing profile is documented.
- Ordering is unambiguous: onboarding cannot be skipped.

## Failure Mode (if applicable)
If the skill says "project-profile is recommended" or "run df-onboard first" as a suggestion rather than an enforced gate, test fails. The prerequisite must be a blocking check, not a recommendation.
