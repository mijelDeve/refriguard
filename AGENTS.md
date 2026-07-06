# AGENTS.md — proyecto-sistemas-digitales

## Dev commands
- `pnpm dev` — start dev server (Next.js 16 Turbopack)
- `pnpm build` — compila + typecheck + genera páginas estáticas
- `pnpm lint` — ESLint flat config (core-web-vitals + typescript)

## Arquitectura
- Next.js 16 App Router, React 19, Tailwind CSS v4, Supabase
- Single-page dashboard: `app/page.tsx` → `components/DashboardClient.tsx`
- API routes server-side bajo `app/api/`
- Todos los datos en Supabase PostgreSQL (2 tablas)

## Supabase
- Dos clientes según contexto:
  - **Server-side** (`lib/supabase.ts`): `SUPABASE_SERVICE_ROLE_KEY` (bypasea RLS)
  - **Client-side** (`DashboardClient.tsx`): `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Realtime)
- Realtime habilitado solo para INSERT en `lecturas_refrigerador` (`ALTER PUBLICATION supabase_realtime ADD TABLE lecturas_refrigerador;` — no está en migración)
- Migraciones SQL en `sql/`; aplicar via `supabase_apply_migration` MCP tool
- `.env` con 3 vars (gitignored); `.env.example` como template

## Convenciones
- Tailwind v4: `@import "tailwindcss"` (no `@tailwind` directives)
- Path alias `@/*` → raíz del proyecto (ej: `@/components/TemperatureCard`)
- Estados (normal/pre-alerta/alerta/mantenimiento) hardcodeados en `app/api/lecturas/route.ts:calcularEstado()` — no en DB
- Tipos en `lib/types.ts`; componentes en `components/`, todos "use client" menos layout
- Sin test framework, sin CI, sin codegen

## DB Operations
- Usar MCP tools: `supabase_execute_sql` (query), `supabase_apply_migration` (DDL)
- Seed data: INSERT directo SQL
- Tablas:
  - `lecturas_refrigerador` (id, created_at, temperatura, humedad, dispositivo_id, estado, mensaje_estado)
  - `historial_alertas` (id, created_at, lectura_id FK, temperatura, humedad, dispositivo_id, mensaje)

## Notas
- `.env*` en .gitignore — nunca committear credenciales
- MCP Supabase config en `C:\Users\mijel\.config\opencode\opencode.json` (tipo remote)
- README.md actualizado con documentación del proyecto

## Skills
- `frontend-design` — disponible en `.opencode/skills/frontend-design/SKILL.md`
