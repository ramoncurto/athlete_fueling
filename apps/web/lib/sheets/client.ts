import { randomUUID } from "node:crypto";
import { seedData, type SeedData } from "@data/seed";
import { GoogleSheetsClient } from "@/lib/sheets/google";

export type SheetName = keyof SeedData;
export type SheetRow<K extends SheetName> = SeedData[K] extends Array<infer R>
  ? R
  : never;

const clone = <T>(value: T): T => structuredClone(value);

export class SheetsEmulator {
  private data: SeedData;

  constructor(initialData: SeedData = seedData) {
    this.data = clone(initialData);
  }

  reset(): void {
    this.data = clone(seedData);
  }

  async list<K extends SheetName>(table: K): Promise<SheetRow<K>[]> {
    return clone(this.data[table]) as SheetRow<K>[];
  }

  async findById<K extends SheetName>(
    table: K,
    id: string,
    key: keyof SheetRow<K> = "id" as keyof SheetRow<K>,
  ): Promise<SheetRow<K> | undefined> {
    const rows = await this.list(table);
    return rows.find((row) => row[key] === id);
  }

  async filter<K extends SheetName>(
    table: K,
    predicate: (row: SheetRow<K>) => boolean,
  ): Promise<SheetRow<K>[]> {
    const rows = await this.list(table);
    return rows.filter(predicate);
  }

  async insert<K extends SheetName>(
    table: K,
    row: Partial<SheetRow<K>>,
  ): Promise<SheetRow<K>> {
    const nextRow = {
      id: ("id" in row && row.id) || randomUUID(),
      ...row,
    } as SheetRow<K>;

    (this.data[table] as SheetRow<K>[]).push(nextRow);
    return clone(nextRow);
  }

  async update<K extends SheetName>(
    table: K,
    predicate: (row: SheetRow<K>) => boolean,
    updater: (row: SheetRow<K>) => SheetRow<K>,
  ): Promise<SheetRow<K> | undefined> {
    const rows = this.data[table] as SheetRow<K>[];
    const idx = rows.findIndex(predicate);
    if (idx === -1) {
      return undefined;
    }
    const current = rows[idx];
    const updated = updater(clone(current));
    rows[idx] = updated;
    return clone(updated);
  }

  async upsert<K extends SheetName>(
    table: K,
    row: SheetRow<K>,
    key: keyof SheetRow<K> = "id" as keyof SheetRow<K>,
  ): Promise<SheetRow<K>> {
    const rows = this.data[table] as SheetRow<K>[];
    const idx = rows.findIndex((existing) => existing[key] === row[key]);
    if (idx === -1) {
      rows.push(row);
    } else {
      rows[idx] = row;
    }
    return clone(row);
  }

  async remove<K extends SheetName>(
    table: K,
    predicate: (row: SheetRow<K>) => boolean,
  ): Promise<void> {
    const rows = this.data[table] as SheetRow<K>[];
    const keep = rows.filter((row) => !predicate(row));
    this.data[table] = keep as SeedData[K];
  }
}

const driver = (process.env.SHEETS_DRIVER || "local").toLowerCase();

let sheetsImpl: SheetsEmulator | GoogleSheetsClient;
if (driver === "google") {
  sheetsImpl = GoogleSheetsClient.fromEnv();
} else {
  sheetsImpl = new SheetsEmulator();
}

export const sheets = sheetsImpl;
