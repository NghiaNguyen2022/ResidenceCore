/**
 * Financial Management Router
 * Phí Thu & Phí Trả
 */

import { z } from "zod";
import { router } from "../_core/trpc";
import { protectedProcedure } from "../_core/trpc";
import * as db from "../db";

// ============================================================================
// SCHEMAS
// ============================================================================

const residentFeeTypeSchema = z.object({
  code: z.string().min(1, "Mã loại phí không được trống"),
  name: z.string().min(1, "Tên loại phí không được trống"),
  description: z.string().optional(),
  roomFee: z.number().min(0, "Phí ở phải lớn hơn 0"),
  mealFee: z.number().min(0, "Phí ăn phải lớn hơn 0"),
  activitiesFee: z.number().min(0, "Phí sinh hoạt phải lớn hơn 0"),
});

const assignFeeTypeSchema = z.object({
  residentId: z.number().min(1, "Mã học viên không được trống"),
  feeTypeId: z.number().min(1, "Mã loại phí không được trống"),
  effectiveFromMonth: z.number().min(1).max(12),
  effectiveFromYear: z.number().min(2020),
  notes: z.string().optional(),
});

const changeFeeTypeSchema = z.object({
  residentId: z.number().min(1),
  newFeeTypeId: z.number().min(1),
  changeReason: z.string().optional(),
  effectiveFromMonth: z.number().min(1).max(12),
  effectiveFromYear: z.number().min(2020),
});

const additionalFeeSchema = z.object({
  residentId: z.number().min(1),
  feeCategory: z.string().min(1, "Danh mục phí không được trống"),
  amount: z.number().min(0, "Số tiền phải lớn hơn 0"),
  billingMonth: z.number().min(1).max(12),
  billingYear: z.number().min(2020),
  reason: z.string().optional(),
  relatedActivityId: z.number().optional(),
  relatedCourseId: z.number().optional(),
  description: z.string().optional(),
});

const borrowedFeeSchema = z.object({
  residentId: z.number().min(1),
  amount: z.number().min(0, "Số tiền phải lớn hơn 0"),
  reason: z.string().optional(),
});

const recordPaymentSchema = z.object({
  revenueId: z.number().min(1),
  amount: z.number().min(0, "Số tiền phải lớn hơn 0"),
  paymentMethod: z.enum(["cash", "bank_transfer", "check", "other"]),
  paymentDate: z.date(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const expenseCategorySchema = z.object({
  code: z.string().min(1, "Mã danh mục không được trống"),
  name: z.string().min(1, "Tên danh mục không được trống"),
  description: z.string().optional(),
  budgetAmount: z.number().optional(),
});

const createExpenseSchema = z.object({
  categoryId: z.number().min(1),
  department: z.enum(["general", "store", "library", "other"]),
  description: z.string().min(1, "Mô tả không được trống"),
  amount: z.number().min(0, "Số tiền phải lớn hơn 0"),
  expenseDate: z.date(),
  paymentMethod: z.enum(["cash", "bank_transfer", "check", "other"]),
  invoiceNumber: z.string().optional(),
  invoiceFile: z.string().optional(),
  notes: z.string().optional(),
});

const storeRevenueSchema = z.object({
  productName: z.string().min(1, "Tên sản phẩm không được trống"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  unitPrice: z.number().min(0, "Giá không được âm"),
  notes: z.string().optional(),
});

const storeExpenseSchema = z.object({
  description: z.string().min(1, "Mô tả không được trống"),
  amount: z.number().min(0, "Số tiền phải lớn hơn 0"),
  expenseType: z.enum(["purchase", "rent", "utilities", "staff", "other"]),
  notes: z.string().optional(),
});

const libraryRevenueSchema = z.object({
  revenueType: z.enum(["rental", "photocopy", "printing", "registration", "other"]),
  amount: z.number().min(0, "Số tiền phải lớn hơn 0"),
  description: z.string().optional(),
  notes: z.string().optional(),
});

const libraryExpenseSchema = z.object({
  description: z.string().min(1, "Mô tả không được trống"),
  amount: z.number().min(0, "Số tiền phải lớn hơn 0"),
  expenseType: z.enum(["books", "maintenance", "utilities", "staff", "other"]),
  notes: z.string().optional(),
});

// ============================================================================
// REVENUE ENDPOINTS (PHÍ THU)
// ============================================================================

export const financialRouter = router({
  // Fee Type Management
  createResidentFeeType: protectedProcedure
    .input(residentFeeTypeSchema)
    .mutation(async ({ input }) => {
      try {
        await db.createResidentFeeType(input);
        return {
          success: true,
          message: "Thêm loại phí thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to create resident fee type:", error);
        throw error;
      }
    }),

  getResidentFeeTypes: protectedProcedure.query(async () => {
    try {
      return await db.getResidentFeeTypes();
    } catch (error) {
      console.error("[Router] Failed to get resident fee types:", error);
      throw error;
    }
  }),

  // Fee Assignment
  assignFeeTypeToResident: protectedProcedure
    .input(assignFeeTypeSchema)
    .mutation(async ({ input }) => {
      try {
        await db.assignFeeTypeToResident(input);
        return {
          success: true,
          message: "Gán loại phí cho học viên thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to assign fee type:", error);
        throw error;
      }
    }),

  getCurrentFeeTypeForResident: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        return await db.getCurrentFeeTypeForResident(input);
      } catch (error) {
        console.error("[Router] Failed to get current fee type:", error);
        throw error;
      }
    }),

  changeFeeType: protectedProcedure
    .input(changeFeeTypeSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await db.changeResidentFeeType({
          ...input,
          changedBy: ctx.user?.id,
        });
        return {
          success: true,
          message: "Thay đổi loại phí thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to change fee type:", error);
        throw error;
      }
    }),

  // Additional Fees
  addAdditionalFee: protectedProcedure
    .input(additionalFeeSchema)
    .mutation(async ({ input }) => {
      try {
        await db.addAdditionalFee(input);
        return {
          success: true,
          message: "Thêm phí khác thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to add additional fee:", error);
        throw error;
      }
    }),

  getAdditionalFeesForMonth: protectedProcedure
    .input(
      z.object({
        residentId: z.number(),
        month: z.number(),
        year: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await db.getAdditionalFeesForMonth(input.residentId, input.month, input.year);
      } catch (error) {
        console.error("[Router] Failed to get additional fees:", error);
        throw error;
      }
    }),

  // Borrowed Fees
  recordBorrowedFee: protectedProcedure
    .input(borrowedFeeSchema)
    .mutation(async ({ input }) => {
      try {
        await db.recordBorrowedFee(input);
        return {
          success: true,
          message: "Ghi nhận phí mượn thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to record borrowed fee:", error);
        throw error;
      }
    }),

  getPendingBorrowedFees: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        return await db.getPendingBorrowedFees(input);
      } catch (error) {
        console.error("[Router] Failed to get pending borrowed fees:", error);
        throw error;
      }
    }),

  // Monthly Revenue
  calculateMonthlyRevenue: protectedProcedure
    .input(
      z.object({
        residentId: z.number(),
        month: z.number(),
        year: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await db.calculateMonthlyRevenue(input.residentId, input.month, input.year);
      } catch (error) {
        console.error("[Router] Failed to calculate monthly revenue:", error);
        throw error;
      }
    }),

  createMonthlyRevenue: protectedProcedure
    .input(
      z.object({
        residentId: z.number(),
        month: z.number(),
        year: z.number(),
        dueDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await db.createMonthlyRevenue(input);
        return {
          success: true,
          message: "Tạo phí thu tháng thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to create monthly revenue:", error);
        throw error;
      }
    }),

  // Payment Recording
  recordRevenuePayment: protectedProcedure
    .input(recordPaymentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await db.recordRevenuePayment({
          ...input,
          recordedBy: ctx.user?.id,
        });
        return {
          success: true,
          message: "Ghi nhận thanh toán thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to record revenue payment:", error);
        throw error;
      }
    }),

  getRevenueForMonth: protectedProcedure
    .input(
      z.object({
        residentId: z.number(),
        month: z.number(),
        year: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await db.getRevenueForMonth(input.residentId, input.month, input.year);
      } catch (error) {
        console.error("[Router] Failed to get revenue for month:", error);
        throw error;
      }
    }),

  getOverdueRevenues: protectedProcedure.query(async () => {
    try {
      return await db.getOverdueRevenues();
    } catch (error) {
      console.error("[Router] Failed to get overdue revenues:", error);
      throw error;
    }
  }),

  getRevenueStats: protectedProcedure
    .input(
      z.object({
        month: z.number(),
        year: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await db.getRevenueStats(input.month, input.year);
      } catch (error) {
        console.error("[Router] Failed to get revenue stats:", error);
        throw error;
      }
    }),

  // ============================================================================
  // EXPENSE ENDPOINTS (PHÍ TRẢ)
  // ============================================================================

  // Expense Categories
  createExpenseCategory: protectedProcedure
    .input(expenseCategorySchema)
    .mutation(async ({ input }) => {
      try {
        await db.createExpenseCategory(input);
        return {
          success: true,
          message: "Thêm danh mục chi phí thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to create expense category:", error);
        throw error;
      }
    }),

  getExpenseCategories: protectedProcedure.query(async () => {
    try {
      return await db.getExpenseCategories();
    } catch (error) {
      console.error("[Router] Failed to get expense categories:", error);
      throw error;
    }
  }),

  // Expenses
  createExpense: protectedProcedure
    .input(createExpenseSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await db.createExpense({
          ...input,
          createdBy: ctx.user?.id,
        });
        return {
          success: true,
          message: "Thêm chi phí thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to create expense:", error);
        throw error;
      }
    }),

  submitExpenseForApproval: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      try {
        await db.submitExpenseForApproval(input);
        return {
          success: true,
          message: "Gửi duyệt chi phí thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to submit expense for approval:", error);
        throw error;
      }
    }),

  approveExpense: protectedProcedure
    .input(
      z.object({
        expenseId: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await db.approveExpense(input.expenseId, ctx.user?.id || 0, input.notes);
        return {
          success: true,
          message: "Phê duyệt chi phí thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to approve expense:", error);
        throw error;
      }
    }),

  rejectExpense: protectedProcedure
    .input(
      z.object({
        expenseId: z.number(),
        rejectionReason: z.string().min(1, "Lý do từ chối không được trống"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await db.rejectExpense(input.expenseId, input.rejectionReason, ctx.user?.id || 0);
        return {
          success: true,
          message: "Từ chối chi phí thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to reject expense:", error);
        throw error;
      }
    }),

  getExpensesByStatus: protectedProcedure
    .input(z.enum(["draft", "submitted", "approved", "rejected", "paid"]))
    .query(async ({ input }) => {
      try {
        return await db.getExpensesByStatus(input);
      } catch (error) {
        console.error("[Router] Failed to get expenses by status:", error);
        throw error;
      }
    }),

  getExpenseStats: protectedProcedure
    .input(
      z.object({
        month: z.number(),
        year: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await db.getExpenseStats(input.month, input.year);
      } catch (error) {
        console.error("[Router] Failed to get expense stats:", error);
        throw error;
      }
    }),

  // Store Management
  recordStoreRevenue: protectedProcedure
    .input(storeRevenueSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await db.recordStoreRevenue({
          ...input,
          recordedBy: ctx.user?.id,
        });
        return {
          success: true,
          message: "Ghi nhận doanh thu cửa hàng thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to record store revenue:", error);
        throw error;
      }
    }),

  recordStoreExpense: protectedProcedure
    .input(storeExpenseSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await db.recordStoreExpense({
          ...input,
          recordedBy: ctx.user?.id,
        });
        return {
          success: true,
          message: "Ghi nhận chi phí cửa hàng thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to record store expense:", error);
        throw error;
      }
    }),

  getStoreStats: protectedProcedure
    .input(
      z.object({
        month: z.number(),
        year: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await db.getStoreStats(input.month, input.year);
      } catch (error) {
        console.error("[Router] Failed to get store stats:", error);
        throw error;
      }
    }),

  // Library Management
  recordLibraryRevenue: protectedProcedure
    .input(libraryRevenueSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await db.recordLibraryRevenue({
          ...input,
          recordedBy: ctx.user?.id,
        });
        return {
          success: true,
          message: "Ghi nhận doanh thu thư viện thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to record library revenue:", error);
        throw error;
      }
    }),

  recordLibraryExpense: protectedProcedure
    .input(libraryExpenseSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await db.recordLibraryExpense({
          ...input,
          recordedBy: ctx.user?.id,
        });
        return {
          success: true,
          message: "Ghi nhận chi phí thư viện thành công",
        };
      } catch (error) {
        console.error("[Router] Failed to record library expense:", error);
        throw error;
      }
    }),

  getLibraryStats: protectedProcedure
    .input(
      z.object({
        month: z.number(),
        year: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await db.getLibraryStats(input.month, input.year);
      } catch (error) {
        console.error("[Router] Failed to get library stats:", error);
        throw error;
      }
    }),

  // ============================================================================
  // UTILITY ENDPOINTS
  // ============================================================================

  getFinancialDashboardSummary: protectedProcedure
    .input(
      z.object({
        month: z.number(),
        year: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await db.getFinancialDashboardSummary(input.month, input.year);
      } catch (error) {
        console.error("[Router] Failed to get financial dashboard summary:", error);
        throw error;
      }
    }),

  getResidentFinancialSummary: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        return await db.getResidentFinancialSummary(input);
      } catch (error) {
        console.error("[Router] Failed to get resident financial summary:", error);
        throw error;
      }
    }),

  getDebtList: protectedProcedure.query(async () => {
    try {
      return await db.getDebtList();
    } catch (error) {
      console.error("[Router] Failed to get debt list:", error);
      throw error;
    }
  }),

  getPendingApprovals: protectedProcedure.query(async () => {
    try {
      return await db.getPendingApprovals();
    } catch (error) {
      console.error("[Router] Failed to get pending approvals:", error);
      throw error;
    }
  }),

  bulkCreateMonthlyRevenues: protectedProcedure
    .input(
      z.object({
        month: z.number(),
        year: z.number(),
        dueDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const results = await db.bulkCreateMonthlyRevenues(input.month, input.year, input.dueDate);
        return {
          success: true,
          message: "Tạo phí thu hàng tháng cho tất cả học viên thành công",
          results,
        };
      } catch (error) {
        console.error("[Router] Failed to bulk create monthly revenues:", error);
        throw error;
      }
    }),
});