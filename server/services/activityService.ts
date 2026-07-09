import * as activityDb from "../db/activities";

export type ActivityType =
      | "community"
      | "spiritual"
      | "study"
      | "sports"
      | "culture"
      | "volunteer"
      | "meeting"
      | "other";

export type ActivityStatus = "draft" | "scheduled" | "in_progress" | "completed" | "cancelled";

export type CreateActivityData = {
      code: string;
      title: string;
      activityType: ActivityType;
      status: ActivityStatus;
      activityDate: string;
      startTime?: string | null;
      endTime?: string | null;
      location?: string | null;
      ownerGroup?: string | null;
      expectedParticipants?: number | null;
      description?: string | null;
      notes?: string | null;
      isPublicOnPortal?: boolean | null;
      createdBy?: number | null;
};

export type UpdateActivityData = Partial<Omit<CreateActivityData, "code" | "createdBy">>;

const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9-]+/g, "-")
            .replace(/^-+|-+$/g, "");
}

function trimOrNull(value?: string | null) {
      const text = String(value || "").trim();
      return text || null;
}

function ensureValidTime(value?: string | null, label = "Giờ") {
      if (!value) return null;
      const text = String(value).trim();
      if (!HHMM_RE.test(text)) {
            throw new Error(`${label} phải đúng định dạng HH:mm.`);
      }
      return text;
}

function toMinutes(value?: string | null) {
      if (!value) return null;
      const [h, m] = value.split(":").map(Number);
      return h * 60 + m;
}

function validateTimeRange(startTime?: string | null, endTime?: string | null) {
      const start = ensureValidTime(startTime, "Giờ bắt đầu");
      const end = ensureValidTime(endTime, "Giờ kết thúc");

      if (start && end && toMinutes(end)! <= toMinutes(start)!) {
            throw new Error("Giờ kết thúc phải sau giờ bắt đầu.");
      }

      return { startTime: start, endTime: end };
}

function validateActivityDate(value?: string | null) {
      const dateText = String(value || "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
            throw new Error("Vui lòng chọn ngày tổ chức hợp lệ.");
      }
      return dateText;
}

class ActivityService {
      async list(filters?: {
            search?: string | null;
            status?: string | null;
            activityType?: string | null;
            limit?: number | null;
            offset?: number | null;
      }) {
            return activityDb.listActivities({
                  ...filters,
                  isActive: true,
            });
      }

      async listPublic(filters?: {
            search?: string | null;
            status?: string | null;
            activityType?: string | null;
            fromDate?: string | null;
            toDate?: string | null;
            limit?: number | null;
            offset?: number | null;
      }) {
            return activityDb.listPublicActivities(filters);
      }

      async getById(id: number) {
            const activity = await activityDb.getActivityById(id);
            if (!activity || activity.isActive === false) throw new Error("Không tìm thấy hoạt động.");
            return activity;
      }

      async create(data: CreateActivityData, userId?: number | null) {
            const code = normalizeCode(data.code);
            if (!code) throw new Error("Vui lòng nhập mã hoạt động.");
            if (!data.title?.trim()) throw new Error("Vui lòng nhập tên hoạt động.");

            const existing = await activityDb.getActivityByCode(code);
            if (existing) throw new Error("Mã hoạt động đã tồn tại. Vui lòng dùng mã khác.");

            const { startTime, endTime } = validateTimeRange(data.startTime, data.endTime);

            return activityDb.createActivity({
                  code,
                  title: data.title.trim(),
                  activityType: data.activityType || "community",
                  status: data.status || "scheduled",
                  activityDate: validateActivityDate(data.activityDate) as any,
                  startTime: startTime as any,
                  endTime: endTime as any,
                  location: trimOrNull(data.location),
                  ownerGroup: trimOrNull(data.ownerGroup),
                  expectedParticipants: Math.max(Number(data.expectedParticipants ?? 0), 0),
                  actualParticipants: 0,
                  description: trimOrNull(data.description),
                  notes: trimOrNull(data.notes),
                  isPublicOnPortal: Boolean(data.isPublicOnPortal),
                  isActive: true,
                  createdBy: userId ?? data.createdBy ?? null,
            });
      }

      async update(id: number, data: UpdateActivityData) {
            const activity = await this.getById(id);
            const nextStartTime = data.startTime !== undefined ? data.startTime : activity.startTime;
            const nextEndTime = data.endTime !== undefined ? data.endTime : activity.endTime;
            const { startTime, endTime } = validateTimeRange(nextStartTime, nextEndTime);

            return activityDb.updateActivity(id, {
                  ...(data.title !== undefined && { title: data.title?.trim() }),
                  ...(data.activityType !== undefined && { activityType: data.activityType }),
                  ...(data.status !== undefined && { status: data.status }),
                  ...(data.activityDate !== undefined && {
                        activityDate: validateActivityDate(data.activityDate) as any,
                  }),
                  ...(data.startTime !== undefined && { startTime: startTime as any }),
                  ...(data.endTime !== undefined && { endTime: endTime as any }),
                  ...(data.location !== undefined && { location: trimOrNull(data.location) }),
                  ...(data.ownerGroup !== undefined && { ownerGroup: trimOrNull(data.ownerGroup) }),
                  ...(data.expectedParticipants !== undefined && {
                        expectedParticipants: Math.max(Number(data.expectedParticipants ?? 0), 0),
                  }),
                  ...(data.description !== undefined && { description: trimOrNull(data.description) }),
                  ...(data.notes !== undefined && { notes: trimOrNull(data.notes) }),
                  ...(data.isPublicOnPortal !== undefined && {
                        isPublicOnPortal: Boolean(data.isPublicOnPortal),
                  }),
            });
      }

      async cancel(id: number) {
            await this.getById(id);
            return activityDb.cancelActivity(id);
      }

      async delete(id: number) {
            await this.getById(id);
            await activityDb.deleteActivity(id);
            return { success: true };
      }

      async getParticipants(activityId: number) {
            await this.getById(activityId);
            return activityDb.getActivityParticipants(activityId);
      }

      async addParticipant(
            activityId: number,
            residentId: number,
            role: "participant" | "organizer" | "volunteer" = "participant"
      ) {
            await this.getById(activityId);
            await activityDb.addActivityParticipant({ activityId, residentId, role, attended: false });
            const participants = await activityDb.getActivityParticipants(activityId);
            await activityDb.updateActivity(activityId, { actualParticipants: participants.length });
            return { success: true };
      }

      async removeParticipant(activityId: number, residentId: number) {
            await this.getById(activityId);
            await activityDb.removeActivityParticipant(activityId, residentId);
            const participants = await activityDb.getActivityParticipants(activityId);
            await activityDb.updateActivity(activityId, { actualParticipants: participants.length });
            return { success: true };
      }

      async markAttendance(activityId: number, residentId: number, attended: boolean) {
            await this.getById(activityId);
            await activityDb.markParticipantAttendance(activityId, residentId, attended);
            return { success: true };
      }

      async getStats() {
            return activityDb.getActivityStats();
      }
}

export const activityService = new ActivityService();
