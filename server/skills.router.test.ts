import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db/skills", () => ({
      listSkills: vi.fn(),
      createSkill: vi.fn(),
      updateSkill: vi.fn(),
      deleteSkill: vi.fn(),
}));

import { appRouter } from "./routers";
import * as skillsDb from "./db/skills";

function ctx(role: "manager" | "resident"): TrpcContext {
      return {
            user: {
                  id: 31, openId: role, email: `${role}@example.com`, name: role,
                  loginMethod: "local", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
            },
            req: { protocol: "https", headers: {} } as any,
            res: {} as any,
      };
}

const payload = {
      code: "COMMUNICATION", name: "Giao tiếp", category: "communication" as const,
      level: "basic" as const, status: "active" as const, description: null,
      objective: null, evaluationCriteria: null, suggestedDuration: "2 buổi",
      ownerGroup: "Ban kỹ năng", note: null, sortOrder: 10,
};

beforeEach(() => vi.clearAllMocks());

describe("skills router", () => {
      it("blocks residents", async () => {
            await expect(appRouter.createCaller(ctx("resident")).skills.list()).rejects.toThrow(
                  "Bạn không có quyền quản lý kỹ năng."
            );
      });

      it("creates skills for managers", async () => {
            vi.mocked(skillsDb.createSkill).mockResolvedValue({ id: 4 });
            await expect(appRouter.createCaller(ctx("manager")).skills.create(payload)).resolves.toEqual({ id: 4 });
      });
});
