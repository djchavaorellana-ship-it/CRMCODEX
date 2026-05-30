import { action, mutation, query, internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import bcrypt from 'bcryptjs';

// ─── Internal helpers ────────────────────────────────────────────────────────

export const _getByEntityId = internalQuery({
  args: { entityId: v.string() },
  handler: async (ctx, { entityId }) => {
    return await ctx.db
      .query('users')
      .withIndex('by_entityId', (q) => q.eq('entityId', entityId))
      .first();
  },
});

export const _getByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();
  },
});

export const _upsertWithHash = internalMutation({
  args: {
    entityId:       v.string(),
    name:           v.string(),
    email:          v.string(),
    passwordHash:   v.optional(v.string()),
    role:           v.string(),
    position:       v.string(),
    status:         v.string(),
    isSuperAdmin:   v.boolean(),
    temporaryAdmin: v.boolean(),
    leadAccess:     v.string(),
    permissions:    v.array(v.string()),
    createdAt:      v.string(),
    approvedAt:     v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_entityId', (q) => q.eq('entityId', args.entityId))
      .first();

    const { passwordHash, ...rest } = args;

    if (existing) {
      const update: Record<string, any> = { ...rest };
      // Only set passwordHash if the user doesn't have one yet
      if (passwordHash && !existing.passwordHash) {
        update.passwordHash = passwordHash;
      }
      await ctx.db.patch(existing._id, update);
    } else {
      const doc: Record<string, any> = { ...rest };
      if (passwordHash) doc.passwordHash = passwordHash;
      await ctx.db.insert('users', doc as any);
    }
  },
});

export const _setPasswordHash = internalMutation({
  args: { entityId: v.string(), passwordHash: v.string() },
  handler: async (ctx, { entityId, passwordHash }) => {
    const doc = await ctx.db
      .query('users')
      .withIndex('by_entityId', (q) => q.eq('entityId', entityId))
      .first();
    if (doc) await ctx.db.patch(doc._id, { passwordHash });
  },
});

// ─── Public queries ───────────────────────────────────────────────────────────

// Returns users without passwordHash — safe to expose to clients
export const list = query({
  handler: async (ctx) => {
    const docs = await ctx.db.query('users').collect();
    return docs.map((d) => ({
      id:             d.entityId,
      name:           d.name,
      email:          d.email,
      role:           d.role,
      position:       d.position,
      status:         d.status,
      isSuperAdmin:   d.isSuperAdmin,
      temporaryAdmin: d.temporaryAdmin,
      leadAccess:     d.leadAccess,
      permissions:    d.permissions,
      createdAt:      d.createdAt,
      approvedAt:     d.approvedAt ?? '',
    }));
  },
});

// ─── Auth actions (bcrypt) ────────────────────────────────────────────────────

export const authenticate = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const doc = await ctx.runQuery(internal.users._getByEmail, {
      email: email.toLowerCase().trim(),
    });
    if (!doc || !doc.passwordHash || doc.status !== 'active') return null;
    const valid = await bcrypt.compare(password, doc.passwordHash);
    if (!valid) return null;
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await ctx.runMutation(internal.sessions._create, { entityId: doc.entityId, token, expiresAt });
    return {
      id:             doc.entityId,
      name:           doc.name,
      email:          doc.email,
      role:           doc.role,
      position:       doc.position,
      status:         doc.status,
      isSuperAdmin:   doc.isSuperAdmin,
      temporaryAdmin: doc.temporaryAdmin,
      leadAccess:     doc.leadAccess,
      permissions:    doc.permissions,
      createdAt:      doc.createdAt,
      approvedAt:     doc.approvedAt ?? '',
      sessionToken:   token,
    };
  },
});

export const createUser = action({
  args: {
    entityId:       v.optional(v.string()),
    name:           v.string(),
    email:          v.string(),
    password:       v.string(),
    role:           v.optional(v.string()),
    position:       v.optional(v.string()),
    leadAccess:     v.optional(v.string()),
    permissions:    v.optional(v.array(v.string())),
    isSuperAdmin:   v.optional(v.boolean()),
    temporaryAdmin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const passwordHash = await bcrypt.hash(args.password, 10);
    const id = args.entityId || `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = args.email.toLowerCase().trim();
    await ctx.runMutation(internal.users._upsertWithHash, {
      entityId:       id,
      name:           args.name,
      email,
      passwordHash,
      role:           args.role ?? 'Ejecutivo Comercial',
      position:       args.position ?? '',
      status:         'active',
      isSuperAdmin:   false,  // never accept from untrusted client
      temporaryAdmin: args.temporaryAdmin ?? false,
      leadAccess:     args.leadAccess ?? 'assigned',
      permissions:    args.permissions ?? [],
      createdAt:      new Date().toISOString(),
      approvedAt:     new Date().toISOString(),
    });
    return { id, name: args.name, email };
  },
});

export const changePassword = action({
  args: { entityId: v.string(), oldPassword: v.string(), newPassword: v.string() },
  handler: async (ctx, { entityId, oldPassword, newPassword }) => {
    const doc = await ctx.runQuery(internal.users._getByEntityId, { entityId });
    if (!doc || !doc.passwordHash) throw new Error('No se puede cambiar la contraseña en este momento');
    const valid = await bcrypt.compare(oldPassword, doc.passwordHash);
    if (!valid) throw new Error('Contraseña actual incorrecta');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await ctx.runMutation(internal.users._setPasswordHash, { entityId, passwordHash });
    return { ok: true };
  },
});

// Migrates users from localStorage: hashes plain-text passwords.
// Called once during initial Convex setup.
export const migrateUsers = action({
  args: { usersJson: v.string() },
  handler: async (ctx, { usersJson }) => {
    const users: any[] = JSON.parse(usersJson);
    let migrated = 0;
    for (const user of users) {
      if (!user.id || !user.email) continue;
      const passwordHash = user.password
        ? await bcrypt.hash(String(user.password), 10)
        : undefined;
      await ctx.runMutation(internal.users._upsertWithHash, {
        entityId:       String(user.id),
        name:           String(user.name ?? ''),
        email:          String(user.email).toLowerCase().trim(),
        passwordHash,
        role:           String(user.role ?? 'Ejecutivo Comercial'),
        position:       String(user.position ?? ''),
        status:         String(user.status ?? 'active'),
        isSuperAdmin:   Boolean(user.isSuperAdmin),
        temporaryAdmin: Boolean(user.temporaryAdmin),
        leadAccess:     String(user.leadAccess ?? 'assigned'),
        permissions:    Array.isArray(user.permissions) ? user.permissions : [],
        createdAt:      String(user.createdAt ?? new Date().toISOString()),
        approvedAt:     user.approvedAt ? String(user.approvedAt) : undefined,
      });
      migrated++;
    }
    return { migrated };
  },
});

// ─── Metadata sync (no passwords) ────────────────────────────────────────────

// Syncs user metadata (permissions, role, status…) but NEVER touches passwordHash.
// New users not yet in Convex are skipped — they must be created via createUser action.
export const saveMetadata = mutation({
  args: { entitiesJson: v.string(), _token: v.optional(v.string()) },
  handler: async (ctx, { entitiesJson, _token }) => {
    if (!(await ctx.runQuery(internal.sessions._verify, { token: _token || '' }))) {
      throw new Error('Sesión requerida para actualizar usuarios');
    }
    const users: any[] = JSON.parse(entitiesJson);
    if (users.length === 0) return; // Guard: never wipe all users from a stale sync

    const allExisting = await ctx.db.query('users').collect();
    const newIds = new Set(users.map((u) => u.id));

    // Delete users that are no longer in the list (except Super Admins)
    for (const existing of allExisting) {
      if (!newIds.has(existing.entityId) && !existing.isSuperAdmin) {
        await ctx.db.delete(existing._id);
      }
    }

    // Patch existing users (never create — that requires createUser action with bcrypt)
    for (const user of users) {
      const existing = allExisting.find((e) => e.entityId === user.id);
      if (!existing) continue;
      await ctx.db.patch(existing._id, {
        name:           String(user.name ?? existing.name),
        email:          String(user.email ?? existing.email).toLowerCase().trim(),
        role:           String(user.role ?? existing.role),
        position:       String(user.position ?? existing.position),
        status:         String(user.status ?? existing.status),
        isSuperAdmin:   existing.isSuperAdmin,  // never accept from client
        temporaryAdmin: Boolean(user.temporaryAdmin),
        leadAccess:     String(user.leadAccess ?? existing.leadAccess),
        permissions:    Array.isArray(user.permissions) ? user.permissions : existing.permissions,
        // passwordHash intentionally omitted
      });
    }
  },
});
