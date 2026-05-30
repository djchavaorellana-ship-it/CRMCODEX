import { query, mutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';

function toDoc(e: any) {
  return {
    entityId:          String(e.id),
    leadId:            String(e.leadId ?? ''),
    type:              String(e.type ?? ''),
    title:             String(e.title ?? ''),
    preview:           String(e.preview ?? ''),
    detail:            String(e.detail ?? ''),
    channel:           String(e.channel ?? 'Sistema'),
    owner:             String(e.owner ?? ''),
    date:              String(e.date ?? e.createdAt ?? new Date().toISOString()),
    relatedEntityType: String(e.relatedEntityType ?? ''),
    relatedEntityId:   String(e.relatedEntityId ?? ''),
  };
}

function fromDoc(d: any) {
  return {
    id:                d.entityId,
    leadId:            d.leadId,
    type:              d.type,
    title:             d.title,
    preview:           d.preview,
    detail:            d.detail,
    channel:           d.channel,
    owner:             d.owner,
    date:              d.date,
    relatedEntityType: d.relatedEntityType,
    relatedEntityId:   d.relatedEntityId,
  };
}

export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('timelineEvents').collect();
    return docs.map(fromDoc);
  },
});

export const save = mutation({
  args: { entitiesJson: v.string(), _token: v.optional(v.string()) },
  handler: async (ctx, { entitiesJson, _token }) => {
    if (_token && !(await ctx.runQuery(internal.sessions._verify, { token: _token }))) {
      throw new Error('Sesión inválida o expirada');
    }
    const events: any[] = JSON.parse(entitiesJson);
    const existing = await ctx.db.query('timelineEvents').collect();
    if (events.length === 0 && existing.length > 0) return;
    const newIds = new Set(events.map((e) => e.id));
    const existingMap = new Map(existing.map((d) => [d.entityId, d]));

    for (const [entityId, doc] of existingMap) {
      if (!newIds.has(entityId)) await ctx.db.delete(doc._id);
    }
    for (const event of events) {
      const doc = toDoc(event);
      const prev = existingMap.get(event.id);
      if (prev) {
        await ctx.db.patch(prev._id, doc);
      } else {
        await ctx.db.insert('timelineEvents', doc);
      }
    }
  },
});
