import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { residentPortalService } from "../../services/residentPortalService";
import { residentPortalAccessService } from "../../services/residentPortalAccessService";
import { storeDutyAccessService } from "../../services/storeDutyAccessService";
import {
      getUnreadNotificationCountForUser,
      listNotificationsForUser,
      markNotificationAsReadForUser,
} from "../../services/notificationService";

function getUserIdFromContext(ctx: any) {
      const userId =
            ctx?.user?.id ??
            ctx?.session?.user?.id ??
            ctx?.auth?.user?.id ??
            ctx?.userId;

      if (!userId) {
            throw new Error("Vui lòng đăng nhập để tiếp tục.");
      }

      return Number(userId);
}

export const residentPortalRouter = router({
      listMyStoreShiftOptions: protectedProcedure
            .input(
                  z
                        .object({
                              shiftDate: z
                                    .string()
                                    .regex(
                                          /^\d{4}-\d{2}-\d{2}$/,
                                    )
                                    .optional()
                                    .nullable(),
                        })
                        .optional(),
            )
            .query(async ({ ctx, input }) => {
                  const userId =
                        getUserIdFromContext(ctx);

                  return storeDutyAccessService.listMyAssignedShiftOptions(
                        userId,
                        input || {},
                  );
            }),

      openMyAssignedStoreShift: protectedProcedure
            .input(
                  z.object({
                        shiftDate: z
                              .string()
                              .regex(
                                    /^\d{4}-\d{2}-\d{2}$/,
                              ),
                        shiftType: z.enum([
                              "morning",
                              "afternoon",
                        ]),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  const userId =
                        getUserIdFromContext(ctx);

                  return storeDutyAccessService.openMyAssignedShift({
                        userId,
                        shiftDate: input.shiftDate,
                        shiftType: input.shiftType,
                  });
            }),

      getMyStoreDutyAccess: protectedProcedure.query(async ({ ctx }) => {
            const userId = getUserIdFromContext(ctx);
            return storeDutyAccessService.getMyCurrentShift(userId);
      }),

      verifyMyStoreAccessCode: protectedProcedure
            .input(
                  z.object({
                        storeShiftId: z.number().int().positive(),
                        accessCode: z.string().trim().length(6),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  const userId = getUserIdFromContext(ctx);
                  const portalSessionId =
                        ctx?.session?.id ??
                        ctx?.session?.sessionId ??
                        null;

                  return storeDutyAccessService.verifyMyAccessCode({
                        userId,
                        storeShiftId: input.storeShiftId,
                        accessCode: input.accessCode,
                        portalSessionId,
                  });
            }),

      getMyStoreAccessSession: protectedProcedure
            .input(
                  z.object({
                        storeShiftId: z.number().int().positive(),
                        accessToken: z.string().trim().min(20),
                  }),
            )
            .query(async ({ ctx, input }) => {
                  const userId = getUserIdFromContext(ctx);
                  return storeDutyAccessService.getMyActiveAccessSession({
                        userId,
                        storeShiftId: input.storeShiftId,
                        accessToken: input.accessToken,
                  });
            }),

      me: protectedProcedure.query(async ({ ctx }) => {
            const userId = getUserIdFromContext(ctx);
            return residentPortalService.me(userId);
      }),

      getMyAccessContext: protectedProcedure.query(async ({ ctx }) => {
            const userId = getUserIdFromContext(ctx);
            return residentPortalAccessService.getMyAccessContext(userId);
      }),

      getMyOrganizationScope: protectedProcedure.query(async ({ ctx }) => {
            const userId = getUserIdFromContext(ctx);
            return residentPortalAccessService.getMyOrganizationScope(userId);
      }),

      getMyDutyScope: protectedProcedure
            .input(
                  z
                        .object({
                              startDate: z.string().optional().nullable(),
                              endDate: z.string().optional().nullable(),
                        })
                        .optional()
            )
            .query(async ({ ctx, input }) => {
                  const userId = getUserIdFromContext(ctx);
                  return residentPortalAccessService.getMyDutyScope(userId, input || {});
            }),

      getTodayOverview: protectedProcedure.query(async ({ ctx }) => {
            const userId = getUserIdFromContext(ctx);
            return residentPortalAccessService.getTodayOverview(userId);
      }),

      completeTodayDuty: protectedProcedure
            .input(
                  z.object({
                        assignmentId: z.number().int().positive(),
                        notes: z.string().trim().optional().nullable(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  const userId = getUserIdFromContext(ctx);
                  return residentPortalAccessService.completeTodayDuty({
                        userId,
                        assignmentId: input.assignmentId,
                        notes: input.notes,
                  });
            }),


      getMyNotifications: protectedProcedure
            .input(
                  z
                        .object({
                              limit: z.number().int().min(1).max(100).optional(),
                              unreadOnly: z.boolean().optional().nullable(),
                        })
                        .optional()
            )
            .query(async ({ ctx, input }) => {
                  const userId = getUserIdFromContext(ctx);
                  return listNotificationsForUser(userId, input || {});
            }),

      getMyUnreadNotificationCount: protectedProcedure.query(async ({ ctx }) => {
            const userId = getUserIdFromContext(ctx);
            return getUnreadNotificationCountForUser(userId);
      }),

      markMyNotificationRead: protectedProcedure
            .input(
                  z.object({
                        notificationId: z.number().int().positive(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  const userId = getUserIdFromContext(ctx);
                  await markNotificationAsReadForUser(input.notificationId, userId);
                  return { success: true };
            }),


      getMyFinanceOverview: protectedProcedure.query(async ({ ctx }) => {
            const userId = getUserIdFromContext(ctx);
            return residentPortalService.getMyFinanceOverview(userId);
      }),

      createMyAdvanceExpenseEntry: protectedProcedure
            .input(
                  z.object({
                        advanceId: z.number().int().positive(),
                        amount: z.number().positive("Vui lòng nhập số tiền thực chi."),
                        transactionDate: z.string().optional().nullable(),
                        description: z.string().trim().min(1, "Vui lòng nhập nội dung chi thực tế."),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  const userId = getUserIdFromContext(ctx);
                  return residentPortalService.createMyAdvanceExpenseEntry({
                        userId,
                        advanceId: input.advanceId,
                        amount: input.amount,
                        transactionDate: input.transactionDate,
                        description: input.description,
                  });
            }),

      changePassword: protectedProcedure
            .input(
                  z.object({
                        currentPassword: z
                              .string()
                              .min(1, "Vui lòng nhập mật khẩu hiện tại."),
                        newPassword: z
                              .string()
                              .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
                        confirmPassword: z
                              .string()
                              .min(1, "Vui lòng xác nhận mật khẩu mới."),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  const userId = getUserIdFromContext(ctx);

                  return residentPortalService.changePassword({
                        userId,
                        currentPassword: input.currentPassword,
                        newPassword: input.newPassword,
                        confirmPassword: input.confirmPassword,
                  });
            }),
});
