/**
 * Fixtures Index
 * Pre-generated mock data for all entities
 * Run this once to generate fixture files, or use dynamically
 */

import { generateAllData } from '../generator';

// Generate all fixtures with a consistent seed for reproducibility
const FIXTURE_SEED = 42;

export const fixtures = generateAllData(FIXTURE_SEED);

// Export individual entity fixtures
export const users = fixtures.users;
export const organizations = fixtures.organizations;
export const agencies = fixtures.agencies;
export const advertisers = fixtures.advertisers;
export const campaigns = fixtures.campaigns;
export const strategies = fixtures.strategies;
export const supplySources = fixtures.supplySources;
export const siteLists = fixtures.siteLists;
export const concepts = fixtures.concepts;
export const audienceSegments = fixtures.audienceSegments;

// Export default
export default fixtures;
