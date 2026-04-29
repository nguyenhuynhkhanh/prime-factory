# Scenario: Spec written with Org Context uses domain vocabulary terms instead of generic terms

## Type
feature

## Priority
high — the primary quality improvement delivered by this feature; tests the behavioral output, not just the instruction text

## Preconditions
- `spec-agent.md` updated per this feature
- Project profile contains:
  ```markdown
  ## Org Context
  - **Domain vocabulary**: account = billing account (not user account); member = authenticated user with active subscription; workspace = isolated tenant environment
  ```
- Developer asks spec-agent to write a spec for "add a workspace settings page"

## Action
Spec-agent reads the profile (including Org Context), notes the vocabulary map:
- "account" → "billing account"
- "member" → "authenticated user with active subscription"
- "workspace" → "isolated tenant environment"

Spec-agent writes the spec.

## Expected Outcome
- Spec prose uses "billing account" rather than "account" or "user account" where applicable
- Spec uses "member" rather than "user" when referring to authenticated users with subscriptions
- When spec refers to the workspace resource, it uses terminology consistent with the vocabulary definition
- No generic terms ("account", "user") appear where the vocabulary provides a more specific term

## Failure Mode
If the vocabulary is loaded but not applied, spec prose will use generic terms. Developers will need to manually correct all occurrences in every spec, negating the feature's value.

## Notes
FR-7. This is a holdout scenario because it tests behavioral output quality rather than structural assertions. The code-agent cannot see this test during implementation, so it must apply vocabulary from the spec instructions alone.
