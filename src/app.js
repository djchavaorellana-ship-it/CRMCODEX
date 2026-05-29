import './styles.css';

const STORAGE_KEY = 'top-crm-state-v2';
const LEGACY_STORAGE_KEY = 'top-crm-state-v1';

const stages = [
  'Lead nuevo',
  'Información solicitada',
  'Lead calificado',
  'Cotización enviada',
  'Seguimiento pendiente',
  'Negociación',
  'Apartado pendiente',
  'Cliente cerrado',
  'Evento realizado',
  'Lead perdido',
];

const services = ['DJ', 'Audio', 'Iluminacion', 'Pantalla LED', 'Pista', 'Efectos especiales', 'Planta de luz', 'Produccion completa'];
const eventTypes = ['Boda', 'XV anos', 'Empresarial', 'Posada', 'Cumpleanos', 'Graduacion', 'Otro'];
const budgets = ['Menos de $20,000', '$20,000 - $40,000', '$40,000 - $60,000', 'Mas de $60,000', 'No definido'];
const priorities = ['caliente', 'urgente', 'riesgo', 'seguimiento', 'tibio', 'bajo', 'cerrado'];
const stageAliases = { 'Informacion solicitada': 'Información solicitada', 'Cotizacion enviada': 'Cotización enviada', Negociacion: 'Negociación' };
const quoteStatuses = ['Borrador', 'En revisión', 'Enviada', 'Aprobada', 'Rechazada', 'Sin respuesta'];
const quoteStatusAliases = { Vista: 'En revisión', 'En revision': 'En revisión', Aceptada: 'Aprobada' };
const quoteCategories = ['Audio profesional', 'Iluminación', 'Video y pantallas', 'Producción y staff', 'Efectos especiales', 'Otros'];
const TOP_BLUE = '#172f59';

const priorityMeta = {
  caliente: { label: 'Caliente', tone: 'caliente' },
  urgente: { label: 'Urgente', tone: 'urgente' },
  riesgo: { label: 'Riesgo', tone: 'riesgo' },
  seguimiento: { label: 'Seguimiento', tone: 'seguimiento' },
  tibio: { label: 'Tibio', tone: 'tibio' },
  bajo: { label: 'Bajo', tone: 'bajo' },
  cerrado: { label: 'CERRADO', tone: 'cerrado' },
};

const permissionCatalog = [
  ['view_dashboard', 'Ver dashboard'],
  ['view_leads', 'Ver leads'],
  ['create_leads', 'Crear leads'],
  ['edit_leads', 'Editar leads'],
  ['delete_leads', 'Eliminar leads'],
  ['move_leads', 'Mover leads de etapa'],
  ['view_pipeline', 'Ver pipeline'],
  ['view_clients', 'Ver clientes'],
  ['view_quotes', 'Ver cotizaciones'],
  ['upload_files', 'Subir archivos'],
  ['view_reports', 'Ver reportes'],
  ['export_data', 'Exportar información'],
  ['view_settings', 'Ver configuración'],
  ['manage_users', 'Administrar usuarios'],
  ['manage_quote_pricing', 'Puede modificar precios y descuentos'],
];

const allPermissions = permissionCatalog.map(([key]) => key);
const executiveDefaultPermissions = ['view_dashboard', 'view_leads', 'create_leads', 'edit_leads', 'move_leads', 'view_pipeline', 'view_clients', 'view_quotes', 'upload_files'];
const viewPermissions = {
  dashboard: 'view_dashboard',
  inbox: 'view_dashboard',
  leads: 'view_leads',
  pipeline: 'view_pipeline',
  clientes: 'view_clients',
  cotizaciones: 'view_quotes',
  calendario: 'view_dashboard',
  marketing: 'view_reports',
  reportes: 'view_reports',
  usuarios: 'manage_users',
  configuracion: 'view_settings',
};

const followupStatusMeta = {
  programado: { label: 'Programado', tone: 'programado' },
  urgente: { label: 'ATENCIÓN URGENTE', tone: 'urgente' },
  vencido: { label: 'VENCIDO', tone: 'vencido' },
  realizado: { label: 'Realizado', tone: 'realizado' },
};

const today = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());

const seed = createSeedData();
const seedUsers = createSeedUsers();
const defaultState = {
  view: 'dashboard',
  leads: seed.leads,
  followUps: seed.followUps,
  quotes: seed.quotes,
  files: seed.files,
  timelineEvents: seed.timelineEvents,
  users: seedUsers,
  accessRequests: [],
  discountRequests: [],
  serviceCatalog: createSeedServiceCatalog(),
  crmInitialized: true,
  currentUserId: null,
  selectedLeadId: seed.leads[0].id,
  selectedQuoteId: seed.quotes[0]?.id || '',
  activePriority: 'todos',
  leadStatusFilter: 'todos',
  pipelineFilter: 'todos',
  search: '',
  darkMode: false,
  drawer: null,
  toast: '',
  draggingLeadId: null,
  dismissedUrgentId: '',
  contextMenu: null,
  userMenuOpen: false,
};

let state = loadState();
let toastTimer = null;

function createSeedData() {
  const leads = [
    leadEntity({
      id: 'lead-mariana',
      name: 'Mariana Ruiz',
      phone: '55 1234 5678',
      email: 'marianaruiz@gmail.com',
      source: 'WhatsApp',
      eventType: 'Boda',
      eventDate: '2026-10-18',
      venue: 'Hacienda San Miguel',
      city: 'Queretaro',
      guests: 180,
      services: ['DJ', 'Audio', 'Iluminacion', 'Pantalla LED', 'Produccion completa'],
      budget: '$60,000 - $70,000',
      stage: 'Cotización enviada',
      priority: 'caliente',
      potential: 68000,
      notes: 'Interesada en opciones premium. Sensible a calidad de audio e iluminacion.',
      ownerUserId: 'user-alejandro',
      createdAt: '2025-05-12T09:20',
    }),
    leadEntity({
      id: 'lead-vertice',
      name: 'Grupo Vertice',
      phone: '55 9081 4421',
      email: 'eventos@vertice.mx',
      source: 'Instagram',
      eventType: 'Empresarial',
      eventDate: '2026-06-12',
      venue: 'Expo Santa Fe',
      city: 'CDMX',
      guests: 320,
      services: ['Audio', 'Iluminacion', 'Pantalla LED', 'Planta de luz'],
      budget: 'Mas de $60,000',
      stage: 'Negociación',
      priority: 'urgente',
      potential: 92500,
      notes: 'Evento cercano. Requiere cierre rapido para bloquear fecha y produccion.',
      ownerUserId: 'user-alejandro',
      createdAt: '2026-05-20T12:00',
    }),
    leadEntity({
      id: 'lead-andrea-luis',
      name: 'Andrea & Luis',
      phone: '81 4420 1190',
      email: 'planner@bodas.mx',
      source: 'Wedding Planner',
      eventType: 'Boda',
      eventDate: '2027-01-24',
      venue: 'Casa Hyder',
      city: 'Monterrey',
      guests: 240,
      services: ['DJ', 'Audio', 'Iluminacion', 'Pantalla LED', 'Efectos especiales'],
      budget: 'Mas de $60,000',
      stage: 'Seguimiento pendiente',
      priority: 'riesgo',
      potential: 125000,
      notes: 'Planner pidio version mas compacta. Buen potencial si se aterriza alcance.',
      ownerUserId: 'user-alejandro',
      createdAt: '2026-05-10T17:15',
    }),
  ];

  const followUps = [
    followUpEntity({ leadId: 'lead-mariana', action: 'Llamada de seguimiento', dueAt: '2026-05-29T10:00', objective: 'Resolver dudas y avanzar cierre' }),
    followUpEntity({ leadId: 'lead-vertice', action: 'Confirmar disponibilidad', dueAt: '2026-05-28T16:30', objective: 'Bloquear fecha y confirmar anticipo' }),
    followUpEntity({ leadId: 'lead-andrea-luis', action: 'Enviar propuesta ajustada', dueAt: '2026-05-29T12:00', objective: 'Enviar version compacta para planner' }),
  ];

  const files = [
    fileEntity({ leadId: 'lead-mariana', name: 'Cotizacion_MarianaRuiz_V1.pdf', kind: 'PDF', mime: 'application/pdf' }),
    fileEntity({ leadId: 'lead-mariana', name: 'TOP_Evento_Boda_Hacienda.mp4', kind: 'Video', mime: 'video/mp4' }),
    fileEntity({ leadId: 'lead-vertice', name: 'Cotizacion_GrupoVertice_V1.pdf', kind: 'PDF', mime: 'application/pdf' }),
    fileEntity({ leadId: 'lead-andrea-luis', name: 'Cotizacion_AndreaLuis_V1.pdf', kind: 'PDF', mime: 'application/pdf' }),
    fileEntity({ leadId: 'lead-andrea-luis', name: 'Moodboard_Iluminacion.jpg', kind: 'Imagen', mime: 'image/jpeg' }),
  ];

  const quotes = [
    quoteEntity({ leadId: 'lead-mariana', amount: 68000, status: 'En revisión', version: 1, fileId: files[0].id, services: leads[0].services, items: quoteItemsFromServices(leads[0].services, 68000), current: true }),
    quoteEntity({ leadId: 'lead-vertice', amount: 92500, status: 'En revisión', version: 1, fileId: files[2].id, services: leads[1].services, items: quoteItemsFromServices(leads[1].services, 92500), current: true }),
    quoteEntity({ leadId: 'lead-andrea-luis', amount: 125000, status: 'En revisión', version: 1, fileId: files[3].id, services: leads[2].services, items: quoteItemsFromServices(leads[2].services, 125000), current: true }),
  ];

  const timelineEvents = [
    timelineEntity({ leadId: 'lead-mariana', type: 'Seguimiento realizado', title: 'Llamada realizada', preview: 'Resultado: contacto exitoso.', detail: 'Se confirmo recepcion de la cotizacion y pidio ejemplos de iluminacion.', channel: 'Llamada' }),
    timelineEntity({ leadId: 'lead-mariana', type: 'Mensaje recibido', title: 'Mensaje WhatsApp', preview: 'Se envio cotizacion V1 y video del evento.', detail: 'Incluye paquete premium, video de boda en hacienda y vigencia de disponibilidad.', channel: 'WhatsApp' }),
    timelineEntity({ leadId: 'lead-mariana', type: 'Cotización enviada', title: 'Email enviado', preview: 'Envio de propuesta inicial.', detail: 'Correo con PDF, terminos de apartado y servicios incluidos.', channel: 'Email' }),
    timelineEntity({ leadId: 'lead-vertice', type: 'Cotización enviada', title: 'Cotizacion enviada', preview: 'Propuesta empresarial enviada.', detail: 'Se envio alcance de produccion, requerimientos tecnicos y anticipo.', channel: 'Email' }),
    timelineEntity({ leadId: 'lead-vertice', type: 'Mensaje recibido', title: 'Mensaje Instagram', preview: 'Pidio disponibilidad para junio.', detail: 'Lead llego con urgencia por fecha cercana.', channel: 'Instagram' }),
    timelineEntity({ leadId: 'lead-andrea-luis', type: 'Seguimiento realizado', title: 'Seguimiento VIP', preview: 'Planner solicito ajustes.', detail: 'Quiere una version con menos efectos y mayor enfoque en audio e iluminacion.', channel: 'Llamada' }),
    timelineEntity({ leadId: 'lead-andrea-luis', type: 'Cotización enviada', title: 'Cotizacion enviada', preview: 'Propuesta premium enviada.', detail: 'Incluye produccion completa y extras opcionales.', channel: 'Email' }),
  ];

  return { leads, followUps, quotes, files, timelineEvents };
}

function createSeedUsers() {
  return [
    userEntity({
      id: 'user-salvador',
      name: 'Salvador Orellana',
      email: 'djchavaorellana@gmail.com',
      password: 'admin123',
      role: 'Super Administrador',
      isSuperAdmin: true,
      leadAccess: 'all',
      permissions: allPermissions,
      status: 'active',
    }),
    userEntity({
      id: 'user-alejandro',
      name: 'Alejandro López',
      email: 'alejandro@topproducciones.com',
      password: 'demo123',
      role: 'Ejecutivo Comercial',
      leadAccess: 'assigned',
      permissions: executiveDefaultPermissions,
      status: 'active',
    }),
  ];
}

function createSeedServiceCatalog() {
  return [
    ['svc-dj', 'DJ profesional', 'Audio profesional', 'DJ profesional TOP para recepcion, cena y fiesta.', 18000, 9000],
    ['svc-audio', 'Audio profesional', 'Audio profesional', 'Sistema de audio profesional dimensionado al venue.', 22000, 11000],
    ['svc-arq', 'Iluminación arquitectónica', 'Iluminación', 'Iluminacion ambiental y arquitectonica para venue.', 16000, 7500],
    ['svc-robotica', 'Iluminación robótica', 'Iluminación', 'Cabezas moviles y programacion de show.', 24000, 12000],
    ['svc-led', 'Pantalla LED 3x2', 'Video y pantallas', 'Pantalla LED 3x2 con procesador y montaje.', 28000, 15000],
    ['svc-pista', 'Pista de baile', 'Producción y staff', 'Pista de baile modular para evento social.', 18000, 9500],
    ['svc-chisperos', 'Chisperos', 'Efectos especiales', 'Chisperos frios para momentos clave.', 8500, 4300],
    ['svc-humo', 'Humo bajo', 'Efectos especiales', 'Efecto de humo bajo para entrada o primer baile.', 7500, 3600],
    ['svc-confeti', 'Confeti', 'Efectos especiales', 'Lanzamiento de confeti para cierre o entrada.', 6500, 3000],
    ['svc-planta', 'Planta de luz', 'Producción y staff', 'Planta de luz para respaldo operativo.', 14500, 7800],
    ['svc-staff', 'Staff operativo', 'Producción y staff', 'Equipo operativo para montaje, show y desmontaje.', 9500, 4800],
    ['svc-director', 'Director técnico', 'Producción y staff', 'Direccion tecnica y coordinacion de produccion.', 12000, 6000],
  ].map(([id, name, category, description, listPrice, internalCost]) => serviceEntity({ id, name, category, description, listPrice, internalCost, active: true }));
}

function leadEntity(data) {
  return {
    id: data.id || entityId('lead'),
    name: data.name || '',
    phone: data.phone || '',
    email: data.email || '',
    source: data.source || 'WhatsApp',
    eventType: data.eventType || 'Boda',
    eventDate: data.eventDate || '',
    venue: data.venue || '',
    city: data.city || '',
    guests: Number(data.guests || 0),
    services: Array.isArray(data.services) ? data.services : [],
    budget: data.budget || 'No definido',
    stage: stageAliases[data.stage] || data.stage || 'Lead nuevo',
    priority: priorityMeta[data.priority] ? data.priority : 'seguimiento',
    potential: Number(data.potential || 0),
    owner: data.owner || 'Alejandro Lopez',
    ownerUserId: data.ownerUserId || 'user-alejandro',
    notes: data.notes || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

function userEntity(data) {
  const isSuperAdmin = Boolean(data.isSuperAdmin);
  const temporaryAdmin = Boolean(data.temporaryAdmin);
  const permissions = sanitizePermissions(data.permissions || executiveDefaultPermissions).filter((permission) => temporaryAdmin || permission !== 'manage_users');
  return {
    id: data.id || entityId('user'),
    name: data.name || '',
    email: normalizeEmail(data.email),
    password: data.password || '',
    role: isSuperAdmin ? 'Super Administrador' : temporaryAdmin ? 'Administrador temporal' : 'Ejecutivo Comercial',
    position: data.position || data.area || '',
    message: data.message || '',
    status: data.status || 'active',
    temporaryAdmin,
    isSuperAdmin,
    leadAccess: isSuperAdmin ? 'all' : data.leadAccess || 'assigned',
    permissions: isSuperAdmin ? allPermissions : permissions,
    createdAt: data.createdAt || new Date().toISOString(),
    approvedAt: data.approvedAt || '',
  };
}

function accessRequestEntity(data) {
  const temporaryAdmin = Boolean(data.temporaryAdmin);
  return {
    id: data.id || entityId('request'),
    name: data.name || '',
    email: normalizeEmail(data.email),
    password: data.password || '',
    position: data.position || '',
    message: data.message || '',
    status: data.status || 'pending',
    leadAccess: data.leadAccess || 'assigned',
    permissions: sanitizePermissions(data.permissions || executiveDefaultPermissions).filter((permission) => temporaryAdmin || permission !== 'manage_users'),
    temporaryAdmin,
    createdAt: data.createdAt || new Date().toISOString(),
    decidedAt: data.decidedAt || '',
  };
}

function followUpEntity(data) {
  return {
    id: data.id || entityId('followup'),
    leadId: data.leadId,
    action: data.action || data.nextAction || 'Seguimiento comercial',
    dueAt: data.dueAt || data.nextAt || '',
    objective: data.objective || 'Seguimiento comercial',
    assignedTo: data.assignedTo || 'Alejandro Lopez',
    createdAt: data.createdAt || new Date().toISOString(),
    completedAt: data.completedAt || '',
    canceledAt: data.canceledAt || '',
  };
}

function quoteEntity(data) {
  const items = Array.isArray(data.items) && data.items.length
    ? data.items.map(quoteItemEntity)
    : [];
  const amount = quoteTotals({ ...data, items }).total;
  return {
    id: data.id || entityId('quote'),
    leadId: data.leadId,
    amount: Number(data.amount || amount || data.potential || 0),
    status: quoteStatusAliases[data.status] || quoteStatusAliases[data.quoteStatus] || data.status || data.quoteStatus || 'Borrador',
    codeBase: data.codeBase || quoteCodeBase(data.createdAt || new Date().toISOString()),
    version: Number(data.version || 1),
    services: Array.isArray(data.services) ? data.services : [],
    items,
    categoryOrder: Array.isArray(data.categoryOrder) && data.categoryOrder.length ? data.categoryOrder : quoteCategoryNames(items),
    discount: Number(data.discount || 0),
    discountType: data.discountType || 'fixed',
    ivaEnabled: Boolean(data.ivaEnabled),
    validity: data.validity || '15 dias naturales a partir de la fecha de emision.',
    terms: data.terms || 'Para apartar fecha se requiere anticipo. El saldo debe liquidarse antes del evento.',
    notes: data.notes || '',
    showValidity: data.showValidity !== undefined ? Boolean(data.showValidity) : true,
    showTerms: data.showTerms !== undefined ? Boolean(data.showTerms) : true,
    showNotes: data.showNotes !== undefined ? Boolean(data.showNotes) : true,
    current: data.current !== undefined ? Boolean(data.current) : true,
    createdBy: data.createdBy || 'Alejandro Lopez',
    fileId: data.fileId || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

function quoteItemEntity(data) {
  const quantity = Number(data.quantity || 1);
  const unitPrice = Number(data.unitPrice || 0);
  return {
    id: data.id || entityId('quote-item'),
    serviceId: data.serviceId || '',
    category: data.category || 'Otros',
    name: data.name || '',
    description: data.description || '',
    quantity,
    unitPrice,
    amount: Number(data.amount || quantity * unitPrice),
  };
}

function serviceEntity(data) {
  return {
    id: data.id || entityId('svc'),
    name: data.name || '',
    category: data.category || 'Otros',
    description: data.description || '',
    listPrice: Number(data.listPrice || 0),
    internalCost: Number(data.internalCost || 0),
    active: data.active !== undefined ? Boolean(data.active) : true,
    notes: data.notes || '',
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

function discountRequestEntity(data) {
  return {
    id: data.id || entityId('discount'),
    quoteId: data.quoteId,
    leadId: data.leadId,
    requestedBy: data.requestedBy || currentUser()?.name || 'Sistema',
    amount: Number(data.amount || 0),
    discountType: data.discountType || 'fixed',
    reason: data.reason || 'Solicitud de autorizacion de descuento.',
    status: data.status || 'pending',
    createdAt: data.createdAt || new Date().toISOString(),
    decidedAt: data.decidedAt || '',
  };
}

function fileEntity(data) {
  return {
    id: data.id || entityId('file'),
    leadId: data.leadId,
    quoteId: data.quoteId || '',
    name: data.name || 'archivo',
    kind: data.kind || fileKindFromMime(data.mime),
    mime: data.mime || 'application/octet-stream',
    uploadedBy: data.uploadedBy || 'Alejandro Lopez',
    uploadedAt: data.uploadedAt || new Date().toISOString(),
    dataUrl: data.dataUrl || '',
  };
}

function timelineEntity(data) {
  return {
    id: data.id || entityId('event'),
    leadId: data.leadId,
    type: data.type || inferTimelineType(data.title),
    title: data.title || data.type || 'Evento',
    preview: data.preview || '',
    detail: data.detail || '',
    channel: data.channel || 'Sistema',
    owner: data.owner || 'Alejandro Lopez',
    date: data.date || data.createdAt || new Date().toISOString(),
    relatedEntityType: data.relatedEntityType || '',
    relatedEntityId: data.relatedEntityId || '',
  };
}

function entityId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function loadState() {
  const savedV2 = localStorage.getItem(STORAGE_KEY);
  if (savedV2) {
    try {
      return hydrateState(JSON.parse(savedV2));
    } catch {
      return structuredClone(defaultState);
    }
  }

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy) {
    try {
      const migrated = migrateLegacyState(JSON.parse(legacy));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripTransient(migrated)));
      return migrated;
    } catch {
      return structuredClone(defaultState);
    }
  }

  const initial = structuredClone(defaultState);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stripTransient(initial)));
  return initial;
}

function hydrateState(raw) {
  const base = structuredClone(defaultState);
  const leads = Array.isArray(raw.leads) ? raw.leads.map(leadEntity) : base.leads;
  const quotes = assignQuoteCodes(Array.isArray(raw.quotes) ? raw.quotes.map(quoteEntity).filter((item) => item.leadId) : []);
  const users = mergeSeedUsers(Array.isArray(raw.users) ? raw.users.map(userEntity) : base.users);
  const currentUserId = users.some((user) => user.id === raw.currentUserId && user.status === 'active') ? raw.currentUserId : null;
  return {
    ...base,
    ...raw,
    crmInitialized: true,
    leads,
    users,
    accessRequests: Array.isArray(raw.accessRequests) ? raw.accessRequests.map(accessRequestEntity) : [],
    discountRequests: Array.isArray(raw.discountRequests) ? raw.discountRequests.map(discountRequestEntity) : [],
    serviceCatalog: Array.isArray(raw.serviceCatalog) ? raw.serviceCatalog.map(serviceEntity) : base.serviceCatalog,
    followUps: Array.isArray(raw.followUps) ? raw.followUps.map(followUpEntity).filter((item) => item.leadId) : [],
    quotes,
    files: Array.isArray(raw.files) ? raw.files.map(fileEntity).filter((item) => item.leadId) : [],
    timelineEvents: Array.isArray(raw.timelineEvents) ? raw.timelineEvents.map(timelineEntity).filter((item) => item.leadId) : [],
    selectedLeadId: leads.some((lead) => lead.id === raw.selectedLeadId) ? raw.selectedLeadId : leads[0]?.id,
    selectedQuoteId: quotes.some((quote) => quote.id === raw.selectedQuoteId) ? raw.selectedQuoteId : quotes[0]?.id || '',
    currentUserId,
    drawer: null,
    toast: '',
    draggingLeadId: null,
    dismissedUrgentId: '',
    contextMenu: null,
    userMenuOpen: false,
  };
}

function emptyInitializedState() {
  const users = createSeedUsers();
  return {
    ...structuredClone(defaultState),
    leads: [],
    followUps: [],
    quotes: [],
    files: [],
    timelineEvents: [],
    users,
    accessRequests: [],
    discountRequests: [],
    serviceCatalog: [],
    crmInitialized: true,
    currentUserId: users.find((user) => user.isSuperAdmin)?.id || null,
    selectedLeadId: '',
    selectedQuoteId: '',
    activePriority: 'todos',
    leadStatusFilter: 'todos',
    pipelineFilter: 'todos',
    search: '',
    drawer: null,
    toast: 'Datos locales borrados',
    draggingLeadId: null,
    dismissedUrgentId: '',
    contextMenu: null,
    userMenuOpen: false,
  };
}

function migrateLegacyState(raw) {
  if (Array.isArray(raw.followUps) && Array.isArray(raw.timelineEvents)) return hydrateState(raw);
  const migrated = structuredClone(defaultState);
  const legacyLeads = Array.isArray(raw.leads) ? raw.leads : [];
  migrated.leads = legacyLeads.map(leadEntity);
  migrated.followUps = [];
  migrated.quotes = [];
  migrated.files = [];
  migrated.timelineEvents = [];

  legacyLeads.forEach((legacyLead) => {
    const lead = leadEntity(legacyLead);
    (legacyLead.followups || legacyLead.followUps || []).forEach((followup) => migrated.followUps.push(followUpEntity({ ...followup, leadId: lead.id })));
    if (!migrated.followUps.some((item) => item.leadId === lead.id) && (legacyLead.nextAction || legacyLead.nextAt)) {
      migrated.followUps.push(followUpEntity({ leadId: lead.id, action: legacyLead.nextAction, dueAt: legacyLead.nextAt }));
    }
    (legacyLead.files || []).forEach((file) => migrated.files.push(fileEntity({ ...file, leadId: lead.id })));
    (legacyLead.timeline || []).forEach((event) => migrated.timelineEvents.push(timelineEntity({ ...event, leadId: lead.id })));
    const quoteFilesForLead = (legacyLead.files || []).filter((file) => file.kind === 'PDF' || normalize(file.name).includes('cotizacion'));
    migrated.quotes.push(quoteEntity({
      leadId: lead.id,
      amount: legacyLead.potential,
      status: legacyLead.quoteStatus,
      version: Math.max(1, quoteFilesForLead.length),
      services: legacyLead.services,
      fileId: quoteFilesForLead.at(-1)?.id || '',
    }));
  });

  migrated.selectedLeadId = migrated.leads.some((lead) => lead.id === raw.selectedLeadId) ? raw.selectedLeadId : migrated.leads[0]?.id;
  migrated.view = raw.view || 'dashboard';
  migrated.activePriority = raw.activePriority || 'todos';
  migrated.search = raw.search || '';
  migrated.darkMode = Boolean(raw.darkMode);
  return hydrateState(migrated);
}

function stripTransient(nextState) {
  const { drawer, toast, draggingLeadId, dismissedUrgentId, contextMenu, userMenuOpen, ...persistable } = nextState;
  return persistable;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stripTransient(state)));
}

function setState(next) {
  state = { ...state, ...next };
  persist();
  render();
  if (next.toast) {
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setState({ toast: '' }), 3500);
  }
}

function mergeSeedUsers(users) {
  const byId = new Map(users.map((user) => [user.id, user]));
  seedUsers.forEach((seedUser) => {
    const existing = byId.get(seedUser.id);
    byId.set(seedUser.id, existing ? userEntity({ ...existing, ...(seedUser.isSuperAdmin ? { isSuperAdmin: true, permissions: allPermissions, leadAccess: 'all', status: 'active' } : {}) }) : seedUser);
  });
  return [...byId.values()];
}

function assignQuoteCodes(quotes) {
  const seen = new Map();
  return quotes
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((quote) => {
      const dateCode = quoteDateCode(quote.createdAt);
      const key = `${dateCode}-${quote.leadId}`;
      if (!seen.has(key)) {
        const dayCount = [...seen.keys()].filter((item) => item.startsWith(`${dateCode}-`)).length + 1;
        seen.set(key, `TOP-${dateCode}-${String(dayCount).padStart(3, '0')}`);
      }
      return { ...quote, codeBase: quote.codeBase && !quote.codeBase.endsWith('-001') ? quote.codeBase : seen.get(key) };
    });
}

function currentUser() {
  return state.users.find((user) => user.id === state.currentUserId && user.status === 'active') || null;
}

function effectiveRole(user = currentUser()) {
  if (!user) return 'Sin sesión';
  if (user.isSuperAdmin) return 'Super Administrador';
  if (user.temporaryAdmin) return 'Administrador temporal';
  return 'Ejecutivo Comercial';
}

function effectivePermissions(user = currentUser()) {
  if (!user) return [];
  if (user.isSuperAdmin) return allPermissions;
  return sanitizePermissions(user.permissions);
}

function sanitizePermissions(permissions = []) {
  return [...new Set(permissions)].filter((permission) => allPermissions.includes(permission));
}

function can(permission, user = currentUser()) {
  if (!permission) return true;
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  return effectivePermissions(user).includes(permission);
}

function canManageQuotePricing(user = currentUser()) {
  return Boolean(user?.isSuperAdmin || can('manage_quote_pricing', user));
}

function requirePermission(permission) {
  if (can(permission)) return true;
  setState({ toast: 'No tienes permiso para realizar esta acción.', contextMenu: null, drawer: null });
  return false;
}

function canAccessLead(lead, user = currentUser()) {
  if (!user) return false;
  if (user.isSuperAdmin || user.leadAccess === 'all') return true;
  return lead.ownerUserId === user.id;
}

function visibleLeads() {
  return state.leads.filter((lead) => canAccessLead(lead));
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

function selectedLead() {
  return visibleLeads().find((lead) => lead.id === state.selectedLeadId) ?? visibleLeads()[0] ?? state.leads[0];
}

function dashboardLead() {
  const selected = selectedLead();
  if (selected && !isInactiveLead(selected)) return selected;
  return visibleLeads().find((lead) => !isInactiveLead(lead)) ?? selected;
}

function leadFollowUps(leadId) {
  return state.followUps.filter((item) => item.leadId === leadId);
}

function leadQuotes(leadId) {
  return state.quotes.filter((item) => item.leadId === leadId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function leadFiles(leadId) {
  return state.files.filter((item) => item.leadId === leadId);
}

function leadTimelineEvents(leadId) {
  return state.timelineEvents.filter((item) => item.leadId === leadId).sort((a, b) => new Date(a.date) - new Date(b.date));
}

function currentFollowup(leadId) {
  return leadFollowUps(leadId)
    .filter((followup) => !followup.completedAt && !followup.canceledAt)
    .sort((a, b) => new Date(a.dueAt || 8640000000000000) - new Date(b.dueAt || 8640000000000000))[0];
}

function completedFollowups(leadId) {
  return leadFollowUps(leadId).filter((followup) => followup.completedAt);
}

function latestQuote(leadId) {
  return leadQuotes(leadId).find((quote) => quote.current) || leadQuotes(leadId).at(-1);
}

function selectedQuote() {
  const visibleLeadIds = new Set(visibleLeads().map((lead) => lead.id));
  return state.quotes.find((quote) => quote.id === state.selectedQuoteId && visibleLeadIds.has(quote.leadId)) || state.quotes.find((quote) => visibleLeadIds.has(quote.leadId)) || null;
}

function quoteFiles(leadId) {
  return leadFiles(leadId).filter((file) => file.kind === 'PDF' || normalize(file.name).includes('cotizacion')).sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
}

function filteredLeads() {
  return searchFilteredLeads()
    .filter((lead) => matchesLeadStatusFilter(lead))
    .filter((lead) => state.activePriority === 'todos' || lead.priority === state.activePriority);
}

function activeLeads() {
  return searchFilteredLeads().filter((lead) => !isInactiveLead(lead));
}

function matchesLeadStatusFilter(lead) {
  if (state.leadStatusFilter === 'activos') return !isInactiveLead(lead);
  if (state.leadStatusFilter === 'realizados') return lead.stage === 'Evento realizado';
  if (state.leadStatusFilter === 'perdidos') return lead.stage === 'Lead perdido';
  return true;
}

function searchFilteredLeads() {
  const query = normalize(state.search);
  return visibleLeads().filter((lead) => !query || normalize(`${lead.name} ${lead.phone} ${lead.eventType} ${lead.venue} ${lead.stage} ${lead.source}`).includes(query));
}

function dashboardActionLeads() {
  return activeLeads().filter((lead) => state.activePriority === 'todos' || lead.priority === state.activePriority).sort((a, b) => {
    const aFollowup = currentFollowup(a.id);
    const bFollowup = currentFollowup(b.id);
    if (!!aFollowup !== !!bFollowup) return aFollowup ? -1 : 1;
    if (isInactiveLead(a) !== isInactiveLead(b)) return isInactiveLead(a) ? 1 : -1;
    const aStatus = followupStatus(aFollowup);
    const bStatus = followupStatus(bFollowup);
    if (followupStatusWeight(aStatus) !== followupStatusWeight(bStatus)) return followupStatusWeight(aStatus) - followupStatusWeight(bStatus);
    return priorityWeight(a.priority) - priorityWeight(b.priority);
  });
}

function render() {
  const urgentAlert = urgentFollowupAlert();
  document.documentElement.classList.toggle('dark', state.darkMode);
  if (!currentUser()) {
    document.querySelector('#app').innerHTML = authScreen();
    bindAuthEvents();
    return;
  }
  document.querySelector('#app').innerHTML = `
    <div class="shell">
      ${sidebar()}
      <main class="workspace">
        ${topbar()}
        <section class="content">${view()}</section>
      </main>
      ${drawer()}
      ${urgentAlert ? urgentPopup(urgentAlert.lead, urgentAlert.followup) : ''}
      ${contextMenu()}
      ${state.toast ? `<div class="toast">${state.toast}</div>` : ''}
    </div>
  `;
  bindEvents();
}

function sidebar() {
  const groups = [
    ['GENERAL', [['dashboard', '⌁', 'Dashboard'], ['inbox', '◌', 'Inbox'], ['leads', '○', 'Leads'], ['pipeline', '▦', 'Pipeline']]],
    ['COMERCIAL', [['cotizaciones', '□', 'Cotizaciones'], ['clientes', '◇', 'Clientes'], ['reportes', '▥', 'Reportes']]],
    ['ADMINISTRACIÓN', [['usuarios', '◍', 'Usuarios'], ['configuracion', '⚙', 'Configuracion']]],
  ].map(([title, items]) => [title, items.filter(([key]) => can(viewPermissions[key]))]).filter(([, items]) => items.length);
  return `
    <aside class="sidebar">
      <a class="brand" href="#" data-view="dashboard" aria-label="TOP CRM">
        <img class="brand-light" src="/assets/top-logo-light.png" alt="TOP producciones" />
        <img class="brand-dark" src="/assets/top-logo-dark.png" alt="TOP producciones" />
      </a>
      <nav class="nav" aria-label="Navegacion principal">
        ${groups.map(([title, items]) => `<div class="nav-section"><p>${title}</p>${items.map(([key, icon, label]) => `<button class="nav-item ${state.view === key ? 'active' : ''}" data-view="${key}" type="button"><span>${icon}</span>${label}</button>`).join('')}</div>`).join('')}
      </nav>
      ${can('create_leads') ? '<button class="collapse" type="button" data-action="new-lead">+ Nuevo lead</button>' : ''}
    </aside>
  `;
}

function topbar() {
  const user = currentUser();
  return `
    <header class="topbar">
      <button class="icon-button" type="button" aria-label="Abrir menu">☰</button>
      <label class="search"><span>⌕</span><input data-search type="search" value="${escapeHtml(state.search)}" placeholder="Buscar leads, clientes, eventos..." /><kbd>⌘ K</kbd></label>
      <div class="topbar-actions">
        ${can('create_leads') ? '<button class="secondary-button compact" type="button" data-action="new-lead">Nuevo lead</button>' : ''}
        ${can('view_quotes') ? '<button class="secondary-button compact" type="button" data-action="new-quote">Nueva cotizacion</button>' : ''}
        <span class="date">${today}</span>
        <button class="theme-toggle" type="button" data-action="toggle-dark" aria-label="Cambiar modo oscuro"><span>☀</span><span class="toggle-track"><span></span></span><span>☾</span></button>
        <div class="user-menu-wrapper">
          <button class="user user-trigger" type="button" data-action="toggle-user-menu"><span class="avatar">${initials(user.name)}</span><span><strong>${user.name}</strong><small>${effectiveRole(user)}</small></span><span class="chevron">⌄</span></button>
          ${state.userMenuOpen ? userMenu(user) : ''}
        </div>
      </div>
    </header>
  `;
}

function userMenu(user) {
  return `<div class="user-dropdown">
    <button type="button" data-action="profile">Mi perfil</button>
    <button type="button" data-action="change-password">Cambiar contraseña</button>
    <button type="button" data-action="my-permissions">Mis permisos</button>
    ${user.isSuperAdmin ? '<button type="button" data-action="pending-requests">Solicitudes pendientes</button><button type="button" data-action="user-admin">Administración de usuarios</button>' : ''}
    <hr />
    <button type="button" data-action="logout">Cerrar sesión</button>
  </div>`;
}

function authScreen() {
  const isRequest = state.drawer?.type === 'access-request';
  return `<main class="auth-shell">
    <section class="auth-card">
      <div class="auth-brand">
        <img class="brand-light" src="/assets/top-logo-light.png" alt="TOP producciones" />
        <img class="brand-dark" src="/assets/top-logo-dark.png" alt="TOP producciones" />
      </div>
      <p class="eyebrow">TOP CRM</p>
      <h1>${isRequest ? 'Solicitar acceso' : 'Iniciar sesión'}</h1>
      <p class="page-subtitle">${isRequest ? 'Tu usuario quedara pendiente hasta que Salvador apruebe el acceso.' : 'Centro de control comercial de eventos premium.'}</p>
      ${isRequest ? accessRequestForm() : loginForm()}
      ${state.toast ? `<div class="auth-message">${state.toast}</div>` : ''}
    </section>
  </main>`;
}

function loginForm() {
  return `<form class="form auth-form" data-form="login">
    ${input('Correo', 'email', '', true, 'email')}
    ${input('Contraseña', 'password', '', true, 'password')}
    <button class="primary-button" type="submit">Iniciar sesión</button>
    <button class="secondary-button google-button" type="button" data-action="google-login">Continuar con Google</button>
    <button class="link-button centered" type="button" data-action="show-access-request">Solicitar acceso</button>
  </form>`;
}

function accessRequestForm() {
  return `<form class="form auth-form" data-form="access-request">
    ${input('Nombre', 'name', '', true)}
    ${input('Correo', 'email', '', true, 'email')}
    ${input('Contraseña', 'password', '', true, 'password')}
    ${input('Confirmar contraseña', 'confirmPassword', '', true, 'password')}
    ${input('Puesto / área', 'position', '', true)}
    <label class="form-field"><span>Mensaje opcional</span><textarea name="message" rows="3"></textarea></label>
    <button class="primary-button" type="submit">Enviar solicitud</button>
    <button class="link-button centered" type="button" data-action="show-login">Ya tengo acceso</button>
  </form>`;
}

function view() {
  if (!can(viewPermissions[state.view])) {
    window.setTimeout(() => setState({ view: 'dashboard', toast: 'No tienes permiso para realizar esta acción.' }), 0);
    return `<article class="card empty-dashboard"><h2>No tienes permiso para realizar esta acción.</h2></article>`;
  }
  return ({
    dashboard: dashboardView,
    inbox: inboxView,
    leads: leadsView,
    pipeline: pipelineView,
    clientes: clientsView,
    cotizaciones: quotesView,
    calendario: calendarView,
    marketing: marketingView,
    reportes: reportsView,
    usuarios: usersView,
    configuracion: settingsView,
  }[state.view] ?? dashboardView)();
}

function dashboardView() {
  const lead = dashboardLead();
  const actionLeads = dashboardActionLeads().filter((item) => currentFollowup(item.id) && !isInactiveLead(item));
  const won = visibleLeads().filter((item) => item.stage === 'Cliente cerrado');
  const sold = won.reduce((sum, item) => sum + Number(item.potential || 0), 0);
  const active = activeLeads();
  const potential = active.reduce((sum, item) => sum + Number(item.potential || 0), 0);
  const activeFollowups = active.filter((item) => currentFollowup(item.id)).length;
  if (!active.length) {
    return `
      ${pageHead('Centro de control comercial', 'Acciones pendientes hoy', 'Lo que hay que mover antes de que se enfrie.', [['new-lead', 'Nuevo lead']])}
      <article class="card empty-dashboard">
        <h2>No tienes acciones pendientes por ahora.</h2>
        <p>Los leads realizados o perdidos permanecen disponibles en Leads, Pipeline e Historial.</p>
      </article>
    `;
  }
  return `
    ${pageHead('Centro de control comercial', 'Acciones pendientes hoy', 'Lo que hay que mover antes de que se enfrie.', [['new-lead', 'Nuevo lead'], ['schedule-followup', 'Agendar seguimiento'], ['edit-lead', 'Editar lead']])}
    ${priorityFilters()}
    <div class="layout">
      <section class="left-stack">${leadSummary(lead)}${servicesCard(lead)}${quoteCard(lead)}</section>
      <section class="main-stack">
        ${kpiGrid([['Leads activos', active.length], ['Monto potencial', money(potential)], ['Clientes cerrados', won.length], ['Monto vendido', money(sold)], ['Seguimientos activos', activeFollowups]])}
        ${todayActions(actionLeads)}
        ${followupDetail(lead)}
        ${filesCard(lead)}
        ${historyCard(lead)}
      </section>
      <section class="right-stack">${nextFollowup(lead)}${intelligenceCard(lead)}${activityCard(lead)}${remindersCard()}</section>
    </div>
  `;
}

function leadsView() {
  const leads = filteredLeads();
  return `
    ${pageHead('Base comercial', 'Leads', 'Prospectos, clientes y oportunidades en seguimiento.', [['new-lead', 'Nuevo lead'], ['edit-lead', 'Editar seleccionado']])}
    ${leadStatusFilters()}
    ${priorityFilters()}
    <div class="table-card card">
      <div class="table-header"><span>Lead</span><span>Evento</span><span>Etapa</span><span>Prioridad</span><span>Monto</span><span>Proxima accion</span></div>
      ${leads.map((lead) => {
        const followup = currentFollowup(lead.id);
        return `<button class="table-row ${lead.id === state.selectedLeadId ? 'selected' : ''}" type="button" data-select-lead="${lead.id}" data-lead-context="${lead.id}">
          <span><strong>${lead.name}</strong><small>${lead.source} · ${lead.phone}</small></span>
          <span>${lead.eventType}<small>${dateLabel(lead.eventDate)} · ${lead.venue}</small></span>
          <span>${lead.stage}</span><span>${badge(lead.priority)}</span><span><strong>${money(lead.potential)}</strong></span>
          <span>${followup?.action || 'Sin seguimiento'}<small>${datetimeLabel(followup?.dueAt)}</small></span>
        </button>`;
      }).join('')}
    </div>
  `;
}

function pipelineView() {
  const pipelineLeads = searchFilteredLeads().filter((lead) => {
    if (state.pipelineFilter === 'inactivos') return isInactiveLead(lead);
    if (state.pipelineFilter === 'activos') return !isInactiveLead(lead);
    if (state.pipelineFilter === 'todos') return true;
    return true;
  });
  return `
    ${pageHead('Pipeline', 'Kanban comercial', 'Mueve leads entre etapas y conserva el estado en localStorage.', [['new-lead', 'Nuevo lead'], ['change-stage', 'Cambiar etapa']])}
    <div class="priority-filters pipeline-filters" role="group" aria-label="Filtro de pipeline">
      ${[
        ['todos', 'Todos'],
        ['activos', 'Activos'],
        ['inactivos', 'Cerrados / perdidos'],
      ].map(([key, label]) => `<button class="priority-filter ${state.pipelineFilter === key ? 'active' : ''}" type="button" data-pipeline-filter="${key}">${label}</button>`).join('')}
    </div>
    <div class="kanban" data-kanban>
      ${stages.map((stage) => {
        const cards = pipelineLeads.filter((lead) => lead.stage === stage);
        return `<section class="kanban-column" data-stage="${stage}"><header><strong>${stage}</strong><span>${cards.length}</span></header><div class="kanban-dropzone" data-drop-stage="${stage}">${cards.map(kanbanCard).join('')}</div></section>`;
      }).join('')}
    </div>
  `;
}

function clientsView() {
  const clients = searchFilteredLeads().filter((lead) => ['Cliente cerrado', 'Evento realizado'].includes(lead.stage));
  return simpleListView('Clientes', 'Clientes cerrados y eventos realizados.', clients.length ? clients : searchFilteredLeads().filter((lead) => lead.priority === 'caliente'));
}

function quotesView() {
  const quotes = state.quotes.filter((quote) => visibleLeads().some((lead) => lead.id === quote.leadId)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  if (!quotes.length) {
    return `
      ${pageHead('Cotizaciones', 'Modulo de cotizaciones', 'Crea versiones, edita conceptos y comparte propuestas profesionales.', [])}
      <article class="card empty-dashboard quote-empty-state">
        <h2>Todavía no hay cotizaciones.</h2>
        <p>Crea una nueva cotización o selecciona un lead.</p>
        <button class="primary-button compact-primary" type="button" data-action="new-quote">Crear nueva cotización</button>
      </article>
    `;
  }
  const quote = selectedQuote() || quotes[0];
  const lead = state.leads.find((item) => item.id === quote.leadId) || selectedLead();
  return `
    ${pageHead('Cotizaciones', 'Modulo de cotizaciones', 'Crea versiones, edita conceptos y comparte propuestas profesionales.', [['new-quote', 'Nueva cotizacion']])}
    <div class="quote-module">
      <aside class="card quote-sidebar">
        <div class="section-head"><div><div class="card-title">Historial</div><p>Versiones guardadas por lead.</p></div></div>
        <div class="quote-list">${quotes.length ? quotes.map(quoteListItem).join('') : '<div class="empty-panel">Todavia no hay cotizaciones.</div>'}</div>
      </aside>
      <section class="quote-editor-layout">
        <article class="card quote-editor-card">${quoteEditorForm(quote, lead, state.quotes.some((item) => item.id === quote.id))}</article>
        <article class="card quote-preview-card">${quotePreview(quote, lead)}</article>
      </section>
    </div>
  `;
}

function inboxView() {
  const rows = searchFilteredLeads().map((lead) => ({ lead, followup: currentFollowup(lead.id) })).filter(({ followup }) => followup);
  return `${pageHead('Inbox', 'Bandeja comercial', 'Seguimientos y respuestas que requieren atencion.', [['schedule-followup', 'Agendar seguimiento']])}<div class="agenda card">${rows.length ? rows.map(({ lead, followup }) => `<button class="agenda-row" type="button" data-select-lead="${lead.id}"><span class="priority-bar ${followupStatus(followup)}"></span><span><strong>${followup.action}</strong><small>${lead.name} · ${lead.eventType}</small></span><span>${datetimeLabel(followup.dueAt)}</span><span>${followupBadge(followupStatus(followup))}</span></button>`).join('') : '<div class="empty-panel">No hay conversaciones pendientes.</div>'}</div>`;
}

function reportsView() {
  const leads = visibleLeads();
  const won = leads.filter((lead) => ['Cliente cerrado', 'Evento realizado'].includes(lead.stage));
  return `${pageHead('Reportes', 'Inteligencia comercial', 'Resumen operativo sin modificar el dashboard principal.', [])}${kpiGrid([['Leads totales', leads.length], ['Cotizaciones', state.quotes.length], ['Monto potencial', money(leads.reduce((sum, lead) => sum + lead.potential, 0))], ['Clientes / eventos', won.length]])}<div class="cards-grid"><article class="card"><div class="card-title">Leads por fuente</div>${fieldRows([...new Set(leads.map((lead) => lead.source))].map((source) => [source, leads.filter((lead) => lead.source === source).length]))}</article><article class="card"><div class="card-title">Perdidos y realizados</div>${fieldRows([['Evento realizado', leads.filter((lead) => lead.stage === 'Evento realizado').length], ['Lead perdido', leads.filter((lead) => lead.stage === 'Lead perdido').length], ['Cliente cerrado', leads.filter((lead) => lead.stage === 'Cliente cerrado').length]])}</article></div>`;
}

function usersView() {
  if (!currentUser()?.isSuperAdmin) return `<article class="card empty-dashboard"><h2>No tienes permiso para realizar esta acción.</h2></article>`;
  return `${pageHead('Usuarios', 'Administración de usuarios', 'Solicitudes, roles y permisos simulados en localStorage.', [])}<div class="settings-grid">${userRequestsCard()}${usersAdminCard()}</div>`;
}

function calendarView() {
  const scheduled = searchFilteredLeads()
    .map((lead) => ({ lead, followup: currentFollowup(lead.id) }))
    .filter(({ lead, followup }) => followup || lead.eventDate)
    .sort((a, b) => new Date(a.followup?.dueAt || a.lead.eventDate) - new Date(b.followup?.dueAt || b.lead.eventDate));
  return `
    ${pageHead('Agenda', 'Calendario comercial', 'Seguimientos y fechas de evento importantes.', [['schedule-followup', 'Agendar seguimiento']])}
    <div class="agenda card">
      ${scheduled.map(({ lead, followup }) => `<button class="agenda-row" type="button" data-select-lead="${lead.id}">
        <span class="priority-bar ${followupStatus(followup) || lead.priority}"></span>
        <span><strong>${followup?.action || 'Fecha de evento'}</strong><small>${lead.name} · ${lead.stage}</small></span>
        <span>${datetimeLabel(followup?.dueAt)}</span>
        <span>${isUpcoming(lead.eventDate) ? badge('urgente', 'Evento cercano') : dateLabel(lead.eventDate)}</span>
      </button>`).join('')}
    </div>
  `;
}

function marketingView() {
  const leads = visibleLeads();
  return `
    ${pageHead('Marketing', 'Audiencias futuras', 'Segmentos para reactivar leads frios, planners, venues y clientes anteriores.', [])}
    <div class="cards-grid">
      ${[
        ['Leads calientes', leads.filter((lead) => lead.priority === 'caliente').length, 'Campana de cierre y disponibilidad.'],
        ['En riesgo', leads.filter((lead) => lead.priority === 'riesgo').length, 'Seguimiento con prueba social y urgencia suave.'],
        ['WhatsApp', leads.filter((lead) => lead.source === 'WhatsApp').length, 'Segmento de respuesta rapida.'],
        ['Wedding planners', leads.filter((lead) => lead.source === 'Wedding Planner').length, 'Relaciones comerciales y referral.'],
      ].map(([title, count, copy]) => `<article class="card metric-card"><strong>${count}</strong><span>${title}</span><p>${copy}</p></article>`).join('')}
    </div>
  `;
}

function settingsView() {
  return `
    ${pageHead('Configuracion', 'Preferencias del CRM', 'Base normalizada lista para base de datos, login, WhatsApp e IA.', [])}
    <div class="settings-grid">
      <article class="card"><div class="card-title">Modelo de datos</div>${fieldRows([['Leads', state.leads.length], ['Seguimientos', state.followUps.length], ['Cotizaciones', state.quotes.length], ['Archivos', state.files.length], ['Eventos timeline', state.timelineEvents.length]])}</article>
      <article class="card"><div class="card-title">Apariencia</div><button class="secondary-button" type="button" data-action="toggle-dark">${state.darkMode ? 'Usar modo claro' : 'Usar modo oscuro'}</button></article>
      <article class="card"><div class="card-title">Datos locales</div><p>Las entidades estan separadas por ID y vinculadas con leadId. Despues pueden ir directo a tablas reales.</p><div class="card-actions"><button class="secondary-button compact danger" type="button" data-action="reset-data">Restaurar datos demo</button><button class="secondary-button compact danger" type="button" data-action="clear-local-data">Borrar todos los datos locales</button></div></article>
      ${serviceCatalogCard()}
      ${currentUser()?.isSuperAdmin ? discountRequestsCard() + userRequestsCard() + usersAdminCard() : ''}
    </div>
  `;
}

function serviceCatalogCard() {
  return `<article class="card user-admin-card"><div class="section-head"><div><div class="card-title">Catálogo de servicios</div><p>Base maestra de precios para cotizaciones.</p></div>${currentUser()?.isSuperAdmin ? '<button class="secondary-button compact" type="button" data-action="new-service">Agregar servicio</button>' : ''}</div>
    <div class="service-table">${state.serviceCatalog.map((service) => `<div class="service-row ${service.active ? '' : 'is-inactive'}">
      <span><strong>${service.name}</strong><small>${service.id} · ${service.category}</small></span>
      <span>${money(service.listPrice)}<small>Costo: ${service.internalCost ? money(service.internalCost) : 'No definido'}</small></span>
      <span>${service.active ? 'Activo' : 'Inactivo'}</span>
      ${currentUser()?.isSuperAdmin ? `<div class="row-actions"><button class="secondary-button compact" type="button" data-action="edit-service" data-service="${service.id}">Editar</button><button class="secondary-button compact" type="button" data-action="toggle-service" data-service="${service.id}">${service.active ? 'Desactivar' : 'Activar'}</button><button class="secondary-button compact danger" type="button" data-action="delete-service" data-service="${service.id}">Eliminar</button></div>` : ''}
    </div>`).join('')}</div></article>`;
}

function discountRequestsCard() {
  const pending = state.discountRequests.filter((request) => request.status === 'pending');
  return `<article class="card user-admin-card"><div class="section-head"><div><div class="card-title">Autorizaciones de descuento</div><p>Solicitudes simuladas en localStorage.</p></div><span class="badge riesgo"><i></i>${pending.length}</span></div>
    <div class="user-list">${pending.length ? pending.map((request) => {
      const quote = state.quotes.find((item) => item.id === request.quoteId);
      const lead = state.leads.find((item) => item.id === request.leadId);
      return `<div class="user-row"><span><strong>${lead?.name || 'Lead'} · ${quoteCode(quote)}</strong><small>${request.requestedBy} · ${datetimeLabel(request.createdAt)}</small></span><span>${request.discountType === 'percent' ? `${request.amount}%` : money(request.amount)}</span><div class="row-actions"><button class="primary-button compact-primary" type="button" data-action="approve-discount" data-request="${request.id}">Aprobar</button></div></div>`;
    }).join('') : '<div class="empty-panel">No hay descuentos pendientes.</div>'}</div></article>`;
}

function userRequestsCard() {
  const pending = state.accessRequests.filter((request) => request.status === 'pending');
  return `<article class="card user-admin-card" id="solicitudes-pendientes"><div class="section-head"><div><div class="card-title">Solicitudes pendientes</div><p>Simula notificacion al correo djchavaorellana@gmail.com.</p></div><span class="badge seguimiento"><i></i>${pending.length}</span></div>
    <div class="user-list">${pending.length ? pending.map((request) => `<div class="user-row">
      <span><strong>${request.name}</strong><small>${request.email} · ${request.position || 'Sin area'}</small></span>
      <span>${request.message ? escapeHtml(request.message) : 'Sin mensaje'}</span>
      <div class="row-actions">
        <button class="secondary-button compact" type="button" data-action="edit-request" data-request="${request.id}">Permisos</button>
        <button class="primary-button compact-primary" type="button" data-action="approve-request" data-request="${request.id}">Aprobar</button>
        <button class="secondary-button compact danger" type="button" data-action="reject-request" data-request="${request.id}">Rechazar</button>
      </div>
    </div>`).join('') : '<div class="empty-panel">No hay solicitudes pendientes.</div>'}</div></article>`;
}

function usersAdminCard() {
  return `<article class="card user-admin-card" id="administracion-usuarios">
    <div class="section-head">
      <div class="card-title">Administración de usuarios</div>
      <button class="secondary-button compact" type="button" data-action="new-user">Nuevo usuario</button>
    </div>
    <div class="user-list">${state.users.map((user) => `<div class="user-row">
      <span><strong>${user.name}</strong><small>${user.email} · ${effectiveRole(user)} · ${user.leadAccess === 'all' ? 'Todos los leads' : 'Solo asignados'}</small></span>
      <span>${user.permissions.length} permisos activos</span>
      <div class="row-actions">
        <button class="secondary-button compact" type="button" data-action="edit-user-permissions" data-user="${user.id}">Permisos</button>
        ${user.isSuperAdmin
          ? '<span class="badge caliente"><i></i>Protegido</span>'
          : `<button class="secondary-button compact" type="button" data-action="toggle-temp-admin" data-user="${user.id}">${user.temporaryAdmin ? 'Quitar admin temporal' : 'Admin temporal'}</button>
             <button class="secondary-button compact danger" type="button" data-action="delete-user" data-user="${user.id}">Eliminar</button>`}
      </div>
    </div>`).join('')}</div></article>`;
}

function simpleListView(title, subtitle, leads) {
  return `${pageHead('Base comercial', title, subtitle, [['new-lead', 'Nuevo lead']])}<div class="cards-grid">${leads.map((lead) => `<article class="card lead-mini" data-select-lead="${lead.id}" data-lead-context="${lead.id}"><div class="section-head"><div><div class="card-title">${lead.name}</div><p>${lead.eventType} · ${lead.venue}</p></div>${badge(lead.priority)}</div>${fieldRows([['Telefono', lead.phone], ['Evento', dateLabel(lead.eventDate)], ['Monto', money(lead.potential)]])}</article>`).join('')}</div>`;
}

function quoteListItem(quote) {
  const lead = state.leads.find((item) => item.id === quote.leadId);
  return `<button class="quote-list-item ${quote.id === selectedQuote()?.id ? 'selected' : ''}" type="button" data-action="select-quote" data-quote="${quote.id}" data-quote-context="${quote.id}">
    <span><strong>${lead?.name || 'Lead'}</strong><small>${quoteCode(quote)} · ${datetimeLabel(quote.updatedAt)}</small></span>
    <span>${quote.current ? '<b>Vigente</b>' : ''}${quote.status}</span>
    <em>${money(quote.amount)}</em>
  </button>`;
}

function quoteEditorForm(quote, lead, exists) {
  const items = quote.items || [];
  const totals = quoteTotals({ ...quote, items });
  const priceAllowed = canManageQuotePricing();
  const categories = quoteCategoryNames(items, quote.categoryOrder);
  const editorCategories = categories.length ? categories : ['Audio profesional'];
  return `<form class="quote-editor form" data-form="quote">
    <input type="hidden" name="quoteId" value="${exists ? quote.id : ''}" />
    <div class="section-head"><div><div class="card-title">Editor</div><p>${lead.name} · ${quoteCode(quote)}</p></div>${quote.current ? '<span class="badge caliente"><i></i>Vigente</span>' : '<span class="badge programado"><i></i>Version guardada</span>'}</div>
    ${select('Lead vinculado', 'leadId', lead.id, visibleLeads().map((item) => [item.id, `${item.name} · ${item.eventType}`]))}
    <div class="form-grid">${select('Estado', 'status', quote.status, quoteStatuses)}</div>
    <label class="checkbox-line"><input type="checkbox" name="current" ${quote.current ? 'checked' : ''} />Marcar esta version como vigente</label>
    <div class="quote-editor-tools"><button class="secondary-button compact" type="button" data-action="add-quote-category" data-quote="${quote.id}">+ Agregar categoría</button></div>
    <div class="quote-items-editor">${editorCategories.map((category, index) => quoteCategoryEditor(category, items.filter((item) => item.category === category), index, quote.id, editorCategories, priceAllowed)).join('')}</div>
    <div class="form-grid">${select('Tipo de descuento', 'discountType', quote.discountType, [['fixed', 'Descuento fijo'], ['percent', 'Descuento porcentual']])}<label class="form-field"><span>Descuento</span><input name="discount" type="number" min="0" step="0.01" value="${quote.discount}" ${priceAllowed ? '' : 'readonly title="No tienes permiso para modificar precios o descuentos."'} /></label></div>
    ${priceAllowed ? '' : '<div class="form-note">No tienes permiso para modificar precios o descuentos.</div><button class="secondary-button compact" type="button" data-action="request-discount" data-quote="' + quote.id + '">Solicitar autorización de descuento</button>'}
    <label class="checkbox-line iva-line"><input type="checkbox" name="ivaEnabled" ${quote.ivaEnabled ? 'checked' : ''} />Agregar IVA 16%</label>
    <div class="quote-visibility-block">
      <label class="form-field"><span>Condiciones comerciales</span><textarea name="terms" rows="3">${escapeHtml(quote.terms)}</textarea></label>
      <label class="checkbox-line"><input type="checkbox" name="showTerms" ${quote.showTerms ? 'checked' : ''} />Mostrar condiciones comerciales en cotización PDF</label>
      <button class="secondary-button compact danger" type="button" data-action="clear-terms-block" data-quote="${quote.id}">Eliminar bloque de condiciones comerciales</button>
    </div>
    <label class="form-field"><span>Validez</span><input name="validity" value="${escapeHtml(quote.validity)}" /></label>
    <label class="checkbox-line"><input type="checkbox" name="showValidity" ${quote.showValidity ? 'checked' : ''} />Mostrar validez en cotización PDF</label>
    <label class="form-field"><span>Notas</span><textarea name="notes" rows="3">${escapeHtml(quote.notes)}</textarea></label>
    <label class="checkbox-line"><input type="checkbox" name="showNotes" ${quote.showNotes ? 'checked' : ''} />Mostrar notas en cotización PDF</label>
    <div class="quote-totals-strip">${fieldRows([['Subtotal', money(totals.subtotal)], ['Descuento', money(totals.discount)], ['IVA', money(totals.iva)], ['Total', money(totals.total)]])}</div>
    <div class="card-actions">
      <button class="primary-button compact-primary" type="submit">${exists ? 'Guardar cambios' : 'Crear cotizacion'}</button>
      ${exists ? `<button class="secondary-button compact" type="button" data-action="download-quote-pdf" data-quote="${quote.id}">Descargar PDF</button><button class="secondary-button compact" type="button" data-action="send-whatsapp" data-quote="${quote.id}">Enviar por WhatsApp</button><button class="secondary-button compact" type="button" data-action="send-email" data-quote="${quote.id}">Enviar por Email</button>` : ''}
    </div>
  </form>`;
}

function quoteCategoryEditor(category, items, index, quoteId, categories, priceAllowed) {
  const rows = items.length ? items : [quoteItemEntity({ category })];
  const categoryActions = priceAllowed
    ? `<button type="button" data-action="duplicate-category" data-quote="${quoteId}" data-category="${escapeHtml(category)}">Duplicar</button>
        <button type="button" data-action="move-category-up" data-quote="${quoteId}" data-category="${escapeHtml(category)}" ${index === 0 ? 'disabled' : ''}>↑</button>
        <button type="button" data-action="move-category-down" data-quote="${quoteId}" data-category="${escapeHtml(category)}" ${index === categories.length - 1 ? 'disabled' : ''}>↓</button>
        <button type="button" class="danger-action" data-action="delete-category" data-quote="${quoteId}" data-category="${escapeHtml(category)}">Eliminar</button>`
    : '';
  return `<section class="quote-category-editor">
    <div class="quote-category-head">
      <input name="categoryName" value="${escapeHtml(category)}" ${priceAllowed ? '' : 'readonly title="No tienes permiso para editar categorías."'} />
      <div class="row-actions">
        <button type="button" data-action="add-quote-item" data-quote="${quoteId}" data-category="${escapeHtml(category)}">+ Agregar concepto</button>
        ${priceAllowed ? `<button type="button" data-action="add-custom-quote-item" data-quote="${quoteId}" data-category="${escapeHtml(category)}">+ Concepto personalizado</button>` : ''}
        ${categoryActions}
      </div>
    </div>${rows.map((item) => `<div class="quote-item-grid">
    <input type="hidden" name="itemId" value="${item.id}" />
    <input type="hidden" name="itemCategory" value="${escapeHtml(category)}" />
    <label><span>Catálogo</span>${serviceSelect(item.serviceId)}</label>
    <label><span>Categoría</span><select name="itemMoveCategory">${categories.map((option) => `<option value="${escapeHtml(option)}" ${option === category ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>
    <label><span>Nombre</span><input name="itemName" value="${escapeHtml(item.name)}" ${priceAllowed || item.serviceId ? '' : 'readonly'} /></label>
    <label><span>Descripción</span><input name="itemDescription" value="${escapeHtml(item.description)}" ${priceAllowed || item.serviceId ? '' : 'readonly'} /></label>
    <label><span>Cant.</span><input name="itemQuantity" type="number" min="0" step="0.01" value="${item.quantity}" /></label>
    <label><span>Precio unit.</span><input name="itemUnitPrice" type="number" min="0" step="0.01" value="${item.unitPrice}" ${priceAllowed ? '' : 'readonly title="No tienes permiso para modificar precios o descuentos."'} /></label>
    <div class="quote-item-actions" data-item-context="${item.id}" data-quote="${quoteId}"><button type="button" data-action="duplicate-quote-item" data-quote="${quoteId}" data-item="${item.id}">Duplicar</button><button type="button" class="danger-action" data-action="delete-quote-item" data-quote="${quoteId}" data-item="${item.id}">Eliminar</button></div>
  </div>`).join('')}</section>`;
}

function quotePreview(quote, lead) {
  const grouped = quoteCategoryNames(quote.items, quote.categoryOrder).map((category) => [category, quote.items.filter((item) => item.category === category && (item.name || item.unitPrice))]).filter(([, items]) => items.length);
  const totals = quoteTotals(quote);
  return `<div class="pdf-preview">
    <header><img src="/assets/top-logo-light.png" alt="TOP" /><div><strong>${quoteCode(quote)}</strong><span>${quote.status}</span></div></header>
    <section class="pdf-meta"><div><p>Cliente</p><strong>${lead.name}</strong><span>${lead.phone}</span><span>${lead.email || 'Sin correo'}</span></div><div><p>Evento</p><strong>${lead.eventType}</strong><span>${dateLabel(lead.eventDate)} · ${lead.venue}</span><span>${lead.guests} invitados</span></div></section>
    <div class="pdf-table">${grouped.map(([category, items]) => `<section><h3>${category}</h3>${items.map((item) => `<div class="pdf-row"><span><strong>${item.name || category}</strong><small>${item.description || 'Concepto de produccion TOP'}</small></span><em>${item.quantity}</em><em>${money(item.unitPrice)}</em><b>${money(item.amount)}</b></div>`).join('')}</section>`).join('')}</div>
    <section class="pdf-totals">${fieldRows([['Subtotal', money(totals.subtotal)], ['Descuento', money(totals.discount)], ['IVA', money(totals.iva)], ['Total', money(totals.total)]])}</section>
    ${(quote.showTerms && quote.terms) || (quote.showValidity && quote.validity) || (quote.showNotes && quote.notes) ? `<section class="pdf-terms">${quote.showTerms && quote.terms ? `<h3>Condiciones comerciales</h3><p>${escapeHtml(quote.terms)}</p>` : ''}${quote.showValidity && quote.validity ? `<h3>Validez</h3><p>${escapeHtml(quote.validity)}</p>` : ''}${quote.showNotes && quote.notes ? `<h3>Notas</h3><p>${escapeHtml(quote.notes)}</p>` : ''}</section>` : ''}
  </div>`;
}

function serviceSelect(selectedId) {
  const services = state.serviceCatalog.filter((service) => service.active);
  return `<select name="itemServiceId" data-service-select><option value="">Personalizado</option>${services.map((service) => `<option value="${service.id}" ${service.id === selectedId ? 'selected' : ''}>${service.name} · ${money(service.listPrice)}</option>`).join('')}</select>`;
}

function pageHead(eyebrow, title, subtitle, actions) {
  const allowedActions = actions.filter(([action]) => actionAllowed(action));
  return `<div class="action-strip"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="page-subtitle">${subtitle}</p></div><div class="page-actions">${allowedActions.map(([action, label]) => `<button class="${action === 'new-lead' ? 'primary-button compact-primary' : 'secondary-button compact'}" type="button" data-action="${action}">${label}</button>`).join('')}</div></div>`;
}

function actionAllowed(action) {
  return {
    'new-lead': can('create_leads'),
    'edit-lead': can('edit_leads'),
    'new-quote': can('view_quotes'),
    'schedule-followup': can('edit_leads'),
    'change-stage': can('move_leads'),
    'change-priority': can('edit_leads'),
    'upload-file': can('upload_files'),
  }[action] ?? true;
}

function priorityFilters() {
  return `<div class="priority-filters" role="group" aria-label="Filtros de prioridad">${['todos', ...priorities].map((key) => `<button class="priority-filter ${state.activePriority === key ? 'active' : ''}" data-priority="${key}" type="button">${key !== 'todos' ? `<i class="dot ${priorityMeta[key].tone}"></i>` : ''}${key === 'todos' ? 'Todos' : priorityMeta[key].label}</button>`).join('')}</div>`;
}

function leadStatusFilters() {
  return `<div class="priority-filters pipeline-filters" role="group" aria-label="Filtros de estado de lead">${[
    ['todos', 'Todos'],
    ['activos', 'Activos'],
    ['realizados', 'Realizados'],
    ['perdidos', 'Perdidos'],
  ].map(([key, label]) => `<button class="priority-filter ${state.leadStatusFilter === key ? 'active' : ''}" type="button" data-lead-status-filter="${key}">${label}</button>`).join('')}</div>`;
}

function kpiGrid(items) {
  return `<div class="kpi-grid">${items.map(([label, value]) => `<article class="card metric-card"><strong>${value}</strong><span>${label}</span></article>`).join('')}</div>`;
}

function leadSummary(lead) {
  const actions = [
    can('edit_leads') ? '<button class="secondary-button" type="button" data-action="edit-lead">Editar lead</button>' : '',
    can('move_leads') ? '<button class="secondary-button" type="button" data-action="change-stage">Cambiar etapa</button>' : '',
    can('edit_leads') ? '<button class="secondary-button" type="button" data-action="change-priority">Cambiar prioridad</button>' : '',
  ].join('');
  return `
    <article class="card lead-card">
      <div class="card-title">Resumen del lead</div>
      <div class="lead-head" data-lead-context="${lead.id}"><span class="lead-avatar">${initials(lead.name)}</span><div><h2>${lead.name}</h2><p>${lead.source} · ${lead.phone}</p></div>${badge(lead.priority)}</div>
      ${fieldRows([['Tipo de evento', lead.eventType], ['Fecha del evento', dateLabel(lead.eventDate)], ['Lugar', lead.venue], ['Invitados', lead.guests], ['Etapa actual', `<span class="stage-chip">${lead.stage}</span>`], ['Prioridad actual', badge(lead.priority)], ['Monto potencial', money(lead.potential)], ['Asignado a', lead.owner]])}
      ${actions ? `<div class="card-actions">${actions}</div>` : ''}
    </article>
  `;
}

function servicesCard(lead) {
  return `<article class="card"><div class="card-title">Servicios requeridos</div><ul class="check-list">${lead.services.map((service) => `<li><span>✓</span>${service}</li>`).join('')}</ul></article>`;
}

function quoteCard(lead) {
  const quotes = leadQuotes(lead.id).sort((a, b) => b.version - a.version);
  return `<article class="card lead-quotes-card"><div class="section-head"><div><div class="card-title">Cotizaciones</div><p>Versiones vinculadas al lead.</p></div>${can('view_quotes') ? '<button class="secondary-button compact" type="button" data-action="new-quote">Nueva</button>' : ''}</div>
    <div class="lead-quote-list">${quotes.length ? quotes.map((quote) => `<div class="lead-quote-row" data-quote-context="${quote.id}">
      <span><strong>${quoteCode(quote)}</strong><small>${dateLabel(quote.createdAt)}</small></span>
      <span>${quote.status}<small>${quote.createdBy}</small></span>
      <b>${money(quote.amount)}</b>
      <div class="row-actions">
        <button type="button" data-action="open-quote" data-quote="${quote.id}">Abrir</button>
        <button type="button" data-action="duplicate-quote" data-quote="${quote.id}">Duplicar</button>
        <button type="button" data-action="download-quote-pdf" data-quote="${quote.id}">Descargar</button>
      </div>
    </div>`).join('') : '<div class="empty-panel">Este lead todavia no tiene cotizaciones.</div>'}</div>
  </article>`;
}

function contextMenu() {
  if (!state.contextMenu) return '';
  if (state.contextMenu.type === 'quote') return quoteContextMenu();
  if (state.contextMenu.type === 'item') return quoteItemContextMenu();
  const lead = state.leads.find((item) => item.id === state.contextMenu.leadId);
  if (!lead) return '';
  const items = [
    ['view', 'Ver detalle', true],
    ['edit', 'Editar lead', can('edit_leads')],
    ['stage', 'Mover de etapa', can('move_leads')],
    ['priority', 'Cambiar prioridad', can('edit_leads')],
    ['followup', 'Agendar seguimiento', can('edit_leads')],
    ['done', 'Marcar como evento realizado', can('move_leads')],
    ['lost', 'Marcar como lead perdido', can('move_leads')],
    ['delete', 'Eliminar lead', can('delete_leads')],
  ];
  const allowedCount = items.filter(([, , allowed]) => allowed).length;
  return `
    <div class="context-menu" style="${contextMenuStyle(allowedCount, can('delete_leads') ? 2 : 1)}" role="menu">
      ${items.slice(0, 5).filter(([, , allowed]) => allowed).map(([action, label]) => `<button type="button" data-context-action="${action}" data-lead="${lead.id}">${label}</button>`).join('')}
      <hr />
      ${items.slice(5, 7).filter(([, , allowed]) => allowed).map(([action, label]) => `<button type="button" data-context-action="${action}" data-lead="${lead.id}">${label}</button>`).join('')}
      ${can('delete_leads') ? '<hr />' : ''}
      ${can('delete_leads') ? `<button class="danger-action" type="button" data-context-action="delete" data-lead="${lead.id}">Eliminar lead</button>` : ''}
    </div>
  `;
}

function quoteContextMenu() {
  const quote = state.quotes.find((item) => item.id === state.contextMenu.quoteId);
  if (!quote) return '';
  return `<div class="context-menu" style="${contextMenuStyle(9, 2)}" role="menu">
    <button type="button" data-quote-context-action="open" data-quote="${quote.id}">Abrir cotización</button>
    <button type="button" data-quote-context-action="edit" data-quote="${quote.id}">Editar cotización</button>
    <button type="button" data-quote-context-action="duplicate" data-quote="${quote.id}">Duplicar como nueva versión</button>
    <button type="button" data-quote-context-action="current" data-quote="${quote.id}">Marcar como vigente</button>
    <button type="button" data-quote-context-action="status" data-quote="${quote.id}">Cambiar estado</button>
    <hr />
    <button type="button" data-quote-context-action="pdf" data-quote="${quote.id}">Descargar PDF</button>
    <button type="button" data-quote-context-action="whatsapp" data-quote="${quote.id}">Enviar por WhatsApp</button>
    <button type="button" data-quote-context-action="email" data-quote="${quote.id}">Enviar por Email</button>
    <hr />
    <button class="danger-action" type="button" data-quote-context-action="delete" data-quote="${quote.id}">Eliminar cotización</button>
  </div>`;
}

function quoteItemContextMenu() {
  const quote = state.quotes.find((item) => item.id === state.contextMenu.quoteId);
  const item = quote?.items.find((entry) => entry.id === state.contextMenu.itemId);
  if (!quote || !item) return '';
  return `<div class="context-menu" style="${contextMenuStyle(4, 1)}" role="menu">
    <button type="button" data-item-context-action="edit" data-quote="${quote.id}" data-item="${item.id}">Editar concepto</button>
    <button type="button" data-item-context-action="duplicate" data-quote="${quote.id}" data-item="${item.id}">Duplicar concepto</button>
    <button type="button" data-item-context-action="move" data-quote="${quote.id}" data-item="${item.id}">Mover a otra categoría</button>
    <hr />
    <button class="danger-action" type="button" data-item-context-action="delete" data-quote="${quote.id}" data-item="${item.id}">Eliminar concepto</button>
  </div>`;
}

function contextMenuStyle(itemCount, dividerCount = 0) {
  const menuWidth = 244;
  const menuHeight = Math.min(window.innerHeight - 24, 12 + itemCount * 36 + dividerCount * 13);
  const left = Math.max(12, Math.min(state.contextMenu.x, window.innerWidth - menuWidth - 12));
  const top = Math.max(12, Math.min(state.contextMenu.y, window.innerHeight - menuHeight - 12));
  return `left:${Math.round(left)}px; top:${Math.round(top)}px;`;
}

function filesCard(lead) {
  const files = leadFiles(lead.id).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  return `
    <article class="card files-card">
      <div class="section-head"><div><div class="card-title">Archivos compartidos</div><p>Cotizaciones, imagenes, videos y documentos vinculados al lead.</p></div>${can('upload_files') ? '<button class="secondary-button compact" type="button" data-action="upload-file">Subir archivo</button>' : ''}</div>
      <div class="files">${files.length ? files.map((file) => `<div class="file-row"><span>${fileIcon(file)}</span><strong>${file.name}</strong><small>${file.kind} · ${datetimeLabel(file.uploadedAt)} · ${file.uploadedBy}</small><button type="button" data-download-file="${file.id}" ${file.dataUrl ? '' : 'disabled'}>↓</button></div>`).join('') : '<div class="empty-panel">Este lead todavia no tiene archivos compartidos.</div>'}</div>
    </article>
  `;
}

function todayActions(leads) {
  return `
    <article class="card actions-card">
      <div class="section-head"><div><div class="card-title">Prioridad operativa</div><p>Que atender primero para no enfriar oportunidades.</p></div>${can('edit_leads') ? '<button class="secondary-button compact" type="button" data-action="schedule-followup">Agendar</button>' : ''}</div>
      <div class="action-list">
        ${leads.length ? leads.map((lead) => {
          const followup = currentFollowup(lead.id);
          const status = followupStatus(followup);
          return `<button class="action-row ${lead.id === state.selectedLeadId ? 'selected' : ''} ${status ? `followup-${status}` : ''}" data-select-lead="${lead.id}" data-lead-context="${lead.id}" type="button"><span class="priority-bar ${status || lead.priority}"></span><span class="action-main"><strong>${lead.name}</strong><small>${lead.eventType} · ${dateLabel(lead.eventDate)} · ${lead.stage}</small></span><span class="action-meta">${followupBadge(status)}${badge(lead.priority)}<b>${money(lead.potential)}</b></span><span class="action-next">${followup?.action || 'Sin seguimiento'}<small>${datetimeLabel(followup?.dueAt)}</small></span></button>`;
        }).join('') : '<div class="empty-panel">No hay seguimientos activos con este filtro.</div>'}
      </div>
    </article>
  `;
}

function followupDetail(lead) {
  const followup = currentFollowup(lead.id);
  const status = followupStatus(followup);
  const actions = can('edit_leads') ? `<div class="card-actions">${followup ? '<button class="primary-button" type="button" data-action="complete-followup">Marcar seguimiento como realizado</button>' : ''}<button class="secondary-button" type="button" data-action="schedule-followup">Agendar seguimiento</button></div>` : '';
  return `<article class="card detail-card"><div class="section-head"><div><div class="card-title">Detalle del seguimiento</div><p>${datetimeLabel(followup?.dueAt)} · ${lead.owner}</p></div>${followup ? followupBadge(status) : badge(lead.priority)}</div><div class="detail-grid"><div><span>Tipo de accion</span><strong>${followup?.action || 'Sin seguimiento activo'}</strong></div><div><span>Etapa</span><strong>${lead.stage}</strong></div><div><span>Estado</span><strong>${followupStatusMeta[status]?.label || 'Sin seguimiento activo'}</strong></div></div><div class="copy-block"><h3>Respuesta sugerida</h3><p>Hola ${lead.name.split(' ')[0]}, solo dando seguimiento para saber si pudiste revisar la informacion. Con gusto puedo ayudarte a ajustar la propuesta para tu evento.</p></div><div class="note-box">${lead.notes}</div>${actions}</article>`;
}

function historyCard(lead) {
  const items = leadTimelineEvents(lead.id);
  return `<article class="card"><div class="section-head"><div><div class="card-title">Historial de seguimientos</div><p>Timeline expandible listo para contexto de IA.</p></div></div><div class="timeline">${items.map((item, index) => `<details class="timeline-item timeline-${timelineTone(item)}" ${index === items.length - 1 ? 'open' : ''}><summary><span class="timeline-icon">${channelIcon(item.channel, item.type)}</span><span><strong>${item.type}</strong><small>${item.title} · ${item.preview}</small></span><em>${datetimeLabel(item.date)} · ${item.owner}</em></summary><p>${item.detail}</p></details>`).join('')}</div></article>`;
}

function nextFollowup(lead) {
  const followup = currentFollowup(lead.id);
  const status = followupStatus(followup);
  return `<article class="card"><div class="card-title">Proximo seguimiento</div>${fieldRows([['Estado', followup ? followupBadge(status) : 'Sin seguimiento activo'], ['Fecha y hora', datetimeLabel(followup?.dueAt)], ['Tipo de accion', followup?.action || 'Sin seguimiento activo'], ['Objetivo', followup?.objective || 'Resolver dudas y avanzar cierre']])}${can('edit_leads') ? `${followup ? '<button class="primary-button" type="button" data-action="complete-followup">Realizado</button>' : ''}<button class="secondary-button" type="button" data-action="schedule-followup">Reprogramar</button>` : ''}</article>`;
}

function intelligenceCard(lead) {
  const probability = lead.priority === 'caliente' ? 'Alta (70%)' : lead.priority === 'urgente' ? 'Alta con urgencia' : 'Media';
  const lastInteraction = leadTimelineEvents(lead.id).at(-1);
  return `<article class="card"><div class="card-title">Inteligencia comercial</div>${fieldRows([['Probabilidad de cierre', `<span class="badge caliente">${probability}</span>`], ['Presupuesto estimado', lead.budget], ['Ultima interaccion', lastInteraction ? datetimeLabel(lastInteraction.date) : 'Sin historial'], ['Fuente', lead.source]])}<ul class="mini-list"><li>${lead.guests} invitados</li><li>${lead.services.slice(0, 2).join(' + ')}</li><li>${isUpcoming(lead.eventDate) ? 'Fecha cercana: requiere prioridad' : 'Seguimiento dentro de flujo normal'}</li></ul></article>`;
}

function activityCard(lead) {
  return `<article class="card"><div class="card-title">Actividad del lead</div><div class="stats"><span><strong>${leadTimelineEvents(lead.id).length}</strong><small>Interacciones</small></span><span><strong>${completedFollowups(lead.id).length}</strong><small>Realizados</small></span><span><strong>${leadFiles(lead.id).length}</strong><small>Archivos</small></span><span><strong>${daysInStage(lead)}</strong><small>Dias activo</small></span></div></article>`;
}

function remindersCard() {
  return `<article class="card"><div class="card-title">Recordatorios</div><div class="reminder-row"><span>Enviar ejemplos de iluminacion decorativa</span><small>18 May 2025</small></div><button class="link-button" type="button" data-action="schedule-followup">+ Agregar recordatorio</button></article>`;
}

function kanbanCard(lead) {
  return `<article class="kanban-card" draggable="true" data-drag-lead="${lead.id}" data-select-lead="${lead.id}" data-lead-context="${lead.id}"><div class="section-head"><strong>${lead.name}</strong>${badge(lead.priority)}</div><p>${lead.eventType} · ${dateLabel(lead.eventDate)}</p><span>${money(lead.potential)}</span></article>`;
}

function drawer() {
  if (!state.drawer) return '';
  const lead = selectedLead();
  const title = {
    'lead-form': state.drawer.mode === 'edit' ? 'Editar lead' : 'Nuevo lead',
    'quote-form': 'Nueva cotizacion',
    'followup-form': 'Agendar seguimiento',
    'stage-form': 'Cambiar etapa',
    'priority-form': 'Cambiar prioridad',
    'file-form': 'Subir archivo',
    profile: 'Mi perfil',
    password: 'Cambiar contraseña',
    permissions: 'Mis permisos',
    'user-permissions': 'Permisos de usuario',
    'request-permissions': 'Permisos de solicitud',
    'service-form': state.drawer.mode === 'edit' ? 'Editar servicio' : 'Nuevo servicio',
    'user-form': 'Nuevo usuario',
  }[state.drawer.type];
  return `<div class="drawer-backdrop" data-action="close-drawer"></div><aside class="drawer" aria-label="${title}"><header><div><p class="eyebrow">TOP CRM</p><h2>${title}</h2></div><button class="icon-button" type="button" data-action="close-drawer">×</button></header>${drawerBody(lead)}</aside>`;
}

function drawerBody(lead) {
  if (state.drawer.type === 'lead-form') return leadForm(state.drawer.mode === 'edit' ? lead : null);
  if (state.drawer.type === 'quote-form') return quoteForm(lead);
  if (state.drawer.type === 'followup-form') return followupForm(lead);
  if (state.drawer.type === 'stage-form') return stageForm(lead);
  if (state.drawer.type === 'priority-form') return priorityForm(lead);
  if (state.drawer.type === 'file-form') return fileForm();
  if (state.drawer.type === 'profile') return profilePanel();
  if (state.drawer.type === 'password') return passwordForm();
  if (state.drawer.type === 'permissions') return myPermissionsPanel();
  if (state.drawer.type === 'user-permissions') return permissionsForm('user', state.users.find((user) => user.id === state.drawer.userId));
  if (state.drawer.type === 'request-permissions') return permissionsForm('request', state.accessRequests.find((request) => request.id === state.drawer.requestId));
  if (state.drawer.type === 'service-form') return serviceForm(state.serviceCatalog.find((service) => service.id === state.drawer.serviceId));
  if (state.drawer.type === 'user-form') return userForm();
  return '';
}

function leadForm(lead) {
  const current = lead ?? leadEntity({ guests: 100, stage: 'Lead nuevo', priority: 'seguimiento' });
  return `<form class="form" data-form="lead">${input('Nombre', 'name', current.name, true)}${input('Telefono', 'phone', current.phone, true)}${input('Correo', 'email', current.email)}${select('Fuente', 'source', current.source, ['WhatsApp', 'Instagram', 'Facebook', 'Google', 'Recomendado', 'Wedding Planner', 'Venue', 'Cliente anterior'])}${select('Tipo de evento', 'eventType', current.eventType, eventTypes)}${input('Fecha del evento', 'eventDate', current.eventDate, true, 'date')}${input('Lugar', 'venue', current.venue, true)}${input('Ciudad', 'city', current.city)}${input('Numero de invitados', 'guests', current.guests, true, 'number')}${checkboxes('Servicios requeridos', 'services', current.services, services)}${select('Presupuesto aproximado', 'budget', current.budget, budgets)}${input('Monto potencial', 'potential', current.potential, false, 'number')}${select('Etapa del pipeline', 'stage', current.stage, stages)}${select('Prioridad', 'priority', current.priority, priorities)}<label class="form-field"><span>Notas</span><textarea name="notes" rows="4">${escapeHtml(current.notes)}</textarea></label><button class="primary-button" type="submit">${lead ? 'Guardar cambios' : 'Crear lead'}</button></form>`;
}

function quoteForm(lead) {
  const quote = latestQuote(lead.id);
  const nextVersion = leadQuotes(lead.id).length + 1;
  return `<form class="form" data-form="quote">${input('Monto cotizado', 'amount', quote?.amount || lead.potential, true, 'number')}${select('Estatus', 'status', quote?.status || 'Enviada', ['Enviada', 'Vista', 'En revision', 'Aceptada', 'Rechazada'])}${input('Nombre sugerido PDF', 'fileName', `Cotizacion_${safeFileName(lead.name)}_V${nextVersion}.pdf`)}<label class="form-field"><span>Archivo PDF opcional</span><input name="file" type="file" accept=".pdf,application/pdf" /></label><label class="form-field"><span>Servicios incluidos</span><textarea name="notes" rows="4">${escapeHtml(lead.notes)}</textarea></label><button class="primary-button" type="submit">Guardar cotizacion</button></form>`;
}

function followupForm(lead) {
  const followup = currentFollowup(lead.id);
  return `<form class="form" data-form="followup">${input('Accion', 'action', followup?.action || 'Seguimiento comercial', true)}${input('Fecha y hora', 'dueAt', followup?.dueAt?.slice(0, 16) || '', true, 'datetime-local')}<label class="form-field"><span>Nota interna</span><textarea name="objective" rows="4">Seguimiento programado para ${lead.name}</textarea></label><button class="primary-button" type="submit">Agendar seguimiento</button></form>`;
}

function stageForm(lead) {
  return `<form class="form" data-form="stage">${select('Nueva etapa del pipeline', 'stage', lead.stage, stages)}<p class="form-note">Este cambio actualiza solo la etapa. La prioridad comercial se mantiene igual.</p><button class="primary-button" type="submit">Actualizar etapa</button></form>`;
}

function priorityForm(lead) {
  return `<form class="form" data-form="priority">${select('Prioridad comercial', 'priority', lead.priority, priorities)}<p class="form-note">Este cambio actualiza solo la prioridad. La etapa del pipeline se mantiene igual.</p><button class="primary-button" type="submit">Actualizar prioridad</button></form>`;
}

function fileForm() {
  return `<form class="form" data-form="file">${select('Tipo de archivo', 'kind', 'Documento', ['PDF', 'Imagen', 'Video', 'Documento'])}<label class="form-field"><span>Archivo</span><input name="file" type="file" required /></label><button class="primary-button" type="submit">Subir archivo</button></form>`;
}

function profilePanel() {
  const user = currentUser();
  return `<div class="form">${fieldRows([['Nombre', user.name], ['Correo', user.email], ['Rol actual', effectiveRole(user)], ['Acceso a leads', user.leadAccess === 'all' ? 'Todos los leads' : 'Solo leads asignados']])}</div>`;
}

function passwordForm() {
  return `<form class="form" data-form="password">${input('Nueva contraseña', 'password', '', true, 'password')}${input('Confirmar contraseña', 'confirmPassword', '', true, 'password')}<button class="primary-button" type="submit">Actualizar contraseña</button></form>`;
}

function myPermissionsPanel() {
  const user = currentUser();
  const enabled = effectivePermissions(user);
  return `<div class="form"><div class="form-note">Estos permisos estan simulados en localStorage. El backend real debera validarlos otra vez.</div>${fieldRows([['Rol', effectiveRole(user)], ['Acceso a leads', user.leadAccess === 'all' ? 'Todos' : 'Solo asignados']])}<div class="permissions-grid readonly">${permissionCatalog.map(([key, label]) => `<span class="${enabled.includes(key) ? 'enabled' : ''}">${enabled.includes(key) ? '✓' : '–'} ${label}</span>`).join('')}</div></div>`;
}

function permissionsForm(subjectType, subject) {
  if (!subject) return '<div class="form"><div class="empty-panel">No se encontro el usuario.</div></div>';
  const isProtected = subjectType === 'user' && subject.isSuperAdmin;
  const enabled = isProtected ? allPermissions : sanitizePermissions(subject.permissions);
  return `<form class="form" data-form="permissions">
    <input type="hidden" name="subjectType" value="${subjectType}" />
    <input type="hidden" name="id" value="${subject.id}" />
    <div class="form-note">${isProtected ? 'El Super Administrador tiene acceso total permanente y no puede perder permisos criticos.' : 'Configura el acceso simulado antes de aprobar o actualizar al usuario.'}</div>
    ${select('Acceso a leads', 'leadAccess', isProtected ? 'all' : subject.leadAccess, [['assigned', 'Solo leads asignados a él'], ['all', 'Todos los leads']], true)}
    <label class="checkbox-line"><input type="checkbox" name="temporaryAdmin" ${subject.temporaryAdmin ? 'checked' : ''} ${isProtected ? 'disabled' : ''} />Permiso de administrador temporal</label>
    <fieldset class="form-field checkbox-field permissions-field"><legend>Permisos individuales</legend>${permissionCatalog.map(([key, label]) => `<label><input type="checkbox" name="permissions" value="${key}" ${enabled.includes(key) ? 'checked' : ''} ${isProtected ? 'disabled' : ''} />${label}</label>`).join('')}</fieldset>
    <button class="primary-button" type="submit">${subjectType === 'request' ? 'Guardar permisos de solicitud' : 'Guardar permisos'}</button>
  </form>`;
}

function serviceForm(service) {
  const current = service || serviceEntity({ active: true });
  return `<form class="form" data-form="service">
    <input type="hidden" name="id" value="${service?.id || ''}" />
    ${input('ID interno', 'internalId', current.id, true)}
    ${input('Nombre del servicio', 'name', current.name, true)}
    ${input('Categoría', 'category', current.category, true)}
    <label class="form-field"><span>Descripción</span><textarea name="description" rows="3">${escapeHtml(current.description)}</textarea></label>
    ${numberInput('Precio unitario de lista', 'listPrice', current.listPrice, true)}
    ${numberInput('Costo interno opcional', 'internalCost', current.internalCost)}
    <label class="checkbox-line"><input type="checkbox" name="active" ${current.active ? 'checked' : ''} />Activo</label>
    <label class="form-field"><span>Notas internas</span><textarea name="notes" rows="3">${escapeHtml(current.notes)}</textarea></label>
    <button class="primary-button" type="submit">Guardar servicio</button>
  </form>`;
}

function userForm() {
  return `<form class="form" data-form="user">
    ${input('Nombre completo', 'name', '', true)}
    ${input('Correo electrónico', 'email', '', true, 'email')}
    ${input('Contraseña', 'password', '', true, 'password')}
    ${select('Acceso a leads', 'leadAccess', 'assigned', [['assigned', 'Solo asignados'], ['all', 'Todos los leads']])}
    <button class="primary-button" type="submit">Crear usuario</button>
  </form>`;
}

function input(label, name, value, required = false, type = 'text') {
  const numberAttrs = type === 'number' ? 'min="0" step="0.01"' : '';
  return `<label class="form-field"><span>${label}</span><input name="${name}" type="${type}" ${numberAttrs} value="${escapeHtml(value ?? '')}" ${required ? 'required' : ''} /></label>`;
}

function numberInput(label, name, value, required = false) {
  return `<label class="form-field"><span>${label}</span><input name="${name}" type="number" min="0" step="0.01" value="${escapeHtml(value ?? '')}" ${required ? 'required' : ''} /></label>`;
}

function select(label, name, value, options) {
  return `<label class="form-field"><span>${label}</span><select name="${name}">${options.map((option) => {
    const optionValue = Array.isArray(option) ? option[0] : option;
    const optionLabel = Array.isArray(option) ? option[1] : priorityMeta[option]?.label ?? option;
    return `<option value="${optionValue}" ${optionValue === value ? 'selected' : ''}>${optionLabel}</option>`;
  }).join('')}</select></label>`;
}

function checkboxes(label, name, selected, options) {
  return `<fieldset class="form-field checkbox-field"><legend>${label}</legend>${options.map((option) => `<label><input type="checkbox" name="${name}" value="${option}" ${selected.includes(option) ? 'checked' : ''} />${option}</label>`).join('')}</fieldset>`;
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach((node) => node.addEventListener('click', (event) => {
    event.preventDefault();
    if (!requirePermission(viewPermissions[node.dataset.view])) return;
    setState({ view: node.dataset.view, userMenuOpen: false });
  }));
  document.querySelector('[data-search]')?.addEventListener('input', (event) => {
    state.search = event.target.value;
    persist();
    render();
  });
  document.querySelectorAll('[data-priority]').forEach((node) => node.addEventListener('click', () => setState({ activePriority: node.dataset.priority })));
  document.querySelectorAll('[data-lead-status-filter]').forEach((node) => node.addEventListener('click', () => setState({ leadStatusFilter: node.dataset.leadStatusFilter })));
  document.querySelectorAll('[data-pipeline-filter]').forEach((node) => node.addEventListener('click', () => setState({ pipelineFilter: node.dataset.pipelineFilter })));
  document.querySelectorAll('[data-select-lead]').forEach((node) => node.addEventListener('click', () => setState({ selectedLeadId: node.dataset.selectLead })));
  document.querySelectorAll('[data-lead-context]').forEach((node) => node.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    setState({
      selectedLeadId: node.dataset.leadContext,
      contextMenu: { leadId: node.dataset.leadContext, x: event.clientX, y: event.clientY },
    });
  }));
  document.querySelectorAll('[data-quote-context]').forEach((node) => node.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    setState({ selectedQuoteId: node.dataset.quoteContext, contextMenu: { type: 'quote', quoteId: node.dataset.quoteContext, x: event.clientX, y: event.clientY } });
  }));
  document.querySelectorAll('[data-item-context]').forEach((node) => node.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    setState({ contextMenu: { type: 'item', quoteId: node.dataset.quote, itemId: node.dataset.itemContext, x: event.clientX, y: event.clientY } });
  }));
  document.querySelectorAll('[data-action]').forEach((node) => node.addEventListener('click', (event) => handleAction(event, node.dataset.action)));
  document.querySelectorAll('[data-context-action]').forEach((node) => node.addEventListener('click', (event) => handleContextAction(event, node.dataset.contextAction, node.dataset.lead)));
  document.querySelectorAll('[data-quote-context-action]').forEach((node) => node.addEventListener('click', (event) => handleQuoteContextAction(event, node.dataset.quoteContextAction, node.dataset.quote)));
  document.querySelectorAll('[data-item-context-action]').forEach((node) => node.addEventListener('click', (event) => handleItemContextAction(event, node.dataset.itemContextAction, node.dataset.quote, node.dataset.item)));
  if (state.contextMenu) {
    window.setTimeout(() => document.addEventListener('click', closeContextOnOutsideClick, { once: true }), 0);
    document.querySelector('.context-menu')?.addEventListener('wheel', (event) => event.stopPropagation(), { passive: true });
  }
  document.querySelectorAll('[data-download-file]').forEach((node) => node.addEventListener('click', (event) => {
    event.stopPropagation();
    downloadFile(node.dataset.downloadFile);
  }));
  document.querySelectorAll('[data-drag-lead]').forEach((node) => node.addEventListener('dragstart', () => { state.draggingLeadId = node.dataset.dragLead; }));
  document.querySelectorAll('[data-drop-stage]').forEach((node) => {
    node.addEventListener('dragover', (event) => event.preventDefault());
    node.addEventListener('drop', (event) => {
      event.preventDefault();
      if (!requirePermission('move_leads')) return;
      if (state.draggingLeadId) updateLead(state.draggingLeadId, { stage: node.dataset.dropStage }, `Lead movido a ${node.dataset.dropStage}`);
      state.draggingLeadId = null;
    });
  });
  document.querySelectorAll('[data-form]').forEach((form) => form.addEventListener('submit', handleSubmit));
  document.querySelectorAll('form[data-form="quote"]').forEach((form) => form.addEventListener('keydown', preventQuoteEnterSubmit));
  document.querySelectorAll('[data-service-select]').forEach((node) => node.addEventListener('change', () => fillServiceRow(node)));
}

function bindAuthEvents() {
  document.querySelectorAll('[data-action]').forEach((node) => node.addEventListener('click', (event) => handleAction(event, node.dataset.action)));
  document.querySelectorAll('[data-form]').forEach((form) => form.addEventListener('submit', handleSubmit));
}

function fillServiceRow(selectNode) {
  const service = state.serviceCatalog.find((item) => item.id === selectNode.value);
  const row = selectNode.closest('.quote-item-grid');
  if (!service || !row) return;
  row.querySelector('[name="itemName"]').value = service.name;
  row.querySelector('[name="itemDescription"]').value = service.description;
  row.querySelector('[name="itemUnitPrice"]').value = service.listPrice;
  const categorySelect = row.querySelector('[name="itemMoveCategory"]');
  if ([...categorySelect.options].some((option) => option.value === service.category)) categorySelect.value = service.category;
}

function closeContextOnOutsideClick(event) {
  if (event.target.closest?.('.context-menu')) return;
  setState({ contextMenu: null });
}

function handleAction(event, action) {
  event.preventDefault();
  const target = event.currentTarget;
  if (action === 'toggle-dark') return setState({ darkMode: !state.darkMode });
  if (action === 'show-access-request') return setState({ drawer: { type: 'access-request' }, toast: '' });
  if (action === 'show-login') return setState({ drawer: null, toast: '' });
  if (action === 'google-login') return setState({ toast: 'Google OAuth esta simulado por ahora. Usa correo y contraseña.' });
  if (action === 'toggle-user-menu') return setState({ userMenuOpen: !state.userMenuOpen });
  if (action === 'logout') return setState({ currentUserId: null, userMenuOpen: false, drawer: null, toast: '' });
  if (action === 'profile') return setState({ drawer: { type: 'profile' }, userMenuOpen: false });
  if (action === 'change-password') return setState({ drawer: { type: 'password' }, userMenuOpen: false });
  if (action === 'my-permissions') return setState({ drawer: { type: 'permissions' }, userMenuOpen: false });
  if (action === 'pending-requests') {
    if (!currentUser()?.isSuperAdmin) return requirePermission('manage_users');
    return setState({ view: 'configuracion', userMenuOpen: false, drawer: null });
  }
  if (action === 'user-admin') {
    if (!currentUser()?.isSuperAdmin) return requirePermission('manage_users');
    return setState({ view: 'configuracion', userMenuOpen: false, drawer: null });
  }
  if (action === 'edit-request') {
    if (!currentUser()?.isSuperAdmin) return requirePermission('manage_users');
    return setState({ drawer: { type: 'request-permissions', requestId: target.dataset.request } });
  }
  if (action === 'approve-request') return approveRequest(target.dataset.request);
  if (action === 'reject-request') return rejectRequest(target.dataset.request);
  if (action === 'edit-user-permissions') {
    if (!currentUser()?.isSuperAdmin) return requirePermission('manage_users');
    return setState({ drawer: { type: 'user-permissions', userId: target.dataset.user } });
  }
  if (action === 'toggle-temp-admin') return toggleTemporaryAdmin(target.dataset.user);
  if (action === 'new-user') return currentUser()?.isSuperAdmin ? setState({ drawer: { type: 'user-form' } }) : requirePermission('manage_users');
  if (action === 'delete-user') return deleteUser(target.dataset.user);
  if (action === 'new-service') return currentUser()?.isSuperAdmin ? setState({ drawer: { type: 'service-form', mode: 'new' } }) : requirePermission('manage_quote_pricing');
  if (action === 'edit-service') return currentUser()?.isSuperAdmin ? setState({ drawer: { type: 'service-form', mode: 'edit', serviceId: target.dataset.service } }) : requirePermission('manage_quote_pricing');
  if (action === 'toggle-service') return toggleService(target.dataset.service);
  if (action === 'delete-service') return deleteService(target.dataset.service);
  if (action === 'approve-discount') return approveDiscountRequest(target.dataset.request);
  if (action === 'close-drawer') return setState({ drawer: null });
  if (action === 'new-lead') return requirePermission('create_leads') && setState({ drawer: { type: 'lead-form', mode: 'new' } });
  if (action === 'edit-lead') return requirePermission('edit_leads') && setState({ drawer: { type: 'lead-form', mode: 'edit' } });
  if (action === 'new-quote') return createDraftQuote(target.dataset.lead || state.selectedLeadId);
  if (action === 'select-quote') return setState({ selectedQuoteId: target.dataset.quote, selectedLeadId: state.quotes.find((quote) => quote.id === target.dataset.quote)?.leadId || state.selectedLeadId });
  if (action === 'open-quote') return setState({ view: 'cotizaciones', selectedQuoteId: target.dataset.quote, selectedLeadId: state.quotes.find((quote) => quote.id === target.dataset.quote)?.leadId || state.selectedLeadId });
  if (action === 'duplicate-quote') return duplicateQuote(target.dataset.quote);
  if (action === 'request-discount') return requestDiscountAuthorization(target.dataset.quote);
  if (['add-quote-item', 'add-custom-quote-item', 'duplicate-quote-item', 'delete-quote-item', 'delete-category', 'duplicate-category', 'move-category-up', 'move-category-down', 'add-quote-category', 'clear-terms-block'].includes(action)) return mutateQuoteStructure(action, target.dataset);
  if (action === 'send-whatsapp') return sendQuoteWhatsApp(target.dataset.quote);
  if (action === 'send-email') return sendQuoteEmail(target.dataset.quote);
  if (action === 'download-quote-pdf') return downloadQuotePdf(target.dataset.quote);
  if (action === 'schedule-followup') return requirePermission('edit_leads') && setState({ drawer: { type: 'followup-form' } });
  if (action === 'change-stage') return requirePermission('move_leads') && setState({ drawer: { type: 'stage-form' } });
  if (action === 'change-priority') return requirePermission('edit_leads') && setState({ drawer: { type: 'priority-form' } });
  if (action === 'upload-file') return requirePermission('upload_files') && setState({ drawer: { type: 'file-form' } });
  if (action === 'dismiss-urgent') return setState({ dismissedUrgentId: `${target.dataset.lead}-${target.dataset.followup}` });
  if (action === 'go-alert-lead') return setState({ selectedLeadId: target.dataset.lead, view: 'dashboard', dismissedUrgentId: `${target.dataset.lead}-${target.dataset.followup}` });
  if (action === 'complete-followup') return completeFollowup();
  if (action === 'reset-data') {
    if (!currentUser()?.isSuperAdmin) return requirePermission('manage_users');
    if (!confirm('¿Restaurar los datos demo? Se reemplazaran los datos locales actuales.')) return;
    state = structuredClone(defaultState);
    persist();
    return render();
  }
  if (action === 'clear-local-data') {
    if (!currentUser()?.isSuperAdmin) return requirePermission('manage_users');
    if (!confirm('¿Seguro que deseas borrar todos los datos locales? Esta acción no se puede deshacer.')) return;
    state = emptyInitializedState();
    persist();
    return render();
  }
}

function handleContextAction(event, action, leadId) {
  event.preventDefault();
  const lead = state.leads.find((item) => item.id === leadId);
  if (!lead) return setState({ contextMenu: null });
  if (action === 'view') return setState({ selectedLeadId: leadId, view: 'dashboard', contextMenu: null });
  if (!canAccessLead(lead)) return requirePermission('view_leads');
  if (action === 'edit' && !requirePermission('edit_leads')) return;
  if (action === 'stage' && !requirePermission('move_leads')) return;
  if (action === 'priority' && !requirePermission('edit_leads')) return;
  if (action === 'followup' && !requirePermission('edit_leads')) return;
  if (['done', 'lost'].includes(action) && !requirePermission('move_leads')) return;
  if (action === 'delete' && !requirePermission('delete_leads')) return;
  if (action === 'edit') return setState({ selectedLeadId: leadId, drawer: { type: 'lead-form', mode: 'edit' }, contextMenu: null });
  if (action === 'stage') return setState({ selectedLeadId: leadId, drawer: { type: 'stage-form' }, contextMenu: null });
  if (action === 'priority') return setState({ selectedLeadId: leadId, drawer: { type: 'priority-form' }, contextMenu: null });
  if (action === 'followup') return setState({ selectedLeadId: leadId, drawer: { type: 'followup-form' }, contextMenu: null });
  if (action === 'done') return updateLead(leadId, { stage: 'Evento realizado' }, 'Lead marcado como evento realizado');
  if (action === 'lost') return updateLead(leadId, { stage: 'Lead perdido' }, 'Lead marcado como perdido');
  if (action === 'delete') return deleteLead(leadId);
}

function handleQuoteContextAction(event, action, quoteId) {
  event.preventDefault();
  const quote = state.quotes.find((item) => item.id === quoteId);
  if (!quote) return setState({ contextMenu: null });
  const lead = state.leads.find((item) => item.id === quote.leadId);
  if (!lead || !canAccessLead(lead)) return requirePermission('view_quotes');
  if (action === 'open' || action === 'edit') return setState({ view: 'cotizaciones', selectedQuoteId: quote.id, selectedLeadId: quote.leadId, contextMenu: null });
  if (action === 'duplicate') return duplicateQuote(quote.id);
  if (action === 'current') return markQuoteCurrent(quote.id);
  if (action === 'status') return changeQuoteStatus(quote.id);
  if (action === 'pdf') return downloadQuotePdf(quote.id);
  if (action === 'whatsapp') return sendQuoteWhatsApp(quote.id);
  if (action === 'email') return sendQuoteEmail(quote.id);
  if (action === 'delete') return deleteQuote(quote.id);
}

function handleItemContextAction(event, action, quoteId, itemId) {
  event.preventDefault();
  if (action === 'edit') return setState({ contextMenu: null, toast: 'Edita el concepto directamente en la fila.' });
  if (action === 'duplicate') return mutateQuoteStructure('duplicate-quote-item', { quote: quoteId, item: itemId });
  if (action === 'move') return moveQuoteItem(quoteId, itemId);
  if (action === 'delete') return mutateQuoteStructure('delete-quote-item', { quote: quoteId, item: itemId });
}

function deleteLead(id) {
  if (!requirePermission('delete_leads')) return;
  const lead = state.leads.find((item) => item.id === id);
  if (!lead) return;
  const confirmed = window.confirm('¿Seguro que deseas eliminar este lead? Esta acción no se puede deshacer.');
  if (!confirmed) return setState({ contextMenu: null });
  const remainingLeads = state.leads.filter((item) => item.id !== id);
  const nextSelected = remainingLeads.find((item) => !isInactiveLead(item)) ?? remainingLeads[0];
  setState({
    leads: remainingLeads,
    followUps: state.followUps.filter((item) => item.leadId !== id),
    quotes: state.quotes.filter((item) => item.leadId !== id),
    files: state.files.filter((item) => item.leadId !== id),
    timelineEvents: state.timelineEvents.filter((item) => item.leadId !== id),
    selectedLeadId: nextSelected?.id,
    contextMenu: null,
    drawer: null,
    toast: `Lead eliminado: ${lead.name}`,
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  const type = form.dataset.form;
  const lead = selectedLead();

  if (type === 'login') {
    const user = state.users.find((item) => item.email === normalizeEmail(data.email) && item.password === data.password);
    const pendingRequest = state.accessRequests.find((item) => item.email === normalizeEmail(data.email) && item.password === data.password && item.status === 'pending');
    if (pendingRequest) return setState({ toast: 'Tu solicitud fue recibida. El administrador debe aprobar tu acceso.' });
    if (!user) return setState({ toast: 'Correo o contraseña incorrectos.' });
    if (user.status !== 'active') return setState({ toast: 'Tu solicitud fue recibida. El administrador debe aprobar tu acceso.' });
    const firstView = can('view_dashboard', user) ? 'dashboard' : can('view_leads', user) ? 'leads' : 'configuracion';
    return setState({ currentUserId: user.id, view: firstView, toast: `Bienvenido, ${user.name}` });
  }

  if (type === 'access-request') {
    if (data.password !== data.confirmPassword) return setState({ toast: 'Las contraseñas no coinciden.' });
    const email = normalizeEmail(data.email);
    if (state.users.some((user) => user.email === email) || state.accessRequests.some((request) => request.email === email && request.status === 'pending')) {
      return setState({ toast: 'Ya existe un usuario o solicitud con ese correo.' });
    }
    const request = accessRequestEntity({ ...data, email });
    return setState({
      accessRequests: [request, ...state.accessRequests],
      drawer: null,
      toast: 'Tu solicitud fue recibida. El administrador debe aprobar tu acceso.',
    });
  }

  if (type === 'password') {
    if (data.password !== data.confirmPassword) return setState({ toast: 'Las contraseñas no coinciden.' });
    return setState({
      users: state.users.map((user) => user.id === state.currentUserId ? userEntity({ ...user, password: data.password }) : user),
      drawer: null,
      toast: 'Contraseña actualizada',
    });
  }

  if (type === 'permissions') return savePermissions(formData, data);

  if (type === 'user') {
    if (!currentUser()?.isSuperAdmin) return requirePermission('manage_users');
    const email = normalizeEmail(data.email);
    if (!email || !data.name || !data.password) return setState({ toast: 'Nombre, correo y contraseña son obligatorios.' });
    if (state.users.some((user) => user.email === email)) return setState({ toast: 'Ya existe un usuario con ese correo.' });
    const newUser = userEntity({ name: data.name, email, password: data.password, leadAccess: data.leadAccess || 'assigned', status: 'active', approvedAt: new Date().toISOString() });
    return setState({ users: [...state.users, newUser], drawer: null, toast: `Usuario creado: ${data.name}` });
  }

  if (type === 'service') {
    if (!currentUser()?.isSuperAdmin) return requirePermission('manage_quote_pricing');
    const service = serviceEntity({ id: data.internalId, name: data.name, category: data.category, description: data.description, listPrice: data.listPrice, internalCost: data.internalCost, active: formData.get('active') === 'on', notes: data.notes });
    const existingId = data.id;
    return setState({
      serviceCatalog: existingId ? state.serviceCatalog.map((item) => item.id === existingId ? service : item) : [service, ...state.serviceCatalog],
      drawer: null,
      toast: existingId ? 'Servicio actualizado' : 'Servicio creado',
    });
  }

  if (type === 'lead') {
    if (state.drawer.mode === 'edit' && !requirePermission('edit_leads')) return;
    if (state.drawer.mode !== 'edit' && !requirePermission('create_leads')) return;
    const user = currentUser();
    const payload = leadEntity({ ...data, guests: Number(data.guests || 0), potential: Number(data.potential || 0), services: formData.getAll('services') });
    if (state.drawer.mode === 'edit') return updateLead(lead.id, { ...payload, id: lead.id, ownerUserId: lead.ownerUserId, owner: lead.owner, createdAt: lead.createdAt }, 'Lead actualizado');
    const newLead = { ...payload, ownerUserId: user.id, owner: user.name };
    const eventLog = timelineEntity({ leadId: newLead.id, type: 'Cambios importantes', title: 'Lead creado', preview: 'Nuevo lead registrado en TOP CRM.', detail: 'Se capturaron los datos iniciales del prospecto.', channel: 'Sistema' });
    return setState({ leads: [newLead, ...state.leads], timelineEvents: [eventLog, ...state.timelineEvents], selectedLeadId: newLead.id, drawer: null, toast: 'Lead creado' });
  }

  if (type === 'quote') {
    if (!requirePermission('view_quotes')) return;
    const quoteLead = state.leads.find((item) => item.id === data.leadId) || lead;
    const existing = state.quotes.find((item) => item.id === data.quoteId);
    const priceAllowed = canManageQuotePricing();
    const items = parseQuoteItems(formData, existing, priceAllowed);
    const discount = priceAllowed ? data.discount : existing?.discount || 0;
    const discountType = priceAllowed ? data.discountType : existing?.discountType || 'fixed';
    const totals = quoteTotals({ items, discount, discountType, ivaEnabled: formData.get('ivaEnabled') === 'on' });
    const version = existing?.version || nextQuoteVersion(quoteLead.id);
    const uploaded = formData.get('file') ? await uploadedFileFromForm(formData, data.fileName || `Cotizacion_${safeFileName(quoteLead.name)}_V${version}.pdf`, 'PDF', quoteLead.id) : null;
    const quote = quoteEntity({
      ...(existing || {}),
      leadId: quoteLead.id,
      amount: totals.total,
      status: data.status,
      version,
      services: quoteLead.services,
      items,
      categoryOrder: formData.getAll('categoryName').map(String).filter(Boolean),
      discount,
      discountType,
      ivaEnabled: formData.get('ivaEnabled') === 'on',
      validity: data.validity,
      terms: data.terms,
      notes: data.notes,
      showValidity: formData.get('showValidity') === 'on',
      showTerms: formData.get('showTerms') === 'on',
      showNotes: formData.get('showNotes') === 'on',
      current: formData.get('current') === 'on',
      fileId: uploaded?.id || existing?.fileId || '',
      createdBy: existing?.createdBy || currentUser()?.name || 'Sistema',
    });
    const audit = quoteAuditEvents(existing, quote);
    const timeline = [
      auditQuoteEvent(quote, quoteLead, existing ? 'Cotización actualizada' : 'Cotización creada', data.status, `Cotizacion ${quoteCode(quote)} por ${money(quote.amount)}.`),
      ...audit,
    ];
    const nextQuotes = existing
      ? state.quotes.map((item) => item.id === quote.id ? quote : quote.current && item.leadId === quote.leadId ? { ...item, current: false } : item)
      : [quote, ...state.quotes.map((item) => quote.current && item.leadId === quote.leadId ? { ...item, current: false } : item)];
    return setState({
      leads: state.leads.map((item) => item.id === quoteLead.id ? { ...item, potential: quote.amount, updatedAt: new Date().toISOString() } : item),
      quotes: nextQuotes,
      files: uploaded ? [uploaded, ...state.files] : state.files,
      timelineEvents: [...timeline, ...state.timelineEvents],
      drawer: null,
      selectedLeadId: quoteLead.id,
      selectedQuoteId: quote.id,
      view: 'cotizaciones',
      toast: existing ? 'Cotizacion actualizada' : 'Cotizacion creada',
    });
  }

  if (type === 'followup') {
    if (!requirePermission('edit_leads')) return;
    const followup = followUpEntity({ leadId: lead.id, action: data.action, dueAt: data.dueAt, objective: data.objective });
    const timeline = timelineEntity({ leadId: lead.id, type: 'Seguimiento agendado', title: data.action, preview: datetimeLabel(data.dueAt), detail: data.objective, channel: 'Llamada', relatedEntityType: 'FollowUp', relatedEntityId: followup.id });
    return setState({ followUps: [followup, ...state.followUps], timelineEvents: [timeline, ...state.timelineEvents], drawer: null, toast: 'Seguimiento agendado' });
  }

  if (type === 'stage') return requirePermission('move_leads') && updateLead(lead.id, { stage: data.stage }, 'Etapa actualizada');
  if (type === 'priority') return requirePermission('edit_leads') && updateLead(lead.id, { priority: data.priority }, 'Prioridad actualizada');

  if (type === 'file') {
    if (!requirePermission('upload_files')) return;
    const uploaded = await uploadedFileFromForm(formData, '', data.kind, lead.id);
    if (!uploaded) return setState({ toast: 'Selecciona un archivo' });
    const timeline = timelineEntity({ leadId: lead.id, type: 'Archivos enviados', title: 'Archivo enviado', preview: uploaded.name, detail: `${uploaded.kind} subido por ${uploaded.uploadedBy}.`, channel: 'Archivo', relatedEntityType: 'File', relatedEntityId: uploaded.id });
    return setState({ files: [uploaded, ...state.files], timelineEvents: [timeline, ...state.timelineEvents], drawer: null, toast: 'Archivo subido' });
  }
}

function savePermissions(formData, data) {
  if (!currentUser()?.isSuperAdmin) return requirePermission('manage_users');
  const temporaryAdmin = formData.get('temporaryAdmin') === 'on';
  const permissions = sanitizePermissions(formData.getAll('permissions')).filter((permission) => temporaryAdmin || permission !== 'manage_users');
  if (data.subjectType === 'user') {
    return setState({
      users: state.users.map((user) => {
        if (user.id !== data.id) return user;
        if (user.isSuperAdmin) return userEntity({ ...user, permissions: allPermissions, leadAccess: 'all', temporaryAdmin: false });
        return userEntity({ ...user, permissions, leadAccess: data.leadAccess, temporaryAdmin, role: temporaryAdmin ? 'Administrador temporal' : 'Ejecutivo Comercial' });
      }),
      drawer: null,
      toast: 'Permisos actualizados',
    });
  }
  if (data.subjectType === 'request') {
    return setState({
      accessRequests: state.accessRequests.map((request) => request.id === data.id ? accessRequestEntity({ ...request, permissions, leadAccess: data.leadAccess, temporaryAdmin }) : request),
      drawer: null,
      toast: 'Permisos de solicitud guardados',
    });
  }
}

function approveRequest(id) {
  if (!currentUser()?.isSuperAdmin) return requirePermission('manage_users');
  const request = state.accessRequests.find((item) => item.id === id);
  if (!request) return;
  const user = userEntity({
    name: request.name,
    email: request.email,
    password: request.password,
    position: request.position,
    message: request.message,
    temporaryAdmin: request.temporaryAdmin,
    leadAccess: request.leadAccess,
    permissions: request.permissions,
    status: 'active',
    approvedAt: new Date().toISOString(),
  });
  setState({
    users: [user, ...state.users],
    accessRequests: state.accessRequests.map((item) => item.id === id ? accessRequestEntity({ ...item, status: 'approved', decidedAt: new Date().toISOString() }) : item),
    toast: `Usuario aprobado: ${request.name}`,
  });
}

function rejectRequest(id) {
  if (!currentUser()?.isSuperAdmin) return requirePermission('manage_users');
  const request = state.accessRequests.find((item) => item.id === id);
  setState({
    accessRequests: state.accessRequests.map((item) => item.id === id ? accessRequestEntity({ ...item, status: 'rejected', decidedAt: new Date().toISOString() }) : item),
    toast: request ? `Solicitud rechazada: ${request.name}` : 'Solicitud rechazada',
  });
}

function toggleService(id) {
  if (!currentUser()?.isSuperAdmin) return requirePermission('manage_quote_pricing');
  setState({
    serviceCatalog: state.serviceCatalog.map((service) => service.id === id ? serviceEntity({ ...service, active: !service.active, updatedAt: new Date().toISOString() }) : service),
    toast: 'Servicio actualizado',
  });
}

function deleteService(id) {
  if (!currentUser()?.isSuperAdmin) return requirePermission('manage_quote_pricing');
  const service = state.serviceCatalog.find((item) => item.id === id);
  if (!service) return;
  if (!window.confirm('¿Seguro que deseas eliminar este servicio del catálogo?')) return;
  const used = state.quotes.some((quote) => quote.items.some((item) => item.serviceId === id));
  setState({
    serviceCatalog: used
      ? state.serviceCatalog.map((item) => item.id === id ? serviceEntity({ ...item, active: false, updatedAt: new Date().toISOString() }) : item)
      : state.serviceCatalog.filter((item) => item.id !== id),
    toast: used ? 'Servicio usado en cotizaciones: se marcó como inactivo' : 'Servicio eliminado',
  });
}

function deleteUser(id) {
  if (!currentUser()?.isSuperAdmin) return requirePermission('manage_users');
  const user = state.users.find((u) => u.id === id);
  if (!user || user.isSuperAdmin) return;
  if (user.id === state.currentUserId) return setState({ toast: 'No puedes eliminar tu propia cuenta.' });
  if (!window.confirm(`¿Eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`)) return;
  setState({ users: state.users.filter((u) => u.id !== id), toast: `Usuario eliminado: ${user.name}` });
}

function toggleTemporaryAdmin(id) {
  if (!currentUser()?.isSuperAdmin) return requirePermission('manage_users');
  setState({
    users: state.users.map((user) => {
      if (user.id !== id || user.isSuperAdmin) return user;
      const temporaryAdmin = !user.temporaryAdmin;
      const permissions = temporaryAdmin ? sanitizePermissions([...user.permissions, 'view_settings', 'view_reports', 'export_data']) : sanitizePermissions(user.permissions.filter((permission) => permission !== 'manage_users'));
      return userEntity({ ...user, temporaryAdmin, role: temporaryAdmin ? 'Administrador temporal' : 'Ejecutivo Comercial', permissions });
    }),
    toast: 'Permiso temporal actualizado',
  });
}

function createDraftQuote(leadId) {
  if (!requirePermission('view_quotes')) return;
  const lead = state.leads.find((item) => item.id === leadId) || selectedLead();
  if (!lead || !canAccessLead(lead)) return requirePermission('view_quotes');
  const quote = quoteEntity({
    leadId: lead.id,
    codeBase: nextQuoteCodeBase(),
    status: 'Borrador',
    version: nextQuoteVersion(lead.id),
    services: lead.services,
    items: [],
    categoryOrder: [],
    current: !leadQuotes(lead.id).length,
    createdBy: currentUser()?.name || 'Sistema',
  });
  setState({ quotes: [quote, ...state.quotes], timelineEvents: [auditQuoteEvent(quote, lead, 'Cotización creada', quote.status, `Se creo ${quoteCode(quote)}.`), ...state.timelineEvents], selectedQuoteId: quote.id, selectedLeadId: lead.id, view: 'cotizaciones', toast: `${quoteCode(quote)} creada` });
}

function duplicateQuote(id) {
  if (!requirePermission('view_quotes')) return;
  const quote = state.quotes.find((item) => item.id === id);
  if (!quote) return;
  const lead = state.leads.find((item) => item.id === quote.leadId);
  if (!lead || !canAccessLead(lead)) return requirePermission('view_quotes');
  const makeCurrent = window.confirm('¿Deseas marcar esta nueva versión como vigente?');
  const copy = quoteEntity({
    ...quote,
    id: entityId('quote'),
    version: nextQuoteVersion(quote.leadId),
    status: 'Borrador',
    current: makeCurrent,
    createdBy: currentUser()?.name || 'Sistema',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const timeline = timelineEntity({ leadId: quote.leadId, type: 'Cotización enviada', title: `Cotizacion V${copy.version} duplicada`, preview: 'Nueva version borrador.', detail: `Se duplico la V${quote.version} para crear una nueva version editable.`, channel: 'Sistema', relatedEntityType: 'Quote', relatedEntityId: copy.id });
  const audit = auditQuoteEvent(copy, lead, 'Cotización duplicada', quoteCode(copy), `Se duplico ${quoteCode(quote)} como ${quoteCode(copy)}.`);
  setState({
    quotes: [copy, ...state.quotes.map((item) => makeCurrent && item.leadId === quote.leadId ? { ...item, current: false } : item)],
    timelineEvents: [audit, timeline, ...state.timelineEvents],
    selectedQuoteId: copy.id,
    selectedLeadId: quote.leadId,
    view: 'cotizaciones',
    toast: `${quoteCode(copy)} creada`,
  });
}

function markQuoteCurrent(id) {
  const quote = state.quotes.find((item) => item.id === id);
  const lead = quote && state.leads.find((item) => item.id === quote.leadId);
  if (!quote || !lead) return;
  setState({
    quotes: state.quotes.map((item) => item.leadId === quote.leadId ? { ...item, current: item.id === id } : item),
    timelineEvents: [auditQuoteEvent(quote, lead, 'Cotización marcada como vigente', quoteCode(quote), `${quoteCode(quote)} quedó como versión vigente.`), ...state.timelineEvents],
    contextMenu: null,
    toast: 'Cotización marcada como vigente',
  });
}

function changeQuoteStatus(id) {
  const quote = state.quotes.find((item) => item.id === id);
  const lead = quote && state.leads.find((item) => item.id === quote.leadId);
  if (!quote || !lead) return;
  const status = window.prompt(`Nuevo estado: ${quoteStatuses.join(', ')}`, quote.status);
  if (!quoteStatuses.includes(status)) return setState({ contextMenu: null, toast: 'Estado no válido' });
  const next = quoteEntity({ ...quote, status, updatedAt: new Date().toISOString() });
  setState({
    quotes: state.quotes.map((item) => item.id === id ? next : item),
    timelineEvents: [auditQuoteEvent(next, lead, 'Estado de cotización actualizado', status, `${quoteCode(next)} cambio a ${status}.`), ...state.timelineEvents],
    contextMenu: null,
    toast: 'Estado actualizado',
  });
}

function deleteQuote(id) {
  const quote = state.quotes.find((item) => item.id === id);
  const lead = quote && state.leads.find((item) => item.id === quote.leadId);
  if (!quote || !lead) return;
  if (!window.confirm('¿Seguro que deseas eliminar esta cotización?')) return setState({ contextMenu: null });
  const remaining = state.quotes.filter((item) => item.id !== id);
  setState({
    quotes: remaining,
    files: state.files.map((file) => file.quoteId === id ? { ...file, quoteId: '' } : file),
    timelineEvents: [auditQuoteEvent(quote, lead, 'Cotización eliminada', quoteCode(quote), `Se eliminó ${quoteCode(quote)}. El lead permanece activo.`), ...state.timelineEvents],
    selectedQuoteId: remaining.find((item) => item.leadId === lead.id)?.id || remaining[0]?.id || '',
    contextMenu: null,
    toast: 'Cotización eliminada',
  });
}

function parseQuoteItems(formData, existingQuote, priceAllowed) {
  const ids = formData.getAll('itemId');
  const categories = formData.getAll('itemCategory');
  const movedCategories = formData.getAll('itemMoveCategory');
  const categoryNames = formData.getAll('categoryName').map(String).filter(Boolean);
  const categoryRenameMap = new Map([...new Set(categories)].map((category, index) => [category, categoryNames[index] || category]));
  const serviceIds = formData.getAll('itemServiceId');
  const names = formData.getAll('itemName');
  const descriptions = formData.getAll('itemDescription');
  const quantities = formData.getAll('itemQuantity');
  const prices = formData.getAll('itemUnitPrice');
  return ids.map((id, index) => {
    const service = state.serviceCatalog.find((item) => item.id === serviceIds[index]);
    const originalCategory = categories[index] || service?.category || 'Otros';
    const selectedCategory = movedCategories[index] || originalCategory;
    const category = categoryRenameMap.get(selectedCategory) || selectedCategory;
    const previousItem = existingQuote?.items.find((item) => item.id === id);
    return quoteItemEntity({
      id,
      serviceId: serviceIds[index],
      category,
      name: names[index] || service?.name || '',
      description: descriptions[index] || service?.description || '',
      quantity: quantities[index],
      unitPrice: priceAllowed ? prices[index] : previousItem?.unitPrice ?? service?.listPrice ?? prices[index],
    });
  }).filter((item) => item.name || item.unitPrice || item.description);
}

function preventQuoteEnterSubmit(event) {
  if (event.key !== 'Enter') return;
  const target = event.target;
  if (!target?.matches?.('input, select')) return;
  event.preventDefault();
  target.blur();
}

function nextQuoteVersion(leadId) {
  return Math.max(0, ...leadQuotes(leadId).map((quote) => quote.version)) + 1;
}

function quoteItemsFromServices(selectedServices = [], amount = 0) {
  const serviceMap = {
    DJ: 'Audio profesional',
    Audio: 'Audio profesional',
    Iluminacion: 'Iluminación',
    'Pantalla LED': 'Video y pantallas',
    Pista: 'Producción y staff',
    'Efectos especiales': 'Efectos especiales',
    'Planta de luz': 'Producción y staff',
    'Produccion completa': 'Producción y staff',
  };
  const servicesForQuote = selectedServices.length ? selectedServices : ['Produccion completa'];
  const unit = Math.round(Number(amount || 0) / servicesForQuote.length) || 0;
  return servicesForQuote.map((service) => quoteItemEntity({
    category: serviceMap[service] || 'Otros',
    name: service,
    description: `Servicio de ${service.toLowerCase()} para evento premium.`,
    quantity: 1,
    unitPrice: unit,
  }));
}

function quoteTotals(quote) {
  const subtotal = (quote.items || []).reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  const rawDiscount = Number(quote.discount || 0);
  const discount = Math.min(quote.discountType === 'percent' ? subtotal * rawDiscount / 100 : rawDiscount, subtotal);
  const taxable = Math.max(0, subtotal - discount);
  const iva = quote.ivaEnabled ? taxable * 0.16 : 0;
  return { subtotal, discount, iva, total: taxable + iva };
}

function quoteCategoryNames(items = [], order = []) {
  const names = [...order, ...quoteCategories, ...items.map((item) => item.category)].filter(Boolean);
  return [...new Set(names)].filter((category) => items.some((item) => item.category === category) || order.includes(category));
}

function quoteDateCode(value) {
  const date = new Date(value || Date.now());
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

function quoteCodeBase(createdAt = new Date().toISOString()) {
  return `TOP-${quoteDateCode(createdAt)}-001`;
}

function nextQuoteCodeBase(createdAt = new Date().toISOString()) {
  const dateCode = quoteDateCode(createdAt);
  const used = state?.quotes?.filter((quote) => quote.codeBase?.startsWith(`TOP-${dateCode}-`)).map((quote) => Number(quote.codeBase.split('-')[2])) || [];
  const consecutive = Math.max(0, ...used) + 1;
  return `TOP-${dateCode}-${String(consecutive).padStart(3, '0')}`;
}

function quoteCode(quote) {
  if (!quote) return 'Sin cotizacion';
  return `${quote.codeBase || quoteCodeBase(quote.createdAt)}-V${quote.version}`;
}

function auditQuoteEvent(quote, lead, title, preview, detail) {
  return timelineEntity({ leadId: lead.id, type: 'Cotización enviada', title, preview: `${quoteCode(quote)} · ${preview}`, detail, channel: 'Sistema', owner: currentUser()?.name || 'Sistema', relatedEntityType: 'Quote', relatedEntityId: quote.id });
}

function quoteAuditEvents(previous, next) {
  if (!previous) return [];
  const lead = state.leads.find((item) => item.id === next.leadId);
  if (!lead) return [];
  const events = [];
  if (previous.status !== next.status) events.push(auditQuoteEvent(next, lead, 'Estado de cotización actualizado', next.status, `${quoteCode(next)} cambio de ${previous.status} a ${next.status}.`));
  if (JSON.stringify(previous.items.map(({ id, unitPrice }) => ({ id, unitPrice }))) !== JSON.stringify(next.items.map(({ id, unitPrice }) => ({ id, unitPrice })))) events.push(auditQuoteEvent(next, lead, 'Precio de cotización actualizado', money(next.amount), `Se actualizaron precios en ${quoteCode(next)}.`));
  if (previous.discount !== next.discount || previous.discountType !== next.discountType) events.push(auditQuoteEvent(next, lead, 'Descuento aplicado', next.discountType === 'percent' ? `${next.discount}%` : money(next.discount), `Se aplico descuento en ${quoteCode(next)}.`));
  return events;
}

function mutateQuoteStructure(action, dataset) {
  if (!canManageQuotePricing() && ['delete-category', 'duplicate-category', 'move-category-up', 'move-category-down'].includes(action)) return setState({ toast: 'No tienes permiso para editar categorías.' });
  const quote = state.quotes.find((item) => item.id === dataset.quote);
  if (!quote) return;
  const category = dataset.category;
  const items = [...quote.items];
  let categoryOrder = quoteCategoryNames(items, quote.categoryOrder);
  let patch = {};
  if (action === 'add-quote-category') {
    if (!canManageQuotePricing()) return setState({ toast: 'No tienes permiso para editar categorías.' });
    const name = window.prompt('Nombre de la nueva categoría', 'Nueva categoría');
    if (!name) return;
    categoryOrder.push(name);
    items.push(quoteItemEntity({ category: name, name: '', quantity: 1, unitPrice: 0 }));
  }
  if (action === 'clear-terms-block') {
    patch = { terms: '', showTerms: false };
  }
  if (action === 'add-quote-item') items.push(quoteItemEntity({ category, name: '', quantity: 1, unitPrice: 0 }));
  if (action === 'add-custom-quote-item') {
    if (!canManageQuotePricing()) return setState({ toast: 'No tienes permiso para crear conceptos personalizados con precio libre.' });
    items.push(quoteItemEntity({ category, name: 'Concepto personalizado', quantity: 1, unitPrice: 0 }));
  }
  if (action === 'duplicate-quote-item') {
    const item = items.find((entry) => entry.id === dataset.item);
    if (item) items.push(quoteItemEntity({ ...item, id: entityId('quote-item'), name: `${item.name} copia` }));
  }
  if (action === 'delete-quote-item') {
    const index = items.findIndex((entry) => entry.id === dataset.item);
    if (index >= 0) items.splice(index, 1);
  }
  if (action === 'delete-category') {
    categoryOrder = categoryOrder.filter((entry) => entry !== category);
    for (let index = items.length - 1; index >= 0; index -= 1) if (items[index].category === category) items.splice(index, 1);
  }
  if (action === 'duplicate-category') {
    const newCategory = `${category} copia`;
    categoryOrder.splice(categoryOrder.indexOf(category) + 1, 0, newCategory);
    items.filter((item) => item.category === category).forEach((item) => items.push(quoteItemEntity({ ...item, id: entityId('quote-item'), category: newCategory })));
  }
  if (action === 'move-category-up' || action === 'move-category-down') {
    const from = categoryOrder.indexOf(category);
    const to = action === 'move-category-up' ? from - 1 : from + 1;
    if (from >= 0 && to >= 0 && to < categoryOrder.length) {
      const [moved] = categoryOrder.splice(from, 1);
      categoryOrder.splice(to, 0, moved);
    }
  }
  const next = quoteEntity({ ...quote, ...patch, items, categoryOrder, updatedAt: new Date().toISOString() });
  setState({ quotes: state.quotes.map((item) => item.id === quote.id ? next : item), contextMenu: null, toast: 'Cotizacion actualizada' });
}

function moveQuoteItem(quoteId, itemId) {
  const quote = state.quotes.find((item) => item.id === quoteId);
  const item = quote?.items.find((entry) => entry.id === itemId);
  if (!quote || !item) return;
  const categories = quoteCategoryNames(quote.items, quote.categoryOrder);
  const category = window.prompt(`Mover a categoría: ${categories.join(', ')}`, item.category);
  if (!categories.includes(category)) return setState({ contextMenu: null, toast: 'Categoría no válida' });
  const next = quoteEntity({ ...quote, items: quote.items.map((entry) => entry.id === itemId ? { ...entry, category } : entry), updatedAt: new Date().toISOString() });
  setState({ quotes: state.quotes.map((entry) => entry.id === quoteId ? next : entry), contextMenu: null, toast: 'Concepto movido' });
}

function requestDiscountAuthorization(id) {
  const quote = state.quotes.find((item) => item.id === id);
  if (!quote) return;
  const discountType = window.confirm('¿Solicitar descuento porcentual? Aceptar = porcentaje, Cancelar = monto fijo.') ? 'percent' : 'fixed';
  const rawAmount = window.prompt(discountType === 'percent' ? '¿Qué porcentaje deseas solicitar?' : '¿Qué monto fijo deseas solicitar?', discountType === 'percent' ? '5' : '1000');
  const amount = Number(rawAmount || 0);
  if (!amount || amount < 0) return setState({ toast: 'Solicitud de descuento cancelada' });
  const request = discountRequestEntity({ quoteId: quote.id, leadId: quote.leadId, amount, discountType });
  const lead = state.leads.find((item) => item.id === quote.leadId);
  setState({
    discountRequests: [request, ...state.discountRequests],
    timelineEvents: lead ? [auditQuoteEvent(quote, lead, 'Descuento solicitado', request.discountType === 'percent' ? `${request.amount}%` : money(request.amount), `Se solicito autorizacion de descuento para ${quoteCode(quote)}.`), ...state.timelineEvents] : state.timelineEvents,
    toast: 'Solicitud de descuento enviada al Super Administrador',
  });
}

function approveDiscountRequest(id) {
  if (!currentUser()?.isSuperAdmin) return requirePermission('manage_quote_pricing');
  const request = state.discountRequests.find((item) => item.id === id);
  const quote = request && state.quotes.find((item) => item.id === request.quoteId);
  const lead = quote && state.leads.find((item) => item.id === quote.leadId);
  if (!request || !quote || !lead) return;
  const updatedQuote = quoteEntity({ ...quote, discount: request.amount, discountType: request.discountType, amount: quoteTotals({ ...quote, discount: request.amount, discountType: request.discountType }).total, updatedAt: new Date().toISOString() });
  setState({
    quotes: state.quotes.map((item) => item.id === quote.id ? updatedQuote : item),
    discountRequests: state.discountRequests.map((item) => item.id === id ? discountRequestEntity({ ...item, status: 'approved', decidedAt: new Date().toISOString() }) : item),
    timelineEvents: [auditQuoteEvent(updatedQuote, lead, 'Descuento aprobado', request.discountType === 'percent' ? `${request.amount}%` : money(request.amount), `Se aprobo y aplico descuento para ${quoteCode(updatedQuote)}.`), ...state.timelineEvents],
    toast: 'Descuento aprobado',
  });
}

function completeFollowup() {
  if (!requirePermission('edit_leads')) return;
  const lead = selectedLead();
  const followup = currentFollowup(lead.id);
  if (!followup) return setState({ toast: 'No hay seguimiento activo' });
  const completedAt = new Date().toISOString();
  const timeline = timelineEntity({ leadId: lead.id, type: 'Seguimiento realizado', title: followup.action, preview: 'Seguimiento completado.', detail: `Se marco como realizado: ${followup.action}.`, channel: 'Llamada', relatedEntityType: 'FollowUp', relatedEntityId: followup.id });
  setState({
    followUps: state.followUps.map((item) => item.id === followup.id ? { ...item, completedAt } : item),
    timelineEvents: [timeline, ...state.timelineEvents],
    drawer: null,
    toast: 'Seguimiento marcado como realizado',
  });
}

function updateLead(id, patch, message) {
  const lead = state.leads.find((item) => item.id === id);
  const nextStage = patch.stage ?? lead?.stage;
  const closingLead = nextStage && ['Evento realizado', 'Lead perdido'].includes(nextStage);
  const reopeningLead = lead?.priority === 'cerrado' && nextStage && !['Evento realizado', 'Lead perdido'].includes(nextStage);
  const finalPatch = {
    ...patch,
    ...(closingLead ? { priority: 'cerrado' } : {}),
    ...(reopeningLead ? { priority: 'seguimiento' } : {}),
  };
  const timeline = patch.stage && lead?.stage !== patch.stage
    ? [timelineEntity({
      leadId: id,
      type: closingLead ? patch.stage : 'Cambio de etapa',
      title: closingLead ? patch.stage : 'Cambio de etapa',
      preview: `${lead.stage} → ${patch.stage}`,
      detail: closingLead
        ? `El lead paso a ${patch.stage}. Se cancelo cualquier seguimiento operativo pendiente y la prioridad cambio a CERRADO.`
        : `El lead cambio de etapa: ${lead.stage} → ${patch.stage}.`,
      channel: 'Sistema',
    })]
    : [];
  const canceledAt = closingLead ? new Date().toISOString() : '';
  setState({
    leads: state.leads.map((item) => item.id === id ? { ...item, ...finalPatch, updatedAt: new Date().toISOString() } : item),
    followUps: closingLead
      ? state.followUps.map((item) => item.leadId === id && !item.completedAt && !item.canceledAt ? { ...item, canceledAt } : item)
      : state.followUps,
    timelineEvents: [...timeline, ...state.timelineEvents],
    selectedLeadId: id,
    drawer: null,
    toast: message,
  });
  window.setTimeout(() => {
    if (state.toast === message) setState({ toast: '' });
  }, 2200);
}

function urgentFollowupAlert() {
  return visibleLeads()
    .map((lead) => ({ lead, followup: currentFollowup(lead.id) }))
    .find(({ lead, followup }) => !isInactiveLead(lead) && followup && followupStatus(followup) === 'urgente' && state.dismissedUrgentId !== `${lead.id}-${followup.id}`);
}

function followupStatus(followup) {
  if (!followup) return null;
  if (followup.completedAt) return 'realizado';
  if (!followup.dueAt) return 'programado';
  const due = new Date(followup.dueAt).getTime();
  if (Number.isNaN(due)) return 'programado';
  const now = Date.now();
  if (now > due + 30 * 60 * 1000) return 'vencido';
  if (now >= due - 10 * 60 * 1000) return 'urgente';
  return 'programado';
}

function followupStatusWeight(status) {
  return { vencido: 0, urgente: 1, programado: 2, realizado: 9 }[status] ?? 8;
}

function priorityWeight(priority) {
  return { urgente: 0, caliente: 1, riesgo: 2, seguimiento: 3, tibio: 4, bajo: 5 }[priority] ?? 9;
}

function isInactiveLead(lead) {
  return ['Evento realizado', 'Lead perdido'].includes(lead.stage);
}

function normalize(value) {
  return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function money(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(Number(value || 0));
}

function dateLabel(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function datetimeLabel(value) {
  if (!value) return 'Sin programar';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'TOP';
}

function isUpcoming(value) {
  if (!value) return false;
  const diff = new Date(value).getTime() - Date.now();
  return diff > 0 && diff / 86400000 <= 30;
}

function fieldRows(rows) {
  return `<dl class="field-rows">${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
}

function badge(type, label = priorityMeta[type]?.label ?? type) {
  return `<span class="badge ${priorityMeta[type]?.tone ?? type}"><i></i>${label}</span>`;
}

function followupBadge(status) {
  if (!status) return '<span class="badge programado"><i></i>Sin seguimiento</span>';
  const meta = followupStatusMeta[status];
  return `<span class="badge ${meta.tone}"><i></i>${meta.label}</span>`;
}

function urgentPopup(lead, followup) {
  return `<aside class="urgent-popup"><div class="section-head"><div><span class="badge urgente"><i></i>ATENCIÓN URGENTE</span><h3>Tienes un seguimiento pendiente con ${lead.name}</h3></div><button class="icon-button" type="button" data-action="dismiss-urgent" data-lead="${lead.id}" data-followup="${followup.id}">×</button></div>${fieldRows([['Lead', lead.name], ['Tipo de evento', lead.eventType], ['Accion pendiente', followup.action], ['Hora', datetimeLabel(followup.dueAt)]])}<button class="primary-button" type="button" data-action="go-alert-lead" data-lead="${lead.id}" data-followup="${followup.id}">Ir al lead</button></aside>`;
}

function timelineTone(item) {
  if (item.type === 'Seguimiento realizado') return 'realizado';
  if (item.type === 'Seguimiento agendado') return 'programado';
  if (item.type === 'Cotización enviada') return 'seguimiento';
  return 'normal';
}

function inferTimelineType(title) {
  const value = normalize(title);
  if (value.includes('mensaje')) return 'Mensaje recibido';
  if (value.includes('cotizacion')) return 'Cotización enviada';
  if (value.includes('agendado')) return 'Seguimiento agendado';
  if (value.includes('realizado') || value.includes('llamada realizada')) return 'Seguimiento realizado';
  if (value.includes('etapa')) return 'Cambio de etapa';
  if (value.includes('archivo')) return 'Archivos enviados';
  if (value.includes('nota')) return 'Notas internas';
  return 'Cambios importantes';
}

function channelIcon(channel, type) {
  return ({ Llamada: '☎', WhatsApp: '◌', Email: '✉', Instagram: '◎', Sistema: '↻', Archivo: '▣' }[channel] ?? (type === 'Notas internas' ? '✎' : '•'));
}

function fileIcon(file) {
  if (file.kind === 'PDF' || file.mime?.includes('pdf')) return 'PDF';
  if (file.kind === 'Imagen' || file.mime?.startsWith('image/')) return 'IMG';
  if (file.kind === 'Video' || file.mime?.startsWith('video/')) return 'VID';
  return 'DOC';
}

function safeFileName(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'lead';
}

async function uploadedFileFromForm(formData, fallbackName, fallbackKind, leadId) {
  const file = formData.get('file');
  if (!(file instanceof File) || !file.name) return null;
  const dataUrl = await fileToDataUrl(file);
  return fileEntity({ leadId, name: fallbackName || file.name, kind: fallbackKind || fileKindFromMime(file.type), mime: file.type || 'application/octet-stream', dataUrl, uploadedBy: currentUser()?.name || 'Sistema' });
}

function fileKindFromMime(mime = '') {
  if (mime.includes('pdf')) return 'PDF';
  if (mime.startsWith('image/')) return 'Imagen';
  if (mime.startsWith('video/')) return 'Video';
  return 'Documento';
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function downloadFile(fileId) {
  const file = state.files.find((item) => item.id === fileId);
  if (!file?.dataUrl) return setState({ toast: 'Este archivo demo no tiene descarga local' });
  const anchor = document.createElement('a');
  anchor.href = file.dataUrl;
  anchor.download = file.name;
  anchor.click();
}

function sendQuoteWhatsApp(id) {
  const quote = state.quotes.find((item) => item.id === id);
  const lead = quote && state.leads.find((item) => item.id === quote.leadId);
  if (!quote || !lead) return;
  downloadQuotePdf(id, { silent: true });
  // Adjuntar PDF automáticamente por WhatsApp requiere WhatsApp Business API o backend externo.
  const message = `Hola ${lead.name.split(' ')[0]}.\n\nTe comparto la cotización ${quoteCode(quote)} para tu evento.\n\nEl archivo PDF se descargó automáticamente para que puedas adjuntarlo aquí.\n\nQuedo atento a cualquier duda.\n\nTOP Producciones.`;
  const digits = lead.phone.replace(/\D/g, '');
  const phone = digits.length >= 10 ? `52${digits.slice(-10)}` : '';
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  setState({ timelineEvents: [auditQuoteEvent(quote, lead, 'Cotización preparada para envío por WhatsApp', quoteCode(quote), `Se descargó PDF y se preparo WhatsApp para ${quoteCode(quote)}.`), ...state.timelineEvents], toast: 'El PDF se descargó correctamente. Adjunta el archivo manualmente en WhatsApp.' });
}

function sendQuoteEmail(id) {
  const quote = state.quotes.find((item) => item.id === id);
  const lead = quote && state.leads.find((item) => item.id === quote.leadId);
  if (!quote || !lead) return;
  const subject = `Cotización TOP Producciones V${quote.version}`;
  const body = `Hola ${lead.name.split(' ')[0]}.\n\nTe comparto la cotización para tu evento.\n\nQuedo atento a cualquier duda.\n\nSaludos.\nTOP Producciones.`;
  setState({ timelineEvents: [auditQuoteEvent(quote, lead, 'Cotización enviada por Email', quoteCode(quote), `Se preparo email para ${quoteCode(quote)}.`), ...state.timelineEvents] });
  window.location.href = `mailto:${lead.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function downloadQuotePdf(id, options = {}) {
  const quote = state.quotes.find((item) => item.id === id);
  const lead = quote && state.leads.find((item) => item.id === quote.leadId);
  if (!quote || !lead) return;
  const pdf = await buildQuotePdf(quote, lead);
  const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Cotizacion_${quoteCode(quote)}-${safeFileName(lead.name).replaceAll('_', '-')}.pdf`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  if (!options.silent) setState({ timelineEvents: [auditQuoteEvent(quote, lead, 'PDF descargado', quoteCode(quote), `Se descargó PDF para ${quoteCode(quote)}.`), ...state.timelineEvents], toast: 'PDF descargado' });
}

async function buildQuotePdf(quote, lead) {
  const logoSrc = await assetDataUrl('/assets/top-logo-light.png');
  const html = quotePdfCaptureHtml(quote, lead, logoSrc);
  const pageImages = await renderPdfHtmlPages(html);
  return imagePagesPdf(pageImages);
}

async function assetDataUrl(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function quotePdfCaptureHtml(quote, lead, logoSrc) {
  const totals = quoteTotals(quote);
  const grouped = quoteCategoryNames(quote.items, quote.categoryOrder)
    .map((category) => [category, quote.items.filter((item) => item.category === category && (item.name || item.unitPrice))])
    .filter(([, items]) => items.length);
  const optionalBlocks = [
    quote.showTerms && quote.terms ? ['Condiciones comerciales', quote.terms] : null,
    quote.showValidity && quote.validity ? ['Validez', quote.validity] : null,
    quote.showNotes && quote.notes ? ['Notas', quote.notes] : null,
  ].filter(Boolean);
  return `<div class="pdf-capture-page"><style>

    .pdf-capture-page{width:794px;min-height:1123px;padding:38px;background:#f7f8f7;color:#171b19;font-family:Inter,Arial,sans-serif;box-sizing:border-box}.pdf-capture-sheet{min-height:1047px;padding:36px;border:1px solid #dde3df;border-radius:10px;background:#fff;box-shadow:0 1px 2px rgba(18,22,20,.05);box-sizing:border-box}.pdf-capture-head{display:flex;align-items:flex-start;justify-content:space-between;gap:36px;padding-bottom:30px;border-bottom:3px solid #172f59}.pdf-capture-head img{width:126px;height:auto;display:block}.pdf-capture-code{text-align:right}.pdf-capture-code strong{display:block;color:#171b19;font-size:22px;line-height:1.2;font-weight:800}.pdf-capture-code span{display:block;margin-top:22px;color:#69716d;font-size:16px}.pdf-capture-meta{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:28px 0 28px}.pdf-capture-box{min-height:118px;padding:18px 20px;border:1px solid #dfe4e1;border-radius:10px;box-sizing:border-box}.pdf-capture-box p{margin:0 0 10px;color:#172f59;font-size:13px;font-weight:800;letter-spacing:0;text-transform:uppercase}.pdf-capture-box strong{display:block;margin-bottom:8px;color:#171b19;font-size:20px;line-height:1.18}.pdf-capture-box span{display:block;color:#69716d;font-size:16px;line-height:1.35}.pdf-capture-category{margin-top:24px}.pdf-capture-category h2{margin:0 0 14px;color:#172f59;font-size:19px;line-height:1.2}.pdf-capture-row{display:grid;grid-template-columns:1fr 70px 120px 120px;gap:12px;align-items:start;padding:12px 0 16px;border-bottom:1px solid #e8ece9}.pdf-capture-row strong{display:block;color:#171b19;font-size:18px;line-height:1.2}.pdf-capture-row small{display:block;margin-top:5px;color:#69716d;font-size:15px;line-height:1.35}.pdf-capture-row em,.pdf-capture-row b{color:#171b19;font-size:17px;font-style:normal;text-align:right}.pdf-capture-row em{color:#69716d}.pdf-capture-totals{width:330px;margin:26px 0 0 auto;padding:16px 22px;border:1px solid #dfe4e1;background:#f8faf9;box-sizing:border-box}.pdf-capture-totals div{display:flex;justify-content:space-between;gap:22px;padding:5px 0;color:#69716d;font-size:16px}.pdf-capture-totals b{color:#171b19}.pdf-capture-totals div:last-child{padding-top:10px;color:#172f59;font-size:20px;font-weight:800;text-transform:uppercase}.pdf-capture-totals div:last-child b{color:#172f59}.pdf-capture-terms{margin-top:34px;padding-top:22px;border-top:1px solid #dfe4e1}.pdf-capture-terms h2{margin:0 0 12px;color:#172f59;font-size:18px}.pdf-capture-terms p{margin:0 0 18px;color:#39413d;font-size:16px;line-height:1.55}
  </style><main class="pdf-capture-sheet"><section class="pdf-capture-head"><img src="${logoSrc}" alt="TOP producciones" /><div class="pdf-capture-code"><strong>${quoteCode(quote)}</strong><span>${escapeHtml(quote.status)} · ${dateLabel(quote.updatedAt)}</span></div></section><section class="pdf-capture-meta"><div class="pdf-capture-box"><p>Cliente</p><strong>${escapeHtml(lead.name)}</strong><span>${escapeHtml(lead.phone)}</span><span>${escapeHtml(lead.email || 'Sin correo')}</span></div><div class="pdf-capture-box"><p>Evento</p><strong>${escapeHtml(lead.eventType)}</strong><span>${dateLabel(lead.eventDate)} · ${escapeHtml(lead.venue)}</span><span>${lead.guests} invitados</span></div></section>${grouped.map(([category, items]) => `<section class="pdf-capture-category"><h2>${escapeHtml(category)}</h2>${items.map((item) => `<div class="pdf-capture-row"><span><strong>${escapeHtml(item.name || category)}</strong><small>${escapeHtml(item.description || '')}</small></span><em>${item.quantity}</em><em>${money(item.unitPrice)}</em><b>${money(item.amount)}</b></div>`).join('')}</section>`).join('')}<section class="pdf-capture-totals"><div><span>Subtotal</span><b>${money(totals.subtotal)}</b></div><div><span>Descuento</span><b>${money(totals.discount)}</b></div><div><span>IVA</span><b>${money(totals.iva)}</b></div><div><span>Total</span><b>${money(totals.total)}</b></div></section>${optionalBlocks.length ? `<section class="pdf-capture-terms">${optionalBlocks.map(([title, body]) => `<h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p>`).join('')}</section>` : ''}</main></div>`;
}

async function renderPdfHtmlPages(html) {
  const holder = document.createElement('div');
  holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;z-index:-1;pointer-events:none;';
  holder.innerHTML = html;
  document.body.appendChild(holder);
  await Promise.all(Array.from(holder.querySelectorAll('img')).map((image) => image.decode?.().catch(() => {}) || Promise.resolve()));
  const width = 794;
  const height = Math.max(1123, Math.ceil(holder.scrollHeight));
  document.body.removeChild(holder);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${html}</div></foreignObject></svg>`;
  const image = new Image();
  image.decoding = 'sync';
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext('2d');
  context.fillStyle = '#f7f8f7';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const sourcePageHeight = Math.floor(width * (792 / 612));
  const pages = [];
  for (let offset = 0; offset < height; offset += sourcePageHeight) {
    const sliceHeight = Math.min(sourcePageHeight, height - offset);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = width * scale;
    pageCanvas.height = sourcePageHeight * scale;
    const pageContext = pageCanvas.getContext('2d');
    pageContext.fillStyle = '#f7f8f7';
    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    pageContext.drawImage(canvas, 0, offset * scale, width * scale, sliceHeight * scale, 0, 0, width * scale, sliceHeight * scale);
    pages.push({ width: pageCanvas.width, height: pageCanvas.height, bytes: dataUrlBytes(pageCanvas.toDataURL('image/jpeg', 0.94)) });
  }
  return pages;
}

function imagePagesPdf(images) {
  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };
  const pageIds = [];
  images.forEach((image, index) => {
    const imageId = addObject(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>
stream
${binaryFromBytes(image.bytes)}
endstream`);
    const content = `q 612 0 0 792 0 0 cm /Im${index + 1} Do Q`;
    const contentId = addObject(`<< /Length ${content.length} >>
stream
${content}
endstream`);
    const pageId = addObject(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im${index + 1} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });
  const pagesId = addObject(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`);
  pageIds.forEach((id) => { objects[id - 1] = objects[id - 1].replace('/Parent 0 0 R', `/Parent ${pagesId} 0 R`); });
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  let output = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(output.length);
    output += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = output.length;
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes = new Uint8Array(output.length);
  for (let index = 0; index < output.length; index += 1) bytes[index] = output.charCodeAt(index) & 255;
  return bytes;
}

function dataUrlBytes(dataUrl) {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function binaryFromBytes(bytes) {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 8192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
  }
  return binary;
}

function styledPdf(pageStreams) {
  const pageWidth = 612;
  const pageHeight = 792;
  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };
  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const boldFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const pageIds = [];
  pageStreams.forEach((content) => {
    const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });
  const pagesId = addObject(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`);
  pageIds.forEach((id) => { objects[id - 1] = objects[id - 1].replace('/Parent 0 0 R', `/Parent ${pagesId} 0 R`); });
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  let output = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(output.length);
    output += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = output.length;
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Uint8Array([...output].map((char) => char.charCodeAt(0)));
}

function pdfText(ops, text, x, y, size = 10, color = '171B19', bold = false) {
  const [r, g, b] = pdfColor(color);
  ops.push(`BT ${r} ${g} ${b} rg /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${pdfEscape(text)}) Tj ET`);
}

function pdfRect(ops, x, y, width, height, color) {
  const [r, g, b] = pdfColor(color);
  ops.push(`${r} ${g} ${b} rg ${x} ${y} ${width} ${height} re f`);
}

function pdfBox(ops, x, y, width, height, fill, stroke) {
  const [fr, fg, fb] = pdfColor(fill);
  const [sr, sg, sb] = pdfColor(stroke);
  ops.push(`${fr} ${fg} ${fb} rg ${sr} ${sg} ${sb} RG ${x} ${y} ${width} ${height} re B`);
}

function pdfLine(ops, x1, y1, x2, y2, color, width = 1) {
  const [r, g, b] = pdfColor(color);
  ops.push(`${r} ${g} ${b} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
}

function pdfColor(hex) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((index) => (parseInt(value.slice(index, index + 2), 16) / 255).toFixed(3));
}

function wrapPdfText(value, maxChars) {
  const words = String(value || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    if (`${line} ${word}`.trim().length > maxChars) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  });
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function pdfEscape(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[()\\]/g, '\\$&').slice(0, 150);
}

function printableQuoteHtml(quote, lead) {
  const totals = quoteTotals(quote);
  const grouped = quoteCategoryNames(quote.items, quote.categoryOrder).map((category) => [category, quote.items.filter((item) => item.category === category && (item.name || item.unitPrice))]).filter(([, items]) => items.length);
  return `<!doctype html><html><head><meta charset="utf-8"><title>Cotizacion TOP V${quote.version}</title><style>
    body{font-family:Inter,Arial,sans-serif;margin:0;color:#171b19;background:#f4f6f5}.page{width:820px;margin:24px auto;background:white;padding:42px;border:1px solid #dde2df}.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid ${TOP_BLUE};padding-bottom:22px}.head img{width:92px}.head strong{font-size:22px}.muted{color:#69716d;font-size:12px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:26px 0}.box{border:1px solid #e2e5e3;border-radius:8px;padding:14px}.box p{margin:0 0 8px;color:${TOP_BLUE};font-size:11px;font-weight:800;text-transform:uppercase}.box strong,.box span{display:block}.cat{margin-top:20px}.cat h2{font-size:14px;margin:0 0 8px;color:${TOP_BLUE}}.row{display:grid;grid-template-columns:1fr 54px 108px 108px;gap:10px;border-bottom:1px solid #e8ebe9;padding:10px 0}.row small{display:block;color:#69716d;margin-top:3px}.row em{font-style:normal;text-align:right;color:#69716d}.row b{text-align:right}.totals{margin:24px 0 0 auto;width:320px}.totals div{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e8ebe9}.totals div:last-child{font-size:20px;font-weight:800;color:${TOP_BLUE}}.terms{margin-top:28px;border-top:1px solid #e2e5e3;padding-top:18px}.terms h2{font-size:13px;margin:14px 0 6px;color:${TOP_BLUE}}.terms p{margin:0;color:#39413d;line-height:1.5}@media print{body{background:white}.page{margin:0;border:0;width:auto;min-height:100vh}}
  </style></head><body><main class="page"><section class="head"><img src="${location.origin}/assets/top-logo-light.png" alt="TOP"><div><strong>${quoteCode(quote)}</strong><div class="muted">${quote.status} · ${dateLabel(quote.updatedAt)}</div></div></section><section class="meta"><div class="box"><p>Cliente</p><strong>${escapeHtml(lead.name)}</strong><span>${escapeHtml(lead.phone)}</span><span>${escapeHtml(lead.email || 'Sin correo')}</span></div><div class="box"><p>Evento</p><strong>${escapeHtml(lead.eventType)}</strong><span>${dateLabel(lead.eventDate)} · ${escapeHtml(lead.venue)}</span><span>${lead.guests} invitados</span></div></section>${grouped.map(([category, items]) => `<section class="cat"><h2>${category}</h2>${items.map((item) => `<div class="row"><span><strong>${escapeHtml(item.name || category)}</strong><small>${escapeHtml(item.description || '')}</small></span><em>${item.quantity}</em><em>${money(item.unitPrice)}</em><b>${money(item.amount)}</b></div>`).join('')}</section>`).join('')}<section class="totals"><div><span>Subtotal</span><b>${money(totals.subtotal)}</b></div><div><span>Descuento</span><b>${money(totals.discount)}</b></div><div><span>IVA</span><b>${money(totals.iva)}</b></div><div><span>Total</span><b>${money(totals.total)}</b></div></section>${(quote.showTerms && quote.terms) || (quote.showValidity && quote.validity) || (quote.showNotes && quote.notes) ? `<section class="terms">${quote.showTerms && quote.terms ? `<h2>Condiciones comerciales</h2><p>${escapeHtml(quote.terms)}</p>` : ''}${quote.showValidity && quote.validity ? `<h2>Validez</h2><p>${escapeHtml(quote.validity)}</p>` : ''}${quote.showNotes && quote.notes ? `<h2>Notas</h2><p>${escapeHtml(quote.notes)}</p>` : ''}</section>` : ''}</main></body></html>`;
}

function daysInStage(lead) {
  return Math.max(1, Math.round((Date.now() - new Date(lead.createdAt).getTime()) / 86400000));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (match) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[match]));
}

function hasActiveDraftInput() {
  const active = document.activeElement;
  return Boolean(document.querySelector('.drawer form[data-form], .quote-editor-card') || active?.closest?.('form[data-form]'));
}

render();
window.setInterval(() => {
  if (!hasActiveDraftInput()) render();
}, 60 * 1000);
