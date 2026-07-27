import { asc, eq } from "drizzle-orm";

import { clubs, type InsertClub } from "../../drizzle/schema";
import { getDb } from "./connection";

export async function listClubs() {
      return getDb().select().from(clubs).orderBy(asc(clubs.sortOrder), asc(clubs.name));
}

export async function createClub(data: InsertClub) {
      const result = await getDb().insert(clubs).values(data);
      return { id: Number(result[0].insertId) };
}

export async function updateClub(id: number, data: Partial<InsertClub>) {
      await getDb().update(clubs).set(data).where(eq(clubs.id, id));
      return { success: true };
}

export async function deleteClub(id: number) {
      await getDb().delete(clubs).where(eq(clubs.id, id));
      return { success: true };
}
