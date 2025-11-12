/**
 * Server-Sent Events (SSE) Endpoint
 * GET /api/sse?sessionId={sessionId}
 *
 * Provides real-time notifications for MCP sessions
 */

import { NextRequest } from 'next/server';
import { createSSEConnection } from '@/lib/mcp/sse';
import { getSession } from '@/lib/mcp/session';
import { validateRequest } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = validateRequest(request);
    if (!authResult.success || !authResult.context) {
      return new Response(
        JSON.stringify({
          error: 'unauthorized',
          error_description: authResult.error || 'Authentication failed',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Extract session ID from query parameter
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      return new Response(
        JSON.stringify({
          error: 'invalid_request',
          error_description: 'Missing sessionId query parameter',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Validate session
    const session = await getSession(sessionId);
    if (!session) {
      return new Response(
        JSON.stringify({
          error: 'not_found',
          error_description: 'Session not found or expired',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verify session belongs to authenticated user
    if (session.userId !== authResult.context.userId) {
      return new Response(
        JSON.stringify({
          error: 'forbidden',
          error_description: 'Session does not belong to authenticated user',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Create SSE connection
    const stream = createSSEConnection(sessionId);

    // Return SSE stream
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('SSE endpoint error:', error);

    return new Response(
      JSON.stringify({
        error: 'server_error',
        error_description: 'An internal error occurred',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
