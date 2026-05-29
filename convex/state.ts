import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query('crmState').first();
  },
});

export const save = mutation({
  args: { stateJson: v.string() },
  handler: async (ctx, { stateJson }) => {
    const existing = await ctx.db.query('crmState').first();
    if (existing) {
      await ctx.db.patch(existing._id, { stateJson });
    } else {
      await ctx.db.insert('crmState', { stateJson });
    }
  },
});
