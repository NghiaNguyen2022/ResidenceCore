import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { isManager } from "../../_core/rbac";
import { storeLedgerService } from "../../services/storeLedgerService";

function requireStoreLedgerAccess(user: {
      id?: number;
      role?: string | null;
      roles?: string[] | null;
} | null | undefined) {
      if (!isManager(user)) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Bạn không có quyền quản lý sổ thu chi riêng." });
      }
}

function getUserId(ctx: any) {
      return Number(ctx?.user?.id ?? ctx?.session?.user?.id ?? ctx?.auth?.user?.id ?? ctx?.userId ?? 0) || null;
}

const ledgerTypeSchema = z.enum(["store", "fund", "other"]);
const directionSchema = z.enum(["in", "out"]);

export const storeLedgerRouter = router({
      listLedgers: protectedProcedure
            .input(z.object({ search: z.string().optional().nullable(), isActive: z.boolean().optional().nullable() }).optional())
            .query(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.listLedgers(input || { isActive: true });
            }),

      createLedger: protectedProcedure
            .input(
                  z.object({
                        ledgerCode: z.string().trim().min(1),
                        ledgerName: z.string().trim().min(1),
                        ledgerType: ledgerTypeSchema.default("store"),
                        openingBalance: z.number().min(0).optional().nullable(),
                        description: z.string().optional().nullable(),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.createLedger({ ...input, createdBy: getUserId(ctx) });
            }),

      updateLedger: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                        ledgerName: z.string().trim().min(1).optional(),
                        ledgerType: ledgerTypeSchema.optional(),
                        openingBalance: z.number().min(0).optional().nullable(),
                        description: z.string().optional().nullable(),
                        isActive: z.boolean().optional(),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  const { id, ...data } = input;
                  return storeLedgerService.updateLedger(id, data);
            }),

      getSummary: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive().optional().nullable(),
                        fromDate: z.string().optional().nullable(),
                        toDate: z.string().optional().nullable(),
                  }).optional(),
            )
            .query(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.getSummary(input || {});
            }),

      listTransactions: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive().optional().nullable(),
                        direction: z.union([directionSchema, z.literal("all")]).optional().nullable(),
                        fromDate: z.string().optional().nullable(),
                        toDate: z.string().optional().nullable(),
                        search: z.string().optional().nullable(),
                        limit: z.number().int().min(1).max(300).optional(),
                        offset: z.number().int().min(0).optional(),
                  }).optional(),
            )
            .query(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.listTransactions(input || {});
            }),

      createTransaction: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive(),
                        direction: directionSchema,
                        transactionDate: z.string().trim().min(1),
                        amount: z.number().positive(),
                        category: z.string().optional().nullable(),
                        title: z.string().trim().min(1),
                        partnerName: z.string().optional().nullable(),
                        paymentMethod: z.string().optional().nullable(),
                        description: z.string().optional().nullable(),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.createTransaction({ ...input, createdBy: getUserId(ctx) });
            }),

      cancelTransaction: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.cancelTransaction(input.id);
            }),

      deleteTransaction: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.deleteTransaction(input.id);
            }),
});
