import { query, mutation, action } from './_generated/server';
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

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    if (!storageId) return null;
    return await ctx.storage.getUrl(storageId);
  },
});

export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('files').collect();
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
    const existing = await ctx.db.query('files').collect();
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
        await ctx.db.insert('files', doc as any);
      }
    }
  },
});
