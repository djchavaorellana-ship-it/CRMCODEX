import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  crmState: defineTable({
    stateJson: v.string(),
  }),
});
