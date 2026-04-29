# Scenario: Re-run with "y" to update Org Context replaces old content, does not append

## Type
edge-case

## Priority
high — appending instead of replacing would produce duplicate or garbled org context over multiple re-runs

## Preconditions
- `onboard-agent.md` updated per this feature
- Project profile contains:
  ```markdown
  ## Org Context
  - **Core values/priorities**: move fast
  - **Domain vocabulary**: user = registered member
  - **Team structure**: no formal structure
  - **Open constraints**: none
  - **PR reviewer handles**: @dev1
  ```
- Developer runs `/df-onboard` (re-run) and answers "y" to "update Org Context?"
- Developer provides new content: "security first; account = billing account; @alice @bob reviews API; GDPR applies"

## Action
Onboard-agent re-presents the org context question. Developer enters new org context content. Agent writes the profile.

## Expected Outcome
- The final `## Org Context` section contains ONLY the new content
- Old content ("move fast", "user = registered member", "@dev1") is NOT present in the final profile
- The section is not duplicated (no two `## Org Context` headings)
- Field structure (5 labeled fields) is preserved with new values

## Failure Mode
If the agent appends to the existing section rather than replacing it, successive re-runs would accumulate stale content. This would make the section unreliable and confusing.

## Notes
EC-4. This is a holdout scenario because append vs. replace is a subtle implementation detail. The developer sees "update" and expects replacement, not accumulation.
