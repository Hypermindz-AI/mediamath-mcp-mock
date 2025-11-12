/**
 * Stateful In-Memory Data Store
 * Provides CRUD operations, filtering, sorting, and pagination for all entities
 */

import type {
  User,
  Organization,
  Agency,
  Advertiser,
  Campaign,
  Strategy,
  SupplySource,
  SiteList,
  Concept,
  AudienceSegment,
  GeneratedData,
} from './generator';
import { generateAllData } from './generator';

// ============================================================================
// Store Interface
// ============================================================================

export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export interface PaginationOptions {
  offset: number;
  limit: number;
}

export interface FindResult<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// Entity Store Class
// ============================================================================

class EntityStore<T extends { id: number }> {
  private data: Map<number, T>;
  private entityName: string;

  constructor(entityName: string, initialData: T[] = []) {
    this.entityName = entityName;
    this.data = new Map(initialData.map(item => [item.id, item]));
  }

  /**
   * Find all items matching filters with sorting and pagination
   */
  find(
    filters?: FilterOptions,
    sort?: SortOptions,
    pagination?: PaginationOptions
  ): FindResult<T> {
    let items = Array.from(this.data.values());

    // Apply filters
    if (filters) {
      items = items.filter(item => this.matchesFilters(item, filters));
    }

    // Apply sorting
    if (sort) {
      items = this.sortItems(items, sort);
    }

    const total = items.length;

    // Apply pagination
    if (pagination) {
      const { offset, limit } = pagination;
      items = items.slice(offset, offset + limit);
      return {
        data: items,
        total,
        offset,
        limit,
        hasMore: offset + limit < total,
      };
    }

    return {
      data: items,
      total,
      offset: 0,
      limit: total,
      hasMore: false,
    };
  }

  /**
   * Find a single item by ID
   */
  findById(id: number): T | undefined {
    return this.data.get(id);
  }

  /**
   * Find first item matching filters
   */
  findOne(filters: FilterOptions): T | undefined {
    return Array.from(this.data.values()).find(item =>
      this.matchesFilters(item, filters)
    );
  }

  /**
   * Create a new item
   */
  create(item: T): T {
    if (this.data.has(item.id)) {
      throw new Error(`${this.entityName} with ID ${item.id} already exists`);
    }
    this.data.set(item.id, item);
    return item;
  }

  /**
   * Update an existing item
   */
  update(id: number, updates: Partial<T>): T {
    const existing = this.data.get(id);
    if (!existing) {
      throw new Error(`${this.entityName} with ID ${id} not found`);
    }

    const updated = { ...existing, ...updates, id, updated_at: new Date().toISOString() } as T;
    this.data.set(id, updated);
    return updated;
  }

  /**
   * Delete an item by ID
   */
  delete(id: number): boolean {
    return this.data.delete(id);
  }

  /**
   * Get all items
   */
  getAll(): T[] {
    return Array.from(this.data.values());
  }

  /**
   * Count items matching filters
   */
  count(filters?: FilterOptions): number {
    if (!filters) {
      return this.data.size;
    }
    return Array.from(this.data.values()).filter(item =>
      this.matchesFilters(item, filters)
    ).length;
  }

  /**
   * Check if item exists
   */
  exists(id: number): boolean {
    return this.data.has(id);
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.data.clear();
  }

  /**
   * Bulk insert items
   */
  bulkInsert(items: T[]): void {
    items.forEach(item => {
      this.data.set(item.id, item);
    });
  }

  /**
   * Export data as JSON
   */
  export(): T[] {
    return Array.from(this.data.values());
  }

  /**
   * Import data from JSON
   */
  import(items: T[]): void {
    this.clear();
    this.bulkInsert(items);
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  private matchesFilters(item: T, filters: FilterOptions): boolean {
    return Object.entries(filters).every(([key, value]) => {
      const itemValue = (item as any)[key];

      // Handle undefined/null
      if (value === null || value === undefined) {
        return itemValue === value;
      }

      // Handle arrays (IN queries)
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }

      // Handle objects (range queries, etc.)
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Support operators like { $gte: 100, $lte: 500 }
        if (value.$gte !== undefined && itemValue < value.$gte) return false;
        if (value.$lte !== undefined && itemValue > value.$lte) return false;
        if (value.$gt !== undefined && itemValue <= value.$gt) return false;
        if (value.$lt !== undefined && itemValue >= value.$lt) return false;
        if (value.$ne !== undefined && itemValue === value.$ne) return false;
        if (value.$contains !== undefined && typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.$contains.toLowerCase());
        }
        return true;
      }

      // String matching (case-insensitive partial match)
      if (typeof value === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase());
      }

      // Exact match
      return itemValue === value;
    });
  }

  private sortItems(items: T[], sort: SortOptions): T[] {
    const { field, order } = sort;
    return items.sort((a, b) => {
      const aVal = (a as any)[field];
      const bVal = (b as any)[field];

      let comparison = 0;
      if (aVal > bVal) comparison = 1;
      if (aVal < bVal) comparison = -1;

      return order === 'desc' ? -comparison : comparison;
    });
  }
}

// ============================================================================
// Global Data Store
// ============================================================================

export class DataStore {
  public users: EntityStore<User>;
  public organizations: EntityStore<Organization>;
  public agencies: EntityStore<Agency>;
  public advertisers: EntityStore<Advertiser>;
  public campaigns: EntityStore<Campaign>;
  public strategies: EntityStore<Strategy>;
  public supplySources: EntityStore<SupplySource>;
  public siteLists: EntityStore<SiteList>;
  public concepts: EntityStore<Concept>;
  public audienceSegments: EntityStore<AudienceSegment>;

  private defaultData: GeneratedData;

  constructor() {
    // Generate default data
    this.defaultData = generateAllData();

    // Initialize stores
    this.users = new EntityStore('User', this.defaultData.users);
    this.organizations = new EntityStore('Organization', this.defaultData.organizations);
    this.agencies = new EntityStore('Agency', this.defaultData.agencies);
    this.advertisers = new EntityStore('Advertiser', this.defaultData.advertisers);
    this.campaigns = new EntityStore('Campaign', this.defaultData.campaigns);
    this.strategies = new EntityStore('Strategy', this.defaultData.strategies);
    this.supplySources = new EntityStore('SupplySource', this.defaultData.supplySources);
    this.siteLists = new EntityStore('SiteList', this.defaultData.siteLists);
    this.concepts = new EntityStore('Concept', this.defaultData.concepts);
    this.audienceSegments = new EntityStore('AudienceSegment', this.defaultData.audienceSegments);
  }

  /**
   * Reset all stores to default data
   */
  reset(): void {
    this.users.import(this.defaultData.users);
    this.organizations.import(this.defaultData.organizations);
    this.agencies.import(this.defaultData.agencies);
    this.advertisers.import(this.defaultData.advertisers);
    this.campaigns.import(this.defaultData.campaigns);
    this.strategies.import(this.defaultData.strategies);
    this.supplySources.import(this.defaultData.supplySources);
    this.siteLists.import(this.defaultData.siteLists);
    this.concepts.import(this.defaultData.concepts);
    this.audienceSegments.import(this.defaultData.audienceSegments);
  }

  /**
   * Export all data as JSON
   */
  exportAll(): GeneratedData {
    return {
      users: this.users.export(),
      organizations: this.organizations.export(),
      agencies: this.agencies.export(),
      advertisers: this.advertisers.export(),
      campaigns: this.campaigns.export(),
      strategies: this.strategies.export(),
      supplySources: this.supplySources.export(),
      siteLists: this.siteLists.export(),
      concepts: this.concepts.export(),
      audienceSegments: this.audienceSegments.export(),
    };
  }

  /**
   * Import all data from JSON
   */
  importAll(data: GeneratedData): void {
    this.users.import(data.users);
    this.organizations.import(data.organizations);
    this.agencies.import(data.agencies);
    this.advertisers.import(data.advertisers);
    this.campaigns.import(data.campaigns);
    this.strategies.import(data.strategies);
    this.supplySources.import(data.supplySources);
    this.siteLists.import(data.siteLists);
    this.concepts.import(data.concepts);
    this.audienceSegments.import(data.audienceSegments);
  }

  /**
   * Get statistics about the data store
   */
  getStats() {
    return {
      users: this.users.count(),
      organizations: this.organizations.count(),
      agencies: this.agencies.count(),
      advertisers: this.advertisers.count(),
      campaigns: this.campaigns.count(),
      strategies: this.strategies.count(),
      supplySources: this.supplySources.count(),
      siteLists: this.siteLists.count(),
      concepts: this.concepts.count(),
      audienceSegments: this.audienceSegments.count(),
      total: this.users.count() +
        this.organizations.count() +
        this.agencies.count() +
        this.advertisers.count() +
        this.campaigns.count() +
        this.strategies.count() +
        this.supplySources.count() +
        this.siteLists.count() +
        this.concepts.count() +
        this.audienceSegments.count(),
    };
  }

  /**
   * Validate relationships between entities
   */
  validateRelationships(): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate user -> organization
    this.users.getAll().forEach(user => {
      if (!this.organizations.exists(user.organization_id)) {
        errors.push(`User ${user.id} references non-existent organization ${user.organization_id}`);
      }
    });

    // Validate agency -> organization
    this.agencies.getAll().forEach(agency => {
      if (!this.organizations.exists(agency.organization_id)) {
        errors.push(`Agency ${agency.id} references non-existent organization ${agency.organization_id}`);
      }
    });

    // Validate advertiser -> agency & organization
    this.advertisers.getAll().forEach(advertiser => {
      if (!this.agencies.exists(advertiser.agency_id)) {
        errors.push(`Advertiser ${advertiser.id} references non-existent agency ${advertiser.agency_id}`);
      }
      if (!this.organizations.exists(advertiser.organization_id)) {
        errors.push(`Advertiser ${advertiser.id} references non-existent organization ${advertiser.organization_id}`);
      }
    });

    // Validate campaign -> advertiser, agency, organization
    this.campaigns.getAll().forEach(campaign => {
      if (!this.advertisers.exists(campaign.advertiser_id)) {
        errors.push(`Campaign ${campaign.id} references non-existent advertiser ${campaign.advertiser_id}`);
      }
      if (!this.agencies.exists(campaign.agency_id)) {
        errors.push(`Campaign ${campaign.id} references non-existent agency ${campaign.agency_id}`);
      }
      if (!this.organizations.exists(campaign.organization_id)) {
        errors.push(`Campaign ${campaign.id} references non-existent organization ${campaign.organization_id}`);
      }
    });

    // Validate strategy -> campaign
    this.strategies.getAll().forEach(strategy => {
      if (!this.campaigns.exists(strategy.campaign_id)) {
        errors.push(`Strategy ${strategy.id} references non-existent campaign ${strategy.campaign_id}`);
      }
    });

    // Validate site list -> organization
    this.siteLists.getAll().forEach(siteList => {
      if (!this.organizations.exists(siteList.organization_id)) {
        errors.push(`SiteList ${siteList.id} references non-existent organization ${siteList.organization_id}`);
      }
    });

    // Validate concept -> advertiser
    this.concepts.getAll().forEach(concept => {
      if (!this.advertisers.exists(concept.advertiser_id)) {
        errors.push(`Concept ${concept.id} references non-existent advertiser ${concept.advertiser_id}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get the ACME organization for testing write operations
   */
  getAcmeOrganization(): Organization | undefined {
    return this.organizations.findById(100048);
  }

  /**
   * Check if an entity belongs to the ACME organization
   */
  isAcmeEntity(entityType: 'campaign' | 'strategy' | 'advertiser' | 'agency', entityId: number): boolean {
    switch (entityType) {
      case 'campaign': {
        const campaign = this.campaigns.findById(entityId);
        return campaign?.organization_id === 100048;
      }
      case 'strategy': {
        const strategy = this.strategies.findById(entityId);
        if (!strategy) return false;
        const campaign = this.campaigns.findById(strategy.campaign_id);
        return campaign?.organization_id === 100048;
      }
      case 'advertiser': {
        const advertiser = this.advertisers.findById(entityId);
        return advertiser?.organization_id === 100048;
      }
      case 'agency': {
        const agency = this.agencies.findById(entityId);
        return agency?.organization_id === 100048;
      }
      default:
        return false;
    }
  }
}

// ============================================================================
// Global Singleton Instance
// ============================================================================

let globalStore: DataStore | null = null;

export function getDataStore(): DataStore {
  if (!globalStore) {
    globalStore = new DataStore();
  }
  return globalStore;
}

export function resetDataStore(): void {
  if (globalStore) {
    globalStore.reset();
  }
}

export function recreateDataStore(): void {
  globalStore = new DataStore();
}
