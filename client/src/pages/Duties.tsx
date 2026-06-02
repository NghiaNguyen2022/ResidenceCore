'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      CheckCircle2,
      ClipboardList,
      Edit2,
      Plus,
      RefreshCw,
      Search,
      Trash2,
      Users,
      X,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import DutyConfigForm from '@/components/DutyConfigForm';
import DutyRotation from '@/components/DutyRotation';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { ConfigurableStatCard } from '@/components/configurable/ConfigurableStatCard';

interface DutyConfig {
      id: number;
      dutyCode: string;
      dutyName: string;
      description?: string | null;
      dutyType: 'daily' | 'weekly' | 'monthly';
      startTime?: string | null;
      endTime?: string | null;
      minPersons: number;
      maxPersons: number;
      frequency: 'daily' | 'weekly' | 'monthly';
      dayOfWeek?: number | null;
      requiresStudyScheduleCheck: boolean;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
}

interface DutyStats {
      totalDuties: number;
      completedCount: number;
      pendingCount: number;
      skippedCount: number;
}

function getDutyTypeLabel(type: DutyConfig['dutyType']) {
      if (type === 'daily') return 'Hàng ngày';
      if (type === 'weekly') return 'Hàng tuần';
      return 'Hàng tháng';
}

function getDutyTypeClass(type: DutyConfig['dutyType']) {
      if (type === 'daily') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (type === 'weekly') return 'border-violet-200 bg-violet-50 text-violet-700';
      return 'border-orange-200 bg-orange-50 text-orange-700';
}

function formatTimeRange(startTime?: string | null, endTime?: string | null) {
      if (startTime && endTime) return `${startTime} - ${endTime}`;
      if (startTime) return `Từ ${startTime}`;
      if (endTime) return `Đến ${endTime}`;

      return 'Chưa thiết lập';
}

function formatDayOfWeek(dayOfWeek?: number | null) {
      if (dayOfWeek === null || dayOfWeek === undefined) return 'Theo tần suất';

      const labels: Record<number, string> = {
            0: 'Chủ Nhật',
            1: 'Thứ Hai',
            2: 'Thứ Ba',
            3: 'Thứ Tư',
            4: 'Thứ Năm',
            5: 'Thứ Sáu',
            6: 'Thứ Bảy',
      };

      return labels[dayOfWeek] || 'Theo tần suất';
}

function normalizeText(value?: string | null) {
      return (value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
}

function DutiesPageContent() {
      const [search, setSearch] = useState('');
      const [dutyTypeFilter, setDutyTypeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>(
            'all'
      );
      const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [showRotation, setShowRotation] = useState(false);
      const [selectedDuty, setSelectedDuty] = useState<DutyConfig | null>(null);
      const [pageError, setPageError] = useState<string | null>(null);

      const listDutiesQuery = trpc.duties.listConfigs.useQuery({ isActive: true });
      const getDutyStatsQuery = trpc.duties.getDutyStats.useQuery({});
      const deleteDutyMutation = trpc.duties.deleteConfig.useMutation();

      const duties = useMemo(() => {
            return ((listDutiesQuery.data || []) as DutyConfig[]).slice();
      }, [listDutiesQuery.data]);

      const stats = useMemo<DutyStats>(() => {
            return (
                  (getDutyStatsQuery.data as DutyStats | undefined) || {
                        totalDuties: 0,
                        completedCount: 0,
                        pendingCount: 0,
                        skippedCount: 0,
                  }
            );
      }, [getDutyStatsQuery.data]);

      const filteredDuties = useMemo(() => {
            const keyword = normalizeText(search);

            return duties
                  .filter((duty) => {
                        if (dutyTypeFilter !== 'all' && duty.dutyType !== dutyTypeFilter) {
                              return false;
                        }

                        if (!keyword) return true;

                        const haystack = [
                              duty.dutyCode,
                              duty.dutyName,
                              duty.description,
                              getDutyTypeLabel(duty.dutyType),
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => a.dutyName.localeCompare(b.dutyName, 'vi'));
      }, [duties, search, dutyTypeFilter]);

      const refreshData = () => {
            listDutiesQuery.refetch();
            getDutyStatsQuery.refetch();
      };

      const handleDelete = async (id: number) => {
            if (!confirm('Bạn chắc chắn muốn xóa công tác này?')) return;

            try {
                  setPageError(null);
                  await deleteDutyMutation.mutateAsync({ id });
                  refreshData();
            } catch (error) {
                  console.error('Error deleting duty:', error);
                  setPageError('Không thể xóa công tác. Vui lòng thử lại hoặc kiểm tra dữ liệu liên quan.');
            }
      };

      const handleEditClick = (duty: DutyConfig) => {
            setSelectedDuty(duty);
            setIsEditDialogOpen(true);
      };

      const handleFormSave = () => {
            refreshData();
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedDuty(null);
            setPageError(null);
      };

      const handleFormCancel = () => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedDuty(null);
      };

      const handleRotationSuccess = () => {
            refreshData();
            setPageError(null);
      };

      const clearFilters = () => {
            setSearch('');
            setDutyTypeFilter('all');
      };

      const isLoading = listDutiesQuery.isLoading || getDutyStatsQuery.isLoading;
      const errorMessage =
            pageError ||
            listDutiesQuery.error?.message ||
            getDutyStatsQuery.error?.message ||
            null;

      return (
            <div className="space-y-6 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                              <p className="text-sm font-semibold text-blue-600">
                                    Sinh hoạt & Đời sống
                              </p>
                              <h1 className="mt-1 text-3xl font-bold text-neutral-900">
                                    Công tác / Trực nhật
                              </h1>
                              <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                    Quản lý danh mục công tác, checklist thực hiện và chia công tác định kỳ cho học viên.
                              </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                              <button
                                    type="button"
                                    onClick={() => setShowRotation(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
                              >
                                    <RefreshCw className="h-4 w-4" />
                                    Chia công tác
                              </button>

                              <button
                                    type="button"
                                    onClick={() => {
                                          setSelectedDuty(null);
                                          setIsAddDialogOpen(true);
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm công tác
                              </button>
                        </div>
                  </div>

                  {errorMessage && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                              <div className="flex gap-3">
                                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                    <div>
                                          <p className="font-semibold">Có lỗi khi xử lý công tác.</p>
                                          <p className="mt-1 text-sm">{errorMessage}</p>
                                    </div>
                              </div>
                        </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <ConfigurableStatCard
                              moduleKey="duties"
                              cardKey="duties.totalDuties"
                              label="Tổng công tác"
                              value={stats.totalDuties}
                              description="Tất cả công tác đang quản lý"
                              tone="blue"
                              icon={<ClipboardList className="h-6 w-6" />}
                        />

                        <ConfigurableStatCard
                              moduleKey="duties"
                              cardKey="duties.completedCount"
                              label="Hoàn thành"
                              value={stats.completedCount}
                              description="Công tác đã hoàn thành"
                              tone="green"
                              icon={<CheckCircle2 className="h-6 w-6" />}
                        />

                        <ConfigurableStatCard
                              moduleKey="duties"
                              cardKey="duties.pendingCount"
                              label="Chưa làm"
                              value={stats.pendingCount}
                              description="Công tác cần tiếp tục theo dõi"
                              tone="orange"
                              icon={<Users className="h-6 w-6" />}
                        />

                        <ConfigurableStatCard
                              moduleKey="duties"
                              cardKey="duties.skippedCount"
                              label="Bỏ / Hủy"
                              value={stats.skippedCount}
                              description="Công tác bị bỏ hoặc hủy"
                              tone="purple"
                              icon={<RefreshCw className="h-6 w-6" />}
                        />
                  </div>

                  <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px_auto]">
                              <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <input
                                          type="text"
                                          placeholder="Tìm kiếm mã, tên hoặc mô tả công tác..."
                                          value={search}
                                          onChange={(event) => setSearch(event.target.value)}
                                          className="h-10 w-full rounded-md border border-neutral-300 bg-white px-4 pl-10 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                              </div>

                              <select
                                    value={dutyTypeFilter}
                                    onChange={(event) =>
                                          setDutyTypeFilter(event.target.value as typeof dutyTypeFilter)
                                    }
                                    className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              >
                                    <option value="all">Tất cả loại</option>
                                    <option value="daily">Hàng ngày</option>
                                    <option value="weekly">Hàng tuần</option>
                                    <option value="monthly">Hàng tháng</option>
                              </select>

                              <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                              >
                                    Xóa lọc
                              </button>
                        </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-2 border-b border-neutral-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                              <div>
                                    <h2 className="text-lg font-bold text-neutral-900">
                                          Danh sách công tác
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                          Có thể tạo công tác mới từ mẫu, cấu hình checklist và chia công tác định kỳ.
                                    </p>
                              </div>

                              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                    {filteredDuties.length} công tác
                              </span>
                        </div>

                        <div className="overflow-x-auto">
                              <table className="w-full min-w-[980px]">
                                    <thead className="bg-slate-50">
                                          <tr>
                                                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                                      Công tác
                                                </th>
                                                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                                      Loại
                                                </th>
                                                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                                      Thời gian
                                                </th>
                                                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                                      Số người
                                                </th>
                                                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                                      Tần suất
                                                </th>
                                                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                                      Trạng thái
                                                </th>
                                                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-600">
                                                      Hành động
                                                </th>
                                          </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                          {isLoading ? (
                                                <tr>
                                                      <td
                                                            colSpan={7}
                                                            className="px-5 py-10 text-center text-sm text-slate-500"
                                                      >
                                                            Đang tải danh sách công tác...
                                                      </td>
                                                </tr>
                                          ) : filteredDuties.length > 0 ? (
                                                filteredDuties.map((duty) => (
                                                      <tr
                                                            key={duty.id}
                                                            className="transition hover:bg-slate-50/80"
                                                      >
                                                            <td className="px-5 py-4">
                                                                  <div>
                                                                        <p className="font-semibold text-slate-900">
                                                                              {duty.dutyName}
                                                                        </p>
                                                                        <p className="mt-1 font-mono text-xs text-slate-500">
                                                                              {duty.dutyCode}
                                                                        </p>
                                                                        {duty.description && (
                                                                              <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                                                                    {duty.description}
                                                                              </p>
                                                                        )}
                                                                  </div>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                  <span
                                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getDutyTypeClass(
                                                                              duty.dutyType
                                                                        )}`}
                                                                  >
                                                                        {getDutyTypeLabel(duty.dutyType)}
                                                                  </span>
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                                  {formatTimeRange(duty.startTime, duty.endTime)}
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                                  {duty.minPersons} - {duty.maxPersons} người
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                                  <div>{getDutyTypeLabel(duty.frequency)}</div>
                                                                  <p className="mt-1 text-xs text-slate-500">
                                                                        {formatDayOfWeek(duty.dayOfWeek)}
                                                                  </p>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                  <span
                                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                                                              duty.isActive
                                                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                                                    : 'border-slate-200 bg-slate-50 text-slate-600'
                                                                        }`}
                                                                  >
                                                                        {duty.isActive
                                                                              ? 'Hoạt động'
                                                                              : 'Không hoạt động'}
                                                                  </span>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                  <div className="flex justify-end gap-1.5">
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => handleEditClick(duty)}
                                                                              className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                                              title="Sửa công tác"
                                                                        >
                                                                              <Edit2 className="h-4 w-4" />
                                                                        </button>

                                                                        <button
                                                                              type="button"
                                                                              onClick={() => handleDelete(duty.id)}
                                                                              className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                                                              title="Xóa công tác"
                                                                              disabled={deleteDutyMutation.isPending}
                                                                        >
                                                                              <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                  </div>
                                                            </td>
                                                      </tr>
                                                ))
                                          ) : (
                                                <tr>
                                                      <td
                                                            colSpan={7}
                                                            className="px-5 py-10 text-center"
                                                      >
                                                            <p className="font-semibold text-slate-700">
                                                                  Không có công tác phù hợp
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  Thử thay đổi bộ lọc hoặc thêm công tác mới.
                                                            </p>
                                                      </td>
                                                </tr>
                                          )}
                                    </tbody>
                              </table>
                        </div>
                  </div>

                  {isAddDialogOpen && (
                        <DutyDialog title="Thêm công tác mới" onClose={handleFormCancel}>
                              <DutyConfigForm onSave={handleFormSave} onCancel={handleFormCancel} />
                        </DutyDialog>
                  )}

                  {isEditDialogOpen && selectedDuty && (
                        <DutyDialog title="Cập nhật công tác" onClose={handleFormCancel}>
                              <DutyConfigForm
                                    duty={selectedDuty}
                                    onSave={handleFormSave}
                                    onCancel={handleFormCancel}
                              />
                        </DutyDialog>
                  )}

                  {showRotation && (
                        <DutyRotation
                              onClose={() => setShowRotation(false)}
                              onSuccess={handleRotationSuccess}
                        />
                  )}
            </div>
      );
}

function DutyDialog({
      title,
      children,
      onClose,
}: {
      title: string;
      children: React.ReactNode;
      onClose: () => void;
}) {
      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                          Có thể cấu hình thông tin cơ bản, chọn công tác mẫu và danh sách công việc cần hoàn thành.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg p-2 transition hover:bg-neutral-100"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <div className="p-6">{children}</div>
                  </div>
            </div>
      );
}

export default function DutiesPage() {
      return (
            <ResidenceCareLayout>
                  <DutiesPageContent />
            </ResidenceCareLayout>
      );
}
