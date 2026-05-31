import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getUnreadNotifications, markNotificationAsRead } from "../services/notificationService";
import { getCronJobHistory, generateMonthlyDebts, checkOverdueDebts } from "../services/cronJobService";

export const notificationsRouter = router({
  /**
   * Get unread notifications for current user
   */
  getUnread: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    return await getUnreadNotifications(ctx.user.id);
  }),

  /**
   * Mark a notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      await markNotificationAsRead(input.notificationId);
      return { success: true };
    }),

  /**
   * Get cron job execution history (admin only)
   */
  getCronJobHistory: protectedProcedure
    .input(
      z.object({
        jobName: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      // Only allow managers/admins to view cron job history
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return await getCronJobHistory(input.jobName, input.limit);
    }),

  /**
   * Manually trigger monthly debt generation (admin only)
   */
  triggerMonthlyDebtGeneration: protectedProcedure.mutation(async ({ ctx }) => {
    // Only allow managers/admins to trigger cron jobs
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return await generateMonthlyDebts();
  }),

  /**
   * Manually trigger overdue debt check (admin only)
   */
  triggerOverdueDebtCheck: protectedProcedure.mutation(async ({ ctx }) => {
    // Only allow managers/admins to trigger cron jobs
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return await checkOverdueDebts();
  }),
});
