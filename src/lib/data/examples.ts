/**
 * Data Layer Usage Examples
 * Demonstrates common patterns for working with the mock data store
 */

import { getDataStore } from './store';

// ============================================================================
// Basic Usage Examples
// ============================================================================

export function basicExamples() {
  const store = getDataStore();

  // Get statistics
  const stats = store.getStats();
  console.log('Total records:', stats.total);
  console.log('Campaigns:', stats.campaigns);

  // Find all active campaigns
  const activeCampaigns = store.campaigns.find({ status: true });
  console.log(`Found ${activeCampaigns.data.length} active campaigns`);

  // Find campaign by ID
  const campaign = store.campaigns.findById(30001);
  if (campaign) {
    console.log(`Campaign: ${campaign.name}`);
  }

  // Find first matching campaign
  const firstActive = store.campaigns.findOne({ status: true });
  console.log('First active campaign:', firstActive?.name);
}

// ============================================================================
// Advanced Filtering Examples
// ============================================================================

export function filteringExamples() {
  const store = getDataStore();

  // Range query - campaigns with budget between $10K and $50K
  const midBudgetCampaigns = store.campaigns.find({
    total_budget: { $gte: 10000, $lte: 50000 },
  });
  console.log('Mid-budget campaigns:', midBudgetCampaigns.data.length);

  // String contains (case-insensitive)
  const holidayCampaigns = store.campaigns.find({
    name: { $contains: 'holiday' },
  });
  console.log('Holiday campaigns:', holidayCampaigns.data.length);

  // Multiple filters (AND logic)
  const activeHighBudget = store.campaigns.find({
    status: true,
    total_budget: { $gte: 100000 },
  });
  console.log('Active high-budget campaigns:', activeHighBudget.data.length);

  // IN query - specific advertiser IDs
  const specificAdvertisers = store.campaigns.find({
    advertiser_id: [20001, 20002, 20003],
  });
  console.log('Campaigns for specific advertisers:', specificAdvertisers.data.length);

  // Not equal
  const notPaused = store.campaigns.find({
    status: { $ne: false },
  });
  console.log('Non-paused campaigns:', notPaused.data.length);
}

// ============================================================================
// Sorting and Pagination Examples
// ============================================================================

export function paginationExamples() {
  const store = getDataStore();

  // Sort by budget (descending)
  const topBudgetCampaigns = store.campaigns.find(
    { status: true },
    { field: 'total_budget', order: 'desc' },
    { offset: 0, limit: 10 }
  );
  console.log('Top 10 campaigns by budget:');
  topBudgetCampaigns.data.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name} - $${c.total_budget.toLocaleString()}`);
  });

  // Paginate through all campaigns
  const pageSize = 25;
  let offset = 0;
  let page = 1;

  while (true) {
    const result = store.campaigns.find(
      {},
      { field: 'id', order: 'asc' },
      { offset, limit: pageSize }
    );

    console.log(`Page ${page}: ${result.data.length} campaigns`);

    if (!result.hasMore) break;

    offset += pageSize;
    page++;
  }
}

// ============================================================================
// CRUD Operations Examples
// ============================================================================

export function crudExamples() {
  const store = getDataStore();

  // CREATE - Add new campaign
  try {
    const newCampaign = store.campaigns.create({
      id: 99999,
      name: 'New Year Sale 2025',
      advertiser_id: 20001,
      organization_id: 100048, // ACME
      agency_id: 10001,
      status: true,
      start_date: '2025-01-01',
      end_date: '2025-01-31',
      total_budget: 50000,
      goal_type: 'spend',
      timezone: 'America/New_York',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    console.log('Created campaign:', newCampaign.id);
  } catch (error) {
    console.error('Failed to create campaign:', error);
  }

  // READ - Get campaign details
  const campaign = store.campaigns.findById(99999);
  if (campaign) {
    console.log('Campaign name:', campaign.name);
    console.log('Budget:', campaign.total_budget);
  }

  // UPDATE - Modify campaign
  try {
    const updated = store.campaigns.update(99999, {
      name: 'New Year Mega Sale 2025',
      total_budget: 75000,
    });
    console.log('Updated campaign:', updated.name);
  } catch (error) {
    console.error('Failed to update campaign:', error);
  }

  // DELETE - Remove campaign
  const deleted = store.campaigns.delete(99999);
  console.log('Campaign deleted:', deleted);
}

// ============================================================================
// Relationship Navigation Examples
// ============================================================================

export function relationshipExamples() {
  const store = getDataStore();

  // Find campaign and navigate to advertiser
  const campaign = store.campaigns.getAll()[0];
  const advertiser = store.advertisers.findById(campaign.advertiser_id);
  console.log(`Campaign "${campaign.name}" belongs to "${advertiser?.name}"`);

  // Navigate full hierarchy: Campaign → Advertiser → Agency → Organization
  if (advertiser) {
    const agency = store.agencies.findById(advertiser.agency_id);
    if (agency) {
      const org = store.organizations.findById(agency.organization_id);
      console.log('Full hierarchy:');
      console.log(`  Org: ${org?.name}`);
      console.log(`  Agency: ${agency.name}`);
      console.log(`  Advertiser: ${advertiser.name}`);
      console.log(`  Campaign: ${campaign.name}`);
    }
  }

  // Find all campaigns for a specific advertiser
  const advertiserId = 20001;
  const advertiserCampaigns = store.campaigns.find({ advertiser_id: advertiserId });
  console.log(`Advertiser ${advertiserId} has ${advertiserCampaigns.data.length} campaigns`);

  // Find all strategies for a campaign
  const campaignStrategies = store.strategies.find({ campaign_id: campaign.id });
  console.log(`Campaign ${campaign.id} has ${campaignStrategies.data.length} strategies`);
}

// ============================================================================
// Validation Examples
// ============================================================================

export function validationExamples() {
  const store = getDataStore();

  // Validate all relationships
  const validation = store.validateRelationships();
  if (validation.valid) {
    console.log('✓ All relationships are valid');
  } else {
    console.error('✗ Relationship errors found:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }

  // Check if entity belongs to ACME
  const campaign = store.campaigns.findOne({ organization_id: 100048 });
  if (campaign) {
    const isAcme = store.isAcmeEntity('campaign', campaign.id);
    console.log(`Campaign ${campaign.id} is ACME entity:`, isAcme);
  }

  // Get ACME organization
  const acme = store.getAcmeOrganization();
  console.log('ACME organization:', acme?.name);
}

// ============================================================================
// Import/Export Examples
// ============================================================================

export function importExportExamples() {
  const store = getDataStore();

  // Export all data to JSON
  const allData = store.exportAll();
  console.log('Exported data:');
  console.log(`  Users: ${allData.users.length}`);
  console.log(`  Campaigns: ${allData.campaigns.length}`);

  // Export campaigns only
  const campaigns = store.campaigns.export();
  console.log('Exported campaigns:', campaigns.length);

  // Save to file (example)
  // fs.writeFileSync('campaigns.json', JSON.stringify(campaigns, null, 2));

  // Import from JSON
  // const loadedCampaigns = JSON.parse(fs.readFileSync('campaigns.json', 'utf-8'));
  // store.campaigns.import(loadedCampaigns);

  // Reset to defaults
  store.reset();
  console.log('Data reset to defaults');
}

// ============================================================================
// Complex Query Examples
// ============================================================================

export function complexQueryExamples() {
  const store = getDataStore();

  // Find high-value active campaigns for specific advertisers
  const result = store.campaigns.find({
    status: true,
    total_budget: { $gte: 50000 },
    advertiser_id: [20001, 20002, 20003, 20004, 20005],
  });

  console.log(`Found ${result.data.length} high-value campaigns`);

  // Group campaigns by advertiser
  const campaignsByAdvertiser = new Map<number, typeof result.data>();
  result.data.forEach(campaign => {
    const existing = campaignsByAdvertiser.get(campaign.advertiser_id) || [];
    existing.push(campaign);
    campaignsByAdvertiser.set(campaign.advertiser_id, existing);
  });

  console.log('\nCampaigns grouped by advertiser:');
  campaignsByAdvertiser.forEach((campaigns, advertiserId) => {
    const advertiser = store.advertisers.findById(advertiserId);
    console.log(`  ${advertiser?.name}: ${campaigns.length} campaigns`);
  });

  // Calculate total budget across all campaigns
  const totalBudget = store.campaigns.getAll().reduce(
    (sum, campaign) => sum + campaign.total_budget,
    0
  );
  console.log(`\nTotal budget across all campaigns: $${totalBudget.toLocaleString()}`);

  // Find campaigns with strategies
  const campaignsWithStrategies = store.campaigns.getAll().filter(campaign => {
    const strategies = store.strategies.find({ campaign_id: campaign.id });
    return strategies.data.length > 0;
  });
  console.log(`Campaigns with strategies: ${campaignsWithStrategies.length}`);
}

// ============================================================================
// Performance Examples
// ============================================================================

export function performanceExamples() {
  const store = getDataStore();

  // Measure lookup by ID (O(1))
  console.time('Find by ID');
  for (let i = 0; i < 1000; i++) {
    store.campaigns.findById(30001);
  }
  console.timeEnd('Find by ID');

  // Measure filtered search (O(n))
  console.time('Filtered search');
  for (let i = 0; i < 100; i++) {
    store.campaigns.find({ status: true, total_budget: { $gte: 10000 } });
  }
  console.timeEnd('Filtered search');

  // Measure pagination
  console.time('Paginated search');
  for (let i = 0; i < 100; i++) {
    store.campaigns.find({}, undefined, { offset: 0, limit: 25 });
  }
  console.timeEnd('Paginated search');
}

// ============================================================================
// Run All Examples
// ============================================================================

export function runAllExamples() {
  console.log('=== Basic Examples ===');
  basicExamples();

  console.log('\n=== Filtering Examples ===');
  filteringExamples();

  console.log('\n=== Pagination Examples ===');
  paginationExamples();

  console.log('\n=== CRUD Examples ===');
  crudExamples();

  console.log('\n=== Relationship Examples ===');
  relationshipExamples();

  console.log('\n=== Validation Examples ===');
  validationExamples();

  console.log('\n=== Import/Export Examples ===');
  importExportExamples();

  console.log('\n=== Complex Query Examples ===');
  complexQueryExamples();

  console.log('\n=== Performance Examples ===');
  performanceExamples();
}

// Uncomment to run examples:
// runAllExamples();
