const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

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

  it("architect-agent supports domain parameter for parallel review", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("domain parameter") || content.includes("Domain Parameter"),
      "architect-agent should support domain parameter for parallel review"
    );
  });

  it("df-orchestrate defines parallel domain review", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Parallel domain review") || content.includes("parallel domain review"),
      "df-orchestrate should define parallel domain review"
    );
  });

  it("df-orchestrate forwards findings to code-agents", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Key Decisions Made") && content.includes("Remaining Notes"),
      "df-orchestrate should forward Key Decisions Made and Remaining Notes to code-agents"
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
// 8. Lifecycle — promote + archive flow
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

// ===========================================================================
// 10. Group orchestration flags documented
// ===========================================================================

describe("Group orchestration flags", () => {
  it("CLAUDE.md documents --group flag", () => {
    const claudeMd = fs.readFileSync(path.join(ROOT, "CLAUDE.md"), "utf8");
    assert.ok(
      claudeMd.includes("--group"),
      "CLAUDE.md should document --group flag"
    );
  });

  it("CLAUDE.md documents --all flag", () => {
    const claudeMd = fs.readFileSync(path.join(ROOT, "CLAUDE.md"), "utf8");
    assert.ok(
      claudeMd.includes("--all"),
      "CLAUDE.md should document --all flag"
    );
  });

  it("CLAUDE.md documents --force flag", () => {
    const claudeMd = fs.readFileSync(path.join(ROOT, "CLAUDE.md"), "utf8");
    assert.ok(
      claudeMd.includes("--force"),
      "CLAUDE.md should document --force flag"
    );
  });

  it("dark-factory.md rules document --group flag", () => {
    const rules = fs.readFileSync(
      path.join(ROOT, ".claude", "rules", "dark-factory.md"),
      "utf8"
    );
    assert.ok(
      rules.includes("--group"),
      "dark-factory.md should document --group flag"
    );
  });

  it("dark-factory.md rules document --all flag", () => {
    const rules = fs.readFileSync(
      path.join(ROOT, ".claude", "rules", "dark-factory.md"),
      "utf8"
    );
    assert.ok(
      rules.includes("--all"),
      "dark-factory.md should document --all flag"
    );
  });

  it("dark-factory.md rules document --force flag", () => {
    const rules = fs.readFileSync(
      path.join(ROOT, ".claude", "rules", "dark-factory.md"),
      "utf8"
    );
    assert.ok(
      rules.includes("--force"),
      "dark-factory.md should document --force flag"
    );
  });

  it("df-orchestrate SKILL.md defines group mode section", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Group Mode"),
      "df-orchestrate should define Group Mode section"
    );
  });

  it("df-orchestrate SKILL.md defines all mode section", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("All Mode"),
      "df-orchestrate should define All Mode section"
    );
  });

  it("df-orchestrate SKILL.md defines cross-group guard", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Cross-Group Guard"),
      "df-orchestrate should define Cross-Group Guard section"
    );
  });

  it("df-orchestrate SKILL.md defines mutual exclusivity for --group and --all", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Cannot use --group and --all together"),
      "df-orchestrate should define mutual exclusivity error message"
    );
  });

  it("df-orchestrate SKILL.md defines mutual exclusivity for flags and explicit names", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Cannot combine --group/--all with explicit spec names"),
      "df-orchestrate should define flags + names exclusivity error message"
    );
  });

  it("df-orchestrate SKILL.md defines cycle detection in pre-flight", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Circular dependency detection") ||
        content.includes("circular dependency"),
      "df-orchestrate should include cycle detection"
    );
    assert.ok(
      content.includes("Circular dependency detected"),
      "df-orchestrate should include the cycle error message format"
    );
  });

  it("df-orchestrate SKILL.md defines cross-group dependency validation", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Cross-group dependency validation") ||
        content.includes("Dependencies must be within the same group"),
      "df-orchestrate should validate cross-group dependencies"
    );
  });

  it("df-orchestrate SKILL.md defines resume semantics", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Resume Semantics") || content.includes("resume"),
      "df-orchestrate should define resume semantics"
    );
    assert.ok(
      content.includes("already completed"),
      "df-orchestrate should show completed specs as skipped"
    );
  });

  it("df-orchestrate SKILL.md defines failure handling", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Failure Handling") ||
        content.includes("transitive dependents"),
      "df-orchestrate should define failure handling with dependent pausing"
    );
  });

  it("df-orchestrate SKILL.md handles backward compatibility for missing fields", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Missing `group`") || content.includes("missing `group`"),
      "df-orchestrate should handle missing group field"
    );
    assert.ok(
      content.includes("Missing `dependencies`") || content.includes("missing `dependencies`"),
      "df-orchestrate should handle missing dependencies field"
    );
  });

  it("df-orchestrate SKILL.md defines wave resolution algorithm", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Wave Resolution"),
      "df-orchestrate should define wave resolution algorithm"
    );
  });

  it("df-orchestrate SKILL.md --force warns when used with --group/--all", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("--force has no effect with --group/--all"),
      "df-orchestrate should warn about --force with --group/--all"
    );
  });
});

// ===========================================================================
// 11. Intake writes group and dependencies fields
// ===========================================================================

describe("Intake manifest field enforcement", () => {
  it("df-intake SKILL.md enforces mandatory group field", () => {
    const content = readSkill("df-intake");
    assert.ok(
      content.includes("MUST include") && content.includes("group"),
      "df-intake should enforce mandatory group field"
    );
  });

  it("df-intake SKILL.md enforces mandatory dependencies field", () => {
    const content = readSkill("df-intake");
    assert.ok(
      content.includes("MUST include") && content.includes("dependencies"),
      "df-intake should enforce mandatory dependencies field"
    );
  });

  it("df-intake SKILL.md sets group to null for standalone specs", () => {
    const content = readSkill("df-intake");
    assert.ok(
      content.includes("null") && content.includes("standalone"),
      "df-intake should set group to null for standalone specs"
    );
  });

  it("df-intake SKILL.md checks existing active specs for dependency overlap", () => {
    const content = readSkill("df-intake");
    assert.ok(
      content.includes("existing active specs") && content.includes("overlap"),
      "df-intake should check existing active specs for file overlap"
    );
  });
});

// ===========================================================================
// 12. Plugin mirrors match source files for group-orchestrate
// ===========================================================================

describe("Plugin mirrors for group-orchestrate", () => {
  it("plugins df-orchestrate SKILL.md matches source", () => {
    const source = fs.readFileSync(
      path.join(ROOT, ".claude", "skills", "df-orchestrate", "SKILL.md"),
      "utf8"
    );
    const plugin = fs.readFileSync(
      path.join(ROOT, "plugins", "dark-factory", "skills", "df-orchestrate", "SKILL.md"),
      "utf8"
    );
    assert.equal(source, plugin, "Plugin df-orchestrate SKILL.md should match source");
  });

  it("plugins df-intake SKILL.md matches source", () => {
    const source = fs.readFileSync(
      path.join(ROOT, ".claude", "skills", "df-intake", "SKILL.md"),
      "utf8"
    );
    const plugin = fs.readFileSync(
      path.join(ROOT, "plugins", "dark-factory", "skills", "df-intake", "SKILL.md"),
      "utf8"
    );
    assert.equal(source, plugin, "Plugin df-intake SKILL.md should match source");
  });

  it("plugins dark-factory.md rules match source", () => {
    const source = fs.readFileSync(
      path.join(ROOT, ".claude", "rules", "dark-factory.md"),
      "utf8"
    );
    const plugin = fs.readFileSync(
      path.join(ROOT, "plugins", "dark-factory", ".claude", "rules", "dark-factory.md"),
      "utf8"
    );
    assert.equal(source, plugin, "Plugin dark-factory.md should match source");
  });
});

// ===========================================================================
// Promoted from Dark Factory holdout: pipeline-velocity
// ===========================================================================

describe("Pipeline velocity: Contradiction escalation", () => {
  it("orchestrator defines contradiction detection during synthesis", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Contradiction detection"),
      "Orchestrator should define contradiction detection"
    );
  });

  it("orchestrator escalates contradictions to developer with both positions", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("BOTH positions") || content.includes("both positions"),
      "Orchestrator should present both positions"
    );
  });

  it("orchestrator does not silently drop recommendations", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Do NOT silently drop"),
      "Orchestrator should not silently drop recommendations"
    );
  });

  it("orchestrator waits for developer resolution via AskUserQuestion", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("AskUserQuestion") && content.includes("wait for resolution"),
      "Orchestrator should wait for developer input on contradictions"
    );
  });
});

describe("Pipeline velocity: Findings strip round discussion", () => {
  it("orchestrator extracts ONLY Key Decisions Made and Remaining Notes", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes('Extract ONLY the "Key Decisions Made" and "Remaining Notes"'),
      "Orchestrator should extract ONLY Key Decisions Made and Remaining Notes"
    );
  });

  it("orchestrator strips round-by-round discussion content", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Strip") && content.includes("round-by-round discussion"),
      "Orchestrator should strip round-by-round discussion"
    );
  });

  it("code-agent documents findings are stripped of round discussion", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("stripped of round discussion"),
      "Code-agent should note findings are stripped of round discussion"
    );
  });

  it("code-agent only lists Key Decisions Made and Remaining Notes as findings content", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes('"Key Decisions Made"') && content.includes('"Remaining Notes"'),
      "Code-agent should list Key Decisions Made and Remaining Notes"
    );
  });
});

describe("Pipeline velocity: One domain architect fails", () => {
  it("orchestrator handles partial domain review when some files exist", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("some but not all domain review files exist"),
      "Orchestrator should handle partial domain review results"
    );
  });

  it("orchestrator only re-spawns for missing domains", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Only re-spawn architect-agents for the missing domains"),
      "Orchestrator should only re-spawn for missing domains"
    );
  });

  it("orchestrator reuses existing domain review files for completed domains", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Reuse existing domain review files"),
      "Orchestrator should reuse existing domain review files"
    );
  });
});

describe("Pipeline velocity: Pass 3 cap enforced", () => {
  it("orchestrator enforces maximum 3 total passes", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Maximum 3 total passes"),
      "Orchestrator should enforce maximum 3 total passes"
    );
  });

  it("pass count is initial parallel + up to 2 follow-ups", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("initial parallel + up to 2 follow-ups"),
      "Pass count should be initial parallel + up to 2 follow-ups"
    );
  });

  it("orchestrator does not proceed to implementation after BLOCKED on all passes", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("BLOCKED after all passes") && content.includes("do NOT proceed"),
      "Orchestrator should not proceed after BLOCKED on all passes"
    );
  });
});

describe("Pipeline velocity: Overlapping concerns deduplicated", () => {
  it("orchestrator defines deduplication of overlapping findings", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Deduplicate overlapping findings across domains"),
      "Orchestrator should define deduplication of overlapping findings"
    );
  });

  it("orchestrator merges semantic overlaps into a single finding", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("SINGLE finding"),
      "Orchestrator should merge overlaps into a single finding"
    );
  });

  it("orchestrator attributes all source domains in deduplicated findings", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Attribute all source domains"),
      "Orchestrator should attribute source domains"
    );
  });

  it("orchestrator uses highest severity from any domain for merged findings", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("highest severity"),
      "Orchestrator should use highest severity from any domain"
    );
  });

  it("orchestrator provides rate limiting dedup example", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("rate limiting") && content.includes("ONE finding"),
      "Orchestrator should provide a concrete dedup example"
    );
  });
});

describe("Pipeline velocity: Empty Key Decisions forwarding", () => {
  it("orchestrator handles no Key Decisions section as no-op", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("no-op, not an error"),
      "Empty findings should be no-op, not an error"
    );
  });

  it("orchestrator passes empty findings to code-agent when no Key Decisions exist", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("pass empty findings"),
      "Orchestrator should pass empty findings"
    );
  });

  it("code-agent treats findings as optional input", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("(optional)") && content.includes("Architect Review Findings"),
      "Code-agent should treat architect findings as optional"
    );
  });
});

describe("Pipeline velocity: Test suite integrity", () => {
  it("test suite does not reference deleted init script", () => {
    const content = fs.readFileSync(
      path.join(ROOT, "tests", "dark-factory-setup.test.js"),
      "utf8"
    );
    // Split string to avoid self-reference
    assert.ok(
      !content.includes("init-dark-" + "factory.js"),
      "Test suite should not reference deleted init script"
    );
  });

  it("test suite does not assert old 3-round model", () => {
    const content = fs.readFileSync(
      path.join(ROOT, "tests", "dark-factory-setup.test.js"),
      "utf8"
    );
    // Split strings to avoid self-reference
    assert.ok(
      !content.includes("minimum 3 " + "rounds") && !content.includes("at least 3 " + "rounds"),
      "Test suite should not assert old 3-round model"
    );
  });

  it("test suite asserts domain parameter support in architect-agent", () => {
    const content = fs.readFileSync(
      path.join(ROOT, "tests", "dark-factory-setup.test.js"),
      "utf8"
    );
    assert.ok(
      content.includes("domain parameter"),
      "Suite 5 should assert domain parameter support"
    );
  });

  it("test suite asserts parallel domain review in orchestrator", () => {
    const content = fs.readFileSync(
      path.join(ROOT, "tests", "dark-factory-setup.test.js"),
      "utf8"
    );
    assert.ok(
      content.includes("parallel domain review"),
      "Suite 5 should assert parallel domain review"
    );
  });

  it("test suite asserts findings forwarding to code-agents", () => {
    const content = fs.readFileSync(
      path.join(ROOT, "tests", "dark-factory-setup.test.js"),
      "utf8"
    );
    assert.ok(
      content.includes("forwards findings") || content.includes("Key Decisions Made"),
      "Suite 5 should assert findings forwarding"
    );
  });

  it("architect review gate suite still exists with meaningful assertions", () => {
    const content = fs.readFileSync(
      path.join(ROOT, "tests", "dark-factory-setup.test.js"),
      "utf8"
    );
    assert.ok(
      content.includes("Architect review gate"),
      "Suite 5 (Architect review gate) should still exist"
    );
  });

  it("deleted init script no longer exists on disk", () => {
    const scriptName = "init-dark-" + "factory.js";
    assert.ok(
      !fs.existsSync(path.join(ROOT, "scripts", scriptName)),
      "scripts/" + scriptName + " should be deleted"
    );
  });
});

describe("Pipeline velocity: Review file backward compatibility", () => {
  it("architect-agent standard review format has all required section headers", () => {
    const content = readAgent("architect-agent");
    assert.ok(content.includes("## Architect Review:"), "Should have ## Architect Review: header");
    assert.ok(content.includes("### Rounds:"), "Should have ### Rounds: header");
    assert.ok(content.includes("### Status:"), "Should have ### Status: header");
    assert.ok(content.includes("### Key Decisions Made"), "Should have ### Key Decisions Made section");
    assert.ok(content.includes("### Remaining Notes"), "Should have ### Remaining Notes section");
    assert.ok(content.includes("### Blockers"), "Should have ### Blockers section");
  });

  it("orchestrator writes synthesized review in backward-compatible format", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("backward-compatible format"),
      "Orchestrator should write backward-compatible review format"
    );
  });

  it("orchestrator checks for existing review APPROVED status to skip re-review", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("already exists with status APPROVED"),
      "Orchestrator should check for cached review APPROVED status"
    );
  });

  it("domain review format is separate from standard review format", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("## Domain Review:"),
      "Domain review should have its own format header"
    );
    assert.ok(
      content.includes("Do NOT write to") && content.includes("review.md"),
      "Domain review should not write to main review file"
    );
  });
});

describe("Pipeline velocity: Information barrier - architects and scenarios", () => {
  it("architect-agent NEVER reads, discusses, or references scenarios", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("NEVER read, discuss, or reference scenarios"),
      "Architect-agent must never read, discuss, or reference scenarios"
    );
  });

  it("orchestrator information barriers prohibit passing test content to architect-agent", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("NEVER pass") && content.includes("architect-agent"),
      "Orchestrator must prohibit passing test/scenario content to architect-agent"
    );
  });
});

describe("Pipeline velocity: Post-hoc file count with parallel agents", () => {
  it("orchestrator defines post-implementation file count check section", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Post-Implementation File Count"),
      "Orchestrator should define Post-Implementation File Count section"
    );
  });

  it("orchestrator gathers files from ALL code-agents across ALL tracks", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("ALL code-agents across ALL tracks"),
      "Orchestrator should gather files from all code-agents across all tracks"
    );
  });

  it("orchestrator computes distinct union of modified files", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("distinct") && content.includes("union"),
      "Orchestrator should compute distinct union"
    );
  });

  it("orchestrator updates manifest with actualFiles and estimatedFiles", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("actualFiles") && content.includes("estimatedFiles") && content.includes("manifest"),
      "Orchestrator should update manifest with actualFiles and estimatedFiles"
    );
  });

  it("orchestrator warns not to only count last agent files", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("do not only count the last agent"),
      "Orchestrator should warn against counting only last agent's files"
    );
  });
});

describe("Pipeline velocity: Re-synthesize from cached domain files", () => {
  it("orchestrator checks for cached domain review files before spawning", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Check for cached domain review files"),
      "Orchestrator should check for cached domain files"
    );
  });

  it("orchestrator does not re-spawn when all domain files exist", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Do NOT re-spawn architect-agents"),
      "Orchestrator should not re-spawn when domain files are cached"
    );
  });

  it("orchestrator re-synthesizes from existing domain files", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Re-synthesiz"),
      "Orchestrator should re-synthesize from cached domain files"
    );
  });

  it("domain review files are described as source of truth", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("domain reviews are cached and are the source of truth"),
      "Domain review files should be the source of truth"
    );
  });
});

describe("Pipeline velocity: Domain timeout and targeted retry", () => {
  it("orchestrator supports targeted retry for missing domains only", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Only re-spawn architect-agents for the missing domains"),
      "Orchestrator should only re-spawn for missing domains"
    );
  });

  it("orchestrator preserves completed domain reviews during retry", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Reuse existing domain review files for the domains that completed"),
      "Orchestrator should reuse existing domain review files"
    );
  });
});

describe("Pipeline velocity: Plugin mirrors match source files", () => {
  it("plugin architect-agent.md matches source", () => {
    const source = readAgent("architect-agent");
    const plugin = fs.readFileSync(
      path.join(ROOT, "plugins", "dark-factory", "agents", "architect-agent.md"),
      "utf8"
    );
    assert.equal(source, plugin, "Plugin architect-agent.md should match source");
  });

  it("plugin code-agent.md matches source", () => {
    const source = readAgent("code-agent");
    const plugin = fs.readFileSync(
      path.join(ROOT, "plugins", "dark-factory", "agents", "code-agent.md"),
      "utf8"
    );
    assert.equal(source, plugin, "Plugin code-agent.md should match source");
  });

  it("README files do not contain legacy 3+ rounds language", () => {
    const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
    const dfReadme = fs.readFileSync(path.join(ROOT, "dark-factory", "README.md"), "utf8");
    assert.ok(!readme.includes("3+ rounds"), "README.md should not contain '3+ rounds'");
    assert.ok(!dfReadme.includes("3+ rounds"), "dark-factory/README.md should not contain '3+ rounds'");
  });
});

// ===========================================================================
// Promoted from Dark Factory holdout: onboard-improvement
// ===========================================================================

describe("Onboard improvement: Greenfield handling", () => {
  it("onboard-agent addresses greenfield projects explicitly", () => {
    const content = readAgent("onboard-agent");
    assert.ok(
      content.toLowerCase().includes("greenfield"),
      "onboard-agent should address greenfield projects"
    );
  });

  it("onboard-agent includes placeholder guidance for greenfield template sections", () => {
    const content = readAgent("onboard-agent");
    assert.ok(
      content.includes("Not yet established") || content.includes("placeholder"),
      "onboard-agent should include placeholder guidance for greenfield sections"
    );
  });
});

describe("Onboard improvement: Non-API project N/A guidance", () => {
  it("onboard-agent marks API sections as N/A for non-API project types", () => {
    const content = readAgent("onboard-agent");
    assert.ok(
      content.includes("N/A") && content.includes("API Conventions"),
      "onboard-agent should mark API Conventions as N/A for non-API projects"
    );
  });

  it("onboard-agent distinguishes N/A from not-yet-established", () => {
    const content = readAgent("onboard-agent");
    assert.ok(
      content.includes("not applicable") || content.includes("not yet established"),
      "onboard-agent should distinguish N/A from greenfield placeholders"
    );
  });
});

describe("Onboard improvement: Large project sampling cap", () => {
  it("onboard-agent caps sampling for projects with many top-level directories", () => {
    const content = readAgent("onboard-agent");
    assert.ok(
      content.includes("20 top-level directories") || content.includes("more than 20"),
      "onboard-agent should cap at 20 top-level directories"
    );
  });

  it("onboard-agent notifies developer when sampling is partial", () => {
    const content = readAgent("onboard-agent");
    assert.ok(
      content.includes("sampling was partial") || content.includes("not sampled"),
      "onboard-agent should notify developer about partial sampling"
    );
  });
});

describe("Onboard improvement: Incremental refresh", () => {
  it("onboard-agent supports per-section accept/reject during refresh", () => {
    const content = readAgent("onboard-agent");
    assert.ok(
      content.includes("accept or reject"),
      "onboard-agent should support per-section accept/reject"
    );
  });

  it("onboard-agent preserves custom sections from existing profile", () => {
    const content = readAgent("onboard-agent");
    assert.ok(
      content.includes("custom") && content.includes("preserved"),
      "onboard-agent should preserve custom sections"
    );
  });
});

describe("Onboard improvement: Sign-off rejection handling", () => {
  it("onboard-agent handles rejection with revision cycle", () => {
    const content = readAgent("onboard-agent");
    assert.ok(
      content.includes("rejects") || content.includes("reject"),
      "onboard-agent should handle rejection"
    );
    assert.ok(
      content.includes("revise") || content.includes("re-present"),
      "onboard-agent should support revision cycle"
    );
  });
});

describe("Onboard improvement: Consuming agents use soft profile language", () => {
  it("all key agents use soft language for profile section targeting", () => {
    for (const name of ["code-agent", "architect-agent", "debug-agent", "promote-agent", "spec-agent", "test-agent"]) {
      const content = readAgent(name);
      assert.ok(
        content.includes("focus on these sections") || content.includes("if it exists"),
        `${name} should use soft language for profile reading`
      );
    }
  });
});

describe("Onboard improvement: Intake leads read profile before research", () => {
  it("df-intake leads read project profile before codebase research", () => {
    const content = readSkill("df-intake");
    assert.ok(
      content.includes("project-profile.md"),
      "df-intake should reference project-profile.md"
    );
  });
});

describe("Onboard improvement: Debug investigators read profile before investigation", () => {
  it("df-debug investigators read project profile before investigation", () => {
    const content = readSkill("df-debug");
    assert.ok(
      content.includes("project-profile.md"),
      "df-debug should reference project-profile.md"
    );
  });
});

describe("Onboard improvement: Plugin mirrors match source files", () => {
  it("plugin architect-agent.md matches source for onboard changes", () => {
    const source = readAgent("architect-agent");
    const plugin = fs.readFileSync(
      path.join(ROOT, "plugins", "dark-factory", "agents", "architect-agent.md"),
      "utf8"
    );
    assert.equal(source, plugin, "Plugin architect-agent.md should match source");
  });

  it("plugin debug-agent.md matches source for onboard changes", () => {
    const source = readAgent("debug-agent");
    const plugin = fs.readFileSync(
      path.join(ROOT, "plugins", "dark-factory", "agents", "debug-agent.md"),
      "utf8"
    );
    assert.equal(source, plugin, "Plugin debug-agent.md should match source");
  });
});

// ===========================================================================
// Promoted from Dark Factory holdout: bugfix-regression-prevention
// ===========================================================================

describe("Bugfix regression: Systemic Analysis awareness-only constraint", () => {
  it("debug-agent Systemic Analysis section states patterns are awareness-only", () => {
    const content = readAgent("debug-agent");
    assert.ok(
      content.includes("awareness only"),
      "Systemic Analysis should state patterns are for awareness only"
    );
    assert.ok(
      content.includes("developer decides"),
      "Should state the developer decides whether to fix similar patterns"
    );
  });
});

describe("Bugfix regression: Regression Risk requires concrete refs", () => {
  it("debug-agent Regression Risk section requires concrete code references", () => {
    const content = readAgent("debug-agent");
    assert.ok(
      content.includes("concrete code references") ||
        content.includes("Provide concrete code references"),
      "Reintroduction vectors should require concrete code references"
    );
    assert.ok(
      content.includes("not abstract categories"),
      "Should explicitly reject abstract categories"
    );
  });
});

describe("Bugfix regression: Root Cause Depth handles identical pattern", () => {
  it("debug-agent provides guidance when no deeper pattern exists", () => {
    const content = readAgent("debug-agent");
    assert.ok(
      content.includes("Immediate cause and deeper pattern are identical"),
      "Should provide guidance for identical immediate/deeper pattern"
    );
    assert.ok(
      content.includes("no deeper structural issue"),
      "Should state no deeper structural issue"
    );
  });
});

describe("Bugfix regression: Investigator C preserves output sections", () => {
  it("df-debug Investigator C has all original sections plus new ones", () => {
    const content = readSkill("df-debug");
    assert.ok(content.includes("Similar Patterns Found"), "Should have Similar Patterns Found");
    assert.ok(content.includes("Edge Cases"), "Should have Edge Cases");
    assert.ok(content.includes("Systemic Issues"), "Should have Systemic Issues");
    assert.ok(content.includes("Root Cause Hypothesis"), "Should have Root Cause Hypothesis");
    assert.ok(content.includes("Search Scope"), "Should have Search Scope");
    assert.ok(content.includes("Classification"), "Should have Classification");
    assert.ok(content.includes("Regression Risk Assessment"), "Should have Regression Risk Assessment");
  });
});

describe("Bugfix regression: Investigator C search scope expansion", () => {
  it("df-debug specifies module-first search with conditional expansion", () => {
    const content = readSkill("df-debug");
    assert.ok(
      content.includes("same module/directory") && content.includes("FIRST"),
      "Should specify module-first search"
    );
    assert.ok(
      content.includes("shared/core code") || content.includes("shared code"),
      "Should specify expansion only for shared/core code"
    );
  });
});

describe("Bugfix regression: Investigator C proportional output", () => {
  it("df-debug distinguishes trivial from complex bug output", () => {
    const content = readSkill("df-debug");
    assert.ok(
      content.includes("file:line ref"),
      "Complex bug output should include file:line references"
    );
  });
});

describe("Bugfix regression: Synthesis takes highest risk", () => {
  it("df-debug synthesis step takes HIGHEST risk level", () => {
    const content = readSkill("df-debug");
    assert.ok(
      content.includes("HIGHEST risk level"),
      "Should specify taking highest risk level"
    );
    assert.ok(
      content.includes("rationale from the investigator"),
      "Should include rationale from the investigator who identified highest risk"
    );
  });
});

describe("Bugfix regression: Code-agent test naming references root cause", () => {
  it("code-agent Red Phase requires root-cause-based test names", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("test name must reference the root cause"),
      "Should require root cause in test name"
    );
    assert.ok(
      content.includes("test_unbounded_query_without_limit") ||
        content.includes("not the symptom"),
      "Should provide naming example or contrast"
    );
  });
});

describe("Bugfix regression: Code-agent HIGH risk requires 3-5 variants", () => {
  it("code-agent Red Phase specifies 3-5 variants for HIGH risk", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("HIGH risk") && content.includes("3-5 variant"),
      "Should specify 3-5 variants for HIGH risk"
    );
    assert.ok(
      content.includes("Maximum 3-5") || content.includes("maximum 3-5"),
      "Should have explicit cap"
    );
  });
});

describe("Bugfix regression: Code-agent LOW risk requires justification", () => {
  it("code-agent Red Phase requires justification for zero variants", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("LOW risk") &&
        content.includes("justification"),
      "Should require justification for LOW risk zero variants"
    );
  });
});

describe("Bugfix regression: Debug-agent variant scenarios in both public and holdout", () => {
  it("debug-agent requires variants in both public and holdout", () => {
    const content = readAgent("debug-agent");
    assert.ok(
      content.includes("Variant scenarios") || content.includes("variant scenarios"),
      "Should mention variant scenarios"
    );
    assert.ok(
      content.includes("BOTH public") || content.includes("both public"),
      "Should specify variants in both public and holdout"
    );
  });
});

describe("Bugfix regression: Debug-agent variant cap with prioritization", () => {
  it("debug-agent caps variants at 3-5 with prioritization guidance", () => {
    const content = readAgent("debug-agent");
    assert.ok(
      content.includes("Maximum 3-5 variant scenarios") || content.includes("maximum 3-5"),
      "Should cap at 3-5"
    );
    assert.ok(
      content.includes("prioritize by risk"),
      "Should provide prioritization guidance"
    );
  });
});

describe("Bugfix regression: Architect proportional BLOCK for symptom-only fixes", () => {
  it("architect-agent can BLOCK symptom-only fixes proportionally", () => {
    const content = readAgent("architect-agent");
    assert.ok(
      content.includes("BLOCK") && content.includes("symptom"),
      "Should mention BLOCK for symptom-only fixes"
    );
    assert.ok(
      content.includes("proportional") || content.includes("be proportional"),
      "Should specify proportionality"
    );
    assert.ok(
      content.includes("Regression Risk Assessment") && content.includes("calibrate"),
      "Should use Regression Risk Assessment to calibrate"
    );
  });
});

describe("Bugfix regression: Promote-agent annotation uses structured format", () => {
  it("promote-agent uses specific annotation comment format", () => {
    const content = readAgent("promote-agent");
    assert.ok(
      content.includes("// Root cause:"),
      "Should have Root cause annotation format"
    );
    assert.ok(
      content.includes("// Guards:"),
      "Should have Guards annotation format"
    );
    assert.ok(
      content.includes("// Bug:"),
      "Should have Bug annotation format"
    );
    assert.ok(
      content.includes("// Promoted from Dark Factory holdout:"),
      "Should have existing Promoted annotation"
    );
  });
});

describe("Bugfix regression: Promote-agent fallback annotation for missing data", () => {
  it("promote-agent has fallback when root cause or guards unknown", () => {
    const content = readAgent("promote-agent");
    assert.ok(
      content.includes("see debug report"),
      "Should have fallback pointing to debug report"
    );
  });
});

describe("Bugfix regression: Backward compat for missing new sections", () => {
  it("code-agent defaults to LOW risk when Regression Risk Assessment is absent", () => {
    const content = readAgent("code-agent");
    assert.ok(
      content.includes("no Regression Risk Assessment") && content.includes("default"),
      "Should default to LOW when section is missing"
    );
  });

  it("promote-agent has fallback for missing root cause data", () => {
    const content = readAgent("promote-agent");
    assert.ok(
      content.includes("cannot be determined") && content.includes("fallback"),
      "Should have fallback behavior for missing data"
    );
  });
});

describe("Bugfix regression: Plugin mirrors match source files", () => {
  const mirrorPairs = [
    [".claude/agents/debug-agent.md", "plugins/dark-factory/agents/debug-agent.md"],
    [".claude/agents/code-agent.md", "plugins/dark-factory/agents/code-agent.md"],
    [".claude/agents/architect-agent.md", "plugins/dark-factory/agents/architect-agent.md"],
    [".claude/agents/promote-agent.md", "plugins/dark-factory/agents/promote-agent.md"],
    [".claude/skills/df-debug/SKILL.md", "plugins/dark-factory/skills/df-debug/SKILL.md"],
  ];

  for (const [source, mirror] of mirrorPairs) {
    it(`${path.basename(source)} plugin mirror matches source`, () => {
      const srcContent = fs.readFileSync(path.join(ROOT, source), "utf8");
      const mirContent = fs.readFileSync(path.join(ROOT, mirror), "utf8");
      assert.equal(srcContent, mirContent, `${mirror} should match ${source}`);
    });
  }
});

// ===========================================================================
// Promoted from Dark Factory holdout: group-orchestrate
// ===========================================================================

describe("Group orchestrate: Group matching uses exact equality", () => {
  it("df-orchestrate specifies exact string match for --group", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("exactly equals") || content.includes("exact match") || content.includes("exact string match"),
      "df-orchestrate should specify exact match for group lookup"
    );
  });

  it("df-orchestrate does not mention substring or partial matching", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      !content.includes("substring match") && !content.includes("partial match"),
      "df-orchestrate should not mention substring or partial matching"
    );
  });
});

describe("Group orchestrate: Standalone specs treated independently in --all mode", () => {
  it("df-orchestrate treats null/missing group as standalone", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("standalone"),
      "df-orchestrate should use term 'standalone' for null group"
    );
  });

  it("df-orchestrate treats each standalone spec as independent unit", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("each is an independent unit") || content.includes("independent unit"),
      "df-orchestrate should treat standalone specs as independent units"
    );
  });

  it("df-orchestrate handles missing group field as null", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Missing `group`") && content.includes("null"),
      "df-orchestrate should treat missing group as null"
    );
  });

  it("df-orchestrate handles missing dependencies field as empty array", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Missing `dependencies`") && content.includes("[]"),
      "df-orchestrate should treat missing dependencies as []"
    );
  });
});

describe("Group orchestrate: Dependencies satisfied by removal from manifest", () => {
  it("df-orchestrate defines satisfied dependency = not in manifest", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("NOT in the manifest") && content.includes("satisfied"),
      "df-orchestrate should define removed = satisfied"
    );
  });

  it("df-orchestrate shows completed deps as skipped in plan", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("already completed (skipped)") || content.includes("already completed"),
      "df-orchestrate should show completed deps as skipped"
    );
  });
});

describe("Group orchestrate: Self-dependency is a circular dependency", () => {
  it("df-orchestrate detects self-dependency as cycle", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("self-dependency") || content.includes("cycle of length 1"),
      "df-orchestrate should detect self-dependency as a cycle"
    );
  });

  it("df-orchestrate reports circular dependency error message format", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Circular dependency detected"),
      "df-orchestrate should include the circular dependency error message"
    );
  });

  it("df-orchestrate aborts before execution on cycle detection", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Abort") || content.includes("abort"),
      "df-orchestrate should abort on cycle detection"
    );
  });
});

describe("Group orchestrate: Group with single spec", () => {
  it("df-orchestrate group mode supports wave execution for any number of specs", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Wave 1") || content.includes("wave 1"),
      "df-orchestrate should support wave execution which naturally handles single-spec groups"
    );
  });

  it("df-orchestrate group mode resolves dependencies into waves", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Resolve dependencies into waves") || content.includes("resolve into execution waves"),
      "Group mode should resolve deps into waves"
    );
  });
});

describe("Group orchestrate: Completed group not found", () => {
  it("df-orchestrate errors when group has no active specs in manifest", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("No group named") && content.includes("found"),
      "df-orchestrate should error when group name not found"
    );
  });

  it("df-orchestrate lists available groups in the error message", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Available groups"),
      "df-orchestrate should list available groups in the error"
    );
  });
});

describe("Group orchestrate: Failure pauses transitive dependents", () => {
  it("df-orchestrate pauses transitive dependents on failure", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("transitive") && content.includes("dependent"),
      "df-orchestrate should pause transitive dependents"
    );
  });

  it("df-orchestrate continues independent specs after failure", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Continue") && content.includes("independent"),
      "df-orchestrate should continue independent specs"
    );
  });

  it("df-orchestrate does not auto-retry failed specs", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Ask the developer") || content.includes("ask the developer") ||
      content.includes("Do NOT auto-retry") || content.includes("do NOT auto-retry"),
      "df-orchestrate should not auto-retry, instead ask developer"
    );
  });

  it("df-orchestrate reports completed, failed, and blocked specs", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Completed") && content.includes("Failed") && content.includes("Blocked"),
      "df-orchestrate should report completed, failed, and blocked"
    );
  });
});

describe("Group orchestrate: Diamond dependency wave resolution", () => {
  it("df-orchestrate defines topological sort for wave resolution", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Topological sort") || content.includes("topological sort") || content.includes("Topologically sort"),
      "df-orchestrate should use topological sort for waves"
    );
  });

  it("df-orchestrate wave resolution is deterministic", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("deterministic"),
      "Wave resolution should be deterministic"
    );
  });

  it("df-orchestrate places specs with all deps satisfied in earliest wave", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("waves < N") || content.includes("earlier wave"),
      "Specs should go in earliest possible wave based on deps"
    );
  });
});

describe("Group orchestrate: --all with no active specs", () => {
  it("df-orchestrate shows info message when no active specs found", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("No active specs found") && content.includes("Nothing to do"),
      "df-orchestrate should show 'No active specs found. Nothing to do.'"
    );
  });
});

describe("Group orchestrate: --group with empty string", () => {
  it("df-orchestrate errors on --group with no argument or empty string", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("--group requires a group name"),
      "df-orchestrate should error on empty --group"
    );
  });

  it("df-orchestrate shows usage hint for --group error", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Usage: /df-orchestrate --group <name>") ||
      content.includes("Usage: /df-orchestrate --group"),
      "df-orchestrate should show usage for --group error"
    );
  });
});

describe("Group orchestrate: All mode with uneven wave depths across groups", () => {
  it("df-orchestrate runs groups independently in --all mode", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("independent orchestration unit") ||
      content.includes("independent groups"),
      "Groups should be independent orchestration units"
    );
  });

  it("df-orchestrate runs cross-group waves in parallel", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("group A wave 1 and group B wave 1") ||
      content.includes("groups' waves in parallel"),
      "Cross-group waves should run in parallel"
    );
  });

  it("df-orchestrate keeps intra-group waves sequential", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Within each group, waves are sequential") ||
      content.includes("within each group"),
      "Waves within a group should be sequential"
    );
  });
});

describe("Group orchestrate: Explicit mode same group does not trigger cross-group guard", () => {
  it("df-orchestrate cross-group guard only triggers for different groups", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("same group") && content.includes("no guard") ||
      content.includes("same group") && content.includes("proceed normally"),
      "Cross-group guard should not trigger when all specs are same group"
    );
  });

  it("df-orchestrate cross-group guard only applies in explicit mode", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Explicit Mode Only") || content.includes("explicit mode"),
      "Cross-group guard should only apply in explicit mode"
    );
  });

  it("df-orchestrate single spec never triggers guard", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Single spec") && content.includes("Never triggers"),
      "Single spec should never trigger the guard"
    );
  });
});

describe("Group orchestrate: All mode with only standalone specs", () => {
  it("df-orchestrate standalone specs run in parallel in --all mode", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Standalone") && content.includes("parallel"),
      "Standalone specs should run in parallel"
    );
  });

  it("df-orchestrate execution plan has a Standalone section", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Standalone:"),
      "Execution plan should have a Standalone section"
    );
  });

  it("df-orchestrate standalone specs do not need wave ordering", () => {
    const content = readSkill("df-orchestrate");
    assert.ok(
      content.includes("Standalone specs run in parallel") ||
      content.includes("run in parallel with everything"),
      "Standalone specs should not need wave ordering"
    );
  });
});

