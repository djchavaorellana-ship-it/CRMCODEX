import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('users').collect();
    return docs.map((d) => JSON.parse(d.data));
  },
});

export const authenticate = query({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const doc = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email.toLowerCase().trim()))
      .first();
    if (!doc) return null;
    const user = JSON.parse(doc.data);
    if (user.password !== password || user.status !== 'active') return null;
    return user;
  },
});

export const save = mutation({
  args: { entitiesJson: v.string() },
  handler: async (ctx, { entitiesJson }) => {
    const entities: any[] = JSON.parse(entitiesJson);
    const newIds = new Set(entities.map((e) => e.id));
    const existing = await ctx.db.query('users').collect();
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
        await ctx.db.insert('users', {
          entityId: entity.id,
          email,
          data: JSON.stringify(entity),
        });
      }
    }
  },
});
