# TOP CRM — Codex Project

CRM comercial para TOP Producciones, empresa mexicana de producción de eventos premium.

## Stack

- **Frontend**: Vanilla JS + Vite (SPA, sin framework)
- **Estado**: `localStorage["top-crm-state-v2"]` — sin backend real todavía
- **Deploy**: Railway (`npm run start` → `vite preview`)
- **Entry point**: `src/app.js` (2700+ líneas, toda la lógica en un archivo)

## Skill instalado

Este proyecto incluye el skill `top-crm-agent` en `.claude/skills/top-crm-agent/`.

Cuando trabajes en este CRM, consulta siempre ese skill para:
- Entender el modelo de datos completo (entidades, esquemas, catálogos)
- Conocer las reglas de negocio y el sistema de permisos
- Seguir los flujos de trabajo correctos (leads, cotizaciones, seguimientos)
- Respetar las reglas de seguridad comercial

## Convenciones del código

- Todo el estado vive en el objeto `state` (en memoria) y se sincroniza a localStorage con `persist()`
- `setState(next)` merges, persiste y re-renderiza
- `render()` regenera todo el DOM desde cero
- Los campos transient (`drawer`, `toast`, `draggingLeadId`, `contextMenu`, `userMenuOpen`, `dismissedUrgentId`) NO se guardan en localStorage
- IDs: `entityType-${crypto.randomUUID()}` (ej: `lead-xxx`, `quote-xxx`, `followup-xxx`)
- Formularios usan `data-form="nombre"` y se procesan en `handleSubmit()`
- Acciones del UI usan `data-action="nombre"` y se despachan en `handleAction()`

## Usuarios por defecto

- **Super Admin**: djchavaorellana@gmail.com / admin123
- **Ejecutivo**: alejandro@topproducciones.com / demo123

## Decisiones de arquitectura importantes

- El CRM está diseñado para migrar a base de datos real: las entidades están separadas por ID con relaciones por `leadId`, `quoteId`, etc.
- No hay componentes ni framework; el HTML se genera como template strings y se inyecta en `#app`
- Los permisos se verifican con `can('permiso')` antes de cualquier acción sensible
- `crmInitialized: true` en el estado indica que ya se inicializó; los datos demo no deben recargarse si el usuario los borró
