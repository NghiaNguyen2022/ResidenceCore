import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { residentPortalService } from "../../services/residentPortalService";
import { residentPortalAccessService } from "../../services/residentPortalAccessService";

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
