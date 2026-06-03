import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../../_core/cookies";
import { publicProcedure, protectedProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sdk } from "../../_core/sdk";
import { loginUser, registerUser, hashPassword } from "../../services/authService";
import * as db from "../../db";
import { userDb } from "../../db";

export const authRouter = router({
      me: publicProcedure.query((opts) => opts.ctx.user),

      login: publicProcedure
            .input(z.object({ username: z.string(), password: z.string() }))
            .mutation(async ({ input, ctx }) => {
                  try {
                        const result = await loginUser(input.username, input.password);

                        const sessionToken = await sdk.createSessionToken(
                              result.user.id,
                              result.user.username,
                              { name: result.user.name || "" }
                        );
                        const cookieOptions = getSessionCookieOptions(ctx.req);
                        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

                        return { user: result.user };
                  } catch (error) {
                        console.error("[auth.login] Error:", error);
                        throw new TRPCError({
                              code: "UNAUTHORIZED",
                              message: error instanceof Error ? error.message : "Username hoặc password không đúng",
                        });
                  }
            }),

      register: publicProcedure
            .input(
                  z.object({
                        username: z.string().min(3),
                        password: z.string().min(6),
                        name: z.string().optional(),
                        email: z.string().email().optional(),
                  })
            )
            .mutation(async ({ input, ctx }) => {
                  try {
                        await registerUser(input.username, input.password, input.name, input.email, "user");

                        const user = await db.getUserByUsername(input.username);
                        if (!user) {
                              throw new TRPCError({
                                    code: "INTERNAL_SERVER_ERROR",
                                    message: "Không thể tạo tài khoản",
                              });
                        }

                        const sessionToken = await sdk.createSessionToken(user.id, user.username, {
                              name: user.name || "",
                        });
                        const cookieOptions = getSessionCookieOptions(ctx.req);
                        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

                        return { user };
                  } catch (error) {
                        console.error("[auth.register] Error:", error);
                        if (error instanceof TRPCError) throw error;
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Không thể tạo tài khoản",
                        });
                  }
            }),

      logout: publicProcedure.mutation(({ ctx }) => {
            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
            return { success: true } as const;
      }),

      updateMyProfile: protectedProcedure
            .input(
                  z.object({
                        name: z.string().trim().min(1, "Vui lòng nhập họ tên."),
                        email: z.string().trim().email("Email không hợp lệ.").optional().nullable(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  if (!ctx.user?.id) {
                        throw new TRPCError({
                              code: "UNAUTHORIZED",
                              message: "Bạn cần đăng nhập để cập nhật thông tin.",
                        });
                  }

                  return userDb.updateMyProfile({
                        userId: ctx.user.id,
                        name: input.name,
                        email: input.email ?? null,
                  });
            }),
      changeMyPassword: protectedProcedure
            .input(
                  z.object({
                        newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
                        confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu."),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  if (!ctx.user?.id) {
                        throw new TRPCError({
                              code: "UNAUTHORIZED",
                              message: "Bạn cần đăng nhập để đổi mật khẩu.",
                        });
                  }

                  if (input.newPassword !== input.confirmPassword) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: "Mật khẩu xác nhận không khớp.",
                        });
                  }

                  const passwordHash = await hashPassword(input.newPassword);

                  return userDb.changeMyPassword({
                        userId: ctx.user.id,
                        passwordHash,
                  });
            }),
});
