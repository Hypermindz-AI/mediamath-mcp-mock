# Quick Reference - OAuth 2.0 Authentication

## Test Credentials - Copy/Paste Ready

### Admin User (Full Access)
```json
{
  "grant_type": "password",
  "username": "admin@acme.com",
  "password": "password123",
  "client_id": "mediamath_mcp_client",
  "client_secret": "mock_client_secret",
  "audience": "https://api.mediamath.com",
  "scope": "openid profile email"
}
```

### Trader User (Read + Write Campaigns)
```json
{
  "grant_type": "password",
  "username": "trader@acme.com",
  "password": "password123",
  "client_id": "mediamath_mcp_client",
  "client_secret": "mock_client_secret",
  "audience": "https://api.mediamath.com",
  "scope": "openid profile email"
}
```

### Viewer User (Read-Only)
```json
{
  "grant_type": "password",
  "username": "viewer@acme.com",
  "password": "password123",
  "client_id": "mediamath_mcp_client",
  "client_secret": "mock_client_secret",
  "audience": "https://api.mediamath.com",
  "scope": "openid profile email"
}
```

## cURL Commands

### Get Access Token
```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{"grant_type":"password","username":"admin@acme.com","password":"password123","client_id":"mediamath_mcp_client","client_secret":"mock_client_secret","audience":"https://api.mediamath.com"}'
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{"grant_type":"refresh_token","refresh_token":"YOUR_REFRESH_TOKEN","client_id":"mediamath_mcp_client","client_secret":"mock_client_secret"}'
```

### Use Access Token
```bash
curl -X GET http://localhost:3000/api/mcp \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## All Users Quick Reference

| Email | Password | User ID | Org ID | Role | Status |
|-------|----------|---------|--------|------|--------|
| admin@acme.com | password123 | 1 | 100048 | ADMIN | active |
| trader@acme.com | password123 | 2 | 100048 | TRADER | active |
| manager@acme.com | password123 | 3 | 100048 | MANAGER | active |
| analyst@acme.com | password123 | 4 | 100048 | ANALYST | active |
| viewer@acme.com | password123 | 5 | 100048 | VIEWER | active |
| admin@brandco.com | password123 | 6 | 100049 | ADMIN | active |
| trader@brandco.com | password123 | 7 | 100049 | TRADER | active |
| admin@medialab.com | password123 | 8 | 100050 | ADMIN | active |
| trader@medialab.com | password123 | 9 | 100050 | TRADER | active |
| inactive@acme.com | password123 | 10 | 100048 | VIEWER | inactive |

## Client Credentials

| Client ID | Client Secret |
|-----------|---------------|
| mediamath_mcp_client | mock_client_secret |
| test_client | test_secret |

## Token Lifetimes

- **Access Token:** 24 hours (86400 seconds)
- **Refresh Token:** 30 days

## Common Error Codes

| Error | Status | Description |
|-------|--------|-------------|
| invalid_request | 400 | Missing required parameters |
| invalid_client | 401 | Invalid client credentials |
| invalid_grant | 401 | Invalid username/password or refresh token |
| unsupported_grant_type | 400 | Unsupported grant type |
| invalid_scope | 400 | Invalid scope parameter |
| server_error | 500 | Internal server error |

## One-Line Quick Start

```bash
# Install, setup, and test in one go
npm install && cp .env.example .env.local && npm run dev
```

Then in another terminal:
```bash
curl -X POST http://localhost:3000/api/oauth/token -H "Content-Type: application/json" -d '{"grant_type":"password","username":"admin@acme.com","password":"password123","client_id":"mediamath_mcp_client","client_secret":"mock_client_secret"}'
```
