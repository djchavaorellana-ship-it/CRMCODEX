import { internalMutation, internalQuery, mutation } from './_generated/server';
import { v } from 'convex/values';

export const _create = internalMutation({
  args: { entityId: v.string(), token: v.string(), expiresAt: v.string() },
  handler: async (ctx, args) => {
    const old = await ctx.db
      .query('sessions')
      .withIndex('by_entityId', (q) => q.eq('entityId', args.entityId))
      .collect();
    for (const s of old) await ctx.db.delete(s._id);
    await ctx.db.insert('sessions', args);
  },
});

export const _verify = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (!token) return null;
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', token))
      .first();
    if (!session) return null;
    if (session.expiresAt < new Date().toISOString()) return null;
    return session.entityId;
  },
});

export const _revoke = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', token))
      .first();
    if (session) await ctx.db.delete(session._id);
  },
});

export const revoke = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', token))
      .first();
    if (session) await ctx.db.delete(session._id);
  },
});
