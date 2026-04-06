import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// --- Users (prime-factory accounts) ---
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),              // UUID, generated at registration
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["cto", "developer"] }).notNull().default("developer"),
  orgId: text("org_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  lastActiveAt: integer("last_active_at", { mode: "timestamp" }),
});

// --- Organizations ---
export const orgs = sqliteTable("orgs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// --- Developer installs (CLI identity) ---
export const installs = sqliteTable("installs", {
  id: text("id").primaryKey(),              // userId provided at CLI registration
  orgId: text("org_id").notNull(),
  computerName: text("computer_name").notNull(),
  gitUserId: text("git_user_id").notNull(),
  hmac: text("hmac").notNull(),             // HMAC of (userId + computerName + gitUserId)
  apiKey: text("api_key").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  lastSeenAt: integer("last_seen_at", { mode: "timestamp" }),
});

// --- Telemetry events ---
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),              // UUID
  installId: text("install_id").notNull(),  // FK → installs.id
  orgId: text("org_id").notNull(),
  command: text("command").notNull(),       // df-intake | df-debug | df-orchestrate | df-onboard | df-cleanup
  subcommand: text("subcommand"),           // --group | --all | etc.
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  endedAt: integer("ended_at", { mode: "timestamp" }),
  durationMs: real("duration_ms"),
  outcome: text("outcome", { enum: ["success", "failed", "blocked", "abandoned"] }),
  featureName: text("feature_name"),
  roundCount: integer("round_count"),
  promptText: text("prompt_text"),          // full prompt text, time-ordered df lifecycle
  sessionId: text("session_id"),            // correlates events within one pipeline run
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// --- CTO JWT sessions ---
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
