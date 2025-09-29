# Athletic Fuel — Offline Scenario Studio & Sales Funnel (Vercel Edition)

**Precision fueling & hydration planning for endurance athletes - async planning (no live telemetry) with a single Athlete Annual ($20/year) subscription and a first-class dashboard for history, preferences, and supplementation plans.**
*Tech:* Next.js 15 (App Router, TS), NextAuth, Stripe, Google Sheets (SoR) + local emulator, i18n (`next‑intl`), Vitest/Playwright, Vercel Blob (PDFs), Vercel Scheduled Functions (cron).
*Portfolio fit:* Packaging, pricing, and GTM align with Dockia’s Sports track (CoachUpFit, NutriPlan, Sports Analytics). 

> **Do we need an Athlete Dashboard? Yes.**
> It’s essential to: (1) persist preferences (taste/brand/caffeine/sodium, dietary constraints) that pre‑fill the planner and Kit Builder, (2) show historical plans, kits, and supplementation logs for trust and re‑orders, and (3) power the Season Pass weekly debriefs and cross‑sell. The dashboard is offline/asynchronous and fully compatible with the Vercel deployment model.

---

## 0) TL;DR for devs

* **No realtime:** everything is *plan → execute → debrief* (pdfs/emails/logging).
* **Core UX:** *Calculator* → *Scenario Studio* → *Kit Builder* → *PDFs/Emails* → *Athlete Dashboard*.
* **Monetization:** single **Athlete Annual** subscription ($20/year) covering Scenario Studio, Kit Builder, and dashboard exports.
* **Deploy target:** **Vercel**. Node runtime for Sheets/Stripe/PDF/Email; Edge optional for static GETs.
* **Storage:** Google Sheets (SoR) for pilot; optional Vercel Blob for PDFs; dual‑write to DB later.
* **Jobs:** Weekly email via **Vercel Scheduled Functions**.

---

## 1) Product Surfaces

### Public (marketing & funnel)

* **Fuel Calculator** — `/[locale]/tools/fuel-calculator` (free preview of targets; email gate for full PDF).
* **Scenario Studio (Preview)** — `/[locale]/plan/scenarios` (2–3 presets; teaser deltas; CTA to purchase).
* **Checkout** - `/[locale]/checkout/annual`.
* **Race pages** — `/[locale]/races/*` (Marathon, 70.3, Ultra, Trail; MDX + SEO).
* **Legal** — `/legal/*` (TOS, Privacy, Disclaimer).

### Authenticated (planner workspace)

* **Scenario Studio (Full)** — create/compare up to 6 scenarios; pick a winner; download comparison PDF.
* **Kit Builder** — turn the chosen plan into buyable SKUs (Variants A/B), pack list, cart deep links.
* **Review & Calibration** — absorption caps, gut tolerance, aid‑station constraints; exports.

### **Athlete Dashboard (NEW — required)**

* **History**

  * *Plans*: archive of supplementation plans and comparisons (dates, event type, climate tag).
  * *Kits*: past kit variants, price/weight summaries, re‑order links.
  * *Supplementation logs*: manual post‑race/workout intake summaries (planned vs executed), GI notes.
* **Preferences & gut readiness**

  * Taste & texture palette; flavor diversity target; dietary flags (vegan, gluten-free, allergens).
  * Brand preferences/blacklists; homemade options; energy drink and gel toggles; carry capacity; sodium and caffeine sensitivity.
  * Default event templates (e.g., road marathon cool vs trail ultra hot) plus weekly gut training guidance.
* **Exports & privacy**

  * Download JSON/CSV of history; delete account data on request.
* **Shortcuts**

  * “Plan again like last time” (duplicate a scenario with today’s route/weather).
  * “One‑click re‑order” kit from last event (affiliate link).

### Coach Dashboard (B2B)

* **Supplementation Plan PDF** - plan, intervals, risk notes, aid-station plan, kit variants, packing checklist.

### PDFs & Emails

* **Race Pack PDF** — plan, intervals, risk notes, aid‑station plan, kit variants, packing checklist.
* **Scenario Comparison PDF** — 2–6 scenarios, safety/score, top drivers, recommended choice.
* **Weekly Debrief (Season Pass)** — last week insights + next week plan attached; event countdown.

---

## 2) Architecture & Repo Layout

```
apps/web/                     # Next.js 15 app (App Router)
  app/[locale]/...            # Marketing + Planner + Dashboard + Coach + Auth
  app/api/...                 # REST route handlers (Node runtime)
  components/...              # Scenario Studio, Kit Builder, Dashboard widgets
  lib/...                     # planner, sim, score, kits, preferences, sheets, pdf, email, analytics
  messages/...                # i18n bundles
  middleware.ts               # i18n + minimal caching
  next.config.js              # i18n, images, experimental opts
packages/config/              # lint/tsconfig, Lighthouse budgets
scripts/                      # seed, validation, jobs
infra/
  vercel.json                 # scheduled functions, headers, regions
  docker-compose.yml          # Sheets emulator (local)
  Makefile                    # shortcuts
```

**Runtimes**

* **Node runtime** for: Sheets driver, Stripe webhooks, PDF, email.
* **Edge optional** for static GETs. Keep scenario compute on Node to avoid library limits.

---

## 3) API Surface (v1)

> JSON + Zod validation. OpenAPI 3.1 at `/api/v1/openapi`. All POST handlers below run in **Node**.

### Planning & Simulation

* **POST** `/api/plan/batch` → batch plan + simulate scenarios
  *Body:* `{ athlete, event, scenarios[] }` → *200:* `{ plans[], sims[], metrics[], explanations[] }`
* **POST** `/api/plan/preview` → lite plan for calculator (no persistence)

### Products & Kit Builder

* **GET**  `/api/v1/products` → per‑athlete catalog (brand, flavor, sodium, caffeine, price/weight)
* **POST** `/api/kit/build` → solve kit composition & variants
* **GET**  `/api/kit/presets` → brand filters, bottle sizes, caffeine options

### GPX & Events

* **POST** `/api/gpx` → parse GPX → segments, gradient stats, elevation‑aware ETA
* **GET**  `/api/v1/events` → events inventory

### **Athlete Dashboard**

* **GET**  `/api/v1/dashboard/history` → list past plans, kits, supplementation logs (paged, filterable)
* **POST** `/api/v1/intake-events` → append manual intake summaries post‑race/workout
* **GET**  `/api/v1/preferences` → fetch athlete preferences (merged with defaults)
* **POST** `/api/v1/preferences` → upsert preferences (taste, dietary, brand, caffeine/sodium, carry capacity)
* **POST** `/api/v1/kits/save` → save a kit as a favorite; **GET** `/api/v1/kits/saved` → list favorites
* **GET**  `/api/v1/export` → downloadable JSON/CSV of history; optional delete‑request ticket

### PDFs & Emails

* **POST** `/api/pdf/plan` → render Race Pack PDF (binary and/or Blob persist)
* **POST** `/api/pdf/scenario-comparison` → render comparison PDF
* **POST** `/api/tx-email/send` → transactional email send (server only)

### Funnel & Billing

* **POST** `/api/lead` → capture calculator leads (with UTM)
* **POST** `/api/v1/analytics/events` → funnel events (view, preview, checkout, purchase, kit_click)
* **POST** `/api/v1/billing/quote` → prices (one‑time/subscription/team)
* **POST** `/api/v1/billing/session` → Stripe Checkout session
* **POST** `/api/v1/billing/webhook` → Stripe webhooks (raw body verification)

### Health & Auth

* **GET** `/api/health` → Sheets/emulator sanity
* **ALL** `/api/auth/*` → NextAuth

---

## 4) Domain Libraries & **Required Functions**

> Implement these pure, tested functions; compose them in the API routes.

### `lib/planner`

* `validateInputs(input)`
* `applyEnvAdjustments(input, env)`
* `computeHourlyTargets(params)`
* `scheduleCaffeine(targets, strategy)`
* `buildIntervalFeeds(targets, products)`
* `optimizeFeeds(feeds, constraints)`
* `assignAidStations(feeds, stations)`
* `persistPlan(plan, driver)`

### `lib/sim`

* `simulateCarbDeficit(plan, route)`
* `simulateHydration(plan, env, athlete)`
* `simulateSodiumBalance(plan, env, athlete)`
* `simulateCaffeine(plan, athlete)`
* `monteCarloEnsemble(simInput, uncertainty)`  *(means, P(violation), intervals)*

### GI / Oxidation / Hydration / Caffeine

* `giAbsorptionCaps(athlete, trainingLevel)` → caps
* `giRiskScore(feed, caps)` → risk summary
* `dualSourceOxidationRate(glucose, fructose)`
* `oxidationSplit(totalCarbs, mix)`
* `sweatRatePrior(env, pace, athlete)` → distribution params
* `sodiumLossEstimate(sweatRate, conc)`
* `scheduleDose(strategy, durationMin, athlete)`

### ETA & GPX

* `parseGPX(xml)` → route profile
* `computeGradientStats(route)`
* `estimateETAWithEnv(route, pace, env)`

### Scenario scoring

* `computeSafetyIndex(sim, caps)` → 0..100
* `computeSimplicityPenalty(feed)`
* `computeCostPenalty(kit)` → 0..1
* `raceabilityScore(safety, penalties)` → 0..100
* `isDominated(a, b)`

### Kits

* `solveKitComposition(feed, catalog, prefs)` → variants
* `diversifyPalatability(kit, flavorProfile)`
* `priceKit(kit, catalog)`
* `weightKit(kit, catalog)`
* `generatePackList(kit)`
* `buildAffiliateDeepLinks(kit, partners)`

### Products

* `loadProductCatalog(athleteId)`
* `filterByBrandPrefs(products, prefs)`
* `mapToSKUs(feed, products)`

### PDFs

* `renderPlanPDF(data)` → Buffer
* `renderScenarioComparisonPDF(data)` → Buffer

### Email

* `renderTemplate(name, ctx)` → `{subject, html, text}`
* `sendTransactionalEmail(msg)`

### Analytics

* `logEvent(evt)`
* `getFunnelMetrics(range, filters?)`

### Sheets Driver

* `append(tab, row)` / `batchAppend(tab, rows)` / `get(tab, q?)`
* `getDriver()` → emulator | google

### **Preferences & Dashboard (NEW)**

* `loadPreferences(athleteId)` → merged defaults
* `savePreferences(athleteId, partial)`
* `mergePreferences(defaults, overrides)`
* `recordIntakeEvents(athleteId, events[])`
* `listHistory(athleteId, filters)` → plans, kits, intakes (paged)
* `computeCompliance(planned, executed)` → adherence, GI incident summary
* `summarizeHistoryForDebrief(athleteId, range)` → bullets for weekly email

### Auth & Flags

* `getSessionWithRoles(req)`
* `requireRole(session, role)`
* `isEnabled(flag)`

### Season Pass recommendations

* `generateWeeklyPlanAdjustments(events, athlete)`
* `generateGutTrainingMiniPlan(athlete)`

---

## 5) Data Model (Sheets tabs + Zod schemas)

* **athletes**: `id,email,massKg,gutTrainingLevel,locale`
* **events**: `id,athleteId,date,name,gpxId,env,targets`
* **routes**: `id,name,gpxMeta,segments,elevationGain`
* **plans**: `id,athleteId,eventId,label,params,intervals,pdfBlobUrl?`
* **scenario_runs**: `hash,athleteId,eventId,label,createdAt`
* **scenario_metrics**: `hash,safety,simplicity,cost,raceability,tightConstraint`
* **products**: `sku,brand,flavor,carbsPerUnit,sodiumMg,caffeineMg,price,weight,type,dietaryTags[]`
* **kits**: `id,planId,variant,sku,qty,price,weight`
* **saved_kits**: `id,athleteId,name,lines[],createdAt`
* **intake_events**: `id,athleteId,eventId,date,carbsG,fluidML,sodiumMg,caffeineMg,notes,giSymptoms?`
* **preferences**: `athleteId,brandPrefs[],brandBlacklist[],flavorPrefs[],dietaryFlags[],carryCapacityML,caffeineSensitivity,sodiumProfile,flavorDiversityTarget`
* **leads**: `email,source,utm,country,createdAt`
* **orders**: `id,kind(oneTime|sub|team),amount,currency,status,stripeId,createdAt`
* **analytics_events**: `ts,userId?,sessionId,event,props`

**Backups:** nightly JSON/CSV export across all tabs.

---

## 6) Vercel Deployment

### Project settings

* Framework: Next.js. Build: `next build`. Install: `npm i`. Output: `.next`.

### Environment variables (Dev/Preview/Prod)

* `SHEETS_DRIVER=google|local`
* `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` *(escape newlines and re‑insert in code)*
* `GOOGLE_SHEETS_ID`
* `NEXTAUTH_SECRET`
* `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
* `SITE_URL`
* `EMAIL_PROVIDER_KEY`
* `BLOB_READ_WRITE_TOKEN` *(if persisting PDFs)*
* `NEXT_PUBLIC_LOCALES=en,es`
* `NEXT_PUBLIC_FLAG_SCENARIO_STUDIO=true`
* `NEXT_PUBLIC_FLAG_FEED_OPTIMIZER=true`
* `NEXT_PUBLIC_FLAG_KIT_BUILDER=true`
* `NEXT_PUBLIC_FLAG_DASHBOARD=true`

### Route runtimes

* Node for Sheets/Stripe/PDF/Email routes; Edge optional for static GETs.
* Use `preferredRegion` close to most users.

### Stripe webhook (raw body), Scheduled Functions (weekly debrief), PDF rendering (buffer + optional Vercel Blob), caching by scenario hash for `/api/plan/batch`.

### i18n & images

* Path‑based locales; allow partner CDNs in `next.config.js`.

### Observability

* Vercel Analytics & Speed Insights; structured logs on plan/kit/webhook routes.

---

## 7) Performance & Limits

* `/api/plan/batch`: 3–6 scenarios in <3–5s. Use small Monte Carlo (≈48–64 draws) and dominance short‑circuiting; memoize by input hash.
* Keep PDFs under timeout; split plan vs comparison routes.

---

## 8) Security, Privacy, Compliance

* **Roles**: gate Planner, Dashboard, Coach (NextAuth).
* **Safety rails**: hard caps on GI/sodium/caffeine; show P(violation).
* **PII minimization**: only essentials (email, athlete basics, prefs); consent scopes in schemas.
* **Legal**: `/legal/*` pages; disclaimer banner (non‑medical advice).
* **Privacy controls**: data export (JSON/CSV) and delete‑request path in Dashboard.
* **Backups**: nightly export; restore runbook.

---

## 9) Pricing & Packaging (wired to `/api/v1/billing`)

| SKU             | What’s inside                                                | Price (test)    |
| --------------- | ------------------------------------------------------------ | --------------- |
| **Race Pack**   | Plan PDF + Kit Builder + checklist                           | €9–€19 one‑time |
| **Season Pass** | Plans for every workout + weekly debrief + Dashboard history | €19–€29/mo      |
| **Team Pack**   | Bulk PDFs + coach dashboard                                  | €149/€249/€399  |

*Fit with Dockia portfolio and shared GTM playbooks (affiliates, content)*. 

---

## 10) UX Flows

1. **Calculator → Preview → Lead**
2. **Preview → Checkout (Race Pack) → Plan PDF → Kit Builder**
3. **Scenario Studio (paid) → Comparison PDF → Choose Winner → Kit variants**
4. **Season Pass (sub) → Weekly email + Dashboard history update**
5. **Dashboard** → edit preferences → re‑order last kit → duplicate last winning scenario → export data

---

## 11) Emails & PDFs

* Templates: `race_pack_purchase`, `scenario_comparison_ready`, `season_pass_welcome`, `t-14`, `t-7`, `t-2`, `weekly_debrief`.
* PDFs localized; deterministic renders; optional Blob links for persistence.

---

## 12) Testing & Quality Gates

* **Unit (Vitest):** planner math; GI caps; sim ensemble coverage; scenario scoring; kit solves; **preferences merge**; **compliance calculator**.
* **API (Vitest):** plan/batch, kit/build, pdf renders (hash snapshot), billing session/webhook, **preferences CRUD**, **history list**, **intake append**.
* **E2E (Playwright):** calculator → lead; checkout → PDF → kit links; Scenario Studio compare/pick; **Dashboard edit prefs + re‑order last kit**.
* **Budgets:** Lighthouse perf/a11y; SBOM; CodeQL; Dependabot; gitleaks.

---

## 13) Acceptance Criteria (ship‑ready)

* **Funnels measured** end‑to‑end: `view_tool`, `plan_generated`, `email_captured`, `checkout_opened`, `purchase_succeeded`, `kit_clicked`.
* **Scenario Studio** supports ≥6 scenarios with uncertainty & explanations.
* **Kit Builder** returns two variants with valid deep links (graceful fallback if no partner).
* **PDFs**: deterministic; localized; under runtime limits.
* **Cron** `/api/jobs/weekly` completes reliably within quota.
* **Dashboard**

  * Preferences stored and **auto‑applied** to planner & kits.
  * History lists plans/kits/intake logs; CSV/JSON export works.
  * “Plan again like last time” and “Re‑order last kit” work.
* **Safety**: P(violation) reported; caps enforced across all outputs.
* **Backups**: new tabs included in nightly export; restore tested.

---

## 14) Roadmap (90/180/365)

* **90 days**: Calculator → Checkout → PDFs → Kit Builder v1; Scenario Studio presets; **Athlete Dashboard (prefs + history read‑only)**; cron emails; affiliates v1.
* **180 days**: Season Pass auto‑weekly engine; **Dashboard intake logging & compliance analysis**; Team Pack bulk PDFs; partner catalogs.
* **365 days**: Dual‑write to managed DB; fleet priors; causal insights; advanced coach analytics.

---

## 15) Notes & Gotchas on Vercel

* Google private key: preserve newlines (`replace(/\\n/g, '\n')`).
* Stripe signature: use raw body (`await req.text()`) before parsing.
* Keep heavy compute in Node runtime; memoize scenario results; split long‑running PDFs.
* Use `preferredRegion` aligned to user majority.
* Don’t log PII/secrets; scrub request logs.

---

## 16) Why this is a milestone for endurance supplementation

* **Safety‑first science** (GI/sodium/caffeine guardrails + uncertainty) made **practical** via scenarios and kits.
* **Conversion‑oriented**: every insight turns into a purchase‑ready kit and a reusable preference profile.
* **Compounding value**: the Athlete Dashboard preserves history and taste/brand context, improving plans and accelerating future buys—fueling LTV and trust across Dockia’s sports portfolio. 


## Repository Setup

```bash
npm install
npm run dev --workspace web
```

- Environment variables live in `.env.local` (see `.env.example`).
- Scheduled job configuration is defined in `infra/vercel.json`.

## Testing

```bash
npm run lint --workspace web
npm run test --workspace web
```

Vitest covers planner maths, kit builder heuristics, and preference merges. Playwright stubs are not yet defined.

## Auth & Dashboard

- Seed users are in `apps/web/lib/data/seed.ts`.
- Use the sign-in page at `/[locale]/auth/sign-in` with email + last name as access code.
- Session state is provided via NextAuth credentials provider.

## Jobs & PDFs

- The weekly job route is available at `/api/jobs/weekly` and uses the sheet emulator.
- Email templates live in `apps/web/lib/email/*` and PDFs in `apps/web/lib/pdf/*` as string scaffolding for integration with a renderer.
- PDF endpoint: `/api/plans/:planId/pdf` streams the latest race pack using sheet data.
- Coach dashboard lives at `/[locale]/coach/dashboard` for roster analytics.
- Playwright scaffold: `npm run test:e2e --workspace web` (set `PLAYWRIGHT_BASE_URL` when running against preview).
