import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../../_core/trpc';
import { isManager } from '../../_core/rbac';
import * as financeDb from '../../db/finance';
import { notifyDebtGenerated } from '../../services/notificationService';


function requireFinanceManagementAccess(user: {
      id?: number;
      role?: string | null;
      roles?: string[] | null;
} | null | undefined) {
      if (!isManager(user)) {
            throw new TRPCError({
                  code: 'FORBIDDEN',
                  message: 'Bạn không có quyền quản lý tài chính.',
            });
      }
}

const periodInputSchema = z.object({
      periodName: z.string().min(1),
      year: z.number().int().min(2000).max(2100),
      fromMonth: z.number().int().min(1).max(12),
      toMonth: z.number().int().min(1).max(12),
      lodgingAmount: z.number().min(0),
      mealLivingAmount: z.number().min(0),
      otherAmount: z.number().min(0),
      description: z.string().optional().nullable(),
});

export const financeRouter = router({
      summary: protectedProcedure.query(async ({ ctx }: any) => {
            requireFinanceManagementAccess(ctx.user);
            try {
                  return await financeDb.getFinanceSummary();
            } catch (error) {
                  console.error('[finance.summary] Error:', error);
                  throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Không thể tải tổng quan tài chính.',
                  });
            }
      }),

      listFeeTypes: protectedProcedure
            .input(z.object({ isActive: z.boolean().optional() }).optional())
            .query(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.listFinanceFeeTypes(input || {});
                  } catch (error) {
                        console.error('[finance.listFeeTypes] Error:', error);
                        throw new TRPCError({
                              code: 'INTERNAL_SERVER_ERROR',
                              message: 'Không thể tải loại khoản thu.',
                        });
                  }
            }),

      createFeeType: protectedProcedure
            .input(
                  z.object({
                        feeCode: z.string().min(1),
                        feeName: z.string().min(1),
                        defaultAmount: z.number().optional().nullable(),
                        cycle: z.string().optional().nullable(),
                        description: z.string().optional().nullable(),
                  }),
            )
            .mutation(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.createFinanceFeeType(input);
                  } catch (error) {
                        console.error('[finance.createFeeType] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: error instanceof Error ? error.message : 'Không thể tạo loại khoản thu.',
                        });
                  }
            }),

      listChargePeriods: protectedProcedure.query(async ({ ctx }: any) => {
            requireFinanceManagementAccess(ctx.user);
            try {
                  return await financeDb.listFinanceChargePeriods();
            } catch (error) {
                  console.error('[finance.listChargePeriods] Error:', error);
                  throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Không thể tải danh sách kỳ thu.',
                  });
            }
      }),

      getChargePeriodDetail: protectedProcedure
            .input(z.object({ periodId: z.number() }))
            .query(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.getFinanceChargePeriodDetail(input.periodId);
                  } catch (error) {
                        console.error('[finance.getChargePeriodDetail] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: error instanceof Error ? error.message : 'Không thể tải chi tiết kỳ thu.',
                        });
                  }
            }),

      createChargePeriod: protectedProcedure
            .input(periodInputSchema)
            .mutation(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.createFinanceChargePeriod({
                              ...input,
                              createdBy: ctx?.user?.id || null,
                        });
                  } catch (error) {
                        console.error('[finance.createChargePeriod] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: error instanceof Error ? error.message : 'Không thể tạo kỳ thu.',
                        });
                  }
            }),

      updateChargePeriod: protectedProcedure
            .input(periodInputSchema.extend({ id: z.number(), status: z.string().optional().nullable() }))
            .mutation(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.updateFinanceChargePeriod({
                              ...input,
                              createdBy: ctx?.user?.id || null,
                        });
                  } catch (error) {
                        console.error('[finance.updateChargePeriod] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: error instanceof Error ? error.message : 'Không thể cập nhật kỳ thu.',
                        });
                  }
            }),

      previewChargePeriodResidents: protectedProcedure
            .input(z.object({ periodId: z.number(), billingMonth: z.string().min(7) }))
            .query(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.previewFinanceChargePeriodResidents(input);
                  } catch (error) {
                        console.error('[finance.previewChargePeriodResidents] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: error instanceof Error ? error.message : 'Không thể tải danh sách học viên áp dụng.',
                        });
                  }
            }),

      applyChargePeriod: protectedProcedure
            .input(
                  z.object({
                        periodId: z.number(),
                        billingMonth: z.string().min(7),
                        lines: z.array(
                              z.object({
                                    residentId: z.number(),
                                    items: z.array(
                                          z.object({
                                                periodItemId: z.number(),
                                                selected: z.boolean(),
                                                amount: z.number().optional().nullable(),
                                          }),
                                    ),
                              }),
                        ),
                  }),
            )
            .mutation(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        const result = await financeDb.applyFinanceChargePeriod({
                              ...input,
                              createdBy: ctx?.user?.id || null,
                        });

                        for (const line of input.lines) {
                              const amount = line.items
                                    .filter((item: any) => item.selected)
                                    .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);

                              if (amount > 0) {
                                    await notifyDebtGenerated(line.residentId, amount, input.billingMonth);
                              }
                        }

                        return result;
                  } catch (error) {
                        console.error('[finance.applyChargePeriod] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: error instanceof Error ? error.message : 'Không thể áp dụng kỳ thu.',
                        });
                  }
            }),

      listCharges: protectedProcedure
            .input(
                  z
                        .object({
                              search: z.string().optional(),
                              status: z.string().optional(),
                              residentId: z.number().optional(),
                              periodId: z.number().optional(),
                              billingMonth: z.string().optional(),
                              limit: z.number().optional(),
                              offset: z.number().optional(),
                        })
                        .optional(),
            )
            .query(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.listFinanceCharges(input || {});
                  } catch (error) {
                        console.error('[finance.listCharges] Error:', error);
                        throw new TRPCError({
                              code: 'INTERNAL_SERVER_ERROR',
                              message: 'Không thể tải khoản phải thu.',
                        });
                  }
            }),

      createChargeBatch: protectedProcedure
            .input(
                  z.object({
                        feeTypeId: z.number(),
                        residentIds: z.array(z.number()).min(1),
                        amount: z.number().min(0),
                        dueDate: z.string().optional().nullable(),
                        billingMonth: z.string().optional().nullable(),
                        periodStartDate: z.string().optional().nullable(),
                        periodEndDate: z.string().optional().nullable(),
                        periodChargeMode: z.string().optional().nullable(),
                        periodMultiplier: z.number().optional().nullable(),
                        source: z.string().optional().nullable(),
                        feeMode: z.string().optional().nullable(),
                        targetType: z.string().optional().nullable(),
                        targetName: z.string().optional().nullable(),
                        description: z.string().optional().nullable(),
                  }),
            )
            .mutation(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.createFinanceChargeBatch({ ...input, createdBy: ctx?.user?.id || null });
                  } catch (error) {
                        console.error('[finance.createChargeBatch] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: error instanceof Error ? error.message : 'Không thể tạo khoản thu.',
                        });
                  }
            }),

      updateCharge: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),
                        feeTypeId: z.number().optional().nullable(),
                        amount: z.number().min(0),
                        dueDate: z.string().optional().nullable(),
                        billingMonth: z.string().optional().nullable(),
                        periodStartDate: z.string().optional().nullable(),
                        periodEndDate: z.string().optional().nullable(),
                        periodChargeMode: z.string().optional().nullable(),
                        periodMultiplier: z.number().optional().nullable(),
                        status: z.string().optional().nullable(),
                        targetName: z.string().optional().nullable(),
                        description: z.string().optional().nullable(),
                  }),
            )
            .mutation(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.updateFinanceCharge(input);
                  } catch (error) {
                        console.error('[finance.updateCharge] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: error instanceof Error ? error.message : 'Không thể cập nhật khoản phải thu.',
                        });
                  }
            }),

      listTransactions: protectedProcedure
            .input(
                  z
                        .object({
                              search: z.string().optional(),
                              source: z.string().optional(),
                              direction: z.string().optional(),
                              limit: z.number().optional(),
                              offset: z.number().optional(),
                        })
                        .optional(),
            )
            .query(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.listFinanceTransactions(input || {});
                  } catch (error) {
                        console.error('[finance.listTransactions] Error:', error);
                        throw new TRPCError({
                              code: 'INTERNAL_SERVER_ERROR',
                              message: 'Không thể tải thu chi khác.',
                        });
                  }
            }),

      createTransaction: protectedProcedure
            .input(
                  z.object({
                        source: z.string(),
                        direction: z.enum(['in', 'out']),
                        amount: z.number().min(0),
                        transactionDate: z.string().optional().nullable(),
                        targetType: z.string().optional().nullable(),
                        targetName: z.string().optional().nullable(),
                        description: z.string().optional().nullable(),
                  }),
            )
            .mutation(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.createFinanceTransaction({ ...input, createdBy: ctx?.user?.id || null });
                  } catch (error) {
                        console.error('[finance.createTransaction] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: error instanceof Error ? error.message : 'Không thể lưu nghiệp vụ thu chi.',
                        });
                  }
            }),

      deleteTransaction: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.deleteFinanceTransaction(input);
                  } catch (error) {
                        console.error('[finance.deleteTransaction] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: error instanceof Error ? error.message : 'Không thể xóa khoản thu chi.',
                        });
                  }
            }),

      recordPayment: protectedProcedure
            .input(
                  z.object({
                        chargeId: z.number(),
                        residentId: z.number().optional().nullable(),
                        amount: z.number().min(0),
                        paymentDate: z.string().optional().nullable(),
                        method: z.string().optional().nullable(),
                        note: z.string().optional().nullable(),
                  }),
            )
            .mutation(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.recordFinancePayment({ ...input, createdBy: ctx?.user?.id || null });
                  } catch (error) {
                        console.error('[finance.recordPayment] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: error instanceof Error ? error.message : 'Không thể ghi nhận thanh toán.',
                        });
                  }
            }),

      cancelCharge: protectedProcedure
            .input(z.object({ id: z.number(), reason: z.string().optional().nullable() }))
            .mutation(async ({ input, ctx }: any) => {
                  requireFinanceManagementAccess(ctx.user);
                  try {
                        return await financeDb.cancelFinanceCharge(input);
                  } catch (error) {
                        console.error('[finance.cancelCharge] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: error instanceof Error ? error.message : 'Không thể hủy khoản phải thu.',
                        });
                  }
            }),
});
