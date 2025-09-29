import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { seedData } from "../apps/web/lib/data/seed";

const outputDir = resolve(process.cwd(), "../apps/web/.local");
mkdirSync(outputDir, { recursive: true });
const output = resolve(outputDir, "seed.json");
writeFileSync(output, JSON.stringify(seedData, null, 2));

console.log(Seed data exported to );
