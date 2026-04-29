# Scenario: df-cleanup regenerating slim profile from a full profile with Org Context produces no Org Context in slim

## Type
edge-case

## Priority
high — df-cleanup regenerates slim profiles; it must follow the slim template extraction rules which exclude Org Context

## Preconditions
- `project-profile-slim-template.md` updated per this feature (with exclusion comment)
- A project has a full `project-profile.md` that contains `## Org Context` with authored content
- `df-cleanup` is invoked (Step 1.5: regenerate slim profile)

## Action
df-cleanup reads `project-profile-slim-template.md` extraction rules and regenerates `project-profile-slim.md` from `project-profile.md`.

The full profile has:
```markdown
## Org Context
- **Core values/priorities**: security first
- **Domain vocabulary**: account = billing account
- **Team structure**: @backend-team reviews API changes
- **Open constraints**: HIPAA BAA in effect
- **PR reviewer handles**: @alice @bob
```

## Expected Outcome
- Regenerated `project-profile-slim.md` does NOT contain `## Org Context`
- Regenerated slim profile does NOT contain any of the org context field values (e.g., "security first", "@backend-team", "@alice")
- Slim profile extraction rules (Tech Stack verbatim, Critical Conventions, Entry Points, Common Gotchas) are applied correctly
- No other sections are lost in the regeneration

## Failure Mode
If df-cleanup's slim generation extracts Org Context into the slim profile, architect-agents for Tier 1/2 reviews would receive org context they weren't designed to use, potentially polluting their reviews with organizational data.

## Notes
EC-7. This is a holdout scenario testing an indirect consumer (df-cleanup) of the slim template. The code-agent implementing this feature may not think about df-cleanup regeneration.
