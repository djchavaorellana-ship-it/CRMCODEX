import { query, mutation } from './_generated/server';
import { internal } from './_generated/api';
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
  args: { entitiesJson: v.string(), _token: v.optional(v.string()) },
  handler: async (ctx, { entitiesJson, _token }) => {
    if (_token && !(await ctx.runQuery(internal.sessions._verify, { token: _token }))) {
      throw new Error('Sesión inválida o expirada');
    }
    const items: any[] = JSON.parse(entitiesJson);
    const existing = await ctx.db.query('followUps').collect();
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
        const update = { ...doc };
        // completedAt is append-only: once set in the DB, no stale sync from
        // any device can clear it (guards against the race where Device B's
        // "cancel open follow-ups on stage change" reaches Convex after
        // Device A's "complete follow-up" already wrote completedAt).
        if (prev.completedAt && !update.completedAt) {
          update.completedAt = prev.completedAt;
        }
        await ctx.db.patch(prev._id, update);
      } else {
        await ctx.db.insert('followUps', doc as any);
      }
    }
  },
});
