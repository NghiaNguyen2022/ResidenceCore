'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      CalendarDays,
      CheckCircle2,
      Clock,
      Edit2,
      Plus,
      Power,
      Search,
      Trash2,
      X,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfigurableStatCard } from '@/components/configurable/ConfigurableStatCard';
import {
      ConfigurableColumn,
      ConfigurableDataTable,
} from '@/components/configurable/ConfigurableDataTable';

type TermStatus = 'active' | 'inactive' | 'closed';

type OrganizationTerm = {
      id: number;
      code: string;
      name: string;
      startDate: string | Date;
      endDate: string | Date;
      status: TermStatus;
      description?: string | null;
      assignedCount?: number;
};

type TermFormData = {
      code: string;
      name: string;
      startDate: string;
      endDate: string;
      status: TermStatus;
      description: string;
};

const defaultFormData: TermFormData = {
      code: '',
      name: '',
      startDate: '',
      endDate: '',
      status: 'inactive',
      description: '',
};

function normalizeText(value?: string | null) {
      return (value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
}

function normalizeTermCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}

function getStatusLabel(status: TermStatus) {
      if (status === 'active') return 'Đang hoạt động';
      if (status === 'closed') return 'Đã kết thúc';
      return 'Chưa kích hoạt';
}

function getStatusClass(status: TermStatus) {
      if (status === 'active') {
            return 'border-green-200 bg-green-50 text-green-700';
      }

      if (status === 'closed') {
            return 'border-neutral-200 bg-neutral-100 text-neutral-700';
      }

      return 'border-orange-200 bg-orange-50 text-orange-700';
}

function toInputDateValue(date?: string | Date | null) {
      if (!date) return '';

      try {
            return new Date(date).toISOString().split('T')[0];
      } catch {
            return '';
      }
}

function formatDate(date?: string | Date | null) {
      if (!date) return '-';

      try {
            return new Date(date).toLocaleDateString('vi-VN');
      } catch {
            return '-';
      }
}

function validateTermForm({
      terms,
      formData,
      editingId,
}: {
      terms: OrganizationTerm[];
      formData: TermFormData;
      editingId?: number;
}) {
      const code = normalizeTermCode(formData.code);
      const name = normalizeText(formData.name);

      if (!code) return 'Vui lòng nhập mã nhiệm kỳ.';
      if (!name) return 'Vui lòng nhập tên nhiệm kỳ.';
      if (!formData.startDate) return 'Vui lòng chọn ngày bắt đầu.';
      if (!formData.endDate) return 'Vui lòng chọn ngày kết thúc.';

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            return 'Ngày nhiệm kỳ không hợp lệ.';
      }

      if (endDate <= startDate) {
            return 'Ngày kết thúc phải lớn hơn ngày bắt đầu.';
      }

      const otherTerms = terms.filter((term) => term.id !== editingId);

      const duplicatedCode = otherTerms.some(
            (term) => normalizeText(term.code) === normalizeText(code)
      );

      if (duplicatedCode) {
            return 'Mã nhiệm kỳ đã tồn tại. Vui lòng nhập mã khác.';
      }

      const duplicatedName = otherTerms.some(
            (term) => normalizeText(term.name) === name
      );

      if (duplicatedName) {
            return 'Tên nhiệm kỳ đã tồn tại. Vui lòng nhập tên khác.';
      }

      if (
            formData.status === 'active' &&
            otherTerms.some((term) => term.status === 'active')
      ) {
            return 'Chỉ được có một nhiệm kỳ đang hoạt động. Vui lòng đóng hoặc ngưng nhiệm kỳ hiện tại trước.';
      }

      return null;
}

export default function OrganizationTerms() {
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState<'all' | TermStatus>('all');

      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingTerm, setEditingTerm] = useState<OrganizationTerm | null>(null);
      const [formData, setFormData] = useState<TermFormData>(defaultFormData);
      const [error, setError] = useState<string | null>(null);

      const termsQuery = trpc.organization.listTerms.useQuery({
            search: searchTerm || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            limit: 500,
            offset: 0,
      });

      const createTermMutation = trpc.organization.createTerm.useMutation();
      const updateTermMutation = trpc.organization.updateTerm.useMutation();
      const deleteTermMutation = trpc.organization.deleteTerm.useMutation();
      const setActiveTermMutation = trpc.organization.setActiveTerm.useMutation();

      const terms = (termsQuery.data || []) as OrganizationTerm[];

      const stats = useMemo(() => {
            return {
                  total: terms.length,
                  active: terms.filter((term) => term.status === 'active').length,
                  inactive: terms.filter((term) => term.status === 'inactive').length,
                  closed: terms.filter((term) => term.status === 'closed').length,
            };
      }, [terms]);

      const refetchTerms = () => {
            termsQuery.refetch();
      };

      const openCreateForm = () => {
            setEditingTerm(null);
            setFormData(defaultFormData);
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (term: OrganizationTerm) => {
            setEditingTerm(term);
            setFormData({
                  code: term.code || '',
                  name: term.name || '',
                  startDate: toInputDateValue(term.startDate),
                  endDate: toInputDateValue(term.endDate),
                  status: term.status || 'inactive',
                  description: term.description || '',
            });
            setError(null);
            setIsFormOpen(true);
      };

      const closeForm = () => {
            setIsFormOpen(false);
            setEditingTerm(null);
            setFormData(defaultFormData);
            setError(null);
      };

      const handleSave = async () => {
            const validationMessage = validateTermForm({
                  terms,
                  formData,
                  editingId: editingTerm?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const payload = {
                  code: normalizeTermCode(formData.code),
                  name: formData.name.trim(),
                  startDate: formData.startDate,
                  endDate: formData.endDate,
                  status: formData.status,
                  description: formData.description.trim() || null,
            };

            try {
                  if (editingTerm) {
                        await updateTermMutation.mutateAsync({
                              id: editingTerm.id,
                              ...payload,
                        });
                  } else {
                        await createTermMutation.mutateAsync(payload);
                  }

                  closeForm();
                  refetchTerms();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi lưu nhiệm kỳ tổ chức.');
            }
      };

      const handleDelete = async (term: OrganizationTerm) => {
            if ((term.assignedCount || 0) > 0) {
                  alert(
                        'Không thể xóa nhiệm kỳ đã có cơ cấu tổ chức. Bạn có thể chuyển trạng thái sang Đã kết thúc.'
                  );
                  return;
            }

            if (!confirm(`Bạn có chắc chắn muốn xóa nhiệm kỳ "${term.name}"?`)) {
                  return;
            }

            try {
                  await deleteTermMutation.mutateAsync({ id: term.id });
                  refetchTerms();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi xóa nhiệm kỳ tổ chức.');
            }
      };

      const handleSetActive = async (term: OrganizationTerm) => {
            if (term.status === 'active') return;

            const confirmed = confirm(
                  `Bạn có muốn đặt "${term.name}" làm nhiệm kỳ đang hoạt động không?`
            );

            if (!confirmed) return;

            try {
                  await setActiveTermMutation.mutateAsync({ id: term.id });
                  refetchTerms();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi kích hoạt nhiệm kỳ.');
            }
      };

      const clearFilters = () => {
            setSearchTerm('');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<OrganizationTerm>[]>(
            () => [
                  {
                        key: 'term',
                        label: 'Nhiệm kỳ',
                        sortable: true,
                        sortValue: (term) => term.name,
                        render: (term) => (
                              <div>
                                    <p className="font-semibold text-neutral-900">{term.name}</p>
                                    <p className="mt-1 font-mono text-xs text-neutral-500">
                                          {term.code}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'startDate',
                        label: 'Ngày bắt đầu',
                        sortable: true,
                        sortValue: (term) => new Date(term.startDate).getTime(),
                        render: (term) => formatDate(term.startDate),
                  },
                  {
                        key: 'endDate',
                        label: 'Ngày kết thúc',
                        sortable: true,
                        sortValue: (term) => new Date(term.endDate).getTime(),
                        render: (term) => formatDate(term.endDate),
                  },
                  {
                        key: 'assignedCount',
                        label: 'Nhân sự',
                        sortable: true,
                        sortValue: (term) => term.assignedCount || 0,
                        render: (term) => (
                              <span className="font-semibold text-neutral-800">
                                    {term.assignedCount || 0}
                              </span>
                        ),
                  },
                  {
                        key: 'status',
                        label: 'Trạng thái',
                        sortable: true,
                        sortValue: (term) => getStatusLabel(term.status),
                        render: (term) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                          term.status
                                    )}`}
                              >
                                    {getStatusLabel(term.status)}
                              </span>
                        ),
                  },
                  {
                        key: 'description',
                        label: 'Ghi chú',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (term) => term.description || '',
                        render: (term) => term.description || '-',
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[220px]',
                        render: (term) => (
                              <div className="flex flex-wrap items-center gap-1.5">
                                    {term.status !== 'active' && (
                                          <button
                                                type="button"
                                                onClick={() => handleSetActive(term)}
                                                disabled={setActiveTermMutation.isPending}
                                                className="rounded-lg px-2 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                title="Đặt làm nhiệm kỳ đang hoạt động"
                                          >
                                                Kích hoạt
                                          </button>
                                    )}

                                    <button
                                          type="button"
                                          onClick={() => openEditForm(term)}
                                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                          title="Sửa nhiệm kỳ"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => handleDelete(term)}
                                          disabled={deleteTermMutation.isPending}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                          title="Xóa nhiệm kỳ"
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              </div>
                        ),
                  },
            ],
            [terms, setActiveTermMutation.isPending, deleteTermMutation.isPending]
      );

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                    <p className="text-sm font-semibold text-blue-600">
                                          Tổ chức lưu xá
                                    </p>
                                    <h1 className="mt-1 text-3xl font-bold text-neutral-900">
                                          Nhiệm kỳ tổ chức
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Quản lý các nhiệm kỳ tổ chức của lưu xá, làm cơ sở để phân công
                                          vai trò, theo dõi cơ cấu phụ trách và lưu lại lịch sử tổ chức theo
                                          từng giai đoạn.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm nhiệm kỳ
                              </button>
                        </div>

                        {(error || termsQuery.error) && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">Có lỗi khi xử lý nhiệm kỳ.</p>
                                                <p className="mt-1 text-sm">
                                                      {error ||
                                                            termsQuery.error?.message ||
                                                            'Vui lòng kiểm tra lại dữ liệu nhiệm kỳ.'}
                                                </p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.terms.total"
                                    label="Tổng nhiệm kỳ"
                                    value={stats.total}
                                    description="Tổng số nhiệm kỳ đã khai báo"
                                    tone="blue"
                                    icon={<CalendarDays className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.terms.active"
                                    label="Đang hoạt động"
                                    value={stats.active}
                                    description="Nhiệm kỳ đang được sử dụng"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.terms.inactive"
                                    label="Chưa kích hoạt"
                                    value={stats.inactive}
                                    description="Nhiệm kỳ dự kiến hoặc đang chuẩn bị"
                                    tone="orange"
                                    icon={<Clock className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.terms.closed"
                                    label="Đã kết thúc"
                                    value={stats.closed}
                                    description="Nhiệm kỳ đã đóng"
                                    tone="neutral"
                                    icon={<Power className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm theo mã hoặc tên nhiệm kỳ..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(event.target.value as 'all' | TermStatus)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="active">Đang hoạt động</option>
                                          <option value="inactive">Chưa kích hoạt</option>
                                          <option value="closed">Đã kết thúc</option>
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

                        <ConfigurableDataTable
                              moduleKey="organization"
                              tableKey="organization.terms"
                              columns={columns}
                              data={terms}
                              getRowKey={(term) => term.id}
                              isLoading={termsQuery.isLoading}
                              loadingText="Đang tải danh sách nhiệm kỳ..."
                              emptyTitle="Chưa có nhiệm kỳ nào"
                              emptyDescription="Tạo nhiệm kỳ đầu tiên để bắt đầu phân công cơ cấu tổ chức."
                        />

                        {isFormOpen && (
                              <TermFormModal
                                    title={editingTerm ? 'Cập nhật nhiệm kỳ' : 'Thêm nhiệm kỳ'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={handleSave}
                                    submitText={
                                          editingTerm
                                                ? updateTermMutation.isPending
                                                      ? 'Đang cập nhật...'
                                                      : 'Cập nhật'
                                                : createTermMutation.isPending
                                                      ? 'Đang thêm...'
                                                      : 'Thêm nhiệm kỳ'
                                    }
                                    isSubmitting={
                                          createTermMutation.isPending || updateTermMutation.isPending
                                    }
                                    editingTerm={editingTerm}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function TermFormModal({
      title,
      formData,
      setFormData,
      error,
      onClose,
      onSubmit,
      submitText,
      isSubmitting,
      editingTerm,
}: {
      title: string;
      formData: TermFormData;
      setFormData: React.Dispatch<React.SetStateAction<TermFormData>>;
      error: string | null;
      onClose: () => void;
      onSubmit: () => void;
      submitText: string;
      isSubmitting: boolean;
      editingTerm: OrganizationTerm | null;
}) {
      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                                    <p className="text-sm text-neutral-500">
                                          Nhiệm kỳ giúp xác định giai đoạn tổ chức, vai trò phụ trách và
                                          nhân sự đại diện trong từng năm học hoặc từng giai đoạn quản lý.
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

                        <form
                              onSubmit={(event) => {
                                    event.preventDefault();
                                    onSubmit();
                              }}
                              className="space-y-5 p-6"
                        >
                              {error && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                          {error}
                                    </div>
                              )}

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                          <Label htmlFor="termCode">Mã nhiệm kỳ *</Label>
                                          <Input
                                                id="termCode"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, code: event.target.value })
                                                }
                                                placeholder="VD: NK-2025-2026"
                                                required
                                          />
                                          <p className="mt-1 text-xs text-neutral-500">
                                                Mã nhiệm kỳ nên ngắn gọn, dễ nhận biết theo năm học hoặc giai
                                                đoạn tổ chức.
                                          </p>
                                    </div>

                                    <div>
                                          <Label htmlFor="termName">Tên nhiệm kỳ *</Label>
                                          <Input
                                                id="termName"
                                                value={formData.name}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, name: event.target.value })
                                                }
                                                placeholder="VD: Nhiệm kỳ 2025 - 2026"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                                          <Input
                                                id="startDate"
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, startDate: event.target.value })
                                                }
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="endDate">Ngày kết thúc *</Label>
                                          <Input
                                                id="endDate"
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, endDate: event.target.value })
                                                }
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="status">Trạng thái</Label>
                                          <select
                                                id="status"
                                                value={formData.status}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            status: event.target.value as TermStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="inactive">Chưa kích hoạt</option>
                                                <option value="active">Đang hoạt động</option>
                                                <option value="closed">Đã kết thúc</option>
                                          </select>
                                    </div>

                                    {editingTerm && (
                                          <div>
                                                <Label>Số nhân sự đang gán</Label>
                                                <div className="flex h-10 items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm font-semibold text-neutral-700">
                                                      {editingTerm.assignedCount || 0}
                                                </div>
                                          </div>
                                    )}
                              </div>

                              <div>
                                    <Label htmlFor="description">Mô tả / ghi chú</Label>
                                    <Textarea
                                          id="description"
                                          value={formData.description}
                                          onChange={(event) =>
                                                setFormData({ ...formData, description: event.target.value })
                                          }
                                          placeholder="Ghi chú thêm về nhiệm kỳ nếu có"
                                          className="min-h-24"
                                    />
                              </div>

                              <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                    >
                                          Hủy
                                    </button>

                                    <button
                                          type="submit"
                                          disabled={isSubmitting}
                                          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                          {submitText}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}