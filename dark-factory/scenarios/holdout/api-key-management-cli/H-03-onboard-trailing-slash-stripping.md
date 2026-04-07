# Scenario H-03: df-onboard.sh trailing slash stripping — URL normalization

**Spec**: api-key-management-cli  
**Script**: cli-lib/df-onboard.sh  
**Type**: edge-case  
**Priority**: high — `log-event.sh` constructs `${BASE_URL}/api/v1/events`; a stored trailing slash produces a double-slash URL that breaks the endpoint

**Covers**: FR-3, BR-4, AC-6, EC-1

## Why This is a Holdout

The code-agent will likely implement trailing-slash stripping since it is in the spec, but the multi-slash variant (`///`) tests whether the implementation strips ALL trailing slashes or only one. A naive `${URL%/}` strips exactly one trailing slash, whereas `///` requires repeated stripping. This is the subtle correctness edge the holdout tests.

## Preconditions

- `~/.df-factory/config.json` does NOT exist
- Server returns HTTP 200 for `POST /api/v1/installs/activate` with any valid API key
- `hostname` returns `"dev-laptop"` and `git config user.email` returns `"alice@example.com"`

## Test Variants

### Variant A: Single trailing slash

**Input URL**: `https://prime-factory.example.com/`

**Expected network call URL**: `https://prime-factory.example.com/api/v1/installs/activate`

**Expected `baseUrl` in config**: `"https://prime-factory.example.com"` (no slash)

### Variant B: Multiple trailing slashes

**Input URL**: `https://prime-factory.example.com///`

**Expected network call URL**: `https://prime-factory.example.com/api/v1/installs/activate`

**Expected `baseUrl` in config**: `"https://prime-factory.example.com"` (all slashes stripped)

### Variant C: No trailing slash (baseline — normalization is a no-op)

**Input URL**: `https://prime-factory.example.com`

**Expected network call URL**: `https://prime-factory.example.com/api/v1/installs/activate`

**Expected `baseUrl` in config**: `"https://prime-factory.example.com"`

## Steps (for each variant)

1. Run `bash cli-lib/df-onboard.sh`
2. Enter the variant URL at the URL prompt
3. Enter `sk_live_abc123` at the API key prompt

## Expected Outcome (each variant)

**Stdout**:
```
Onboarding complete. You're connected to https://prime-factory.example.com.
```

**Exit code**: `0`

**Config `baseUrl` field**: `"https://prime-factory.example.com"` (all trailing slashes removed)

## Assertions

- `baseUrl` stored in config.json has no trailing slash
- The success message in stdout uses the normalized URL (no trailing slash)
- The POST request goes to the normalized URL path
- After onboarding, running `log-event.sh` with any payload constructs a valid event endpoint URL: `https://prime-factory.example.com/api/v1/events` (no double-slash)

## Scheme Validation Sub-case

**Input URL**: `ftp://prime-factory.example.com`

**Expected Stdout**:
```
Invalid URL. Must start with http:// or https://.
```

**Expected Exit code**: `1`

**File system**: no config written, no network call
