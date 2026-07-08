import { getDb } from "../db";
import {
      notifications,
      debts,
      residents,
      dutyConfigs,
      organizationUnitMembers,
      organizationUnits,
      rooms,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export type NotificationType = "fee_generated" | "debt_overdue" | "task_assigned" | "attendance_alert" | "system";

export interface NotificationPayload {
      type: NotificationType;
      title: string;
      content: string;
      /**
       * notifications.recipientId references users.id.
       * For resident-facing notifications, resolve resident.userId before calling this helper.
       */
      recipientId: number;
      relatedEntityId?: number;
      relatedEntityType?: string;
      metadata?: Record<string, any>;
}

function toInt(value: unknown) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
}

function uniqueNumbers(values: Array<number | null | undefined>) {
      return Array.from(
            new Set(
                  values
                        .map((value) => toInt(value))
                        .filter((value): value is number => Boolean(value && value > 0))
            )
      );
}

function formatDateText(value: unknown) {
      if (!value) return "";
      const raw = value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
      const [year, month, day] = raw.split("-");
      if (!year || !month || !day) return String(value);
      return `${day}/${month}/${year}`;
}

function formatDateList(values?: unknown[]) {
      const items = Array.from(new Set((values || []).map(formatDateText).filter(Boolean)));
      if (items.length === 0) return "hôm nay";
      if (items.length === 1) return items[0];
      if (items.length <= 3) return items.join(", ");
      return `${items.slice(0, 3).join(", ")} và ${items.length - 3} ngày khác`;
}

/**
 * Send in-app notification to a user.
 */
export async function sendNotification(payload: NotificationPayload): Promise<number | null> {
      const db = await getDb();
      if (!db) {
            console.error("[Notification] Database not available");
            return null;
      }

      const recipientId = toInt(payload.recipientId);
      if (!recipientId) return null;

      try {
            const result: any = await db.insert(notifications).values({
                  type: payload.type as any,
                  title: payload.title,
                  content: payload.content,
                  recipientId,
                  relatedEntityId: payload.relatedEntityId,
                  relatedEntityType: payload.relatedEntityType,
                  isRead: false,
                  sentAt: new Date(),
                  createdAt: new Date(),
            });

            const insertId = Number(result?.[0]?.insertId || result?.insertId || 1);
            console.log(`[Notification] Created notification: ${payload.type}`);
            return insertId || 1;
      } catch (error) {
            console.error("[Notification] Failed to send notification:", error);
            return null;
      }
}

/**
 * Notify owner about system events
 */
export async function notifyOwnerAboutEvent(title: string, content: string): Promise<boolean> {
      try {
            await notifyOwner({ title, content });
            console.log(`[Notification] Owner notified: ${title}`);
            return true;
      } catch (error) {
            console.error("[Notification] Failed to notify owner:", error);
            return false;
      }
}

/**
 * Send debt generated notification to resident user.
 */
export async function notifyDebtGenerated(residentId: number, amount: number, billingMonth: string): Promise<void> {
      const db = await getDb();
      if (!db) return;

      try {
            const resident = await db.select().from(residents).where(eq(residents.id, residentId)).limit(1);
            const residentName = resident[0]?.fullName || `Học viên #${residentId}`;
            const recipientUserId = toInt(resident[0]?.userId);

            if (recipientUserId) {
                  await sendNotification({
                        type: "fee_generated",
                        title: "Khoản thu mới",
                        content: `Khoản thu tháng ${billingMonth} là ${Number(amount).toLocaleString("vi-VN")} đ. Vui lòng theo dõi trong Tài chính của tôi.`,
                        recipientId: recipientUserId,
                        relatedEntityId: residentId,
                        relatedEntityType: "resident_finance",
                        metadata: { amount, billingMonth, residentId },
                  });
            }

            await notifyOwnerAboutEvent(
                  "Tạo khoản thu mới",
                  `Đã tạo khoản thu cho ${residentName} - Tháng ${billingMonth}: ${Number(amount).toLocaleString("vi-VN")} đ`
            );
      } catch (error) {
            console.error("[Notification] Failed to notify debt generated:", error);
      }
}

/**
 * Send overdue debt notification
 */
export async function notifyOverdueDebt(debtId: number): Promise<void> {
      const db = await getDb();
      if (!db) return;

      try {
            const debt = await db.select().from(debts).where(eq(debts.id, debtId)).limit(1);
            if (!debt[0]) return;

            const resident = await db.select().from(residents).where(eq(residents.id, debt[0].residentId)).limit(1);
            const residentName = resident[0]?.fullName || `Học viên #${debt[0].residentId}`;
            const recipientUserId = toInt(resident[0]?.userId);

            if (recipientUserId) {
                  await sendNotification({
                        type: "debt_overdue",
                        title: "Khoản thu đã quá hạn",
                        content: `Khoản thu tháng ${debt[0].billingMonth} là ${Number(debt[0].amount).toLocaleString("vi-VN")} đ đã quá hạn thanh toán.`,
                        recipientId: recipientUserId,
                        relatedEntityId: debtId,
                        relatedEntityType: "debt",
                        metadata: { amount: debt[0].amount, billingMonth: debt[0].billingMonth },
                  });
            }

            await notifyOwnerAboutEvent(
                  "Công nợ quá hạn",
                  `${residentName} có công nợ quá hạn tháng ${debt[0].billingMonth}: ${Number(debt[0].amount).toLocaleString("vi-VN")} đ`
            );
      } catch (error) {
            console.error("[Notification] Failed to notify overdue debt:", error);
      }
}

/**
 * Send payment received notification
 */
export async function notifyPaymentReceived(residentId: number, amount: number, debtId: number): Promise<void> {
      const db = await getDb();
      if (!db) return;

      try {
            const resident = await db.select().from(residents).where(eq(residents.id, residentId)).limit(1);
            const residentName = resident[0]?.fullName || `Học viên #${residentId}`;
            const recipientUserId = toInt(resident[0]?.userId);

            if (recipientUserId) {
                  await sendNotification({
                        type: "system",
                        title: "Thanh toán được ghi nhận",
                        content: `Lưu xá đã ghi nhận thanh toán ${Number(amount).toLocaleString("vi-VN")} đ từ bạn.`,
                        recipientId: recipientUserId,
                        relatedEntityId: debtId,
                        relatedEntityType: "debt",
                        metadata: { amount },
                  });
            }

            await notifyOwnerAboutEvent(
                  "Thanh toán được ghi nhận",
                  `${residentName} đã thanh toán ${Number(amount).toLocaleString("vi-VN")} đ`
            );
      } catch (error) {
            console.error("[Notification] Failed to notify payment received:", error);
      }
}

type DutyAssigneeType = "resident" | "room" | "team" | "committee";

interface DutyRecipientScope {
      userIds: number[];
      label: string;
}

async function resolveDutyRecipients(assignedToType: DutyAssigneeType, assignedToId: number): Promise<DutyRecipientScope> {
      const db = await getDb();
      if (!db) return { userIds: [], label: "Phạm vi công tác" };

      if (assignedToType === "resident") {
            const rows = await db
                  .select({ userId: residents.userId, fullName: residents.fullName })
                  .from(residents)
                  .where(and(eq(residents.id, assignedToId), eq(residents.status, "active" as any)))
                  .limit(1);

            return {
                  userIds: uniqueNumbers([rows[0]?.userId]),
                  label: rows[0]?.fullName || "Cá nhân",
            };
      }

      if (assignedToType === "room") {
            const roomRows = await db
                  .select({ roomCode: rooms.roomCode })
                  .from(rooms)
                  .where(eq(rooms.id, assignedToId))
                  .limit(1);
            const residentRows = await db
                  .select({ userId: residents.userId })
                  .from(residents)
                  .where(and(eq(residents.currentRoomId, assignedToId), eq(residents.status, "active" as any)));

            return {
                  userIds: uniqueNumbers(residentRows.map((row) => row.userId)),
                  label: roomRows[0]?.roomCode ? `Phòng ${roomRows[0].roomCode}` : "Phòng hiện tại",
            };
      }

      const unitRows = await db
            .select({ name: organizationUnits.name })
            .from(organizationUnits)
            .where(eq(organizationUnits.id, assignedToId))
            .limit(1);

      const memberRows = await db
            .select({ userId: residents.userId })
            .from(organizationUnitMembers)
            .innerJoin(residents, eq(organizationUnitMembers.residentId, residents.id))
            .where(
                  and(
                        eq(organizationUnitMembers.unitId, assignedToId),
                        eq(organizationUnitMembers.status, "active" as any),
                        eq(residents.status, "active" as any)
                  )
            );

      const prefix = assignedToType === "team" ? "Tổ" : "Ban";
      return {
            userIds: uniqueNumbers(memberRows.map((row) => row.userId)),
            label: unitRows[0]?.name ? `${prefix}: ${unitRows[0].name}` : prefix,
      };
}

export async function notifyDutyAssigned(input: {
      dutyConfigId: number;
      assignedToType?: DutyAssigneeType | null;
      assignedToId?: number | null;
      assignedToIds?: number[] | null;
      assignedDates?: Array<string | Date> | null;
      notes?: string | null;
}): Promise<void> {
      const db = await getDb();
      if (!db) return;

      try {
            const dutyRows = await db
                  .select({ dutyName: dutyConfigs.dutyName })
                  .from(dutyConfigs)
                  .where(eq(dutyConfigs.id, input.dutyConfigId))
                  .limit(1);

            const dutyName = dutyRows[0]?.dutyName || "Công tác";
            const targetType = (input.assignedToType || "resident") as DutyAssigneeType;
            const targetIds = uniqueNumbers([input.assignedToId, ...(input.assignedToIds || [])]);
            const dateText = formatDateList(input.assignedDates || []);

            if (targetIds.length === 0) return;

            const sentUserIds = new Set<number>();

            for (const targetId of targetIds) {
                  const scope = await resolveDutyRecipients(targetType, targetId);
                  for (const userId of scope.userIds) {
                        if (sentUserIds.has(userId)) continue;
                        sentUserIds.add(userId);

                        await sendNotification({
                              type: "task_assigned",
                              title: "Bạn có công tác mới",
                              content: `${dutyName} được phân công cho ${scope.label}, ngày ${dateText}.${
                                    input.notes ? ` Ghi chú: ${input.notes}` : ""
                              }`,
                              recipientId: userId,
                              relatedEntityId: input.dutyConfigId,
                              relatedEntityType: "duty",
                              metadata: {
                                    dutyConfigId: input.dutyConfigId,
                                    assignedToType: targetType,
                                    assignedToId: targetId,
                                    assignedDates: input.assignedDates || [],
                              },
                        });
                  }
            }
      } catch (error) {
            // Notification should never block duty assignment.
            console.error("[Notification] Failed to notify duty assigned:", error);
      }
}

export async function listNotificationsForUser(
      userId: number,
      options?: { limit?: number; unreadOnly?: boolean | null }
): Promise<any[]> {
      const db = await getDb();
      if (!db) return [];

      const limit = Math.min(Math.max(Number(options?.limit || 30), 1), 100);
      const conditions = [eq(notifications.recipientId, userId)];

      if (options?.unreadOnly) {
            conditions.push(eq(notifications.isRead, false));
      }

      try {
            return await db
                  .select()
                  .from(notifications)
                  .where(and(...conditions))
                  .orderBy(desc(notifications.createdAt))
                  .limit(limit);
      } catch (error) {
            console.error("[Notification] Failed to list notifications:", error);
            return [];
      }
}

export async function getUnreadNotificationCountForUser(userId: number): Promise<number> {
      const items = await listNotificationsForUser(userId, { unreadOnly: true, limit: 100 });
      return items.length;
}

export async function markNotificationAsReadForUser(notificationId: number, userId: number): Promise<void> {
      const db = await getDb();
      if (!db) return;

      try {
            await db
                  .update(notifications)
                  .set({ isRead: true, readAt: new Date() })
                  .where(and(eq(notifications.id, notificationId), eq(notifications.recipientId, userId)));
      } catch (error) {
            console.error("[Notification] Failed to mark notification as read:", error);
      }
}

/**
 * Backward-compatible helper. Prefer markNotificationAsReadForUser when called from user-facing routes.
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
      const db = await getDb();
      if (!db) return;

      try {
            await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(eq(notifications.id, notificationId));
      } catch (error) {
            console.error("[Notification] Failed to mark notification as read:", error);
      }
}

/**
 * Get unread notifications for a user recipient.
 */
export async function getUnreadNotifications(recipientId: number): Promise<any[]> {
      return listNotificationsForUser(recipientId, { unreadOnly: true, limit: 100 });
}
