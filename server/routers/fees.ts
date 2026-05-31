import { z } from "zod";
import { router } from "../_core/trpc";
import { accountantProcedure, managerProcedure, supervisorProcedure } from "../_core/rbac";
import * as db from "../db";

const feeTypeSchema = z.object({
  name: z.string().min(1, "Tên phí không được trống"),
  code: z.string().min(1, "Mã phí không được trống"),
  amount: z.number().min(0, "Số tiền phải lớn hơn 0"),
  billingCycle: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const paymentSchema = z.object({
  debtId: z.number(),
  amount: z.number().min(0, "Số tiền phải lớn hơn 0"),
  paymentMethod: z.enum(["cash", "bank_transfer", "check", "other"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const feesRouter = router({
  listFeeTypes: supervisorProcedure
    .input(
      z.object({
        activeOnly: z.boolean().default(true),
      })
    )
    .query(async ({ input }) => {
      return await db.getFeeTypes(input.activeOnly);
    }),

  createFeeType: accountantProcedure
    .input(feeTypeSchema)
    .mutation(async ({ input }) => {
      await db.createFeeType({
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      return {
        success: true,
        message: "Thêm loại phí thành công",
      };
    }),

  listDebts: supervisorProcedure
    .input(
      z.object({
        residentId: z.number().optional(),
        status: z.enum(["unpaid", "partially_paid", "paid", "overdue", "waived"]).optional(),
        billingMonth: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await db.getDebts({
        residentId: input.residentId,
        status: input.status,
        billingMonth: input.billingMonth,
      });
    }),

  getDebtById: supervisorProcedure.input(z.number()).query(async ({ input }) => {
    const debt = await db.getDebtById(input);
    if (!debt) {
      throw new Error("Công nợ không tìm thấy");
    }
    return debt;
  }),

  getResidentDebts: supervisorProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await db.getDebts({ residentId: input });
    }),

  recordPayment: accountantProcedure
    .input(paymentSchema)
    .mutation(async ({ input, ctx }) => {
      const debt = await db.getDebtById(input.debtId);
      if (!debt) {
        throw new Error("Công nợ không tìm thấy");
      }

      // Record payment
      await db.recordPayment({
        ...input,
        paymentDate: new Date(),
        recordedBy: ctx.user.id,
        createdAt: new Date(),
      } as any);

      // Update debt status
      const payments = await db.getPaymentsByDebt(input.debtId);
      const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
      const debtAmount = parseFloat(debt.amount.toString());

      let newStatus: "unpaid" | "partially_paid" | "paid" | "overdue" | "waived" = "unpaid";
      if (totalPaid >= debtAmount) {
        newStatus = "paid";
      } else if (totalPaid > 0) {
        newStatus = "partially_paid";
      }

      await db.updateDebt(input.debtId, {
        status: newStatus,
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Ghi nhận thanh toán thành công",
      };
    }),

  getPaymentsByDebt: supervisorProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await db.getPaymentsByDebt(input);
    }),

  getUnpaidDebtsCount: supervisorProcedure.query(async () => {
    return await db.getUnpaidDebtsCount();
  }),

  getTotalUnpaidAmount: supervisorProcedure.query(async () => {
    return await db.getTotalUnpaidAmount();
  }),

  getDebtStats: supervisorProcedure.query(async () => {
    const allDebts = await db.getDebts();

    return {
      total: allDebts.length,
      unpaid: allDebts.filter((d) => d.status === "unpaid").length,
      partiallyPaid: allDebts.filter((d) => d.status === "partially_paid").length,
      paid: allDebts.filter((d) => d.status === "paid").length,
      overdue: allDebts.filter((d) => d.status === "overdue").length,
      waived: allDebts.filter((d) => d.status === "waived").length,
      totalAmount: allDebts.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0),
      totalUnpaid: allDebts
        .filter((d) => d.status === "unpaid" || d.status === "partially_paid" || d.status === "overdue")
        .reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0),
    };
  }),
});
