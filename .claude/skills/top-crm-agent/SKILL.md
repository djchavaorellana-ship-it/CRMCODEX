---
name: top-crm-agent
description: "Operate and manage TOP CRM — the commercial CRM for TOP Producciones, a Mexican premium event production company. Use this skill whenever working with TOP CRM data: reading leads, creating or editing quotes (cotizaciones), scheduling follow-ups (seguimientos), managing the pipeline, interpreting dashboard KPIs, administering users, or understanding the CRM's business logic. Trigger for any task involving leads, cotizaciones, seguimientos, pipeline stages, service catalog, or user permissions in the TOP CRM system. Also trigger for questions like 'how do I add a lead?', 'what does caliente mean?', 'how do I create a quote?', 'who needs follow-up today?', or any reference to TOP Producciones commercial operations."
---

# TOP CRM — Agent Operating Guide

TOP CRM is the commercial operations center for TOP Producciones, a Mexican premium event production company (weddings, quinceañeras, corporate events). It's a vanilla JS + Vite SPA with all state in `localStorage["top-crm-state-v2"]`. No real backend yet — all mutations go to localStorage.

**Quick references:**
- Entity schemas and catalog values → `references/data-model.md`
- Step-by-step operation workflows → `references/workflows.md`

---

## Agent Mindset

Think like a **senior commercial assistant for premium events**, not a data entry operator.

The CRM's core purpose is to ensure no commercial opportunity goes cold. When helping, always prioritize:

1. Overdue follow-ups (vencidos)
2. Hot leads (caliente / urgente)
3. Leads with upcoming events
4. Quotes sent without response (Enviada / Sin respuesta)
5. Leads in negotiation
6. Leads needing deposit confirmation (Apartado pendiente)

The dashboard is a command center ("¿A quién contactar hoy?"), not a reporting tool. It should feel like Linear, Stripe, or Attio — clean, premium, focused on action.

---

## Architecture

```
localStorage["top-crm-state-v2"] = {
  view, leads[], followUps[], quotes[], files[],
  timelineEvents[], users[], accessRequests[],
  discountRequests[], serviceCatalog[], crmInitialized,
  currentUserId, selectedLeadId, selectedQuoteId,
  activePriority, leadStatusFilter, pipelineFilter,
  search, darkMode
}
```

`crmInitialized: true` means the CRM has been set up. Demo data loads only on first install — if the user clears data, it must NOT reappear automatically.

To mutate state programmatically (strip transient fields before saving):
```js
const s = JSON.parse(localStorage.getItem('top-crm-state-v2'));
// ... mutate s ...
const { drawer, toast, draggingLeadId, dismissedUrgentId, contextMenu, userMenuOpen, ...toSave } = s;
localStorage.setItem('top-crm-state-v2', JSON.stringify(toSave));
```

---

## Authentication

| User | Email | Password | Role |
|------|-------|----------|------|
| Salvador Orellana | djchavaorellana@gmail.com | admin123 | Super Administrador |
| Alejandro López | alejandro@topproducciones.com | demo123 | Ejecutivo Comercial |

Google OAuth is **simulated** — shows a toast but doesn't authenticate. Always use email/password.
`currentUserId: null` = logged out (shows auth screen).

---

## Navigation

| View key | Description | Required permission |
|----------|-------------|-------------------|
| `dashboard` | Operational command center — active leads, KPIs, urgent follow-ups | view_dashboard |
| `inbox` | All leads with pending follow-ups | view_dashboard |
| `leads` | Lead list with filters | view_leads |
| `pipeline` | Kanban by stage | view_pipeline |
| `clientes` | Closed clients and completed events | view_clients |
| `cotizaciones` | Quote editor + PDF preview | view_quotes |
| `calendario` | Agenda — follow-ups and event dates | view_dashboard |
| `marketing` | Audience segments for campaigns | view_reports |
| `reportes` | KPIs and commercial intelligence | view_reports |
| `usuarios` | User management (Super Admin only) | manage_users |
| `configuracion` | Preferences and service catalog | view_settings |

---

## Roles and Permissions

### Roles
- **Super Administrador** (`isSuperAdmin: true`): full access, sees ALL leads. Salvador Orellana. Cannot lose critical permissions.
- **Administrador temporal** (`temporaryAdmin: true`): configurable elevated permissions, granted by Super Admin
- **Ejecutivo Comercial**: restricted, only sees leads where `lead.ownerUserId === user.id`

### Permissions
```
view_dashboard    view_leads       create_leads     edit_leads
delete_leads      move_leads       view_pipeline    view_clients
view_quotes       upload_files     view_reports     export_data
view_settings     manage_users     manage_quote_pricing
```

Executive defaults: `view_dashboard, view_leads, create_leads, edit_leads, move_leads, view_pipeline, view_clients, view_quotes, upload_files`

Executives **cannot** by default: `delete_leads, view_reports, export_data, view_settings, manage_users, manage_quote_pricing`

---

## Pipeline Stages

Active stages (appear in dashboard):
1. Lead nuevo
2. Información solicitada
3. Lead calificado
4. Cotización enviada
5. Seguimiento pendiente
6. Negociación
7. Apartado pendiente
8. Cliente cerrado

Inactive stages (excluded from dashboard, still visible in Leads/Pipeline/Reports):
9. Evento realizado
10. Lead perdido

**Stage transition rules:**
- Moving to "Evento realizado" or "Lead perdido" → auto-set `priority = 'cerrado'` + cancel all open follow-ups (`canceledAt = now`)
- If a lead returns to an active stage, it reappears on the dashboard
- Stage and priority are **independent fields** — changing stage does NOT change priority, except the rule above

---

## Priority System

| Key | Label | Commercial meaning |
|-----|-------|-------------------|
| `caliente` | Caliente | High close probability, very interested |
| `urgente` | Urgente | Imminent decision or close event date |
| `riesgo` | Riesgo | At risk of being lost without immediate action |
| `seguimiento` | Seguimiento | Normal follow-up process |
| `tibio` | Tibio | Medium engagement, medium potential |
| `bajo` | Bajo | Low interest, low priority |
| `cerrado` | CERRADO | No active commercial operations needed |

Dashboard sort order: vencido > urgente > caliente > riesgo > seguimiento > tibio > bajo > cerrado

**Never lower a hot lead's priority without explicit user confirmation.**

---

## Key Business Rules

1. **Lead visibility**: Executives see only their assigned leads. Super Admin sees all.
2. **Quote code format**: `TOP-YYYYMMDD-###-V#` — e.g., `TOP-20260529-001-V1`. codeBase + version shown as `TOP-20260529-001 v1`.
3. **Quote versions**: Multiple versions per lead allowed. Only one should have `current: true`. Duplicating a quote increments the version — do NOT delete previous versions.
4. **Discount authorization**: Users without `manage_quote_pricing` must request discount approval. Super Admin approves via `discountRequests`.
5. **Active follow-up**: Earliest non-completed, non-canceled follow-up (sorted by `dueAt` ascending).
6. **IVA**: Optional 16% — toggle `ivaEnabled` on the quote.
7. **Service catalog integrity**: If a service has been used in a quote, mark it `active: false` instead of deleting it.
8. **Timeline logging**: Every significant action should create a `timelineEvent`. See timeline section below.

---

## Timeline Events

Log a `timelineEvent` for every significant change:

| Trigger | type | channel |
|---------|------|---------|
| Lead created | `Lead creado` | Sistema |
| Stage changed | `Etapa actualizada` | Sistema |
| Priority changed | `Prioridad actualizada` | Sistema |
| Follow-up scheduled | `Seguimiento agendado` | Sistema |
| Follow-up completed | `Seguimiento realizado` | Llamada/WhatsApp/Email |
| Quote created | `Cotización creada` | Sistema |
| Quote updated | `Cotización actualizada` | Sistema |
| Quote sent via WhatsApp | `Cotización enviada` | WhatsApp |
| PDF downloaded | `PDF descargado` | Sistema |
| File uploaded | `Archivo subido` | Sistema |
| Internal note | `Nota interna` | Sistema |

---

## Quote Safety Rules

These rules protect commercial data integrity:

- **Never invent concepts, prices, or services** — use catalog data or what the user explicitly provides
- **Never autocomplete quote items** unless the user selects a service from the catalog
- **Never modify prices or discounts** without `manage_quote_pricing` permission
- **Never delete a previous quote version** when duplicating — only add the new one
- **Only one version per lead should be `current: true`** — deactivate others when setting a new current
- **Pressing Enter** in quote editor fields must NOT create new items (prevent form submission on Enter)
- **Editing item name/description** must preserve the change on save

---

## Agent Behavior Rules

1. Identify whether the task involves: leads, seguimientos, cotizaciones, archivos, usuarios, or configuración
2. Never mix up stage and priority — they are independent
3. Never delete data unless the user explicitly requests it
4. **Prefer moving to "Lead perdido" over deleting** — use delete only for records created by mistake
5. Log all important changes to the timeline
6. Keep quotes linked to the correct lead
7. Maintain a clean, chronological history
8. Avoid fictional data — never invent names, amounts, venues, or services
9. Prioritize stability over adding new features
10. When suggesting actions, frame them as commercial opportunities, not admin tasks

---

## Commercial Security Rules

- **Never assume a lead is lost** without explicit confirmation from the user
- **Never lower a hot lead's priority** (caliente/urgente) without a reason
- **Never delete a real lead** as a normal workflow — deletion is for records created by mistake
- **Never modify prices or discounts** without proper authorization
- **Never invent amounts, services, or commercial conditions** on a quote
- **Never create demo quotes or test data** unless the user specifically asks for it

---

## CRUD Operations

### Create a Lead

```js
const newLead = {
  id: `lead-${crypto.randomUUID()}`,
  name: 'Cliente Nombre',
  phone: '55 1234 5678',
  email: 'correo@ejemplo.com',
  source: 'WhatsApp',           // WhatsApp|Instagram|Facebook|Google|Recomendado|Wedding Planner|Venue|Cliente anterior
  eventType: 'Boda',            // Boda|XV anos|Empresarial|Posada|Cumpleanos|Graduacion|Otro
  eventDate: '2027-03-15',
  venue: 'Nombre del lugar',
  city: 'Ciudad',
  guests: 150,
  services: ['DJ', 'Audio'],    // DJ|Audio|Iluminacion|Pantalla LED|Pista|Efectos especiales|Planta de luz|Produccion completa
  budget: '$40,000 - $60,000',
  stage: 'Lead nuevo',
  priority: 'seguimiento',
  potential: 50000,
  owner: 'Alejandro López',
  ownerUserId: 'user-alejandro',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
// After pushing, log: timelineEvent type "Lead creado"
```

### Move a Lead to Inactive Stage

```js
lead.stage = 'Lead perdido'; // or 'Evento realizado'
lead.priority = 'cerrado';   // Always auto-set when going inactive
lead.updatedAt = new Date().toISOString();
// Cancel all open follow-ups for this lead:
state.followUps
  .filter(f => f.leadId === lead.id && !f.completedAt && !f.canceledAt)
  .forEach(f => { f.canceledAt = new Date().toISOString(); });
// Log: timelineEvent type "Etapa actualizada"
```

### Create a Follow-Up

```js
const followUp = {
  id: `followup-${crypto.randomUUID()}`,
  leadId: 'lead-xxx',
  action: 'Llamada de seguimiento',
  dueAt: '2026-06-01T10:00',   // ISO datetime
  objective: 'Confirmar disponibilidad y avanzar cierre',
  assignedTo: 'Alejandro López',
  createdAt: new Date().toISOString(),
  completedAt: '',
  canceledAt: '',
};
// Log: timelineEvent type "Seguimiento agendado"
// To complete: followUp.completedAt = new Date().toISOString()
// Then log: timelineEvent type "Seguimiento realizado"
```

### Create a Quote

```js
const quote = {
  id: `quote-${crypto.randomUUID()}`,
  leadId: 'lead-xxx',
  amount: 0,                    // Computed from items
  status: 'Borrador',           // Borrador|En revisión|Enviada|Aprobada|Rechazada|Sin respuesta
  codeBase: 'TOP-20260529-001', // Auto-assigned; format: TOP-YYYYMMDD-NNN
  version: 1,
  services: [],
  items: [],
  categoryOrder: [],
  discount: 0,
  discountType: 'fixed',        // fixed|percent
  ivaEnabled: false,
  validity: '15 dias naturales a partir de la fecha de emision.',
  terms: 'Para apartar fecha se requiere anticipo. El saldo debe liquidarse antes del evento.',
  notes: '',
  showValidity: true,
  showTerms: true,
  showNotes: true,
  current: true,
  createdBy: 'Alejandro López',
  fileId: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
// Log: timelineEvent type "Cotización creada"
```

### Add Quote Item from Service Catalog

```js
const service = state.serviceCatalog.find(s => s.id === 'svc-dj' && s.active);
const item = {
  id: `quote-item-${crypto.randomUUID()}`,
  serviceId: service.id,
  category: service.category,
  name: service.name,
  description: service.description,
  quantity: 1,
  unitPrice: service.listPrice,  // Never modify if user lacks manage_quote_pricing
  amount: service.listPrice,
};
quote.items.push(item);
// Recompute total after every item change
```

### Quote Totals

```js
const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
const discountAmt = discountType === 'percent' ? subtotal * (discount / 100) : discount;
const afterDiscount = subtotal - discountAmt;
const iva = ivaEnabled ? afterDiscount * 0.16 : 0;
const total = afterDiscount + iva;
```

---

## Service Catalog (precios de lista)

| ID | Nombre | Categoría | Precio lista | Costo interno |
|----|--------|-----------|-------------|--------------|
| svc-dj | DJ profesional | Audio profesional | $18,000 | $9,000 |
| svc-audio | Audio profesional | Audio profesional | $22,000 | $11,000 |
| svc-arq | Iluminación arquitectónica | Iluminación | $16,000 | $7,500 |
| svc-robotica | Iluminación robótica | Iluminación | $24,000 | $12,000 |
| svc-led | Pantalla LED 3x2 | Video y pantallas | $28,000 | $15,000 |
| svc-pista | Pista de baile | Producción y staff | $18,000 | $9,500 |
| svc-chisperos | Chisperos | Efectos especiales | $8,500 | $4,300 |
| svc-humo | Humo bajo | Efectos especiales | $7,500 | $3,600 |
| svc-confeti | Confeti | Efectos especiales | $6,500 | $3,000 |
| svc-planta | Planta de luz | Producción y staff | $14,500 | $7,800 |
| svc-staff | Staff operativo | Producción y staff | $9,500 | $4,800 |
| svc-director | Director técnico | Producción y staff | $12,000 | $6,000 |

---

## Dashboard KPIs

| KPI | Definition |
|-----|-----------|
| Leads activos | count where stage ∉ {Evento realizado, Lead perdido} |
| Monto potencial | sum(potential) for active leads |
| Clientes cerrados | count where stage = 'Cliente cerrado' |
| Monto vendido | sum(potential) for 'Cliente cerrado' leads |
| Seguimientos activos | active leads with a current (non-completed) follow-up |

"Prioridad operativa" sort: vencido → urgente → programado, then by priority weight.

**Follow-up status logic:**
- `vencido`: dueAt < now AND not completed → critical, shown in red
- `urgente`: dueAt < now + 24h → high, shown in orange
- `programado`: dueAt > now + 24h → normal
- `realizado`: completedAt is set

---

## WhatsApp & Email (Current Limitations)

**WhatsApp**: No API connected yet. Current flow:
1. Download quote PDF (`download-quote-pdf`)
2. App opens WhatsApp Web with pre-filled message
3. User manually attaches the PDF

Suggested message template:
> Hola [Nombre], te comparto la cotización [Código] para tu evento. El archivo PDF se descargó automáticamente para que puedas adjuntarlo aquí. Quedo atento a cualquier duda. TOP Producciones.

**Email**: Uses `mailto:` only. No real email provider connected.

---

## Common Workflows

See `references/workflows.md` for detailed guides on:
- Onboarding a new lead from WhatsApp
- Creating and sending a quote
- Full pipeline journey to "Cliente cerrado"
- Managing user access and permissions
- Discount authorization flow
- Reading and interpreting dashboard state programmatically
