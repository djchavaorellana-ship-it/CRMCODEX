import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

function toDoc(f: any) {
  const doc: Record<string, any> = {
    entityId:   String(f.id),
    leadId:     String(f.leadId ?? ''),
    quoteId:    String(f.quoteId ?? ''),
    name:       String(f.name ?? 'archivo'),
    kind:       String(f.kind ?? 'other'),
    mime:       String(f.mime ?? 'application/octet-stream'),
    uploadedBy: String(f.uploadedBy ?? ''),
    uploadedAt: String(f.uploadedAt ?? new Date().toISOString()),
  };
  // storageId/url: only set if present (Convex File Storage)
  if (f.storageId) doc.storageId = String(f.storageId);
  if (f.url)       doc.url = String(f.url);
  // dataUrl deliberately not persisted
  return doc;
}

function fromDoc(d: any) {
  return {
    id:         d.entityId,
    leadId:     d.leadId,
    quoteId:    d.quoteId,
    name:       d.name,
    kind:       d.kind,
    mime:       d.mime,
    uploadedBy: d.uploadedBy,
    uploadedAt: d.uploadedAt,
    storageId:  d.storageId ?? '',
    url:        d.url ?? '',
  };
}

export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('files').collect();
    return docs.map(fromDoc);
  },
});

export const save = mutation({
  args: { entitiesJson: v.string() },
  handler: async (ctx, { entitiesJson }) => {
    const items: any[] = JSON.parse(entitiesJson);
    const newIds = new Set(items.map((i) => i.id));
    const existing = await ctx.db.query('files').collect();
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
        await ctx.db.insert('files', doc as any);
      }
    }
  },
});
