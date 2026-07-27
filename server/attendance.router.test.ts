import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db/attendance", () => ({
      listAttendanceSchedules: vi.fn(),
      createAttendanceSchedule: vi.fn(),
      updateAttendanceSchedule: vi.fn(),
      deleteAttendanceSchedule: vi.fn(),
      listAttendanceRecords: vi.fn(),
      saveAttendanceBatch: vi.fn(),
}));

import { appRouter } from "./routers";
import * as attendanceDb from "./db/attendance";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: AuthenticatedUser["role"]): TrpcContext {
      return {
            user: {
                  id: 11,
                  openId: `${role}-11`,
                  email: `${role}@example.com`,
                  name: role === "manager" ? "Manager" : "Resident",
                  loginMethod: "local",
                  role,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  lastSignedIn: new Date(),
            },
            req: { protocol: "https", headers: {} } as any,
            res: {} as any,
      };
}

beforeEach(() => {
      vi.clearAllMocks();
});

describe("attendance router", () => {
      it("blocks residents from attendance management", async () => {
            const caller = appRouter.createCaller(createContext("resident"));

            await expect(caller.attendance.listSchedules()).rejects.toThrow(
                  "Bạn không có quyền quản lý điểm danh."
            );
      });

      it("returns schedules for managers", async () => {
            vi.mocked(attendanceDb.listAttendanceSchedules).mockResolvedValue([
                  {
                        id: 1,
                        name: "Điểm danh tối",
                        type: "curfew",
                        scheduledTime: "21:30:00",
                        tolerance: 5,
                        isDaily: true,
                        daysOfWeek: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                  },
            ]);
            const caller = appRouter.createCaller(createContext("manager"));

            const result = await caller.attendance.listSchedules();

            expect(result).toHaveLength(1);
            expect(attendanceDb.listAttendanceSchedules).toHaveBeenCalledOnce();
      });

      it("validates schedule time before writing", async () => {
            const caller = appRouter.createCaller(createContext("manager"));

            await expect(
                  caller.attendance.createSchedule({
                        name: "Lịch sai giờ",
                        type: "activity",
                        scheduledTime: "25:90",
                        isDaily: true,
                  })
            ).rejects.toThrow("Giờ điểm danh không hợp lệ.");
            expect(attendanceDb.createAttendanceSchedule).not.toHaveBeenCalled();
      });
});
