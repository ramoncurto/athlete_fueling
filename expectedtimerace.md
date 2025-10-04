Great—here’s a **complete, buildable blueprint** for a *pre‑race* finish‑time predictor. It needs **no live data** during the race; it works from the runner’s profile + course GPX (or distance/elevation) + expected conditions. I’ll give you three accuracy tiers, the core math, and drop‑in TypeScript you can paste into your Next.js project.

---

## What you’re building (in one sentence)

A **mobile‑first tool** that takes a runner’s *flat speed*, *climb/descent ability*, and *course profile/conditions*, then **simulates the whole course** to output an **expected finish time** with **P50/P80/P95** uncertainty bands—and optional **per‑checkpoint split table**.

---

## Accuracy tiers (pick one to start, add the others later)

### Tier A — “Fast & Fair” (no GPX needed)

* **Inputs:** distance (km), total gain/loss (m), technicality (0–3), temperature, altitude; runner’s 10K/half time (or flat threshold pace).
* **Method:** *Equivalent Flat Distance (EFD)*
  [
  \text{EFD}*{km} = D*{km}

  * \frac{\text{gain}*m}{K*\uparrow}
  * \frac{\text{loss}*m}{K*\downarrow}
    ]
    Default (K_\uparrow=100,m/\text{km}), (K_\downarrow=200,m/\text{km}) (tune by course).
    Predict flat time from your road time using a distance exponent (Riegel‑like), apply multipliers for heat/altitude/technicality, then **add aid‑station dwell** minutes.

**Use when:** you don’t have GPX or want a first‑pass ETA in 10 seconds.

---

### Tier B — “Segment Physics” (uses GPX, no ML)

* **Inputs:** GPX (or checkpoint‑to‑checkpoint chunks), runner profile:

  * **v_flat_kmh** (flat sustainable speed; from 10K/threshold)
  * **VAM_up** (m/h sustained on climbs; from training or one past race)
  * **VDM_down** (m/h sustainable on descents; affected by technicality)
  * **tech_rating** (0 fast track → 3 very technical)
* **Method:** cut the GPX into small segments (e.g., 100–200 m). For each segment with grade (g):

  * If **climb** (g > +3%):
    ( v_{\text{cap}} = \frac{\text{VAM}*\uparrow}{1000\cdot g} ),
    ( v = \min(v*{\text{flat}}, v_{\text{cap}}))
  * If **descent** (g < −3%):
    ( v_{\text{cap}} = \frac{\text{VDM}*\downarrow}{1000\cdot |g|} ),
    ( v*{\text{boost}} = v_{\text{flat}}\cdot(1+\kappa_{\downarrow}\cdot \min(|g|,0.20)) )
    ( v = \min(v_{\text{cap}}, v_{\text{boost}}))
  * If **rolling** (|g| ≤ 3%): ( v = v_{\text{flat}}\cdot(1-\kappa_{\text{roll}}\cdot |g|) ) (small effect)
  * Apply **penalties/multipliers** for *technicality*, *heat*, *altitude*, *night fraction*.
  * Time for the segment = distance / (v). Sum all segments, then **add dwell time** model for aids.

**Why it works:** you get a physics‑plausible limit on speed from **vertical capacity** (VAM/VDM), while never exceeding your **flat** ability.

---

### Tier C — “Data‑Driven” (optional upgrade)

* **Inputs:** public results from similar races + your features (distance, gain, % steep, altitude, tech class, weather), plus runner’s recent road race or UTMB‑style performance score.
* **Method:** train a **quantile gradient‑boosting** model to output **P10/P50/P90** finish times. Then **calibrate** to the athlete using their past race bias (systematic “always 5% faster/slower”).
* **Combine** with Tier B: run both, average P50s, keep the wider of the two intervals for honesty.

---

## Practical modeling pieces you’ll need

### 1) Runner profile (robust, simple)

* **v_flat_kmh**: from 10K time (T_{10}) ⇒ (v = 10 / (T_{10}/60)).
* **VAM_up (m/h):** from the athlete’s longest steady climb (e.g., 20–40 min).
* **VDM_down (m/h):** from a steady descent; reduce for technical courses automatically.
* **endurance_exponent**: 1.03–1.10 (how much they slow as distance grows). Default 1.06.

### 2) Conditions → multipliers (keep them tunable)

* **Heat multiplier** (M_{heat}): +1–3% per 5 °C above ~15 °C (athlete‑specific; cap at +12–15%).
* **Altitude multiplier** (M_{alt}): +2–6% above ~1500–2000 m (course average or time‑weighted).
* **Technicality multiplier** (M_{tech}): +0–15% (bigger hit on descents).
* **Night multiplier** (M_{night}): +0–8% depending on fraction in the dark.
* **Aid dwell**: total minutes = (# aids × baseline) + “late race” extras.

> Don’t hard‑code; expose sliders so the model can be calibrated to one past race quickly.

---

## TypeScript you can paste (Tier B core)

```ts
// lib/finishTime.ts
export type Runner = {
  vFlatKmh: number;        // flat sustainable speed
  VAMup: number;           // m/h ascent capacity
  VDMdown: number;         // m/h descent capacity
  enduranceExp?: number;   // default 1.06 (used in Tier A)
};
export type CourseSeg = { dx_m: number; dElev_m: number; };
export type Conditions = {
  tempC: number;
  avgAltitudeM: number;
  tech: 0|1|2|3;           // 0 fast track → 3 very technical
  nightFrac01?: number;    // 0..1 fraction in the dark
};
export type Params = {
  gradeRollThresh?: number;    // default 0.03 (3%)
  kDown?: number;              // descent speed boost factor per slope (default 2.0)
  kRoll?: number;              // small rolling penalty (default 0.5)
  techPenaltyFlat?: number;    // per tech level (default 0.03)
  techPenaltyDown?: number;    // per tech level (default 0.06)
};

const clamp = (x:number,min:number,max:number)=>Math.min(Math.max(x,min),max);

function heatMultiplier(tempC:number){ // simple, tunable
  if (tempC <= 15) return 1;
  const steps = (tempC - 15) / 5;
  return 1 + clamp(0.02 * steps, 0, 0.15); // up to +15%
}
function altitudeMultiplier(avgAltM:number){
  if (avgAltM <= 1500) return 1;
  const steps = (avgAltM - 1500) / 500;
  return 1 + clamp(0.02 * steps, 0, 0.12);
}
function nightMultiplier(frac:number=0){ return 1 + clamp(0.08 * frac, 0, 0.08); }

export function predictFinishTimeTierB(
  runner: Runner,
  segs: CourseSeg[],
  cond: Conditions,
  p: Params = {}
){
  const gradeRoll = p.gradeRollThresh ?? 0.03;
  const kDown = p.kDown ?? 2.0;
  const kRoll = p.kRoll ?? 0.5;
  const techFlat = p.techPenaltyFlat ?? 0.03;
  const techDown = p.techPenaltyDown ?? 0.06;

  const Mheat = heatMultiplier(cond.tempC);
  const Malt  = altitudeMultiplier(cond.avgAltitudeM);
  const Mnight= nightMultiplier(cond.nightFrac01 ?? 0);
  const MtechFlat = 1 + cond.tech * techFlat;
  const MtechDown = 1 + cond.tech * techDown;

  let hours = 0;
  for(const s of segs){
    const dx_km = s.dx_m / 1000;
    const grade = (s.dElev_m) / (s.dx_m || 1); // rise/run
    let vEff = runner.vFlatKmh; // km/h before penalties

    if (grade > gradeRoll) {
      // CLIMB: cap by VAM
      const vCap = (runner.VAMup) / (1000 * grade); // km/h
      vEff = Math.min(runner.vFlatKmh, vCap);
      vEff = vEff / (MtechFlat); // technicality slows climbing too
    } else if (grade < -gradeRoll) {
      // DESCENT: cap by VDM and limited boost over flat
      const vCap = (runner.VDMdown) / (1000 * Math.abs(grade)); // km/h
      const vBoost = runner.vFlatKmh * (1 + kDown * Math.min(Math.abs(grade), 0.20));
      vEff = Math.min(vCap, vBoost);
      vEff = vEff / (MtechDown); // harsher technical penalty on descents
    } else {
      // ROLLING
      vEff = runner.vFlatKmh * (1 - kRoll * Math.abs(grade));
      vEff = vEff / (MtechFlat);
    }

    // Apply global condition multipliers (heat/altitude/night)
    vEff = vEff / (Mheat * Malt * Mnight);

    // Safety: never exceed flat speed too much on descents
    vEff = Math.min(vEff, runner.vFlatKmh * 1.35);

    const segHours = dx_km / Math.max(vEff, 0.1);
    hours += segHours;
  }
  return hours; // predicted moving time (add dwell separately)
}

/** Simple dwell model (minutes) */
export function dwellMinutes(numAids:number, distanceKm:number){
  const base = Math.min(2, Math.max(1, distanceKm/50)); // 1–2 min baseline
  const late = distanceKm>60 ? 0.5 : 0;                 // late-race drift
  return numAids * (base + late);
}
```

### How to use it

1. Parse your GPX into `segs: CourseSeg[]` (100–200 m steps with `dx_m`, `dElev_m`).
2. Collect runner params (defaults OK; encourage quick calibration on one past race).
3. Call `predictFinishTimeTierB(runner, segs, cond)` → moving hours.
4. Add `dwellMinutes(aids, distanceKm)/60` for total hours.
5. **Uncertainty bands:** run a **Monte Carlo**: jitter `vFlatKmh`, `VAMup`, `VDMdown`, and multipliers (±5–10%); take P50/P80/P95 of the resulting times.

---

## Tier A helper (no GPX) in 10 lines

```ts
// lib/finishTimeQuick.ts
export function predictFinishTimeTierA(
  distanceKm:number, gainM:number, lossM:number,
  runner10Kmin:number, enduranceExp=1.06,
  Kup=100, Kdown=200,
  mult = { heat:1, alt:1, tech:1, night:1 },
  dwellMin=10
){
  const efdKm = distanceKm + gainM/Kup + lossM/Kdown;
  const flatTimeMin = runner10Kmin * Math.pow(efdKm/10, enduranceExp);
  const condMult = mult.heat * mult.alt * mult.tech * mult.night;
  const totalMin = flatTimeMin * condMult + dwellMin;
  return totalMin / 60; // hours
}
```

---

## Calibration (the part that makes it *yours*)

1. **One past race** (best): feed its GPX & actual finish → solve for a personal **VAM_up** and **VDM_down** that reproduce that time (grid‑search ±20%). Save those as defaults.
2. **No past race?**

   * v_flat_kmh from 10K time;
   * VAM_up starting guess 700–1000 m/h (novice→experienced);
   * VDM_down ≈ 1200–2000 m/h; increase if course is non‑technical, decrease if technicality ≥2.
3. **Conditions:** If you often under‑ or over‑predict in heat/altitude, nudge multipliers (and keep a note—this becomes your personal bias correction).

---

## What the UI should show (mobile‑first)

* **Big answer card:** `Expected finish: 12:47 (P50)` with **P80** and **P95** chips underneath (e.g., `12:30–13:10`, `12:10–13:40`).
* **Sensitivity chips:** +5 °C → `+10–15 min`, +500 m altitude → `+6–10 min`, Tech +1 → `+3–6%`.
* **Optional splits table:** checkpoint ETAs by distributing the same algorithm between timing mats.
* **“Why” drawer:** “Climbs ~3h55 (VAM 850 m/h), flats ~4h10 (4:55/km), descents ~3h35 (VDM 1600 m/h).”
* **Calibration CTA:** “Have a past race? Tap to calibrate” (updates VAM/VDM).

---

## Minimal evaluation plan (make sure it’s honest)

* **Back‑test** on 3–5 of the athlete’s old races: report **mean absolute % error** (MAPE) and **coverage** (what % of actuals fell inside your P80 band).
* Tweak only the **multipliers** and **VAM/VDM**; don’t overfit the shape.

---

## Roadmap (nice additions once the core works)

* **Crowd factor** (start‑corrals/congestion) ⇒ additive minutes early.
* **Surface mix** (trail/road %) changes tech multiplier automatically.
* **Weather service** pre‑fetch for race day; re‑compute bands.
* **Population prior** (Tier C): optional quantile model trained on public results to refine your intervals.

---

### TL;DR

* Start with **Tier A** (EFD + road time) to get *something useful* today.
* Add **Tier B** (segment physics with VAM/VDM & multipliers) for **course‑aware accuracy**.
* Use **Monte Carlo** for honest **P50/P80/P95** bands.
* Keep everything **calibratable** from one past race—that’s where your predictor stops being generic and becomes *your athlete’s*.


