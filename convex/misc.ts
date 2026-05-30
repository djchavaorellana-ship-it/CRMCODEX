import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// --- Discount Requests ---

export const listDiscountRequests = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('discountRequests').collect();
    return docs.map((d) => JSON.parse(d.data));
  },
});

export const saveDiscountRequests = mutation({
  args: { entitiesJson: v.string() },
  handler: async (ctx, { entitiesJson }) => {
    const entities: any[] = JSON.parse(entitiesJson);
    const newIds = new Set(entities.map((e) => e.id));
    const existing = await ctx.db.query('discountRequests').collect();
    const existingMap = new Map(existing.map((d) => [d.entityId, d]));

    for (const [entityId, doc] of existingMap) {
      if (!newIds.has(entityId)) await ctx.db.delete(doc._id);
    }
    for (const entity of entities) {
      const doc = existingMap.get(entity.id);
      if (doc) {
        await ctx.db.patch(doc._id, { data: JSON.stringify(entity) });
      } else {
        await ctx.db.insert('discountRequests', {
          entityId: entity.id,
          leadId: entity.leadId || '',
          data: JSON.stringify(entity),
        });
      }
    }
  },
});

// --- Access Requests ---

export const listAccessRequests = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('accessRequests').collect();
    return docs.map((d) => JSON.parse(d.data));
  },
});

export const saveAccessRequests = mutation({
  args: { entitiesJson: v.string() },
  handler: async (ctx, { entitiesJson }) => {
    const entities: any[] = JSON.parse(entitiesJson);
    const newIds = new Set(entities.map((e) => e.id));
    const existing = await ctx.db.query('accessRequests').collect();
    const existingMap = new Map(existing.map((d) => [d.entityId, d]));

    for (const [entityId, doc] of existingMap) {
      if (!newIds.has(entityId)) await ctx.db.delete(doc._id);
    }
    for (const entity of entities) {
      const doc = existingMap.get(entity.id);
      const email = (entity.email || '').toLowerCase().trim();
      if (doc) {
        await ctx.db.patch(doc._id, { email, data: JSON.stringify(entity) });
      } else {
        await ctx.db.insert('accessRequests', {
          entityId: entity.id,
          email,
          data: JSON.stringify(entity),
        });
      }
    }
  },
});
