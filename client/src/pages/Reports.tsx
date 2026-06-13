'use client';

import { useState } from 'react';
import {
      Activity,
      BarChart3,
      Building2,
      CalendarDays,
      CheckCircle2,
      DollarSign,
      TrendingDown,
      TrendingUp,
      Users,
      Zap,
} from 'lucide-react';
import { format } from 'date-fns';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { AppSection, ErrorState, FormSelect, LoadingState } from '@/components/shared';

const MONTHS = [
      { value: '1', label: 'Tháng 1' }, { value: '2', label: 'Tháng 2' },
      { value: '3', label: 'Tháng 3' }, { value: '4', label: 'Tháng 4' },
      { value: '5', label: 'Tháng 5' }, { value: '6', label: 'Tháng 6' },
      { value: '7', label: 'Tháng 7' }, { value: '8', label: 'Tháng 8' },
      { value: '9', label: 'Tháng 9' }, { value: '10', label: 'Tháng 10' },
      { value: '11', label: 'Tháng 11' }, { value: '12', label: 'Tháng 12' },
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1].map((y) => ({
      value: String(y),
      label: String(y),
}));

function formatVND(amount: number | string | null | undefined) {
      const n = Number(amount ?? 0);
      if (isNaN(n)) return '0 đ';
      if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M đ`;
      if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K đ`;
      return `${n.toLocaleString('vi-VN')} đ`;
}

function StatBlock({
      label,
      value,
      sub,
      icon,
      tone = 'default',
}: {
      label: string;
      value: string | number;
      sub?: string;
      icon: React.ReactNode;
      tone?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}) {
      const colors: Record<string, string> = {
            default: 'bg-slate-50 text-slate-600',
            success: 'bg-green-50 text-green-600',
            danger: 'bg-red-50 text-red-600',
            warning: 'bg-amber-50 text-amber-600',
            info: 'bg-blue-50 text-blue-600',
      };
      return (
            <div className="flex items-start gap-4 rounded-xl border bg-white p-5 shadow-sm">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors[tone]}`}>
                        {icon}
                  </div>
                  <div className="min-w-0">
                        <p className="truncate text-sm text-slate-500">{label}</p>
                        <p className="text-2xl font-bold text-slate-900">{value}</p>
                        {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
                  </div>
            </div>
      );
}

export default function Reports() {
      const now = new Date();
      const [month, setMonth] = useState(now.getMonth() + 1);
      const [year, setYear] = useState(now.getFullYear());

      const dashboardQuery = trpc.dashboard.getFullDashboard.useQuery();
      const roomsStatsQuery = trpc.rooms.getStats.useQuery();
      const activitiesStatsQuery = trpc.activities.getStats.useQuery();
      const financialQuery = trpc.financial.getFinancialDashboardSummary.useQuery(
            { month, year },
            { keepPreviousData: true } as any
      );

      const residentsStats = dashboardQuery.data?.residents;
      const actStats = activitiesStatsQuery.data as any;
      const roomStats = roomsStatsQuery.data as any;
      const fin = financialQuery.data as any;

      return (
            <ResidenceCareLayout>
                  <div className="space-y-8">
                        {/* Header */}
                        <div>
                              <h1 className="text-2xl font-bold text-slate-900">Báo cáo & Thống kê</h1>
                              <p className="mt-1 text-sm text-slate-500">
                                    Tổng quan hoạt động lưu xá — cập nhật theo thời gian thực
                              </p>
                        </div>

                        {/* Học viên */}
                        <AppSection title={<span className="flex items-center gap-2"><Users className="h-4 w-4" />Học viên</span>}>
                              {dashboardQuery.isLoading ? (
                                    <LoadingState size="sm" />
                              ) : dashboardQuery.isError ? (
                                    <ErrorState message="Không thể tải dữ liệu học viên" onRetry={() => dashboardQuery.refetch()} />
                              ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                          <StatBlock label="Tổng học viên" value={residentsStats?.total ?? 0} icon={<Users className="h-5 w-5" />} tone="info" />
                                          <StatBlock label="Đang lưu trú" value={residentsStats?.active ?? 0} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
                                          <StatBlock label="Nghỉ / tạm vắng" value={residentsStats?.inactive ?? 0} icon={<TrendingDown className="h-5 w-5" />} tone="warning" />
                                          <StatBlock label="Đã xuất" value={residentsStats?.transferred_out ?? 0} icon={<TrendingUp className="h-5 w-5" />} tone="default" />
                                    </div>
                              )}
                        </AppSection>

                        {/* Phòng ở */}
                        <AppSection title={<span className="flex items-center gap-2"><Building2 className="h-4 w-4" />Phòng ở</span>}>
                              {roomsStatsQuery.isLoading ? (
                                    <LoadingState size="sm" />
                              ) : roomsStatsQuery.isError ? (
                                    <ErrorState message="Không thể tải dữ liệu phòng" onRetry={() => roomsStatsQuery.refetch()} />
                              ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                          <StatBlock label="Tổng phòng" value={roomStats?.totalRooms ?? 0} icon={<Building2 className="h-5 w-5" />} tone="info" />
                                          <StatBlock label="Đang sử dụng" value={roomStats?.occupiedRooms ?? 0} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
                                          <StatBlock label="Còn trống" value={roomStats?.emptyRooms ?? 0} icon={<Building2 className="h-5 w-5" />} tone="default" />
                                          <StatBlock
                                                label="Tỉ lệ lấp đầy"
                                                value={roomStats?.totalRooms ? `${Math.round((roomStats.occupiedRooms / roomStats.totalRooms) * 100)}%` : '—'}
                                                icon={<BarChart3 className="h-5 w-5" />}
                                                tone="info"
                                          />
                                    </div>
                              )}
                        </AppSection>

                        {/* Hoạt động */}
                        <AppSection title={<span className="flex items-center gap-2"><Activity className="h-4 w-4" />Hoạt động</span>}>
                              {activitiesStatsQuery.isLoading ? (
                                    <LoadingState size="sm" />
                              ) : activitiesStatsQuery.isError ? (
                                    <ErrorState message="Không thể tải dữ liệu hoạt động" onRetry={() => activitiesStatsQuery.refetch()} />
                              ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                          <StatBlock label="Tổng hoạt động" value={actStats?.total ?? 0} icon={<Activity className="h-5 w-5" />} tone="info" />
                                          <StatBlock label="Đã lên kế hoạch" value={actStats?.scheduled ?? 0} icon={<CalendarDays className="h-5 w-5" />} tone="default" />
                                          <StatBlock label="Đang diễn ra" value={actStats?.inProgress ?? 0} icon={<Zap className="h-5 w-5" />} tone="warning" />
                                          <StatBlock label="Đã hoàn thành" value={actStats?.completed ?? 0} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
                                    </div>
                              )}
                        </AppSection>

                        {/* Tài chính */}
                        <AppSection
                              title={<span className="flex items-center gap-2"><DollarSign className="h-4 w-4" />Tài chính</span>}
                              action={
                                    <div className="flex gap-2">
                                          <FormSelect
                                                value={String(month)}
                                                onValueChange={(v) => setMonth(Number(v))}
                                                options={MONTHS}
                                                className="w-32"
                                          />
                                          <FormSelect
                                                value={String(year)}
                                                onValueChange={(v) => setYear(Number(v))}
                                                options={YEARS}
                                                className="w-24"
                                          />
                                    </div>
                              }
                        >
                              {financialQuery.isLoading ? (
                                    <LoadingState size="sm" />
                              ) : financialQuery.isError ? (
                                    <ErrorState message="Không thể tải dữ liệu tài chính" onRetry={() => financialQuery.refetch()} />
                              ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                          <StatBlock
                                                label="Tổng thu"
                                                value={formatVND(fin?.totalRevenue ?? fin?.revenue?.total ?? 0)}
                                                sub={`Tháng ${month}/${year}`}
                                                icon={<TrendingUp className="h-5 w-5" />}
                                                tone="success"
                                          />
                                          <StatBlock
                                                label="Tổng chi"
                                                value={formatVND(fin?.totalExpense ?? fin?.expense?.total ?? 0)}
                                                sub={`Tháng ${month}/${year}`}
                                                icon={<TrendingDown className="h-5 w-5" />}
                                                tone="danger"
                                          />
                                          <StatBlock
                                                label="Số dư"
                                                value={formatVND(
                                                      (Number(fin?.totalRevenue ?? fin?.revenue?.total ?? 0)) -
                                                      (Number(fin?.totalExpense ?? fin?.expense?.total ?? 0))
                                                )}
                                                sub={`Tháng ${month}/${year}`}
                                                icon={<DollarSign className="h-5 w-5" />}
                                                tone="info"
                                          />
                                          <StatBlock
                                                label="Học viên nợ phí"
                                                value={fin?.overdueCount ?? fin?.overdue?.count ?? 0}
                                                sub="Cần theo dõi"
                                                icon={<Users className="h-5 w-5" />}
                                                tone="warning"
                                          />
                                    </div>
                              )}
                        </AppSection>

                        <p className="text-right text-xs text-slate-400">
                              Cập nhật lúc {format(new Date(), 'HH:mm dd/MM/yyyy')}
                        </p>
                  </div>
            </ResidenceCareLayout>
      );
}
