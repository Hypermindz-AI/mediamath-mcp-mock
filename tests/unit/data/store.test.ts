/**
 * Data Store Tests
 * Validates mock data generation, CRUD operations, and relationships
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DataStore, getDataStore, resetDataStore, recreateDataStore } from '../../../src/lib/data/store';

describe('DataStore', () => {
  let store: DataStore;

  beforeEach(() => {
    recreateDataStore();
    store = getDataStore();
  });

  describe('Initialization', () => {
    it('should initialize with correct entity counts', () => {
      const stats = store.getStats();

      expect(stats.users).toBe(50);
      expect(stats.organizations).toBe(10);
      expect(stats.agencies).toBe(25);
      expect(stats.advertisers).toBe(50);
      expect(stats.campaigns).toBe(100);
      expect(stats.strategies).toBe(100);
      expect(stats.supplySources).toBe(75);
      expect(stats.siteLists).toBe(50);
      expect(stats.concepts).toBe(80);
      expect(stats.audienceSegments).toBe(60);
      expect(stats.total).toBe(600);
    });

    it('should include ACME organization (100048)', () => {
      const acme = store.organizations.findById(100048);

      expect(acme).toBeDefined();
      expect(acme?.name).toBe('ACME Corporation');
      expect(acme?.status).toBe(true);
    });
  });

  describe('CRUD Operations', () => {
    it('should find entities with filters', () => {
      const activeCampaigns = store.campaigns.find({ status: true });

      expect(activeCampaigns.data.length).toBeGreaterThan(0);
      activeCampaigns.data.forEach(campaign => {
        expect(campaign.status).toBe(true);
      });
    });

    it('should find entity by ID', () => {
      const allCampaigns = store.campaigns.getAll();
      const firstCampaign = allCampaigns[0];

      const found = store.campaigns.findById(firstCampaign.id);
      expect(found).toEqual(firstCampaign);
    });

    it('should create new entity', () => {
      const newCampaign = {
        id: 99999,
        name: 'Test Campaign',
        advertiser_id: 20000,
        organization_id: 100048,
        agency_id: 10000,
        status: true,
        start_date: '2025-01-01',
        total_budget: 50000,
        goal_type: 'spend' as const,
        timezone: 'America/New_York',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const created = store.campaigns.create(newCampaign);
      expect(created.id).toBe(99999);
      expect(created.name).toBe('Test Campaign');

      const found = store.campaigns.findById(99999);
      expect(found).toBeDefined();
    });

    it('should update existing entity', () => {
      const allCampaigns = store.campaigns.getAll();
      const campaign = allCampaigns[0];

      const updated = store.campaigns.update(campaign.id, {
        name: 'Updated Campaign Name',
        total_budget: 100000,
      });

      expect(updated.name).toBe('Updated Campaign Name');
      expect(updated.total_budget).toBe(100000);
      expect(updated.id).toBe(campaign.id);
    });

    it('should delete entity', () => {
      const allCampaigns = store.campaigns.getAll();
      const campaign = allCampaigns[0];

      const deleted = store.campaigns.delete(campaign.id);
      expect(deleted).toBe(true);

      const found = store.campaigns.findById(campaign.id);
      expect(found).toBeUndefined();
    });

    it('should throw error when creating duplicate ID', () => {
      const campaign = store.campaigns.getAll()[0];

      expect(() => {
        store.campaigns.create(campaign);
      }).toThrow();
    });

    it('should throw error when updating non-existent entity', () => {
      expect(() => {
        store.campaigns.update(999999, { name: 'Test' });
      }).toThrow();
    });
  });

  describe('Advanced Filtering', () => {
    it('should filter with range queries', () => {
      const result = store.campaigns.find({
        total_budget: { $gte: 10000, $lte: 50000 }
      });

      result.data.forEach(campaign => {
        expect(campaign.total_budget).toBeGreaterThanOrEqual(10000);
        expect(campaign.total_budget).toBeLessThanOrEqual(50000);
      });
    });

    it('should filter with string contains (case-insensitive)', () => {
      const allCampaigns = store.campaigns.getAll();
      const campaign = allCampaigns[0];
      const searchTerm = campaign.name.substring(0, 5).toLowerCase();

      const result = store.campaigns.find({
        name: { $contains: searchTerm }
      });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(c => {
        expect(c.name.toLowerCase()).toContain(searchTerm);
      });
    });

    it('should filter with IN query (array of values)', () => {
      const advertiserIds = [20000, 20001, 20002];

      const result = store.campaigns.find({
        advertiser_id: advertiserIds
      });

      result.data.forEach(campaign => {
        expect(advertiserIds).toContain(campaign.advertiser_id);
      });
    });

    it('should filter with not-equal', () => {
      const result = store.campaigns.find({
        status: { $ne: false }
      });

      result.data.forEach(campaign => {
        expect(campaign.status).not.toBe(false);
      });
    });
  });

  describe('Sorting and Pagination', () => {
    it('should sort results ascending', () => {
      const result = store.campaigns.find(
        {},
        { field: 'id', order: 'asc' }
      );

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].id).toBeGreaterThanOrEqual(result.data[i - 1].id);
      }
    });

    it('should sort results descending', () => {
      const result = store.campaigns.find(
        {},
        { field: 'id', order: 'desc' }
      );

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].id).toBeLessThanOrEqual(result.data[i - 1].id);
      }
    });

    it('should paginate results', () => {
      const pageSize = 10;
      const page1 = store.campaigns.find(
        {},
        undefined,
        { offset: 0, limit: pageSize }
      );

      expect(page1.data.length).toBeLessThanOrEqual(pageSize);
      expect(page1.offset).toBe(0);
      expect(page1.limit).toBe(pageSize);
      expect(page1.total).toBe(100);
      expect(page1.hasMore).toBe(true);

      const page2 = store.campaigns.find(
        {},
        undefined,
        { offset: pageSize, limit: pageSize }
      );

      expect(page2.data.length).toBeLessThanOrEqual(pageSize);
      expect(page2.offset).toBe(pageSize);

      // Ensure different results on different pages
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    });
  });

  describe('Relationship Validation', () => {
    it('should validate all relationships are correct', () => {
      const validation = store.validateRelationships();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect broken relationships', () => {
      // Create a campaign with invalid advertiser_id
      const invalidCampaign = {
        id: 99999,
        name: 'Invalid Campaign',
        advertiser_id: 999999, // Non-existent
        organization_id: 100048,
        agency_id: 10000,
        status: true,
        start_date: '2025-01-01',
        total_budget: 50000,
        goal_type: 'spend' as const,
        timezone: 'America/New_York',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      store.campaigns.create(invalidCampaign);

      const validation = store.validateRelationships();
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('ACME Organization Access Control', () => {
    it('should identify ACME campaigns', () => {
      // Find a campaign belonging to ACME
      const acmeCampaign = store.campaigns.findOne({ organization_id: 100048 });

      if (acmeCampaign) {
        const isAcme = store.isAcmeEntity('campaign', acmeCampaign.id);
        expect(isAcme).toBe(true);
      }
    });

    it('should identify non-ACME campaigns', () => {
      // Find a campaign not belonging to ACME
      const nonAcmeCampaign = store.campaigns.findOne({
        organization_id: { $ne: 100048 }
      });

      if (nonAcmeCampaign) {
        const isAcme = store.isAcmeEntity('campaign', nonAcmeCampaign.id);
        expect(isAcme).toBe(false);
      }
    });

    it('should get ACME organization', () => {
      const acme = store.getAcmeOrganization();

      expect(acme).toBeDefined();
      expect(acme?.id).toBe(100048);
      expect(acme?.name).toBe('ACME Corporation');
    });
  });

  describe('Import/Export', () => {
    it('should export all data', () => {
      const exported = store.exportAll();

      expect(exported.users).toHaveLength(50);
      expect(exported.organizations).toHaveLength(10);
      expect(exported.campaigns).toHaveLength(100);
    });

    it('should import data', () => {
      const exported = store.exportAll();

      // Modify some data
      store.campaigns.delete(exported.campaigns[0].id);
      expect(store.campaigns.count()).toBe(99);

      // Re-import
      store.importAll(exported);
      expect(store.campaigns.count()).toBe(100);
    });

    it('should reset to defaults', () => {
      // Delete some entities
      const campaign = store.campaigns.getAll()[0];
      store.campaigns.delete(campaign.id);
      expect(store.campaigns.count()).toBe(99);

      // Reset
      store.reset();
      expect(store.campaigns.count()).toBe(100);
    });
  });

  describe('Entity Store Operations', () => {
    it('should count entities with filters', () => {
      const total = store.campaigns.count();
      const active = store.campaigns.count({ status: true });

      expect(total).toBe(100);
      expect(active).toBeGreaterThan(0);
      expect(active).toBeLessThanOrEqual(total);
    });

    it('should check entity existence', () => {
      const campaign = store.campaigns.getAll()[0];

      expect(store.campaigns.exists(campaign.id)).toBe(true);
      expect(store.campaigns.exists(999999)).toBe(false);
    });

    it('should find first matching entity', () => {
      const acmeOrg = store.organizations.findOne({ id: 100048 });

      expect(acmeOrg).toBeDefined();
      expect(acmeOrg?.name).toBe('ACME Corporation');
    });

    it('should bulk insert entities', () => {
      store.campaigns.clear();
      expect(store.campaigns.count()).toBe(0);

      const campaigns = [
        {
          id: 99991,
          name: 'Bulk Campaign 1',
          advertiser_id: 20000,
          organization_id: 100048,
          agency_id: 10000,
          status: true,
          start_date: '2025-01-01',
          total_budget: 50000,
          goal_type: 'spend' as const,
          timezone: 'America/New_York',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 99992,
          name: 'Bulk Campaign 2',
          advertiser_id: 20000,
          organization_id: 100048,
          agency_id: 10000,
          status: true,
          start_date: '2025-01-01',
          total_budget: 75000,
          goal_type: 'reach' as const,
          timezone: 'America/New_York',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      store.campaigns.bulkInsert(campaigns);
      expect(store.campaigns.count()).toBe(2);
    });
  });
});
