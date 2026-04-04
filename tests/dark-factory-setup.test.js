const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, "..");
const AGENTS_DIR = path.join(ROOT, ".claude", "agents");
const SKILLS_DIR = path.join(ROOT, ".claude", "skills");
const DF_DIR = path.join(ROOT, "dark-factory");

function readAgent(name) {
  return fs.readFileSync(path.join(AGENTS_DIR, `${name}.md`), "utf8");
}

function readSkill(name) {
  return fs.readFileSync(
    path.join(SKILLS_DIR, name, "SKILL.md"),
    "utf8"
  );
}

/** Parse YAML-ish frontmatter between --- delimiters */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    // strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    fm[key] = value;
  }
  return fm;
}

// ===========================================================================
// 1. Agent files exist with valid frontmatter
// ===========================================================================

describe("Agent definitions", () => {
  const expectedAgents = [
    "spec-agent",
    "debug-agent",
    "onboard-agent",
    "architect-agent",
    "code-agent",
    "test-agent",
    "promote-agent",
  ];

  for (const name of expectedAgents) {
    it(`${name}.md exists`, () => {
      const filePath = path.join(AGENTS_DIR, `${name}.md`);
      assert.ok(fs.existsSync(filePath), `Missing agent file: ${filePath}`);
    });

    it(`${name}.md has valid frontmatter with name, description, tools`, () => {
      const content = readAgent(name);
      const fm = parseFrontmatter(content);
      assert.ok(fm, `${name}.md has no frontmatter`);
      assert.equal(fm.name, name, `Frontmatter name should be "${name}"`);
      assert.ok(fm.description, `${name}.md missing description`);
      assert.ok(fm.tools, `${name}.md missing tools`);
    });
  }
});

// ===========================================================================
// 2. Skill files exist with valid frontmatter
// ===========================================================================

describe("Skill definitions", () => {
  const expectedSkills = [
    "df-onboard",
    "df-intake",
    "df-debug",
    "df-orchestrate",
    "df-spec",
    "df-scenario",
    "df-cleanup",
  ];

  for (const name of expectedSkills) {
    it(`${name}/SKILL.md exists`, () => {
      const filePath = path.join(SKILLS_DIR, name, "SKILL.md");
      assert.ok(fs.existsSync(filePath), `Missing skill file: ${filePath}`);
    });

    it(`${name}/SKILL.md has valid frontmatter with name and description`, () => {
      const content = readSkill(name);
      const fm = parseFrontmatter(content);
      assert.ok(fm, `${name}/SKILL.md has no frontmatter`);
      assert.equal(fm.name, name, `Frontmatter name should be "${name}"`);
      assert.ok(fm.description, `${name}/SKILL.md missing description`);
    });
  }
});

// ===========================================================================
// 3. Dark Factory directory structure
// ===========================================================================

describe("Dark Factory directory structure", () => {
  const requiredDirs = [
    "specs/features",
    "specs/bugfixes",
    "scenarios/public",
    "scenarios/holdout",
    "results",
    "archive",
  ];

  for (const dir of requiredDirs) {
    it(`dark-factory/${dir}/ exists`, () => {
      assert.ok(
        fs.existsSync(path.join(DF_DIR, dir)),
        `Missing directory: dark-factory/${dir}/`
      );
    });
  }

  it("manifest.json exists and is valid JSON", () => {
    const manifestPath = path.join(DF_DIR, "manifest.json");
    assert.ok(fs.existsSync(manifestPath), "manifest.json missing");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    assert.equal(manifest.version, 1);
    assert.ok(
      typeof manifest.features === "object",
      "manifest.features should be an object"
    );
  });

  it("manifest.json is NOT in .gitignore", () => {
    const gitignore = fs.readFileSync(
      path.join(ROOT, ".gitignore"),
      "utf8"
    );
    assert.ok(
      !gitignore.includes("manifest.json"),
      "manifest.json should not be gitignored"
    );
  });

  it("dark-factory/results/ IS in .gitignore", () => {
    const gitignore = fs.readFileSync(
      path.join(ROOT, ".gitignore"),
      "utf8"
    );
    assert.ok(
      gitignore.includes("dark-factory/results/"),
      "dark-factory/results/ should be gitignored"
    );
  });
});

// ===========================================================================
// 4. Pipeline routing — df-intake is feature-only, df-debug is bug-only
// ===========================================================================

describe("Pipeline routing", () => {
  it("df-intake redirects bugs to /df-debug", () => {
    const content = readSkill("df-intake");
    assert.ok(
      content.includes("/df-debug"),
      "df-intake should reference /df-debug for bug redirection"
    );
    assert.ok(
      content.toLowerCase().includes("bug"),
      "df-intake should mention bug detection"
    );
  });

  it("df-intake is feature-only", () => {
    const content = readSkill("df-intake");
    assert.match(content, /feature/i, "df-intake should mention features");
    // Should not spawn debug-agent
    assert.ok(
      !content.includes("debug-agent.md"),
      "df-intake should not reference debug-agent.md"
    );
  });

  it("df-debug spawns debug-agent (not spec-agent)", () => {
    const content = readSkill("df-debug");
    assert.ok(
      content.includes("debug-agent"),
      "df-debug should reference debug-agent"
    );
    assert.ok(
      !content.includes("spec-agent"),
      "df-debug should not reference spec-agent"
    );
  });

  it("spec-agent is feature-only and redirects bugs", () => {
    const content = readAgent("spec-agent");
    assert.ok(
      content.includes("Features Only") || content.includes("FEATURES only"),
      "spec-agent should declare it handles features only"
    );
    assert.ok(
      content.includes("/df-debug"),
      "spec-agent should redirect bugs to /df-debug"
    );
  });

  it("df-orchestrate detects feature vs bugfix mode", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Feature mode") || content.includes("feature mode"),
      "df-orchestrate should reference feature mode"
    );
    assert.ok(
      content.includes("Bugfix mode") || content.includes("bugfix mode") || content.includes("Bugfix Mode"),
      "df-orchestrate should reference bugfix mode"
    );
  });
});

// ===========================================================================
// 5. Architect review gate
// ===========================================================================

describe("Architect review gate", () => {
  it("df-orchestrate includes mandatory architect review", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Architect Review") || content.includes("architect-agent"),
      "df-orchestrate should include architect review step"
    );
  });

  it("df-orchestrate references architect-agent.md", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("architect-agent.md"),
      "df-orchestrate should reference architect-agent.md"
    );
  });

  it("architect-agent supports domain parameter for focused review", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("domain parameter"),
      "architect-agent should support domain parameter"
    );
    assert.ok(
      content.includes("Security & Data Integrity"),
      "architect-agent should define Security & Data Integrity domain"
    );
    assert.ok(
      content.includes("Architecture & Performance"),
      "architect-agent should define Architecture & Performance domain"
    );
    assert.ok(
      content.includes("API Design & Backward Compatibility"),
      "architect-agent should define API Design & Backward Compatibility domain"
    );
  });

  it("architect-agent runs at least 3 rounds in standard (non-domain) mode", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("at least 3 rounds"),
      "architect-agent should specify at least 3 rounds for standard review"
    );
  });

  it("architect-agent produces domain-specific review files", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("review-security.md"),
      "architect-agent should reference security domain review file"
    );
    assert.ok(
      content.includes("review-architecture.md"),
      "architect-agent should reference architecture domain review file"
    );
    assert.ok(
      content.includes("review-api.md"),
      "architect-agent should reference api domain review file"
    );
  });

  it("architect-agent references spec-agent for features", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("spec-agent"),
      "architect-agent should reference spec-agent for feature reviews"
    );
  });

  it("architect-agent references debug-agent for bugfixes", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("debug-agent"),
      "architect-agent should reference debug-agent for bugfix reviews"
    );
  });

  it("architect-agent produces APPROVED/BLOCKED status", () => {
    const content = readAgent("architect-agent");
    assert.ok(content.includes("APPROVED"), "Should mention APPROVED status");
    assert.ok(content.includes("BLOCKED"), "Should mention BLOCKED status");
  });

  it("df-orchestrate blocks implementation when architect returns BLOCKED", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("BLOCKED") &&
        content.toLowerCase().includes("do not proceed"),
      "df-orchestrate should block implementation on BLOCKED status"
    );
  });

  it("df-orchestrate spawns parallel domain review for every spec", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("parallel") && content.includes("domain"),
      "df-orchestrate should support parallel domain review"
    );
    assert.ok(
      content.includes("Security & Data Integrity") &&
        content.includes("Architecture & Performance") &&
        content.includes("API Design & Backward Compatibility"),
      "df-orchestrate should define all three review domains"
    );
    assert.ok(
      content.includes("Every spec") || content.includes("every spec") || content.includes("No exceptions"),
      "df-orchestrate should review every spec without exceptions"
    );
  });

  it("df-orchestrate forwards findings to code-agents", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Key Decisions Made") && content.includes("Remaining Notes"),
      "df-orchestrate should forward Key Decisions Made and Remaining Notes"
    );
    assert.ok(
      content.includes("Findings Forwarding"),
      "df-orchestrate should have a Findings Forwarding section"
    );
  });

  it("df-orchestrate includes post-hoc file count comparison", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Post-Hoc File Count") || content.includes("actualFiles"),
      "df-orchestrate should include post-hoc file count"
    );
  });

  it("df-orchestrate uses strictest-wins for parallel review aggregation", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Strictest-wins") || content.includes("strictest"),
      "df-orchestrate should use strictest-wins aggregation"
    );
  });
});

// ===========================================================================
// 6. Information barriers
// ===========================================================================

describe("Information barriers", () => {
  it("code-agent cannot read holdout scenarios", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("NEVER read") &&
        content.includes("holdout"),
      "code-agent must have holdout read prohibition"
    );
  });

  it("code-agent cannot read results", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("NEVER read") &&
        content.includes("results"),
      "code-agent must have results read prohibition"
    );
  });

  it("test-agent cannot modify source code", () => {
    const content = readAgent("test-agent");
    assert.ok(
      content.includes("NEVER modify source"),
      "test-agent must have source code modification prohibition"
    );
  });

  it("test-agent cannot share holdout content", () => {
    const content = readAgent("test-agent");
    assert.ok(
      content.includes("NEVER share holdout"),
      "test-agent must not share holdout content"
    );
  });

  it("spec-agent cannot read holdout from previous features", () => {
    const content = readAgent("spec-agent");
    assert.ok(
      content.includes("NEVER read") &&
        content.includes("holdout"),
      "spec-agent must not read previous holdout scenarios"
    );
  });

  it("spec-agent cannot modify source code", () => {
    const content = readAgent("spec-agent");
    assert.ok(
      content.includes("NEVER modify source code"),
      "spec-agent must not modify source code"
    );
  });

  it("debug-agent cannot modify source code", () => {
    const content = readAgent("debug-agent");
    assert.ok(
      content.includes("NEVER modify source code"),
      "debug-agent must not modify source code"
    );
  });

  it("architect-agent has ZERO access to scenarios", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("ZERO access to scenarios"),
      "architect-agent must have zero scenario access"
    );
  });

  it("architect-agent NEVER discusses tests with spec/debug agents", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("NEVER discuss") &&
        content.toLowerCase().includes("test"),
      "architect-agent must never discuss tests"
    );
  });

  it("architect-agent NEVER asks agents to update scenarios", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("NEVER ask") &&
        content.toLowerCase().includes("scenario"),
      "architect-agent must never request scenario updates"
    );
  });

  it("promote-agent cannot modify source code", () => {
    const content = readAgent("promote-agent");
    assert.ok(
      content.includes("NEVER modify source code"),
      "promote-agent must not modify source code"
    );
  });

  it("df-orchestrate enforces all information barriers", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("NEVER pass holdout") &&
        content.includes("code-agent"),
      "Must prohibit passing holdout to code-agent"
    );
    assert.ok(
      content.includes("NEVER pass") &&
        content.includes("test-agent"),
      "Must prohibit passing public to test-agent"
    );
    assert.ok(
      content.includes("NEVER pass") &&
        content.includes("architect-agent"),
      "Must prohibit passing test content to architect-agent"
    );
  });

  it("findings forwarding strips round discussion (whitelist-based)", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("whitelist-based") || content.includes("whitelist"),
      "Findings forwarding must be whitelist-based"
    );
    assert.ok(
      content.includes("Key Decisions Made") && content.includes("Remaining Notes"),
      "Only Key Decisions Made and Remaining Notes sections should be forwarded"
    );
    assert.ok(
      content.includes("stripped") || content.includes("strip"),
      "Round discussion must be stripped from findings"
    );
  });
});

// ===========================================================================
// 7. Project onboarding
// ===========================================================================

describe("Project onboarding", () => {
  it("onboard-agent writes only to project-profile.md", () => {
    const content = readAgent("onboard-agent");
    assert.ok(
      content.includes("project-profile.md"),
      "onboard-agent should reference project-profile.md"
    );
    assert.ok(
      content.includes("NEVER modify source code"),
      "onboard-agent must not modify source code"
    );
  });

  it("df-onboard skill spawns onboard-agent", () => {
    const content = readSkill("df-onboard");
    assert.ok(
      content.includes("onboard-agent"),
      "df-onboard should reference onboard-agent"
    );
  });

  it("onboard-agent handles greenfield projects", () => {
    const content = readAgent("onboard-agent");
    assert.ok(
      content.toLowerCase().includes("greenfield") ||
        content.toLowerCase().includes("empty"),
      "onboard-agent should handle empty/greenfield projects"
    );
  });

  it("onboard-agent handles existing profiles (refresh check)", () => {
    const content = readAgent("onboard-agent");
    assert.ok(
      content.includes("refresh") || content.includes("existing profile"),
      "onboard-agent should check for existing profiles"
    );
  });

  it("all key agents reference project-profile.md", () => {
    for (const name of ["spec-agent", "debug-agent", "architect-agent", "code-agent", "test-agent", "promote-agent"]) {
      const content = readAgent(name);
      assert.ok(
        content.includes("project-profile.md"),
        `${name} should reference project-profile.md`
      );
    }
  });

  it("test-agent has section-targeted profile reading instructions", () => {
    const content = readAgent("test-agent");
    assert.ok(
      content.includes("project-profile.md"),
      "test-agent should reference project-profile.md"
    );
    assert.ok(
      content.includes("Testing") && content.includes("Tech Stack") && content.includes("Environment"),
      "test-agent should specify Testing, Tech Stack, and Environment sections"
    );
  });

  it("promote-agent has section-targeted profile reading instructions", () => {
    const content = readAgent("promote-agent");
    assert.ok(
      content.includes("project-profile.md"),
      "promote-agent should reference project-profile.md"
    );
    assert.ok(
      content.includes("Testing") && content.includes("Tech Stack"),
      "promote-agent should specify Testing and Tech Stack sections"
    );
  });

  it("df-orchestrate checks for project profile in pre-flight", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("project-profile.md"),
      "df-orchestrate should check for project profile"
    );
  });

  it("CLAUDE.md documents /df-onboard", () => {
    const claudeMd = fs.readFileSync(path.join(ROOT, "CLAUDE.md"), "utf8");
    assert.ok(
      claudeMd.includes("/df-onboard"),
      "CLAUDE.md should document /df-onboard"
    );
  });
});

// ===========================================================================
// 8. Bugfix red-green integrity
// ===========================================================================

describe("Bugfix red-green integrity", () => {
  it("code-agent defines strict red-green phases", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("Red Phase") || content.includes("PROVE THE BUG"),
      "code-agent should define Red Phase"
    );
    assert.ok(
      content.includes("Green Phase") || content.includes("FIX THE BUG"),
      "code-agent should define Green Phase"
    );
  });

  it("code-agent Step 1 prohibits source code changes", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("ONLY create/modify test files") ||
        content.includes("NO source code changes"),
      "Step 1 must prohibit source code changes"
    );
  });

  it("code-agent Step 2 prohibits test file changes", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("ONLY modify source code") ||
        content.includes("NO test file changes"),
      "Step 2 must prohibit test file changes"
    );
  });

  it("df-orchestrate verifies test FAILS in red phase", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("FAILS") || content.includes("fails"),
      "Orchestrator should verify test fails in red phase"
    );
  });

  it("df-orchestrate verifies test PASSES in green phase", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("PASSES") || content.includes("passes"),
      "Orchestrator should verify test passes in green phase"
    );
  });

  it("df-orchestrate checks for regression in green phase", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("regression") || content.includes("existing tests"),
      "Orchestrator should check for regression"
    );
  });
});

// ===========================================================================
// 8b. Bugfix regression prevention
// ===========================================================================

describe("Bugfix regression prevention", () => {
  // --- debug-agent: Systemic Analysis section ---
  it("debug-agent contains Systemic Analysis section in report template", () => {
    const content = readAgent("debug-agent");
    assert.ok(
      content.includes("Systemic Analysis"),
      "debug-agent should contain 'Systemic Analysis' section"
    );
  });

  it("debug-agent Systemic Analysis has Similar Patterns Found", () => {
    const content = readAgent("debug-agent");
    assert.ok(
      content.includes("Similar Patterns Found"),
      "debug-agent should contain 'Similar Patterns Found' subsection"
    );
  });

  it("debug-agent Systemic Analysis has Classification", () => {
    const content = readAgent("debug-agent");
    assert.ok(
      content.includes("Classification") && (content.includes("isolated incident") || content.includes("Isolated incident")),
      "debug-agent should contain Classification with isolated incident option"
    );
  });

  // --- debug-agent: Regression Risk Assessment section ---
  it("debug-agent contains Regression Risk Assessment section", () => {
    const content = readAgent("debug-agent");
    assert.ok(
      content.includes("Regression Risk Assessment"),
      "debug-agent should contain 'Regression Risk Assessment' section"
    );
  });

  it("debug-agent Regression Risk Assessment has risk level and reintroduction vectors", () => {
    const content = readAgent("debug-agent");
    assert.ok(
      content.includes("Risk Level") && content.includes("Reintroduction Vectors"),
      "debug-agent should contain Risk Level and Reintroduction Vectors"
    );
  });

  // --- debug-agent: Root Cause Depth ---
  it("debug-agent distinguishes immediate cause from deeper enabling pattern", () => {
    const content = readAgent("debug-agent");
    assert.ok(
      content.includes("Immediate Cause") && content.includes("Deeper Enabling Pattern"),
      "debug-agent should distinguish Immediate Cause from Deeper Enabling Pattern"
    );
  });

  // --- debug-agent: Variant scenarios ---
  it("debug-agent requires variant scenarios in both public and holdout", () => {
    const content = readAgent("debug-agent");
    assert.ok(
      content.includes("Variant scenario") || content.includes("variant scenario"),
      "debug-agent should reference variant scenarios"
    );
    assert.ok(
      content.includes("3-5") && content.toLowerCase().includes("variant"),
      "debug-agent should cap variant scenarios at 3-5"
    );
  });

  // --- code-agent: Root cause class targeting ---
  it("code-agent Red Phase targets root cause CLASS not symptom", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("root cause CLASS") || content.includes("root cause class"),
      "code-agent should require targeting root cause CLASS"
    );
  });

  it("code-agent Red Phase requires test name to reference root cause", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("test name must reference the root cause"),
      "code-agent should require test name to reference root cause"
    );
  });

  // --- code-agent: Variant test coverage ---
  it("code-agent requires variant test coverage proportional to risk", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("Variant test coverage") || content.includes("variant test"),
      "code-agent should reference variant test coverage"
    );
    assert.ok(
      content.includes("HIGH risk") && content.includes("LOW risk"),
      "code-agent should specify variant counts by risk level"
    );
  });

  // --- architect-agent: Regression risk evaluation ---
  it("architect-agent bugfix review evaluates regression risk depth", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("Regression risk depth evaluation") ||
        content.includes("regression risk depth"),
      "architect-agent should evaluate regression risk depth for bugfixes"
    );
  });

  it("architect-agent can BLOCK symptom-only fixes", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("BLOCK") && content.includes("symptom"),
      "architect-agent should be able to BLOCK symptom-only fixes"
    );
  });

  it("architect-agent bugfix review checks root-cause vs symptom distinction", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("Root-cause vs symptom") || content.includes("root-cause vs symptom"),
      "architect-agent should check root-cause vs symptom distinction"
    );
  });

  // --- promote-agent: Structured annotations ---
  it("promote-agent requires structured annotation with Root cause:", () => {
    const content = readAgent("promote-agent");
    assert.ok(
      content.includes("// Root cause:"),
      "promote-agent should require '// Root cause:' annotation"
    );
  });

  it("promote-agent requires structured annotation with Guards:", () => {
    const content = readAgent("promote-agent");
    assert.ok(
      content.includes("// Guards:"),
      "promote-agent should require '// Guards:' annotation"
    );
  });

  it("promote-agent requires structured annotation with Bug:", () => {
    const content = readAgent("promote-agent");
    assert.ok(
      content.includes("// Bug:"),
      "promote-agent should require '// Bug:' annotation"
    );
  });

  // --- df-debug SKILL: Investigator C structured output ---
  it("df-debug Investigator C requires Regression Risk Assessment", () => {
    const content = readSkill("df-debug");
    assert.ok(
      content.includes("Regression Risk Assessment") &&
        content.includes("Investigator C"),
      "df-debug Investigator C should require Regression Risk Assessment"
    );
  });

  it("df-debug Investigator C requires file:line references", () => {
    const content = readSkill("df-debug");
    assert.ok(
      content.includes("file:line") && content.includes("Investigator C"),
      "df-debug Investigator C should require file:line references"
    );
  });

  it("df-debug Investigator C requires Search Scope", () => {
    const content = readSkill("df-debug");
    assert.ok(
      content.includes("Search Scope"),
      "df-debug Investigator C should require Search Scope output"
    );
  });

  // --- df-debug SKILL: Synthesis regression risk dimension ---
  it("df-debug synthesis includes regression risk as dimension", () => {
    const content = readSkill("df-debug");
    assert.ok(
      content.includes("regression risk") || content.includes("Regression Risk") ||
        content.includes("Merge regression risk"),
      "df-debug synthesis should include regression risk as a dimension"
    );
  });
});

// ===========================================================================
// 8c. Lifecycle — promote + archive flow
// ===========================================================================

describe("Promote and archive lifecycle", () => {
  it("df-orchestrate references promote-agent.md", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("promote-agent.md"),
      "Should reference promote-agent.md"
    );
  });

  it("df-orchestrate includes archive step", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.toLowerCase().includes("archive"),
      "Should include archive step"
    );
  });

  it("df-orchestrate updates manifest status transitions", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("manifest.json"),
      "Should reference manifest.json for status updates"
    );
  });

  it("df-cleanup skill exists and handles stuck states", () => {
    const content = readSkill("df-cleanup");
    assert.ok(
      content.includes("passed") && content.includes("promoted"),
      "df-cleanup should handle passed and promoted stuck states"
    );
  });
});

// ===========================================================================
// 9. CLAUDE.md documents all commands
// ===========================================================================

describe("CLAUDE.md completeness", () => {
  const claudeMd = fs.readFileSync(path.join(ROOT, "CLAUDE.md"), "utf8");

  const requiredCommands = [
    "/df-onboard",
    "/df-intake",
    "/df-debug",
    "/df-orchestrate",
    "/df-cleanup",
    "/df-spec",
    "/df-scenario",
  ];

  for (const cmd of requiredCommands) {
    it(`documents ${cmd}`, () => {
      assert.ok(
        claudeMd.includes(cmd),
        `CLAUDE.md should document ${cmd}`
      );
    });
  }

  it("documents architect review in both pipelines", () => {
    assert.ok(
      claudeMd.includes("Architect review"),
      "CLAUDE.md should mention architect review"
    );
  });

  it("documents both feature and bugfix pipelines", () => {
    assert.ok(
      claudeMd.includes("Feature Pipeline"),
      "Should document feature pipeline"
    );
    assert.ok(
      claudeMd.includes("Bugfix Pipeline"),
      "Should document bugfix pipeline"
    );
  });
});
