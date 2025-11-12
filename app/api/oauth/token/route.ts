/**
 * OAuth 2.0 Token Endpoint
 * POST /api/oauth/token
 *
 * Supports:
 * - Resource Owner Password Grant (grant_type=password)
 * - Refresh Token Grant (grant_type=refresh_token)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  validateCredentials,
  validateClientCredentials,
  findUserById,
  validateRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
} from '@/lib/auth/oauth';
import { generateTokenResponse } from '@/lib/auth/tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      grant_type,
      username,
      password,
      refresh_token,
      client_id,
      client_secret,
      audience,
      scope,
    } = body;

    // Validate client credentials
    if (!validateClientCredentials(client_id, client_secret)) {
      return NextResponse.json(
        {
          error: 'invalid_client',
          error_description: 'Invalid client credentials',
        },
        { status: 401 }
      );
    }

    // Handle Password Grant
    if (grant_type === 'password') {
      if (!username || !password) {
        return NextResponse.json(
          {
            error: 'invalid_request',
            error_description: 'Missing username or password',
          },
          { status: 400 }
        );
      }

      const user = validateCredentials(username, password);
      if (!user) {
        return NextResponse.json(
          {
            error: 'invalid_grant',
            error_description: 'Invalid username or password',
          },
          { status: 400 }
        );
      }

      const tokenResponse = generateTokenResponse(user, scope);

      // Store refresh token
      storeRefreshToken(tokenResponse.refresh_token, user.userId);

      return NextResponse.json(tokenResponse);
    }

    // Handle Refresh Token Grant
    if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return NextResponse.json(
          {
            error: 'invalid_request',
            error_description: 'Missing refresh_token',
          },
          { status: 400 }
        );
      }

      const userId = validateRefreshToken(refresh_token);
      if (!userId) {
        return NextResponse.json(
          {
            error: 'invalid_grant',
            error_description: 'Invalid or expired refresh token',
          },
          { status: 400 }
        );
      }

      const user = findUserById(userId);
      if (!user) {
        return NextResponse.json(
          {
            error: 'invalid_grant',
            error_description: 'User not found',
          },
          { status: 400 }
        );
      }

      // Revoke old refresh token
      revokeRefreshToken(refresh_token);

      // Generate new tokens
      const tokenResponse = generateTokenResponse(user, scope);

      // Store new refresh token
      storeRefreshToken(tokenResponse.refresh_token, user.userId);

      return NextResponse.json(tokenResponse);
    }

    // Unsupported grant type
    return NextResponse.json(
      {
        error: 'unsupported_grant_type',
        error_description: `Grant type '${grant_type}' is not supported`,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('OAuth token error:', error);

    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'An internal server error occurred',
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
