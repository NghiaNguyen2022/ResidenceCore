import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import * as dutyDb from "../db/duty";
import * as storeDb from "../db/storeLedger";
import { getDb } from "../db";
import { notifications, residents } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const ACCESS_CODE_LENGTH = 6;

const STORE_IDLE_TIMEOUT_MINUTES = 30;

function addMinutes(value: Date, minutes: number) {
      return new Date(value.getTime() + minutes * 60_000);
}

function minDate(left: Date, right: Date) {
      return left.getTime() <= right.getTime() ? left : right;
}

function isResidentUser(user: any) {
      return user?.role === "resident" || user?.roles?.includes?.("resident");
}


function getSecret() {
      const secret =
            process.env.STORE_ACCESS_SECRET ||
            process.env.JWT_SECRET ||
            process.env.SESSION_SECRET;

      if (!secret) {
            throw new Error(
                  "Thiếu STORE_ACCESS_SECRET hoặc JWT_SECRET để bảo vệ mã truy cập Cửa hàng."
            );
      }

      return secret;
}

function hashValue(value: string) {
      return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function safeHashEquals(left: string, right: string) {
      const leftBuffer = Buffer.from(left, "hex");
      const rightBuffer = Buffer.from(right, "hex");

      return (
            leftBuffer.length === rightBuffer.length &&
            timingSafeEqual(leftBuffer, rightBuffer)
      );
}

function generateAccessCode() {
      const minimum = 10 ** (ACCESS_CODE_LENGTH - 1);
      const maximum = 10 ** ACCESS_CODE_LENGTH;
      return String(randomInt(minimum, maximum));
}

function generateAccessToken() {
      return randomBytes(32).toString("hex");
}

function asDate(value: Date | string | null | undefined) {
      if (!value) return null;
      const date = value instanceof Date ? value : new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * storeShifts.accessValidFrom/accessValidUntil là TIMESTAMP.
 * MySQL/Drizzle đã trả về đúng thời điểm UTC, ví dụ:
 * 00:00Z = 07:00 Asia/Ho_Chi_Minh.
 * Không được trừ thêm 7 giờ lần nữa.
 */
function isWithinAccessWindow(shift: any, now = new Date()) {
      const validFrom = asDate(shift?.accessValidFrom);
      const validUntil = asDate(shift?.accessValidUntil);

      return Boolean(
            validFrom &&
                  validUntil &&
                  now.getTime() >= validFrom.getTime() &&
                  now.getTime() <= validUntil.getTime()
      );
}

async function getResidentOrThrow(userId: number) {
      const resident = await dutyDb.getResidentByUserId(userId);

      if (!resident?.id) {
            throw new Error("Không tìm thấy hồ sơ học viên.");
      }

      if (["inactive", "transferred_out", "left"].includes(String(resident.status || ""))) {
            throw new Error("Học viên đã ngừng hoặc rời lưu xá.");
      }

      return resident;
}


async function createStoreAccessNotification(input: {
      residentId: number;
      storeShiftId: number;
      storeDutyAssignmentId: number;
      ledgerName: string;
      shiftType: string;
      accessCode: string;
      validFrom: Date | string | null;
      validUntil: Date | string | null;
}) {
      const db = await getDb();
      if (!db) {
            throw new Error("Không thể kết nối cơ sở dữ liệu để gửi thông báo.");
      }

      const residentRows = await db
            .select({
                  id: residents.id,
                  fullName: residents.fullName,
                  userId: residents.userId,
                  status: residents.status,
            })
            .from(residents)
            .where(eq(residents.id, input.residentId))
            .limit(1);

      const resident = residentRows[0];
      if (!resident?.id) {
            throw new Error("Không tìm thấy học viên để gửi mã Cửa hàng.");
      }

      if (["inactive", "transferred_out", "left"].includes(String(resident.status || ""))) {
            throw new Error("Học viên đã ngừng hoặc rời lưu xá.");
      }

      const recipientUserId = Number(resident.userId || 0);
      if (!recipientUserId) {
            throw new Error(
                  `Học viên ${resident.fullName || `#${input.residentId}`} chưa có tài khoản portal. ` +
                  "Vui lòng tạo hoặc liên kết tài khoản học viên trước khi gửi mã.",
            );
      }

      const shiftLabel =
            input.shiftType === "morning" ? "ca sáng" : "ca chiều";
      const now = new Date();

      const result: any = await db.insert(notifications).values({
            type: "system" as any,
            title: "Mã vào Cửa hàng",
            content:
                  `${input.ledgerName} · ${shiftLabel}. ` +
                  `Mã truy cập của bạn là ${input.accessCode}. ` +
                  "Vào mục Công tác, chọn Vào cửa hàng và nhập mã này. " +
                  "Mã chỉ dùng trong thời gian ca trực; quyền Cửa hàng hết sau 30 phút không hoạt động.",
            recipientId: recipientUserId,
            relatedEntityId: input.storeShiftId,
            relatedEntityType: "store_shift_access",
            isRead: false,
            sentAt: now,
            createdAt: now,
      });

      const notificationId = Number(
            result?.[0]?.insertId ||
            result?.insertId ||
            0,
      );

      if (!notificationId) {
            const insertedRows = await db
                  .select({ id: notifications.id })
                  .from(notifications)
                  .where(eq(notifications.recipientId, recipientUserId))
                  .orderBy(notifications.id)
                  .limit(1);

            if (!insertedRows[0]?.id) {
                  throw new Error("Không thể tạo thông báo mã Cửa hàng cho học viên.");
            }
      }

      console.log("[STORE ACCESS] Notification sent", {
            residentId: input.residentId,
            recipientUserId,
            storeShiftId: input.storeShiftId,
            notificationId: notificationId || "created",
      });

      return {
            recipientUserId,
            notificationId: notificationId || null,
      };
}

export const storeDutyAccessService = {
      async getMyCurrentShift(userId: number) {
            const resident = await getResidentOrThrow(userId);
            const candidates = await storeDb.listStoreShiftCandidatesForResident(resident.id);
            const now = new Date();

            const shift =
                  candidates.find((item: any) => isWithinAccessWindow(item, now)) ||
                  candidates[0] ||
                  null;

            if (!shift) {
                  return {
                        hasShift: false,
                        canEnter: false,
                        shift: null,
                        message: "Hiện không có ca trực Cửa hàng được phân công.",
                  };
            }

            const accessSession = await storeDb.getLatestStoreDutyAccessSession({
                  storeShiftId: Number(shift.storeShiftId),
                  residentId: resident.id,
            });

            const canEnter =
                  isWithinAccessWindow(shift, now) &&
                  !["cancelled", "closed", "confirmed", "expired"].includes(
                        String(shift.shiftStatus || "")
                  );

            return {
                  hasShift: true,
                  canEnter,
                  shift: {
                        id: Number(shift.storeShiftId),
                        storeDutyAssignmentId: Number(shift.storeDutyAssignmentId),
                        ledgerId: Number(shift.ledgerId),
                        ledgerName: shift.ledgerName,
                        shiftDate: shift.shiftDate,
                        shiftType: shift.shiftType,
                        scheduledFrom: shift.scheduledFrom,
                        scheduledTo: shift.scheduledTo,
                        accessValidFrom: shift.accessValidFrom,
                        accessValidUntil: shift.accessValidUntil,
                        status: shift.shiftStatus,
                        memberRole: shift.memberRole,
                  },
                  accessStatus: accessSession?.status || null,
                  message: canEnter
                        ? accessSession?.status === "pending"
                              ? "Mã vào Cửa hàng đã được gửi qua Thông báo. Hãy vào Thông báo để xem."
                              : "Ca trực đang trong thời gian cho phép truy cập."
                        : "Chưa đến giờ hoặc ca trực đã kết thúc.",
            };
      },

      async issueAccessCode(input: {
            storeShiftId: number;
            residentId: number;
            issuedBy: number | null;
      }) {
            const shift = await storeDb.getStoreShiftById(input.storeShiftId);
            if (!shift) throw new Error("Không tìm thấy ca trực Cửa hàng.");

            const member = await storeDb.getStoreDutyMember({
                  storeDutyAssignmentId: Number(shift.storeDutyAssignmentId),
                  residentId: input.residentId,
            });
            if (!member || member.status === "cancelled") {
                  throw new Error("Học viên không thuộc ca trực này.");
            }

            const code = generateAccessCode();

            await storeDb.revokeStoreDutyAccessSessions({
                  storeShiftId: input.storeShiftId,
                  residentId: input.residentId,
            });

            await storeDb.createStoreDutyAccessSession({
                  storeShiftId: input.storeShiftId,
                  storeDutyAssignmentId: Number(shift.storeDutyAssignmentId),
                  residentId: input.residentId,
                  accessCodeHash: hashValue(code),
                  accessTokenHash: null,
                  portalSessionId: null,
                  validFrom: shift.accessValidFrom,
                  validUntil: shift.accessValidUntil,
                  status: "pending",

                  // Không ghi trực tiếp ctx.user.id vào khóa ngoại issuedBy.
                  // Một số phiên quản lý cũ/seed có id không còn tồn tại trong users,
                  // làm toàn bộ thao tác phát hành mã thất bại trước khi tạo thông báo.
                  // Người thao tác vẫn được kiểm soát ở router bằng quyền manager.
                  issuedBy: null,
            } as any);

            await storeDb.updateStoreShift(input.storeShiftId, {
                  status: "access_issued",
            } as any);

            const ledger = await storeDb.getStoreLedgerById(Number(shift.ledgerId));
            const ledgerName = String(
                  (ledger as any)?.ledgerName ||
                  (ledger as any)?.name ||
                  "Cửa hàng lưu xá",
            );

            try {
                  const notification = await createStoreAccessNotification({
                        residentId: input.residentId,
                        storeShiftId: input.storeShiftId,
                        storeDutyAssignmentId: Number(shift.storeDutyAssignmentId),
                        ledgerName,
                        shiftType: String(shift.shiftType || ""),
                        accessCode: code,
                        validFrom: shift.accessValidFrom,
                        validUntil: shift.accessValidUntil,
                  });

                  return {
                        success: true,
                        accessCode: code,
                        validFrom: shift.accessValidFrom,
                        validUntil: shift.accessValidUntil,
                        notificationSent: true,
                        recipientUserId: notification.recipientUserId,
                        notificationId: notification.notificationId,
                        message:
                              "Đã gửi mã vào Cửa hàng qua Thông báo của học viên.",
                  };
            } catch (error) {
                  // Không để tồn tại mã hợp lệ khi thông báo chưa gửi được.
                  await storeDb.revokeStoreDutyAccessSessions({
                        storeShiftId: input.storeShiftId,
                        residentId: input.residentId,
                  });

                  await storeDb.updateStoreShift(input.storeShiftId, {
                        status: "scheduled",
                  } as any);

                  throw error;
            }
      },

      async issueAccessCodeByDutyAssignment(input: {
            dutyAssignmentId: number;
            residentId: number;
            issuedBy: number | null;
      }) {
            const storeDutyAssignment =
                  await storeDb.getStoreDutyAssignmentByDutyAssignmentId(
                        input.dutyAssignmentId,
                  );

            if (!storeDutyAssignment?.id) {
                  throw new Error(
                        "Phân công này chưa được liên kết với ca trực Cửa hàng.",
                  );
            }

            const shift = await storeDb.getStoreShiftByAssignmentId(
                  Number(storeDutyAssignment.id),
            );

            if (!shift?.id) {
                  throw new Error("Không tìm thấy ca trực Cửa hàng tương ứng.");
            }

            return this.issueAccessCode({
                  storeShiftId: Number(shift.id),
                  residentId: input.residentId,
                  issuedBy: input.issuedBy,
            });
      },

      async verifyMyAccessCode(input: {
            userId: number;
            storeShiftId: number;
            accessCode: string;
            portalSessionId?: string | null;
      }) {
            const resident = await getResidentOrThrow(input.userId);
            const shift = await storeDb.getStoreShiftById(input.storeShiftId);

            if (!shift) throw new Error("Không tìm thấy ca trực Cửa hàng.");
            if (!isWithinAccessWindow(shift)) {
                  throw new Error("Mã chỉ được sử dụng trong thời gian ca trực.");
            }

            const member = await storeDb.getStoreDutyMember({
                  storeDutyAssignmentId: Number(shift.storeDutyAssignmentId),
                  residentId: resident.id,
            });
            if (!member || member.status === "cancelled") {
                  throw new Error("Bạn không được phân công vào ca trực này.");
            }

            const session = await storeDb.getLatestPendingStoreDutyAccessSession({
                  storeShiftId: input.storeShiftId,
                  residentId: resident.id,
            });
            if (!session) {
                  throw new Error("Chưa có mã truy cập hợp lệ. Vui lòng liên hệ quản lý.");
            }

            const submittedHash = hashValue(input.accessCode.trim());
            if (!safeHashEquals(submittedHash, String(session.accessCodeHash || ""))) {
                  throw new Error("Mã truy cập không đúng.");
            }

            const accessToken = generateAccessToken();
            const verifiedAt = new Date();

            await storeDb.updateStoreDutyAccessSession(session.id, {
                  accessTokenHash: hashValue(accessToken),
                  portalSessionId: input.portalSessionId || null,
                  verifiedAt,
                  lastStoreActivityAt: verifiedAt,
                  sessionExpiresAt: minDate(
                        addMinutes(verifiedAt, STORE_IDLE_TIMEOUT_MINUTES),
                        asDate(shift.accessValidUntil)!,
                  ),
                  status: "active",
            } as any);

            await storeDb.updateStoreShift(input.storeShiftId, {
                  status:
                        shift.status === "scheduled" || shift.status === "access_issued"
                              ? "opened"
                              : shift.status,
                  openedAt: shift.openedAt || verifiedAt,
            } as any);

            return {
                  success: true,
                  accessToken,
                  storeShiftId: input.storeShiftId,
                  ledgerId: Number(shift.ledgerId),
                  validUntil: shift.accessValidUntil,
                  message: "Đã mở quyền Cửa hàng cho ca trực hiện tại.",
            };
      },

      async authorizeStoreAction(input: {
            user: any;
            accessToken?: string | null;
            storeShiftId?: number | null;
            ledgerId?: number | null;
            touchActivity?: boolean;
      }) {
            if (!isResidentUser(input.user)) {
                  return {
                        accessMode: "manager" as const,
                        residentId: null,
                        storeShiftId: input.storeShiftId ?? null,
                        ledgerId: input.ledgerId ?? null,
                  };
            }

            const userId = Number(input.user?.id || 0);
            if (!userId) throw new Error("Phiên đăng nhập không hợp lệ.");

            const accessToken = String(input.accessToken || "").trim();
            const storeShiftId = Number(input.storeShiftId || 0);

            if (!accessToken || !storeShiftId) {
                  throw new Error("Quyền Cửa hàng đã hết hoặc chưa được mở.");
            }

            const resident = await getResidentOrThrow(userId);
            const session = await storeDb.getStoreDutyAccessSessionByTokenHash(
                  hashValue(accessToken),
            );

            if (
                  !session ||
                  Number(session.storeShiftId) !== storeShiftId ||
                  Number(session.residentId) !== Number(resident.id) ||
                  session.status !== "active"
            ) {
                  throw new Error("Phiên quyền Cửa hàng không hợp lệ.");
            }

            const shift = await storeDb.getStoreShiftById(storeShiftId);
            if (!shift) throw new Error("Không tìm thấy ca trực Cửa hàng.");

            const now = new Date();
            const shiftEnd = asDate(shift.accessValidUntil);
            const sessionExpiresAt = asDate(session.sessionExpiresAt);
            const lastActivityAt =
                  asDate(session.lastStoreActivityAt) ||
                  asDate(session.verifiedAt);

            const idleExpired =
                  !lastActivityAt ||
                  now.getTime() >
                        addMinutes(
                              lastActivityAt,
                              STORE_IDLE_TIMEOUT_MINUTES,
                        ).getTime();

            const sessionExpired =
                  !sessionExpiresAt ||
                  now.getTime() > sessionExpiresAt.getTime();

            const shiftExpired =
                  !shiftEnd ||
                  now.getTime() > shiftEnd.getTime() ||
                  ["closed", "confirmed", "expired", "cancelled"].includes(
                        String(shift.status || ""),
                  );

            if (idleExpired || sessionExpired || shiftExpired) {
                  await storeDb.updateStoreDutyAccessSession(session.id, {
                        status: "expired",
                        sessionExpiresAt: now,
                  } as any);

                  throw new Error(
                        shiftExpired
                              ? "Ca trực đã kết thúc."
                              : "Quyền Cửa hàng đã hết sau 30 phút không hoạt động. Vui lòng nhập lại mã.",
                  );
            }

            if (
                  input.ledgerId &&
                  Number(input.ledgerId) !== Number(shift.ledgerId)
            ) {
                  throw new Error("Phiên quyền không thuộc cửa hàng đã chọn.");
            }

            if (input.touchActivity !== false) {
                  const nextExpiry = minDate(
                        addMinutes(now, STORE_IDLE_TIMEOUT_MINUTES),
                        shiftEnd,
                  );

                  await storeDb.updateStoreDutyAccessSession(session.id, {
                        lastStoreActivityAt: now,
                        sessionExpiresAt: nextExpiry,
                  } as any);
            }

            return {
                  accessMode: "resident" as const,
                  residentId: resident.id,
                  storeShiftId,
                  storeDutyAssignmentId: Number(
                        shift.storeDutyAssignmentId,
                  ),
                  ledgerId: Number(shift.ledgerId),
                  memberRole: (
                        await storeDb.getStoreDutyMember({
                              storeDutyAssignmentId: Number(
                                    shift.storeDutyAssignmentId,
                              ),
                              residentId: resident.id,
                        })
                  )?.memberRole,
                  shiftType: shift.shiftType,
                  validUntil: shift.accessValidUntil,
            };
      },

      async getMyActiveAccessSession(input: {
            userId: number;
            accessToken: string;
            storeShiftId: number;
      }) {
            const resident = await getResidentOrThrow(input.userId);
            const session = await storeDb.getStoreDutyAccessSessionByTokenHash(
                  hashValue(input.accessToken),
            );

            if (
                  !session ||
                  Number(session.storeShiftId) !== input.storeShiftId ||
                  Number(session.residentId) !== Number(resident.id)
            ) {
                  return { active: false, reason: "invalid" };
            }

            try {
                  const access = await this.authorizeStoreAction({
                        user: { id: input.userId, role: "resident" },
                        accessToken: input.accessToken,
                        storeShiftId: input.storeShiftId,
                        touchActivity: false,
                  });

                  return {
                        active: true,
                        access,
                        expiresAt: session.sessionExpiresAt,
                  };
            } catch (error: any) {
                  return {
                        active: false,
                        reason: error?.message || "expired",
                  };
            }

      },
};
