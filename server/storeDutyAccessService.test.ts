import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db/duty", () => ({
      getResidentByUserId: vi.fn(),
}));

vi.mock("./db/storeLedger", () => ({
      listStoreShiftCandidatesForResident: vi.fn(),
      getStoreShiftById: vi.fn(),
      getStoreDutyMember: vi.fn(),
}));

vi.mock("./db", () => ({
      getDb: vi.fn(),
}));

import * as dutyDb from "./db/duty";
import * as storeDb from "./db/storeLedger";
import { storeDutyAccessService } from "./services/storeDutyAccessService";

const CURRENT_TIME = new Date("2026-07-25T03:00:00.000Z");

const activeResident = {
      id: 101,
      userId: 11,
      residentCode: "LX001",
      fullName: "Resident One",
      status: "active",
};

const currentShift = {
      id: 501,
      storeDutyAssignmentId: 301,
      ledgerId: 201,
      shiftDate: "2026-07-25",
      shiftType: "morning",
      scheduledFrom: new Date("2026-07-25T00:00:00.000Z"),
      scheduledTo: new Date("2026-07-25T05:00:00.000Z"),
      accessValidFrom: new Date("2026-07-25T00:00:00.000Z"),
      accessValidUntil: new Date("2026-07-25T07:00:00.000Z"),
      status: "opened",
};

const expiredShift = {
      ...currentShift,
      id: 502,
      shiftDate: "2026-07-24",
      accessValidFrom: new Date("2026-07-24T00:00:00.000Z"),
      accessValidUntil: new Date("2026-07-24T07:00:00.000Z"),
};

beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(CURRENT_TIME);
      vi.clearAllMocks();

      vi.mocked(dutyDb.getResidentByUserId).mockResolvedValue(activeResident as any);
      vi.mocked(storeDb.getStoreShiftById).mockResolvedValue(currentShift as any);
      vi.mocked(storeDb.getStoreDutyMember).mockResolvedValue({
            id: 701,
            storeDutyAssignmentId: 301,
            residentId: 101,
            memberRole: "main",
            status: "assigned",
      } as any);
});

afterEach(() => {
      vi.useRealTimers();
});

describe("storeDutyAccessService assigned shift access", () => {
      it("lists only openable assigned shifts and maps access window", async () => {
            vi.mocked(storeDb.listStoreShiftCandidatesForResident).mockResolvedValue([
                  {
                        storeShiftId: 501,
                        storeDutyAssignmentId: 301,
                        ledgerId: 201,
                        ledgerName: "Cửa hàng chính",
                        shiftDate: "2026-07-25",
                        shiftType: "morning",
                        scheduledFrom: currentShift.scheduledFrom,
                        scheduledTo: currentShift.scheduledTo,
                        accessValidFrom: currentShift.accessValidFrom,
                        accessValidUntil: currentShift.accessValidUntil,
                        shiftStatus: "opened",
                        memberRole: "main",
                  },
                  {
                        storeShiftId: 502,
                        storeDutyAssignmentId: 302,
                        ledgerId: 201,
                        ledgerName: "Cửa hàng chính",
                        shiftDate: "2026-07-25",
                        shiftType: "afternoon",
                        accessValidFrom: currentShift.accessValidFrom,
                        accessValidUntil: currentShift.accessValidUntil,
                        shiftStatus: "closed",
                        memberRole: "main",
                  },
            ] as any);

            const result = await storeDutyAccessService.listMyAssignedShiftOptions(11, {
                  shiftDate: "2026-07-25",
            });

            expect(result).toEqual([
                  expect.objectContaining({
                        storeShiftId: 501,
                        ledgerId: 201,
                        shiftDate: "2026-07-25",
                        shiftType: "morning",
                        validFrom: currentShift.accessValidFrom,
                        validUntil: currentShift.accessValidUntil,
                  }),
            ]);
            expect(storeDb.listStoreShiftCandidatesForResident).toHaveBeenCalledWith(101);
      });

      it("opens a resident store session by matching date and shift without token", async () => {
            vi.mocked(storeDb.listStoreShiftCandidatesForResident).mockResolvedValue([
                  {
                        storeShiftId: 501,
                        storeDutyAssignmentId: 301,
                        ledgerId: 201,
                        ledgerName: "Cửa hàng chính",
                        shiftDate: "2026-07-25",
                        shiftType: "morning",
                        accessValidFrom: currentShift.accessValidFrom,
                        accessValidUntil: currentShift.accessValidUntil,
                        shiftStatus: "opened",
                        memberRole: "main",
                  },
            ] as any);

            await expect(
                  storeDutyAccessService.openMyAssignedShift({
                        userId: 11,
                        shiftDate: "2026-07-25",
                        shiftType: "morning",
                  }),
            ).resolves.toEqual(
                  expect.objectContaining({
                        success: true,
                        accessToken: "assigned-store-shift-access",
                        storeShiftId: 501,
                        ledgerId: 201,
                        validFrom: currentShift.accessValidFrom,
                        validUntil: currentShift.accessValidUntil,
                  }),
            );
      });

      it("allows write operations only when the assigned shift is current", async () => {
            const access = await storeDutyAccessService.authorizeStoreAction({
                  user: { id: 11, role: "resident" },
                  storeShiftId: 501,
                  ledgerId: 201,
                  operation: "write",
            });

            expect(access).toEqual(
                  expect.objectContaining({
                        accessMode: "resident",
                        residentId: 101,
                        storeShiftId: 501,
                        ledgerId: 201,
                        isCurrentShift: true,
                        operation: "write",
                  }),
            );
      });

      it("keeps non-current assigned shifts read/close only", async () => {
            vi.mocked(storeDb.getStoreShiftById).mockResolvedValue(expiredShift as any);

            await expect(
                  storeDutyAccessService.authorizeStoreAction({
                        user: { id: 11, role: "resident" },
                        storeShiftId: 502,
                        ledgerId: 201,
                        operation: "read",
                  }),
            ).resolves.toEqual(expect.objectContaining({ isCurrentShift: false }));

            await expect(
                  storeDutyAccessService.authorizeStoreAction({
                        user: { id: 11, role: "resident" },
                        storeShiftId: 502,
                        ledgerId: 201,
                        operation: "close",
                  }),
            ).resolves.toEqual(expect.objectContaining({ operation: "close" }));

            await expect(
                  storeDutyAccessService.authorizeStoreAction({
                        user: { id: 11, role: "resident" },
                        storeShiftId: 502,
                        ledgerId: 201,
                        operation: "write",
                  }),
            ).rejects.toThrow("Chỉ được xem và chốt sổ");
      });

      it("rejects resident access when the selected ledger or shift member is invalid", async () => {
            await expect(
                  storeDutyAccessService.authorizeStoreAction({
                        user: { id: 11, role: "resident" },
                        storeShiftId: 501,
                        ledgerId: 999,
                        operation: "read",
                  }),
            ).rejects.toThrow("không thuộc cửa hàng hiện tại");

            vi.mocked(storeDb.getStoreDutyMember).mockResolvedValueOnce(null as any);

            await expect(
                  storeDutyAccessService.authorizeStoreAction({
                        user: { id: 11, role: "resident" },
                        storeShiftId: 501,
                        ledgerId: 201,
                        operation: "read",
                  }),
            ).rejects.toThrow("không được phân công");
      });
});
