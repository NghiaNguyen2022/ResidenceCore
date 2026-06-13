import { getDb } from "./connection";
import { and, asc, desc, eq, like, or, inArray } from "drizzle-orm";
import {
      activities,
      activityParticipants,
      InsertActivity,
      InsertActivityParticipant,
      residents,
} from "../../drizzle/schema";

export type ActivityFilters = {
      search?: string;
      status?: string;
      activityType?: string;
      limit?: number;
      offset?: number;
};

export async function getActivities(filters?: ActivityFilters) {
      const db = getDb();
      const conditions: any[] = [eq(activities.isActive, true)];

      if (filters?.search?.trim()) {
            const kw = `%${filters.search.trim()}%`;
            conditions.push(
                  or(
                        like(activities.title, kw),
                        like(activities.code, kw),
                        like(activities.location, kw),
                        like(activities.ownerGroup, kw)
                  )
            );
      }

      if (filters?.status && filters.status !== "all") {
            conditions.push(eq(activities.status, filters.status as any));
      }

      if (filters?.activityType && filters.activityType !== "all") {
            conditions.push(eq(activities.activityType, filters.activityType as any));
      }

      let query: any = db
            .select()
            .from(activities)
            .where(and(...conditions))
            .orderBy(desc(activities.activityDate), desc(activities.createdAt));

      if (filters?.limit) query = query.limit(filters.limit);
      if (filters?.offset) query = query.offset(filters.offset);

      return query;
}

export async function getActivityById(id: number) {
      const db = getDb();
      const result = await db
            .select()
            .from(activities)
            .where(and(eq(activities.id, id), eq(activities.isActive, true)))
            .limit(1);
      return result[0] ?? null;
}

export async function getActivityByCode(code: string) {
      const db = getDb();
      const result = await db
            .select()
            .from(activities)
            .where(and(eq(activities.code, code), eq(activities.isActive, true)))
            .limit(1);
      return result[0] ?? null;
}

export async function createActivity(data: InsertActivity) {
      const db = getDb();
      const result = await db.insert(activities).values(data);
      const insertId = (result as any)[0]?.insertId ?? result[0]?.insertId;
      if (insertId) return getActivityById(insertId);
      return null;
}

export async function updateActivity(id: number, data: Partial<InsertActivity>) {
      const db = getDb();
      await db
            .update(activities)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(activities.id, id));
      return getActivityById(id);
}

export async function deleteActivity(id: number) {
      const db = getDb();
      await db
            .update(activities)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(activities.id, id));
      return true;
}

export async function getActivityParticipants(activityId: number) {
      const db = getDb();
      return db
            .select({
                  id: activityParticipants.id,
                  activityId: activityParticipants.activityId,
                  residentId: activityParticipants.residentId,
                  role: activityParticipants.role,
                  attended: activityParticipants.attended,
                  notes: activityParticipants.notes,
                  residentFullName: residents.fullName,
                  residentCode: residents.residentCode,
                  residentHolyName: residents.holyName,
            })
            .from(activityParticipants)
            .leftJoin(residents, eq(activityParticipants.residentId, residents.id))
            .where(eq(activityParticipants.activityId, activityId))
            .orderBy(asc(residents.fullName));
}

export async function addActivityParticipant(data: InsertActivityParticipant) {
      const db = getDb();
      const existing = await db
            .select()
            .from(activityParticipants)
            .where(
                  and(
                        eq(activityParticipants.activityId, data.activityId),
                        eq(activityParticipants.residentId, data.residentId)
                  )
            )
            .limit(1);
      if (existing.length > 0) {
            throw new Error("Học viên đã được thêm vào hoạt động này.");
      }
      await db.insert(activityParticipants).values(data);
      return true;
}

export async function removeActivityParticipant(activityId: number, residentId: number) {
      const db = getDb();
      await db
            .delete(activityParticipants)
            .where(
                  and(
                        eq(activityParticipants.activityId, activityId),
                        eq(activityParticipants.residentId, residentId)
                  )
            );
      return true;
}

export async function markParticipantAttendance(
      activityId: number,
      residentId: number,
      attended: boolean
) {
      const db = getDb();
      await db
            .update(activityParticipants)
            .set({ attended, updatedAt: new Date() })
            .where(
                  and(
                        eq(activityParticipants.activityId, activityId),
                        eq(activityParticipants.residentId, residentId)
                  )
            );
      return true;
}

export async function getActivityStats() {
      const db = getDb();
      const all = await db
            .select({
                  id: activities.id,
                  status: activities.status,
                  activityType: activities.activityType,
                  actualParticipants: activities.actualParticipants,
            })
            .from(activities)
            .where(eq(activities.isActive, true));

      const total = all.length;
      const scheduled = all.filter((a) => a.status === "scheduled").length;
      const completed = all.filter((a) => a.status === "completed").length;
      const inProgress = all.filter((a) => a.status === "in_progress").length;

      return { total, scheduled, completed, inProgress };
}
