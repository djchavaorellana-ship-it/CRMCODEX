import { query, mutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';

function toDoc(s: any) {
  return {
    entityId:     String(s.id),
    name:         String(s.name ?? ''),
    category:     String(s.category ?? 'Otros'),
    description:  String(s.description ?? ''),
    listPrice:    Number(s.listPrice) || 0,
    internalCost: Number(s.internalCost) || 0,
    active:       s.active !== false,
    notes:        String(s.notes ?? ''),
    updatedAt:    String(s.updatedAt ?? new Date().toISOString()),
  };
}

function fromDoc(d: any) {
  return {
    id:           d.entityId,
    name:         d.name,
    category:     d.category,
    description:  d.description,
    listPrice:    d.listPrice,
    internalCost: d.internalCost,
    active:       d.active,
    notes:        d.notes,
    updatedAt:    d.updatedAt,
  };
}

export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('serviceCatalog').collect();
    return docs.map(fromDoc);
  },
});

export const save = mutation({
  args: { entitiesJson: v.string(), _token: v.optional(v.string()) },
  handler: async (ctx, { entitiesJson, _token }) => {
    if (_token && !(await ctx.runQuery(internal.sessions._verify, { token: _token }))) {
      throw new Error('Sesión inválida o expirada');
    }
    const items: any[] = JSON.parse(entitiesJson);
    const existing = await ctx.db.query('serviceCatalog').collect();
    if (items.length === 0 && existing.length > 0) return;
    const newIds = new Set(items.map((i) => i.id));
    const existingMap = new Map(existing.map((d) => [d.entityId, d]));

    for (const [entityId, doc] of existingMap) {
      if (!newIds.has(entityId)) await ctx.db.delete(doc._id);
    }
    for (const item of items) {
      const doc = toDoc(item);
      const prev = existingMap.get(item.id);
      if (prev) {
        await ctx.db.patch(prev._id, doc);
      } else {
        await ctx.db.insert('serviceCatalog', doc);
      }
    }
  },
});
