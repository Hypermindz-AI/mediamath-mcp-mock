/**
 * Tool Registry
 * Centralized registration and execution of MCP tools
 */

import { z } from 'zod';
import type { ToolDefinition, ToolCallResult } from '../mcp/types';
import {
  buildSuccessResponse,
  buildErrorResponse as buildUtilErrorResponse,
  buildEntityResponse,
  buildListResponse,
  buildCreatedResponse,
  buildUpdatedResponse,
  buildDeletedResponse,
  buildUIDeepLink,
  type MCPToolResponse,
} from '../utils/response';
import { formatErrorForMCP, type CategorizedError } from '../utils/errors';

export type ToolContext = {
  userId?: number;
  organizationId?: number;
  role?: string;
  sessionId?: string;
};

export type ToolResponse = ToolCallResult;

export type { ToolDefinition };

interface RegisteredTool {
  definition: ToolDefinition;
  handler: (args: any, context: ToolContext) => Promise<ToolResponse>;
  schema?: z.ZodSchema;
}

/**
 * Tool Registry Class
 */
class ToolRegistry {
  private tools: Map<string, RegisteredTool> = new Map();

  /**
   * Register a tool
   */
  register(
    name: string,
    definition: ToolDefinition,
    handler: (args: any, context: ToolContext) => Promise<ToolResponse>,
    schema?: z.ZodSchema
  ): void {
    this.tools.set(name, {
      definition,
      handler,
      schema,
    });
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): RegisteredTool | undefined {
    return this.tools.get(name);
  }

  /**
   * List all tools
   */
  listTools(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((tool) => tool.definition);
  }

  /**
   * Get tool count
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Call a tool
   */
  async callTool(name: string, args: any, context: ToolContext): Promise<ToolResponse> {
    const tool = this.tools.get(name);

    if (!tool) {
      return createErrorResponse({
        category: 'not_found' as any,
        message: `Tool '${name}' not found`,
        guidance: `Available tools: ${Array.from(this.tools.keys()).join(', ')}`,
      });
    }

    try {
      // Validate arguments if schema provided
      if (tool.schema) {
        const validated = tool.schema.safeParse(args);
        if (!validated.success) {
          return createErrorResponse({
            category: 'validation_error' as any,
            message: 'Invalid tool arguments',
            guidance: `Validation errors: ${validated.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
            details: { errors: validated.error.errors },
          });
        }
        args = validated.data;
      }

      // Execute tool handler
      return await tool.handler(args, context);
    } catch (error) {
      console.error(`Error executing tool '${name}':`, error);

      return createErrorResponse({
        category: 'operation_failed' as any,
        message: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        guidance: 'An error occurred while executing the tool. Please try again or contact support if the issue persists.',
      });
    }
  }

  /**
   * Check if a tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Clear all tools (for testing)
   */
  clear(): void {
    this.tools.clear();
  }
}

// Global registry instance
export const toolRegistry = new ToolRegistry();

/**
 * Response builder helpers (re-export from utils with tool-specific types)
 */
export function createSuccessResponse(
  data: any,
  guidance: string,
  meta?: any
): ToolResponse {
  const response = buildSuccessResponse(data, guidance, meta);
  return {
    content: response.content,
    isError: false,
  };
}

export function createErrorResponse(error: CategorizedError): ToolResponse {
  const response = formatErrorForMCP(error);
  return {
    content: response.content,
    isError: true,
  };
}

// Re-export other utility functions
export { buildEntityResponse, buildListResponse, buildCreatedResponse, buildUpdatedResponse, buildDeletedResponse, buildUIDeepLink };
