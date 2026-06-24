import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { protectedProcedure, router } from '../../_core/trpc';
import * as financeDb from '../../db/finance';

export const financeRouter = router({
      summary: protectedProcedure.query(async () => {
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
            .input(
                  z
                        .object({
                              isActive: z.boolean().optional(),
                        })
                        .optional()
            )
            .query(async ({ input }) => {
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
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        return await financeDb.createFinanceFeeType(input);
                  } catch (error) {
                        console.error('[finance.createFeeType] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: 'Không thể tạo loại khoản thu.',
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
                              limit: z.number().optional(),
                              offset: z.number().optional(),
                        })
                        .optional()
            )
            .query(async ({ input }) => {
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
                  })
            )
            .mutation(async ({ input, ctx }: any) => {
                  try {
                        return await financeDb.createFinanceChargeBatch({
                              ...input,
                              createdBy: ctx?.user?.id || null,
                        });
                  } catch (error) {
                        console.error('[finance.createChargeBatch] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: 'Không thể tạo khoản thu.',
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
                        .optional()
            )
            .query(async ({ input }) => {
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
                  })
            )
            .mutation(async ({ input, ctx }: any) => {
                  try {
                        return await financeDb.createFinanceTransaction({
                              ...input,
                              createdBy: ctx?.user?.id || null,
                        });
                  } catch (error) {
                        console.error('[finance.createTransaction] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: 'Không thể lưu nghiệp vụ thu chi.',
                        });
                  }
            }),


      recordPayment: protectedProcedure
            .input(
                  z.object({
                        chargeId: z.number(),
                        residentId: z.number(),
                        amount: z.number().min(0),
                        paymentDate: z.string().optional().nullable(),
                        method: z.string().optional().nullable(),
                        note: z.string().optional().nullable(),
                  })
            )
            .mutation(async ({ input, ctx }: any) => {
                  try {
                        return await financeDb.recordFinancePayment({
                              ...input,
                              createdBy: ctx?.user?.id || null,
                        });
                  } catch (error) {
                        console.error('[finance.recordPayment] Error:', error);
                        throw new TRPCError({
                              code: 'BAD_REQUEST',
                              message: 'Không thể ghi nhận thanh toán.',
                        });
                  }
            }),
});
