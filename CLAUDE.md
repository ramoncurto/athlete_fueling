# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Athletic Fuel is an offline scenario studio and sales funnel for endurance athletes, providing precision fueling and hydration planning. The application uses a Next.js 15 App Router architecture with TypeScript, NextAuth for authentication, and Google Sheets as the data store during the pilot phase.

## Development Commands

### Primary Development Commands
```bash
# Install dependencies (monorepo root)
npm install

# Start development server (includes sheet bootstrap)
npm run dev
# or specifically for web app:
npm run dev --workspace web

# Build the application
npm run build
# or: npm run build --workspace web

# Start production server
npm run start
# or: npm run start --workspace web
```

### Testing Commands
```bash
# Run all tests
npm test

# Run unit tests (Vitest)
npm run test --workspace web

# Watch mode for unit tests
npm run test:watch --workspace web

# Run E2E tests (Playwright)
npm run test:e2e --workspace web

# Code linting
npm run lint
# or: npm run lint --workspace web

# Code formatting
npm run format --workspace web
```

## Architecture & Code Structure

### Monorepo Structure
The project uses npm workspaces with the following structure:
- `apps/web/` - Main Next.js 15 application with App Router
- `packages/` - Shared packages (config, utilities)
- `scripts/` - Build and deployment scripts
- `infra/` - Infrastructure configuration (Vercel, Docker)

### Key Architectural Patterns

#### 1. App Router with Internationalization
- Uses Next.js 15 App Router with path-based i18n (`/[locale]/...`)
- Locale routing handled via middleware
- Messages stored in `apps/web/messages/`

#### 2. Authentication
- NextAuth v4 with credentials provider
- Session-based authentication stored server-side
- Auth routes at `/api/auth/*`
- Sign-in page at `/[locale]/auth/sign-in`

#### 3. Data Layer
- **Pilot Phase**: Google Sheets as System of Record
- Local emulator for development (via `bootstrap-sheets.js`)
- Sheet driver abstraction in `lib/sheets/` for easy migration
- Tabs: athletes, events, routes, plans, products, kits, preferences, etc.

#### 4. API Design
- RESTful API routes under `/api/v1/`
- Zod validation for all inputs/outputs
- Node runtime for heavy operations (Sheets, PDFs, Stripe)
- Optional Edge runtime for static/lightweight endpoints

#### 5. Core Domain Libraries
Located in `apps/web/lib/`:
- `planner/` - Fueling plan calculation and optimization
- `kits/` - Product kit building and variant generation
- `preferences/` - Athlete preference management
- `sheets/` - Google Sheets driver abstraction
- `pdf/` - PDF generation for plans and comparisons
- `email/` - Transactional email templates
- `auth/` - Authentication utilities
- `coach/` - Coach dashboard utilities
- `jobs/` - Scheduled job handlers
- `training/` - Gut training recommendations

### Key Components & Routes

#### Public Routes
- `/[locale]/tools/fuel-calculator` - Free fuel calculator
- `/[locale]/plan/scenarios` - Scenario Studio (preview/full)
- `/[locale]/checkout/annual` - Subscription checkout
- `/[locale]/races/*` - SEO race pages

#### Authenticated Routes
- `/[locale]/dashboard` - Athlete Dashboard
- `/[locale]/coach/dashboard` - Coach analytics
- `/[locale]/plan/*` - Full planning tools

#### API Endpoints
- `POST /api/plan/batch` - Batch scenario planning
- `POST /api/kit/build` - Generate kit variants
- `GET/POST /api/v1/preferences` - Preference CRUD
- `POST /api/pdf/plan` - Generate race pack PDF
- `POST /api/v1/billing/session` - Stripe checkout
- `/api/jobs/weekly` - Weekly debrief cron job

## Testing Strategy

### Unit Tests (Vitest)
- Test files in `apps/web/tests/`
- Coverage for planner math, kit optimization, preference merging
- Use aliases: `@lib`, `@schemas`, `@data`

### E2E Tests (Playwright)
- Test files in `apps/web/tests/e2e/`
- Cover critical user flows: calculator → lead, checkout → PDF
- Base URL configurable via `PLAYWRIGHT_BASE_URL`

## Environment Configuration

Key environment variables (see `.env.example`):
- `SHEETS_DRIVER` - 'google' or 'local' (use 'local' for development)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEETS_ID`
- `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SITE_URL`
- Feature flags: `NEXT_PUBLIC_FLAG_SCENARIO_STUDIO`, etc.

**For Development**: Set `SHEETS_DRIVER=local` in `.env.local` to use the emulator instead of Google Sheets.

## Important Implementation Notes

### Google Sheets Integration
- Bootstrap script runs automatically in dev mode
- Service account credentials required for production
- Preserve newlines in private key: `replace(/\\n/g, '\n')`

### Stripe Webhook Handling
- Use raw body for signature verification: `await req.text()`
- Process webhook before parsing JSON

### Performance Considerations
- Scenario batch processing target: 3-6 scenarios in <5s
- Use memoization for expensive computations
- Monte Carlo simulations use 48-64 draws for speed

### Safety & Compliance
- Hard caps on GI absorption, sodium, caffeine
- Show probability of constraint violations
- Include disclaimers (non-medical advice)
- Support data export and deletion requests

## Deployment (Vercel)

- Framework preset: Next.js
- Build command: `next build --turbopack`
- Install command: `npm install`
- Node runtime for API routes with heavy computation
- Scheduled functions configured in `infra/vercel.json`
- PDF generation may use Vercel Blob storage