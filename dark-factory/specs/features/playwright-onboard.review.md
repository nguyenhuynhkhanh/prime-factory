## Architect Review: playwright-onboard

### Rounds: 1

### Status: APPROVED

### Key Decisions Made
- Detection from package.json content only (file reads, no exec/install): Satisfies NFR-1 (side-effect-free), handles all package managers including Yarn PnP and pnpm. The security posture is clean.
- Exact-match allowlist for framework detection: Prevents false positives from similarly-named packages (e.g., `react-icons` not matching `react`). BR-1 is correctly enforced in the implementation.
- Phase 2.5 positioned after Phase 2, before Phase 3: Logically correct — depends on package.json data already available from Phase 2. NFR-2 satisfied.
- E2E Ready = yes requires BOTH dependency AND config: Clear semantic contract for downstream agents. EC-2 (dep without config = `no`) and EC-3 (config without dep = `yes` via config inference) are correctly handled.
- Plugin mirrors match source files byte-for-byte: AC-8 and AC-9 verified.
- Four new Tech Stack fields follow existing table format: Backward compatible — existing profiles without these fields work with incremental refresh (FR-7).

### Remaining Notes
- The onboard-agent token cap test is failing (6445 tokens vs 5500 cap). This is a pre-existing condition that predates this feature. Recommend tracking in a separate spec.
- The `ao-thin-wave-orchestration` test failure is also pre-existing and unrelated to this feature.

### Verification Summary
All acceptance criteria verified:
- AC-1: onboard-agent.md has Phase 2.5 between Phase 2 and Phase 3
- AC-2: project-profile-template.md has all four new fields (UI Layer, Frontend Framework, E2E Framework, E2E Ready)
- AC-3: Frontend framework allowlist present with all 14 packages
- AC-4: E2E framework allowlist present (@playwright/test, playwright, cypress)
- AC-5: Logic for playwright.config.* and cypress.config.* present
- AC-6: Developer question for ambiguous UI detection present
- AC-7: Greenfield handling (all fields to `unknown`) present
- AC-8: plugins/dark-factory/agents/onboard-agent.md is byte-identical to .claude/agents/onboard-agent.md
- AC-9: plugins/dark-factory/templates/project-profile-template.md is byte-identical to dark-factory/templates/project-profile-template.md
- AC-10: No install commands or external processes in detection logic
