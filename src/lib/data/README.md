# Mock Data Layer

Comprehensive mock data infrastructure for the MediaMath MCP Mock Server.

## Overview

This data layer provides 600+ realistic mock records across 10 entity types with proper relationship validation and CRUD operations.

## Components

### 1. Generator (`generator.ts`)

Utilities for generating realistic mock data using @faker-js/faker.

**Features:**
- Seeded random generation for reproducibility
- 10+ entity generators (users, organizations, campaigns, etc.)
- Proper relationship management
- Realistic data patterns

**Usage:**
```typescript
import { generateAllData, setSeed } from './generator';

// Generate with custom seed
setSeed(42);
const data = generateAllData(42);

// Access generated entities
console.log(data.campaigns.length); // 100
console.log(data.users.length); // 50
```

**Available Generators:**
- `generateUsers(count, organizationIds)` - User accounts with roles
- `generateOrganizations(count)` - Top-level organizations
- `generateAgencies(count, organizationIds)` - Agency entities
- `generateAdvertisers(count, agencyIds, organizationIds)` - Advertiser accounts
- `generateCampaigns(count, advertiserIds, agencyIds, organizationIds)` - Marketing campaigns
- `generateStrategies(count, campaignIds, advertiserIds)` - Strategy configurations
- `generateSupplySources(count)` - Supply source inventory
- `generateSiteLists(count, organizationIds)` - Site inclusion/exclusion lists
- `generateConcepts(count, advertiserIds)` - Creative concepts
- `generateAudienceSegments(count)` - Audience targeting segments

### 2. Store (`store.ts`)

Stateful in-memory data store with full CRUD operations.

**Features:**
- Map-based storage for O(1) lookups
- Advanced filtering with operators (`$gte`, `$lte`, `$contains`, etc.)
- Sorting support (ascending/descending)
- Cursor-based pagination
- Relationship validation
- Import/export functionality
- Reset to defaults

**Usage:**
```typescript
import { getDataStore } from './store';

const store = getDataStore();

// Find campaigns with filters
const result = store.campaigns.find(
  { status: true, advertiser_id: 20001 },
  { field: 'created_at', order: 'desc' },
  { offset: 0, limit: 25 }
);

// Get by ID
const campaign = store.campaigns.findById(30001);

// Create new campaign
const newCampaign = store.campaigns.create({
  id: 30999,
  name: 'Holiday Campaign 2025',
  advertiser_id: 20001,
  // ... other fields
});

// Update existing
store.campaigns.update(30001, {
  status: false,
  total_budget: 75000
});

// Delete
store.campaigns.delete(30001);

// Get statistics
console.log(store.getStats());
// {
//   users: 50,
//   organizations: 10,
//   campaigns: 100,
//   ... total: 600
// }
```

**Advanced Filtering:**
```typescript
// Range queries
store.campaigns.find({
  total_budget: { $gte: 10000, $lte: 50000 }
});

// String contains (case-insensitive)
store.campaigns.find({
  name: { $contains: 'holiday' }
});

// Not equal
store.campaigns.find({
  status: { $ne: false }
});

// Array of values (IN query)
store.campaigns.find({
  advertiser_id: [20001, 20002, 20003]
});
```

**Relationship Validation:**
```typescript
// Validate all relationships
const validation = store.validateRelationships();
if (!validation.valid) {
  console.error('Relationship errors:', validation.errors);
}

// Check ACME organization access
const isAcme = store.isAcmeEntity('campaign', 30001);
```

### 3. Fixtures (`fixtures/index.ts`)

Pre-generated fixture data with consistent seed (42) for reproducibility.

**Usage:**
```typescript
import fixtures from './fixtures';
// or
import { campaigns, users, organizations } from './fixtures';

// All fixtures are pre-generated and ready to use
console.log(campaigns.length); // 100
console.log(users.length); // 50
```

## Data Structure

### Entity Counts
- **Users**: 50 records
- **Organizations**: 10 records (including ACME #100048)
- **Agencies**: 25 records
- **Advertisers**: 50 records
- **Campaigns**: 100 records
- **Strategies**: 100 records
- **Supply Sources**: 75 records
- **Site Lists**: 50 records
- **Concepts**: 80 records
- **Audience Segments**: 60 records
- **TOTAL**: 600 records

### Relationship Hierarchy

```
Organization (10)
 ├─→ User (50)
 ├─→ Agency (25)
 │    └─→ Advertiser (50)
 │         ├─→ Campaign (100)
 │         │    └─→ Strategy (100)
 │         └─→ Concept (80)
 └─→ Site List (50)

Supply Source (75) [independent]
Audience Segment (60) [independent]
```

### Special Entities

**ACME Corporation (ID: 100048)**
- Pre-configured organization for testing write operations
- Only campaigns/strategies under ACME can be created/updated
- Used for testing access control and permissions

## Entity Schemas

### User
```typescript
{
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  organization_id: number;
  role: 'ADMIN' | 'TRADER' | 'ANALYST' | 'VIEWER';
  status: boolean;
  created_at: string;
  updated_at: string;
}
```

### Campaign
```typescript
{
  id: number;
  name: string;
  advertiser_id: number;
  organization_id: number;
  agency_id: number;
  status: boolean;
  start_date: string;
  end_date?: string;
  total_budget: number;
  spend_cap_amount?: number;
  goal_type: 'spend' | 'reach' | 'cpa' | 'cpc' | 'ctr' | 'viewability';
  goal_value?: number;
  timezone: string;
  created_at: string;
  updated_at: string;
  t1_mediamath_links?: {
    edit_campaign_url: string;
  };
}
```

### Strategy
```typescript
{
  id: number;
  name: string;
  campaign_id: number;
  advertiser_id: number;
  status: boolean;
  type: 'display' | 'video' | 'native' | 'audio' | 'ctv';
  budget: number;
  pacing_type: 'even' | 'asap';
  bid_strategy: 'manual' | 'autobid' | 'optimized';
  max_bid: number;
  start_date: string;
  end_date?: string;
  targeting_segment_include_op: 'AND' | 'OR';
  frequency_type: 'asap' | 'even' | 'no-limit';
  frequency_amount?: number;
  frequency_interval?: 'hour' | 'day' | 'week' | 'month' | 'not-applicable';
  created_at: string;
  updated_at: string;
  t1_mediamath_links?: {
    edit_strategy_url: string;
  };
}
```

## Scripts

### Verify Fixtures
```bash
npm run fixtures:verify
```

Displays statistics about generated fixtures and validates configuration.

## Best Practices

1. **Use the Global Store**: Always use `getDataStore()` for the singleton instance
2. **Validate Relationships**: Run `validateRelationships()` after bulk operations
3. **Test with ACME**: Use organization 100048 for testing write operations
4. **Consistent Seeds**: Use the same seed (42) for reproducible test data
5. **Reset Between Tests**: Call `store.reset()` to restore defaults

## Testing

```typescript
import { getDataStore, resetDataStore } from './store';

describe('Campaign Tests', () => {
  beforeEach(() => {
    resetDataStore(); // Reset to default fixtures
  });

  it('should find active campaigns', () => {
    const store = getDataStore();
    const result = store.campaigns.find({ status: true });
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('should create campaign under ACME', () => {
    const store = getDataStore();
    const campaign = store.campaigns.create({
      id: 99999,
      name: 'Test Campaign',
      organization_id: 100048, // ACME
      // ... other required fields
    });
    expect(campaign.id).toBe(99999);
  });
});
```

## ID Ranges

To avoid conflicts, entities use distinct ID ranges:

- Users: 1000-1099
- Organizations: 100000-100099 (ACME: 100048)
- Agencies: 10000-10099
- Advertisers: 20000-20099
- Campaigns: 30000-30199
- Strategies: 40000-40199
- Supply Sources: 50000-50099
- Site Lists: 60000-60099
- Concepts: 70000-70099
- Audience Segments: 80000-80099

## Performance

- **Lookup by ID**: O(1) using Map
- **Find with filters**: O(n) - linear scan with early termination
- **Memory usage**: ~2-3MB for 600 records
- **Reset operation**: O(n) - rebuilds all Maps

## Future Enhancements

- [ ] Persistent storage adapter (Redis/PostgreSQL)
- [ ] Transaction support
- [ ] Change tracking/audit log
- [ ] Webhook simulation on changes
- [ ] Advanced query builder
- [ ] GraphQL resolvers
- [ ] Snapshot/restore functionality
