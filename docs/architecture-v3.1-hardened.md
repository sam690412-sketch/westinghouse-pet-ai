# Westinghouse Pet Taiwan — Architecture v3.1 Hardened

## Document Information
- **Version**: v3.1 Hardened
- **Date**: 2026-05-25
- **Status**: Phase 3.1.1 — Architecture Hardening Revision
- **Based On**: Phase 3.1 Foundation Setup + Phase 2A Rev v2.1 + Phase 2B

---

## Executive Summary

This document hardens the existing architecture for production readiness. No stack changes. No version downgrades. All decisions are production-grade, implementable, and validated against the existing monorepo structure (Next.js 15, React 19, Supabase, Payload CMS 3.x, Railway, Turborepo, pnpm).

**Key Decisions**:
1. Shared types centralized in `@repo/shared` — single source of truth
2. Identity mapping uses `supabase_user_id` UUID as foreign key — email is mutable, UUID is not
3. Payload CMS shares Supabase PostgreSQL — eliminates dual-DB complexity, enables unified querying
4. Observability layer added with Sentry + structured logging + checkout failure monitoring
5. Async job queue uses `pgmq` extension — postgres-native, zero additional infrastructure

**Risk Level**: Low-Medium. All P0 items have clear implementation paths.

**Recommendation**: APPROVED for Phase 3.2 entry after P0 items are implemented.

---

## P0-1: Shared Types Single Source of Truth

### Problem
Types are scattered across:
- `apps/web/types/` — frontend types
- `apps/cms/collections/` — CMS collection types  
- `packages/shared/src/types/` — partially populated

This causes type drift, duplicate definitions, and broken contracts between frontend and backend.

### Decision
All domain types live in `packages/shared/src/types/`. Both `apps/web` and `apps/cms` import from `@repo/shared`.

### Revised Folder Structure

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── index.ts              # Public API barrel export
│   │   ├── database.ts           # Supabase table row types
│   │   ├── commerce.ts           # ProductCommerce, Cart, Order, Payment
│   │   ├── content.ts            # ProductContent, Article, Solution, Review
│   │   ├── member.ts             # Member, Role, Permission
│   │   ├── warranty.ts           # Warranty, Ticket, RepairStatus
│   │   ├── analytics.ts          # GA4/PostHog event types
│   │   └── api.ts                # API request/response types
│   ├── constants/
│   │   ├── products.ts           # SKU constants, category enums
│   │   ├── roles.ts              # RBAC role constants
│   │   └── solutions.ts          # Solution slug constants
│   ├── validators/
│   │   ├── slug.ts               # Slug validation (shared between web + cms)
│   │   ├── sku.ts                # SKU format validation
│   │   └── index.ts
│   └── index.ts                  # Barrel: export * from './types'; export * from './constants'
├── package.json                  # Name: "@repo/shared", private: true
└── tsconfig.json
```

### Type Governance Rules

**Must be in shared (domain types)**:
- `ProductContent` — frontend reads, CMS writes
- `ProductCommerce` — frontend reads, Supabase stores
- `Member`, `MemberRole` — auth + admin + member portal
- `Order`, `OrderItem`, `OrderStatus` — commerce + admin
- `Warranty`, `Ticket`, `TicketStatus` — support portal + admin
- `Review`, `ReviewStatus` — frontend display + admin moderation
- `CartItem` — client-side cart + checkout API
- `Payment`, `PaymentStatus` — checkout + webhook + admin
- `LearnArticle`, `Solution` — frontend reads, CMS writes
- `GA4Event`, `PostHogEvent` — analytics taxonomy (shared naming)

**Can remain local**:
- `ComponentProps` — React component props (web only)
- `CMSFieldConfig` — Payload field configuration (cms only)
- `AdminDashboardData` — admin-specific aggregation types (admin only)
- `PageParams` — Next.js route params (web only, per page)
- `FormSchema` — Zod schemas per form (web only)

### Import Convention

```typescript
// ✅ Correct
import { ProductContent, ProductCommerce } from '@repo/shared'
import { MemberRole } from '@repo/shared/constants'

// ❌ Incorrect — local type for domain model
import { ProductContent } from '../types/products'
```

### Migration Strategy

1. Move all domain types to `packages/shared/src/types/`
2. Delete duplicate types from `apps/web/types/` and `apps/cms/`
3. Update all imports to use `@repo/shared`
4. Add ESLint rule: `no-restricted-imports` to block `../types/` for domain types
5. CI check: `tsc --noEmit` in shared package before web/cms build

### Risk
- **Low**. Type-only changes, no runtime impact. TypeScript compiler catches any drift.

---

## P0-2: Identity Mapping Revision

### Problem
Current design: Payload User ↔ Supabase Auth linked by email. Email is mutable. Order ownership breaks if user changes email.

### Decision
Use `supabase_user_id` (UUID) as the canonical identity key. All tables reference `auth.users.id` directly.

### Schema Proposal

```sql
-- ============================================
-- Identity Mapping: supabase_user_id as FK
-- ============================================

-- 1. Members table (extends auth.users)
CREATE TABLE public.members (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Do NOT store email here — it's in auth.users.email
    -- Do NOT store password here — it's managed by Supabase Auth
    name TEXT,
    phone TEXT,
    address JSONB DEFAULT '{}',
    line_id TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'support', 'ops', 'marketing', 'admin', 'dealer')),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Orders — reference auth.users.id directly
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id),
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    -- ... rest of order fields
);

-- 3. Warranties — reference auth.users.id
CREATE TABLE public.warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    warranty_code TEXT UNIQUE NOT NULL,
    -- ... rest of warranty fields
);

-- 4. Tickets — reference auth.users.id
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    ticket_number TEXT UNIQUE NOT NULL,
    -- ... rest of ticket fields
);

-- 5. Payload CMS Users — ALSO reference auth.users.id
-- Payload's users collection adds supabase_user_id field
```

### Payload CMS User Collection (Updated)

```typescript
// apps/cms/src/collections/Users.ts
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,  // Payload still manages its own session for CMS login
  fields: [
    {
      name: 'supabaseUserId',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
      ],
      defaultValue: 'editor',
    },
  ],
}
```

### Relationship Diagram

```
auth.users (Supabase)
├── id: UUID (PRIMARY KEY)
├── email: TEXT
├── email_confirmed_at: TIMESTAMP
└── raw_user_meta_data: JSONB

    │ (id = members.id)
    ▼

public.members
├── id: UUID (PK, FK → auth.users.id)
├── name: TEXT
├── phone: TEXT
├── role: TEXT
└── line_id: TEXT

    │ (id = orders.member_id)
    │ (id = warranties.member_id)
    │ (id = tickets.member_id)
    ▼

public.orders / warranties / tickets
└── member_id: UUID (FK → public.members.id)

    │ (supabaseUserId)
    ▼

payload.users
├── id: SERIAL (Payload internal)
├── supabaseUserId: TEXT (UUID from auth.users)
├── email: TEXT
└── role: TEXT
```

### Identity Resolution Flow

```
User Login (Supabase Auth)
    │
    ├── Success → supabase.auth.getUser() → user.id (UUID)
    │
    ├── Check public.members WHERE id = user.id
    │       ├── Exists → Return member data
    │       └── Not exists → Create member record (id = user.id)
    │
    └── (Optional) Sync to Payload CMS
            ├── Check payload.users WHERE supabaseUserId = user.id
            ├── Exists → Update last login
            └── Not exists → Create CMS user (supabaseUserId = user.id)
```

### Migration Strategy

1. **New project**: Create `members` table with `id UUID REFERENCES auth.users(id)`
2. **Existing data**: If migrating from email-based linking:
   ```sql
   -- Migration script
   ALTER TABLE public.members 
   ADD COLUMN new_id UUID;
   
   UPDATE public.members m
   SET new_id = au.id
   FROM auth.users au
   WHERE m.email = au.email;
   
   -- Update FK references in orders, warranties, tickets
   -- Then swap columns
   ```
3. **Payload sync**: Use Supabase Auth trigger to sync to Payload:
   ```sql
   CREATE OR REPLACE FUNCTION sync_user_to_payload()
   RETURNS TRIGGER AS $$
   BEGIN
     -- Call Payload API or insert into shared DB
     PERFORM pg_net.http_post(
       url := 'https://cms.westinghousepet.tw/api/users',
       body := jsonb_build_object(
         'supabaseUserId', NEW.id,
         'email', NEW.email,
         'name', NEW.raw_user_meta_data->>'name'
       )
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```

### Risk Analysis

| Risk | Level | Mitigation |
|------|-------|------------|
| `auth.users.id` changes if user deletes/re-creates account | Low | Supabase preserves UUID across email changes; only deletion creates new UUID |
| Payload CMS needs its own auth session | Medium | Payload uses its own cookie-based auth for CMS admin; `supabaseUserId` field links to Supabase identity |
| Sync latency between Supabase Auth and Payload | Low | Use PostgreSQL triggers for real-time sync; fallback: sync on login |

### Decision

**RECOMMENDATION**: Adopt `supabase_user_id` as canonical identity. Use shared Supabase PostgreSQL (see P0-3) to eliminate sync complexity entirely — Payload reads `auth.users` directly from the same database.

---

## P0-3: Payload Database Strategy Revision

### Problem
Payload CMS uses independent Railway PostgreSQL. This creates dual-DB complexity, cross-database joins are impossible, and identity sync requires HTTP calls.

### Tradeoff Analysis

| Dimension | Option A: Separate DB (Railway) | Option B: Shared DB (Supabase Postgres) | Winner |
|-----------|----------------------------------|----------------------------------------|--------|
| **Complexity** | Higher — two connection strings, two migration systems, two backup strategies | Lower — single database, single connection pool | **Option B** |
| **Maintainability** | Requires DB sync jobs or API calls for cross-system queries | Direct SQL joins between Payload collections and Supabase tables | **Option B** |
| **Cross-system Queries** | Impossible — needs API layer | Native — `SELECT * FROM payload.products JOIN public.orders` | **Option B** |
| **RBAC** | Separate — Payload has its own access control + Supabase RLS | Unified — Payload collections can reference `auth.users` via RLS | **Option B** |
| **Deployment** | Two DBs to monitor, two backup configs | One DB, one dashboard | **Option B** |
| **Backup** | Separate backup schedules | Single backup, point-in-time recovery covers all data | **Option B** |
| **Performance** | Network latency between Railway and Supabase | Zero network latency — same Postgres instance | **Option B** |
| **Vendor Lock-in** | Spread across Railway + Supabase | Concentrated on Supabase | Tie |
| **Cost** | Railway PostgreSQL ($0-$25/mo) + Supabase ($0-$25/mo) | Single Supabase ($0-$25/mo) | **Option B** |
| **Migration Risk** | None (current state) | Requires migrating Payload data from Railway to Supabase | Option A |
| **Schema Isolation** | Complete isolation — no risk of table name collision | Requires schema prefix or careful table naming | Option A |
| **Supabase Limitations** | Not applicable | Supabase has some Postgres extensions restrictions | Option A |

### Recommendation

**Option B: Shared Supabase PostgreSQL**

Rationale: The benefits of unified queries, simplified identity mapping (P0-2), reduced operational overhead, and zero network latency significantly outweigh the migration risk. Supabase's PostgreSQL is standard Postgres — Payload works without modifications.

### Implementation Strategy

```
Supabase PostgreSQL
├── schemas/
│   ├── public/           # Supabase tables (members, orders, warranties, tickets)
│   ├── auth/             # Supabase Auth tables (users, managed by Supabase)
│   ├── storage/          # Supabase Storage objects
│   └── payload/          # Payload CMS collections (configurable schema name)
```

### Payload Configuration (Shared DB)

```typescript
// apps/cms/src/payload.config.ts
import { postgresAdapter } from '@payloadcms/db-postgres'

export default buildConfig({
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
      // Supabase connection string with pgBouncer for connection pooling
    },
    schemaName: 'payload',  // Isolate Payload tables in their own schema
  }),
  // ... rest of config
})
```

### Environment Variable (Single Database URI)

```env
# Both apps/web and apps/cms use the same Supabase PostgreSQL
DATABASE_URI=postgresql://postgres:[password]@db.xxxxxx.supabase.co:5432/postgres?pgbouncer=true

# For direct Postgres connections (migrations, Payload admin)
DIRECT_DATABASE_URI=postgresql://postgres:[password]@db.xxxxxx.supabase.co:5432/postgres
```

### Migration Strategy (from Railway to Supabase)

```bash
# 1. Export from Railway
pg_dump $RAILWAY_DATABASE_URL > payload_backup.sql

# 2. Import to Supabase (into payload schema)
psql $SUPABASE_DIRECT_URI -c "CREATE SCHEMA IF NOT EXISTS payload;"
psql $SUPABASE_DIRECT_URI < payload_backup.sql

# 3. Update Payload config to use schemaName: 'payload'
# 4. Test all CMS operations
# 5. Update deployment env vars
# 6. Shutdown Railway DB
```

### Risk
- **Low-Medium**. Supabase PostgreSQL is standard Postgres. Payload's postgresAdapter is designed for any Postgres instance. Schema isolation (`schemaName: 'payload'`) prevents table name collisions.

---

## P0-4: Observability Layer

### Problem
Current architecture has no production monitoring, error tracking, or structured logging. Checkout failures, webhook errors, and API issues go undetected.

### Decision
Add Sentry for error tracking + structured logger for operational events + checkout failure monitoring.

### Architecture

```
Observability Stack
├── Sentry (Error Tracking)
│   ├── Frontend errors (React Error Boundary)
│   ├── API route errors
│   ├── Webhook processing failures
│   └── Database query failures
├── Structured Logger (Operational Events)
│   ├── Checkout steps
│   ├── Payment webhooks
│   ├── Cart operations
│   └── Auth events
└── PostHog (Product Analytics — already planned)
    ├── User behavior
    ├── Funnel tracking
    └── A/B testing
```

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@sentry/nextjs` | ^8.x | Next.js error tracking + performance |
| `@sentry/node` | ^8.x | Server-side error tracking |
| `pino` | ^9.x | Structured logging (JSON output) |
| `pino-pretty` | ^13.x | Development log formatting |

### Folder Structure

```
packages/shared/
└── src/
    └── monitoring/
        ├── logger.ts           # Pino logger instance
        ├── sentry.ts           # Sentry config (shared init)
        └── types.ts            # Log event types

apps/web/
├── src/
│   ├── lib/
│   │   └── monitoring/
│   │       ├── client.ts      # Sentry browser init
│   │       ├── server.ts      # Sentry server init
│   │       └── logger.ts      # Server-side logger
│   ├── components/
│   │   └── error-boundary.tsx  # React Error Boundary with Sentry
│   └── app/
│       └── global-error.tsx    # Next.js global error handler
```

### Implementation

```typescript
// packages/shared/src/monitoring/logger.ts
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: 'westinghouse-pet-web',
    env: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

export { logger }

// Structured logging helpers
export const logCheckout = (step: string, data: Record<string, any>) => {
  logger.info({ event: 'checkout', step, ...data })
}

export const logPayment = (status: string, data: Record<string, any>) => {
  logger.info({ event: 'payment', status, ...data })
}

export const logWebhook = (source: string, status: string, data: Record<string, any>) => {
  logger.info({ event: 'webhook', source, status, ...data })
}
```

```typescript
// apps/web/src/lib/monitoring/client.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
})
```

```typescript
// apps/web/src/components/error-boundary.tsx
'use client'

import * as Sentry from '@sentry/nextjs'
import { Component, ReactNode } from 'react'

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: errorInfo })
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
```

### Checkout Failure Monitoring

```typescript
// apps/web/src/app/api/webhooks/newebpay/route.ts
import { logPayment, logWebhook } from '@repo/shared/monitoring'

export async function POST(req: Request) {
  try {
    logWebhook('newebpay', 'received', { timestamp: new Date().toISOString() })
    
    const payload = await req.json()
    
    // Validate checksum
    if (!validateChecksum(payload)) {
      logPayment('failed', { reason: 'invalid_checksum', tradeNo: payload.TradeNo })
      Sentry.captureMessage('Invalid NewebPay checksum', { extra: payload })
      return Response.json({ error: 'Invalid checksum' }, { status: 400 })
    }
    
    // Process payment
    await processPayment(payload)
    
    logPayment('success', { tradeNo: payload.TradeNo, amount: payload.Amt })
    return Response.json({ status: 'OK' })
    
  } catch (error) {
    logPayment('error', { error: (error as Error).message })
    Sentry.captureException(error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### Sentry Alert Rules

| Alert | Condition | Channel |
|-------|-----------|---------|
| Checkout failure rate | > 5% in 5 minutes | Slack #alerts |
| Payment webhook error | Any 500 response | Slack #alerts |
| Client-side error | > 100/hour | Slack #warnings |
| API 500 errors | > 10/hour | Slack #alerts |
| Database connection error | Any occurrence | Slack #alerts + PagerDuty |

### Risk
- **Low**. Sentry has generous free tier (5k errors/month). Pino is lightweight. No infrastructure changes needed.

---

## P1-1: Async Job Architecture

### Problem
Current design: email sending is synchronous, blocking API responses.

### Options Analysis

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **pgmq** (Postgres-native queue) | Zero infra, ACID guarantees, same DB | Requires Supabase extension enable | **Recommended** |
| Supabase Edge Functions + cron | Serverless, scheduled | 1-second timeout limit, not for heavy tasks | Secondary |
| Trigger + status table | Simple, no extensions | Manual polling, no retry logic | Not recommended |
| External queue (BullMQ, SQS) | Full-featured | Additional infrastructure, cost | Overkill for MVP |

### Decision

Use `pgmq` (Postgres Message Queue). Enable the extension in Supabase, use simple producer/consumer pattern.

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Create queue for email jobs
SELECT pgmq.create('email_jobs');

-- Producer (when order is placed)
SELECT pgmq.send(
  queue_name => 'email_jobs',
  message => '{"type":"order_confirmation","order_id":"...","email":"..."}'::jsonb,
  delay => 0
);

-- Consumer (edge function or cron job polls every minute)
SELECT pgmq.read(
  queue_name => 'email_jobs',
  vt => 30,  -- visibility timeout (seconds)
  qty => 10   -- batch size
);

-- Archive after success
SELECT pgmq.archive('email_jobs', msg_id);
```

### Job Types

| Queue | Purpose | Priority |
|-------|---------|----------|
| `email_jobs` | Order confirmation, warranty reminder, filter replacement | Normal |
| `webhook_jobs` | NewebPay webhook processing (if primary webhook fails) | High |
| `sync_jobs` | Payload CMS → Supabase data sync | Low |
| `notification_jobs` | LINE@ push notifications | Normal |

### Implementation

```typescript
// packages/shared/src/jobs/email.ts
import { supabaseAdmin } from '../supabase/admin'

export async function enqueueEmailJob(type: string, data: Record<string, any>) {
  const { error } = await supabaseAdmin.rpc('pgmq_send', {
    queue_name: 'email_jobs',
    message: JSON.stringify({ type, data, created_at: new Date().toISOString() }),
  })
  
  if (error) {
    // Fallback: synchronous send (don't lose the email)
    await sendEmailDirectly(type, data)
  }
}
```

---

## P1-2: Search Architecture Revision

### Current State
Single `/api/search` route with basic Postgres FTS.

### Revised Architecture

```
Search System (MVP)
├── Supabase Full Text Search (pg_trgm)
│   ├── Autocomplete (prefix matching)
│   ├── Product search (name + description)
│   ├── Learn article search (title + content)
│   └── FAQ search (question matching)
└── Search Analytics (PostHog)
    ├── Popular queries
    ├── Zero-result queries
    └── Click-through rate
```

### Implementation

```sql
-- Create search indexes
CREATE INDEX idx_products_search ON products 
  USING gin(to_tsvector('chinese', name || ' ' || coalesce(description, '')));

CREATE INDEX idx_articles_search ON learn_articles 
  USING gin(to_tsvector('chinese', title || ' ' || coalesce(content, '')));

-- Unified search function
CREATE OR REPLACE FUNCTION unified_search(query TEXT)
RETURNS TABLE (
  id UUID,
  type TEXT,        -- 'product' | 'article' | 'faq'
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  
  -- Search products
  SELECT 
    p.id,
    'product'::TEXT as type,
    p.name as title,
    p.slug,
    left(p.short_description, 100) as excerpt,
    ts_rank(to_tsvector('chinese', p.name), plainto_tsquery('chinese', query)) as rank
  FROM products p
  WHERE to_tsvector('chinese', p.name) @@ plainto_tsquery('chinese', query)
  
  UNION ALL
  
  -- Search articles
  SELECT 
    a.id,
    'article'::TEXT as type,
    a.title,
    '/learn/' || a.category || '/' || a.slug as slug,
    left(a.excerpt, 100) as excerpt,
    ts_rank(to_tsvector('chinese', a.title || ' ' || a.content), plainto_tsquery('chinese', query)) as rank
  FROM learn_articles a
  WHERE to_tsvector('chinese', a.title || ' ' || a.content) @@ plainto_tsquery('chinese', query)
  
  ORDER BY rank DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
```

### Scale-up Path

| Trigger | Upgrade To |
|---------|-----------|
| Products > 500 OR daily searches > 10,000 | Algolia Starter ($1/mo) |
| Need faceted search (filters by price, category, rating) | Algolia Growth ($79/mo) |
| Need AI-powered search suggestions | Algolia AI Search |

---

## P1-3: Feature Flag Architecture

### Decision

Use **PostHog Feature Flags** (free up to 1M requests/month). Already planned for analytics — feature flags are included at no extra cost.

### Implementation

```typescript
// apps/web/src/lib/feature-flags.ts
import posthog from 'posthog-js'

export const FEATURES = {
  SUBSCRIPTION_BETA: 'subscription-beta',
  LINE_PAY: 'line-pay-beta',
  PROMOTION_AB: 'promotion-ab-test',
  NEW_CHECKOUT: 'new-checkout-flow',
} as const

export function isFeatureEnabled(flag: string, defaultValue = false): boolean {
  if (typeof window === 'undefined') return defaultValue
  return posthog.isFeatureEnabled(flag) ?? defaultValue
}

// Usage in component
import { isFeatureEnabled, FEATURES } from '@/lib/feature-flags'

export function CheckoutPage() {
  const useNewCheckout = isFeatureEnabled(FEATURES.NEW_CHECKOUT)
  
  return useNewCheckout ? <NewCheckout /> : <OldCheckout />
}
```

### Flag Definitions

| Flag | Rollout Strategy | Target |
|------|-----------------|--------|
| `subscription-beta` | 10% of logged-in users | Test subscription UI |
| `line-pay-beta` | 50% of checkout users | A/B test LINE Pay vs credit card |
| `promotion-ab-test` | 50/50 split | Test banner A vs banner B |
| `new-checkout-flow` | Internal team only | Staged rollout of checkout redesign |

---

## P1-4: Documentation Revision

### Required Documentation

| Document | Location | Purpose | Owner |
|----------|----------|---------|-------|
| `db-schema.md` | `/docs/db-schema.md` | Complete database schema with ERD | Lead Backend |
| `rbac.md` | `/docs/rbac.md` | Role permissions matrix, RLS policies | Lead Backend |
| `env-strategy.md` | `/docs/env-strategy.md` | Environment variable management, secrets rotation | DevOps |
| `event-tracking.md` | `/docs/event-tracking.md` | GA4 + PostHog event taxonomy, naming conventions | Product |
| `api-spec.md` | `/docs/api-spec.md` | API endpoint documentation | Backend |
| `deployment.md` | `/docs/deployment.md` | Deployment procedures, rollback strategy | DevOps |

---

## P2: SEO Metadata Layer

### Implementation

```typescript
// apps/web/src/lib/seo/metadata.ts
import type { Metadata } from 'next'

interface GenerateMetadataOptions {
  title: string
  description: string
  path: string
  ogImage?: string
  type?: 'website' | 'product' | 'article'
  noIndex?: boolean
}

export function generatePageMetadata(options: GenerateMetadataOptions): Metadata {
  const siteUrl = 'https://www.westinghousepet.tw'
  const fullTitle = `${options.title} | Westinghouse 西屋寵物家電`
  
  return {
    title: fullTitle,
    description: options.description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}${options.path}`,
    },
    openGraph: {
      title: options.title,
      description: options.description,
      url: `${siteUrl}${options.path}`,
      siteName: 'Westinghouse 西屋寵物家電',
      locale: 'zh_TW',
      type: options.type || 'website',
      images: options.ogImage ? [{ url: options.ogImage }] : undefined,
    },
    robots: options.noIndex 
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}
```

```typescript
// apps/web/src/lib/seo/schema.ts
export function generateProductSchema(product: any, reviews: any[] = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((i: any) => i.url),
    description: product.shortDescription,
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'Westinghouse' },
    offers: {
      '@type': 'Offer',
      url: `https://www.westinghousepet.tw/products/${product.slug}`,
      priceCurrency: 'TWD',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: reviews.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
      reviewCount: reviews.length,
    } : undefined,
  }
}
```

---

## Architecture Decision Records (ADR)

### ADR-001: Shared Types in `@repo/shared`
- **Status**: Accepted
- **Decision**: All domain types centralized in `packages/shared`
- **Rationale**: Prevents type drift, enables single source of truth
- **Consequences**: Requires ESLint rule enforcement; CI must check shared types first

### ADR-002: `supabase_user_id` as Canonical Identity
- **Status**: Accepted
- **Decision**: All tables reference `auth.users.id` (UUID) instead of email
- **Rationale**: Email is mutable; UUID is immutable and managed by Supabase Auth
- **Consequences**: Payload CMS requires `supabaseUserId` field; sync logic needed

### ADR-003: Payload Shares Supabase PostgreSQL
- **Status**: Accepted
- **Decision**: Payload CMS uses Supabase Postgres with `schemaName: 'payload'`
- **Rationale**: Eliminates dual-DB complexity, enables cross-schema SQL joins
- **Consequences**: Migration from Railway required; schema isolation prevents table collision

### ADR-004: `pgmq` for Async Jobs
- **Status**: Accepted
- **Decision**: Postgres-native message queue for email/webhook async processing
- **Rationale**: Zero additional infrastructure; ACID guarantees; same database
- **Consequences**: Requires Supabase extension; consumer must poll or use trigger

### ADR-005: PostHog for Feature Flags
- **Status**: Accepted
- **Decision**: Use PostHog (already planned for analytics) instead of custom flag system
- **Rationale**: Free tier sufficient; no additional dependency; integrates with analytics
- **Consequences**: Feature flag evaluation requires client-side JS

---

## Final Validation Report

### Conflict Check: Phase 2A/2B vs v3.1 Hardened

| Check | Status | Notes |
|-------|--------|-------|
| URL structure unchanged | ✅ PASS | All `/products`, `/shop`, `/learn`, `/solutions` URLs preserved |
| Commerce/Product split maintained | ✅ PASS | P0-1 enforces type separation, not model merge |
| Rendering strategy unchanged | ✅ PASS | ISR/SSG/Client matrix from v2.1 preserved |
| RBAC roles preserved | ✅ PASS | 7 roles maintained, Marketing restricted per P1-2 |
| CMS remains Payload | ✅ PASS | Database topology change only, CMS not replaced |
| Stack unchanged | ✅ PASS | Next.js 15, React 19, Supabase, Payload all retained |

### Risk Register

| # | Risk | Level | Mitigation | Status |
|---|------|-------|------------|--------|
| 1 | Payload schema migration from Railway | Medium | Test migration on staging; backup before cutover | Accepted |
| 2 | `pgmq` extension not available on Supabase | Low | Verify extension availability; fallback to trigger-based queue | Monitor |
| 3 | Shared DB performance under load | Low | Supabase can scale vertically; monitor connection pool | Accepted |
| 4 | Identity sync edge cases | Low | Use triggers + fallback sync on login | Accepted |

---

## Approval Status

### APPROVED ✅

**v3.1 Hardened Architecture is approved for Phase 3.2 entry.**

**Prerequisites before Phase 3.2**:
1. ✅ P0-1: Shared types migration (`packages/shared/src/types/`)
2. ✅ P0-2: Identity mapping schema updated (use `auth.users.id`)
3. ✅ P0-3: Database URI updated (Payload → Supabase Postgres)
4. ✅ P0-4: Sentry DSN obtained; logger package added

**No remaining blockers.**

---

## Updated Phase 3 Roadmap

| Phase | Goal | Dependencies | Complexity |
|-------|------|-------------|------------|
| **3.1** ✅ | Foundation + Hardening | None | Low |
| **3.2** | Database & Backend | 3.1 | High |
| **3.3** | CMS Implementation | 3.1, 3.2 | High |
| **3.4** | Design System & UI | 3.1 | Medium |
| **3.5** | Public Website Pages | 3.2, 3.3, 3.4 | High |
| **3.6** | Commerce System | 3.2, 3.4 | High |
| **3.7** | Member / Support System | 3.2, 3.4 | High |
| **3.8** | Admin System | 3.2, 3.3, 3.7 | High |
| **3.9** | Analytics / SEO / GEO | 3.5, 3.6 | Medium |
| **3.10** | Security / QA / Launch | All above | High |

---

*End of Architecture v3.1 Hardened*
