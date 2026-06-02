'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      CalendarDays,
      CheckCircle2,
      Church,
      Clock,
      Edit2,
      MapPin,
      Plus,
      Search,
      Trash2,
      Users,
      X,
} from 'lucide-react';

import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfigurableStatCard } from '@/components/configurable/ConfigurableStatCard';
import {
      ConfigurableColumn,
      ConfigurableDataTable,
} from '@/components/configurable/ConfigurableDataTable';

type LiturgyType =
      | 'mass'
      | 'evening_prayer'
      | 'adoration'
      | 'confession'
      | 'retreat'
      | 'community_prayer'
      | 'other';

type LiturgyStatus = 'planned' | 'active' | 'completed' | 'cancelled';

type LiturgyScheduleItem = {
      id: number;
      code: string;
      title: string;
      liturgyType: LiturgyType;
      status: LiturgyStatus;
      scheduleDate: string;
      startTime: string;
      endTime: string;
      location: string;
      presider: string;
      responsibleGroup: string;
      isRequired: boolean;
      expectedParticipants: number;
      note?: string | null;
      sortOrder: number;
};

type LiturgyFormData = {
      code: string;
      title: string;
      liturgyType: LiturgyType;
      status: LiturgyStatus;
      scheduleDate: string;
      startTime: string;
      endTime: string;
      location: string;
      presider: string;
      responsibleGroup: string;
      isRequired: boolean;
      expectedParticipants: string;
      note: string;
      sortOrder: string;
};

const initialItems: LiturgyScheduleItem[] = [
      {
            id: 1,
            code: 'SUNDAY_MASS',
            title: 'Thánh lễ Chúa Nhật',
            liturgyType: 'mass',
            status: 'planned',
            scheduleDate: '2026-06-07',
            startTime: '06:00',
            endTime: '07:00',
            location: 'Nhà nguyện',
            presider: 'Cha linh hướng',
            responsibleGroup: 'Ban phụng vụ',
            isRequired: true,
            expectedParticipants: 80,
            note: 'Chuẩn bị bài đọc, thánh ca và phân công phục vụ trước một ngày.',
            sortOrder: 10,
      },
      {
            id: 2,
            code: 'EVENING_PRAYER',
            title: 'Kinh tối cộng đoàn',
            liturgyType: 'evening_prayer',
            status: 'active',
            scheduleDate: '2026-06-02',
            startTime: '21:15',
            endTime: '21:35',
            location: 'Nhà nguyện',
            presider: '',
            responsibleGroup: 'Tổ trực',
            isRequired: true,
            expectedParticipants: 80,
            note: 'Giữ không gian thinh lặng trước và sau giờ kinh.',
            sortOrder: 20,
      },
      {
            id: 3,
            code: 'MONTHLY_ADORATION',
            title: 'Chầu Thánh Thể đầu tháng',
            liturgyType: 'adoration',
            status: 'planned',
            scheduleDate: '2026-06-05',
            startTime: '20:00',
            endTime: '21:00',
            location: 'Nhà nguyện',
            presider: 'Cha linh hướng',
            responsibleGroup: 'Ban phụng vụ',
            isRequired: false,
            expectedParticipants: 50,
            note: '',
            sortOrder: 30,
      },
];

const defaultFormData: LiturgyFormData = {
      code: '',
      title: '',
      liturgyType: 'mass',
      status: 'planned',
      scheduleDate: '',
      startTime: '19:00',
      endTime: '20:00',
      location: '',
      presider: '',
      responsibleGroup: '',
      isRequired: true,
      expectedParticipants: '0',
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

function normalizeText(value?: string | null) {
      return (value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
}

function timeToMinutes(value: string) {
      const [hour, minute] = value.split(':').map(Number);
      if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;
      return hour * 60 + minute;
}

function formatDate(value: string) {
      const date = new Date(value);
      if (!value || Number.isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('vi-VN');
}

function formatTimeRange(startTime: string, endTime: string) {
      return `${startTime} - ${endTime}`;
}

function getLiturgyTypeLabel(type: LiturgyType) {
      if (type === 'mass') return 'Thánh lễ';
      if (type === 'evening_prayer') return 'Kinh tối';
      if (type === 'adoration') return 'Chầu Thánh Thể';
      if (type === 'confession') return 'Giải tội';
      if (type === 'retreat') return 'Tĩnh tâm';
      if (type === 'community_prayer') return 'Cầu nguyện cộng đoàn';
      return 'Khác';
}

function getLiturgyTypeClass(type: LiturgyType) {
      if (type === 'mass') return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      if (type === 'evening_prayer') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (type === 'adoration') return 'border-violet-200 bg-violet-50 text-violet-700';
      if (type === 'confession') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (type === 'retreat') return 'border-orange-200 bg-orange-50 text-orange-700';
      if (type === 'community_prayer') return 'border-sky-200 bg-sky-50 text-sky-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getStatusLabel(status: LiturgyStatus) {
      if (status === 'planned') return 'Đã lên lịch';
      if (status === 'active') return 'Đang áp dụng';
      if (status === 'completed') return 'Hoàn thành';
      return 'Đã hủy';
}

function getStatusClass(status: LiturgyStatus) {
      if (status === 'planned') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (status === 'active') return 'border-green-200 bg-green-50 text-green-700';
      if (status === 'completed') return 'border-slate-200 bg-slate-50 text-slate-700';
      return 'border-red-200 bg-red-50 text-red-700';
}

function getNextId(items: LiturgyScheduleItem[]) {
      return Math.max(...items.map((item) => item.id), 0) + 1;
}

function getNextSortOrder(items: LiturgyScheduleItem[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function validateForm({
      items,
      formData,
      editingId,
}: {
      items: LiturgyScheduleItem[];
      formData: LiturgyFormData;
      editingId?: number;
}) {
      const code = normalizeCode(formData.code);
      if (!code) return 'Vui lòng nhập mã lịch phụng vụ.';
      if (!formData.title.trim()) return 'Vui lòng nhập tên lịch phụng vụ.';
      if (!formData.scheduleDate) return 'Vui lòng nhập ngày thực hiện.';
      if (!formData.startTime || !formData.endTime) return 'Vui lòng nhập giờ bắt đầu và kết thúc.';

      if (timeToMinutes(formData.endTime) <= timeToMinutes(formData.startTime)) {
            return 'Giờ kết thúc phải lớn hơn giờ bắt đầu.';
      }

      const expectedParticipants = Number(formData.expectedParticipants || 0);
      if (!Number.isFinite(expectedParticipants) || expectedParticipants < 0) {
            return 'Số người dự kiến phải là số lớn hơn hoặc bằng 0.';
      }

      const sortOrder = Number(formData.sortOrder || 0);
      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCode = items
            .filter((item) => item.id !== editingId)
            .some((item) => normalizeText(item.code) === normalizeText(code));

      if (duplicatedCode) {
            return 'Mã lịch phụng vụ đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

export default function LiturgySchedule() {
      const [items, setItems] = useState<LiturgyScheduleItem[]>(initialItems);
      const [searchTerm, setSearchTerm] = useState('');
      const [typeFilter, setTypeFilter] = useState<'all' | LiturgyType>('all');
      const [statusFilter, setStatusFilter] = useState<'all' | LiturgyStatus>('all');
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingItem, setEditingItem] = useState<LiturgyScheduleItem | null>(null);
      const [formData, setFormData] = useState<LiturgyFormData>(defaultFormData);
      const [error, setError] = useState<string | null>(null);

      const filteredItems = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return items
                  .filter((item) => {
                        if (typeFilter !== 'all' && item.liturgyType !== typeFilter) return false;
                        if (statusFilter !== 'all' && item.status !== statusFilter) return false;

                        if (!keyword) return true;

                        const haystack = [
                              item.code,
                              item.title,
                              getLiturgyTypeLabel(item.liturgyType),
                              getStatusLabel(item.status),
                              item.location,
                              item.presider,
                              item.responsibleGroup,
                              item.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => {
                        const dateCompare =
                              new Date(a.scheduleDate).getTime() -
                              new Date(b.scheduleDate).getTime();

                        if (dateCompare !== 0) return dateCompare;

                        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
                  });
      }, [items, searchTerm, typeFilter, statusFilter]);

      const stats = useMemo(() => {
            return {
                  total: items.length,
                  active: items.filter((item) => item.status === 'active' || item.status === 'planned').length,
                  required: items.filter((item) => item.isRequired).length,
                  mass: items.filter((item) => item.liturgyType === 'mass').length,
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

      const openEditForm = (item: LiturgyScheduleItem) => {
            setEditingItem(item);
            setFormData({
                  code: item.code,
                  title: item.title,
                  liturgyType: item.liturgyType,
                  status: item.status,
                  scheduleDate: item.scheduleDate,
                  startTime: item.startTime,
                  endTime: item.endTime,
                  location: item.location,
                  presider: item.presider,
                  responsibleGroup: item.responsibleGroup,
                  isRequired: item.isRequired,
                  expectedParticipants: String(item.expectedParticipants || 0),
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

            const payload: LiturgyScheduleItem = {
                  id: editingItem?.id || getNextId(items),
                  code: normalizeCode(formData.code),
                  title: formData.title.trim(),
                  liturgyType: formData.liturgyType,
                  status: formData.status,
                  scheduleDate: formData.scheduleDate,
                  startTime: formData.startTime,
                  endTime: formData.endTime,
                  location: formData.location.trim(),
                  presider: formData.presider.trim(),
                  responsibleGroup: formData.responsibleGroup.trim(),
                  isRequired: formData.isRequired,
                  expectedParticipants: Number(formData.expectedParticipants || 0),
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

      const handleDelete = (item: LiturgyScheduleItem) => {
            if (!confirm(`Bạn có chắc chắn muốn xóa lịch "${item.title}"?`)) {
                  return;
            }

            setItems((current) => current.filter((row) => row.id !== item.id));
      };

      const clearFilters = () => {
            setSearchTerm('');
            setTypeFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<LiturgyScheduleItem>[]>(
            () => [
                  {
                        key: 'title',
                        label: 'Lịch phụng vụ',
                        sortable: true,
                        sortValue: (item) => item.title,
                        render: (item) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{item.title}</p>
                                    <p className="mt-1 font-mono text-xs text-slate-500">{item.code}</p>
                              </div>
                        ),
                  },
                  {
                        key: 'type',
                        label: 'Loại',
                        sortable: true,
                        sortValue: (item) => getLiturgyTypeLabel(item.liturgyType),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getLiturgyTypeClass(
                                          item.liturgyType
                                    )}`}
                              >
                                    {getLiturgyTypeLabel(item.liturgyType)}
                              </span>
                        ),
                  },
                  {
                        key: 'time',
                        label: 'Thời gian',
                        sortable: true,
                        sortValue: (item) => `${item.scheduleDate} ${item.startTime}`,
                        render: (item) => (
                              <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                          <CalendarDays className="h-4 w-4 text-slate-500" />
                                          {formatDate(item.scheduleDate)}
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                          {formatTimeRange(item.startTime, item.endTime)}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'location',
                        label: 'Địa điểm',
                        sortable: true,
                        sortValue: (item) => item.location,
                        render: (item) => (
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    {item.location || '-'}
                              </div>
                        ),
                  },
                  {
                        key: 'responsible',
                        label: 'Phụ trách',
                        sortable: true,
                        sortValue: (item) => item.responsibleGroup,
                        render: (item) => (
                              <div>
                                    <p className="text-sm font-medium text-slate-800">
                                          {item.responsibleGroup || '-'}
                                    </p>
                                    {item.presider && (
                                          <p className="mt-1 text-xs text-slate-500">
                                                Chủ sự: {item.presider}
                                          </p>
                                    )}
                              </div>
                        ),
                  },
                  {
                        key: 'required',
                        label: 'Yêu cầu',
                        sortable: true,
                        sortValue: (item) => (item.isRequired ? 1 : 0),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${item.isRequired
                                                ? 'border-red-200 bg-red-50 text-red-700'
                                                : 'border-slate-200 bg-slate-50 text-slate-600'
                                          }`}
                              >
                                    {item.isRequired ? 'Bắt buộc' : 'Khuyến khích'}
                              </span>
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
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[140px]',
                        render: (item) => (
                              <div className="flex items-center gap-1.5">
                                    <button
                                          type="button"
                                          onClick={() => openEditForm(item)}
                                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                          title="Sửa lịch"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => handleDelete(item)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa lịch"
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
                                          Lịch phụng vụ
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Quản lý lịch Thánh lễ, kinh tối, chầu, tĩnh tâm và các giờ cầu nguyện chung của lưu xá.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm lịch phụng vụ
                              </button>
                        </div>

                        {error && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">Có lỗi khi xử lý lịch phụng vụ.</p>
                                                <p className="mt-1 text-sm">{error}</p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="liturgySchedule"
                                    cardKey="liturgySchedule.total"
                                    label="Tổng lịch"
                                    value={stats.total}
                                    description="Tổng số lịch phụng vụ"
                                    tone="blue"
                                    icon={<CalendarDays className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="liturgySchedule"
                                    cardKey="liturgySchedule.active"
                                    label="Đang áp dụng"
                                    value={stats.active}
                                    description="Lịch đang hoặc sắp thực hiện"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="liturgySchedule"
                                    cardKey="liturgySchedule.required"
                                    label="Bắt buộc"
                                    value={stats.required}
                                    description="Hoạt động cần tham gia đầy đủ"
                                    tone="orange"
                                    icon={<Users className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="liturgySchedule"
                                    cardKey="liturgySchedule.mass"
                                    label="Thánh lễ"
                                    value={stats.mass}
                                    description="Lịch Thánh lễ đã khai báo"
                                    tone="purple"
                                    icon={<Church className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px_240px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm lịch, địa điểm, người phụ trách..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={typeFilter}
                                          onChange={(event) =>
                                                setTypeFilter(event.target.value as 'all' | LiturgyType)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả loại</option>
                                          <option value="mass">Thánh lễ</option>
                                          <option value="evening_prayer">Kinh tối</option>
                                          <option value="adoration">Chầu Thánh Thể</option>
                                          <option value="confession">Giải tội</option>
                                          <option value="retreat">Tĩnh tâm</option>
                                          <option value="community_prayer">Cầu nguyện cộng đoàn</option>
                                          <option value="other">Khác</option>
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(event.target.value as 'all' | LiturgyStatus)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="planned">Đã lên lịch</option>
                                          <option value="active">Đang áp dụng</option>
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

                        <LiturgyCalendarPreview items={filteredItems} />

                        <ConfigurableDataTable
                              moduleKey="liturgySchedule"
                              tableKey="liturgySchedule.list"
                              columns={columns}
                              data={filteredItems}
                              getRowKey={(item) => item.id}
                              emptyTitle="Chưa có lịch phụng vụ"
                              emptyDescription="Thêm lịch để quản lý các hoạt động phụng vụ và cầu nguyện chung."
                        />

                        {isFormOpen && (
                              <LiturgyFormModal
                                    title={editingItem ? 'Cập nhật lịch phụng vụ' : 'Thêm lịch phụng vụ'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={handleSave}
                                    submitText={editingItem ? 'Cập nhật' : 'Thêm lịch'}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function LiturgyCalendarPreview({ items }: { items: LiturgyScheduleItem[] }) {
      if (items.length === 0) {
            return (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                        Không có lịch phụng vụ phù hợp với bộ lọc hiện tại.
                  </div>
            );
      }

      return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                              <h2 className="text-lg font-bold text-neutral-900">Lịch sắp tới</h2>
                              <p className="mt-1 text-sm text-neutral-500">
                                    Các hoạt động phụng vụ được sắp xếp theo thời gian thực hiện.
                              </p>
                        </div>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {items.length} lịch
                        </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                        {items.slice(0, 6).map((item) => (
                              <div
                                    key={item.id}
                                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm"
                              >
                                    <div className="flex items-start justify-between gap-3">
                                          <div>
                                                <p className="text-sm font-bold text-slate-900">
                                                      {formatDate(item.scheduleDate)}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                      {formatTimeRange(item.startTime, item.endTime)}
                                                </p>
                                          </div>

                                          <span
                                                className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                                                      item.status
                                                )}`}
                                          >
                                                {getStatusLabel(item.status)}
                                          </span>
                                    </div>

                                    <p className="mt-3 line-clamp-1 font-bold text-slate-900">
                                          {item.title}
                                    </p>

                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                          <span
                                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getLiturgyTypeClass(
                                                      item.liturgyType
                                                )}`}
                                          >
                                                {getLiturgyTypeLabel(item.liturgyType)}
                                          </span>

                                          {item.isRequired && (
                                                <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                                      Bắt buộc
                                                </span>
                                          )}
                                    </div>

                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                          <MapPin className="h-3.5 w-3.5" />
                                          {item.location || 'Chưa có địa điểm'}
                                    </div>
                              </div>
                        ))}
                  </div>
            </div>
      );
}

function LiturgyFormModal({
      title,
      formData,
      setFormData,
      error,
      onClose,
      onSubmit,
      submitText,
}: {
      title: string;
      formData: LiturgyFormData;
      setFormData: React.Dispatch<React.SetStateAction<LiturgyFormData>>;
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
                                          Khai báo thời gian, nội dung và nhóm phụ trách phụng vụ.
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
                                          <Label htmlFor="code">Mã lịch</Label>
                                          <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: SUNDAY_MASS"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="title">Tên lịch phụng vụ</Label>
                                          <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            title: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Thánh lễ Chúa Nhật"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="liturgyType">Loại phụng vụ</Label>
                                          <select
                                                id="liturgyType"
                                                value={formData.liturgyType}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            liturgyType: event.target.value as LiturgyType,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="mass">Thánh lễ</option>
                                                <option value="evening_prayer">Kinh tối</option>
                                                <option value="adoration">Chầu Thánh Thể</option>
                                                <option value="confession">Giải tội</option>
                                                <option value="retreat">Tĩnh tâm</option>
                                                <option value="community_prayer">Cầu nguyện cộng đoàn</option>
                                                <option value="other">Khác</option>
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
                                                            status: event.target.value as LiturgyStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="planned">Đã lên lịch</option>
                                                <option value="active">Đang áp dụng</option>
                                                <option value="completed">Hoàn thành</option>
                                                <option value="cancelled">Đã hủy</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="scheduleDate">Ngày thực hiện</Label>
                                          <Input
                                                id="scheduleDate"
                                                type="date"
                                                value={formData.scheduleDate}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            scheduleDate: event.target.value,
                                                      })
                                                }
                                                required
                                          />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                          <div>
                                                <Label htmlFor="startTime">Giờ bắt đầu</Label>
                                                <Input
                                                      id="startTime"
                                                      type="time"
                                                      value={formData.startTime}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  startTime: event.target.value,
                                                            })
                                                      }
                                                      required
                                                />
                                          </div>

                                          <div>
                                                <Label htmlFor="endTime">Giờ kết thúc</Label>
                                                <Input
                                                      id="endTime"
                                                      type="time"
                                                      value={formData.endTime}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  endTime: event.target.value,
                                                            })
                                                      }
                                                      required
                                                />
                                          </div>
                                    </div>

                                    <div>
                                          <Label htmlFor="location">Địa điểm</Label>
                                          <Input
                                                id="location"
                                                value={formData.location}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            location: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Nhà nguyện"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="presider">Chủ sự / hướng dẫn</Label>
                                          <Input
                                                id="presider"
                                                value={formData.presider}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            presider: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Cha linh hướng"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="responsibleGroup">Nhóm phụ trách</Label>
                                          <Input
                                                id="responsibleGroup"
                                                value={formData.responsibleGroup}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            responsibleGroup: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Ban phụng vụ"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="expectedParticipants">Số người dự kiến</Label>
                                          <Input
                                                id="expectedParticipants"
                                                type="number"
                                                min={0}
                                                value={formData.expectedParticipants}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            expectedParticipants: event.target.value,
                                                      })
                                                }
                                          />
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

                                    <div className="md:col-span-2">
                                          <Label>Yêu cầu tham gia</Label>
                                          <div className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                                                <input
                                                      id="isRequired"
                                                      type="checkbox"
                                                      checked={formData.isRequired}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  isRequired: event.target.checked,
                                                            })
                                                      }
                                                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                      <Label htmlFor="isRequired" className="cursor-pointer">
                                                            Đây là hoạt động cần tham gia đầy đủ
                                                      </Label>
                                                      <p className="text-xs text-neutral-500">
                                                            Dùng để phân biệt các lịch phụng vụ bắt buộc và lịch khuyến khích.
                                                      </p>
                                                </div>
                                          </div>
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
                                          placeholder="Ghi chú thêm về chuẩn bị, phân công hoặc lưu ý tham dự"
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
