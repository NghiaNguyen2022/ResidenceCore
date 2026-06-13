/**
 * Financial Management Page
 * Quản Lý Tài Chính - Phí Thu & Phí Trả
 */

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      TrendingDown,
      TrendingUp,
      Wallet,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
      AppCard,
      ErrorState,
      LoadingState,
      StatusBadge,
} from '@/components/shared';
import { FormSelect } from '@/components/shared';

function formatVND(amount?: number | null) {
      if (!amount) return '0';
      if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
      if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
      return String(amount);
}

function formatVNDFull(amount?: number | null) {
      if (!amount) return '0 đ';
      return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
      }).format(amount);
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: `Tháng ${i + 1}`,
}));

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1].map((y) => ({
      value: String(y),
      label: String(y),
}));

export default function Financial() {
      const now = new Date();
      const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
      const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
      const [activeTab, setActiveTab] = useState('overview');

      const month = parseInt(selectedMonth);
      const year = parseInt(selectedYear);

      const dashboardQuery = trpc.financial.getFinancialDashboardSummary.useQuery({ month, year });
      const overdueQuery = trpc.financial.getOverdueRevenues.useQuery();
      const feeTypesQuery = trpc.financial.getResidentFeeTypes.useQuery();
      const pendingExpensesQuery = trpc.financial.getExpensesByStatus.useQuery('submitted');
      const debtListQuery = trpc.financial.getDebtList.useQuery();

      const summary = dashboardQuery.data as any;
      const overdueList = (overdueQuery.data ?? []) as any[];
      const feeTypes = (feeTypesQuery.data ?? []) as any[];
      const pendingExpenses = (pendingExpensesQuery.data ?? []) as any[];
      const debtList = (debtListQuery.data ?? []) as any[];

      const totalRevenue = summary?.totalIncome ?? 0;
      const totalExpense = summary?.totalExpense ?? 0;
      const netBalance = summary?.netBalance ?? 0;

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6 p-6 max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                                          <Wallet className="h-6 w-6 text-blue-600" />
                                          Quản Lý Tài Chính
                                    </h1>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Quản lý phí thu và phí trả của lưu xá
                                    </p>
                              </div>

                              {/* Month/Year selector */}
                              <div className="flex gap-2">
                                    <FormSelect
                                          value={selectedMonth}
                                          onValueChange={setSelectedMonth}
                                          options={MONTHS}
                                          className="w-32"
                                    />
                                    <FormSelect
                                          value={selectedYear}
                                          onValueChange={setSelectedYear}
                                          options={YEARS}
                                          className="w-24"
                                    />
                              </div>
                        </div>

                        {/* Key Metrics */}
                        {dashboardQuery.isLoading ? (
                              <LoadingState message="Đang tải dữ liệu tài chính..." />
                        ) : dashboardQuery.isError ? (
                              <ErrorState
                                    message="Không thể tải dữ liệu tài chính."
                                    onRetry={() => dashboardQuery.refetch()}
                              />
                        ) : (
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <Card className="border-l-4 border-l-green-500 p-5">
                                          <div className="flex items-start justify-between">
                                                <div>
                                                      <p className="text-sm font-medium text-slate-500">Tổng Thu</p>
                                                      <p className="mt-1.5 text-2xl font-bold text-slate-900">
                                                            {formatVND(totalRevenue)}
                                                      </p>
                                                      <p className="mt-1 text-xs text-slate-400">
                                                            Tháng {selectedMonth}/{selectedYear}
                                                      </p>
                                                </div>
                                                <TrendingUp className="h-8 w-8 text-green-500" />
                                          </div>
                                    </Card>

                                    <Card className="border-l-4 border-l-red-500 p-5">
                                          <div className="flex items-start justify-between">
                                                <div>
                                                      <p className="text-sm font-medium text-slate-500">Tổng Chi</p>
                                                      <p className="mt-1.5 text-2xl font-bold text-slate-900">
                                                            {formatVND(totalExpense)}
                                                      </p>
                                                      <p className="mt-1 text-xs text-slate-400">
                                                            Tháng {selectedMonth}/{selectedYear}
                                                      </p>
                                                </div>
                                                <TrendingDown className="h-8 w-8 text-red-500" />
                                          </div>
                                    </Card>

                                    <Card className="border-l-4 border-l-blue-500 p-5">
                                          <div className="flex items-start justify-between">
                                                <div>
                                                      <p className="text-sm font-medium text-slate-500">Số Dư</p>
                                                      <p className="mt-1.5 text-2xl font-bold text-slate-900">
                                                            {formatVND(netBalance)}
                                                      </p>
                                                      <p className="mt-1 text-xs text-slate-400">
                                                            {totalRevenue > 0
                                                                  ? `${((netBalance / totalRevenue) * 100).toFixed(0)}% tỷ suất`
                                                                  : '—'}
                                                      </p>
                                                </div>
                                                <Wallet className="h-8 w-8 text-blue-500" />
                                          </div>
                                    </Card>

                                    <Card className="border-l-4 border-l-orange-500 p-5">
                                          <div className="flex items-start justify-between">
                                                <div>
                                                      <p className="text-sm font-medium text-slate-500">Cảnh Báo</p>
                                                      <div className="mt-1.5 space-y-1">
                                                            <p className="text-sm text-slate-700">
                                                                  <span className="font-semibold">{overdueList.length}</span>{' '}
                                                                  khoản quá hạn
                                                            </p>
                                                            <p className="text-sm text-yellow-700">
                                                                  <span className="font-semibold">
                                                                        {pendingExpenses.length}
                                                                  </span>{' '}
                                                                  chi phí chờ duyệt
                                                            </p>
                                                      </div>
                                                </div>
                                                <AlertCircle className="h-8 w-8 text-orange-500" />
                                          </div>
                                    </Card>
                              </div>
                        )}

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                              <TabsList>
                                    <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
                                    <TabsTrigger value="revenue">Phí Thu</TabsTrigger>
                                    <TabsTrigger value="expense">Phí Trả</TabsTrigger>
                                    <TabsTrigger value="debt">Nợ / Quá Hạn</TabsTrigger>
                              </TabsList>

                              {/* Overview */}
                              <TabsContent value="overview" className="space-y-4 pt-4">
                                    {dashboardQuery.isLoading ? (
                                          <LoadingState />
                                    ) : (
                                          <div className="grid gap-4 md:grid-cols-2">
                                                <AppCard title="Phí Thu">
                                                      <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                  <span className="text-slate-500">Phí lưu trú</span>
                                                                  <span className="font-medium">
                                                                        {formatVND(summary?.revenueStats?.roomFeeTotal)}
                                                                  </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                  <span className="text-slate-500">Phí ăn</span>
                                                                  <span className="font-medium">
                                                                        {formatVND(summary?.revenueStats?.mealFeeTotal)}
                                                                  </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                  <span className="text-slate-500">Phí sinh hoạt</span>
                                                                  <span className="font-medium">
                                                                        {formatVND(summary?.revenueStats?.activitiesFeeTotal)}
                                                                  </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                  <span className="text-slate-500">Phí khác</span>
                                                                  <span className="font-medium">
                                                                        {formatVND(summary?.revenueStats?.additionalFeeTotal)}
                                                                  </span>
                                                            </div>
                                                            <div className="border-t pt-2 flex justify-between font-semibold">
                                                                  <span>Tổng thu</span>
                                                                  <span className="text-green-700">
                                                                        {formatVND(summary?.totalIncome)}
                                                                  </span>
                                                            </div>
                                                      </div>
                                                </AppCard>

                                                <AppCard title="Phí Trả">
                                                      <div className="space-y-2 text-sm">
                                                            {summary?.expenseStats?.byCategory?.length > 0 ? (
                                                                  summary.expenseStats.byCategory.map((cat: any) => (
                                                                        <div key={cat.category} className="flex justify-between">
                                                                              <span className="text-slate-500">
                                                                                    {cat.category}
                                                                              </span>
                                                                              <span className="font-medium">
                                                                                    {formatVND(cat.total)}
                                                                              </span>
                                                                        </div>
                                                                  ))
                                                            ) : (
                                                                  <p className="text-slate-400">Chưa có dữ liệu</p>
                                                            )}
                                                            <div className="border-t pt-2 flex justify-between font-semibold">
                                                                  <span>Tổng chi</span>
                                                                  <span className="text-red-700">
                                                                        {formatVND(summary?.totalExpense)}
                                                                  </span>
                                                            </div>
                                                      </div>
                                                </AppCard>
                                          </div>
                                    )}
                              </TabsContent>

                              {/* Revenue */}
                              <TabsContent value="revenue" className="space-y-4 pt-4">
                                    <AppCard title="Loại Phí">
                                          {feeTypesQuery.isLoading ? (
                                                <LoadingState size="sm" />
                                          ) : feeTypes.length === 0 ? (
                                                <p className="text-sm text-slate-400">Chưa có loại phí nào.</p>
                                          ) : (
                                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                      {feeTypes.map((ft: any) => (
                                                            <div
                                                                  key={ft.id}
                                                                  className="rounded-lg border border-slate-200 p-3"
                                                            >
                                                                  <p className="font-medium text-slate-900">{ft.name}</p>
                                                                  <p className="mt-1 text-lg font-bold text-blue-700">
                                                                        {formatVNDFull(
                                                                              (ft.roomFee || 0) +
                                                                                    (ft.mealFee || 0) +
                                                                                    (ft.activitiesFee || 0)
                                                                        )}
                                                                        <span className="text-xs font-normal text-slate-500">
                                                                              {' '}/ tháng
                                                                        </span>
                                                                  </p>
                                                                  <p className="mt-1 text-xs text-slate-500">
                                                                        Ở: {formatVNDFull(ft.roomFee)} · Ăn:{' '}
                                                                        {formatVNDFull(ft.mealFee)} · Sinh hoạt:{' '}
                                                                        {formatVNDFull(ft.activitiesFee)}
                                                                  </p>
                                                            </div>
                                                      ))}
                                                </div>
                                          )}
                                    </AppCard>
                              </TabsContent>

                              {/* Expense */}
                              <TabsContent value="expense" className="space-y-4 pt-4">
                                    <AppCard title="Chi Phí Chờ Duyệt">
                                          {pendingExpensesQuery.isLoading ? (
                                                <LoadingState size="sm" />
                                          ) : pendingExpenses.length === 0 ? (
                                                <p className="text-sm text-slate-400">Không có chi phí nào chờ duyệt.</p>
                                          ) : (
                                                <div className="divide-y">
                                                      {pendingExpenses.map((exp: any) => (
                                                            <div
                                                                  key={exp.id}
                                                                  className="flex items-center justify-between py-3"
                                                            >
                                                                  <div>
                                                                        <p className="font-medium text-slate-900">
                                                                              {exp.description}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500">
                                                                              {exp.department} ·{' '}
                                                                              {new Date(exp.expenseDate).toLocaleDateString(
                                                                                    'vi-VN'
                                                                              )}
                                                                        </p>
                                                                  </div>
                                                                  <div className="text-right">
                                                                        <p className="font-semibold text-yellow-700">
                                                                              {formatVNDFull(exp.amount)}
                                                                        </p>
                                                                        <StatusBadge tone="warning">Chờ duyệt</StatusBadge>
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>
                                          )}
                                    </AppCard>
                              </TabsContent>

                              {/* Debt */}
                              <TabsContent value="debt" className="space-y-4 pt-4">
                                    <AppCard title="Khoản Quá Hạn / Nợ">
                                          {overdueQuery.isLoading ? (
                                                <LoadingState size="sm" />
                                          ) : overdueList.length === 0 ? (
                                                <p className="text-sm text-slate-400">
                                                      Không có khoản nào quá hạn.
                                                </p>
                                          ) : (
                                                <div className="divide-y">
                                                      {overdueList.map((rev: any) => (
                                                            <div
                                                                  key={rev.id}
                                                                  className="flex items-center justify-between py-3"
                                                            >
                                                                  <div>
                                                                        <p className="font-medium text-slate-900">
                                                                              {rev.residentName || `Học viên #${rev.residentId}`}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500">
                                                                              Tháng {rev.month}/{rev.year} · Hạn:{' '}
                                                                              {new Date(rev.dueDate).toLocaleDateString('vi-VN')}
                                                                        </p>
                                                                  </div>
                                                                  <div className="text-right">
                                                                        <p className="font-semibold text-red-700">
                                                                              {formatVNDFull(rev.remainingAmount ?? rev.totalAmount)}
                                                                        </p>
                                                                        <StatusBadge tone="danger">Quá hạn</StatusBadge>
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>
                                          )}
                                    </AppCard>
                              </TabsContent>
                        </Tabs>
                  </div>
            </ResidenceCareLayout>
      );
}
