/**
 * Server-Sent Events (SSE) Manager
 * Handles real-time notifications to MCP clients
 */

import { NotificationMethod } from "./types";
import { createNotification } from "./protocol";

// ============================================================================
// Types
// ============================================================================

interface SSEConnection {
  sessionId: string;
  controller: ReadableStreamDefaultController;
  createdAt: Date;
  lastPingAt: Date;
  eventCount: number;
}

interface SSEMessage {
  event?: string;
  data: string;
  id?: string;
  retry?: number;
}

// ============================================================================
// Configuration
// ============================================================================

const PING_INTERVAL_MS = 30000; // Send ping every 30 seconds
const CONNECTION_TIMEOUT_MS = 120000; // Close connection after 2 minutes of inactivity
const MAX_RECONNECT_DELAY_MS = 10000; // Max retry delay for client reconnection

// ============================================================================
// SSE Connection Store
// ============================================================================

class SSEConnectionManager {
  private connections: Map<string, SSEConnection> = new Map();
  private pingIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create a new SSE connection
   */
  createConnection(sessionId: string): ReadableStream {
    // Clean up existing connection if any
    this.closeConnection(sessionId);

    const stream = new ReadableStream({
      start: (controller) => {
        const connection: SSEConnection = {
          sessionId,
          controller,
          createdAt: new Date(),
          lastPingAt: new Date(),
          eventCount: 0,
        };

        this.connections.set(sessionId, connection);

        // Send initial connection message
        this.sendMessage(sessionId, {
          event: "connected",
          data: JSON.stringify({
            sessionId,
            timestamp: new Date().toISOString(),
          }),
          retry: MAX_RECONNECT_DELAY_MS,
        });

        // Start ping interval
        this.startPing(sessionId);

        console.log(`[SSE] Connection opened for session: ${sessionId}`);
      },
      cancel: () => {
        this.closeConnection(sessionId);
        console.log(`[SSE] Connection cancelled for session: ${sessionId}`);
      },
    });

    return stream;
  }

  /**
   * Send a message to a specific session
   */
  private sendMessage(sessionId: string, message: SSEMessage): boolean {
    const connection = this.connections.get(sessionId);
    if (!connection) {
      return false;
    }

    try {
      const formatted = this.formatSSEMessage(message);
      connection.controller.enqueue(new TextEncoder().encode(formatted));
      connection.eventCount++;
      return true;
    } catch (error) {
      console.error(`[SSE] Error sending message to ${sessionId}:`, error);
      this.closeConnection(sessionId);
      return false;
    }
  }

  /**
   * Format SSE message according to spec
   */
  private formatSSEMessage(message: SSEMessage): string {
    let formatted = "";

    if (message.event) {
      formatted += `event: ${message.event}\n`;
    }

    if (message.id) {
      formatted += `id: ${message.id}\n`;
    }

    if (message.retry) {
      formatted += `retry: ${message.retry}\n`;
    }

    // Split data into lines for proper SSE format
    const dataLines = message.data.split("\n");
    for (const line of dataLines) {
      formatted += `data: ${line}\n`;
    }

    formatted += "\n"; // Empty line to signal end of message

    return formatted;
  }

  /**
   * Start periodic ping for a connection
   */
  private startPing(sessionId: string): void {
    const interval = setInterval(() => {
      const connection = this.connections.get(sessionId);
      if (!connection) {
        clearInterval(interval);
        return;
      }

      // Check for timeout
      const timeSinceLastPing = Date.now() - connection.lastPingAt.getTime();
      if (timeSinceLastPing > CONNECTION_TIMEOUT_MS) {
        console.log(`[SSE] Connection timeout for session: ${sessionId}`);
        this.closeConnection(sessionId);
        return;
      }

      // Send ping
      const sent = this.sendMessage(sessionId, {
        event: "ping",
        data: JSON.stringify({
          timestamp: new Date().toISOString(),
        }),
      });

      if (sent) {
        connection.lastPingAt = new Date();
      }
    }, PING_INTERVAL_MS);

    this.pingIntervals.set(sessionId, interval);
  }

  /**
   * Close a connection
   */
  closeConnection(sessionId: string): void {
    const connection = this.connections.get(sessionId);
    if (connection) {
      try {
        connection.controller.close();
      } catch (error) {
        // Controller may already be closed
      }
      this.connections.delete(sessionId);
    }

    // Clear ping interval
    const interval = this.pingIntervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.pingIntervals.delete(sessionId);
    }
  }

  /**
   * Send notification to a session
   */
  sendNotification(
    sessionId: string,
    method: NotificationMethod,
    params?: Record<string, any>
  ): boolean {
    const notification = createNotification(method, params);

    return this.sendMessage(sessionId, {
      event: "notification",
      data: notification,
    });
  }

  /**
   * Broadcast notification to all connections
   */
  broadcastNotification(
    method: NotificationMethod,
    params?: Record<string, any>
  ): number {
    let sentCount = 0;
    for (const sessionId of this.connections.keys()) {
      if (this.sendNotification(sessionId, method, params)) {
        sentCount++;
      }
    }
    return sentCount;
  }

  /**
   * Get connection info
   */
  getConnection(sessionId: string): SSEConnection | undefined {
    return this.connections.get(sessionId);
  }

  /**
   * Get all active connections
   */
  getActiveConnections(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalConnections: number;
    connections: Array<{
      sessionId: string;
      createdAt: Date;
      eventCount: number;
      uptimeMs: number;
    }>;
  } {
    const now = new Date();
    const connections = Array.from(this.connections.values()).map((conn) => ({
      sessionId: conn.sessionId,
      createdAt: conn.createdAt,
      eventCount: conn.eventCount,
      uptimeMs: now.getTime() - conn.createdAt.getTime(),
    }));

    return {
      totalConnections: this.connections.size,
      connections,
    };
  }

  /**
   * Close all connections (for shutdown)
   */
  closeAll(): void {
    for (const sessionId of this.connections.keys()) {
      this.closeConnection(sessionId);
    }
  }
}

// ============================================================================
// Global SSE Manager Instance
// ============================================================================

const sseManager = new SSEConnectionManager();

// ============================================================================
// Public API
// ============================================================================

/**
 * Create a new SSE connection for a session
 */
export function createSSEConnection(sessionId: string): ReadableStream {
  return sseManager.createConnection(sessionId);
}

/**
 * Send notification to a specific session
 */
export function sendNotification(
  sessionId: string,
  method: NotificationMethod,
  params?: Record<string, any>
): boolean {
  return sseManager.sendNotification(sessionId, method, params);
}

/**
 * Broadcast notification to all connected sessions
 */
export function broadcastNotification(
  method: NotificationMethod,
  params?: Record<string, any>
): number {
  return sseManager.broadcastNotification(method, params);
}

/**
 * Close SSE connection for a session
 */
export function closeSSEConnection(sessionId: string): void {
  sseManager.closeConnection(sessionId);
}

/**
 * Get active SSE connections
 */
export function getActiveSSEConnections(): string[] {
  return sseManager.getActiveConnections();
}

/**
 * Get SSE connection count
 */
export function getSSEConnectionCount(): number {
  return sseManager.getConnectionCount();
}

/**
 * Get SSE statistics
 */
export function getSSEStats(): {
  totalConnections: number;
  connections: Array<{
    sessionId: string;
    createdAt: Date;
    eventCount: number;
    uptimeMs: number;
  }>;
} {
  return sseManager.getStats();
}

/**
 * Check if session has active SSE connection
 */
export function hasSSEConnection(sessionId: string): boolean {
  return sseManager.getConnection(sessionId) !== undefined;
}

/**
 * Close all SSE connections
 */
export function closeAllSSEConnections(): void {
  sseManager.closeAll();
}

// ============================================================================
// Notification Helper Functions
// ============================================================================

/**
 * Send tools/list changed notification
 */
export function notifyToolsListChanged(sessionId?: string): void {
  const method: NotificationMethod = "notifications/tools/list_changed";
  const params = {
    timestamp: new Date().toISOString(),
  };

  if (sessionId) {
    sendNotification(sessionId, method, params);
  } else {
    broadcastNotification(method, params);
  }
}

/**
 * Send prompts/list changed notification
 */
export function notifyPromptsListChanged(sessionId?: string): void {
  const method: NotificationMethod = "notifications/prompts/list_changed";
  const params = {
    timestamp: new Date().toISOString(),
  };

  if (sessionId) {
    sendNotification(sessionId, method, params);
  } else {
    broadcastNotification(method, params);
  }
}

/**
 * Send resources/list changed notification
 */
export function notifyResourcesListChanged(sessionId?: string): void {
  const method: NotificationMethod = "notifications/resources/list_changed";
  const params = {
    timestamp: new Date().toISOString(),
  };

  if (sessionId) {
    sendNotification(sessionId, method, params);
  } else {
    broadcastNotification(method, params);
  }
}

/**
 * Send resources/updated notification
 */
export function notifyResourceUpdated(
  uri: string,
  sessionId?: string
): void {
  const method: NotificationMethod = "notifications/resources/updated";
  const params = {
    uri,
    timestamp: new Date().toISOString(),
  };

  if (sessionId) {
    sendNotification(sessionId, method, params);
  } else {
    broadcastNotification(method, params);
  }
}

/**
 * Send custom message notification
 */
export function notifyMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  sessionId?: string
): void {
  const method: NotificationMethod = "notifications/message";
  const params = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (sessionId) {
    sendNotification(sessionId, method, params);
  } else {
    broadcastNotification(method, params);
  }
}

/**
 * Send progress notification
 */
export function notifyProgress(
  operationId: string,
  progress: number,
  total: number,
  message?: string,
  sessionId?: string
): void {
  const method: NotificationMethod = "notifications/progress";
  const params = {
    operationId,
    progress,
    total,
    percentage: Math.round((progress / total) * 100),
    message,
    timestamp: new Date().toISOString(),
  };

  if (sessionId) {
    sendNotification(sessionId, method, params);
  } else {
    broadcastNotification(method, params);
  }
}

// ============================================================================
// Cleanup on Process Exit
// ============================================================================

if (typeof process !== "undefined") {
  process.on("beforeExit", () => {
    console.log("[SSE] Closing all connections on process exit");
    closeAllSSEConnections();
  });

  process.on("SIGTERM", () => {
    console.log("[SSE] Received SIGTERM, closing all connections");
    closeAllSSEConnections();
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("[SSE] Received SIGINT, closing all connections");
    closeAllSSEConnections();
    process.exit(0);
  });
}

// ============================================================================
// Export Manager Instance (for testing)
// ============================================================================

export { sseManager };
