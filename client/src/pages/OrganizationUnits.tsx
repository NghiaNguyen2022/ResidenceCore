'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
      AlertCircle,
      Boxes,
      CheckCircle2,
      Edit2,
      LayoutGrid,
      Plus,
      Search,
      Trash2,
      UsersRound,
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

type UnitType = 'team' | 'committee';

type OrganizationUnit = {
      id: number;
      code: string;
      name: string;
      unitType: UnitType | string;
      description?: string | null;
      isActive: boolean;
      sortOrder: number;
      assignedCount?: number;
};

type UnitFormData = {
      code: string;
      name: string;
      unitType: UnitType;
      description: string;
      isActive: boolean;
      sortOrder: string;
};

const defaultFormData: UnitFormData = {
      code: '',
      name: '',
      unitType: 'team',
      description: '',
      isActive: true,
      sortOrder: '1',
};

function normalizeText(value?: string | null) {
      return (value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
}

function normalizeUnitCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}

function getUnitTypeLabel(unitType?: string | null) {
      if (unitType === 'team') return 'Tổ';
      if (unitType === 'committee') return 'Ban';
      return 'Khác';
}

function getUnitTypeClass(unitType?: string | null) {
      if (unitType === 'team') {
            return 'border-blue-200 bg-blue-50 text-blue-700';
      }

      if (unitType === 'committee') {
            return 'border-purple-200 bg-purple-50 text-purple-700';
      }

      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getNextSortOrder(units: OrganizationUnit[], unitType: UnitType) {
      const values = units
            .filter((unit) => unit.unitType === unitType)
            .map((unit) => Number(unit.sortOrder || 0));

      return String(Math.max(...values, 0) + 10);
}

function validateUnitForm({
      units,
      formData,
      editingId,
}: {
      units: OrganizationUnit[];
      formData: UnitFormData;
      editingId?: number;
}) {
      const code = normalizeUnitCode(formData.code);
      const name = normalizeText(formData.name);

      if (!code) return 'Vui lòng nhập mã Tổ/Ban.';
      if (!name) return 'Vui lòng nhập tên Tổ/Ban.';

      const sortOrder = Number(formData.sortOrder);

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const otherUnits = units.filter((unit) => unit.id !== editingId);

      const duplicatedCode = otherUnits.some(
            (unit) => normalizeText(unit.code) === normalizeText(code)
      );

      if (duplicatedCode) {
            return 'Mã Tổ/Ban đã tồn tại. Vui lòng nhập mã khác.';
      }

      const duplicatedNameInType = otherUnits.some(
            (unit) =>
                  unit.unitType === formData.unitType &&
                  normalizeText(unit.name) === name
      );

      if (duplicatedNameInType) {
            return 'Tên Tổ/Ban đã tồn tại trong cùng loại đơn vị.';
      }

      return null;
}

export default function OrganizationUnits() {
      const [searchTerm, setSearchTerm] = useState('');
      const [unitTypeFilter, setUnitTypeFilter] = useState<'all' | UnitType>('all');
      const [statusFilter, setStatusFilter] = useState<
            'all' | 'active' | 'inactive'
      >('all');

      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingUnit, setEditingUnit] = useState<OrganizationUnit | null>(null);
      const [formData, setFormData] = useState<UnitFormData>(defaultFormData);
      const [error, setError] = useState<string | null>(null);

      const unitsQuery = trpc.organization.listUnits.useQuery({
            search: searchTerm || undefined,
            unitType: unitTypeFilter !== 'all' ? unitTypeFilter : undefined,
            isActive:
                  statusFilter === 'active'
                        ? true
                        : statusFilter === 'inactive'
                              ? false
                              : undefined,
            limit: 500,
            offset: 0,
      });

      const createUnitMutation = trpc.organization.createUnit.useMutation();
      const updateUnitMutation = trpc.organization.updateUnit.useMutation();
      const deleteUnitMutation = trpc.organization.deleteUnit.useMutation();
      const toggleUnitActiveMutation =
            trpc.organization.toggleUnitActive.useMutation();

      const units = (unitsQuery.data || []) as OrganizationUnit[];

      const stats = useMemo(() => {
            return {
                  total: units.length,
                  active: units.filter((unit) => unit.isActive).length,
                  teams: units.filter((unit) => unit.unitType === 'team').length,
                  committees: units.filter((unit) => unit.unitType === 'committee')
                        .length,
            };
      }, [units]);

      const refetchUnits = () => {
            unitsQuery.refetch();
      };

      const openCreateForm = (unitType: UnitType = 'team') => {
            setEditingUnit(null);
            setFormData({
                  ...defaultFormData,
                  unitType,
                  sortOrder: getNextSortOrder(units, unitType),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (unit: OrganizationUnit) => {
            setEditingUnit(unit);
            setFormData({
                  code: unit.code || '',
                  name: unit.name || '',
                  unitType: (unit.unitType as UnitType) || 'team',
                  description: unit.description || '',
                  isActive: Boolean(unit.isActive),
                  sortOrder: String(unit.sortOrder ?? 0),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const closeForm = () => {
            setIsFormOpen(false);
            setEditingUnit(null);
            setFormData(defaultFormData);
            setError(null);
      };

      const handleSave = async () => {
            const validationMessage = validateUnitForm({
                  units,
                  formData,
                  editingId: editingUnit?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const payload = {
                  code: normalizeUnitCode(formData.code),
                  name: formData.name.trim(),
                  unitType: formData.unitType,
                  description: formData.description.trim() || null,
                  isActive: formData.isActive,
                  sortOrder: Number(formData.sortOrder),
            };

            try {
                  if (editingUnit) {
                        await updateUnitMutation.mutateAsync({
                              id: editingUnit.id,
                              ...payload,
                        });
                  } else {
                        await createUnitMutation.mutateAsync(payload);
                  }

                  closeForm();
                  refetchUnits();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi lưu Tổ/Ban.');
            }
      };

      const handleToggleActive = async (unit: OrganizationUnit) => {
            if ((unit.assignedCount || 0) > 0 && unit.isActive) {
                  alert(
                        'Tổ/Ban này đang có phân công trong cơ cấu tổ chức. Không nên ngưng dùng trực tiếp. Vui lòng kết thúc phân công trước.'
                  );
                  return;
            }

            try {
                  await toggleUnitActiveMutation.mutateAsync({ id: unit.id });
                  refetchUnits();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi cập nhật trạng thái Tổ/Ban.');
            }
      };

      const handleDelete = async (unit: OrganizationUnit) => {
            if ((unit.assignedCount || 0) > 0) {
                  alert(
                        'Không thể xóa Tổ/Ban đã có phân công trong cơ cấu tổ chức. Bạn có thể chuyển trạng thái sang Ngưng dùng sau khi kết thúc phân công.'
                  );
                  return;
            }

            if (!confirm(`Bạn có chắc chắn muốn xóa "${unit.name}"?`)) {
                  return;
            }

            try {
                  await deleteUnitMutation.mutateAsync({ id: unit.id });
                  refetchUnits();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi xóa Tổ/Ban.');
            }
      };

      const clearFilters = () => {
            setSearchTerm('');
            setUnitTypeFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<OrganizationUnit>[]>(
            () => [
                  {
                        key: 'unit',
                        label: 'Tổ/Ban',
                        sortable: true,
                        sortValue: (unit) => unit.name,
                        render: (unit) => (
                              <div>
                                    <p className="font-semibold text-neutral-900">{unit.name}</p>
                                    <p className="mt-1 font-mono text-xs text-neutral-500">
                                          {unit.code}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'unitType',
                        label: 'Loại',
                        sortable: true,
                        sortValue: (unit) => getUnitTypeLabel(unit.unitType),
                        render: (unit) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getUnitTypeClass(
                                          unit.unitType
                                    )}`}
                              >
                                    {getUnitTypeLabel(unit.unitType)}
                              </span>
                        ),
                  },
                  {
                        key: 'assignedCount',
                        label: 'Đang gán',
                        sortable: true,
                        sortValue: (unit) => unit.assignedCount || 0,
                        render: (unit) => (
                              <span className="font-semibold text-neutral-800">
                                    {unit.assignedCount || 0}
                              </span>
                        ),
                  },
                  {
                        key: 'sortOrder',
                        label: 'Thứ tự',
                        sortable: true,
                        sortValue: (unit) => unit.sortOrder || 0,
                        render: (unit) => unit.sortOrder || 0,
                  },
                  {
                        key: 'status',
                        label: 'Trạng thái',
                        sortable: true,
                        sortValue: (unit) => (unit.isActive ? 'active' : 'inactive'),
                        render: (unit) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${unit.isActive
                                          ? 'border-green-200 bg-green-50 text-green-700'
                                          : 'border-neutral-200 bg-neutral-100 text-neutral-600'
                                          }`}
                              >
                                    {unit.isActive ? 'Đang dùng' : 'Ngưng dùng'}
                              </span>
                        ),
                  },
                  {
                        key: 'description',
                        label: 'Mô tả',
                        defaultVisible: true,
                        sortable: true,
                        sortValue: (unit) => unit.description || '',
                        render: (unit) => unit.description || '-',
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[220px]',
                        render: (unit) => (
                              <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                          type="button"
                                          onClick={() => handleToggleActive(unit)}
                                          disabled={toggleUnitActiveMutation.isPending}
                                          className={`rounded-lg px-2 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${unit.isActive
                                                ? 'text-orange-700 hover:bg-orange-50'
                                                : 'text-green-700 hover:bg-green-50'
                                                }`}
                                          title={unit.isActive ? 'Ngưng dùng' : 'Kích hoạt'}
                                    >
                                          {unit.isActive ? 'Ngưng' : 'Kích hoạt'}
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => openEditForm(unit)}
                                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                          title="Sửa Tổ/Ban"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => handleDelete(unit)}
                                          disabled={deleteUnitMutation.isPending}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                          title="Xóa Tổ/Ban"
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              </div>
                        ),
                  },
            ],
            [toggleUnitActiveMutation.isPending, deleteUnitMutation.isPending]
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
                                          Tổ / Ban
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Khai báo các tổ sinh hoạt và ban chuyên trách để phục vụ phân công Tổ trưởng, Trưởng ban trong từng nhiệm kỳ.
                                    </p>
                              </div>

                              <div className="flex flex-col gap-2 sm:flex-row">
                                    <button
                                          type="button"
                                          onClick={() => openCreateForm('team')}
                                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                    >
                                          <Plus className="h-4 w-4" />
                                          Thêm Tổ
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => openCreateForm('committee')}
                                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                    >
                                          <Plus className="h-4 w-4" />
                                          Thêm Ban
                                    </button>
                              </div>
                        </div>

                        {(error || unitsQuery.error) && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">Có lỗi khi xử lý Tổ/Ban.</p>
                                                <p className="mt-1 text-sm">
                                                      {error ||
                                                            unitsQuery.error?.message ||
                                                            'Vui lòng kiểm tra lại dữ liệu và thử lại.'}
                                                </p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.units.total"
                                    label="Tổng số"
                                    value={stats.total}
                                    description="Tổng Tổ/Ban đã khai báo"
                                    tone="blue"
                                    icon={<Boxes className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.units.active"
                                    label="Đang dùng"
                                    value={stats.active}
                                    description="Đơn vị còn hiệu lực"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.units.teams"
                                    label="Tổ sinh hoạt"
                                    value={stats.teams}
                                    description="Các tổ trong lưu xá"
                                    tone="orange"
                                    icon={<UsersRound className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.units.committees"
                                    label="Ban chuyên trách"
                                    value={stats.committees}
                                    description="Các ban phụ trách hoạt động"
                                    tone="purple"
                                    icon={<LayoutGrid className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px_220px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm theo mã hoặc tên Tổ/Ban..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={unitTypeFilter}
                                          onChange={(event) =>
                                                setUnitTypeFilter(event.target.value as 'all' | UnitType)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả loại</option>
                                          <option value="team">Tổ</option>
                                          <option value="committee">Ban</option>
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(
                                                      event.target.value as 'all' | 'active' | 'inactive'
                                                )
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="active">Đang dùng</option>
                                          <option value="inactive">Ngưng dùng</option>
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
                              tableKey="organization.units"
                              columns={columns}
                              data={units}
                              getRowKey={(unit) => unit.id}
                              isLoading={unitsQuery.isLoading}
                              loadingText="Đang tải danh sách Tổ/Ban..."
                              emptyTitle="Chưa có Tổ/Ban"
                              emptyDescription="Thêm Tổ hoặc Ban để sử dụng trong phân công cơ cấu tổ chức."
                        />

                        {isFormOpen && (
                              <UnitFormModal
                                    title={editingUnit ? 'Cập nhật Tổ/Ban' : 'Thêm Tổ/Ban'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={handleSave}
                                    submitText={
                                          editingUnit
                                                ? updateUnitMutation.isPending
                                                      ? 'Đang cập nhật...'
                                                      : 'Cập nhật'
                                                : createUnitMutation.isPending
                                                      ? 'Đang thêm...'
                                                      : 'Thêm Tổ/Ban'
                                    }
                                    isSubmitting={
                                          createUnitMutation.isPending || updateUnitMutation.isPending
                                    }
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function UnitFormModal({
      title,
      formData,
      setFormData,
      error,
      onClose,
      onSubmit,
      submitText,
      isSubmitting,
}: {
      title: string;
      formData: UnitFormData;
      setFormData: Dispatch<SetStateAction<UnitFormData>>;
      error: string | null;
      onClose: () => void;
      onSubmit: () => void;
      submitText: string;
      isSubmitting: boolean;
}) {
      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                                    <p className="text-sm text-neutral-500">
                                          Khai báo Tổ/Ban để sử dụng khi phân công Tổ trưởng hoặc Trưởng ban.
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
                                          <Label htmlFor="code">Mã Tổ/Ban</Label>
                                          <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeUnitCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: TO_1, BAN_HOC_TAP"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="name">Tên Tổ/Ban</Label>
                                          <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, name: event.target.value })
                                                }
                                                placeholder="VD: Tổ 1, Ban học tập"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="unitType">Loại đơn vị</Label>
                                          <select
                                                id="unitType"
                                                value={formData.unitType}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            unitType: event.target.value as UnitType,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="team">Tổ</option>
                                                <option value="committee">Ban</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                                          <Input
                                                id="sortOrder"
                                                type="number"
                                                min={0}
                                                value={formData.sortOrder}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, sortOrder: event.target.value })
                                                }
                                                placeholder="VD: 10"
                                          />
                                    </div>

                                    <div className="md:col-span-2">
                                          <Label>Trạng thái</Label>
                                          <div className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                                                <input
                                                      id="isActive"
                                                      type="checkbox"
                                                      checked={formData.isActive}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  isActive: event.target.checked,
                                                            })
                                                      }
                                                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                      <Label htmlFor="isActive" className="cursor-pointer">
                                                            Đang sử dụng
                                                      </Label>
                                                      <p className="text-xs text-neutral-500">
                                                            Tổ/Ban đang sử dụng sẽ được hiển thị trong form phân công cơ cấu tổ chức.
                                                      </p>
                                                </div>
                                          </div>
                                    </div>
                              </div>

                              <div>
                                    <Label htmlFor="description">Mô tả / ghi chú</Label>
                                    <Textarea
                                          id="description"
                                          value={formData.description}
                                          onChange={(event) =>
                                                setFormData({ ...formData, description: event.target.value })
                                          }
                                          placeholder="Mô tả phạm vi hoặc nhiệm vụ của Tổ/Ban"
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
