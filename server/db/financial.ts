/**
 * Financial Management Database Functions
 * Phí Thu & Phí Trả
 */

import { getDb } from "./connection";
import { eq, and, gte, lte, sum, desc, asc } from "drizzle-orm";
import {
  residentFeeTypes,
  residentFeeAssignments,
  feeChangeHistory,
  additionalFees,
  borrowedFees,
  revenues,
  revenuePayments,
  revenueHistory,
  expenseCategories,
  expenses,
  storeRevenues,
  storeSaleItems,
  storeExpenses,
  libraryRevenues,
  libraryExpenses,
  expenseHistory,
} from "../../drizzle/schema";

// ============================================================================
// REVENUE FUNCTIONS (PHÍ THU) - 15 FUNCTIONS
// ============================================================================

/**
 * 1. Create resident fee type (Loại phí)
 */
export async function createResidentFeeType(data: {
  code: string;
  name: string;
  description?: string;
  roomFee: number;
  mealFee: number;
  activitiesFee: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalMonthlyFee = data.roomFee + data.mealFee + data.activitiesFee;

  const result = await db.insert(residentFeeTypes).values({
    ...data,
    totalMonthlyFee,
  });

  return result;
}

/**
 * 2. Get all resident fee types
 */
export async function getResidentFeeTypes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.query.residentFeeTypes.findMany({
    where: (table) => eq(table.isActive, true),
  });
}

/**
 * 3. Assign fee type to resident
 */
export async function assignFeeTypeToResident(data: {
  residentId: number;
  feeTypeId: number;
  effectiveFromMonth: number;
  effectiveFromYear: number;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(residentFeeAssignments).values({
    ...data,
    assignedDate: new Date(),
  });
}

/**
 * 4. Get current fee type for resident
 */
export async function getCurrentFeeTypeForResident(residentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const assignment = await db.query.residentFeeAssignments.findFirst({
    where: (table) => eq(table.residentId, residentId),
    orderBy: (table) => desc(table.assignedDate),
    with: {
      feeType: true,
    },
  });

  return assignment;
}

/**
 * 5. Change resident fee type
 */
export async function changeResidentFeeType(data: {
  residentId: number;
  newFeeTypeId: number;
  changeReason?: string;
  effectiveFromMonth: number;
  effectiveFromYear: number;
  changedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get old fee type
  const oldAssignment = await getCurrentFeeTypeForResident(data.residentId);

  // Create new assignment
  await assignFeeTypeToResident({
    residentId: data.residentId,
    feeTypeId: data.newFeeTypeId,
    effectiveFromMonth: data.effectiveFromMonth,
    effectiveFromYear: data.effectiveFromYear,
  });

  // Record change history
  await db.insert(feeChangeHistory).values({
    residentId: data.residentId,
    oldFeeTypeId: oldAssignment?.feeTypeId,
    newFeeTypeId: data.newFeeTypeId,
    changeReason: data.changeReason,
    changeDate: new Date(),
    effectiveFromMonth: data.effectiveFromMonth,
    effectiveFromYear: data.effectiveFromYear,
    changedBy: data.changedBy,
  });
}

/**
 * 6. Add additional fee (Phí khác)
 */
export async function addAdditionalFee(data: {
  residentId: number;
  feeCategory: string;
  amount: number;
  billingMonth: number;
  billingYear: number;
  reason?: string;
  relatedActivityId?: number;
  relatedCourseId?: number;
  description?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(additionalFees).values(data);
}

/**
 * 7. Get additional fees for resident in month
 */
export async function getAdditionalFeesForMonth(
  residentId: number,
  month: number,
  year: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.query.additionalFees.findMany({
    where: (table) =>
      and(
        eq(table.residentId, residentId),
        eq(table.billingMonth, month),
        eq(table.billingYear, year),
        eq(table.status, "approved")
      ),
  });
}

/**
 * 8. Record borrowed fee (Phí mượn/ứng)
 */
export async function recordBorrowedFee(data: {
  residentId: number;
  amount: number;
  reason?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(borrowedFees).values({
    ...data,
    borrowDate: new Date(),
    status: "pending",
  });
}

/**
 * 9. Get pending borrowed fees for resident
 */
export async function getPendingBorrowedFees(residentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.query.borrowedFees.findMany({
    where: (table) =>
      and(
        eq(table.residentId, residentId),
        eq(table.status, "pending")
      ),
  });
}

/**
 * 10. Calculate monthly revenue for resident
 */
export async function calculateMonthlyRevenue(
  residentId: number,
  month: number,
  year: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current fee type
  const feeAssignment = await getCurrentFeeTypeForResident(residentId);
  if (!feeAssignment) {
    throw new Error("No fee type assigned for resident");
  }

  const baseFee = feeAssignment.feeType?.totalMonthlyFee || 0;

  // Get additional fees
  const additionalFeesList = await getAdditionalFeesForMonth(
    residentId,
    month,
    year
  );
  const additionalFeeAmount = additionalFeesList.reduce(
    (sum, fee) => sum + parseFloat(fee.amount.toString()),
    0
  );

  // Get borrowed fees to add
  const pendingBorrowed = await getPendingBorrowedFees(residentId);
  const borrowedFeeAddition = pendingBorrowed.reduce(
    (sum, fee) => sum + parseFloat(fee.amount.toString()),
    0
  );

  const totalAmount = baseFee + additionalFeeAmount + borrowedFeeAddition;

  return {
    baseFee,
    additionalFeeAmount,
    borrowedFeeAddition,
    totalAmount,
  };
}

/**
 * 11. Create monthly revenue record
 */
export async function createMonthlyRevenue(data: {
  residentId: number;
  month: number;
  year: number;
  dueDate: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const calculation = await calculateMonthlyRevenue(
    data.residentId,
    data.month,
    data.year
  );

  const result = await db.insert(revenues).values({
    residentId: data.residentId,
    billingMonth: data.month,
    billingYear: data.year,
    baseFee: calculation.baseFee.toString(),
    additionalFeeAmount: calculation.additionalFeeAmount.toString(),
    borrowedFeeAddition: calculation.borrowedFeeAddition.toString(),
    totalAmount: calculation.totalAmount.toString(),
    dueDate: data.dueDate,
    status: "pending",
  });

  // Mark borrowed fees as added to fee
  if (calculation.borrowedFeeAddition > 0) {
    const pendingBorrowed = await getPendingBorrowedFees(data.residentId);
    for (const fee of pendingBorrowed) {
      await db
        .update(borrowedFees)
        .set({
          status: "added_to_fee",
          addedToMonthlyFeeMonth: data.month,
          addedToMonthlyFeeYear: data.year,
        })
        .where(eq(borrowedFees.id, fee.id));
    }
  }

  return result;
}

/**
 * 12. Record revenue payment
 */
export async function recordRevenuePayment(data: {
  revenueId: number;
  amount: number;
  paymentMethod: "cash" | "bank_transfer" | "check" | "other";
  paymentDate: Date;
  reference?: string;
  notes?: string;
  recordedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Record payment
  await db.insert(revenuePayments).values({
    ...data,
  });

  // Update revenue status
  const revenue = await db.query.revenues.findFirst({
    where: (table) => eq(table.id, data.revenueId),
  });

  if (revenue) {
    const newPaidAmount =
      parseFloat(revenue.paidAmount.toString()) + data.amount;
    const totalAmount = parseFloat(revenue.totalAmount.toString());

    let newStatus = revenue.status;
    if (newPaidAmount >= totalAmount) {
      newStatus = "paid";
    } else if (newPaidAmount > 0) {
      newStatus = "partial";
    }

    await db
      .update(revenues)
      .set({
        paidAmount: newPaidAmount.toString(),
        status: newStatus,
        paidDate: data.paymentDate,
      })
      .where(eq(revenues.id, data.revenueId));

    // Record history
    await db.insert(revenueHistory).values({
      revenueId: data.revenueId,
      fieldChanged: "status",
      oldValue: revenue.status,
      newValue: newStatus,
      changeReason: `Payment recorded: ${data.amount}`,
      changedBy: data.recordedBy,
    });
  }
}

/**
 * 13. Get revenue for resident in month
 */
export async function getRevenueForMonth(
  residentId: number,
  month: number,
  year: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.query.revenues.findFirst({
    where: (table) =>
      and(
        eq(table.residentId, residentId),
        eq(table.billingMonth, month),
        eq(table.billingYear, year)
      ),
    with: {
      payments: true,
      history: true,
    },
  });
}

/**
 * 14. Get overdue revenues
 */
export async function getOverdueRevenues() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date();
  return await db.query.revenues.findMany({
    where: (table) =>
      and(
        lte(table.dueDate, today),
        eq(table.status, "due")
      ),
    with: {
      resident: true,
    },
  });
}

/**
 * 15. Get revenue statistics
 */
export async function getRevenueStats(month: number, year: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allRevenues = await db.query.revenues.findMany({
    where: (table) =>
      and(
        eq(table.billingMonth, month),
        eq(table.billingYear, year)
      ),
  });

  const totalAmount = allRevenues.reduce(
    (sum, r) => sum + parseFloat(r.totalAmount.toString()),
    0
  );
  const paidAmount = allRevenues.reduce(
    (sum, r) => sum + parseFloat(r.paidAmount.toString()),
    0
  );
  const unpaidAmount = totalAmount - paidAmount;

  return {
    totalRevenues: allRevenues.length,
    totalAmount,
    paidAmount,
    unpaidAmount,
    paidPercentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
    byStatus: {
      pending: allRevenues.filter((r) => r.status === "pending").length,
      due: allRevenues.filter((r) => r.status === "due").length,
      overdue: allRevenues.filter((r) => r.status === "overdue").length,
      paid: allRevenues.filter((r) => r.status === "paid").length,
      partial: allRevenues.filter((r) => r.status === "partial").length,
    },
  };
}

// ============================================================================
// EXPENSE FUNCTIONS (PHÍ TRẢ) - 15 FUNCTIONS
// ============================================================================

/**
 * 16. Create expense category
 */
export async function createExpenseCategory(data: {
  code: string;
  name: string;
  description?: string;
  budgetAmount?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(expenseCategories).values({
    ...data,
    budgetAmount: data.budgetAmount?.toString(),
  });
}

/**
 * 17. Get all expense categories
 */
export async function getExpenseCategories() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.query.expenseCategories.findMany({
    where: (table) => eq(table.isActive, true),
  });
}

/**
 * 18. Create expense
 */
export async function createExpense(data: {
  categoryId: number;
  department: "general" | "store" | "library" | "other";
  description: string;
  amount: number;
  expenseDate: Date;
  paymentMethod: "cash" | "bank_transfer" | "check" | "other";
  invoiceNumber?: string;
  invoiceFile?: string;
  notes?: string;
  createdBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(expenses).values({
    ...data,
    amount: data.amount.toString(),
    status: "draft",
  });
}

/**
 * 19. Submit expense for approval
 */
export async function submitExpenseForApproval(expenseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expense = await db.query.expenses.findFirst({
    where: (table) => eq(table.id, expenseId),
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  await db
    .update(expenses)
    .set({
      status: "submitted",
    })
    .where(eq(expenses.id, expenseId));

  await db.insert(expenseHistory).values({
    expenseId,
    fieldChanged: "status",
    oldValue: expense.status,
    newValue: "submitted",
    changeReason: "Submitted for approval",
  });
}

/**
 * 20. Approve expense
 */
export async function approveExpense(
  expenseId: number,
  approvedBy: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expense = await db.query.expenses.findFirst({
    where: (table) => eq(table.id, expenseId),
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  await db
    .update(expenses)
    .set({
      status: "approved",
      approvedBy,
      approvedAt: new Date(),
    })
    .where(eq(expenses.id, expenseId));

  await db.insert(expenseHistory).values({
    expenseId,
    fieldChanged: "status",
    oldValue: expense.status,
    newValue: "approved",
    changeReason: notes || "Approved",
    changedBy: approvedBy,
  });
}

/**
 * 21. Reject expense
 */
export async function rejectExpense(
  expenseId: number,
  rejectionReason: string,
  rejectedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expense = await db.query.expenses.findFirst({
    where: (table) => eq(table.id, expenseId),
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  await db
    .update(expenses)
    .set({
      status: "rejected",
      rejectionReason,
    })
    .where(eq(expenses.id, expenseId));

  await db.insert(expenseHistory).values({
    expenseId,
    fieldChanged: "status",
    oldValue: expense.status,
    newValue: "rejected",
    changeReason: rejectionReason,
    changedBy: rejectedBy,
  });
}

/**
 * 22. Record store revenue
 */
export async function recordStoreRevenue(data: {
  productName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  recordedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalAmount = data.quantity * data.unitPrice;

  // Record revenue
  await db.insert(storeRevenues).values({
    ...data,
    unitPrice: data.unitPrice.toString(),
    revenueDate: new Date(),
    totalAmount: totalAmount.toString(),
  });

  // Update or create sale item
  const existingItem = await db.query.storeSaleItems.findFirst({
    where: (table) => eq(table.productName, data.productName),
  });

  if (existingItem) {
    const newQuantity = existingItem.totalQuantitySold + data.quantity;
    const newRevenue =
      parseFloat(existingItem.totalRevenue.toString()) + totalAmount;
    const newAveragePrice = newRevenue / newQuantity;

    await db
      .update(storeSaleItems)
      .set({
        totalQuantitySold: newQuantity,
        totalRevenue: newRevenue.toString(),
        averageUnitPrice: newAveragePrice.toString(),
        lastSaleDate: new Date(),
      })
      .where(eq(storeSaleItems.id, existingItem.id));
  } else {
    await db.insert(storeSaleItems).values({
      productName: data.productName,
      totalQuantitySold: data.quantity,
      totalRevenue: totalAmount.toString(),
      averageUnitPrice: data.unitPrice.toString(),
      lastSaleDate: new Date(),
    });
  }
}

/**
 * 23. Record store expense
 */
export async function recordStoreExpense(data: {
  description: string;
  amount: number;
  expenseType: "purchase" | "rent" | "utilities" | "staff" | "other";
  notes?: string;
  recordedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(storeExpenses).values({
    ...data,
    amount: data.amount.toString(),
    expenseDate: new Date(),
  });
}

/**
 * 24. Record library revenue
 */
export async function recordLibraryRevenue(data: {
  revenueType: "rental" | "photocopy" | "printing" | "registration" | "other";
  amount: number;
  description?: string;
  notes?: string;
  recordedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(libraryRevenues).values({
    ...data,
    amount: data.amount.toString(),
    revenueDate: new Date(),
  });
}

/**
 * 25. Record library expense
 */
export async function recordLibraryExpense(data: {
  description: string;
  amount: number;
  expenseType: "books" | "maintenance" | "utilities" | "staff" | "other";
  notes?: string;
  recordedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(libraryExpenses).values({
    ...data,
    amount: data.amount.toString(),
    expenseDate: new Date(),
  });
}

/**
 * 26. Get expenses by status
 */
export async function getExpensesByStatus(
  status: "draft" | "submitted" | "approved" | "rejected" | "paid"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.query.expenses.findMany({
    where: (table) => eq(table.status, status),
    with: {
      category: true,
      createdByUser: true,
      approvedByUser: true,
    },
  });
}

/**
 * 27. Get expense statistics
 */
export async function getExpenseStats(month: number, year: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allExpenses = await db.query.expenses.findMany({
    where: (table) =>
      and(
        gte(table.expenseDate, new Date(`${year}-${month}-01`)),
        lte(table.expenseDate, new Date(`${year}-${month}-31`))
      ),
  });

  const totalAmount = allExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount.toString()),
    0
  );

  return {
    totalExpenses: allExpenses.length,
    totalAmount,
    byStatus: {
      draft: allExpenses.filter((e) => e.status === "draft").length,
      submitted: allExpenses.filter((e) => e.status === "submitted").length,
      approved: allExpenses.filter((e) => e.status === "approved").length,
      rejected: allExpenses.filter((e) => e.status === "rejected").length,
      paid: allExpenses.filter((e) => e.status === "paid").length,
    },
    byDepartment: {
      general: allExpenses
        .filter((e) => e.department === "general")
        .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0),
      store: allExpenses
        .filter((e) => e.department === "store")
        .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0),
      library: allExpenses
        .filter((e) => e.department === "library")
        .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0),
      other: allExpenses
        .filter((e) => e.department === "other")
        .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0),
    },
  };
}

/**
 * 28. Get store statistics
 */
export async function getStoreStats(month: number, year: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const revenues = await db.query.storeRevenues.findMany({
    where: (table) =>
      and(
        gte(table.revenueDate, new Date(`${year}-${month}-01`)),
        lte(table.revenueDate, new Date(`${year}-${month}-31`))
      ),
  });

  const expenses = await db.query.storeExpenses.findMany({
    where: (table) =>
      and(
        gte(table.expenseDate, new Date(`${year}-${month}-01`)),
        lte(table.expenseDate, new Date(`${year}-${month}-31`))
      ),
  });

  const totalRevenue = revenues.reduce(
    (sum, r) => sum + parseFloat(r.totalAmount.toString()),
    0
  );
  const totalExpense = expenses.reduce(
    (sum, e) => sum + parseFloat(e.amount.toString()),
    0
  );

  return {
    totalRevenue,
    totalExpense,
    profit: totalRevenue - totalExpense,
    profitMargin:
      totalRevenue > 0 ? ((totalRevenue - totalExpense) / totalRevenue) * 100 : 0,
  };
}

/**
 * 29. Get library statistics
 */
export async function getLibraryStats(month: number, year: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const revenues = await db.query.libraryRevenues.findMany({
    where: (table) =>
      and(
        gte(table.revenueDate, new Date(`${year}-${month}-01`)),
        lte(table.revenueDate, new Date(`${year}-${month}-31`))
      ),
  });

  const expenses = await db.query.libraryExpenses.findMany({
    where: (table) =>
      and(
        gte(table.expenseDate, new Date(`${year}-${month}-01`)),
        lte(table.expenseDate, new Date(`${year}-${month}-31`))
      ),
  });

  const totalRevenue = revenues.reduce(
    (sum, r) => sum + parseFloat(r.amount.toString()),
    0
  );
  const totalExpense = expenses.reduce(
    (sum, e) => sum + parseFloat(e.amount.toString()),
    0
  );

  return {
    totalRevenue,
    totalExpense,
    profit: totalRevenue - totalExpense,
    profitMargin:
      totalRevenue > 0 ? ((totalRevenue - totalExpense) / totalRevenue) * 100 : 0,
  };
}

// ============================================================================
// UTILITY FUNCTIONS - 5 FUNCTIONS
// ============================================================================

/**
 * 30. Get financial dashboard summary
 */
export async function getFinancialDashboardSummary(month: number, year: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const revenueStats = await getRevenueStats(month, year);
  const expenseStats = await getExpenseStats(month, year);
  const storeStats = await getStoreStats(month, year);
  const libraryStats = await getLibraryStats(month, year);

  const totalIncome = revenueStats.totalAmount + storeStats.totalRevenue + libraryStats.totalRevenue;
  const totalExpense = expenseStats.totalAmount + storeStats.totalExpense + libraryStats.totalExpense;

  return {
    month,
    year,
    revenue: revenueStats,
    expense: expenseStats,
    store: storeStats,
    library: libraryStats,
    summary: {
      totalIncome,
      totalExpense,
      profit: totalIncome - totalExpense,
      profitMargin: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
    },
  };
}

/**
 * 31. Get resident financial summary
 */
export async function getResidentFinancialSummary(residentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const revenues = await db.query.revenues.findMany({
    where: (table) => eq(table.residentId, residentId),
  });

  const totalBilled = revenues.reduce(
    (sum, r) => sum + parseFloat(r.totalAmount.toString()),
    0
  );
  const totalPaid = revenues.reduce(
    (sum, r) => sum + parseFloat(r.paidAmount.toString()),
    0
  );
  const totalDebt = totalBilled - totalPaid;

  return {
    residentId,
    totalBilled,
    totalPaid,
    totalDebt,
    debtPercentage: totalBilled > 0 ? (totalDebt / totalBilled) * 100 : 0,
  };
}

/**
 * 32. Get debt list (sorted by amount)
 */
export async function getDebtList() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allRevenues = await db.query.revenues.findMany({
    with: {
      resident: true,
    },
  });

  const debts = allRevenues
    .map((r) => ({
      residentId: r.residentId,
      residentName: r.resident?.fullName,
      totalBilled: parseFloat(r.totalAmount.toString()),
      totalPaid: parseFloat(r.paidAmount.toString()),
      debt: parseFloat(r.totalAmount.toString()) - parseFloat(r.paidAmount.toString()),
      status: r.status,
    }))
    .filter((d) => d.debt > 0)
    .sort((a, b) => b.debt - a.debt);

  return debts;
}

/**
 * 33. Get pending approvals (expenses)
 */
export async function getPendingApprovals() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.query.expenses.findMany({
    where: (table) => eq(table.status, "submitted"),
    with: {
      category: true,
      createdByUser: true,
    },
    orderBy: (table) => asc(table.createdAt),
  });
}

/**
 * 34. Bulk create monthly revenues (for all residents)
 */
export async function bulkCreateMonthlyRevenues(
  month: number,
  year: number,
  dueDate: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all active residents
  const residents = await db.query.residents.findMany({
    where: (table) => eq(table.status, "active"),
  });

  const results = [];
  for (const resident of residents) {
    try {
      const result = await createMonthlyRevenue({
        residentId: resident.id,
        month,
        year,
        dueDate,
      });
      results.push({ residentId: resident.id, success: true });
    } catch (error) {
      results.push({ residentId: resident.id, success: false, error });
    }
  }

  return results;
}