import { TRPCError } from "@trpc/server";
import * as storeDb from "../db/storeLedger";
import { notifyOwnerAboutEvent } from "./notificationService";
import { storeDutyAccessService } from "./storeDutyAccessService";

function dateKey(value: unknown) {
      if (!value) return "";
      if (typeof value === "string") return value.slice(0, 10);
      const date = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
      const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
      }).formatToParts(date);
      const part = (type: string) =>
            parts.find((item) => item.type === type)?.value || "";
      return `${part("year")}-${part("month")}-${part("day")}`;
}

function managerOnly(user: any) {
      const roles = new Set<string>([
            String(user?.role || ""),
            ...(Array.isArray(user?.roles) ? user.roles.map(String) : []),
      ]);
      if (!roles.has("manager")) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Chỉ quản lý được thực hiện thao tác này." });
      }
}

async function afternoonShift(closing: any) {
      return storeDb.getStoreAfternoonShiftByLedgerDate({
            ledgerId: Number(closing?.ledgerId || 0),
            shiftDate: dateKey(closing?.closingDate),
      });
}

export const storeShiftClosingService = {
      async afterResidentClose(input: {
            user: any;
            storeShiftId: number;
            accessToken: string;
            closing: any;
      }) {
            const access = await storeDutyAccessService.authorizeStoreAction({
                  user: input.user,
                  storeShiftId: input.storeShiftId,
                  accessToken: input.accessToken,
                  ledgerId: Number(input.closing?.ledgerId || 0),
                  operation: "close",
                  touchActivity: true,
            });
            if (access.accessMode !== "resident" || access.shiftType !== "afternoon") {
                  throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Chỉ học viên trực ca chiều được hoàn tất chốt ngày.",
                  });
            }

            const now = new Date();
            await storeDb.updateStoreShift(input.storeShiftId, {
                  status: "closed",
                  closedAt: now,
                  closedBy: input.user?.id ?? null,
            } as any);

            await storeDb.revokeStoreDutyAccessSessions({
                  storeShiftId: input.storeShiftId,
                  residentId: access.residentId,
                  revokedAt: now,
            });

            return {
                  closing: input.closing,
                  shiftStatus: "closed",
                  message: "Đã chốt ngày và kết thúc quyền Cửa hàng của ca chiều.",
            };
      },

      async afterManagerReview(user: any, closing: any) {
            managerOnly(user);
            const shift = await afternoonShift(closing);
            if (shift) {
                  await storeDb.updateStoreShift(Number(shift.id), {
                        status: "reviewed",
                        reviewedBy: user?.id ?? null,
                        reviewedAt: new Date(),
                  } as any);
            }
            return closing;
      },

      async afterManagerConfirm(user: any, closing: any) {
            managerOnly(user);
            const shift = await afternoonShift(closing);
            if (shift) {
                  await storeDb.updateStoreShift(Number(shift.id), {
                        status: "confirmed",
                        confirmedBy: user?.id ?? null,
                        confirmedAt: new Date(),
                  } as any);
            }
            return closing;
      },

      async reopenDailyClosing(input: {
            user: any;
            closingId: number;
            reason: string;
      }) {
            managerOnly(input.user);
            const reason = input.reason.trim();
            if (reason.length < 5) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Vui lòng nhập lý do mở lại rõ ràng.",
                  });
            }

            const closing = await storeDb.getStoreDailyClosingById(input.closingId);
            if (!closing || String(closing.status) === "cancelled") {
                  throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy ngày chốt." });
            }
            if (Boolean((closing as any).postedToFinance) ||
                ["approved", "closed"].includes(String(closing.status))) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Ngày đã xác nhận và đẩy Finance, không thể mở lại.",
                  });
            }

            await storeDb.clearStoreLedgerTransactionsClosing(input.closingId);
            const updated = await storeDb.updateStoreDailyClosing(input.closingId, {
                  status: "cancelled",
                  notes: [
                        String((closing as any).notes || "").trim(),
                        `Mở lại bởi quản lý: ${reason}`,
                  ].filter(Boolean).join("\n"),
            } as any);

            const shift = await afternoonShift(closing);
            if (shift) {
                  await storeDb.updateStoreShift(Number(shift.id), {
                        status: "closing_pending",
                        closedAt: null,
                        reviewedBy: null,
                        reviewedAt: null,
                        confirmedBy: null,
                        confirmedAt: null,
                        notes: [
                              String((shift as any).notes || "").trim(),
                              `Mở lại ngày chốt: ${reason}`,
                        ].filter(Boolean).join("\n"),
                  } as any);
            }

            return { closing: updated, shift, reason, message: "Đã mở lại ngày chốt." };
      },

      async markOverdueClosings() {
            const rows = await storeDb.listOverdueStoreAfternoonShifts(new Date());
            const updated: any[] = [];

            for (const shift of rows as any[]) {
                  const closing = await storeDb.getStoreDailyClosingByDate(
                        Number(shift.ledgerId),
                        dateKey(shift.shiftDate),
                  );
                  if (closing && String(closing.status) !== "cancelled") continue;

                  await storeDb.updateStoreShift(Number(shift.id), {
                        status: "closing_overdue",
                  } as any);

                  await notifyOwnerAboutEvent(
                        "Cửa hàng chưa chốt ngày",
                        `Ca chiều ngày ${dateKey(shift.shiftDate)} đã quá giờ nhưng chưa chốt sổ Cửa hàng.`,
                  );

                  updated.push({
                        shiftId: Number(shift.id),
                        ledgerId: Number(shift.ledgerId),
                        shiftDate: dateKey(shift.shiftDate),
                  });
            }

            return { overdueCount: updated.length, shifts: updated };
      },
};
