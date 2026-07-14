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
const stockInSourceSchema = z.enum(["purchase", "production", "self_supply", "other"]);
const productSourceTypeSchema = z.enum(["purchase", "processed", "both"]);
const costingMethodSchema = z.enum(["weighted_average", "latest", "manual"]);
const salePriceReasonSchema = z.enum(["cost_increase", "overhead_increase", "market_adjustment", "promotion", "manual", "other"]);

const productInputSchema = z.object({
      productCode: z.string().trim().min(1),
      productName: z.string().trim().min(1),
      category: z.string().optional().nullable(),
      unit: z.string().optional().nullable(),
      defaultCostPrice: z.number().min(0).optional().nullable(),
      defaultSalePrice: z.number().min(0).optional().nullable(),
      sourceType: productSourceTypeSchema.optional().nullable(),
      costingMethod: costingMethodSchema.optional().nullable(),
      minStock: z.number().min(0).optional().nullable(),
      currentStock: z.number().min(0).optional().nullable(),
      description: z.string().optional().nullable(),
});



export const storeLedgerRouter = router({

      listProducts: protectedProcedure
            .input(
                  z.object({
                        search: z.string().optional().nullable(),
                        category: z.string().optional().nullable(),
                        isActive: z.boolean().optional().nullable(),
                        lowStockOnly: z.boolean().optional().nullable(),
                  }).optional(),
            )
            .query(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.listProducts(input || { isActive: true });
            }),

      listStockMovements: protectedProcedure
            .input(
                  z.object({
                        fromDate: z.string().optional().nullable(),
                        toDate: z.string().optional().nullable(),
                        movementTypes: z.array(z.enum(["purchase", "production_in", "self_supply_in", "other_in", "sale", "adjustment_in", "adjustment_out", "return"])).optional().nullable(),
                        limit: z.number().int().min(1).max(300).optional(),
                        offset: z.number().int().min(0).optional(),
                  }).optional(),
            )
            .query(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.listStockMovements(input || {});
            }),

      createProduct: protectedProcedure
            .input(productInputSchema)
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.createProduct({ ...input, createdBy: getUserId(ctx) });
            }),

      updateProduct: protectedProcedure
            .input(productInputSchema.partial().extend({ id: z.number().int().positive(), isActive: z.boolean().optional() }))
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  const { id, ...data } = input;
                  return storeLedgerService.updateProduct(id, data);
            }),

      deleteProduct: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.deleteProduct(input.id);
            }),

      listProductPriceHistory: protectedProcedure
            .input(z.object({ productId: z.number().int().positive() }))
            .query(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.listProductPriceHistory(input.productId);
            }),

      updateProductSalePrice: protectedProcedure
            .input(
                  z.object({
                        productId: z.number().int().positive(),
                        salePrice: z.number().min(0.01),
                        effectiveDate: z.string().trim().min(10),
                        reason: salePriceReasonSchema.optional().nullable(),
                        notes: z.string().optional().nullable(),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.updateProductSalePrice({ ...input, createdBy: getUserId(ctx) });
            }),

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



      listDailyClosings: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive().optional().nullable(),
                        fromDate: z.string().optional().nullable(),
                        toDate: z.string().optional().nullable(),
                        limit: z.number().int().min(1).max(120).optional(),
                        offset: z.number().int().min(0).optional(),
                  }).optional(),
            )
            .query(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.listDailyClosings(input || {});
            }),

      closeDaily: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive(),
                        closingDate: z.string().trim().min(1),
                        notes: z.string().optional().nullable(),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.closeDaily({ ...input, createdBy: getUserId(ctx) });
            }),


      getDailyClosingDetail: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .query(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.getDailyClosingDetail(input.id);
            }),

      reviewDailyClosing: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.reviewDailyClosing(input.id, getUserId(ctx));
            }),

      approveDailyClosing: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.approveDailyClosing(input.id, getUserId(ctx));
            }),

      cancelDailyClosing: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.cancelDailyClosing(input.id);
            }),

      createStockIn: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive(),
                        productId: z.number().int().positive(),
                        stockInSource: stockInSourceSchema,
                        transactionDate: z.string().trim().min(1),
                        quantity: z.number().positive(),
                        unitCost: z.number().positive(),
                        sourceName: z.string().optional().nullable(),
                        description: z.string().optional().nullable(),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.createStockIn({ ...input, createdBy: getUserId(ctx) });
            }),

      createPurchaseStock: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive(),
                        productId: z.number().int().positive(),
                        transactionDate: z.string().trim().min(1),
                        quantity: z.number().positive(),
                        unitCost: z.number().positive(),
                        supplierName: z.string().optional().nullable(),
                        description: z.string().optional().nullable(),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.createPurchaseStock({ ...input, createdBy: getUserId(ctx) });
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
