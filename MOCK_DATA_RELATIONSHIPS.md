# Mock Data Relationships

This document shows all the linked mock data in the MediaMath MCP Mock Server.

## Data Hierarchy

```
Organizations (2)
├── ACME Corporation (100048)
│   ├── Agencies (2)
│   │   ├── Media Solutions Agency (2001)
│   │   │   ├── Advertisers (2)
│   │   │   │   ├── ACME Retail Division (5001)
│   │   │   │   │   ├── Campaigns (1)
│   │   │   │   │   │   └── Summer Sale 2024 (10001)
│   │   │   │   │   │       ├── Strategies (2)
│   │   │   │   │   │       │   ├── Summer Sale Display (20001)
│   │   │   │   │   │       │   └── Summer Sale Video (20002)
│   │   │   │   │   └── Concepts (2)
│   │   │   │   │       ├── Summer Sale Banner Set (6001)
│   │   │   │   │       └── Summer Sale Video 30s (6002)
│   │   │   │   └── ACME Electronics (5002)
│   │   │   │       ├── Campaigns (1)
│   │   │   │       │   └── Electronics Black Friday (10002)
│   │   │   │       │       ├── Strategies (2)
│   │   │   │       │       │   ├── Black Friday Desktop (20003)
│   │   │   │       │       │   └── Black Friday Mobile (20004)
│   │   │   │       └── Concepts (2)
│   │   │   │           ├── Electronics Promo Banners (6003)
│   │   │   │           └── Black Friday Video 15s (6004)
│   │   └── Digital Marketing Partners (2002)
│   │       └── Advertisers (1)
│   │           └── ACME Home Goods (5003)
│   │               ├── Campaigns (1)
│   │               │   └── Home Goods Spring Collection (10003)
│   │               │       └── Strategies (1)
│   │               │           └── Spring Collection Native Ads (20005)
│   │               └── Concepts (1)
│   │                   └── Home Goods Native Ads (6005)
│   ├── Site Lists (2)
│   │   ├── Premium News Sites (4001) - whitelist
│   │   └── Brand Safety Blocklist (4002) - blacklist
│   └── Users (2)
│       ├── admin@acme.com (1) - ADMIN
│       └── trader@acme.com (2) - TRADER
│
└── TechStart Inc (100049)
    ├── Agencies (1)
    │   └── Creative Ads Agency (2003)
    │       └── Advertisers (1)
    │           └── TechStart SaaS Products (5004)
    │               ├── Campaigns (1)
    │               │   └── SaaS Product Launch (10004)
    │               │       └── Strategies (2)
    │               │           ├── SaaS Launch Display (20006)
    │               │           └── SaaS Launch Video (20007)
    │               └── Concepts (1)
    │                   └── SaaS Product Demo Video (6006)
    ├── Site Lists (1)
    │   └── Tech Publisher Network (4003) - whitelist
    └── Users (1)
        └── admin@techstart.com (3) - ADMIN

Supply Sources (4) - Global, not org-specific
├── Premium Publisher Exchange (3001) - exchange
├── Mobile App Network (3002) - app_network
├── Direct Publisher Deals (3003) - direct
└── Video Ad Exchange (3004) - exchange

Audience Segments (4) - Global, available to all
├── High-Income Professionals (7001) - 1st Party
├── In-Market: Electronics (7002) - 3rd Party
├── Retail Website Visitors (7003) - 1st Party
└── Tech Early Adopters (7004) - 3rd Party
```

## Entity Counts

| Entity Type | Total Count |
|-------------|-------------|
| Organizations | 2 |
| Agencies | 3 |
| Advertisers | 4 |
| Campaigns | 4 |
| Strategies | 7 |
| Concepts | 6 |
| Site Lists | 3 |
| Supply Sources | 4 |
| Audience Segments | 4 |
| Users | 3 |

## Relationship Details

### ACME Corporation (100048)
- **2 Agencies**: Media Solutions Agency, Digital Marketing Partners
- **3 Advertisers**: ACME Retail, ACME Electronics, ACME Home Goods
- **3 Campaigns**: Summer Sale, Black Friday, Spring Collection
- **5 Strategies**: 2 summer, 2 black friday, 1 spring
- **5 Concepts**: Various creatives across advertisers
- **2 Site Lists**: Premium news whitelist, brand safety blacklist
- **2 Users**: Admin and Trader

### TechStart Inc (100049)
- **1 Agency**: Creative Ads Agency
- **1 Advertiser**: TechStart SaaS Products
- **1 Campaign**: SaaS Product Launch
- **2 Strategies**: Display and Video
- **1 Concept**: Product demo video
- **1 Site List**: Tech publisher whitelist
- **1 User**: Admin

## Sample Data Flow

### Example: Creating a campaign for ACME Retail
1. **Organization**: ACME Corporation (100048)
2. **Agency**: Media Solutions Agency (2001)
3. **Advertiser**: ACME Retail Division (5001)
4. **Campaign**: Summer Sale 2024 (10001)
   - Budget: $50,000
   - Goal: CTR
   - Dates: June 1 - Aug 31, 2024
5. **Strategies**:
   - Display ($20k budget)
   - Video ($30k budget)
6. **Concepts**:
   - Banner Set (5 creatives)
   - Video 30s (2 creatives)

### Example: Querying campaigns for ACME Corporation
```
find_campaigns({ organization_id: 100048 })
→ Returns 3 campaigns: Summer Sale, Black Friday, Spring Collection
```

### Example: Getting advertiser hierarchy
```
get_organization_info({ organization_id: 100048, with_agencies: true, with_advertisers: true })
→ Returns ACME Corporation with:
  - 2 agencies (Media Solutions, Digital Marketing Partners)
  - 3 advertisers (Retail, Electronics, Home Goods)
```

## Testing Relationships

You can test these relationships in MCP Inspector:

1. **Find all agencies for ACME**: `find_agencies({ organization_id: 100048 })`
2. **Find all advertisers for an agency**: `find_advertisers({ agency_id: 2001 })`
3. **Find all campaigns for an advertiser**: `find_campaigns({ advertiser_id: 5001 })`
4. **Find all strategies for a campaign**: `find_strategies({ campaign_id: 10001 })`
5. **Find all concepts for an advertiser**: `find_concepts({ advertiser_id: 5001 })`

All relationships are properly linked with foreign keys!
