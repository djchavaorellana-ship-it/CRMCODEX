import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({

  // ─── LEADS ───────────────────────────────────────────────────────────────
  leads: defineTable({
    entityId:    v.string(),
    name:        v.string(),
    phone:       v.optional(v.string()),   // opcional: llega incompleto desde WhatsApp/Instagram
    email:       v.optional(v.string()),   // opcional: no siempre disponible en primer contacto
    source:      v.string(),
    eventType:   v.string(),
    eventDate:   v.string(),
    venue:       v.string(),
    city:        v.string(),
    guests:      v.number(),
    services:    v.array(v.string()),
    budget:      v.string(),
    stage:       v.string(),
    priority:    v.string(),
    potential:   v.number(),
    owner:       v.string(),
    ownerUserId: v.string(),
    notes:       v.string(),
    createdAt:   v.string(),
    updatedAt:   v.string(),
  })
    .index('by_entityId',    ['entityId'])
    .index('by_stage',       ['stage'])
    .index('by_priority',    ['priority'])
    .index('by_ownerUserId', ['ownerUserId'])
    .index('by_eventDate',   ['eventDate'])
    .index('by_source',      ['source'])
    .index('by_eventType',   ['eventType'])
    .index('by_createdAt',   ['createdAt'])
    .index('by_updatedAt',   ['updatedAt'])
    .index('by_owner_stage', ['ownerUserId', 'stage']),

  // ─── FOLLOW-UPS ──────────────────────────────────────────────────────────
  followUps: defineTable({
    entityId:         v.string(),
    leadId:           v.string(),
    action:           v.string(),
    dueAt:            v.string(),
    objective:        v.string(),
    assignedTo:       v.string(),
    assignedToUserId: v.optional(v.string()),
    completedAt:      v.optional(v.string()),
    canceledAt:       v.optional(v.string()),
    createdAt:        v.string(),
  })
    .index('by_entityId',         ['entityId'])
    .index('by_leadId',           ['leadId'])
    .index('by_dueAt',            ['dueAt'])
    .index('by_assignedToUserId', ['assignedToUserId'])
    .index('by_completedAt',      ['completedAt'])
    .index('by_canceledAt',       ['canceledAt'])
    .index('by_lead_due',         ['leadId', 'dueAt']),

  // ─── QUOTES ──────────────────────────────────────────────────────────────
  quotes: defineTable({
    entityId:      v.string(),
    leadId:        v.string(),
    amount:        v.number(),
    status:        v.string(),
    codeBase:      v.string(),
    version:       v.number(),
    current:       v.boolean(),
    services:      v.array(v.string()),
    items:         v.array(v.object({
      id:          v.string(),
      serviceId:   v.string(),
      category:    v.string(),
      name:        v.string(),
      description: v.string(),
      quantity:    v.number(),
      unitPrice:   v.number(),
      amount:      v.number(),
    })),
    categoryOrder: v.array(v.string()),
    discount:      v.number(),
    discountType:  v.string(),
    ivaEnabled:    v.boolean(),
    validity:      v.string(),
    terms:         v.string(),
    notes:         v.string(),
    showValidity:  v.boolean(),
    showTerms:     v.boolean(),
    showNotes:     v.boolean(),
    createdBy:     v.string(),
    fileId:        v.string(),
    createdAt:     v.string(),
    updatedAt:     v.string(),
  })
    .index('by_entityId',     ['entityId'])
    .index('by_leadId',       ['leadId'])
    .index('by_status',       ['status'])
    .index('by_amount',       ['amount'])
    .index('by_codeBase',     ['codeBase'])
    .index('by_current',      ['current'])
    .index('by_createdAt',    ['createdAt'])
    .index('by_updatedAt',    ['updatedAt'])
    .index('by_lead_current', ['leadId', 'current']),

  // ─── TIMELINE EVENTS ─────────────────────────────────────────────────────
  timelineEvents: defineTable({
    entityId:          v.string(),
    leadId:            v.string(),
    type:              v.string(),
    title:             v.string(),
    preview:           v.string(),
    detail:            v.string(),
    channel:           v.string(),
    owner:             v.string(),
    date:              v.string(),
    relatedEntityType: v.string(),
    relatedEntityId:   v.string(),
  })
    .index('by_entityId',  ['entityId'])
    .index('by_leadId',    ['leadId'])
    .index('by_type',      ['type'])
    .index('by_channel',   ['channel'])
    .index('by_date',      ['date'])
    .index('by_lead_date', ['leadId', 'date']),

  // ─── USERS ───────────────────────────────────────────────────────────────
  // passwordHash: bcrypt hash (nunca texto plano).
  // Opcional para permitir usuarios aprobados sin contraseña inicial —
  // no pueden iniciar sesión hasta que el admin asigne una contraseña.
  // Preparado para migrar a Convex Auth: solo agregar campo externalId.
  users: defineTable({
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
  })
    .index('by_entityId', ['entityId'])
    .index('by_email',    ['email'])
    .index('by_status',   ['status']),

  // ─── SERVICE CATALOG ─────────────────────────────────────────────────────
  serviceCatalog: defineTable({
    entityId:     v.string(),
    name:         v.string(),
    category:     v.string(),
    description:  v.string(),
    listPrice:    v.number(),
    internalCost: v.number(),
    active:       v.boolean(),
    notes:        v.string(),
    updatedAt:    v.string(),
  })
    .index('by_entityId', ['entityId'])
    .index('by_category', ['category'])
    .index('by_active',   ['active'])
    .index('by_listPrice', ['listPrice']),

  // ─── FILES ───────────────────────────────────────────────────────────────
  // dataUrl eliminado. storageId/url preparados para Convex File Storage.
  files: defineTable({
    entityId:   v.string(),
    leadId:     v.string(),
    quoteId:    v.string(),
    name:       v.string(),
    kind:       v.string(),
    mime:       v.string(),
    uploadedBy: v.string(),
    uploadedAt: v.string(),
    storageId:  v.optional(v.string()),
    url:        v.optional(v.string()),
  })
    .index('by_entityId',   ['entityId'])
    .index('by_leadId',     ['leadId'])
    .index('by_kind',       ['kind'])
    .index('by_uploadedAt', ['uploadedAt']),

  // ─── DISCOUNT REQUESTS ───────────────────────────────────────────────────
  discountRequests: defineTable({
    entityId:     v.string(),
    quoteId:      v.string(),
    leadId:       v.string(),
    requestedBy:  v.string(),
    amount:       v.number(),
    discountType: v.string(),
    reason:       v.string(),
    status:       v.string(),
    createdAt:    v.string(),
    decidedAt:    v.optional(v.string()),
  })
    .index('by_entityId', ['entityId'])
    .index('by_leadId',   ['leadId'])
    .index('by_quoteId',  ['quoteId'])
    .index('by_status',   ['status'])
    .index('by_createdAt', ['createdAt']),

  // ─── ACCESS REQUESTS ─────────────────────────────────────────────────────
  // password eliminado: el acceso se gestiona por admin, no auto-registro.
  accessRequests: defineTable({
    entityId:       v.string(),
    name:           v.string(),
    email:          v.string(),
    position:       v.string(),
    message:        v.string(),
    status:         v.string(),
    leadAccess:     v.string(),
    permissions:    v.array(v.string()),
    temporaryAdmin: v.boolean(),
    createdAt:      v.string(),
    decidedAt:      v.optional(v.string()),
  })
    .index('by_entityId', ['entityId'])
    .index('by_email',    ['email'])
    .index('by_status',   ['status'])
    .index('by_createdAt', ['createdAt']),

  // ─── SESSIONS ────────────────────────────────────────────────────────────
  // Short-lived tokens created on login, validated in write mutations.
  sessions: defineTable({
    entityId:  v.string(),
    token:     v.string(),
    expiresAt: v.string(),
  })
    .index('by_token',    ['token'])
    .index('by_entityId', ['entityId']),

  // ─── BUSINESS PROFILE ────────────────────────────────────────────────────
  // Singleton: solo existe un documento con key = "default".
  businessProfile: defineTable({
    key:                    v.literal('default'),
    companyName:            v.optional(v.string()),
    legalName:              v.optional(v.string()),
    phone:                  v.optional(v.string()),
    email:                  v.optional(v.string()),
    website:                v.optional(v.string()),
    address:                v.optional(v.string()),
    rfc:                    v.optional(v.string()),
    defaultQuoteTerms:      v.optional(v.string()),
    defaultValidity:        v.optional(v.string()),
    defaultIvaEnabled:      v.optional(v.boolean()),
    defaultAdvancePercent:  v.optional(v.number()),
    bankName:               v.optional(v.string()),
    bankAccount:            v.optional(v.string()),
    bankClabe:              v.optional(v.string()),
    logoUrl:                v.optional(v.string()),
    brandColor:             v.optional(v.string()),
    legalNotes:             v.optional(v.string()),
    updatedAt:              v.optional(v.string()),
  }).index('by_key', ['key']),

});
