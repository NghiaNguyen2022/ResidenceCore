import { describe, expect, it } from "vitest";

import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function context(role: "manager" | "resident" | "user" | null): TrpcContext {
      return {
            user: role
                  ? {
                          id: role === "manager" ? 1 : 2,
                          openId: `${role}-route-test`,
                          email: `${role}@example.com`,
                          name: role,
                          loginMethod: "local",
                          role,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                          lastSignedIn: new Date(),
                    }
                  : null,
            req: { protocol: "https", headers: {} } as any,
            res: {} as any,
      };
}

describe("manager API access boundary", () => {
      it.each([
            ["dashboard", (caller: ReturnType<typeof appRouter.createCaller>) => caller.dashboard.getFullDashboard()],
            ["members", (caller: ReturnType<typeof appRouter.createCaller>) => caller.members.list()],
            ["rooms", (caller: ReturnType<typeof appRouter.createCaller>) => caller.rooms.list()],
            ["organization", (caller: ReturnType<typeof appRouter.createCaller>) => caller.organization.listRoles()],
            ["users", (caller: ReturnType<typeof appRouter.createCaller>) => caller.users.list()],
            ["finance", (caller: ReturnType<typeof appRouter.createCaller>) => caller.finance.summary()],
            ["daily routine", (caller: ReturnType<typeof appRouter.createCaller>) => caller.dailyRoutine.today()],
            ["attendance", (caller: ReturnType<typeof appRouter.createCaller>) => caller.attendance.listSchedules()],
            ["clubs", (caller: ReturnType<typeof appRouter.createCaller>) => caller.clubs.list()],
            ["skills", (caller: ReturnType<typeof appRouter.createCaller>) => caller.skills.list()],
      ])("blocks resident access to %s APIs", async (_name, invoke) => {
            await expect(invoke(appRouter.createCaller(context("resident")))).rejects.toMatchObject({
                  code: "FORBIDDEN",
            });
      });

      it("blocks unauthenticated access before checking a manager role", async () => {
            await expect(
                  appRouter.createCaller(context(null)).dashboard.getFullDashboard()
            ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      });

      it("blocks generic authenticated users from the resident portal", async () => {
            await expect(
                  appRouter.createCaller(context("user")).residentPortal.me()
            ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });
});
