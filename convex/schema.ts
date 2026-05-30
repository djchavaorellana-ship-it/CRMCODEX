import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  leads: defineTable({
    entityId: v.string(),
    data: v.string(),
  }).index('by_entityId', ['entityId']),

  followUps: defineTable({
    entityId: v.string(),
    leadId: v.string(),
    data: v.string(),
  })
    .index('by_entityId', ['entityId'])
    .index('by_leadId', ['leadId']),

  quotes: defineTable({
    entityId: v.string(),
    leadId: v.string(),
    data: v.string(),
  })
    .index('by_entityId', ['entityId'])
    .index('by_leadId', ['leadId']),

  timelineEvents: defineTable({
    entityId: v.string(),
    leadId: v.string(),
    data: v.string(),
  })
    .index('by_entityId', ['entityId'])
    .index('by_leadId', ['leadId']),

  users: defineTable({
    entityId: v.string(),
    email: v.string(),
    data: v.string(),
  })
    .index('by_entityId', ['entityId'])
    .index('by_email', ['email']),

  serviceCatalog: defineTable({
    entityId: v.string(),
    data: v.string(),
  }).index('by_entityId', ['entityId']),

  files: defineTable({
    entityId: v.string(),
    leadId: v.string(),
    data: v.string(),
  })
    .index('by_entityId', ['entityId'])
    .index('by_leadId', ['leadId']),

  discountRequests: defineTable({
    entityId: v.string(),
    leadId: v.string(),
    data: v.string(),
  })
    .index('by_entityId', ['entityId'])
    .index('by_leadId', ['leadId']),

  accessRequests: defineTable({
    entityId: v.string(),
    email: v.string(),
    data: v.string(),
  })
    .index('by_entityId', ['entityId'])
    .index('by_email', ['email']),
});
