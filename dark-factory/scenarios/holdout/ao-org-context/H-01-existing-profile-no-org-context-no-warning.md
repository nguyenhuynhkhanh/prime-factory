# Scenario: Profile from before this feature (no Org Context) causes no log noise

## Type
edge-case

## Priority
critical — this is the initial state for every current Dark Factory user; must be silent

## Preconditions
- `spec-agent.md` updated per this feature
- Simulated `project-profile.md` that was generated before this feature (contains `## Developer Notes` as the last section, no `## Org Context`)
- Spec-agent is invoked to write a spec for any feature

## Action
The spec-agent reads the profile, reaches the end of the file without finding `## Org Context`, and proceeds to write the spec.

Verify that the agent instructions:
1. Do not produce any "Org Context not found" warning or log
2. Do not leave any "Org Context: N/A" or similar placeholder in the spec output
3. Do not abort or degrade the spec in any way

```js
// Structural assertion: agent must treat absence as truly silent
const spec = fs.readFileSync(".../spec-agent.md", "utf8");
// Must NOT contain instructions to warn/log on absent Org Context
assert.ok(
  !spec.includes("warn.*Org Context") && !spec.includes("log.*Org Context missing"),
  "spec-agent must not warn or log when Org Context is absent"
);
```

## Expected Outcome
- Spec is written normally
- No mention of "Org Context" in spec output when section is absent
- No log line referencing Org Context
- No placeholder "N/A" for vocabulary or compliance

## Notes
This is a holdout scenario because the code-agent might be tempted to add a warning or a "no org context loaded" log. The correct behavior is completely silent absence.
