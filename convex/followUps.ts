import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

function toDoc(fu: any) {
  const doc: Record<string, any> = {
    entityId:    String(fu.id),
    leadId:      String(fu.leadId ?? ''),
    action:      String(fu.action ?? ''),
    dueAt:       String(fu.dueAt ?? ''),
    objective:   String(fu.objective ?? ''),
    assignedTo:  String(fu.assignedTo ?? ''),
    createdAt:   String(fu.createdAt ?? new Date().toISOString()),
  };
  if (fu.assignedToUserId) doc.assignedToUserId = String(fu.assignedToUserId);
  if (fu.completedAt)      doc.completedAt = String(fu.completedAt);
  if (fu.canceledAt)       doc.canceledAt = String(fu.canceledAt);
  return doc;
}

function fromDoc(d: any) {
  return {
    id:               d.entityId,
    leadId:           d.leadId,
    action:           d.action,
    dueAt:            d.dueAt,
    objective:        d.objective,
    assignedTo:       d.assignedTo,
    assignedToUserId: d.assignedToUserId ?? '',
    completedAt:      d.completedAt ?? '',
    canceledAt:       d.canceledAt ?? '',
    createdAt:        d.createdAt,
  };
}

export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('followUps').collect();
    return docs.map(fromDoc);
  },
});

export const save = mutation({
  args: { entitiesJson: v.string() },
  handler: async (ctx, { entitiesJson }) => {
    const items: any[] = JSON.parse(entitiesJson);
    const newIds = new Set(items.map((i) => i.id));
    const existing = await ctx.db.query('followUps').collect();
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
        await ctx.db.insert('followUps', doc as any);
      }
    }
  },
});
