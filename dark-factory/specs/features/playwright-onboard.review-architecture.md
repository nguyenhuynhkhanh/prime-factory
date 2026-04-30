## Domain Review: Architecture & Performance

### Feature: playwright-onboard
### Status: APPROVED

### Findings
- **Blockers**: None

- **Concerns**: None

- **Suggestions**:
  - Phase 2.5 is correctly positioned after Phase 2 (Tech Stack) and before Phase 3 (Architecture) per NFR-2. The dependency on package.json data from Phase 2 is architecturally sound.
  - Step numbering in Phase 2.5 starts at 6 and flows through 11, continuing from Phase 2's step 5. This is consistent with the existing phase numbering convention.
  - The onboard-agent token cap test is failing (6445 tokens, cap is 5500). This is a pre-existing condition — the agent was already over cap before playwright-onboard was implemented. Recommend tracking this in a separate spec.

- **Additional note**: The implementation satisfies the "plugin mirrors must match source files exactly" requirement (AC-8, AC-9). Verified both plugin files are byte-identical to source files.

### Key Decisions
- Exact-match allowlist (not substring matching): Prevents false positives from similarly-named packages (e.g., `react-icons` not matching `react`). BR-1 is correctly enforced.
- Detection from package.json content only (not node_modules): Handles Yarn PnP, pnpm without node_modules, and any other package manager that doesn't use filesystem-based resolution. EC-5 is correctly handled.
- Config file check as secondary signal: Handles the case where a framework is globally installed but not in package.json. EC-3 is correctly handled.
- Phase 7 Memory Sign-Off is not touched: The new fields are profile fields, not memory entries. No architectural boundary violation.

### Memory Findings (architecture)
- Preserved: N/A — no active architecture invariants in shard
- Modified (declared in spec): None
- Potentially violated (BLOCKER): None
- New candidates declared: None
- Orphaned (SUGGESTION only): None

### Intent & Drift Check
DI shard `design-intent-architecture.md` found but contains no active entries. No drift risk found.
