## ARCH-001: UI and E2E detection uses file reads only — no exec or install commands

- **Status**: active
- **Superseded-by**: N/A
- **Domain**: infra
- **Layer**: 2
- **Statement**: The onboard-agent detects UI layer and E2E framework presence exclusively through reading package.json and checking for config file existence — no install commands or external process spawning.
- **Rationale**: Onboarding must be fast and side-effect-free. Running install commands during onboard could modify the project state, trigger side effects, or be slow/fragile on CI environments without network access.
- **Impact**: onboard-agent Phase 2.5 detection logic; any future detection phases added to onboard-agent.
- **Effective**: 2026-04-30

## ARCH-002: Frontend framework detection uses explicit package-name allowlist with exact matching

- **Status**: active
- **Superseded-by**: N/A
- **Domain**: infra
- **Layer**: 2
- **Statement**: Frontend framework detection checks for exact package names in the allowlist — `react`, `vue`, `@angular/core`, `next`, `nuxt`, `svelte`, `@sveltejs/kit`, `@remix-run/react`, `gatsby`, `astro`, `solid-js`, `@builder.io/qwik`, `ember-source`, `lit` — rather than substring or heuristic matching.
- **Rationale**: Prevents false positives from packages that happen to share a name prefix with a framework (e.g., `react-icons` is not a frontend framework). Explicit allowlists are auditable and predictable.
- **Impact**: onboard-agent Phase 2.5 step 6; any future framework detection additions must extend the allowlist explicitly.
- **Effective**: 2026-04-30

## ARCH-003: E2E Ready requires both a dependency entry AND a config file

- **Status**: active
- **Superseded-by**: N/A
- **Domain**: testing
- **Layer**: 2
- **Statement**: The E2E Ready field is set to `yes` only when BOTH an E2E framework package is present in package.json AND a corresponding config file exists at the project root. Dependency-only or config-only results in `E2E Ready = no` or `yes` respectively (config-only implies global install and is treated as ready).
- **Rationale**: A package installed but never configured cannot run E2E tests. This prevents false positives that would cause downstream agents (test-agent, promote-agent) to attempt E2E runs on unconfigured projects.
- **Impact**: onboard-agent Phase 2.5 step 8; downstream agents reading the E2E Ready field.
- **Effective**: 2026-04-30
