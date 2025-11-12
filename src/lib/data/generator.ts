/**
 * Mock Data Generator
 * Generates comprehensive linked mock data for testing
 */

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  organization_id: number;
  role: 'ADMIN' | 'MANAGER' | 'TRADER' | 'ANALYST' | 'VIEWER';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Agency {
  id: number;
  name: string;
  organization_id: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Advertiser {
  id: number;
  name: string;
  agency_id: number;
  organization_id: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: number;
  name: string;
  advertiser_id: number;
  organization_id: number;
  agency_id: number;
  status: boolean;
  start_date: string;
  end_date: string;
  total_budget: number;
  spend_cap_amount: number;
  goal_type: 'spend' | 'reach' | 'ctr' | 'cpa' | 'cpc';
  created_at: string;
  updated_at: string;
}

export interface Strategy {
  id: number;
  name: string;
  campaign_id: number;
  status: boolean;
  type: 'display' | 'video' | 'mobile' | 'native';
  budget: number;
  pacing_amount: number;
  max_bid: number;
  goal_type: 'spend' | 'reach' | 'ctr' | 'cpa' | 'cpc';
  created_at: string;
  updated_at: string;
}

export interface SupplySource {
  id: number;
  name: string;
  code: string;
  type: 'exchange' | 'app_network' | 'direct';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface SiteList {
  id: number;
  name: string;
  organization_id: number;
  type: 'whitelist' | 'blacklist';
  domain_count: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Concept {
  id: number;
  name: string;
  advertiser_id: number;
  status: 'active' | 'inactive';
  creative_count: number;
  created_at: string;
  updated_at: string;
}

export interface AudienceSegment {
  id: number;
  name: string;
  provider: string;
  code: string;
  full_path: string;
  uniques: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface GeneratedData {
  users: User[];
  organizations: Organization[];
  agencies: Agency[];
  advertisers: Advertiser[];
  campaigns: Campaign[];
  strategies: Strategy[];
  supplySources: SupplySource[];
  siteLists: SiteList[];
  concepts: Concept[];
  audienceSegments: AudienceSegment[];
}

/**
 * Generate all data with proper relationships
 * Hierarchy: Organization -> Agency -> Advertiser -> Campaign -> Strategy
 * Also: Advertiser -> Concepts, Organization -> SiteLists
 */
export function generateAllData(seed?: number): GeneratedData {
  // Organizations
  const organizations: Organization[] = [
    {
      id: 100048,
      name: 'ACME Corporation',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 100049,
      name: 'TechStart Inc',
      status: 'active',
      created_at: '2024-02-15T00:00:00Z',
      updated_at: '2024-02-15T00:00:00Z',
    },
  ];

  // Agencies (linked to Organizations)
  const agencies: Agency[] = [
    {
      id: 2001,
      name: 'Media Solutions Agency',
      organization_id: 100048, // ACME Corporation
      status: 'active',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 2002,
      name: 'Digital Marketing Partners',
      organization_id: 100048, // ACME Corporation
      status: 'active',
      created_at: '2024-03-01T00:00:00Z',
      updated_at: '2024-03-01T00:00:00Z',
    },
    {
      id: 2003,
      name: 'Creative Ads Agency',
      organization_id: 100049, // TechStart Inc
      status: 'active',
      created_at: '2024-03-10T00:00:00Z',
      updated_at: '2024-03-10T00:00:00Z',
    },
  ];

  // Advertisers (linked to Agencies and Organizations)
  const advertisers: Advertiser[] = [
    {
      id: 5001,
      name: 'ACME Retail Division',
      agency_id: 2001, // Media Solutions Agency
      organization_id: 100048, // ACME Corporation
      status: 'active',
      created_at: '2024-01-20T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z',
    },
    {
      id: 5002,
      name: 'ACME Electronics',
      agency_id: 2001, // Media Solutions Agency
      organization_id: 100048, // ACME Corporation
      status: 'active',
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
    },
    {
      id: 5003,
      name: 'ACME Home Goods',
      agency_id: 2002, // Digital Marketing Partners
      organization_id: 100048, // ACME Corporation
      status: 'active',
      created_at: '2024-02-10T00:00:00Z',
      updated_at: '2024-02-10T00:00:00Z',
    },
    {
      id: 5004,
      name: 'TechStart SaaS Products',
      agency_id: 2003, // Creative Ads Agency
      organization_id: 100049, // TechStart Inc
      status: 'active',
      created_at: '2024-02-20T00:00:00Z',
      updated_at: '2024-02-20T00:00:00Z',
    },
  ];

  // Campaigns (linked to Advertisers, Agencies, Organizations)
  const campaigns: Campaign[] = [
    {
      id: 10001,
      name: 'Summer Sale 2024',
      advertiser_id: 5001, // ACME Retail Division
      organization_id: 100048, // ACME Corporation
      agency_id: 2001, // Media Solutions Agency
      status: true,
      start_date: '2024-06-01',
      end_date: '2024-08-31',
      total_budget: 50000,
      spend_cap_amount: 55000,
      goal_type: 'ctr',
      created_at: '2024-05-15T00:00:00Z',
      updated_at: '2024-05-15T00:00:00Z',
    },
    {
      id: 10002,
      name: 'Electronics Black Friday',
      advertiser_id: 5002, // ACME Electronics
      organization_id: 100048, // ACME Corporation
      agency_id: 2001, // Media Solutions Agency
      status: true,
      start_date: '2024-11-01',
      end_date: '2024-11-30',
      total_budget: 100000,
      spend_cap_amount: 110000,
      goal_type: 'cpa',
      created_at: '2024-10-01T00:00:00Z',
      updated_at: '2024-10-01T00:00:00Z',
    },
    {
      id: 10003,
      name: 'Home Goods Spring Collection',
      advertiser_id: 5003, // ACME Home Goods
      organization_id: 100048, // ACME Corporation
      agency_id: 2002, // Digital Marketing Partners
      status: true,
      start_date: '2024-03-01',
      end_date: '2024-05-31',
      total_budget: 30000,
      spend_cap_amount: 33000,
      goal_type: 'reach',
      created_at: '2024-02-15T00:00:00Z',
      updated_at: '2024-02-15T00:00:00Z',
    },
    {
      id: 10004,
      name: 'SaaS Product Launch',
      advertiser_id: 5004, // TechStart SaaS Products
      organization_id: 100049, // TechStart Inc
      agency_id: 2003, // Creative Ads Agency
      status: true,
      start_date: '2024-04-01',
      end_date: '2024-06-30',
      total_budget: 75000,
      spend_cap_amount: 82500,
      goal_type: 'cpc',
      created_at: '2024-03-15T00:00:00Z',
      updated_at: '2024-03-15T00:00:00Z',
    },
  ];

  // Strategies (linked to Campaigns)
  const strategies: Strategy[] = [
    {
      id: 20001,
      name: 'Summer Sale Display',
      campaign_id: 10001, // Summer Sale 2024
      status: true,
      type: 'display',
      budget: 20000,
      pacing_amount: 666.67,
      max_bid: 5.0,
      goal_type: 'ctr',
      created_at: '2024-05-20T00:00:00Z',
      updated_at: '2024-05-20T00:00:00Z',
    },
    {
      id: 20002,
      name: 'Summer Sale Video',
      campaign_id: 10001, // Summer Sale 2024
      status: true,
      type: 'video',
      budget: 30000,
      pacing_amount: 1000,
      max_bid: 15.0,
      goal_type: 'ctr',
      created_at: '2024-05-20T00:00:00Z',
      updated_at: '2024-05-20T00:00:00Z',
    },
    {
      id: 20003,
      name: 'Black Friday Desktop',
      campaign_id: 10002, // Electronics Black Friday
      status: true,
      type: 'display',
      budget: 50000,
      pacing_amount: 1666.67,
      max_bid: 8.0,
      goal_type: 'cpa',
      created_at: '2024-10-05T00:00:00Z',
      updated_at: '2024-10-05T00:00:00Z',
    },
    {
      id: 20004,
      name: 'Black Friday Mobile',
      campaign_id: 10002, // Electronics Black Friday
      status: true,
      type: 'mobile',
      budget: 50000,
      pacing_amount: 1666.67,
      max_bid: 6.0,
      goal_type: 'cpa',
      created_at: '2024-10-05T00:00:00Z',
      updated_at: '2024-10-05T00:00:00Z',
    },
    {
      id: 20005,
      name: 'Spring Collection Native Ads',
      campaign_id: 10003, // Home Goods Spring Collection
      status: true,
      type: 'native',
      budget: 30000,
      pacing_amount: 1000,
      max_bid: 4.0,
      goal_type: 'reach',
      created_at: '2024-02-20T00:00:00Z',
      updated_at: '2024-02-20T00:00:00Z',
    },
    {
      id: 20006,
      name: 'SaaS Launch Display',
      campaign_id: 10004, // SaaS Product Launch
      status: true,
      type: 'display',
      budget: 35000,
      pacing_amount: 1166.67,
      max_bid: 10.0,
      goal_type: 'cpc',
      created_at: '2024-03-20T00:00:00Z',
      updated_at: '2024-03-20T00:00:00Z',
    },
    {
      id: 20007,
      name: 'SaaS Launch Video',
      campaign_id: 10004, // SaaS Product Launch
      status: true,
      type: 'video',
      budget: 40000,
      pacing_amount: 1333.33,
      max_bid: 20.0,
      goal_type: 'cpc',
      created_at: '2024-03-20T00:00:00Z',
      updated_at: '2024-03-20T00:00:00Z',
    },
  ];

  // Concepts/Creatives (linked to Advertisers)
  const concepts: Concept[] = [
    {
      id: 6001,
      name: 'Summer Sale Banner Set',
      advertiser_id: 5001, // ACME Retail Division
      status: 'active',
      creative_count: 5,
      created_at: '2024-05-10T00:00:00Z',
      updated_at: '2024-05-10T00:00:00Z',
    },
    {
      id: 6002,
      name: 'Summer Sale Video 30s',
      advertiser_id: 5001, // ACME Retail Division
      status: 'active',
      creative_count: 2,
      created_at: '2024-05-12T00:00:00Z',
      updated_at: '2024-05-12T00:00:00Z',
    },
    {
      id: 6003,
      name: 'Electronics Promo Banners',
      advertiser_id: 5002, // ACME Electronics
      status: 'active',
      creative_count: 8,
      created_at: '2024-09-15T00:00:00Z',
      updated_at: '2024-09-15T00:00:00Z',
    },
    {
      id: 6004,
      name: 'Black Friday Video 15s',
      advertiser_id: 5002, // ACME Electronics
      status: 'active',
      creative_count: 3,
      created_at: '2024-09-20T00:00:00Z',
      updated_at: '2024-09-20T00:00:00Z',
    },
    {
      id: 6005,
      name: 'Home Goods Native Ads',
      advertiser_id: 5003, // ACME Home Goods
      status: 'active',
      creative_count: 6,
      created_at: '2024-02-05T00:00:00Z',
      updated_at: '2024-02-05T00:00:00Z',
    },
    {
      id: 6006,
      name: 'SaaS Product Demo Video',
      advertiser_id: 5004, // TechStart SaaS Products
      status: 'active',
      creative_count: 4,
      created_at: '2024-03-10T00:00:00Z',
      updated_at: '2024-03-10T00:00:00Z',
    },
  ];

  // Site Lists (linked to Organizations)
  const siteLists: SiteList[] = [
    {
      id: 4001,
      name: 'Premium News Sites',
      organization_id: 100048, // ACME Corporation
      type: 'whitelist',
      domain_count: 250,
      status: 'active',
      created_at: '2024-01-05T00:00:00Z',
      updated_at: '2024-05-10T00:00:00Z',
    },
    {
      id: 4002,
      name: 'Brand Safety Blocklist',
      organization_id: 100048, // ACME Corporation
      type: 'blacklist',
      domain_count: 1500,
      status: 'active',
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-06-15T00:00:00Z',
    },
    {
      id: 4003,
      name: 'Tech Publisher Network',
      organization_id: 100049, // TechStart Inc
      type: 'whitelist',
      domain_count: 120,
      status: 'active',
      created_at: '2024-02-20T00:00:00Z',
      updated_at: '2024-05-25T00:00:00Z',
    },
  ];

  // Supply Sources (global, not linked to specific orgs)
  const supplySources: SupplySource[] = [
    {
      id: 3001,
      name: 'Premium Publisher Exchange',
      code: 'PPX',
      type: 'exchange',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 3002,
      name: 'Mobile App Network',
      code: 'MAN',
      type: 'app_network',
      status: 'active',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 3003,
      name: 'Direct Publisher Deals',
      code: 'DPD',
      type: 'direct',
      status: 'active',
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
    },
    {
      id: 3004,
      name: 'Video Ad Exchange',
      code: 'VAX',
      type: 'exchange',
      status: 'active',
      created_at: '2024-02-10T00:00:00Z',
      updated_at: '2024-02-10T00:00:00Z',
    },
  ];

  // Audience Segments (global, available to all)
  const audienceSegments: AudienceSegment[] = [
    {
      id: 7001,
      name: 'High-Income Professionals',
      provider: '1st Party',
      code: 'HIP-001',
      full_path: 'Demographics/Income/High',
      uniques: 2500000,
      status: 'active',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 7002,
      name: 'In-Market: Electronics',
      provider: '3rd Party',
      code: 'IM-ELEC',
      full_path: 'Intent/In-Market/Electronics',
      uniques: 1800000,
      status: 'active',
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
    },
    {
      id: 7003,
      name: 'Retail Website Visitors',
      provider: '1st Party',
      code: 'RWV-001',
      full_path: 'Behavioral/Site Visitors/Retail',
      uniques: 850000,
      status: 'active',
      created_at: '2024-03-10T00:00:00Z',
      updated_at: '2024-03-10T00:00:00Z',
    },
    {
      id: 7004,
      name: 'Tech Early Adopters',
      provider: '3rd Party',
      code: 'TEA-001',
      full_path: 'Interests/Technology/Early Adopters',
      uniques: 1200000,
      status: 'active',
      created_at: '2024-04-01T00:00:00Z',
      updated_at: '2024-04-01T00:00:00Z',
    },
  ];

  // Users (linked to Organizations)
  const users: User[] = [
    {
      id: 1,
      email: 'admin@acme.com',
      first_name: 'Admin',
      last_name: 'User',
      organization_id: 100048, // ACME Corporation
      role: 'ADMIN',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      email: 'trader@acme.com',
      first_name: 'Trader',
      last_name: 'User',
      organization_id: 100048, // ACME Corporation
      role: 'TRADER',
      status: 'active',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: 3,
      email: 'admin@techstart.com',
      first_name: 'Tech',
      last_name: 'Admin',
      organization_id: 100049, // TechStart Inc
      role: 'ADMIN',
      status: 'active',
      created_at: '2024-02-15T00:00:00Z',
      updated_at: '2024-02-15T00:00:00Z',
    },
  ];

  return {
    users,
    organizations,
    agencies,
    advertisers,
    campaigns,
    strategies,
    supplySources,
    siteLists,
    concepts,
    audienceSegments,
  };
}
