import * as dutyDb from "../db/duty";
import * as storeDb from "../db/storeLedger";
import { storeDutyAccessService } from "./storeDutyAccessService";

function toMoney(value: unknown) {
      const amount = Number(value || 0);
      return Number.isFinite(amount) ? amount : 0;
}

function asMoney(value: unknown) {
      return toMoney(value).toFixed(2);
}

function toDateKey(value: unknown) {
      if (!value) return "";

      // Chỉ trả thẳng khi DB thực sự trả về kiểu DATE thuần YYYY-MM-DD.
      // Nếu là ISO datetime như 2026-07-20T17:00:00.000Z thì phải parse và
      // đổi sang Asia/Ho_Chi_Minh; lấy 10 ký tự đầu sẽ bị lùi sai một ngày.
      if (
            typeof value === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
      ) {
            return value.trim();
      }

      const date = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(date.getTime())) {
            throw new Error("Ngày ca trực Cửa hàng không hợp lệ.");
      }

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

async function getResidentOrThrow(userId: number) {
      const resident = await dutyDb.getResidentByUserId(userId);
      if (!resident?.id) throw new Error("Không tìm thấy hồ sơ học viên.");
      return resident;
}

async function getAuthorizedResident(input: {
      user: any;
      accessToken: string;
      storeShiftId: number;
}) {
      const access = await storeDutyAccessService.authorizeStoreAction({
            user: input.user,
            accessToken: input.accessToken,
            storeShiftId: input.storeShiftId,
            touchActivity: true,
      });

      if (access.accessMode !== "resident" || !access.residentId) {
            throw new Error("Chức năng bàn giao chỉ dành cho học viên trực ca.");
      }

      const shift = await storeDb.getStoreShiftById(input.storeShiftId);
      if (!shift) throw new Error("Không tìm thấy ca trực Cửa hàng.");

      return { access, shift };
}

/**
 * Dùng cùng nguồn dữ liệu với card Tổng thu/Tổng chi của trang học viên:
 * đúng cửa hàng + đúng ngày + giao dịch còn hiệu lực.
 */
async function calculateShiftCash(shift: any) {
      const shiftDate = toDateKey(shift.shiftDate);
      const transactions = await storeDb.listStoreLedgerTransactions({
            ledgerId: Number(shift.ledgerId),
            fromDate: shiftDate,
            toDate: shiftDate,
            direction: "all",
            limit: 500,
      });

      const validTransactions = (transactions || []).filter(
            (item: any) =>
                  item.isActive !== false &&
                  String(item.status || "posted").toLowerCase() === "posted",
      );

      const totalSales = validTransactions
            .filter((item: any) => item.direction === "in" && item.category === "sales")
            .reduce((sum: number, item: any) => sum + toMoney(item.amount), 0);

      const totalOtherIncome = validTransactions
            .filter((item: any) => item.direction === "in" && item.category !== "sales")
            .reduce((sum: number, item: any) => sum + toMoney(item.amount), 0);

      const totalPurchases = validTransactions
            .filter(
                  (item: any) =>
                        item.direction === "out" &&
                        ["purchase_stock", "purchase"].includes(String(item.category || "")),
            )
            .reduce((sum: number, item: any) => sum + toMoney(item.amount), 0);

      const totalOtherExpense = validTransactions
            .filter(
                  (item: any) =>
                        item.direction === "out" &&
                        !["purchase_stock", "purchase"].includes(String(item.category || "")),
            )
            .reduce((sum: number, item: any) => sum + toMoney(item.amount), 0);

      const openingCash = toMoney(shift.openingCash);
      const expectedCash =
            openingCash + totalSales + totalOtherIncome - totalPurchases - totalOtherExpense;

      return {
            openingCash,
            totalSales,
            totalOtherIncome,
            totalPurchases,
            totalOtherExpense,
            expectedCash,
            transactionCount: validTransactions.length,
      };
}

async function findReceiverShift(shift: any) {
      if (shift.shiftType !== "morning") return null;

      return storeDb.getStoreShiftByLedgerDateType({
            ledgerId: Number(shift.ledgerId),
            shiftDate: toDateKey(shift.shiftDate),
            shiftType: "afternoon",
      });
}

export const storeShiftHandoverService = {
      async getMyHandover(input: {
            user: any;
            accessToken: string;
            storeShiftId: number;
      }) {
            const { access, shift } = await getAuthorizedResident(input);
            const residentId = Number(access.residentId);

            const handover =
                  shift.shiftType === "morning"
                        ? await storeDb.getLatestStoreShiftHandover(Number(shift.id))
                        : await storeDb.getStoreShiftHandoverToShift(Number(shift.id));

            const receiverShift =
                  shift.shiftType === "morning" ? await findReceiverShift(shift) : null;

            const totals =
                  shift.shiftType === "morning" ? await calculateShiftCash(shift) : null;

            return {
                  shift: {
                        id: Number(shift.id),
                        ledgerId: Number(shift.ledgerId),
                        shiftDate: shift.shiftDate,
                        shiftType: shift.shiftType,
                        openingCash: toMoney(shift.openingCash),
                        status: shift.status,
                  },
                  residentId,
                  receiverShift: receiverShift
                        ? {
                                id: Number(receiverShift.id),
                                primaryResidentId: receiverShift.primaryResidentId
                                      ? Number(receiverShift.primaryResidentId)
                                      : null,
                                openingCash: toMoney(receiverShift.openingCash),
                                status: receiverShift.status,
                          }
                        : null,
                  totals,
                  handover,
                  canEdit:
                        shift.shiftType === "morning" &&
                        (!handover || handover.status === "draft"),
                  canGiverSign:
                        shift.shiftType === "morning" &&
                        Boolean(handover) &&
                        handover.status === "draft",
                  canReceive:
                        shift.shiftType === "afternoon" &&
                        Boolean(handover) &&
                        handover.status === "giver_signed",
            };
      },

      async saveMyHandover(input: {
            user: any;
            accessToken: string;
            storeShiftId: number;
            countedCash: number;
            differenceReason?: string | null;
            notes?: string | null;
      }) {
            const { access, shift } = await getAuthorizedResident(input);
            if (shift.shiftType !== "morning") {
                  throw new Error("Chỉ ca sáng được lập bàn giao sang ca chiều.");
            }

            const receiverShift = await findReceiverShift(shift);
            if (!receiverShift) {
                  throw new Error("Chưa có ca chiều cùng ngày để nhận bàn giao.");
            }

            const current = await storeDb.getLatestStoreShiftHandover(Number(shift.id));
            if (current && current.status !== "draft") {
                  throw new Error("Bàn giao đã ký, không thể chỉnh sửa.");
            }

            const totals = await calculateShiftCash(shift);
            const countedCash = toMoney(input.countedCash);
            if (countedCash < 0) throw new Error("Tiền thực tế không được âm.");

            const differenceAmount = countedCash - totals.expectedCash;
            const payload = {
                  storeShiftId: Number(shift.id),
                  handoverType: "shift_to_shift",
                  handoverToShiftId: Number(receiverShift.id),
                  openingCash: asMoney(totals.openingCash),
                  totalSales: asMoney(totals.totalSales),
                  totalOtherIncome: asMoney(totals.totalOtherIncome),
                  totalPurchases: asMoney(totals.totalPurchases),
                  totalOtherExpense: asMoney(totals.totalOtherExpense),
                  expectedCash: asMoney(totals.expectedCash),
                  countedCash: asMoney(countedCash),
                  differenceAmount: asMoney(differenceAmount),
                  differenceReason: input.differenceReason?.trim() || null,
                  notes: input.notes?.trim() || null,
                  handedOverByResidentId: Number(access.residentId),
                  status: "draft",
            } as any;

            return current
                  ? storeDb.updateStoreShiftHandover(Number(current.id), payload)
                  : storeDb.createStoreShiftHandover(payload);
      },

      async giverSign(input: {
            user: any;
            accessToken: string;
            storeShiftId: number;
      }) {
            const { access, shift } = await getAuthorizedResident(input);
            if (shift.shiftType !== "morning") throw new Error("Chỉ ca sáng được ký giao.");

            const handover = await storeDb.getLatestStoreShiftHandover(Number(shift.id));
            if (!handover) throw new Error("Chưa lập biên bản bàn giao.");
            if (handover.status !== "draft") {
                  throw new Error("Bàn giao đã được ký hoặc hoàn tất.");
            }
            if (Number(handover.handedOverByResidentId) !== Number(access.residentId)) {
                  throw new Error("Chỉ người lập bàn giao được ký giao.");
            }

            const now = new Date();
            await storeDb.updateStoreShiftHandover(Number(handover.id), {
                  giverSignedAt: now,
                  handedOverAt: now,
                  status: "giver_signed",
            } as any);
            await storeDb.updateStoreShift(Number(shift.id), {
                  status: "handover_pending",
            } as any);
            return storeDb.getLatestStoreShiftHandover(Number(shift.id));
      },

      async receiverSign(input: {
            user: any;
            accessToken: string;
            storeShiftId: number;
      }) {
            const { access, shift } = await getAuthorizedResident(input);
            if (shift.shiftType !== "afternoon") throw new Error("Chỉ ca chiều được ký nhận.");

            const handover = await storeDb.getStoreShiftHandoverToShift(Number(shift.id));
            if (!handover) throw new Error("Chưa có bàn giao từ ca sáng.");
            if (handover.status !== "giver_signed") {
                  throw new Error("Bàn giao chưa được người giao ký hoặc đã hoàn tất.");
            }

            const now = new Date();
            await storeDb.updateStoreShiftHandover(Number(handover.id), {
                  receivedByResidentId: Number(access.residentId),
                  receiverSignedAt: now,
                  receivedAt: now,
                  status: "completed",
            } as any);
            await storeDb.updateStoreShift(Number(handover.storeShiftId), {
                  status: "handed_over",
                  handedOverAt: now,
                  countedClosingCash: handover.countedCash,
                  expectedClosingCash: handover.expectedCash,
                  cashDifference: handover.differenceAmount,
            } as any);
            await storeDb.updateStoreShift(Number(shift.id), {
                  openingCash: handover.countedCash,
                  status: ["scheduled", "access_issued", "opened"].includes(String(shift.status))
                        ? "in_progress"
                        : shift.status,
            } as any);
            return storeDb.getStoreShiftHandoverToShift(Number(shift.id));
      },

      async listForManager(input: {
            user: any;
            ledgerId?: number | null;
            shiftDate?: string | null;
            limit?: number;
      }) {
            const roles = new Set([
                  input.user?.role,
                  ...(Array.isArray(input.user?.roles) ? input.user.roles : []),
            ]);
            if (!roles.has("manager")) {
                  throw new Error("Bạn không có quyền xem danh sách bàn giao.");
            }
            return storeDb.listStoreShiftHandovers({
                  ledgerId: input.ledgerId,
                  shiftDate: input.shiftDate,
                  limit: input.limit,
            });
      },
};
