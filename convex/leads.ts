import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

function toDoc(lead: any) {
  const doc: Record<string, any> = {
    entityId:    String(lead.id),
    name:        String(lead.name ?? ''),
    source:      String(lead.source ?? ''),
    eventType:   String(lead.eventType ?? ''),
    eventDate:   String(lead.eventDate ?? ''),
    venue:       String(lead.venue ?? ''),
    city:        String(lead.city ?? ''),
    guests:      Number(lead.guests) || 0,
    services:    Array.isArray(lead.services) ? lead.services : [],
    budget:      String(lead.budget ?? ''),
    stage:       String(lead.stage ?? 'Lead nuevo'),
    priority:    String(lead.priority ?? 'seguimiento'),
    potential:   Number(lead.potential) || 0,
    owner:       String(lead.owner ?? ''),
    ownerUserId: String(lead.ownerUserId ?? ''),
    notes:       String(lead.notes ?? ''),
    createdAt:   String(lead.createdAt ?? new Date().toISOString()),
    updatedAt:   String(lead.updatedAt ?? new Date().toISOString()),
  };
  if (lead.phone) doc.phone = String(lead.phone);
  if (lead.email) doc.email = String(lead.email);
  return doc;
}

function fromDoc(d: any) {
  return {
    id:          d.entityId,
    name:        d.name,
    phone:       d.phone ?? '',
    email:       d.email ?? '',
    source:      d.source,
    eventType:   d.eventType,
    eventDate:   d.eventDate,
    venue:       d.venue,
    city:        d.city,
    guests:      d.guests,
    services:    d.services,
    budget:      d.budget,
    stage:       d.stage,
    priority:    d.priority,
    potential:   d.potential,
    owner:       d.owner,
    ownerUserId: d.ownerUserId,
    notes:       d.notes,
    createdAt:   d.createdAt,
    updatedAt:   d.updatedAt,
  };
}

export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('leads').collect();
    return docs.map(fromDoc);
  },
});

export const save = mutation({
  args: { entitiesJson: v.string() },
  handler: async (ctx, { entitiesJson }) => {
    const leads: any[] = JSON.parse(entitiesJson);
    const newIds = new Set(leads.map((l) => l.id));
    const existing = await ctx.db.query('leads').collect();
    const existingMap = new Map(existing.map((d) => [d.entityId, d]));

    for (const [entityId, doc] of existingMap) {
      if (!newIds.has(entityId)) await ctx.db.delete(doc._id);
    }
    for (const lead of leads) {
      const doc = toDoc(lead);
      const prev = existingMap.get(lead.id);
      if (prev) {
        await ctx.db.patch(prev._id, doc);
      } else {
        await ctx.db.insert('leads', doc as any);
      }
    }
  },
});
