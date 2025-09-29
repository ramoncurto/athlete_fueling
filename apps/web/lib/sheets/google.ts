import { randomUUID } from "node:crypto";
import type { SeedData } from "@data/seed";

export type SheetName = keyof SeedData;
export type SheetRow<K extends SheetName> = SeedData[K] extends Array<infer R> ? R : never;

type JWTLike = {
  email: string;
  key: string;
  scopes: string[];
};

type GoogleSheetsV4 = {
  spreadsheets: {
    values: {
      get: (params: unknown) => Promise<{ data: { values?: unknown[][] } }>;
      append: (params: unknown) => Promise<unknown>;
      update: (params: unknown) => Promise<unknown>;
      clear: (params: unknown) => Promise<unknown>;
    };
  };
};

type GoogleClient = GoogleSheetsV4;

export class GoogleSheetsClient {
  private sheets: GoogleClient;
  private spreadsheetId: string;
  private headerCache = new Map<string, string[]>();

  private constructor(spreadsheetId: string, jwt: JWTLike) {
    // Dynamic import to avoid pulling googleapis on client bundles
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { google } = require("googleapis") as typeof import("googleapis");
    const auth = new google.auth.JWT({ email: jwt.email, key: jwt.key, scopes: jwt.scopes });
    this.sheets = google.sheets({ version: "v4", auth }) as GoogleClient;
    this.spreadsheetId = spreadsheetId;
  }

  static fromEnv(): GoogleSheetsClient {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GOOGLE_PRIVATE_KEY || "";
    if (!spreadsheetId || !email || !key) {
      throw new Error("Google Sheets credentials missing. Set GOOGLE_* env vars.");
    }
    key = key.replace(/\\n/g, "\n");
    return new GoogleSheetsClient(spreadsheetId, {
      email,
      key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }

  // Utilities
  private async getHeaders(title: string): Promise<string[]> {
    if (this.headerCache.has(title)) return this.headerCache.get(title)!;
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${title}!1:1`,
    });
    const headers = ((res.data.values && res.data.values[0]) || []).map((h: unknown) => String(h ?? "").trim());
    this.headerCache.set(title, headers);
    return headers;
  }

  private coerceValue(raw: string) {
    const v = String(raw ?? "").trim();
    if (v === "" || v === "null" || v === "undefined") return undefined;
    if (v === "true") return true;
    if (v === "false") return false;
    if (/^-?\d+(?:\.\d+)?$/.test(v)) return Number(v);
    if ((v.startsWith("[") && v.endsWith("]")) || (v.startsWith("{") && v.endsWith("}"))) {
      try {
        return JSON.parse(v);
      } catch {
        return v;
      }
    }
    return v;
  }

  private setDeep(obj: Record<string, unknown>, path: string, value: unknown) {
    const parts = path.split(".");
    let cursor = obj as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (typeof cursor[key] !== "object" || cursor[key] === null) cursor[key] = {};
      cursor = cursor[key] as Record<string, unknown>;
    }
    cursor[parts[parts.length - 1]] = value;
    return obj;
  }

  private getDeep(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce<unknown>((acc, key) => {
      if (acc == null || typeof acc !== "object") return undefined;
      return (acc as Record<string, unknown>)[key];
    }, obj);
  }

  private deserialize(title: string, headers: string[], row: unknown[]): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      const raw = row[idx];
      const val = this.coerceValue(String(raw ?? ""));
      if (h && val !== undefined) {
        if (h.includes(".")) {
          this.setDeep(obj, h, val);
        } else {
          obj[h] = val;
        }
      }
    });
    // Default id if missing and header has id
    if (headers.includes("id") && !obj["id"]) obj["id"] = randomUUID();
    return obj;
  }

  private serialize(headers: string[], obj: Record<string, unknown>): unknown[] {
    return headers.map((h) => {
      const v = h.includes(".") ? this.getDeep(obj, h) : obj[h];
      if (v === undefined || v === null) return "";
      if (typeof v === "object") return JSON.stringify(v);
      return String(v);
    });
  }

  private async listRaw(title: string): Promise<{ headers: string[]; rows: unknown[][] }> {
    const headers = await this.getHeaders(title);
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${title}!A2:ZZZ`,
      majorDimension: "ROWS",
    });
    const rows: unknown[][] = (res.data.values as unknown[][]) || [];
    return { headers, rows };
  }

  // API mirroring emulator
  async list<K extends SheetName>(table: K): Promise<SheetRow<K>[]> {
    const { headers, rows } = await this.listRaw(table);
    return rows
      .filter((r) => r.some((c) => String(c ?? "").trim() !== ""))
      .map((r) => this.deserialize(String(table), headers, r)) as SheetRow<K>[];
  }

  async findById<K extends SheetName>(
    table: K,
    id: string,
    key: keyof SheetRow<K> = "id" as keyof SheetRow<K>,
  ): Promise<SheetRow<K> | undefined> {
    const rows = await this.list(table);
    return rows.find((row) => (row as Record<string, unknown>)[key as string] === id);
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
    const headers = await this.getHeaders(String(table));
    const rowObj = row as Record<string, unknown>;
    const withId = ((): Record<string, unknown> => {
      if (headers.includes("id") && (!("id" in rowObj) || rowObj.id === undefined)) {
        return { id: randomUUID(), ...rowObj };
      }
      return rowObj;
    })();
    const values = this.serialize(headers, withId);
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${String(table)}!A1`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [values] },
    });
    return withId as SheetRow<K>;
  }

  async update<K extends SheetName>(
    table: K,
    predicate: (row: SheetRow<K>) => boolean,
    updater: (row: SheetRow<K>) => SheetRow<K>,
  ): Promise<SheetRow<K> | undefined> {
    const title = String(table);
    const { headers, rows } = await this.listRaw(title);
    const materialized = rows.map((r) => this.deserialize(title, headers, r)) as SheetRow<K>[];
    const idx = materialized.findIndex((r) => predicate(r));
    if (idx === -1) return undefined;
    const updated = updater(structuredClone(materialized[idx]));
    const out = this.serialize(headers, updated as Record<string, unknown>);
    const rowIndex = idx + 2; // +1 header, +1 1-based
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${title}!A${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: { values: [out] },
    });
    return updated;
  }

  async upsert<K extends SheetName>(
    table: K,
    row: SheetRow<K>,
    key: keyof SheetRow<K> = "id" as keyof SheetRow<K>,
  ): Promise<SheetRow<K>> {
    const rowObj = row as Record<string, unknown>;
    const existing = await this.findById(table, rowObj[key as string] as string, key);
    if (!existing) {
      return this.insert(table, row);
    }
    const updated = await this.update(table, (r) => (r as Record<string, unknown>)[key as string] === rowObj[key as string], () => row);
    return (updated ?? row) as SheetRow<K>;
  }

  async remove<K extends SheetName>(
    table: K,
    predicate: (row: SheetRow<K>) => boolean,
  ): Promise<void> {
    const title = String(table);
    const { headers, rows } = await this.listRaw(title);
    const materialized = rows.map((r) => this.deserialize(title, headers, r)) as SheetRow<K>[];
    const keepMask = materialized.map((r) => !predicate(r));
    // Rebuild sheet: keep header + kept rows
    const keptRows = rows.filter((_, i) => keepMask[i]);
    // Clear full data range first
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range: `${title}!A2:ZZZ`,
    });
    if (keptRows.length) {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${title}!A2`,
        valueInputOption: "RAW",
        requestBody: { values: keptRows },
      });
    }
  }
}