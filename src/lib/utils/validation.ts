/**
 * Validation Schemas for MediaMath MCP Mock Server
 *
 * Provides Zod schemas for validating tool inputs, pagination parameters,
 * and common data structures.
 */

import { z } from "zod";

/**
 * Pagination input schema
 *
 * Used across all list/find tools for consistent pagination behavior.
 */
export const paginationSchema = z.object({
  pageLimit: z
    .number()
    .int()
    .min(1)
    .max(25)
    .optional()
    .default(25)
    .describe("Maximum number of items to return per page (1-25)"),

  cursor: z
    .string()
    .optional()
    .describe("Base64-encoded cursor from previous response for pagination"),

  sortBy: z
    .string()
    .optional()
    .default("id")
    .describe("Field to sort by. Prefix with '-' for descending order (e.g., '-created_at')"),
});

/**
 * Single ID parameter schema
 */
export const idSchema = z.object({
  id: z
    .union([z.number().int().positive(), z.string()])
    .describe("Entity ID (numeric or string)"),
});

/**
 * Multiple IDs parameter schema
 */
export const idsSchema = z.object({
  ids: z
    .array(z.union([z.number().int().positive(), z.string()]))
    .min(1)
    .max(100)
    .describe("Array of entity IDs (max 100)"),
});

/**
 * Status filter schema
 */
export const statusSchema = z.object({
  status: z
    .boolean()
    .optional()
    .describe("Filter by status: true (active) or false (inactive)"),
});

/**
 * Date range filter schema
 */
export const dateRangeSchema = z.object({
  start_date: z
    .string()
    .datetime()
    .optional()
    .describe("Filter by start date (ISO 8601 format)"),

  end_date: z
    .string()
    .datetime()
    .optional()
    .describe("Filter by end date (ISO 8601 format)"),
});

/**
 * Name search schema with wildcard support
 */
export const nameSearchSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe("Search by name. Supports wildcards (*) for partial matching (e.g., '*test*')"),
});

/**
 * Organization hierarchy filter schema
 */
export const organizationFilterSchema = z.object({
  organization_id: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Filter by organization ID"),

  agency_id: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Filter by agency ID"),

  advertiser_id: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Filter by advertiser ID"),
});

/**
 * User tool schemas
 */
export const findUserSchema = paginationSchema.merge(
  z.object({
    email: z
      .string()
      .email()
      .optional()
      .describe("Filter by email address"),

    role: z
      .enum(["ADMIN", "TRADER", "VIEWER", "DEVELOPER"])
      .optional()
      .describe("Filter by user role"),

    organization_id: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Filter by organization ID"),
  })
);

export const getUserInfoSchema = idSchema;

export const getUserPermissionsSchema = idSchema;

/**
 * Campaign tool schemas
 */
export const findCampaignsSchema = paginationSchema
  .merge(statusSchema)
  .merge(nameSearchSchema)
  .merge(organizationFilterSchema)
  .merge(
    z.object({
      campaign_ids: z
        .array(z.number().int().positive())
        .max(100)
        .optional()
        .describe("Filter by specific campaign IDs (max 100)"),

      goal_type: z
        .enum(["spend", "reach", "cpa", "cpc", "ctr", "viewability"])
        .optional()
        .describe("Filter by campaign goal type"),

      budget_min: z
        .number()
        .min(0)
        .optional()
        .describe("Minimum budget amount"),

      budget_max: z
        .number()
        .min(0)
        .optional()
        .describe("Maximum budget amount"),
    })
  );

export const getCampaignInfoSchema = idSchema;

export const campaignCreateSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    .describe("Campaign name"),

  advertiser_id: z
    .number()
    .int()
    .positive()
    .describe("Advertiser ID this campaign belongs to"),

  start_date: z
    .string()
    .datetime()
    .describe("Campaign start date (ISO 8601 format)"),

  end_date: z
    .string()
    .datetime()
    .optional()
    .describe("Campaign end date (ISO 8601 format, optional for evergreen campaigns)"),

  budget: z
    .number()
    .min(0)
    .describe("Total campaign budget"),

  spend_cap_amount: z
    .number()
    .min(0)
    .optional()
    .describe("Optional daily spend cap"),

  goal_type: z
    .enum(["spend", "reach", "cpa", "cpc", "ctr", "viewability"])
    .default("spend")
    .describe("Campaign goal type"),

  goal_value: z
    .number()
    .min(0)
    .optional()
    .describe("Target value for the goal type"),

  status: z
    .boolean()
    .default(false)
    .describe("Campaign status: true (active) or false (inactive)"),
});

export const campaignUpdateSchema = idSchema.merge(
  z.object({
    name: z.string().min(1).max(255).optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    budget: z.number().min(0).optional(),
    spend_cap_amount: z.number().min(0).optional(),
    goal_type: z
      .enum(["spend", "reach", "cpa", "cpc", "ctr", "viewability"])
      .optional(),
    goal_value: z.number().min(0).optional(),
    status: z.boolean().optional(),
  })
);

/**
 * Strategy tool schemas
 */
export const findStrategiesSchema = paginationSchema
  .merge(statusSchema)
  .merge(nameSearchSchema)
  .merge(
    z.object({
      campaign_id: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Filter by campaign ID"),

      strategy_ids: z
        .array(z.number().int().positive())
        .max(100)
        .optional()
        .describe("Filter by specific strategy IDs (max 100)"),

      type: z
        .enum(["display", "video", "native", "audio"])
        .optional()
        .describe("Filter by strategy type"),

      bid_amount_min: z
        .number()
        .min(0)
        .optional()
        .describe("Minimum bid amount (CPM)"),

      bid_amount_max: z
        .number()
        .min(0)
        .optional()
        .describe("Maximum bid amount (CPM)"),
    })
  );

export const getStrategyInfoSchema = idSchema;

export const strategyCreateSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    .describe("Strategy name"),

  campaign_id: z
    .number()
    .int()
    .positive()
    .describe("Campaign ID this strategy belongs to"),

  type: z
    .enum(["display", "video", "native", "audio"])
    .describe("Strategy media type"),

  budget: z
    .number()
    .min(0)
    .describe("Strategy budget"),

  bid_amount: z
    .number()
    .min(0)
    .describe("Bid amount (CPM)"),

  max_bid: z
    .number()
    .min(0)
    .optional()
    .describe("Maximum bid cap (CPM)"),

  pacing_amount: z
    .number()
    .min(0)
    .optional()
    .describe("Daily pacing amount"),

  goal_type: z
    .enum(["cpc", "cpa", "ctr", "vcr", "viewability", "spend"])
    .default("spend")
    .describe("Strategy goal type"),

  goal_value: z
    .number()
    .min(0)
    .optional()
    .describe("Target value for the goal type"),

  status: z
    .boolean()
    .default(false)
    .describe("Strategy status: true (active) or false (inactive)"),
});

export const strategyUpdateSchema = idSchema.merge(
  z.object({
    name: z.string().min(1).max(255).optional(),
    budget: z.number().min(0).optional(),
    bid_amount: z.number().min(0).optional(),
    max_bid: z.number().min(0).optional(),
    pacing_amount: z.number().min(0).optional(),
    goal_type: z
      .enum(["cpc", "cpa", "ctr", "vcr", "viewability", "spend"])
      .optional(),
    goal_value: z.number().min(0).optional(),
    status: z.boolean().optional(),
  })
);

/**
 * Organization hierarchy tool schemas
 */
export const findOrganizationsSchema = paginationSchema
  .merge(statusSchema)
  .merge(nameSearchSchema)
  .merge(
    z.object({
      organization_ids: z
        .array(z.number().int().positive())
        .max(100)
        .optional()
        .describe("Filter by specific organization IDs"),
    })
  );

export const getOrganizationInfoSchema = idSchema;

export const findAgenciesSchema = paginationSchema
  .merge(statusSchema)
  .merge(nameSearchSchema)
  .merge(
    z.object({
      organization_id: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Filter by organization ID"),

      agency_ids: z
        .array(z.number().int().positive())
        .max(100)
        .optional()
        .describe("Filter by specific agency IDs"),
    })
  );

export const getAgencyInfoSchema = idSchema;

export const findAdvertisersSchema = paginationSchema
  .merge(statusSchema)
  .merge(nameSearchSchema)
  .merge(
    z.object({
      organization_id: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Filter by organization ID"),

      agency_id: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Filter by agency ID"),

      advertiser_ids: z
        .array(z.number().int().positive())
        .max(100)
        .optional()
        .describe("Filter by specific advertiser IDs"),

      domain: z
        .string()
        .optional()
        .describe("Filter by advertiser domain"),
    })
  );

export const getAdvertiserInfoSchema = idSchema;

/**
 * Supply/Inventory tool schemas
 */
export const findSupplySourcesSchema = paginationSchema
  .merge(statusSchema)
  .merge(nameSearchSchema)
  .merge(
    z.object({
      supply_source_ids: z
        .array(z.number().int().positive())
        .max(100)
        .optional()
        .describe("Filter by specific supply source IDs"),

      type: z
        .enum(["exchange", "direct", "pmp"])
        .optional()
        .describe("Filter by supply source type"),
    })
  );

export const getSupplySourceInfoSchema = idSchema;

export const findSiteListsSchema = paginationSchema
  .merge(statusSchema)
  .merge(nameSearchSchema)
  .merge(organizationFilterSchema)
  .merge(
    z.object({
      site_list_ids: z
        .array(z.number().int().positive())
        .max(100)
        .optional()
        .describe("Filter by specific site list IDs"),

      list_type: z
        .enum(["whitelist", "blacklist"])
        .optional()
        .describe("Filter by list type"),
    })
  );

export const getSiteListInfoSchema = idSchema;

/**
 * Creative tool schemas
 */
export const findConceptsSchema = paginationSchema
  .merge(statusSchema)
  .merge(nameSearchSchema)
  .merge(organizationFilterSchema)
  .merge(
    z.object({
      concept_ids: z
        .array(z.number().int().positive())
        .max(100)
        .optional()
        .describe("Filter by specific concept IDs"),

      media_type: z
        .enum(["banner", "video", "native", "audio"])
        .optional()
        .describe("Filter by media type"),

      advertiser_id: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Filter by advertiser ID"),
    })
  );

export const getConceptInfoSchema = idSchema;

/**
 * Audience tool schemas
 */
export const findAudienceSegmentsSchema = paginationSchema
  .merge(statusSchema)
  .merge(nameSearchSchema)
  .merge(
    z.object({
      segment_ids: z
        .array(z.number().int().positive())
        .max(100)
        .optional()
        .describe("Filter by specific segment IDs"),

      provider: z
        .string()
        .optional()
        .describe("Filter by data provider"),

      category: z
        .string()
        .optional()
        .describe("Filter by segment category (e.g., 'demographics', 'behavioral')"),
    })
  );

/**
 * Healthcheck schema (no input required)
 */
export const healthcheckSchema = z.object({}).optional();

/**
 * Helper function to validate input against a schema
 *
 * @param schema - Zod schema to validate against
 * @param input - Input data to validate
 * @returns Validation result with parsed data or error
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Helper to format Zod validation errors into human-readable messages
 *
 * @param error - Zod validation error
 * @returns Formatted error message
 */
export function formatValidationError(error: z.ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.join(".");
    return `- ${path || "root"}: ${issue.message}`;
  });

  return `Validation failed:\n${issues.join("\n")}`;
}

/**
 * Type exports for tool input schemas
 */
export type FindUserInput = z.infer<typeof findUserSchema>;
export type GetUserInfoInput = z.infer<typeof getUserInfoSchema>;
export type FindCampaignsInput = z.infer<typeof findCampaignsSchema>;
export type GetCampaignInfoInput = z.infer<typeof getCampaignInfoSchema>;
export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;
export type FindStrategiesInput = z.infer<typeof findStrategiesSchema>;
export type GetStrategyInfoInput = z.infer<typeof getStrategyInfoSchema>;
export type StrategyCreateInput = z.infer<typeof strategyCreateSchema>;
export type StrategyUpdateInput = z.infer<typeof strategyUpdateSchema>;
export type FindOrganizationsInput = z.infer<typeof findOrganizationsSchema>;
export type FindAgenciesInput = z.infer<typeof findAgenciesSchema>;
export type FindAdvertisersInput = z.infer<typeof findAdvertisersSchema>;
export type FindSupplySourcesInput = z.infer<typeof findSupplySourcesSchema>;
export type FindSiteListsInput = z.infer<typeof findSiteListsSchema>;
export type FindConceptsInput = z.infer<typeof findConceptsSchema>;
export type FindAudienceSegmentsInput = z.infer<typeof findAudienceSegmentsSchema>;
