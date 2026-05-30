import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

function normalizeItem(item: any) {
  return {
    id:          String(item.id ?? ''),
    serviceId:   String(item.serviceId ?? ''),
    category:    String(item.category ?? ''),
    name:        String(item.name ?? ''),
    description: String(item.description ?? ''),
    quantity:    Number(item.quantity) || 1,
    unitPrice:   Number(item.unitPrice) || 0,
    amount:      Number(item.amount) || 0,
  };
}

function toDoc(q: any) {
  return {
    entityId:      String(q.id),
    leadId:        String(q.leadId ?? ''),
    amount:        Number(q.amount) || 0,
    status:        String(q.status ?? 'Borrador'),
    codeBase:      String(q.codeBase ?? ''),
    version:       Number(q.version) || 1,
    current:       Boolean(q.current),
    services:      Array.isArray(q.services) ? q.services : [],
    items:         Array.isArray(q.items) ? q.items.map(normalizeItem) : [],
    categoryOrder: Array.isArray(q.categoryOrder) ? q.categoryOrder : [],
    discount:      Number(q.discount) || 0,
    discountType:  String(q.discountType ?? 'fixed'),
    ivaEnabled:    Boolean(q.ivaEnabled),
    validity:      String(q.validity ?? ''),
    terms:         String(q.terms ?? ''),
    notes:         String(q.notes ?? ''),
    showValidity:  q.showValidity !== false,
    showTerms:     q.showTerms !== false,
    showNotes:     q.showNotes !== false,
    createdBy:     String(q.createdBy ?? ''),
    fileId:        String(q.fileId ?? ''),
    createdAt:     String(q.createdAt ?? new Date().toISOString()),
    updatedAt:     String(q.updatedAt ?? new Date().toISOString()),
  };
}

function fromDoc(d: any) {
  return {
    id:            d.entityId,
    leadId:        d.leadId,
    amount:        d.amount,
    status:        d.status,
    codeBase:      d.codeBase,
    version:       d.version,
    current:       d.current,
    services:      d.services,
    items:         d.items,
    categoryOrder: d.categoryOrder,
    discount:      d.discount,
    discountType:  d.discountType,
    ivaEnabled:    d.ivaEnabled,
    validity:      d.validity,
    terms:         d.terms,
    notes:         d.notes,
    showValidity:  d.showValidity,
    showTerms:     d.showTerms,
    showNotes:     d.showNotes,
    createdBy:     d.createdBy,
    fileId:        d.fileId,
    createdAt:     d.createdAt,
    updatedAt:     d.updatedAt,
  };
}

export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('quotes').collect();
    return docs.map(fromDoc);
  },
});

export const save = mutation({
  args: { entitiesJson: v.string() },
  handler: async (ctx, { entitiesJson }) => {
    const quotes: any[] = JSON.parse(entitiesJson);
    const newIds = new Set(quotes.map((q) => q.id));
    const existing = await ctx.db.query('quotes').collect();
    const existingMap = new Map(existing.map((d) => [d.entityId, d]));

    for (const [entityId, doc] of existingMap) {
      if (!newIds.has(entityId)) await ctx.db.delete(doc._id);
    }
    for (const quote of quotes) {
      const doc = toDoc(quote);
      const prev = existingMap.get(quote.id);
      if (prev) {
        await ctx.db.patch(prev._id, doc);
      } else {
        await ctx.db.insert('quotes', doc);
      }
    }
  },
});
