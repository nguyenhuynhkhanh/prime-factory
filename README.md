# Prime Factory

A telemetry dashboard for [Dark Factory](https://github.com/nguyenhuynhkhanh/dark-factory) — track CLI usage, developer activity, and feature pipeline health across your team.

## What it does

- **API key management** — generate and revoke install keys for developers
- **Event explorer** — filter and paginate telemetry events by command, outcome, date range, and machine
- **Dashboard stats** — at-a-glance view of activity across your org

## Stack

- Next.js 16 (App Router) on Cloudflare Workers via `@opennextjs/cloudflare`
- D1 (SQLite) via Drizzle ORM
- Tailwind CSS v4

## Developer CLI

Developers interact with Prime Factory through shell scripts in `cli-lib/`. They never touch the dashboard directly.

### One-line install

```bash
curl -fsSL https://raw.githubusercontent.com/nguyenhuynhkhanh/prime-factory/main/cli-lib/install.sh | bash
```

This installs three scripts to `~/.local/bin`:

| Script | Purpose |
|---|---|
| `df-onboard.sh` | First-time setup — validates API key and writes `~/.df-factory/config.json` |
| `df-check-onboard.sh` | Offline guard — checks config exists before running df commands |
| `log-event.sh` | Fire-and-forget telemetry — called automatically by Dark Factory skills |

### Onboarding a developer

1. Go to the dashboard → **API Keys** → generate a new key
2. Share the key and the install command above with the developer
3. Developer runs `df-onboard.sh`, enters the server URL and API key
4. Done — events flow automatically from their Dark Factory CLI usage

## Running locally

```bash
npm install
npm run db:setup   # create and migrate local D1
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

```bash
npm run deploy
```

Builds with `opennextjs-cloudflare` and deploys to Cloudflare Workers + D1.

## Running tests

```bash
npm test   # bats tests for the CLI scripts (requires bats-core)
```
