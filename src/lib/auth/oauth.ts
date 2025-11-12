/**
 * OAuth 2.0 Mock Implementation
 * Provides Resource Owner Password Grant and Refresh Token flows
 */

export interface MockUser {
  userId: number;
  email: string;
  password: string;
  organizationId: number;
  role: 'ADMIN' | 'MANAGER' | 'TRADER' | 'ANALYST' | 'VIEWER';
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

/**
 * Mock user database - 10 users across 3 organizations
 */
export const mockUsers: MockUser[] = [
  // Organization 100048 (ACME Corporation)
  {
    userId: 1,
    email: 'admin@acme.com',
    password: 'password123',
    organizationId: 100048,
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    userId: 2,
    email: 'trader@acme.com',
    password: 'password123',
    organizationId: 100048,
    role: 'TRADER',
    firstName: 'Trader',
    lastName: 'User',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    userId: 3,
    email: 'manager@acme.com',
    password: 'password123',
    organizationId: 100048,
    role: 'MANAGER',
    firstName: 'Manager',
    lastName: 'User',
    status: 'active',
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    userId: 4,
    email: 'analyst@acme.com',
    password: 'password123',
    organizationId: 100048,
    role: 'ANALYST',
    firstName: 'Analyst',
    lastName: 'User',
    status: 'active',
    createdAt: '2024-01-04T00:00:00Z',
  },
  {
    userId: 5,
    email: 'viewer@acme.com',
    password: 'password123',
    organizationId: 100048,
    role: 'VIEWER',
    firstName: 'Viewer',
    lastName: 'User',
    status: 'active',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    userId: 10,
    email: 'inactive@acme.com',
    password: 'password123',
    organizationId: 100048,
    role: 'VIEWER',
    firstName: 'Inactive',
    lastName: 'User',
    status: 'inactive',
    createdAt: '2024-01-10T00:00:00Z',
  },

  // Organization 100049 (BrandCo)
  {
    userId: 6,
    email: 'admin@brandco.com',
    password: 'password123',
    organizationId: 100049,
    role: 'ADMIN',
    firstName: 'Brand',
    lastName: 'Admin',
    status: 'active',
    createdAt: '2024-01-06T00:00:00Z',
  },
  {
    userId: 7,
    email: 'trader@brandco.com',
    password: 'password123',
    organizationId: 100049,
    role: 'TRADER',
    firstName: 'Brand',
    lastName: 'Trader',
    status: 'active',
    createdAt: '2024-01-07T00:00:00Z',
  },

  // Organization 100050 (MediaLab)
  {
    userId: 8,
    email: 'admin@medialab.com',
    password: 'password123',
    organizationId: 100050,
    role: 'ADMIN',
    firstName: 'Media',
    lastName: 'Admin',
    status: 'active',
    createdAt: '2024-01-08T00:00:00Z',
  },
  {
    userId: 9,
    email: 'trader@medialab.com',
    password: 'password123',
    organizationId: 100050,
    role: 'TRADER',
    firstName: 'Media',
    lastName: 'Trader',
    status: 'active',
    createdAt: '2024-01-09T00:00:00Z',
  },
];

/**
 * Mock client credentials
 */
const VALID_CLIENTS = [
  { clientId: 'mediamath_mcp_client', clientSecret: 'mock_client_secret' },
  { clientId: 'test_client', clientSecret: 'test_secret' },
];

/**
 * In-memory refresh token store
 * Format: Map<refreshToken, { userId, expiresAt }>
 */
const refreshTokenStore = new Map<string, { userId: number; expiresAt: Date }>();

/**
 * Validate user credentials
 */
export function validateCredentials(email: string, password: string): MockUser | null {
  const user = mockUsers.find((u) => u.email === email && u.password === password);

  if (!user) {
    return null;
  }

  if (user.status !== 'active') {
    return null;
  }

  return user;
}

/**
 * Find user by ID
 */
export function findUserById(userId: number): MockUser | null {
  return mockUsers.find((u) => u.userId === userId) || null;
}

/**
 * Find user by email
 */
export function findUserByEmail(email: string): MockUser | null {
  return mockUsers.find((u) => u.email === email) || null;
}

/**
 * Validate client credentials
 */
export function validateClientCredentials(clientId: string, clientSecret: string): boolean {
  return VALID_CLIENTS.some(
    (client) => client.clientId === clientId && client.clientSecret === clientSecret
  );
}

/**
 * Validate audience (optional check for OAuth spec compliance)
 */
export function validateAudience(audience?: string): boolean {
  // Accept any audience for mock server, but typically would be:
  // 'https://api.mediamath.com'
  return true;
}

/**
 * Validate scope (optional check for OAuth spec compliance)
 */
export function validateScope(scope?: string): boolean {
  // Accept any scope for mock server
  return true;
}

/**
 * Store a refresh token
 */
export function storeRefreshToken(refreshToken: string, userId: number, expiresInDays: number = 30): void {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  refreshTokenStore.set(refreshToken, { userId, expiresAt });
}

/**
 * Validate and retrieve userId from refresh token
 */
export function validateRefreshToken(refreshToken: string): number | null {
  const tokenData = refreshTokenStore.get(refreshToken);

  if (!tokenData) {
    return null;
  }

  // Check expiration
  if (tokenData.expiresAt < new Date()) {
    refreshTokenStore.delete(refreshToken);
    return null;
  }

  return tokenData.userId;
}

/**
 * Revoke a refresh token
 */
export function revokeRefreshToken(refreshToken: string): void {
  refreshTokenStore.delete(refreshToken);
}

/**
 * Cleanup expired refresh tokens
 */
export function cleanupExpiredTokens(): number {
  const now = new Date();
  let cleaned = 0;

  for (const [token, data] of refreshTokenStore.entries()) {
    if (data.expiresAt < now) {
      refreshTokenStore.delete(token);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get user permissions based on role
 */
export function getUserPermissions(role: string): {
  canReadAll: boolean;
  canWriteCampaigns: boolean;
  canWriteStrategies: boolean;
  canManageUsers: boolean;
  canManageOrganizations: boolean;
} {
  switch (role) {
    case 'ADMIN':
      return {
        canReadAll: true,
        canWriteCampaigns: true,
        canWriteStrategies: true,
        canManageUsers: true,
        canManageOrganizations: true,
      };
    case 'MANAGER':
    case 'TRADER':
      return {
        canReadAll: true,
        canWriteCampaigns: true,
        canWriteStrategies: true,
        canManageUsers: false,
        canManageOrganizations: false,
      };
    case 'ANALYST':
      return {
        canReadAll: true,
        canWriteCampaigns: false,
        canWriteStrategies: false,
        canManageUsers: false,
        canManageOrganizations: false,
      };
    case 'VIEWER':
      return {
        canReadAll: false, // Limited read access
        canWriteCampaigns: false,
        canWriteStrategies: false,
        canManageUsers: false,
        canManageOrganizations: false,
      };
    default:
      return {
        canReadAll: false,
        canWriteCampaigns: false,
        canWriteStrategies: false,
        canManageUsers: false,
        canManageOrganizations: false,
      };
  }
}
