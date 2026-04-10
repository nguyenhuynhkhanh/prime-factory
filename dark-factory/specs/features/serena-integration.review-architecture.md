## Domain Review: Architecture & Performance

### Feature: serena-integration
### Status: APPROVED WITH NOTES

### Findings

**Blockers**: None

**Concerns**:

1. **3-layer policy is prompt-only, not architecturally enforced** — The 3-layer search policy (code-map → Serena → Read/Grep) is described as instructions in agent markdown files. There is no structural enforcement — a code-agent could skip Layer 1 or Layer 2 without any system-level error. The spec acknowledges this (the project's tests are purely structural, not behavioral per the project profile). This is acceptable given the project's nature (prompt engineering framework), but the spec should state clearly that the ordering is advisory via prompt instruction, not a hard constraint. Tests can only verify the phrase exists, not that the agent follows it. This is a known limitation of the project's architecture.

2. **Single Serena server concurrency model** — The spec correctly restricts parallel-mode agents to `SERENA_MODE=read-only`, disabling mutations. However, the spec describes Serena's read operations as "safe to parallelize" (EC-7) without citing evidence from Serena's documentation. This assumption needs to be true for the feature to work correctly in parallel mode. If Serena's LSP backend serializes all queries (even reads), then discovery in parallel mode adds latency for both agents. This is a performance concern, not a correctness concern. Accept the assumption as stated but note it.

3. **Track C sequential dependency** — The spec correctly identifies Track C (init script) must wait for Tracks A and B (agent files). However, if Track A or Track B implementations drift from the spec (e.g., slightly different phrasing), Track C will produce a mismatched init script. The spec has no mechanism for enforcing exact content alignment between `.md` files and the init script generator strings. This is the "most fragile part of the codebase" per the project profile. The implementation agent for Track C must read the final A+B outputs and mirror them exactly — the spec should make this requirement explicit rather than relying on "update generator functions to match."

4. **LSP warmup probe selection — "known entry point"** — FR-9 requires the warmup probe to call `find_symbol` on "a known entry point." The spec does not define what "known entry point" means in context. The code-agent must choose a symbol name at runtime. If the agent chooses a symbol that doesn't exist in the target project (e.g., it's a framework-specific name), the warmup probe returns empty and Serena is falsely marked unavailable. The spec should clarify: agents should use a symbol from the project's code-map.md as the warmup probe target, not a hardcoded name. This is a correctness concern — a false negative on warmup disables Serena for the entire session unnecessarily.

5. **Post-edit verification scope** — FR-8 requires reading the "modified file section" after every mutation. The spec does not define what "section" means: the entire file, the symbol's line range, or a fixed-line window around the edit position. For very large files, reading the entire file for verification defeats the token-efficiency purpose. The spec should specify: read the symbol's line range (as returned by the preceding `find_symbol` or `symbol_overview` call), not the entire file.

**Suggestions**:

1. **Warmup probe symbol source** — Explicitly state that the warmup probe symbol should be derived from `dark-factory/code-map.md` (the agent has already read it in Layer 1), using the first entry point listed there. This makes the probe reliable and project-agnostic.

2. **Post-edit verification target** — Specify that verification reads only the symbol's known line range (±10 lines for context) rather than the entire file. This preserves the token-efficiency goal of the feature.

3. **Track C instructions** — Strengthen FR-11 to say: "Track C implementation agent MUST read the final `.md` file content after Tracks A+B complete and compare with the init script generator strings before modifying. Any discrepancy between the `.md` file and the generator string must be resolved in favor of the `.md` file."

### Key Decisions

- **Two tracks (A+B) in parallel, then Track C sequentially is correct**: The dependency is real — init script must mirror final agent content. The track structure respects this.
- **`SERENA_MODE` as prompt-context variable (not OS env var)** is correct for the Claude Code agent model per FR-7. Claude Code agents do not read OS environment variables; prompt context is the correct mechanism.
- **Binary session-level warmup decision (not per-call)** is the right performance trade-off: one upfront probe cost vs. per-call latency on every tool invocation. BR-4 is correctly specified.
- **Graceful degradation to Grep+Read+Edit preserves existing behavior** with zero performance regression for users without Serena.
