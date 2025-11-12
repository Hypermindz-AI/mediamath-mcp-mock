/**
 * MCP Session Management
 * Handles session lifecycle, storage, and cleanup
 */

import { randomUUID } from "crypto";
import { MCPSession, ClientCapabilities } from "./types";

// ============================================================================
// Configuration
// ============================================================================

const SESSION_TTL_HOURS = 24;
const SESSION_TTL_MS = SESSION_TTL_HOURS * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Run cleanup every hour

// ============================================================================
// In-Memory Session Store
// ============================================================================

class SessionStore {
  private sessions: Map<string, MCPSession> = new Map();
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    this.startCleanup();
  }

  /**
   * Start automatic cleanup of expired sessions
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, CLEANUP_INTERVAL_MS);

    // Ensure cleanup runs on process exit
    if (typeof process !== "undefined") {
      process.on("beforeExit", () => {
        if (this.cleanupInterval) {
          clearInterval(this.cleanupInterval);
        }
      });
    }
  }

  /**
   * Create a new session
   */
  create(
    userId: number,
    organizationId: number,
    accessToken: string,
    capabilities: ClientCapabilities
  ): MCPSession {
    const sessionId = generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

    const session: MCPSession = {
      sessionId,
      userId,
      organizationId,
      accessToken,
      capabilities,
      createdAt: now,
      lastActivityAt: now,
      expiresAt,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Get a session by ID
   */
  get(sessionId: string): MCPSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    // Check if expired
    if (this.isExpired(session)) {
      this.delete(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivityAt = new Date();
    return session;
  }

  /**
   * Update session activity timestamp
   */
  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivityAt = new Date();
    }
  }

  /**
   * Delete a session
   */
  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Get all active sessions
   */
  getAll(): MCPSession[] {
    const activeSessions: MCPSession[] = [];
    for (const session of this.sessions.values()) {
      if (!this.isExpired(session)) {
        activeSessions.push(session);
      }
    }
    return activeSessions;
  }

  /**
   * Get sessions by user ID
   */
  getByUserId(userId: number): MCPSession[] {
    const userSessions: MCPSession[] = [];
    for (const session of this.sessions.values()) {
      if (session.userId === userId && !this.isExpired(session)) {
        userSessions.push(session);
      }
    }
    return userSessions;
  }

  /**
   * Get sessions by organization ID
   */
  getByOrganizationId(organizationId: number): MCPSession[] {
    const orgSessions: MCPSession[] = [];
    for (const session of this.sessions.values()) {
      if (
        session.organizationId === organizationId &&
        !this.isExpired(session)
      ) {
        orgSessions.push(session);
      }
    }
    return orgSessions;
  }

  /**
   * Check if a session is expired
   */
  private isExpired(session: MCPSession): boolean {
    return new Date() > session.expiresAt;
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    let cleanedCount = 0;
    const now = new Date();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(
        `[SessionStore] Cleaned up ${cleanedCount} expired sessions`
      );
    }

    return cleanedCount;
  }

  /**
   * Get session count
   */
  count(): number {
    return this.sessions.size;
  }

  /**
   * Clear all sessions (for testing)
   */
  clear(): void {
    this.sessions.clear();
  }

  /**
   * Get session statistics
   */
  getStats(): {
    total: number;
    active: number;
    expired: number;
    byOrganization: Record<number, number>;
  } {
    const now = new Date();
    let active = 0;
    let expired = 0;
    const byOrganization: Record<number, number> = {};

    for (const session of this.sessions.values()) {
      if (now > session.expiresAt) {
        expired++;
      } else {
        active++;
        byOrganization[session.organizationId] =
          (byOrganization[session.organizationId] || 0) + 1;
      }
    }

    return {
      total: this.sessions.size,
      active,
      expired,
      byOrganization,
    };
  }
}

// ============================================================================
// Global Session Store Instance
// ============================================================================

const sessionStore = new SessionStore();

// ============================================================================
// Public API
// ============================================================================

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `mcp_${randomUUID()}`;
}

/**
 * Create a new session
 */
export async function createSession(
  userId: number,
  organizationId: number,
  accessToken: string,
  capabilities: ClientCapabilities
): Promise<MCPSession> {
  return sessionStore.create(userId, organizationId, accessToken, capabilities);
}

/**
 * Get a session by ID
 */
export async function getSession(sessionId: string): Promise<MCPSession | null> {
  return sessionStore.get(sessionId);
}

/**
 * Update session activity timestamp
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  sessionStore.updateActivity(sessionId);
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  return sessionStore.delete(sessionId);
}

/**
 * Get all active sessions
 */
export async function getAllSessions(): Promise<MCPSession[]> {
  return sessionStore.getAll();
}

/**
 * Get sessions by user ID
 */
export async function getSessionsByUserId(
  userId: number
): Promise<MCPSession[]> {
  return sessionStore.getByUserId(userId);
}

/**
 * Get sessions by organization ID
 */
export async function getSessionsByOrganizationId(
  organizationId: number
): Promise<MCPSession[]> {
  return sessionStore.getByOrganizationId(organizationId);
}

/**
 * Clean up expired sessions
 * Returns the number of sessions cleaned up
 */
export async function cleanupExpiredSessions(): Promise<number> {
  return sessionStore.cleanupExpiredSessions();
}

/**
 * Get session count
 */
export async function getSessionCount(): Promise<number> {
  return sessionStore.count();
}

/**
 * Clear all sessions (for testing)
 */
export async function clearAllSessions(): Promise<void> {
  sessionStore.clear();
}

/**
 * Get session statistics
 */
export async function getSessionStats(): Promise<{
  total: number;
  active: number;
  expired: number;
  byOrganization: Record<number, number>;
}> {
  return sessionStore.getStats();
}

/**
 * Validate session and return context
 */
export async function validateSession(sessionId: string): Promise<{
  valid: boolean;
  session?: MCPSession;
  error?: string;
}> {
  if (!sessionId) {
    return { valid: false, error: "Session ID is required" };
  }

  const session = await getSession(sessionId);
  if (!session) {
    return { valid: false, error: "Session not found or expired" };
  }

  return { valid: true, session };
}

/**
 * Extend session expiration
 */
export async function extendSession(
  sessionId: string,
  additionalHours: number = SESSION_TTL_HOURS
): Promise<boolean> {
  const session = await getSession(sessionId);
  if (!session) {
    return false;
  }

  const additionalMs = additionalHours * 60 * 60 * 1000;
  session.expiresAt = new Date(session.expiresAt.getTime() + additionalMs);
  return true;
}

// ============================================================================
// Session Context Helpers
// ============================================================================

/**
 * Get session context for tool execution
 */
export async function getSessionContext(sessionId: string): Promise<{
  sessionId: string;
  userId: number;
  organizationId: number;
} | null> {
  const session = await getSession(sessionId);
  if (!session) {
    return null;
  }

  return {
    sessionId: session.sessionId,
    userId: session.userId,
    organizationId: session.organizationId,
  };
}

/**
 * Check if user has access to organization
 */
export async function hasOrganizationAccess(
  sessionId: string,
  targetOrganizationId: number
): Promise<boolean> {
  const session = await getSession(sessionId);
  if (!session) {
    return false;
  }

  // In the mock implementation, we only allow access to the user's own organization
  // In production, this would check against user permissions/roles
  return session.organizationId === targetOrganizationId;
}

/**
 * Get user info from session
 */
export async function getUserFromSession(sessionId: string): Promise<{
  userId: number;
  organizationId: number;
  accessToken: string;
} | null> {
  const session = await getSession(sessionId);
  if (!session) {
    return null;
  }

  return {
    userId: session.userId,
    organizationId: session.organizationId,
    accessToken: session.accessToken,
  };
}

// ============================================================================
// Export Store Instance (for testing/admin)
// ============================================================================

export { sessionStore };

// ============================================================================
// Type Exports
// ============================================================================

export type { MCPSession } from "./types";
