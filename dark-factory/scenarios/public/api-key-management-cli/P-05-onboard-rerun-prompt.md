# Scenario P-05: df-onboard.sh re-run prompt — N answer means no overwrite
# (includes y answer sub-case)

**Spec**: api-key-management-cli  
**Script**: cli-lib/df-onboard.sh  
**Covers**: FR-2, BR-3, AC-2, AC-3, EC-5, EC-6

## Preconditions

- `~/.df-factory/config.json` already exists with content:
  ```json
  {
    "apiKey": "sk_live_original",
    "baseUrl": "https://old-server.example.com"
  }
  ```

---

## Case A: Developer answers N (or presses Enter)

### Steps
1. Run `bash cli-lib/df-onboard.sh`
2. At the prompt "Config already exists. Re-onboard? [y/N]", enter `N` (or press Enter without typing)

### Expected Outcome

**Stdout**: _(empty — exits silently)_

**Exit code**: `0`

**File system state**: `~/.df-factory/config.json` is unchanged — still contains `sk_live_original` and `https://old-server.example.com`

### Assertions
- No URL or API key prompts are shown
- No network call is made
- Existing config is not modified
- Exit code is `0`

---

## Case B: Developer answers y (or Y) — proceeds to re-onboard

### Additional preconditions
- Server at `https://new-server.example.com` returns HTTP 200 for `POST /api/v1/installs/activate` with key `sk_live_new`
- `hostname` returns `"dev-laptop"`
- `git config user.email` returns `"alice@example.com"`

### Steps
1. Run `bash cli-lib/df-onboard.sh`
2. At the re-onboard prompt, enter `y` (or `Y`)
3. At the URL prompt, enter `https://new-server.example.com`
4. At the API key prompt, enter `sk_live_new`

### Expected Outcome

**Stdout**:
```
Onboarding complete. You're connected to https://new-server.example.com.
```

**Exit code**: `0`

**File system state**: `~/.df-factory/config.json` now contains:
```json
{
  "apiKey": "sk_live_new",
  "baseUrl": "https://new-server.example.com"
}
```

### Assertions
- Original `sk_live_original` value is overwritten
- Original `https://old-server.example.com` URL is overwritten
- File permissions remain `0600` after overwrite
- Exit code is `0`
