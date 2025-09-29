/*
  Bootstrap Google Sheets tabs and headers on first dev run.
  - Reads .env.local (if present) to get GOOGLE_* and SHEETS_DRIVER
  - If SHEETS_DRIVER !== 'google', exits quickly
  - Ensures each tab exists, and writes a header row if the sheet is empty
*/

const fs = require('fs');
const path = require('path');

// Lazy load dotenv if available; otherwise do a tiny parser for .env.local
function loadEnv() {
  // Prefer dotenv if installed
  try {
    require('dotenv').config({ path: path.resolve(process.cwd(), '../../.env.local') });
    // Also load workspace-local .env if present
    require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
  } catch (_) {
    const envPathRoot = path.resolve(process.cwd(), '../../.env.local');
    if (fs.existsSync(envPathRoot)) {
      const raw = fs.readFileSync(envPathRoot, 'utf8');
      raw.split(/\r?\n/).forEach((line) => {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (m) {
          const key = m[1];
          let val = m[2];
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          process.env[key] = process.env[key] ?? val;
        }
      });
    }
  }
}

loadEnv();

const SHEETS_DRIVER = process.env.SHEETS_DRIVER;
if (SHEETS_DRIVER !== 'google') {
  console.log('[sheets:bootstrap] SHEETS_DRIVER is not google; skipping.');
  process.exit(0);
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
let PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || '';
PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');

if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  console.warn('[sheets:bootstrap] Missing Google Sheets credentials. Set GOOGLE_* env vars.');
  process.exit(0);
}

const HEADER_MAP = {
  athletes: [
    'id',
    'email', 'firstName', 'lastName',
    'weightKg', 'heightCm', 'ftpWatts', 'longRunPaceMinKm',
    'timezone', 'createdAt', 'updatedAt', 'preferenceId',
  ],
  preferences: [
    'id', 'athleteId', 'locale',
    'dietaryFlags', 'favoriteBrands', 'bannedBrands', 'homemadeSupplements',
    'caffeineSensitivity', 'sodiumSensitivity', 'targetFlavorDiversity',
    'taste.prefersSweet', 'taste.prefersSalty', 'taste.prefersCitrus', 'taste.textureNotes',
    'carry.bottles', 'carry.softFlasks', 'carry.gelLoops', 'carry.prefersVest',
    'defaultEventTemplate', 'updatedAt',
  ],
  routes: [
    'id', 'name', 'eventDiscipline', 'distanceKm', 'elevationGainM', 'laps', 'aidStations', 'notes',
  ],
  events: [
    'id', 'slug', 'name', 'discipline', 'climate', 'location', 'routeId', 'startTimeIso',
  ],
  products: [
    'sku', 'name', 'brand', 'category',
    'carbsPerServingG', 'sodiumPerServingMg', 'caffeinePerServingMg',
    'pricePerServing', 'weightPerServingG', 'flavors', 'dietaryFlags', 'affiliateUrl',
  ],
  scenarios: [
    'id', 'scenarioHash', 'athleteId', 'eventId', 'createdAt',
    'inputs', 'fuelPlan',
    'totals.carbs', 'totals.fluids', 'totals.sodium', 'totals.caffeine',
    'guardrails.giRisk', 'guardrails.sodiumRisk', 'guardrails.caffeineRisk',
    'score.safety', 'score.simplicity', 'score.cost', 'score.weight', 'score.raceability', 'score.dominantRisks',
  ],
  plans: [
    'id', 'athleteId', 'eventId', 'scenarioId', 'chosenVariant', 'createdAt', 'updatedAt', 'raceNotes',
  ],
  kits: [
    'id', 'planId', 'variant', 'items', 'totalPrice', 'totalWeightGrams', 'updatedAt',
  ],
  intakeEvents: [
    'id', 'athleteId', 'planId', 'happenedAt', 'carbsG', 'fluidsMl', 'sodiumMg', 'caffeineMg', 'notes',
  ],
  leads: [
    'id', 'email', 'source', 'locale', 'capturedAt',
  ],
  orders: [
    'id', 'athleteId', 'sku', 'amount', 'currency', 'status', 'createdAt', 'metadata',
  ],
  analyticsEvents: [
    'id', 'name', 'userId', 'anonymousId', 'occurredAt', 'properties',
  ],
};

async function run() {
  const { google } = require('googleapis');
  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('[sheets:bootstrap] Inspecting spreadsheet', SPREADSHEET_ID);
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existingTitles = new Set((meta.data.sheets || []).map((s) => s.properties?.title).filter(Boolean));

  const wanted = Object.keys(HEADER_MAP);
  const addRequests = [];
  for (const title of wanted) {
    if (!existingTitles.has(title)) {
      addRequests.push({ addSheet: { properties: { title } } });
    }
  }

  if (addRequests.length) {
    console.log('[sheets:bootstrap] Creating sheets:', addRequests.length);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: addRequests },
    });
  }

  // Ensure headers in row 1 for each sheet.
  for (const [title, headers] of Object.entries(HEADER_MAP)) {
    try {
      const current = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${title}!1:1`,
      });
      const row = (current.data.values && current.data.values[0]) || [];
      const hasHeaders = row && row.length > 0 && row.some((cell) => String(cell).trim().length > 0);
      if (hasHeaders) {
        continue;
      }
      console.log(`[sheets:bootstrap] Writing headers for ${title}`);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${title}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] },
      });
    } catch (e) {
      console.warn(`[sheets:bootstrap] Failed header check for ${title}:`, e.message || e);
    }
  }

  // Optional: seed demo rows from minimal sample, only if explicitly enabled and sheets are empty
  const DO_SEED = String(process.env.SHEETS_SEED || '').toLowerCase() === 'true';
  if (DO_SEED) {
    console.log('[sheets:bootstrap] Seeding demo rows where empty...');

    // Minimal dataset aligned to HEADER_MAP order. Arrays/objects are JSON-stringified.
    const now = new Date().toISOString();
    const seed = {
      routes: [
        ['route-nyc-marathon', 'New York City Marathon', 'road_marathon', 42.195, 320, 1, JSON.stringify([
          { km: 5, name: 'Parkside', offerings: ['water', 'gatorade'] },
          { km: 15, name: 'Queens', offerings: ['water', 'gels'] },
          { km: 25, name: 'Bronx', offerings: ['water', 'chews'] },
          { km: 35, name: 'Central Park', offerings: ['water', 'broth'] },
        ]), 'Standard NYC route with rolling bridges.'],
        ['route-zion-50k', 'Zion Ultra 50K', 'trail_ultra', 50, 1800, 1, JSON.stringify([
          { km: 8, name: 'Mesa Aid', offerings: ['water', 'mix'] },
          { km: 20, name: 'Narrows', offerings: ['water', 'broth'] },
          { km: 35, name: 'Kolob Rim', offerings: ['water', 'fruit'] },
        ]), 'Hot, exposed, technical trail.'],
      ],
      events: [
        ['event-nyc-2025', 'nyc-marathon-2025', 'NYC Marathon 2025', 'road_marathon', 'cool', 'New York, USA', 'route-nyc-marathon', '2025-11-02T09:00:00-05:00'],
        ['event-zion-2025', 'zion-ultra-50k-2025', 'Zion Ultra 50K 2025', 'trail_ultra', 'hot', 'Springdale, USA', 'route-zion-50k', '2025-05-10T06:30:00-06:00'],
      ],
      preferences: [
        ['pref-alex', 'ath-alex', 'en', JSON.stringify(['vegan']), JSON.stringify(['Maurten','Skratch']), JSON.stringify(['Gu']), JSON.stringify([]), 'medium', 'medium', 3, true, false, true, JSON.stringify(['avoids chalky textures']), 2, 1, 6, false, 'road_cool', now],
        ['pref-jordan', 'ath-jordan', 'en', JSON.stringify(['gluten_free']), JSON.stringify(['Precision','Tailwind']), JSON.stringify([]), JSON.stringify([]), 'low', 'high', 4, false, true, false, JSON.stringify(['likes crunchy','sensitive to syrup']), 3, 2, 8, true, 'trail_hot', now],
      ],
      athletes: [
        ['ath-alex', 'alex.runner@example.com', 'Alex', 'Ramirez', 68, 178, 310, 4.25, 'America/New_York', '2024-12-10T12:00:00Z', now, 'pref-alex'],
        ['ath-jordan', 'jordan.trail@example.com', 'Jordan', 'Lee', 75, 180, '', '', 'America/Denver', '2024-09-01T12:00:00Z', now, 'pref-jordan'],
      ],
      products: [
        ['prd-maurten-gel100', 'MAURTEN GEL 100', 'Maurten', 'gel', 25, 100, 0, 3.9, 40, JSON.stringify(['neutral']), JSON.stringify(['vegan','gluten_free']), ''],
        ['prd-skratch-hydration', 'Skratch Hydration Drink Mix', 'Skratch', 'drink_mix', 21, 380, 0, 1.5, 22, JSON.stringify(['lemon','strawberry']), JSON.stringify(['vegan','gluten_free']), 'https://shop.example.com/skratch-hydration'],
        ['prd-precision-1500', 'Precision Hydration 1500', 'Precision', 'drink_mix', 18, 1500, 0, 2.0, 25, JSON.stringify(['citrus']), JSON.stringify(['vegan','gluten_free']), ''],
      ],
      scenarios: [
        ['scn-alex-marathon-aggressive', 'hash-alex-marathon-agg', 'ath-alex', 'event-nyc-2025', '2025-09-21T12:00:00Z',
          JSON.stringify({ athleteId:'ath-alex', eventId:'event-nyc-2025', routeId:'route-nyc-marathon', heatStrategy:'aggressive', carbTargetGPerHour:95, caffeinePlan:'balanced', sodiumConfidence:'medium', hydrationPlan:'steady' }),
          JSON.stringify([{ hour:0, carbsG:30, fluidsMl:550, sodiumMg:300, caffeineMg:50, notes:'Pre-race' }]),
          290, 2400, 1740, 100,
          0.22, 0.35, 0.18,
          82, 74, 68, 71, 86, JSON.stringify(['watch GI load in final hour'])
        ],
        ['scn-jordan-zion-balanced', 'hash-jordan-zion-bal', 'ath-jordan', 'event-zion-2025', '2025-09-19T15:00:00Z',
          JSON.stringify({ athleteId:'ath-jordan', eventId:'event-zion-2025', routeId:'route-zion-50k', heatStrategy:'moderate', carbTargetGPerHour:80, caffeinePlan:'low', sodiumConfidence:'high', hydrationPlan:'heavy' }),
          JSON.stringify([{ hour:0, carbsG:25, fluidsMl:600, sodiumMg:700, caffeineMg:0, notes:'Pre-race bottle' }]),
          265, 2400, 2260, 90,
          0.28, 0.44, 0.12,
          78, 70, 65, 68, 80, JSON.stringify([])
        ],
      ],
      plans: [
        ['plan-alex-nyc', 'ath-alex', 'event-nyc-2025', 'scn-alex-marathon-aggressive', 'value', '2025-09-22T08:00:00Z', '2025-09-22T08:00:00Z', 'Stick to planned gels; watch final bridge winds.'],
        ['plan-jordan-zion', 'ath-jordan', 'event-zion-2025', 'scn-jordan-zion-balanced', 'premium', '2025-09-20T10:00:00Z', '2025-09-20T10:30:00Z', 'Refill bottles at Narrows aid station.'],
      ],
      kits: [
        ['kit-alex-value', 'plan-alex-nyc', 'value', JSON.stringify([
          { sku:'prd-maurten-gel100', name:'MAURTEN GEL 100', brand:'Maurten', flavor:'neutral', quantity:6, unit:'pack', carbsG:150, sodiumMg:600, caffeineMg:100, price:23.4, weightGrams:240 },
        ]), 40.2, 452, '2025-09-22T08:05:00Z'],
        ['kit-jordan-premium', 'plan-jordan-zion', 'premium', JSON.stringify([
          { sku:'prd-precision-1500', name:'Precision Hydration 1500', brand:'Precision', flavor:'citrus', quantity:10, unit:'serving', carbsG:180, sodiumMg:15000, caffeineMg:0, price:20, weightGrams:250 },
        ]), 29.6, 418, '2025-09-20T10:30:00Z'],
      ],
      intakeEvents: [
        ['intake-alex-nyc-1', 'ath-alex', 'plan-alex-nyc', '2025-11-02T10:15:00-05:00', 25, 300, 120, 0, 'Gel at mile 8.'],
        ['intake-jordan-zion-1', 'ath-jordan', 'plan-jordan-zion', '2025-05-10T08:10:00-06:00', 30, 400, 600, 0, 'Mix from soft flask.'],
      ],
      leads: [
        ['lead-nyc-preview-2025', 'sam.interested@example.com', 'fuel-calculator', 'en', '2025-08-15T15:00:00Z'],
      ],
      orders: [
        ['order-race-pack-alex', 'ath-alex', 'race-pack', 11900, 'usd', 'paid', '2025-09-22T08:00:00Z', JSON.stringify({ planId: 'plan-alex-nyc' })],
      ],
      analyticsEvents: [
        ['evt-alex-plan-generated', 'plan_generated', 'ath-alex', '', '2025-09-22T08:00:00Z', JSON.stringify({ scenarioId: 'scn-alex-marathon-aggressive', planId: 'plan-alex-nyc' })],
        ['evt-jordan-kit-click', 'kit_clicked', 'ath-jordan', '', '2025-09-20T10:35:00Z', JSON.stringify({ planId: 'plan-jordan-zion', variant: 'premium' })],
      ],
    };

    for (const [title, headers] of Object.entries(HEADER_MAP)) {
      try {
        const check = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${title}!A2:A2` });
        const hasData = check.data.values && check.data.values.length > 0;
        if (hasData) continue;
        const rows = seed[title];
        if (!rows || !rows.length) continue;
        console.log(`[sheets:bootstrap] Seeding ${rows.length} row(s) into ${title}`);
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${title}!A2`,
          valueInputOption: 'RAW',
          requestBody: { values: rows },
        });
      } catch (e) {
        console.warn(`[sheets:bootstrap] Seed skipped for ${title}:`, e.message || e);
      }
    }
  }

  console.log('[sheets:bootstrap] Done.');
}

run().catch((err) => {
  const msg = err && err.message ? err.message : String(err);
  console.warn('[sheets:bootstrap] Non-fatal error:', msg);
  // Don't fail dev startup
  process.exit(0);
});
