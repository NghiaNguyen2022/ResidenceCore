import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { residentPortalService } from "../../services/residentPortalService";

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