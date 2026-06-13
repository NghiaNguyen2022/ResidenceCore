import * as db from "../db";

export type CreateActivityData = {
      code: string;
      title: string;
      activityType:
            | "community"
            | "spiritual"
            | "study"
            | "sports"
            | "culture"
            | "volunteer"
            | "meeting"
            | "other";
      status: "draft" | "scheduled" | "in_progress" | "completed" | "cancelled";
      activityDate: string;
      startTime?: string | null;
      endTime?: string | null;
      location?: string | null;
      ownerGroup?: string | null;
      expectedParticipants?: number;
      description?: string | null;
      notes?: string | null;
      createdBy?: number | null;
};

export type UpdateActivityData = Partial<Omit<CreateActivityData, "code">>;

function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^A-Z0-9-]+/g, "-")
            .replace(/^-+|-+$/g, "");
}

class ActivityService {
      async list(filters?: {
            search?: string;
            status?: string;
            activityType?: string;
            limit?: number;
            offset?: number;
      }) {
            return db.getActivities(filters);
      }

      async getById(id: number) {
            const activity = await db.getActivityById(id);
            if (!activity) throw new Error("Không tìm thấy hoạt động.");
            return activity;
      }

      async create(data: CreateActivityData, userId?: number) {
            const code = normalizeCode(data.code);
            if (!code) throw new Error("Vui lòng nhập mã hoạt động.");
            if (!data.title?.trim()) throw new Error("Vui lòng nhập tên hoạt động.");
            if (!data.activityDate) throw new Error("Vui lòng chọn ngày tổ chức.");

            const existing = await db.getActivityByCode(code);
            if (existing) throw new Error("Mã hoạt động đã tồn tại. Vui lòng dùng mã khác.");

            return db.createActivity({
                  code,
                  title: data.title.trim(),
                  activityType: data.activityType,
                  status: data.status,
                  activityDate: data.activityDate as any,
                  startTime: data.startTime ?? null,
                  endTime: data.endTime ?? null,
                  location: data.location?.trim() ?? null,
                  ownerGroup: data.ownerGroup?.trim() ?? null,
                  expectedParticipants: data.expectedParticipants ?? 0,
                  actualParticipants: 0,
                  description: data.description?.trim() ?? null,
                  notes: data.notes?.trim() ?? null,
                  createdBy: userId ?? null,
                  isActive: true,
            });
      }

      async update(id: number, data: UpdateActivityData) {
            const activity = await db.getActivityById(id);
            if (!activity) throw new Error("Không tìm thấy hoạt động.");

            return db.updateActivity(id, {
                  ...(data.title !== undefined && { title: data.title?.trim() }),
                  ...(data.activityType !== undefined && { activityType: data.activityType }),
                  ...(data.status !== undefined && { status: data.status }),
                  ...(data.activityDate !== undefined && { activityDate: data.activityDate as any }),
                  ...(data.startTime !== undefined && { startTime: data.startTime }),
                  ...(data.endTime !== undefined && { endTime: data.endTime }),
                  ...(data.location !== undefined && { location: data.location?.trim() ?? null }),
                  ...(data.ownerGroup !== undefined && { ownerGroup: data.ownerGroup?.trim() ?? null }),
                  ...(data.expectedParticipants !== undefined && {
                        expectedParticipants: data.expectedParticipants,
                  }),
                  ...(data.description !== undefined && {
                        description: data.description?.trim() ?? null,
                  }),
                  ...(data.notes !== undefined && { notes: data.notes?.trim() ?? null }),
            });
      }

      async delete(id: number) {
            const activity = await db.getActivityById(id);
            if (!activity) throw new Error("Không tìm thấy hoạt động.");
            await db.deleteActivity(id);
            return { success: true };
      }

      async getParticipants(activityId: number) {
            const activity = await db.getActivityById(activityId);
            if (!activity) throw new Error("Không tìm thấy hoạt động.");
            return db.getActivityParticipants(activityId);
      }

      async addParticipant(
            activityId: number,
            residentId: number,
            role: "participant" | "organizer" | "volunteer" = "participant"
      ) {
            const activity = await db.getActivityById(activityId);
            if (!activity) throw new Error("Không tìm thấy hoạt động.");
            await db.addActivityParticipant({ activityId, residentId, role, attended: false });
            // Update actualParticipants count
            const participants = await db.getActivityParticipants(activityId);
            await db.updateActivity(activityId, { actualParticipants: participants.length });
            return { success: true };
      }

      async removeParticipant(activityId: number, residentId: number) {
            const activity = await db.getActivityById(activityId);
            if (!activity) throw new Error("Không tìm thấy hoạt động.");
            await db.removeActivityParticipant(activityId, residentId);
            const participants = await db.getActivityParticipants(activityId);
            await db.updateActivity(activityId, { actualParticipants: participants.length });
            return { success: true };
      }

      async markAttendance(activityId: number, residentId: number, attended: boolean) {
            const activity = await db.getActivityById(activityId);
            if (!activity) throw new Error("Không tìm thấy hoạt động.");
            await db.markParticipantAttendance(activityId, residentId, attended);
            return { success: true };
      }

      async getStats() {
            return db.getActivityStats();
      }
}

export const activityService = new ActivityService();
