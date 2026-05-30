import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('quotes').collect();
    return docs.map((d) => JSON.parse(d.data));
  },
});

export const save = mutation({
  args: { entitiesJson: v.string() },
  handler: async (ctx, { entitiesJson }) => {
    const entities: any[] = JSON.parse(entitiesJson);
    const newIds = new Set(entities.map((e) => e.id));
    const existing = await ctx.db.query('quotes').collect();
    const existingMap = new Map(existing.map((d) => [d.entityId, d]));

    for (const [entityId, doc] of existingMap) {
      if (!newIds.has(entityId)) await ctx.db.delete(doc._id);
    }
    for (const entity of entities) {
      const doc = existingMap.get(entity.id);
      if (doc) {
        await ctx.db.patch(doc._id, { data: JSON.stringify(entity) });
      } else {
        await ctx.db.insert('quotes', {
          entityId: entity.id,
          leadId: entity.leadId || '',
          data: JSON.stringify(entity),
        });
      }
    }
  },
});
