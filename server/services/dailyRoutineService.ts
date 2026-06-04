import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { dailyRoutines } from "../db/dailyRoutines";

export type DailyRoutineStatus = "pending" | "completed" | "cancelled";
export type DailyRoutineType = "daily" | "weekly" | "special";
export type DailyRoutineAssigneeType = "all" | "resident" | "room" | "group";

export interface ListDailyRoutinesInput {
      fromDate?: string;
      toDate?: string;
      status?: DailyRoutineStatus | "all";
      isActive?: boolean;
}

export interface CreateDailyRoutineInput {
      routineDate: string;
      startTime?: string | null;
      endTime?: string | null;
      title: string;
      description?: string | null;
      location?: string | null;
      category?: string | null;
      responsibleLabel?: string | null;
      assigneeType?: DailyRoutineAssigneeType;
      assigneeId?: number | null;
      status?: DailyRoutineStatus;
      isRequired?: boolean;
      displayOrder?: number;
      routineType?: DailyRoutineType;
      isActive?: boolean;
      notes?: string | null;
}

export interface UpdateDailyRoutineInput {
      id: number;
      routineDate?: string;
      startTime?: string | null;
      endTime?: string | null;
      title?: string;
      description?: string | null;
      location?: string | null;
      category?: string | null;
      responsibleLabel?: string | null;
      assigneeType?: DailyRoutineAssigneeType;
      assigneeId?: number | null;
      status?: DailyRoutineStatus;
      isRequired?: boolean;
      displayOrder?: number;
      routineType?: DailyRoutineType;
      isActive?: boolean;
      notes?: string | null;
}

function normalizeText(value?: string | null) {
      const text = value?.trim();
      return text ? text : null;
}

function boolToTinyInt(value?: boolean) {
      return value ? 1 : 0;
}

async function getRoutineById(id: number) {
      const rows = await db
            .select()
            .from(dailyRoutines)
            .where(eq(dailyRoutines.id, id))
            .limit(1);

      return rows[0] ?? null;
}

export const dailyRoutineService = {
      async list(input: ListDailyRoutinesInput = {}) {
            const conditions = [];

            if (input.fromDate) {
                  conditions.push(gte(dailyRoutines.routineDate, input.fromDate));
            }

            if (input.toDate) {
                  conditions.push(lte(dailyRoutines.routineDate, input.toDate));
            }

            if (input.status && input.status !== "all") {
                  conditions.push(eq(dailyRoutines.status, input.status));
            }

            if (typeof input.isActive === "boolean") {
                  conditions.push(eq(dailyRoutines.isActive, input.isActive ? 1 : 0));
            }

            const where =
                  conditions.length > 0 ? and(...conditions) : undefined;

            return db
                  .select()
                  .from(dailyRoutines)
                  .where(where)
                  .orderBy(
                        asc(dailyRoutines.routineDate),
                        asc(dailyRoutines.displayOrder),
                        asc(dailyRoutines.startTime),
                        asc(dailyRoutines.id)
                  );
      },

      async today() {
            const today = new Date().toISOString().slice(0, 10);

            return db
                  .select()
                  .from(dailyRoutines)
                  .where(
                        and(
                              eq(dailyRoutines.routineDate, today),
                              eq(dailyRoutines.isActive, 1)
                        )
                  )
                  .orderBy(
                        asc(dailyRoutines.displayOrder),
                        asc(dailyRoutines.startTime),
                        asc(dailyRoutines.id)
                  );
      },

      async create(input: CreateDailyRoutineInput) {
            const title = input.title.trim();

            if (!title) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Vui lòng nhập tên hoạt động.",
                  });
            }

            if (!input.routineDate) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Vui lòng chọn ngày sinh hoạt.",
                  });
            }

            await db.insert(dailyRoutines).values({
                  routineDate: input.routineDate,
                  startTime: input.startTime || null,
                  endTime: input.endTime || null,

                  title,
                  description: normalizeText(input.description),
                  location: normalizeText(input.location),

                  category: normalizeText(input.category),
                  responsibleLabel: normalizeText(input.responsibleLabel),

                  assigneeType: input.assigneeType ?? "all",
                  assigneeId: input.assigneeId ?? null,

                  status: input.status ?? "pending",

                  isRequired:
                        typeof input.isRequired === "boolean"
                              ? boolToTinyInt(input.isRequired)
                              : 1,

                  displayOrder: input.displayOrder ?? 0,
                  routineType: input.routineType ?? "daily",

                  isActive:
                        typeof input.isActive === "boolean"
                              ? boolToTinyInt(input.isActive)
                              : 1,

                  completedAt: null,
                  completedBy: null,

                  notes: normalizeText(input.notes),

                  createdAt: new Date(),
                  updatedAt: new Date(),
            });

            const created = await db
                  .select()
                  .from(dailyRoutines)
                  .where(
                        and(
                              eq(dailyRoutines.routineDate, input.routineDate),
                              eq(dailyRoutines.title, title)
                        )
                  )
                  .orderBy(desc(dailyRoutines.id))
                  .limit(1);

            return created[0] ?? null;
      },

      async update(input: UpdateDailyRoutineInput) {
            const existing = await getRoutineById(input.id);

            if (!existing) {
                  throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Không tìm thấy lịch sinh hoạt cần cập nhật.",
                  });
            }

            if (input.title !== undefined && !input.title.trim()) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Tên hoạt động không được để trống.",
                  });
            }

            await db
                  .update(dailyRoutines)
                  .set({
                        routineDate: input.routineDate ?? existing.routineDate,
                        startTime:
                              input.startTime !== undefined ? input.startTime || null : existing.startTime,
                        endTime:
                              input.endTime !== undefined ? input.endTime || null : existing.endTime,

                        title:
                              input.title !== undefined ? input.title.trim() : existing.title,

                        description:
                              input.description !== undefined
                                    ? normalizeText(input.description)
                                    : existing.description,

                        location:
                              input.location !== undefined
                                    ? normalizeText(input.location)
                                    : existing.location,

                        category:
                              input.category !== undefined
                                    ? normalizeText(input.category)
                                    : existing.category,

                        responsibleLabel:
                              input.responsibleLabel !== undefined
                                    ? normalizeText(input.responsibleLabel)
                                    : existing.responsibleLabel,

                        assigneeType: input.assigneeType ?? existing.assigneeType,
                        assigneeId:
                              input.assigneeId !== undefined ? input.assigneeId : existing.assigneeId,

                        status: input.status ?? existing.status,

                        isRequired:
                              typeof input.isRequired === "boolean"
                                    ? boolToTinyInt(input.isRequired)
                                    : existing.isRequired,

                        displayOrder:
                              input.displayOrder !== undefined
                                    ? input.displayOrder
                                    : existing.displayOrder,

                        routineType: input.routineType ?? existing.routineType,

                        isActive:
                              typeof input.isActive === "boolean"
                                    ? boolToTinyInt(input.isActive)
                                    : existing.isActive,

                        notes:
                              input.notes !== undefined
                                    ? normalizeText(input.notes)
                                    : existing.notes,

                        updatedAt: new Date(),
                  })
                  .where(eq(dailyRoutines.id, input.id));

            return getRoutineById(input.id);
      },

      async complete(id: number, completedBy?: number | null) {
            const existing = await getRoutineById(id);

            if (!existing) {
                  throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Không tìm thấy lịch sinh hoạt cần hoàn thành.",
                  });
            }

            await db
                  .update(dailyRoutines)
                  .set({
                        status: "completed",
                        completedAt: new Date(),
                        completedBy: completedBy ?? null,
                        updatedAt: new Date(),
                  })
                  .where(eq(dailyRoutines.id, id));

            return getRoutineById(id);
      },

      async cancel(id: number) {
            const existing = await getRoutineById(id);

            if (!existing) {
                  throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Không tìm thấy lịch sinh hoạt cần hủy.",
                  });
            }

            await db
                  .update(dailyRoutines)
                  .set({
                        status: "cancelled",
                        updatedAt: new Date(),
                  })
                  .where(eq(dailyRoutines.id, id));

            return getRoutineById(id);
      },

      async remove(id: number) {
            const existing = await getRoutineById(id);

            if (!existing) {
                  throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Không tìm thấy lịch sinh hoạt cần xóa.",
                  });
            }

            await db
                  .delete(dailyRoutines)
                  .where(eq(dailyRoutines.id, id));

            return {
                  success: true,
                  id,
            };
      },
};