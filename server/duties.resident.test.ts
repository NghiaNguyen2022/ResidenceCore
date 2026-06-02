import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
      getResidentByUserId: vi.fn(),
      getAssignmentsByResident: vi.fn(),
      getAssignmentById: vi.fn(),
      updateAssignmentForResident: vi.fn(),
}));

import { appRouter } from "./routers";
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUser(role: AuthenticatedUser["role"]): AuthenticatedUser {
      return {
            id: 1,
            openId: "resident-1",
            email: "resident1@example.com",
            name: "Resident One",
            loginMethod: "manus",
            role,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
      };
}

function createCtx(user: AuthenticatedUser): TrpcContext {
      return {
            user,
            req: {
                  protocol: "https",
                  headers: {},
            } as any,
            res: {} as any,
      };
}

beforeEach(async () => {
      const db = await import("./db");
      vi.clearAllMocks();
      // ensure the mocked module is loaded before tests run
      expect(db).toBeDefined();
});

describe("duties resident endpoints", () => {
      it("forbids non-residents from accessing getMyAssignments", async () => {
            const ctx = createCtx(createUser("manager"));
            const caller = appRouter.createCaller(ctx);

            await expect(caller.duties.getMyAssignments()).rejects.toThrow(
                  "Chỉ resident mới được xem công tác của mình"
            );
      });

      it("returns assignments for the current resident", async () => {
            const db = await import("./db");
            const resident = { id: 123, userId: 1, residentCode: "R001", fullName: "Resident One" };
            const assignments = [
                  {
                        id: 987,
                        residentId: 123,
                        dutyConfigId: 1,
                        assignedDate: new Date(),
                        status: "pending",
                  },
            ];

            db.getResidentByUserId.mockResolvedValue(resident);
            db.getAssignmentsByResident.mockResolvedValue(assignments);

            const ctx = createCtx(createUser("resident"));
            const caller = appRouter.createCaller(ctx);

            const result = await caller.duties.getMyAssignments();

            expect(result).toEqual(assignments);
            expect(db.getResidentByUserId).toHaveBeenCalledWith(ctx.user.id);
            expect(db.getAssignmentsByResident).toHaveBeenCalledWith(resident.id);
      });

      it("forbids resident from updating an assignment that does not belong to them", async () => {
            const db = await import("./db");
            db.getResidentByUserId.mockResolvedValue({ id: 123, userId: 1, residentCode: "R001", fullName: "Resident One" });
            db.getAssignmentById.mockResolvedValue({ id: 999, residentId: 456, status: "pending" });

            const ctx = createCtx(createUser("resident"));
            const caller = appRouter.createCaller(ctx);

            await expect(
                  caller.duties.updateMyAssignment({ id: 999, status: "completed" })
            ).rejects.toThrow("Bạn không có quyền cập nhật công tác này");
      });

      it("allows resident to update their own assignment", async () => {
            const db = await import("./db");
            db.getResidentByUserId.mockResolvedValue({ id: 123, userId: 1, residentCode: "R001", fullName: "Resident One" });
            db.getAssignmentById.mockResolvedValue({ id: 999, residentId: 123, status: "pending" });
            db.updateAssignmentForResident.mockResolvedValue({ affectedRows: 1 });

            const ctx = createCtx(createUser("resident"));
            const caller = appRouter.createCaller(ctx);

            const result = await caller.duties.updateMyAssignment({
                  id: 999,
                  status: "completed",
                  completedAt: new Date(),
            });

            expect(result).toEqual({ success: true });
            expect(db.updateAssignmentForResident).toHaveBeenCalledWith(
                  123,
                  999,
                  expect.objectContaining({ status: "completed" })
            );
      });
});
