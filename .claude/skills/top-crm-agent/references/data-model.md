# TOP CRM — Data Model Reference

## Lead Entity

```ts
{
  id: string                  // "lead-{uuid}"
  name: string                // Full name or company name
  phone: string               // "55 1234 5678"
  email: string               // lowercase, trimmed
  source: string              // WhatsApp|Instagram|Facebook|Google|Recomendado|Wedding Planner|Venue|Cliente anterior
  eventType: string           // Boda|XV anos|Empresarial|Posada|Cumpleanos|Graduacion|Otro
  eventDate: string           // "YYYY-MM-DD"
  venue: string               // Venue/location name
  city: string
  guests: number
  services: string[]          // subset of: DJ|Audio|Iluminacion|Pantalla LED|Pista|Efectos especiales|Planta de luz|Produccion completa
  budget: string              // Menos de $20,000|$20,000 - $40,000|$40,000 - $60,000|Mas de $60,000|No definido
  stage: string               // one of the 10 pipeline stages
  priority: string            // caliente|urgente|riesgo|seguimiento|tibio|bajo|cerrado
  potential: number           // estimated deal value in MXN
  owner: string               // Display name of assigned executive
  ownerUserId: string         // "user-{id}" — links to User
  notes: string
  createdAt: string           // ISO datetime
  updatedAt: string           // ISO datetime
}
```

## FollowUp Entity

```ts
{
  id: string                  // "followup-{uuid}"
  leadId: string              // Links to Lead
  action: string              // "Llamada de seguimiento", "Enviar propuesta", etc.
  dueAt: string               // ISO datetime "2026-06-01T10:00"
  objective: string           // Internal note about the goal
  assignedTo: string          // Display name
  createdAt: string
  completedAt: string         // "" if pending, ISO datetime if done
  canceledAt: string          // "" if active, ISO datetime if canceled
}
```

Active follow-up = `!completedAt && !canceledAt`, sorted by `dueAt` ascending, earliest first.

## Quote Entity

```ts
{
  id: string                  // "quote-{uuid}"
  leadId: string
  amount: number              // Computed total (MXN)
  status: string              // Borrador|En revisión|Enviada|Aprobada|Rechazada|Sin respuesta
  codeBase: string            // "TOP-YYMMDD-NNN" auto-assigned
  version: number             // 1-based, increments on duplicate
  services: string[]          // Services mentioned in the quote
  items: QuoteItem[]
  categoryOrder: string[]     // Display order of categories
  discount: number            // Discount amount or percentage
  discountType: string        // "fixed" | "percent"
  ivaEnabled: boolean         // Adds 16% IVA to total
  validity: string            // Validity text
  terms: string               // Commercial terms text
  notes: string
  showValidity: boolean       // Include in PDF
  showTerms: boolean
  showNotes: boolean
  current: boolean            // true = active version for this lead
  createdBy: string           // Display name
  fileId: string              // Linked PDF file ID
  createdAt: string
  updatedAt: string
}
```

### Quote Totals Formula

```js
const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
const discountAmt = discountType === 'percent'
  ? subtotal * (discount / 100)
  : discount;
const afterDiscount = subtotal - discountAmt;
const iva = ivaEnabled ? afterDiscount * 0.16 : 0;
const total = afterDiscount + iva;
```

## QuoteItem Entity

```ts
{
  id: string                  // "quote-item-{uuid}"
  serviceId: string           // "" for custom, or catalog service ID
  category: string            // Audio profesional|Iluminación|Video y pantallas|Producción y staff|Efectos especiales|Otros
  name: string
  description: string
  quantity: number
  unitPrice: number           // MXN
  amount: number              // quantity * unitPrice
}
```

## Service Entity (Service Catalog)

```ts
{
  id: string                  // "svc-{name}"
  name: string
  category: string            // same as QuoteItem categories
  description: string
  listPrice: number           // Public price (MXN)
  internalCost: number        // Internal cost for margin calculation
  active: boolean             // false = hidden from quote editor
  notes: string
  updatedAt: string
}
```

## User Entity

```ts
{
  id: string                  // "user-{name}"
  name: string
  email: string               // lowercase, trimmed
  password: string            // plaintext (no backend yet)
  role: string                // "Super Administrador"|"Administrador temporal"|"Ejecutivo Comercial"
  position: string            // Job title/area
  message: string             // Optional onboarding message
  status: string              // "active"|"inactive"
  temporaryAdmin: boolean
  isSuperAdmin: boolean
  leadAccess: string          // "all"|"assigned"
  permissions: string[]       // from permissionCatalog
  createdAt: string
  approvedAt: string          // "" if pending approval
}
```

## AccessRequest Entity

```ts
{
  id: string                  // "request-{uuid}"
  name: string
  email: string
  password: string
  position: string
  message: string
  status: string              // "pending"|"approved"|"rejected"
  leadAccess: string          // "all"|"assigned"
  permissions: string[]
  temporaryAdmin: boolean
  createdAt: string
  decidedAt: string
}
```

## DiscountRequest Entity

```ts
{
  id: string                  // "discount-{uuid}"
  quoteId: string
  leadId: string
  requestedBy: string         // Display name
  amount: number
  discountType: string        // "fixed"|"percent"
  reason: string
  status: string              // "pending"|"approved"|"rejected"
  createdAt: string
  decidedAt: string
}
```

## File Entity

```ts
{
  id: string                  // "file-{uuid}"
  leadId: string
  quoteId: string             // Optional, links to a quote
  name: string                // Filename with extension
  kind: string                // "PDF"|"Imagen"|"Video"|"Documento"
  mime: string                // MIME type
  uploadedBy: string
  uploadedAt: string
  dataUrl: string             // Base64 data URL (empty = not yet uploaded)
}
```

## TimelineEvent Entity

```ts
{
  id: string                  // "event-{uuid}"
  leadId: string
  type: string                // "Seguimiento realizado"|"Mensaje recibido"|"Cotización enviada"|"Etapa actualizada"|"Lead creado"
  title: string               // Short display title
  preview: string             // One-line summary
  detail: string              // Full detail text
  channel: string             // "WhatsApp"|"Email"|"Llamada"|"Instagram"|"Sistema"
  owner: string               // Who logged this
  date: string                // ISO datetime
  relatedEntityType: string   // Optional: "quote"|"file"
  relatedEntityId: string
}
```

## Full State Schema

```ts
{
  // Persistent fields
  view: string
  leads: Lead[]
  followUps: FollowUp[]
  quotes: Quote[]
  files: File[]
  timelineEvents: TimelineEvent[]
  users: User[]
  accessRequests: AccessRequest[]
  discountRequests: DiscountRequest[]
  serviceCatalog: Service[]
  crmInitialized: boolean
  currentUserId: string | null
  selectedLeadId: string
  selectedQuoteId: string
  activePriority: string
  leadStatusFilter: 'todos'|'activos'|'realizados'|'perdidos'
  pipelineFilter: 'todos'|'activos'|'inactivos'
  search: string
  darkMode: boolean

  // Transient (stripped before saving to localStorage)
  drawer: object | null
  toast: string
  draggingLeadId: string | null
  dismissedUrgentId: string
  contextMenu: object | null
  userMenuOpen: boolean
}
```
