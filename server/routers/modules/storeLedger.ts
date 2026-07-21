import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { isManager } from "../../_core/rbac";
import { storeLedgerService } from "../../services/storeLedgerService";
import { storeDutyAccessService } from "../../services/storeDutyAccessService";
import { storeShiftHandoverService } from "../../services/storeShiftHandoverService";
import { storeShiftClosingService } from "../../services/storeShiftClosingService";

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

const residentStoreAccessSchema = {
      storeShiftId: z.number().int().positive().optional().nullable(),
      storeAccessToken: z.string().trim().min(20).optional().nullable(),
};

async function requireStoreOperationAccess(input: {
      ctx: any;
      storeShiftId?: number | null;
      storeAccessToken?: string | null;
      ledgerId?: number | null;
      touchActivity?: boolean;
}) {
      return storeDutyAccessService.authorizeStoreAction({
            user: input.ctx.user,
            storeShiftId: input.storeShiftId,
            accessToken: input.storeAccessToken,
            ledgerId: input.ledgerId,
            touchActivity: input.touchActivity,
      });
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
      imageUrl: z.string().trim().max(1000).optional().nullable(),
      imageData: z.string().max(900000).optional().nullable(),
});



export const storeLedgerRouter = router({
      getMyShiftHandover: protectedProcedure
            .input(
                  z.object({
                        storeShiftId: z.number().int().positive(),
                        storeAccessToken: z.string().trim().min(20),
                  }),
            )
            .query(async ({ ctx, input }) => {
                  return storeShiftHandoverService.getMyHandover({
                        user: ctx.user,
                        storeShiftId: input.storeShiftId,
                        accessToken: input.storeAccessToken,
                  });
            }),

      saveMyShiftHandover: protectedProcedure
            .input(
                  z.object({
                        storeShiftId: z.number().int().positive(),
                        storeAccessToken: z.string().trim().min(20),
                        countedCash: z.number().min(0),
                        differenceReason: z.string().trim().optional().nullable(),
                        notes: z.string().trim().optional().nullable(),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  return storeShiftHandoverService.saveMyHandover({
                        user: ctx.user,
                        ...input,
                  });
            }),

      signMyShiftHandover: protectedProcedure
            .input(
                  z.object({
                        storeShiftId: z.number().int().positive(),
                        storeAccessToken: z.string().trim().min(20),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  return storeShiftHandoverService.giverSign({
                        user: ctx.user,
                        ...input,
                  });
            }),

      receiveMyShiftHandover: protectedProcedure
            .input(
                  z.object({
                        storeShiftId: z.number().int().positive(),
                        storeAccessToken: z.string().trim().min(20),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  return storeShiftHandoverService.receiverSign({
                        user: ctx.user,
                        ...input,
                  });
            }),

      listShiftHandovers: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive().optional().nullable(),
                        shiftDate: z.string().optional().nullable(),
                        limit: z.number().int().min(1).max(200).optional(),
                  }).optional(),
            )
            .query(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeShiftHandoverService.listForManager({
                        user: ctx.user,
                        ...(input || {}),
                  });
            }),

      issueDutyAccessCodeByAssignment: protectedProcedure
            .input(
                  z.object({
                        dutyAssignmentId: z.number().int().positive(),
                        residentId: z.number().int().positive(),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeDutyAccessService.issueAccessCodeByDutyAssignment({
                        ...input,
                        issuedBy: getUserId(ctx),
                  });
            }),

      issueDutyAccessCode: protectedProcedure
            .input(
                  z.object({
                        storeShiftId: z.number().int().positive(),
                        residentId: z.number().int().positive(),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeDutyAccessService.issueAccessCode({
                        ...input,
                        issuedBy: getUserId(ctx),
                  });
            }),



      listDocuments: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive().optional().nullable(),
                        documentType: z.enum(["stock_in", "sale"]).optional().nullable(),
                        fromDate: z.string().optional().nullable(),
                        toDate: z.string().optional().nullable(),
                        search: z.string().optional().nullable(),
                        limit: z.number().int().min(1).max(300).optional(),
                        offset: z.number().int().min(0).optional(),
                        ...residentStoreAccessSchema,
                  }).optional(),
            )
            .query(async ({ ctx, input }) => {
                  await requireStoreOperationAccess({
                        ctx,
                        storeShiftId: input?.storeShiftId,
                        storeAccessToken: input?.storeAccessToken,
                        ledgerId: input?.ledgerId,
                  });
                  const { storeShiftId, storeAccessToken, ...queryInput } = input || {};
                  return storeLedgerService.listDocuments(queryInput);
            }),

      getDocument: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                        ...residentStoreAccessSchema,
                  }),
            )
            .query(async ({ ctx, input }) => {
                  await requireStoreOperationAccess({
                        ctx,
                        storeShiftId: input.storeShiftId,
                        storeAccessToken: input.storeAccessToken,
                  });
                  return storeLedgerService.getDocument(input.id);
            }),

      createStockInDocument: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive(),
                        stockInSource: stockInSourceSchema,
                        documentDate: z.string().trim().min(1),
                        partnerName: z.string().optional().nullable(),
                        paymentMethod: z.string().optional().nullable(),
                        notes: z.string().optional().nullable(),
                        lines: z.array(z.object({
                              productId: z.number().int().positive(),
                              quantity: z.number().positive(),
                              unitCost: z.number().positive(),
                              notes: z.string().optional().nullable(),
                        })).min(1),
                        ...residentStoreAccessSchema,
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  const access = await requireStoreOperationAccess({
                        ctx,
                        storeShiftId: input.storeShiftId,
                        storeAccessToken: input.storeAccessToken,
                        ledgerId: input.ledgerId,
                  });
                  const { storeShiftId, storeAccessToken, ...documentInput } = input;
                  return storeLedgerService.createStockInDocument({
                        ...documentInput,
                        createdBy: getUserId(ctx),
                        storeShiftId: access.storeShiftId,
                        storeDutyAssignmentId: access.storeDutyAssignmentId,
                        createdByResidentId: access.residentId,
                  } as any);
            }),

      createSaleDocument: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive(),
                        documentDate: z.string().trim().min(1),
                        partnerName: z.string().optional().nullable(),
                        paymentMethod: z.string().optional().nullable(),
                        notes: z.string().optional().nullable(),
                        lines: z.array(z.object({
                              productId: z.number().int().positive(),
                              quantity: z.number().positive(),
                              unitPrice: z.number().positive().optional().nullable(),
                              notes: z.string().optional().nullable(),
                        })).min(1),
                        ...residentStoreAccessSchema,
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  const access = await requireStoreOperationAccess({
                        ctx,
                        storeShiftId: input.storeShiftId,
                        storeAccessToken: input.storeAccessToken,
                        ledgerId: input.ledgerId,
                  });
                  const { storeShiftId, storeAccessToken, ...documentInput } = input;
                  return storeLedgerService.createSaleDocument({
                        ...documentInput,
                        createdBy: getUserId(ctx),
                        storeShiftId: access.storeShiftId,
                        storeDutyAssignmentId: access.storeDutyAssignmentId,
                        createdByResidentId: access.residentId,
                  } as any);
            }),

      listProducts: protectedProcedure
            .input(
                  z.object({
                        search: z.string().optional().nullable(),
                        category: z.string().optional().nullable(),
                        isActive: z.boolean().optional().nullable(),
                        lowStockOnly: z.boolean().optional().nullable(),
                        ...residentStoreAccessSchema,
                  }).optional(),
            )
            .query(async ({ ctx, input }) => {
                  await requireStoreOperationAccess({
                        ctx,
                        storeShiftId: input?.storeShiftId,
                        storeAccessToken: input?.storeAccessToken,
                  });
                  const { storeShiftId, storeAccessToken, ...queryInput } = input || {};
                  return storeLedgerService.listProducts(
                        Object.keys(queryInput).length ? queryInput : { isActive: true },
                  );
            }),

      listStockMovements: protectedProcedure
            .input(
                  z.object({
                        fromDate: z.string().optional().nullable(),
                        toDate: z.string().optional().nullable(),
                        movementTypes: z.array(z.enum(["purchase", "production_in", "self_supply_in", "other_in", "sale", "adjustment_in", "adjustment_out", "return"])).optional().nullable(),
                        limit: z.number().int().min(1).max(300).optional(),
                        offset: z.number().int().min(0).optional(),
                        ...residentStoreAccessSchema,
                  }).optional(),
            )
            .query(async ({ ctx, input }) => {
                  await requireStoreOperationAccess({
                        ctx,
                        storeShiftId: input?.storeShiftId,
                        storeAccessToken: input?.storeAccessToken,
                  });
                  const { storeShiftId, storeAccessToken, ...queryInput } = input || {};
                  return storeLedgerService.listStockMovements(queryInput);
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
            .input(
                  z.object({
                        search: z.string().optional().nullable(),
                        isActive: z.boolean().optional().nullable(),
                        ...residentStoreAccessSchema,
                  }).optional(),
            )
            .query(async ({ ctx, input }) => {
                  const access = await requireStoreOperationAccess({
                        ctx,
                        storeShiftId: input?.storeShiftId,
                        storeAccessToken: input?.storeAccessToken,
                        touchActivity: false,
                  });
                  const { storeShiftId, storeAccessToken, ...queryInput } = input || {};
                  const ledgers = await storeLedgerService.listLedgers(
                        Object.keys(queryInput).length ? queryInput : { isActive: true },
                  );
                  return access.accessMode === "resident"
                        ? ledgers.filter((item: any) => Number(item.id) === Number(access.ledgerId))
                        : ledgers;
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
                        ...residentStoreAccessSchema,
                  }).optional(),
            )
            .query(async ({ ctx, input }) => {
                  await requireStoreOperationAccess({
                        ctx,
                        storeShiftId: input?.storeShiftId,
                        storeAccessToken: input?.storeAccessToken,
                        ledgerId: input?.ledgerId,
                  });
                  const { storeShiftId, storeAccessToken, ...queryInput } = input || {};
                  return storeLedgerService.getSummary(queryInput);
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
                        ...residentStoreAccessSchema,
                  }).optional(),
            )
            .query(async ({ ctx, input }) => {
                  await requireStoreOperationAccess({
                        ctx,
                        storeShiftId: input?.storeShiftId,
                        storeAccessToken: input?.storeAccessToken,
                        ledgerId: input?.ledgerId,
                  });
                  const { storeShiftId, storeAccessToken, ...queryInput } = input || {};
                  return storeLedgerService.listTransactions(queryInput);
            }),



      listDailyClosings: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive().optional().nullable(),
                        fromDate: z.string().optional().nullable(),
                        toDate: z.string().optional().nullable(),
                        limit: z.number().int().min(1).max(120).optional(),
                        offset: z.number().int().min(0).optional(),
                        ...residentStoreAccessSchema,
                  }).optional(),
            )
            .query(async ({ ctx, input }) => {
                  await requireStoreOperationAccess({
                        ctx,
                        storeShiftId: input?.storeShiftId,
                        storeAccessToken: input?.storeAccessToken,
                        ledgerId: input?.ledgerId,
                  });
                  const { storeShiftId, storeAccessToken, ...queryInput } = input || {};
                  return storeLedgerService.listDailyClosings(queryInput);
            }),

      previewDailyClosing: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive(),
                        closingDate: z.string().trim().min(1),
                        ...residentStoreAccessSchema,
                  }),
            )
            .query(async ({ ctx, input }) => {
                  const access = await requireStoreOperationAccess({
                        ctx,
                        storeShiftId: input.storeShiftId,
                        storeAccessToken: input.storeAccessToken,
                        ledgerId: input.ledgerId,
                  });
                  if (access.accessMode === "resident" && access.shiftType !== "afternoon") {
                        throw new TRPCError({
                              code: "FORBIDDEN",
                              message: "Chỉ học viên trực ca chiều mới được xem trước chốt ngày.",
                        });
                  }
                  const { storeShiftId, storeAccessToken, ...queryInput } = input;
                  return storeLedgerService.previewDailyClosing(queryInput);
            }),

      closeDaily: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive(),
                        closingDate: z.string().trim().min(1),
                        notes: z.string().optional().nullable(),
                        ...residentStoreAccessSchema,
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  const access = await requireStoreOperationAccess({
                        ctx,
                        storeShiftId: input.storeShiftId,
                        storeAccessToken: input.storeAccessToken,
                        ledgerId: input.ledgerId,
                  });
                  if (access.accessMode === "resident" && access.shiftType !== "afternoon") {
                        throw new TRPCError({
                              code: "FORBIDDEN",
                              message: "Chỉ học viên trực ca chiều mới được chốt ngày.",
                        });
                  }
                  const { storeShiftId, storeAccessToken, ...closeInput } = input;
                  const closing = await storeLedgerService.closeDaily({
                        ...closeInput,
                        createdBy: getUserId(ctx),
                  });

                  if (access.accessMode === "resident") {
                        return storeShiftClosingService.afterResidentClose({
                              user: ctx.user,
                              storeShiftId: Number(storeShiftId),
                              accessToken: String(storeAccessToken),
                              closing,
                        });
                  }

                  return closing;
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
                  const closing = await storeLedgerService.reviewDailyClosing(input.id, getUserId(ctx));
                  return storeShiftClosingService.afterManagerReview(ctx.user, closing);
            }),

      confirmDailyClosing: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  const closing = await storeLedgerService.confirmDailyClosing(input.id, getUserId(ctx));
                  return storeShiftClosingService.afterManagerConfirm(ctx.user, closing);
            }),

      // Compatibility endpoint for older clients.
      approveDailyClosing: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.confirmDailyClosing(input.id, getUserId(ctx));
            }),

      reopenDailyClosing: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                        reason: z.string().trim().min(5),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeShiftClosingService.reopenDailyClosing({
                        user: ctx.user,
                        closingId: input.id,
                        reason: input.reason,
                  });
            }),

      checkOverdueStoreClosings: protectedProcedure
            .mutation(async ({ ctx }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeShiftClosingService.markOverdueClosings();
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

      createSaleStock: protectedProcedure
            .input(
                  z.object({
                        ledgerId: z.number().int().positive(),
                        productId: z.number().int().positive(),
                        transactionDate: z.string().trim().min(1),
                        quantity: z.number().positive(),
                        unitPrice: z.number().positive().optional().nullable(),
                        customerName: z.string().optional().nullable(),
                        paymentMethod: z.string().optional().nullable(),
                        description: z.string().optional().nullable(),
                  }),
            )
            .mutation(async ({ ctx, input }) => {
                  requireStoreLedgerAccess(ctx.user);
                  return storeLedgerService.createSaleStock({ ...input, createdBy: getUserId(ctx) });
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
