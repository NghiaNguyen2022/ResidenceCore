'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      CalendarDays,
      CheckCircle2,
      Church,
      Edit2,
      Mic2,
      Plus,
      Search,
      Trash2,
      Users,
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
import { normalizeText } from '@/lib/text';
import { formatDate } from '@/lib/format';
import { DatePickerInput } from '@/components/shared/form/DatePickerInput';

type AssignmentStatus = 'planned' | 'confirmed' | 'completed' | 'cancelled';
type ServiceRole =
      | 'reader'
      | 'psalm'
      | 'choir'
      | 'altar_service'
      | 'usher'
      | 'offertory'
      | 'cleaning'
      | 'other';

type Resident = {
      id: number;
      residentCode?: string | null;
      code?: string | null;
      fullName?: string | null;
      name?: string | null;
      status?: string | null;
      roomId?: number | null;
      roomCode?: string | null;
      roomName?: string | null;
};

type LiturgyAssignment = {
      id: number;
      code: string;
      serviceDate: string;
      serviceTime: string;
      liturgyTitle: string;
      serviceRole: ServiceRole;
      residentId: number | null;
      residentName: string;
      roomLabel: string;
      status: AssignmentStatus;
      note?: string | null;
      sortOrder: number;
};

type AssignmentFormData = {
      code: string;
      serviceDate: string;
      serviceTime: string;
      liturgyTitle: string;
      serviceRole: ServiceRole;
      residentId: string;
      status: AssignmentStatus;
      note: string;
      sortOrder: string;
};

const initialAssignments: LiturgyAssignment[] = [
      {
            id: 1,
            code: 'SUN_READER_01',
            serviceDate: '2026-06-07',
            serviceTime: '06:00',
            liturgyTitle: 'Thánh lễ Chúa Nhật',
            serviceRole: 'reader',
            residentId: null,
            residentName: 'Nguyễn Văn A',
            roomLabel: 'Phòng 101',
            status: 'confirmed',
            note: 'Bài đọc 1',
            sortOrder: 10,
      },
      {
            id: 2,
            code: 'SUN_CHOIR_01',
            serviceDate: '2026-06-07',
            serviceTime: '06:00',
            liturgyTitle: 'Thánh lễ Chúa Nhật',
            serviceRole: 'choir',
            residentId: null,
            residentName: 'Ca đoàn lưu xá',
            roomLabel: '',
            status: 'planned',
            note: 'Chuẩn bị thánh ca nhập lễ và đáp ca.',
            sortOrder: 20,
      },
      {
            id: 3,
            code: 'EVENING_PRAYER_01',
            serviceDate: '2026-06-02',
            serviceTime: '21:15',
            liturgyTitle: 'Kinh tối cộng đoàn',
            serviceRole: 'other',
            residentId: null,
            residentName: 'Tổ trực',
            roomLabel: '',
            status: 'confirmed',
            note: 'Dẫn kinh tối.',
            sortOrder: 30,
      },
];

const defaultFormData: AssignmentFormData = {
      code: '',
      serviceDate: '',
      serviceTime: '06:00',
      liturgyTitle: '',
      serviceRole: 'reader',
      residentId: '',
      status: 'planned',
      note: '',
      sortOrder: '10',
};

function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}


function getResidentName(resident: Resident) {
      return resident.fullName || resident.name || 'Chưa có tên';
}

function getRoomLabel(resident: Resident) {
      if (resident.roomCode && resident.roomName) return `${resident.roomCode} - ${resident.roomName}`;
      if (resident.roomCode) return resident.roomCode;
      if (resident.roomName) return resident.roomName;
      if (resident.roomId) return `Phòng ${resident.roomId}`;
      return 'Chưa có phòng';
}

function isActiveResident(resident: Resident) {
      const status = normalizeText(resident.status);
      if (!status) return true;
      return !['inactive', 'left', 'ended', 'archived', 'da roi', 'nghi', 'ngung'].includes(status);
}


function getRoleLabel(role: ServiceRole) {
      if (role === 'reader') return 'Đọc sách';
      if (role === 'psalm') return 'Đáp ca';
      if (role === 'choir') return 'Ca đoàn';
      if (role === 'altar_service') return 'Giúp lễ';
      if (role === 'usher') return 'Trật tự / Đón tiếp';
      if (role === 'offertory') return 'Dâng lễ vật';
      if (role === 'cleaning') return 'Chuẩn bị / vệ sinh';
      return 'Khác';
}

function getRoleClass(role: ServiceRole) {
      if (role === 'reader') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (role === 'psalm') return 'border-sky-200 bg-sky-50 text-sky-700';
      if (role === 'choir') return 'border-violet-200 bg-violet-50 text-violet-700';
      if (role === 'altar_service') return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      if (role === 'usher') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (role === 'offertory') return 'border-orange-200 bg-orange-50 text-orange-700';
      if (role === 'cleaning') return 'border-slate-200 bg-slate-50 text-slate-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getStatusLabel(status: AssignmentStatus) {
      if (status === 'planned') return 'Đã phân công';
      if (status === 'confirmed') return 'Đã xác nhận';
      if (status === 'completed') return 'Hoàn thành';
      return 'Đã hủy';
}

function getStatusClass(status: AssignmentStatus) {
      if (status === 'planned') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (status === 'confirmed') return 'border-green-200 bg-green-50 text-green-700';
      if (status === 'completed') return 'border-slate-200 bg-slate-50 text-slate-700';
      return 'border-red-200 bg-red-50 text-red-700';
}

function getNextId(items: LiturgyAssignment[]) {
      return Math.max(...items.map((item) => item.id), 0) + 1;
}

function getNextSortOrder(items: LiturgyAssignment[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function validateForm({
      items,
      formData,
      editingId,
}: {
      items: LiturgyAssignment[];
      formData: AssignmentFormData;
      editingId?: number;
}) {
      const code = normalizeCode(formData.code);
      if (!code) return 'Vui lòng nhập mã phân công.';
      if (!formData.serviceDate) return 'Vui lòng nhập ngày phục vụ.';
      if (!formData.serviceTime) return 'Vui lòng nhập giờ phục vụ.';
      if (!formData.liturgyTitle.trim()) return 'Vui lòng nhập tên buổi phụng vụ.';

      const sortOrder = Number(formData.sortOrder || 0);
      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCode = items
            .filter((item) => item.id !== editingId)
            .some((item) => normalizeText(item.code) === normalizeText(code));

      if (duplicatedCode) {
            return 'Mã phân công đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

export default function LiturgyAssignments() {
      const [items, setItems] = useState<LiturgyAssignment[]>(initialAssignments);
      const [searchTerm, setSearchTerm] = useState('');
      const [roleFilter, setRoleFilter] = useState<'all' | ServiceRole>('all');
      const [statusFilter, setStatusFilter] = useState<'all' | AssignmentStatus>('all');
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingItem, setEditingItem] = useState<LiturgyAssignment | null>(null);
      const [formData, setFormData] = useState<AssignmentFormData>(defaultFormData);
      const [error, setError] = useState<string | null>(null);

      const membersQuery = trpc.members.list.useQuery({
            limit: 500,
            offset: 0,
      });

      const residents = useMemo(() => {
            const data = (membersQuery.data || []) as Resident[];

            return data
                  .filter(isActiveResident)
                  .sort((a, b) => getResidentName(a).localeCompare(getResidentName(b), 'vi'));
      }, [membersQuery.data]);

      const filteredItems = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return items
                  .filter((item) => {
                        if (roleFilter !== 'all' && item.serviceRole !== roleFilter) return false;
                        if (statusFilter !== 'all' && item.status !== statusFilter) return false;

                        if (!keyword) return true;

                        const haystack = [
                              item.code,
                              item.liturgyTitle,
                              getRoleLabel(item.serviceRole),
                              getStatusLabel(item.status),
                              item.residentName,
                              item.roomLabel,
                              item.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => {
                        const dateCompare =
                              new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime();

                        if (dateCompare !== 0) return dateCompare;

                        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
                  });
      }, [items, searchTerm, roleFilter, statusFilter]);

      const stats = useMemo(() => {
            return {
                  total: items.length,
                  confirmed: items.filter((item) => item.status === 'confirmed').length,
                  readers: items.filter((item) => item.serviceRole === 'reader' || item.serviceRole === 'psalm').length,
                  choir: items.filter((item) => item.serviceRole === 'choir').length,
            };
      }, [items]);

      const openCreateForm = () => {
            setEditingItem(null);
            setFormData({
                  ...defaultFormData,
                  sortOrder: getNextSortOrder(items),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (item: LiturgyAssignment) => {
            setEditingItem(item);
            setFormData({
                  code: item.code,
                  serviceDate: item.serviceDate,
                  serviceTime: item.serviceTime,
                  liturgyTitle: item.liturgyTitle,
                  serviceRole: item.serviceRole,
                  residentId: item.residentId ? String(item.residentId) : '',
                  status: item.status,
                  note: item.note || '',
                  sortOrder: String(item.sortOrder || 0),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const closeForm = () => {
            setIsFormOpen(false);
            setEditingItem(null);
            setFormData(defaultFormData);
            setError(null);
      };

      const handleSave = () => {
            const validationMessage = validateForm({
                  items,
                  formData,
                  editingId: editingItem?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const selectedResident = formData.residentId
                  ? residents.find((resident) => resident.id === Number(formData.residentId))
                  : null;

            const payload: LiturgyAssignment = {
                  id: editingItem?.id || getNextId(items),
                  code: normalizeCode(formData.code),
                  serviceDate: formData.serviceDate,
                  serviceTime: formData.serviceTime,
                  liturgyTitle: formData.liturgyTitle.trim(),
                  serviceRole: formData.serviceRole,
                  residentId: selectedResident?.id || null,
                  residentName: selectedResident ? getResidentName(selectedResident) : editingItem?.residentName || 'Chưa chọn học viên',
                  roomLabel: selectedResident ? getRoomLabel(selectedResident) : editingItem?.roomLabel || '',
                  status: formData.status,
                  note: formData.note.trim() || null,
                  sortOrder: Number(formData.sortOrder || 0),
            };

            if (editingItem) {
                  setItems((current) =>
                        current.map((item) => (item.id === editingItem.id ? payload : item))
                  );
            } else {
                  setItems((current) => [...current, payload]);
            }

            closeForm();
      };

      const handleDelete = (item: LiturgyAssignment) => {
            if (!confirm(`Bạn có chắc chắn muốn xóa phân công "${item.code}"?`)) {
                  return;
            }

            setItems((current) => current.filter((row) => row.id !== item.id));
      };

      const clearFilters = () => {
            setSearchTerm('');
            setRoleFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<LiturgyAssignment>[]>(
            () => [
                  {
                        key: 'service',
                        label: 'Buổi phụng vụ',
                        sortable: true,
                        sortValue: (item) => item.liturgyTitle,
                        render: (item) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{item.liturgyTitle}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                          {formatDate(item.serviceDate)} · {item.serviceTime}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'role',
                        label: 'Phân công',
                        sortable: true,
                        sortValue: (item) => getRoleLabel(item.serviceRole),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRoleClass(
                                          item.serviceRole
                                    )}`}
                              >
                                    {getRoleLabel(item.serviceRole)}
                              </span>
                        ),
                  },
                  {
                        key: 'resident',
                        label: 'Người phụ trách',
                        sortable: true,
                        sortValue: (item) => item.residentName,
                        render: (item) => (
                              <div>
                                    <p className="font-medium text-slate-800">{item.residentName}</p>
                                    {item.roomLabel && (
                                          <p className="mt-1 text-xs text-slate-500">{item.roomLabel}</p>
                                    )}
                              </div>
                        ),
                  },
                  {
                        key: 'status',
                        label: 'Trạng thái',
                        sortable: true,
                        sortValue: (item) => getStatusLabel(item.status),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                          item.status
                                    )}`}
                              >
                                    {getStatusLabel(item.status)}
                              </span>
                        ),
                  },
                  {
                        key: 'note',
                        label: 'Ghi chú',
                        sortable: true,
                        sortValue: (item) => item.note || '',
                        render: (item) => item.note || '-',
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[140px]',
                        render: (item) => (
                              <div className="flex items-center gap-1.5">
                                    <button
                                          type="button"
                                          onClick={() => openEditForm(item)}
                                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                          title="Sửa phân công"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => handleDelete(item)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa phân công"
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              </div>
                        ),
                  },
            ],
            []
      );

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                    <p className="text-sm font-semibold text-blue-600">
                                          Phụng vụ & Cộng đoàn
                                    </p>
                                    <h1 className="mt-1 text-3xl font-bold text-neutral-900">
                                          Phân công phụng vụ
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Quản lý phân công đọc sách, đáp ca, ca đoàn, giúp lễ, dâng lễ vật và các phần việc phụng vụ khác.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm phân công
                              </button>
                        </div>

                        {(error || membersQuery.error) && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">Có lỗi khi xử lý phân công phụng vụ.</p>
                                                <p className="mt-1 text-sm">
                                                      {error || membersQuery.error?.message || 'Vui lòng kiểm tra lại dữ liệu.'}
                                                </p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="liturgyAssignments"
                                    cardKey="liturgyAssignments.total"
                                    label="Tổng phân công"
                                    value={stats.total}
                                    description="Tổng số phần việc phụng vụ"
                                    tone="blue"
                                    icon={<Church className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="liturgyAssignments"
                                    cardKey="liturgyAssignments.confirmed"
                                    label="Đã xác nhận"
                                    value={stats.confirmed}
                                    description="Phân công đã được xác nhận"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="liturgyAssignments"
                                    cardKey="liturgyAssignments.readers"
                                    label="Đọc sách / Đáp ca"
                                    value={stats.readers}
                                    description="Các phần công bố Lời Chúa"
                                    tone="orange"
                                    icon={<Mic2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="liturgyAssignments"
                                    cardKey="liturgyAssignments.choir"
                                    label="Ca đoàn"
                                    value={stats.choir}
                                    description="Phân công liên quan đến thánh ca"
                                    tone="purple"
                                    icon={<Users className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px_240px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm buổi phụng vụ, người phụ trách, ghi chú..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={roleFilter}
                                          onChange={(event) =>
                                                setRoleFilter(event.target.value as 'all' | ServiceRole)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả phân công</option>
                                          <option value="reader">Đọc sách</option>
                                          <option value="psalm">Đáp ca</option>
                                          <option value="choir">Ca đoàn</option>
                                          <option value="altar_service">Giúp lễ</option>
                                          <option value="usher">Trật tự / Đón tiếp</option>
                                          <option value="offertory">Dâng lễ vật</option>
                                          <option value="cleaning">Chuẩn bị / vệ sinh</option>
                                          <option value="other">Khác</option>
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(event.target.value as 'all' | AssignmentStatus)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="planned">Đã phân công</option>
                                          <option value="confirmed">Đã xác nhận</option>
                                          <option value="completed">Hoàn thành</option>
                                          <option value="cancelled">Đã hủy</option>
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
                              moduleKey="liturgyAssignments"
                              tableKey="liturgyAssignments.list"
                              columns={columns}
                              data={filteredItems}
                              getRowKey={(item) => item.id}
                              isLoading={membersQuery.isLoading}
                              loadingText="Đang tải danh sách học viên..."
                              emptyTitle="Chưa có phân công phụng vụ"
                              emptyDescription="Thêm phân công để chuẩn bị cho các buổi phụng vụ."
                        />

                        {isFormOpen && (
                              <AssignmentFormModal
                                    title={editingItem ? 'Cập nhật phân công' : 'Thêm phân công'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    residents={residents}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={handleSave}
                                    submitText={editingItem ? 'Cập nhật' : 'Thêm phân công'}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function AssignmentFormModal({
      title,
      formData,
      setFormData,
      residents,
      error,
      onClose,
      onSubmit,
      submitText,
}: {
      title: string;
      formData: AssignmentFormData;
      setFormData: React.Dispatch<React.SetStateAction<AssignmentFormData>>;
      residents: Resident[];
      error: string | null;
      onClose: () => void;
      onSubmit: () => void;
      submitText: string;
}) {
      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                                    <p className="text-sm text-neutral-500">
                                          Khai báo buổi phụng vụ, phần việc và người được phân công.
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
                                          <Label htmlFor="code">Mã phân công</Label>
                                          <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: SUN_READER_01"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="liturgyTitle">Buổi phụng vụ</Label>
                                          <Input
                                                id="liturgyTitle"
                                                value={formData.liturgyTitle}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            liturgyTitle: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Thánh lễ Chúa Nhật"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="serviceDate">Ngày phục vụ</Label>
                                          <DatePickerInput
                                                id="serviceDate"
                                                value={formData.serviceDate}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            serviceDate: event.target.value,
                                                      })
                                                }
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="serviceTime">Giờ phục vụ</Label>
                                          <Input
                                                id="serviceTime"
                                                type="time"
                                                value={formData.serviceTime}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            serviceTime: event.target.value,
                                                      })
                                                }
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="serviceRole">Phần việc</Label>
                                          <select
                                                id="serviceRole"
                                                value={formData.serviceRole}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            serviceRole: event.target.value as ServiceRole,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="reader">Đọc sách</option>
                                                <option value="psalm">Đáp ca</option>
                                                <option value="choir">Ca đoàn</option>
                                                <option value="altar_service">Giúp lễ</option>
                                                <option value="usher">Trật tự / Đón tiếp</option>
                                                <option value="offertory">Dâng lễ vật</option>
                                                <option value="cleaning">Chuẩn bị / vệ sinh</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="residentId">Học viên phụ trách</Label>
                                          <select
                                                id="residentId"
                                                value={formData.residentId}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            residentId: event.target.value,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="">Chưa chọn học viên</option>
                                                {residents.map((resident) => (
                                                      <option key={resident.id} value={String(resident.id)}>
                                                            {getResidentName(resident)} · {getRoomLabel(resident)}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="status">Trạng thái</Label>
                                          <select
                                                id="status"
                                                value={formData.status}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            status: event.target.value as AssignmentStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="planned">Đã phân công</option>
                                                <option value="confirmed">Đã xác nhận</option>
                                                <option value="completed">Hoàn thành</option>
                                                <option value="cancelled">Đã hủy</option>
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
                                                      setFormData({
                                                            ...formData,
                                                            sortOrder: event.target.value,
                                                      })
                                                }
                                          />
                                    </div>
                              </div>

                              <div>
                                    <Label htmlFor="note">Ghi chú</Label>
                                    <Textarea
                                          id="note"
                                          value={formData.note}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      note: event.target.value,
                                                })
                                          }
                                          placeholder="Ghi chú về bài đọc, phần việc, chuẩn bị hoặc lưu ý phục vụ"
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
                                          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                          {submitText}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}
