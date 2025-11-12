# OAuth 2.0 Authentication Testing Guide

## Overview

The MediaMath MCP Mock server implements OAuth 2.0 authentication with the following flows:
- **Resource Owner Password Grant** (for initial login)
- **Refresh Token Grant** (for token renewal)

## Test Credentials

### Mock Users

The system includes 10 mock users across 3 organizations:

#### Organization 100048 (ACME Corporation)

| Email | Password | User ID | Role | Status |
|-------|----------|---------|------|--------|
| admin@acme.com | password123 | 1 | ADMIN | active |
| trader@acme.com | password123 | 2 | TRADER | active |
| manager@acme.com | password123 | 3 | MANAGER | active |
| analyst@acme.com | password123 | 4 | ANALYST | active |
| viewer@acme.com | password123 | 5 | VIEWER | active |
| inactive@acme.com | password123 | 10 | VIEWER | inactive |

#### Organization 100049 (BrandCo)

| Email | Password | User ID | Role | Status |
|-------|----------|---------|------|--------|
| admin@brandco.com | password123 | 6 | ADMIN | active |
| trader@brandco.com | password123 | 7 | TRADER | active |

#### Organization 100050 (MediaLab)

| Email | Password | User ID | Role | Status |
|-------|----------|---------|------|--------|
| admin@medialab.com | password123 | 8 | ADMIN | active |
| trader@medialab.com | password123 | 9 | TRADER | active |

### Client Credentials

| Client ID | Client Secret |
|-----------|---------------|
| mediamath_mcp_client | mock_client_secret |
| test_client | test_secret |

## API Endpoints

### 1. POST /api/oauth/token (Password Grant)

Request a new access token using username and password.

**Endpoint:** `POST /api/oauth/token`

**Request Body:**
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

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "GEbRxBN...edjnXbL",
  "expires_in": 86400,
  "token_type": "Bearer",
  "scope": "openid profile email"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "username": "admin@acme.com",
    "password": "password123",
    "client_id": "mediamath_mcp_client",
    "client_secret": "mock_client_secret",
    "audience": "https://api.mediamath.com",
    "scope": "openid profile email"
  }'
```

### 2. POST /api/oauth/token (Refresh Token Grant)

Refresh an access token using a refresh token.

**Endpoint:** `POST /api/oauth/token`

**Request Body:**
```json
{
  "grant_type": "refresh_token",
  "refresh_token": "GEbRxBN...edjnXbL",
  "client_id": "mediamath_mcp_client",
  "client_secret": "mock_client_secret"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "new_refresh_token",
  "expires_in": 86400,
  "token_type": "Bearer",
  "scope": "openid profile email"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "refresh_token",
    "refresh_token": "YOUR_REFRESH_TOKEN",
    "client_id": "mediamath_mcp_client",
    "client_secret": "mock_client_secret"
  }'
```

## Error Responses

### Invalid Credentials
```json
{
  "error": "invalid_grant",
  "error_description": "Invalid username or password"
}
```
**Status:** 401 Unauthorized

### Missing Parameters
```json
{
  "error": "invalid_request",
  "error_description": "Missing required parameter: grant_type"
}
```
**Status:** 400 Bad Request

### Invalid Client
```json
{
  "error": "invalid_client",
  "error_description": "Invalid client credentials"
}
```
**Status:** 401 Unauthorized

### Unsupported Grant Type
```json
{
  "error": "unsupported_grant_type",
  "error_description": "Grant type 'client_credentials' is not supported"
}
```
**Status:** 400 Bad Request

### Invalid Refresh Token
```json
{
  "error": "invalid_grant",
  "error_description": "Invalid or expired refresh token"
}
```
**Status:** 401 Unauthorized

## Using Access Tokens

Once you have an access token, include it in the Authorization header for all API requests:

```bash
curl -X GET http://localhost:3000/api/mcp \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Token Details

### Access Token (JWT)

The access token is a JSON Web Token (JWT) containing:

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "userId": 1,
  "organizationId": 100048,
  "role": "ADMIN",
  "email": "admin@acme.com",
  "iat": 1699564800,
  "exp": 1699651200,
  "jti": "unique-token-id"
}
```

**Expiration:** 24 hours (86400 seconds)

### Refresh Token

The refresh token is an opaque string that can be used to obtain a new access token.

**Expiration:** 30 days

## Role-Based Permissions

Each role has different permissions:

### ADMIN
- Full read/write access to all resources
- Can manage users and organizations
- Can create and update campaigns and strategies

### MANAGER
- Read access to all resources
- Can create and update campaigns and strategies
- Cannot manage users or organizations

### TRADER
- Read access to all resources
- Can create and update campaigns and strategies
- Limited organizational access

### ANALYST
- Read-only access to campaigns, strategies, and organizations
- Cannot create or update resources

### VIEWER
- Limited read-only access to campaigns and strategies
- Cannot access organizational data

## Testing Scenarios

### Scenario 1: Successful Login
1. Request token with valid credentials
2. Verify response contains access_token and refresh_token
3. Decode JWT to verify user claims
4. Test protected endpoint with access token

### Scenario 2: Invalid Credentials
1. Request token with invalid password
2. Verify 401 response with error message
3. Confirm no token is returned

### Scenario 3: Inactive User
1. Request token for inactive@acme.com
2. Verify 401 response
3. Confirm account status validation

### Scenario 4: Token Refresh
1. Obtain initial tokens with password grant
2. Use refresh_token to get new access_token
3. Verify new tokens are different
4. Test that old refresh token is still valid (or revoked based on policy)

### Scenario 5: Expired Token
1. Create an expired access token (mock the expiration)
2. Attempt to use it for API call
3. Verify 401 response
4. Use refresh token to get new access token

### Scenario 6: Invalid Client Credentials
1. Request token with invalid client_id or client_secret
2. Verify 401 response with invalid_client error

### Scenario 7: Write Operations (Org Restriction)
1. Login as admin@acme.com (org 100048)
2. Attempt to create campaign in org 100048 - should succeed
3. Attempt to create campaign in org 100049 - should fail (forbidden)

## Postman Collection

Import this collection to test all OAuth flows:

```json
{
  "info": {
    "name": "MediaMath MCP OAuth",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Password Grant - Admin",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"grant_type\": \"password\",\n  \"username\": \"admin@acme.com\",\n  \"password\": \"password123\",\n  \"client_id\": \"mediamath_mcp_client\",\n  \"client_secret\": \"mock_client_secret\",\n  \"audience\": \"https://api.mediamath.com\",\n  \"scope\": \"openid profile email\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}/api/oauth/token",
          "host": ["{{baseUrl}}"],
          "path": ["api", "oauth", "token"]
        }
      }
    },
    {
      "name": "Refresh Token",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"grant_type\": \"refresh_token\",\n  \"refresh_token\": \"{{refresh_token}}\",\n  \"client_id\": \"mediamath_mcp_client\",\n  \"client_secret\": \"mock_client_secret\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}/api/oauth/token",
          "host": ["{{baseUrl}}"],
          "path": ["api", "oauth", "token"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "access_token",
      "value": ""
    },
    {
      "key": "refresh_token",
      "value": ""
    }
  ]
}
```

## Environment Variables

Create a `.env.local` file with:

```env
# JWT Secret (use a strong secret in production)
JWT_SECRET=your-secret-key-here-change-in-production

# Feature Flags
ENABLE_WRITE_OPERATIONS=true
ORG_RESTRICTION_ID=100048

# OAuth Config
AUTH0_DOMAIN=mediamath.auth0.com
AUTH0_CLIENT_ID=mock_client_id
AUTH0_CLIENT_SECRET=mock_client_secret
```

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Test OAuth endpoint:**
```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "username": "admin@acme.com",
    "password": "password123",
    "client_id": "mediamath_mcp_client",
    "client_secret": "mock_client_secret",
    "audience": "https://api.mediamath.com"
  }'
```

4. **Extract and use access token:**
```bash
# Save token to variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use in subsequent requests
curl -X GET http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### Issue: "Invalid client credentials"
- Verify client_id and client_secret match the mock values
- Check for typos in the request body

### Issue: "Invalid username or password"
- Verify email and password are correct
- Check that user status is "active"
- Ensure email is lowercase

### Issue: "Invalid or expired refresh token"
- Refresh tokens expire after 30 days
- Obtain a new refresh token via password grant

### Issue: "Missing required parameter"
- Ensure all required fields are present in request body
- Check Content-Type header is "application/json"

## Next Steps

After successfully authenticating:
1. Use the access token for MCP tool calls
2. Test different user roles and permissions
3. Implement token refresh before expiration
4. Test write operations with organization restrictions
