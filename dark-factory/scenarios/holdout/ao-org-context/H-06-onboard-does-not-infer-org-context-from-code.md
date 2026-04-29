# Scenario: Onboard-agent does not attempt to infer org context from code analysis

## Type
edge-case

## Priority
high — incorrect inference would populate the profile with wrong compliance or vocabulary claims

## Preconditions
- `onboard-agent.md` updated per this feature
- Target project has:
  - PII fields in database schema (e.g., `email`, `ssn`, `dob` — could suggest GDPR/HIPAA)
  - Files named `compliance/` or `gdpr/` in the project tree
  - A `@reviewer` comment in a controller file (could suggest PR routing)
  - Domain-specific model names (e.g., `BillingAccount`, `UserAccount`) that could suggest vocabulary

## Action
Onboard-agent runs through Phases 1–5 (code analysis phases) and Phase 6 (developer questions).

During Phases 1–5, the agent MUST NOT:
- Populate `Open constraints` from PII field detection or compliance directory names
- Populate `Domain vocabulary` from model names
- Populate `PR reviewer handles` from code comments

During Phase 6, the agent asks the org context question. If the developer skips (presses Enter), the Org Context section is omitted.

Structural assertion:
```js
const onboard = fs.readFileSync(".../onboard-agent.md", "utf8");
assert.ok(
  onboard.includes("NOT infer") || onboard.includes("not infer") || onboard.includes("developer-authored") || onboard.includes("cannot be inferred"),
  "onboard-agent must explicitly state it does not infer org context from code"
);
```

## Expected Outcome
- Org Context section is empty / absent if developer skips the Phase 6 question
- No compliance claims appear in the profile that the developer didn't author
- No vocabulary entries appear that were inferred from model names
- No reviewer handles appear that were extracted from code comments

## Failure Mode
If the agent infers org context from code, a PII-storing app that is NOT subject to HIPAA would incorrectly get "HIPAA applies" in its Open constraints. This could cause spec-agent to write unnecessary compliance sections, misleading reviewers.

## Notes
FR-6, BR-1. This is a holdout scenario because code analysis during phases 1–5 gives the agent signals that look like org context. The correct behavior is to ignore those signals and ask the developer instead.
