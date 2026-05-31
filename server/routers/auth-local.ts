import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { loginUser, registerUser, logoutUser } from "../services/authService";
import { TRPCError } from "@trpc/server";
import { sdk } from "../_core/sdk";

export const authLocalRouter = router({
  /**
   * Register new user
   */
  register: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(64),
        password: z.string().min(6),
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await registerUser(
          input.username,
          input.password,
          input.name,
          input.email,
          "user"
        );

        return {
          success: true,
          message: "User registered successfully",
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Registration failed";
        throw new TRPCError({
          code: "BAD_REQUEST",
          message,
        });
      }
    }),

  /**
   * Login user
   */
  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await loginUser(input.username, input.password);

        // Create session token using SDK
        const sessionToken = await sdk.createSessionToken(
          result.user.id,
          result.user.username,
          { name: result.user.name }
        );

        // Set session token in cookie (name must match SDK's COOKIE_NAME)
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax" as const,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        ctx.res.setHeader(
          "Set-Cookie",
          `session_token=${sessionToken}; Path=/; ${
            cookieOptions.httpOnly ? "HttpOnly; " : ""
          }${cookieOptions.secure ? "Secure; " : ""}SameSite=${cookieOptions.sameSite}; Max-Age=${cookieOptions.maxAge}`
        );

        return {
          success: true,
          user: result.user,
          token: sessionToken,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message,
        });
      }
    }),

  /**
   * Get current user
   */
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  /**
   * Logout user
   */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Clear session cookie
      ctx.res.setHeader(
        "Set-Cookie",
        "session_token=; Path=/; HttpOnly; SameSite=lax; Max-Age=0"
      );

      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Logout failed",
      });
    }
  }),
});