# Scenario P-13: Password exactly at 1000-character limit is accepted at signup

## Type
edge-case

## Priority
medium — boundary validation; ensures the limit is inclusive

## Preconditions
- Database is empty

## Action
```
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "boundary@example.com",
  "password": "<string of exactly 1000 characters>",
  "orgName": "BoundaryOrg"
}
```

## Expected Outcome
- HTTP 201
- User row is created successfully
- The password hash is stored (PBKDF2 runs on the 1000-char password without error)

## Notes
The 1001-character rejection is tested separately in H-17. This scenario confirms the limit is inclusive (1000 chars passes).
