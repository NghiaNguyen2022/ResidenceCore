import { getDb } from "./connection";

import { and, count, eq, like, or } from "drizzle-orm";

import {
  InsertParent,
  InsertResident,
  parents,
  residents,
} from "../../drizzle/schema";

export async function createResident(data: InsertResident) {
  const db = getDb();

  try {
    return await db.insert(residents).values(data);
  } catch (error) {
    console.error("[createResident] Error:", error);
    throw error;
  }
}

export async function getResidentById(id: number) {
  const db = getDb();

  const result = await db
    .select()
    .from(residents)
    .where(eq(residents.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getResidents(filters?: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDb();

  const conditions: any[] = [];

  if (filters?.search?.trim()) {
    const keyword = `%${filters.search.trim()}%`;

    conditions.push(
      or(
        like(residents.fullName, keyword),
        like(residents.residentCode, keyword),
        like(residents.phoneNumber, keyword)
      )
    );
  }

  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(residents.status, filters.status as any));
  }

  let query = db.select().from(residents);

  if (conditions.length > 0) {
    query = query.where(and(...conditions) as any);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}

export async function updateResident(
  id: number,
  data: Partial<InsertResident>
) {
  const db = getDb();

  return await db
    .update(residents)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(residents.id, id));
}

export async function markResidentAsLeft(
  id: number,
  departureDate: Date
) {
  const db = getDb();

  return await db
    .update(residents)
    .set({
      status: "transferred_out",
      departureDate,
      updatedAt: new Date(),
    })
    .where(eq(residents.id, id));
}

export async function deleteResident(id: number) {
  const db = getDb();

  return await db.delete(residents).where(eq(residents.id, id));
}

export async function getResidentsStats() {
  const db = getDb();

  const total = await db.select({ count: count() }).from(residents);

  const active = await db
    .select({ count: count() })
    .from(residents)
    .where(eq(residents.status, "active"));

  const inactive = await db
    .select({ count: count() })
    .from(residents)
    .where(eq(residents.status, "inactive"));

  const transferredOut = await db
    .select({ count: count() })
    .from(residents)
    .where(eq(residents.status, "transferred_out"));

  return {
    total: total[0]?.count || 0,
    active: active[0]?.count || 0,
    inactive: inactive[0]?.count || 0,
    transferred_out: transferredOut[0]?.count || 0,
  };
}

export async function createParent(data: InsertParent) {
  const db = getDb();

  return await db.insert(parents).values(data);
}

export async function getParentById(id: number) {
  const db = getDb();

  const result = await db
    .select()
    .from(parents)
    .where(eq(parents.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getParentsByResident(residentId: number) {
  const db = getDb();

  return await db
    .select()
    .from(parents)
    .where(eq(parents.residentId, residentId));
}

export async function getParentsByResidentId(residentId: number) {
  return getParentsByResident(residentId);
}

export async function updateParent(
  id: number,
  data: Partial<InsertParent>
) {
  const db = getDb();

  return await db
    .update(parents)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(parents.id, id));
}

export async function deleteParent(id: number) {
  const db = getDb();

  return await db.delete(parents).where(eq(parents.id, id));
}