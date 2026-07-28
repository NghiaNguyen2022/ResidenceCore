import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db/clubs", () => ({
      listClubs: vi.fn(),
      createClub: vi.fn(),
      updateClub: vi.fn(),
      deleteClub: vi.fn(),
}));

import { appRouter } from "./routers";
import * as clubsDb from "./db/clubs";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: AuthenticatedUser["role"]): TrpcContext {
      return {
            user: {
                  id: 21,
                  openId: `${role}-21`,
                  email: `${role}21@example.com`,
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

const validClub = {
      code: "MUSIC_CLUB",
      name: "Câu lạc bộ âm nhạc",
      clubType: "music" as const,
      status: "active" as const,
      leaderName: "Ban âm nhạc",
      mentorName: null,
      meetingSchedule: "Thứ 7",
      location: "Phòng sinh hoạt",
      memberCount: 10,
      maxMembers: 20,
      objective: "Phát triển năng khiếu",
      note: null,
      sortOrder: 10,
};

beforeEach(() => vi.clearAllMocks());

describe("clubs router", () => {
      it("blocks residents from club management", async () => {
            const caller = appRouter.createCaller(createContext("resident"));
            await expect(caller.clubs.list()).rejects.toMatchObject({
                  code: "FORBIDDEN",
            });
      });

      it("creates a valid club for managers", async () => {
            vi.mocked(clubsDb.createClub).mockResolvedValue({ id: 7 });
            const caller = appRouter.createCaller(createContext("manager"));

            await expect(caller.clubs.create(validClub)).resolves.toEqual({ id: 7 });
            expect(clubsDb.createClub).toHaveBeenCalledWith(validClub);
      });

      it("rejects member count greater than capacity", async () => {
            const caller = appRouter.createCaller(createContext("manager"));

            await expect(
                  caller.clubs.create({ ...validClub, memberCount: 21, maxMembers: 20 })
            ).rejects.toThrow(
                  "Số thành viên hiện tại không được lớn hơn số thành viên tối đa."
            );
            expect(clubsDb.createClub).not.toHaveBeenCalled();
      });
});
