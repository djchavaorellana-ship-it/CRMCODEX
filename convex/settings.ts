import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('businessProfile')
      .withIndex('by_key', (q) => q.eq('key', 'default'))
      .first();
  },
});

export const save = mutation({
  args: {
    companyName:           v.optional(v.string()),
    legalName:             v.optional(v.string()),
    phone:                 v.optional(v.string()),
    email:                 v.optional(v.string()),
    website:               v.optional(v.string()),
    address:               v.optional(v.string()),
    rfc:                   v.optional(v.string()),
    defaultQuoteTerms:     v.optional(v.string()),
    defaultValidity:       v.optional(v.string()),
    defaultIvaEnabled:     v.optional(v.boolean()),
    defaultAdvancePercent: v.optional(v.number()),
    bankName:              v.optional(v.string()),
    bankAccount:           v.optional(v.string()),
    bankClabe:             v.optional(v.string()),
    logoUrl:               v.optional(v.string()),
    brandColor:            v.optional(v.string()),
    legalNotes:            v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('businessProfile')
      .withIndex('by_key', (q) => q.eq('key', 'default'))
      .first();
    const data = { ...args, updatedAt: new Date().toISOString() };
    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert('businessProfile', { key: 'default', ...data });
    }
  },
});
