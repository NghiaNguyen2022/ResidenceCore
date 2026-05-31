import { getDb } from "../db";
import { notifications, debts, residents } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export type NotificationType = "fee_generated" | "debt_overdue" | "task_assigned" | "attendance_alert" | "system";

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  content: string;
  recipientId: number;
  relatedEntityId?: number;
  relatedEntityType?: string;
  metadata?: Record<string, any>;
}

/**
 * Send in-app notification to a resident or manager
 */
export async function sendNotification(payload: NotificationPayload): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.error("[Notification] Database not available");
    return null;
  }

  try {
    await db.insert(notifications).values({
      type: payload.type as any,
      title: payload.title,
      content: payload.content,
      recipientId: payload.recipientId,
      relatedEntityId: payload.relatedEntityId,
      relatedEntityType: payload.relatedEntityType,
      isRead: false,
      sentAt: new Date(),
      createdAt: new Date(),
    });

    console.log(`[Notification] Created notification: ${payload.type}`);
    return 1;
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
 * Send debt generated notification to resident
 */
export async function notifyDebtGenerated(residentId: number, amount: number, billingMonth: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const resident = await db.select().from(residents).where(eq(residents.id, residentId)).limit(1);
    const residentName = resident[0]?.fullName || `Cư dân #${residentId}`;

    await sendNotification({
      type: "fee_generated",
      title: "Phí tháng mới được tạo",
      content: `Phí cho tháng ${billingMonth} là ${Number(amount).toLocaleString("vi-VN")} đ. Vui lòng thanh toán đúng hạn.`,
      recipientId: residentId,
      relatedEntityId: residentId,
      relatedEntityType: "resident",
      metadata: { amount, billingMonth },
    });

    // Also notify owner
    await notifyOwnerAboutEvent(
      "Tạo công nợ mới",
      `Đã tạo công nợ cho ${residentName} - Tháng ${billingMonth}: ${Number(amount).toLocaleString("vi-VN")} đ`
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
    const residentName = resident[0]?.fullName || `Cư dân #${debt[0].residentId}`;

    await sendNotification({
      type: "debt_overdue",
      title: "Công nợ đã quá hạn",
      content: `Công nợ tháng ${debt[0].billingMonth} là ${Number(debt[0].amount).toLocaleString("vi-VN")} đ đã quá hạn thanh toán. Vui lòng thanh toán sớm.`,
      recipientId: debt[0].residentId,
      relatedEntityId: debtId,
      relatedEntityType: "debt",
      metadata: { amount: debt[0].amount, billingMonth: debt[0].billingMonth },
    });

    // Also notify owner
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
    const residentName = resident[0]?.fullName || `Cư dân #${residentId}`;

    await sendNotification({
      type: "system",
      title: "Thanh toán được ghi nhận",
      content: `Chúng tôi đã ghi nhận thanh toán ${Number(amount).toLocaleString("vi-VN")} đ từ bạn.`,
      recipientId: residentId,
      relatedEntityId: debtId,
      relatedEntityType: "debt",
      metadata: { amount },
    });

    // Also notify owner
    await notifyOwnerAboutEvent(
      "Thanh toán được ghi nhận",
      `${residentName} đã thanh toán ${Number(amount).toLocaleString("vi-VN")} đ`
    );
  } catch (error) {
    console.error("[Notification] Failed to notify payment received:", error);
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error("[Notification] Failed to mark notification as read:", error);
  }
}

/**
 * Get unread notifications for a recipient
 */
export async function getUnreadNotifications(recipientId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.recipientId, recipientId), eq(notifications.isRead, false)))
      .orderBy(notifications.createdAt);

    return result;
  } catch (error) {
    console.error("[Notification] Failed to get unread notifications:", error);
    return [];
  }
}
