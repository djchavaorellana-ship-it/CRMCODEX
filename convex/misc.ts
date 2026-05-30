import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// ─── Discount Requests ────────────────────────────────────────────────────────

function discountToDoc(r: any) {
  const doc: Record<string, any> = {
    entityId:     String(r.id),
    quoteId:      String(r.quoteId ?? ''),
    leadId:       String(r.leadId ?? ''),
    requestedBy:  String(r.requestedBy ?? ''),
    amount:       Number(r.amount) || 0,
    discountType: String(r.discountType ?? 'fixed'),
    reason:       String(r.reason ?? ''),
    status:       String(r.status ?? 'pending'),
    createdAt:    String(r.createdAt ?? new Date().toISOString()),
  };
  if (r.decidedAt) doc.decidedAt = String(r.decidedAt);
  return doc;
}

function discountFromDoc(d: any) {
  return {
    id:           d.entityId,
    quoteId:      d.quoteId,
    leadId:       d.leadId,
    requestedBy:  d.requestedBy,
    amount:       d.amount,
    discountType: d.discountType,
    reason:       d.reason,
    status:       d.status,
    createdAt:    d.createdAt,
    decidedAt:    d.decidedAt ?? '',
  };
}

export const listDiscountRequests = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('discountRequests').collect();
    return docs.map(discountFromDoc);
  },
});

export const saveDiscountRequests = mutation({
  args: { entitiesJson: v.string() },
  handler: async (ctx, { entitiesJson }) => {
    const items: any[] = JSON.parse(entitiesJson);
    const newIds = new Set(items.map((i) => i.id));
    const existing = await ctx.db.query('discountRequests').collect();
    const existingMap = new Map(existing.map((d) => [d.entityId, d]));

    for (const [entityId, doc] of existingMap) {
      if (!newIds.has(entityId)) await ctx.db.delete(doc._id);
    }
    for (const item of items) {
      const doc = discountToDoc(item);
      const prev = existingMap.get(item.id);
      if (prev) {
        await ctx.db.patch(prev._id, doc);
      } else {
        await ctx.db.insert('discountRequests', doc as any);
      }
    }
  },
});

// ─── Access Requests ──────────────────────────────────────────────────────────

function accessToDoc(r: any) {
  const doc: Record<string, any> = {
    entityId:       String(r.id),
    name:           String(r.name ?? ''),
    email:          String(r.email ?? '').toLowerCase().trim(),
    position:       String(r.position ?? ''),
    message:        String(r.message ?? ''),
    status:         String(r.status ?? 'pending'),
    leadAccess:     String(r.leadAccess ?? 'assigned'),
    permissions:    Array.isArray(r.permissions) ? r.permissions : [],
    temporaryAdmin: Boolean(r.temporaryAdmin),
    createdAt:      String(r.createdAt ?? new Date().toISOString()),
  };
  if (r.decidedAt) doc.decidedAt = String(r.decidedAt);
  return doc;
}

function accessFromDoc(d: any) {
  return {
    id:             d.entityId,
    name:           d.name,
    email:          d.email,
    position:       d.position,
    message:        d.message,
    status:         d.status,
    leadAccess:     d.leadAccess,
    permissions:    d.permissions,
    temporaryAdmin: d.temporaryAdmin,
    createdAt:      d.createdAt,
    decidedAt:      d.decidedAt ?? '',
  };
}

export const listAccessRequests = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('accessRequests').collect();
    return docs.map(accessFromDoc);
  },
});

export const saveAccessRequests = mutation({
  args: { entitiesJson: v.string() },
  handler: async (ctx, { entitiesJson }) => {
    const items: any[] = JSON.parse(entitiesJson);
    const newIds = new Set(items.map((i) => i.id));
    const existing = await ctx.db.query('accessRequests').collect();
    const existingMap = new Map(existing.map((d) => [d.entityId, d]));

    for (const [entityId, doc] of existingMap) {
      if (!newIds.has(entityId)) await ctx.db.delete(doc._id);
    }
    for (const item of items) {
      const doc = accessToDoc(item);
      const prev = existingMap.get(item.id);
      if (prev) {
        await ctx.db.patch(prev._id, doc);
      } else {
        await ctx.db.insert('accessRequests', doc as any);
      }
    }
  },
});
