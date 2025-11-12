/**
 * Main MCP Endpoint
 * POST /api/mcp - JSON-RPC 2.0 requests
 * DELETE /api/mcp - Terminate session
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleMCPRequest } from '@/lib/mcp/protocol';
import { getSession, deleteSession } from '@/lib/mcp/session';
import { validateRequest, extractSessionId } from '@/lib/auth/middleware';

// Initialize tools on module load
import { toolRegistry } from '@/lib/tools/registry';
import { registerSystemTools } from '@/lib/tools/system';
import { registerUserTools } from '@/lib/tools/user';

let toolsInitialized = false;
function ensureToolsInitialized() {
  if (!toolsInitialized) {
    registerSystemTools();
    registerUserTools();
    // registerCampaignTools(); // TODO: implement
    // registerStrategyTools(); // TODO: implement
    // registerOrganizationTools(); // TODO: implement
    toolsInitialized = true;
    console.log(`[MCP] Initialized ${toolRegistry.getToolCount()} tools`);
  }
}

/**
 * POST /api/mcp
 * Handle JSON-RPC 2.0 MCP requests
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure tools are initialized
    ensureToolsInitialized();

    // Validate authentication
    const authResult = validateRequest(request);
    if (!authResult.success || !authResult.context) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32001, // Custom auth error code
            message: authResult.error || 'Authentication failed',
          },
        },
        { status: 401 }
      );
    }

    // Parse JSON-RPC request
    let requestBody: any;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: 'Parse error',
          },
        },
        { status: 400 }
      );
    }

    // Build context for protocol handler
    const context: any = {
      userId: authResult.context.userId,
      organizationId: authResult.context.organizationId,
      role: authResult.context.role,
    };

    // For non-initialize requests, validate session
    const method = requestBody.method;
    if (method !== 'initialize') {
      const sessionId = extractSessionId(request);

      if (!sessionId) {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id: requestBody.id || null,
            error: {
              code: -32002, // Custom session error
              message: 'Missing MCP-Session-Id header',
            },
          },
          { status: 400 }
        );
      }

      // Validate session
      const session = getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id: requestBody.id || null,
            error: {
              code: -32003,
              message: 'Invalid or expired session',
            },
          },
          { status: 400 }
        );
      }

      // Verify session belongs to authenticated user
      if (session.userId !== authResult.context.userId) {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id: requestBody.id || null,
            error: {
              code: -32004,
              message: 'Session does not belong to authenticated user',
            },
          },
          { status: 403 }
        );
      }

      context.sessionId = sessionId;
    }

    // Process MCP request
    const response = await handleMCPRequest(requestBody, context);

    // For initialize, include session ID in header
    if (method === 'initialize' && response.result?.sessionId) {
      return NextResponse.json(response, {
        headers: {
          'MCP-Session-Id': response.result.sessionId,
        },
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('MCP endpoint error:', error);

    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Internal error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/mcp
 * Terminate MCP session
 */
export async function DELETE(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = validateRequest(request);
    if (!authResult.success || !authResult.context) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          error_description: authResult.error || 'Authentication failed',
        },
        { status: 401 }
      );
    }

    // Extract session ID
    const sessionId = extractSessionId(request);
    if (!sessionId) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'Missing MCP-Session-Id header',
        },
        { status: 400 }
      );
    }

    // Validate session ownership
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        {
          error: 'not_found',
          error_description: 'Session not found',
        },
        { status: 404 }
      );
    }

    if (session.userId !== authResult.context.userId) {
      return NextResponse.json(
        {
          error: 'forbidden',
          error_description: 'Session does not belong to authenticated user',
        },
        { status: 403 }
      );
    }

    // Delete session
    deleteSession(sessionId);

    return NextResponse.json({
      success: true,
      message: 'Session terminated',
    });
  } catch (error) {
    console.error('Session deletion error:', error);

    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'An internal error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Session-Id',
    },
  });
}
