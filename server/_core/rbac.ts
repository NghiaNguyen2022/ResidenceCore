import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./trpc";
import type { User } from "../../drizzle/schema";

/**
 * Role-Based Access Control (RBAC) Procedures
 * Enforce role checks at the procedure level, not just UI level
 */

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Chỉ quản trị viên mới có quyền truy cập",
    });
  }
  return next({ ctx });
});

export const managerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "manager" && ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Chỉ quản lý viên mới có quyền truy cập",
    });
  }
  return next({ ctx });
});

export const supervisorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["supervisor", "manager", "admin"].includes(ctx.user?.role || "")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Chỉ giám thị mới có quyền truy cập",
    });
  }
  return next({ ctx });
});

export const accountantProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["accountant", "manager", "admin"].includes(ctx.user?.role || "")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Chỉ kế toán mới có quyền truy cập",
    });
  }
  return next({ ctx });
});

export const residentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role === "user" || ctx.user?.role === "resident") {
    return next({ ctx });
  }
  // Staff members can also access resident procedures
  if (["supervisor", "manager", "accountant", "admin"].includes(ctx.user?.role || "")) {
    return next({ ctx });
  }
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "Bạn không có quyền truy cập",
  });
});
