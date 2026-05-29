# TOP CRM — Common Workflows

## 1. Onboarding a New Lead from WhatsApp

**Scenario**: A client contacts via WhatsApp about a wedding event.

**Steps**:
1. Log in as Ejecutivo Comercial (or Super Admin)
2. Click "Nuevo lead" button (top bar or sidebar) — triggers `new-lead` action
3. Fill the lead form:
   - Name, phone, email
   - Source: `WhatsApp`
   - Event type: `Boda`
   - Event date, venue, city, guests
   - Services needed (check all applicable)
   - Approximate budget
   - Potential amount (your estimate in MXN)
   - Stage: `Lead nuevo` (default)
   - Priority: `seguimiento` (default) or `caliente` if very interested
   - Notes: key details from the conversation
4. Submit → lead appears in dashboard and pipeline
5. Immediately schedule a follow-up: `schedule-followup` action
   - Action: "Llamada de seguimiento" or "Enviar cotización"
   - Due date: within 24-48 hours
   - Objective: what you want to achieve

**Programmatic equivalent** (browser console):
```js
const s = JSON.parse(localStorage.getItem('top-crm-state-v2'));
const lead = { id: `lead-${crypto.randomUUID()}`, name: 'María García', phone: '55 9988 7766', email: 'maria@gmail.com', source: 'WhatsApp', eventType: 'Boda', eventDate: '2027-04-20', venue: 'Hacienda Los Arcos', city: 'Querétaro', guests: 200, services: ['DJ', 'Audio', 'Iluminacion'], budget: '$40,000 - $60,000', stage: 'Lead nuevo', priority: 'caliente', potential: 55000, owner: 'Alejandro López', ownerUserId: 'user-alejandro', notes: 'Interesada en paquete completo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
s.leads.push(lead);
s.selectedLeadId = lead.id;
localStorage.setItem('top-crm-state-v2', JSON.stringify(s));
location.reload();
```

---

## 2. Creating and Sending a Quote

**Scenario**: Lead is qualified and ready for a formal proposal.

**Steps**:
1. Select the lead from dashboard or leads list
2. Move stage to `Lead calificado` (if not already)
3. Click "Nueva cotizacion" → triggers `new-quote` action
4. In the quote editor (cotizaciones view):
   - Select services from the catalog — this auto-fills name, description, and price
   - **Do NOT invent item names or prices** — use catalog data or user-provided data only
   - Adjust quantities as needed
   - Add custom items only if the user explicitly specifies them
   - Apply discount only if user has `manage_quote_pricing`, otherwise use "Solicitar autorización"
   - Enable IVA if applicable
   - Review validity text and commercial terms
   - Change status to `Enviada` when ready to send
5. Download PDF (`download-quote-pdf`)
6. Send via WhatsApp (`send-whatsapp`) — opens WhatsApp Web, user attaches PDF manually
7. Or send via Email (`send-email`) — opens mailto
8. Move lead stage to `Cotización enviada`
9. Log timeline event: type "Cotización enviada", channel "WhatsApp" or "Email"
10. Schedule follow-up: "Dar seguimiento a cotización enviada" in 2-3 days

**Critical quote rules**:
- Start with catalog `listPrice` for all items — never modify without permission
- Total = subtotal - discount ± IVA(16%)
- When duplicating: increment version, set `current: true` on new, set `current: false` on old — NEVER delete old versions
- Only one version per lead should have `current: true` at a time
- Quote code format: `TOP-YYYYMMDD-###-V#` (e.g., `TOP-20260529-001-V1`)

---

## 3. Full Pipeline Journey to "Cliente cerrado"

**Stage progression and typical actions at each**:

| Stage | Key action |
|-------|-----------|
| Lead nuevo | Qualify: get event details, confirm budget range |
| Información solicitada | Send venue requirements, availability info |
| Lead calificado | Confirm services needed, create quote |
| Cotización enviada | Follow up in 2-3 days, ask for feedback |
| Seguimiento pendiente | Address objections, offer adjustments |
| Negociación | Final price discussion, close terms |
| Apartado pendiente | Confirm deposit/advance payment |
| Cliente cerrado | Deposit received, date blocked |

**IMPORTANT**: Changing stage ≠ changing priority. They are independent. Only exception: moving to "Evento realizado" or "Lead perdido" auto-sets `priority = 'cerrado'` and cancels all open follow-ups.

**To move a lead through stages**:
- Via UI: right-click the lead → "Mover de etapa", or use "Cambiar etapa" button
- Via kanban: drag card to new column (requires `move_leads` permission)
- Programmatically: `lead.stage = 'Negociación'; lead.updatedAt = new Date().toISOString();`

**After closing** (`Cliente cerrado`):
- Lead stays visible in Clientes view and Pipeline
- Update `priority` to `cerrado`
- Create follow-up for event logistics coordination

**Event execution** (`Evento realizado`):
- Move to this stage after the event is completed
- Lead becomes "inactive" — disappears from dashboard active list
- Still visible in Clientes and Reports

---

## 4. Managing User Access and Permissions

**Only Super Administrador (Salvador) can do this.**

**Approving a new user**:
1. New user submits access request via login screen → "Solicitar acceso"
2. Super Admin sees notification in Configuración → "Solicitudes pendientes"
3. Click "Permisos" to customize permissions before approving
4. Set `leadAccess`: `assigned` (default) or `all`
5. Toggle `temporaryAdmin` if they need elevated access temporarily
6. Check individual permissions from the catalog
7. Click "Aprobar" to create the user account

**Editing existing user permissions**:
1. Go to Configuración → "Administración de usuarios"
2. Click "Permisos" next to the user
3. Modify permissions and save

**Default executive permissions**:
```
view_dashboard, view_leads, create_leads, edit_leads, move_leads,
view_pipeline, view_clients, view_quotes, upload_files
```

**What executives CANNOT do by default**:
- delete_leads, view_reports, export_data, view_settings, manage_users, manage_quote_pricing

---

## 5. Discount Authorization Flow

**Scenario**: Ejecutivo needs to apply a discount but lacks `manage_quote_pricing`.

**Steps**:
1. In quote editor, executive sees "No tienes permiso para modificar precios o descuentos"
2. Click "Solicitar autorización de descuento" → triggers `request-discount` action
3. Creates a `discountRequest` with status `pending`
4. Super Admin sees pending requests in Configuración → "Autorizaciones de descuento"
5. Admin reviews: amount, type (fixed/percent), requesting executive, lead
6. Click "Aprobar" → applies the discount to the quote automatically
7. Quote updates with the authorized discount

---

## 6. Reading Dashboard State

**To understand what the dashboard shows**, check these state values:

```js
const s = JSON.parse(localStorage.getItem('top-crm-state-v2'));

// Identify the current user
const user = s.users.find(u => u.id === s.currentUserId);

// Get visible leads (respects lead access rules)
const visibleLeads = user.isSuperAdmin || user.leadAccess === 'all'
  ? s.leads
  : s.leads.filter(l => l.ownerUserId === user.id);

// Active leads (not inactive)
const inactiveStages = ['Evento realizado', 'Lead perdido'];
const activeLeads = visibleLeads.filter(l => !inactiveStages.includes(l.stage));

// Get current follow-up for a lead
function currentFollowUp(leadId) {
  return s.followUps
    .filter(f => f.leadId === leadId && !f.completedAt && !f.canceledAt)
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))[0];
}

// KPIs
const potential = activeLeads.reduce((sum, l) => sum + l.potential, 0);
const closed = visibleLeads.filter(l => l.stage === 'Cliente cerrado');
const sold = closed.reduce((sum, l) => sum + l.potential, 0);
const withFollowUp = activeLeads.filter(l => currentFollowUp(l.id)).length;

console.log({
  activeLeads: activeLeads.length,
  potential: `$${potential.toLocaleString('es-MX')}`,
  closedClients: closed.length,
  sold: `$${sold.toLocaleString('es-MX')}`,
  activeFollowUps: withFollowUp
});
```

---

## 7. Resetting or Clearing Data

**Restore demo data** (returns to seed leads — Mariana Ruiz, Grupo Vértice, Andrea & Luis):
- UI: Configuración → "Restaurar datos demo"
- Programmatic: reload the page after clearing `localStorage.removeItem('top-crm-state-v2')`

**Clear all data** (empty CRM, only admin user remains):
- UI: Configuración → "Borrar todos los datos locales" (requires Super Admin)
- Programmatic: remove from localStorage and reload

Both actions require confirmation dialog and Super Admin role.

---

## 8. Interpreting Follow-Up Status Colors

The app uses color coding on follow-up statuses:

| Status | Condition | Urgency |
|--------|-----------|---------|
| `vencido` | `dueAt` < now, not completed | Critical — overdue |
| `urgente` | `dueAt` < now + 24h | High — due very soon |
| `programado` | `dueAt` > now + 24h | Normal — scheduled |
| `realizado` | `completedAt` is set | Done |

In the dashboard "Prioridad operativa" card, leads are sorted: vencido first, then urgente, then by priority weight.
