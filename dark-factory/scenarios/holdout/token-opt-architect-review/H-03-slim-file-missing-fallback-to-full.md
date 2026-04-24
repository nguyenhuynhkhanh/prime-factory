# Scenario: Slim context files missing — architect falls back to full files silently

## Type
failure-recovery

## Priority
high -- if the fallback is noisy or fails hard, every Tier 1/2 review is broken when token-opt-slim-context hasn't run yet

## Preconditions
- `dark-factory/project-profile-slim.md` does NOT exist (token-opt-slim-context has not been deployed, or slim generation failed)
- `dark-factory/code-map-slim.md` does NOT exist
- `dark-factory/project-profile.md` EXISTS (full file present)
- `dark-factory/code-map.md` EXISTS (full file present)
- A Tier 2 spec is being reviewed (slim files should be attempted first for Tier 2)

## Action
Tier 2 domain architect-agent begins Step 1 (Deep Review) and attempts to read slim context files.

## Expected Outcome
- Architect attempts to read `dark-factory/project-profile-slim.md` — file not found
- Architect falls back silently to `dark-factory/project-profile.md` — reads successfully
- Architect attempts to read `dark-factory/code-map-slim.md` — file not found
- Architect falls back silently to `dark-factory/code-map.md` — reads successfully
- The fallback is logged INTERNALLY only (not surfaced in the review output to the developer): "Slim file not found, reading full file"
- The architect's review output does NOT contain error messages about missing slim files
- The review proceeds and completes normally — the missing slim files do NOT block or degrade the review

**Secondary test — only one slim file missing:**
- `project-profile-slim.md` exists but `code-map-slim.md` does not
- Architect reads slim profile, falls back to full code-map
- Both reads succeed; review is not disrupted

**Tertiary test — both full and slim files missing:**
- Neither `project-profile-slim.md` nor `project-profile.md` exists
- Architect logs the gap internally and proceeds with only code-map context
- Does NOT fail or block the review

## Notes
Validates FR-6 (fallback behavior), NFR-2 (silent fallback), EC-5 (both full and slim missing), BR-7 (slim is default not gate). Holdout because a code-agent that sees this might add defensive "if file exists" checks explicitly — we want the fallback to emerge naturally from the architect's behavioral instructions.
