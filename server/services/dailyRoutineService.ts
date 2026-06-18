// @ts-nocheck
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { normalizeText } from '../lib/utils';
import {
      dailyRoutineItems,
      dailyRoutines,
      dailyRoutineTemplates,
} from "../db/dailyRoutines";

export type DailyRoutineStatus = "pending" | "completed" | "cancelled";
export type DailyRoutineType = "daily" | "weekly" | "special";
export type DailyRoutineAssigneeType = "all" | "resident" | "room" | "group";

export type DailyRoutineTemplateDayType = "weekday" | "sunday" | "special";

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

export interface ListDailyRoutineTemplatesInput {
      search?: string;
      dayType?: DailyRoutineTemplateDayType | "all";
      isActive?: boolean;
      limit?: number;
      offset?: number;
}

export interface CreateDailyRoutineTemplateInput {
      code: string;
      name: string;
      dayType?: DailyRoutineTemplateDayType;
      description?: string | null;
      isActive?: boolean;
      sortOrder?: number;
}

export interface UpdateDailyRoutineTemplateInput {
      id: number;
      code?: string;
      name?: string;
      dayType?: DailyRoutineTemplateDayType;
      description?: string | null;
      isActive?: boolean;
      sortOrder?: number;
}

export interface ListDailyRoutineItemsInput {
      templateId?: number;
      isActive?: boolean;
      limit?: number;
      offset?: number;
}

export interface CreateDailyRoutineItemInput {
      templateId: number;
      startTime: string;
      endTime: string;
      title: string;
      location?: string | null;
      description?: string | null;
      isActive?: boolean;
      sortOrder?: number;
}

export interface UpdateDailyRoutineItemInput {
      id: number;
      templateId?: number;
      startTime?: string;
      endTime?: string;
      title?: string;
      location?: string | null;
      description?: string | null;
      isActive?: boolean;
      sortOrder?: number;
}


function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
}

function normalizeTime(value?: string | null) {
      const text = value?.trim();

      if (!text) return null;

      if (/^\d{2}:\d{2}$/.test(text)) {
            return `${text}:00`;
      }

      if (/^\d{2}:\d{2}:\d{2}$/.test(text)) {
            return text;
      }

      throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Giờ sinh hoạt không hợp lệ. Vui lòng nhập theo định dạng HH:mm.",
      });
}

function validateTimeRange(startTime?: string | null, endTime?: string | null) {
      if (!startTime || !endTime) return;

      if (endTime <= startTime) {
            throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: "Giờ kết thúc phải lớn hơn giờ bắt đầu.",
            });
      }
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

async function getTemplateById(id: number) {
      const rows = await db
            .select()
            .from(dailyRoutineTemplates)
            .where(eq(dailyRoutineTemplates.id, id))
            .limit(1);

      return rows[0] ?? null;
}

async function getTemplateByCode(code: string) {
      const rows = await db
            .select()
            .from(dailyRoutineTemplates)
            .where(eq(dailyRoutineTemplates.code, code))
            .limit(1);

      return rows[0] ?? null;
}

async function getItemById(id: number) {
      const rows = await db
            .select()
            .from(dailyRoutineItems)
            .where(eq(dailyRoutineItems.id, id))
            .limit(1);

      return rows[0] ?? null;
}

export const dailyRoutineService = {
      /**
       * Date-based daily routine records.
       * Giữ nhóm hàm cũ để không ảnh hưởng route/UI hiện tại.
       */
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

            const startTime = normalizeTime(input.startTime);
            const endTime = normalizeTime(input.endTime);

            validateTimeRange(startTime, endTime);

            await db.insert(dailyRoutines).values({
                  routineDate: input.routineDate,
                  startTime,
                  endTime,

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

            const startTime =
                  input.startTime !== undefined
                        ? normalizeTime(input.startTime)
                        : existing.startTime;

            const endTime =
                  input.endTime !== undefined
                        ? normalizeTime(input.endTime)
                        : existing.endTime;

            validateTimeRange(startTime, endTime);

            await db
                  .update(dailyRoutines)
                  .set({
                        routineDate: input.routineDate ?? existing.routineDate,
                        startTime,
                        endTime,

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

      /**
       * Template-based daily routine.
       * Đây là phần mới dùng cho Simple Mode: ngày thường / Chúa nhật / ngày đặc biệt.
       */
      async listTemplates(input: ListDailyRoutineTemplatesInput = {}) {
            const conditions = [];

            if (input.search?.trim()) {
                  const keyword = `%${input.search.trim()}%`;

                  conditions.push(
                        sql`(${dailyRoutineTemplates.code} LIKE ${keyword}
                              OR ${dailyRoutineTemplates.name} LIKE ${keyword}
                              OR ${dailyRoutineTemplates.description} LIKE ${keyword})`
                  );
            }

            if (input.dayType && input.dayType !== "all") {
                  conditions.push(eq(dailyRoutineTemplates.dayType, input.dayType));
            }

            if (typeof input.isActive === "boolean") {
                  conditions.push(
                        eq(dailyRoutineTemplates.isActive, input.isActive ? 1 : 0)
                  );
            }

            return db
                  .select()
                  .from(dailyRoutineTemplates)
                  .where(conditions.length > 0 ? and(...conditions) : undefined)
                  .orderBy(
                        asc(dailyRoutineTemplates.sortOrder),
                        asc(dailyRoutineTemplates.name),
                        asc(dailyRoutineTemplates.id)
                  )
                  .limit(input.limit ?? 200)
                  .offset(input.offset ?? 0);
      },

      async getTemplate(id: number) {
            const template = await getTemplateById(id);

            if (!template) {
                  throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Không tìm thấy mẫu lịch sinh hoạt.",
                  });
            }

            return template;
      },

      async getTemplateWithItems(id: number) {
            const template = await this.getTemplate(id);

            const items = await this.listItems({
                  templateId: id,
                  limit: 500,
                  offset: 0,
            });

            return {
                  ...template,
                  items,
            };
      },

      async createTemplate(input: CreateDailyRoutineTemplateInput) {
            const code = normalizeCode(input.code);
            const name = input.name.trim();

            if (!code) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Vui lòng nhập mã mẫu lịch.",
                  });
            }

            if (!name) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Vui lòng nhập tên mẫu lịch.",
                  });
            }

            const duplicatedCode = await getTemplateByCode(code);

            if (duplicatedCode) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Mã mẫu lịch đã tồn tại.",
                  });
            }

            await db.insert(dailyRoutineTemplates).values({
                  code,
                  name,
                  dayType: input.dayType ?? "weekday",
                  description: normalizeText(input.description),
                  isActive:
                        typeof input.isActive === "boolean"
                              ? boolToTinyInt(input.isActive)
                              : 1,
                  sortOrder: input.sortOrder ?? 10,
            } as any);

            return getTemplateByCode(code);
      },

      async updateTemplate(input: UpdateDailyRoutineTemplateInput) {
            const existing = await this.getTemplate(input.id);

            let code = existing.code;

            if (input.code !== undefined) {
                  code = normalizeCode(input.code);

                  if (!code) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: "Mã mẫu lịch không được để trống.",
                        });
                  }

                  const duplicatedCode = await getTemplateByCode(code);

                  if (duplicatedCode && duplicatedCode.id !== input.id) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: "Mã mẫu lịch đã tồn tại.",
                        });
                  }
            }

            if (input.name !== undefined && !input.name.trim()) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Tên mẫu lịch không được để trống.",
                  });
            }

            await db
                  .update(dailyRoutineTemplates)
                  .set({
                        code,
                        name:
                              input.name !== undefined
                                    ? input.name.trim()
                                    : existing.name,
                        dayType: input.dayType ?? existing.dayType,
                        description:
                              input.description !== undefined
                                    ? normalizeText(input.description)
                                    : existing.description,
                        isActive:
                              typeof input.isActive === "boolean"
                                    ? boolToTinyInt(input.isActive)
                                    : existing.isActive,
                        sortOrder:
                              input.sortOrder !== undefined
                                    ? input.sortOrder
                                    : existing.sortOrder,
                        updatedAt: new Date(),
                  } as any)
                  .where(eq(dailyRoutineTemplates.id, input.id));

            return getTemplateById(input.id);
      },

      async removeTemplate(id: number) {
            await this.getTemplate(id);

            await db
                  .delete(dailyRoutineTemplates)
                  .where(eq(dailyRoutineTemplates.id, id));

            return {
                  success: true,
                  id,
            };
      },

      async listItems(input: ListDailyRoutineItemsInput = {}) {
            const conditions = [];

            if (input.templateId) {
                  conditions.push(eq(dailyRoutineItems.templateId, input.templateId));
            }

            if (typeof input.isActive === "boolean") {
                  conditions.push(eq(dailyRoutineItems.isActive, input.isActive ? 1 : 0));
            }

            return db
                  .select()
                  .from(dailyRoutineItems)
                  .where(conditions.length > 0 ? and(...conditions) : undefined)
                  .orderBy(
                        asc(dailyRoutineItems.sortOrder),
                        asc(dailyRoutineItems.startTime),
                        asc(dailyRoutineItems.id)
                  )
                  .limit(input.limit ?? 500)
                  .offset(input.offset ?? 0);
      },

      async getItem(id: number) {
            const item = await getItemById(id);

            if (!item) {
                  throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Không tìm thấy khung giờ sinh hoạt.",
                  });
            }

            return item;
      },

      async createItem(input: CreateDailyRoutineItemInput) {
            const template = await getTemplateById(input.templateId);

            if (!template) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Mẫu lịch sinh hoạt không tồn tại.",
                  });
            }

            const title = input.title.trim();

            if (!title) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Vui lòng nhập tên hoạt động.",
                  });
            }

            const startTime = normalizeTime(input.startTime);
            const endTime = normalizeTime(input.endTime);

            validateTimeRange(startTime, endTime);

            await db.insert(dailyRoutineItems).values({
                  templateId: input.templateId,
                  startTime,
                  endTime,
                  title,
                  location: normalizeText(input.location),
                  description: normalizeText(input.description),
                  isActive:
                        typeof input.isActive === "boolean"
                              ? boolToTinyInt(input.isActive)
                              : 1,
                  sortOrder: input.sortOrder ?? 10,
            } as any);

            const created = await db
                  .select()
                  .from(dailyRoutineItems)
                  .where(
                        and(
                              eq(dailyRoutineItems.templateId, input.templateId),
                              eq(dailyRoutineItems.title, title),
                              eq(dailyRoutineItems.startTime, startTime)
                        )
                  )
                  .orderBy(desc(dailyRoutineItems.id))
                  .limit(1);

            return created[0] ?? null;
      },

      async updateItem(input: UpdateDailyRoutineItemInput) {
            const existing = await this.getItem(input.id);

            const templateId = input.templateId ?? existing.templateId;

            const template = await getTemplateById(templateId);

            if (!template) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Mẫu lịch sinh hoạt không tồn tại.",
                  });
            }

            if (input.title !== undefined && !input.title.trim()) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Tên hoạt động không được để trống.",
                  });
            }

            const startTime =
                  input.startTime !== undefined
                        ? normalizeTime(input.startTime)
                        : existing.startTime;

            const endTime =
                  input.endTime !== undefined
                        ? normalizeTime(input.endTime)
                        : existing.endTime;

            validateTimeRange(startTime, endTime);

            await db
                  .update(dailyRoutineItems)
                  .set({
                        templateId,
                        startTime,
                        endTime,
                        title:
                              input.title !== undefined
                                    ? input.title.trim()
                                    : existing.title,
                        location:
                              input.location !== undefined
                                    ? normalizeText(input.location)
                                    : existing.location,
                        description:
                              input.description !== undefined
                                    ? normalizeText(input.description)
                                    : existing.description,
                        isActive:
                              typeof input.isActive === "boolean"
                                    ? boolToTinyInt(input.isActive)
                                    : existing.isActive,
                        sortOrder:
                              input.sortOrder !== undefined
                                    ? input.sortOrder
                                    : existing.sortOrder,
                        updatedAt: new Date(),
                  } as any)
                  .where(eq(dailyRoutineItems.id, input.id));

            return getItemById(input.id);
      },

      async removeItem(id: number) {
            await this.getItem(id);

            await db
                  .delete(dailyRoutineItems)
                  .where(eq(dailyRoutineItems.id, id));

            return {
                  success: true,
                  id,
            };
      },
};

