import { and, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { getDb } from "./connection";
import {
      activities,
      activityParticipants,
      type InsertActivity,
      type InsertActivityParticipant,
} from "../../drizzle/activities";

export type ActivityListFilters = {
      search?: string | null;
      status?: string | null;
      activityType?: string | null;
      isPublicOnPortal?: boolean | null;
      isActive?: boolean | null;
      fromDate?: string | null;
      toDate?: string | null;
      limit?: number | null;
      offset?: number | null;
};

function normalizeLimit(value?: number | null) {
      if (!value || value < 1) return 100;
      return Math.min(value, 300);
}

function buildActivityConditions(filters?: ActivityListFilters) {
      const conditions: any[] = [];
      const search = filters?.search?.trim();

      if (filters?.isActive !== undefined && filters?.isActive !== null) {
            conditions.push(eq(activities.isActive, filters.isActive));
      }

      if (filters?.status && filters.status !== "all") {
            conditions.push(eq(activities.status, filters.status as any));
      }

      if (filters?.activityType && filters.activityType !== "all") {
            conditions.push(eq(activities.activityType, filters.activityType as any));
      }

      if (filters?.isPublicOnPortal !== undefined && filters?.isPublicOnPortal !== null) {
            conditions.push(eq(activities.isPublicOnPortal, filters.isPublicOnPortal));
      }

      if (filters?.fromDate) {
            conditions.push(gte(activities.activityDate, filters.fromDate as any));
      }

      if (filters?.toDate) {
            conditions.push(lte(activities.activityDate, filters.toDate as any));
      }

      if (search) {
            const pattern = `%${search}%`;
            conditions.push(
                  or(
                        like(activities.code, pattern),
                        like(activities.title, pattern),
                        like(activities.location, pattern),
                        like(activities.ownerGroup, pattern),
                        like(activities.description, pattern)
                  )
            );
      }

      return conditions;
}

export async function listActivities(filters?: ActivityListFilters) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = buildActivityConditions({ ...filters, isActive: filters?.isActive ?? true });
      const limit = normalizeLimit(filters?.limit);
      const offset = Math.max(filters?.offset ?? 0, 0);

      let query: any = db.select().from(activities);
      if (conditions.length) {
            query = query.where(and(...conditions));
      }

      return query
            .orderBy(desc(activities.activityDate), desc(activities.startTime), desc(activities.id))
            .limit(limit)
            .offset(offset);
}

export async function listPublicActivities(filters?: ActivityListFilters) {
      return listActivities({
            ...filters,
            isActive: true,
            isPublicOnPortal: true,
      });
}

export async function getActivityById(id: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db.select().from(activities).where(eq(activities.id, id)).limit(1);
      return rows[0] ?? null;
}

export async function getActivityByCode(code: string) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db.select().from(activities).where(eq(activities.code, code)).limit(1);
      return rows[0] ?? null;
}

export async function createActivity(data: InsertActivity) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result: any = await db.insert(activities).values(data);
      const insertId = Number(result?.[0]?.insertId ?? result?.insertId ?? 0);

      if (insertId) {
            return getActivityById(insertId);
      }

      return getActivityByCode(String(data.code));
}

export async function updateActivity(id: number, data: Partial<InsertActivity>) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(activities).set(data).where(eq(activities.id, id));
      return getActivityById(id);
}

export async function cancelActivity(id: number) {
      return updateActivity(id, { status: "cancelled" as any });
}

export async function deleteActivity(id: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(activities).set({ isActive: false }).where(eq(activities.id, id));
      return { success: true };
}

export async function getActivityParticipants(activityId: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return db
            .select()
            .from(activityParticipants)
            .where(eq(activityParticipants.activityId, activityId))
            .orderBy(desc(activityParticipants.id));
}

export async function addActivityParticipant(data: InsertActivityParticipant) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(activityParticipants).values(data);
      return { success: true };
}

export async function removeActivityParticipant(activityId: number, residentId: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
            .delete(activityParticipants)
            .where(
                  and(
                        eq(activityParticipants.activityId, activityId),
                        eq(activityParticipants.residentId, residentId)
                  )
            );
      return { success: true };
}

export async function markParticipantAttendance(
      activityId: number,
      residentId: number,
      attended: boolean
) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
            .update(activityParticipants)
            .set({ attended })
            .where(
                  and(
                        eq(activityParticipants.activityId, activityId),
                        eq(activityParticipants.residentId, residentId)
                  )
            );
      return { success: true };
}

export async function getActivityStats() {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db
            .select({
                  status: activities.status,
                  total: sql<number>`count(*)`,
            })
            .from(activities)
            .where(eq(activities.isActive, true))
            .groupBy(activities.status);

      const stats = {
            total: 0,
            draft: 0,
            scheduled: 0,
            inProgress: 0,
            completed: 0,
            cancelled: 0,
      };

      rows.forEach((row: any) => {
            const count = Number(row.total ?? 0);
            stats.total += count;
            if (row.status === "draft") stats.draft = count;
            if (row.status === "scheduled") stats.scheduled = count;
            if (row.status === "in_progress") stats.inProgress = count;
            if (row.status === "completed") stats.completed = count;
            if (row.status === "cancelled") stats.cancelled = count;
      });

      return stats;
}
