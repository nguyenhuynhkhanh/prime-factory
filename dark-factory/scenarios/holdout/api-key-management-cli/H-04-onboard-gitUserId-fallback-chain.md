# Scenario H-04: df-onboard.sh gitUserId fallback chain (no email → name → $USER)

**Spec**: api-key-management-cli  
**Script**: cli-lib/df-onboard.sh  
**Type**: edge-case  
**Priority**: high — the fallback chain is the only mechanism that ensures `gitUserId` is never empty; a broken chain results in an activation payload the server rejects with 400

**Covers**: FR-4, BR-5, AC-7, EC-2, EC-3

## Why This is a Holdout

The fallback chain has three levels: `git config user.email` → `git config user.name` → `$USER`. A code-agent may implement the first fallback but miss the second, or may implement the chain in the wrong order. These sub-cases probe each level individually and confirm the guard against an empty string from `git config` (which is different from the command returning nothing).

## Background

`git config user.email` can return:
- A non-empty value (happy path — captured and used)
- An empty string (git is configured but field is blank — must fall through)
- Nothing / exit non-zero (git key is unset — must fall through)

The implementation must treat both "empty string" and "unset/error" as a fall-through trigger.

---

## Case A: email is set — use email (baseline)

### Preconditions
- `git config user.email` → `"alice@example.com"` (non-empty)
- Server returns HTTP 200

### Expected payload
```json
{"computerName":"dev-laptop","gitUserId":"alice@example.com"}
```

---

## Case B: email is empty, name is set — fall through to name

### Preconditions
- `git config user.email` → `""` (empty string — user.email is set but blank)
- `git config user.name` → `"Alice Nguyen"` (non-empty)
- Server returns HTTP 200

### Expected payload
```json
{"computerName":"dev-laptop","gitUserId":"Alice Nguyen"}
```

### Assertion
`gitUserId` is `"Alice Nguyen"`, NOT `""` or absent.

---

## Case C: email is empty, name is empty — fall through to $USER

### Preconditions
- `git config user.email` → `""` (empty)
- `git config user.name` → `""` (empty)
- `$USER` environment variable → `"alice"`
- Server returns HTTP 200

### Expected payload
```json
{"computerName":"dev-laptop","gitUserId":"alice"}
```

### Assertion
`gitUserId` is `"alice"` (the OS username), NOT `""` or absent.

---

## Case D: git is not installed — fall through to $USER immediately

### Preconditions
- `git` command is not available in `$PATH` (or both `git config` calls exit non-zero)
- `$USER` → `"alice"`
- Server returns HTTP 200

### Expected payload
```json
{"computerName":"dev-laptop","gitUserId":"alice"}
```

### Assertion
Script does not abort or error because git is missing — it gracefully falls through to `$USER`.

---

## Steps (for each case)

1. Set up the git config environment per the case preconditions (e.g., using `GIT_CONFIG_GLOBAL=/dev/null` or mocking `git`)
2. Run `bash cli-lib/df-onboard.sh`
3. Enter `https://prime-factory.example.com` at the URL prompt
4. Enter `sk_live_abc123` at the API key prompt

## Expected Outcome (each case)

**Stdout**:
```
Onboarding complete. You're connected to https://prime-factory.example.com.
```

**Exit code**: `0`

**Config**: written with the correct `gitUserId` per case

## Shared Assertion

- `gitUserId` in the POST body is never an empty string or absent
- The fallback order is strictly: email → name → `$USER`
- No level of the chain causes the script to abort
