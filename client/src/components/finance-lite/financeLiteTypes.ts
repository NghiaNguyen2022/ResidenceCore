export type FinanceTab = "studentLedger" | "expenses" | "cashbook";

export type ChargeStatus = "all" | "open" | "partial" | "paid" | "cancelled";

export type PeriodFormState = {
  periodName: string;
  year: string;
  fromMonth: string;
  toMonth: string;
  lodgingAmount: string;
  mealLivingAmount: string;
  otherAmount: string;
  description: string;
};

export type EditChargeState = {
  id: string;
  feeTypeId: string;
  amount: string;
  dueDate: string;
  billingMonth: string;
  periodStartDate: string;
  periodEndDate: string;
  periodChargeMode: string;
  status: string;
  targetName: string;
  description: string;
};
