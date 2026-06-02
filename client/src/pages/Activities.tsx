'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      CalendarDays,
      CheckCircle2,
      Clock,
      Edit2,
      MapPin,
      Plus,
      Search,
      Sparkles,
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

type ActivityStatus =
      | 'draft'
      | 'scheduled'
      | 'in_progress'
      | 'completed'
      | 'cancelled';

type ActivityType =
      | 'community'
      | 'spiritual'
      | 'study'
      | 'sports'
      | 'culture'
      | 'volunteer'
      | 'meeting'
      | 'other';

type ActivityItem = {
      id: number;
      code: string;
      title: string;
      activityType: ActivityType;
      status: ActivityStatus;
      activityDate: string;
      startTime: string;
      endTime: string;
      location: string;
      ownerGroup: string;
      expectedParticipants: number;
      actualParticipants: number;
      description: string;
      note?: string | null;
      sortOrder: number;
};

type ActivityFormData = {
      code: string;
      title: string;
      activityType: ActivityType;
      status: ActivityStatus;
      activityDate: string;
      startTime: string;
      endTime: string;
      location: string;
      ownerGroup: string;
      expectedParticipants: string;
      actualParticipants: string;
      description: string;
      note: string;
      sortOrder: string;
};

const initialActivities: ActivityItem[] = [
      {
            id: 1,
            code: 'COMMUNITY_MEETING_01',
            title: 'Sinh hoạt cộng đoàn tháng',
            activityType: 'community',
            status: 'scheduled',
            activityDate: '2026-06-15',
            startTime: '19:00',
            endTime: '20:30',
            location: 'Phòng sinh hoạt chung',
            ownerGroup: 'Ban sinh hoạt',
            expectedParticipants: 80,
            actualParticipants: 0,
            description: 'Buổi sinh hoạt định kỳ để trao đổi thông tin, nhắc lịch và gắn kết cộng đoàn.',
            note: '',
            sortOrder: 10,
      },
      {
            id: 2,
            code: 'CHARITY_VISIT',
            title: 'Thăm mái ấm địa phương',
            activityType: 'volunteer',
            status: 'scheduled',
            activityDate: '2026-07-05',
            startTime: '08:00',
            endTime: '11:30',
            location: 'Mái ấm địa phương',
            ownerGroup: 'Ban thiện nguyện',
            expectedParticipants: 25,
            actualParticipants: 0,
            description: 'Hoạt động thiện nguyện giúp học viên thực hành tinh thần phục vụ và trách nhiệm xã hội.',
            note: 'Cần chuẩn bị danh sách tham gia và phương tiện di chuyển.',
            sortOrder: 20,
      },
      {
            id: 3,
            code: 'SPORT_DAY',
            title: 'Giao lưu thể thao cuối tuần',
            activityType: 'sports',
            status: 'completed',
            activityDate: '2026-05-25',
            startTime: '15:00',
            endTime: '17:30',
            location: 'Sân thể thao',
            ownerGroup: 'Ban thể thao',
            expectedParticipants: 50,
            actualParticipants: 46,
            description: 'Tổ chức các hoạt động thể thao nhẹ để tăng cường sức khỏe và tinh thần đồng đội.',
            note: 'Hoạt động diễn ra tốt, cần bổ sung nước uống cho lần sau.',
            sortOrder: 30,
      },
];

const defaultFormData: ActivityFormData = {
      code: '',
      title: '',
      activityType: 'community',
      status: 'scheduled',
      activityDate: '',
      startTime: '19:00',
      endTime: '20:30',
      location: '',
      ownerGroup: '',
      expectedParticipants: '0',
      actualParticipants: '0',
      description: '',
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

function getActivityTypeLabel(type: ActivityType) {
      if (type === 'community') return 'Sinh hoạt cộng đoàn';
      if (type === 'spiritual') return 'Đời sống thiêng liêng';
      if (type === 'study') return 'Học tập';
      if (type === 'sports') return 'Thể thao';
      if (type === 'culture') return 'Văn hóa / Giao lưu';
      if (type === 'volunteer') return 'Thiện nguyện';
      if (type === 'meeting') return 'Họp / Trao đổi';
      return 'Khác';
}

function getActivityTypeClass(type: ActivityType) {
      if (type === 'community') return 'border-violet-200 bg-violet-50 text-violet-700';
      if (type === 'spiritual') return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      if (type === 'study') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (type === 'sports') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (type === 'culture') return 'border-pink-200 bg-pink-50 text-pink-700';
      if (type === 'volunteer') return 'border-orange-200 bg-orange-50 text-orange-700';
      if (type === 'meeting') return 'border-sky-200 bg-sky-50 text-sky-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getStatusLabel(status: ActivityStatus) {
      if (status === 'draft') return 'Nháp';
      if (status === 'scheduled') return 'Đã lên lịch';
      if (status === 'in_progress') return 'Đang diễn ra';
      if (status === 'completed') return 'Hoàn thành';
      return 'Đã hủy';
}

function getStatusClass(status: ActivityStatus) {
      if (status === 'draft') return 'border-slate-200 bg-slate-50 text-slate-700';
      if (status === 'scheduled') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (status === 'in_progress') return 'border-amber-200 bg-amber-50 text-amber-700';
      if (status === 'completed') return 'border-green-200 bg-green-50 text-green-700';
      return 'border-red-200 bg-red-50 text-red-700';
}

function formatDate(value: string) {
      if (!value) return '-';

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleDateString('vi-VN');
}

function formatTimeRange(startTime: string, endTime: string) {
      return `${startTime} - ${endTime}`;
}

function getNextId(items: ActivityItem[]) {
      return Math.max(...items.map((item) => item.id), 0) + 1;
}

function getNextSortOrder(items: ActivityItem[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function validateForm({
      items,
      formData,
      editingId,
}: {
      items: ActivityItem[];
      formData: ActivityFormData;
      editingId?: number;
}) {
      const code = normalizeCode(formData.code);

      if (!code) return 'Vui lòng nhập mã sự kiện.';
      if (!formData.title.trim()) return 'Vui lòng nhập tên sự kiện.';
      if (!formData.activityDate) return 'Vui lòng nhập ngày tổ chức.';
      if (!formData.startTime || !formData.endTime) return 'Vui lòng nhập giờ bắt đầu và kết thúc.';

      if (timeToMinutes(formData.endTime) <= timeToMinutes(formData.startTime)) {
            return 'Giờ kết thúc phải lớn hơn giờ bắt đầu.';
      }

      const expectedParticipants = Number(formData.expectedParticipants || 0);
      const actualParticipants = Number(formData.actualParticipants || 0);
      const sortOrder = Number(formData.sortOrder || 0);

      if (!Number.isFinite(expectedParticipants) || expectedParticipants < 0) {
            return 'Số người dự kiến phải là số lớn hơn hoặc bằng 0.';
      }

      if (!Number.isFinite(actualParticipants) || actualParticipants < 0) {
            return 'Số người tham gia thực tế phải là số lớn hơn hoặc bằng 0.';
      }

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCode = items
            .filter((item) => item.id !== editingId)
            .some((item) => normalizeText(item.code) === normalizeText(code));

      if (duplicatedCode) {
            return 'Mã sự kiện đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

export default function Activities() {
      const [items, setItems] = useState<ActivityItem[]>(initialActivities);
      const [searchTerm, setSearchTerm] = useState('');
      const [typeFilter, setTypeFilter] = useState<'all' | ActivityType>('all');
      const [statusFilter, setStatusFilter] = useState<'all' | ActivityStatus>('all');
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingItem, setEditingItem] = useState<ActivityItem | null>(null);
      const [formData, setFormData] = useState<ActivityFormData>(defaultFormData);
      const [error, setError] = useState<string | null>(null);

      const filteredItems = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return items
                  .filter((item) => {
                        if (typeFilter !== 'all' && item.activityType !== typeFilter) return false;
                        if (statusFilter !== 'all' && item.status !== statusFilter) return false;

                        if (!keyword) return true;

                        const haystack = [
                              item.code,
                              item.title,
                              getActivityTypeLabel(item.activityType),
                              getStatusLabel(item.status),
                              item.location,
                              item.ownerGroup,
                              item.description,
                              item.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => {
                        const dateCompare =
                              new Date(a.activityDate).getTime() -
                              new Date(b.activityDate).getTime();

                        if (dateCompare !== 0) return dateCompare;

                        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
                  });
      }, [items, searchTerm, typeFilter, statusFilter]);

      const stats = useMemo(() => {
            return {
                  total: items.length,
                  scheduled: items.filter((item) => item.status === 'scheduled').length,
                  inProgress: items.filter((item) => item.status === 'in_progress').length,
                  completed: items.filter((item) => item.status === 'completed').length,
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

      const openEditForm = (item: ActivityItem) => {
            setEditingItem(item);
            setFormData({
                  code: item.code,
                  title: item.title,
                  activityType: item.activityType,
                  status: item.status,
                  activityDate: item.activityDate,
                  startTime: item.startTime,
                  endTime: item.endTime,
                  location: item.location,
                  ownerGroup: item.ownerGroup,
                  expectedParticipants: String(item.expectedParticipants || 0),
                  actualParticipants: String(item.actualParticipants || 0),
                  description: item.description,
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

            const payload: ActivityItem = {
                  id: editingItem?.id || getNextId(items),
                  code: normalizeCode(formData.code),
                  title: formData.title.trim(),
                  activityType: formData.activityType,
                  status: formData.status,
                  activityDate: formData.activityDate,
                  startTime: formData.startTime,
                  endTime: formData.endTime,
                  location: formData.location.trim(),
                  ownerGroup: formData.ownerGroup.trim(),
                  expectedParticipants: Number(formData.expectedParticipants || 0),
                  actualParticipants: Number(formData.actualParticipants || 0),
                  description: formData.description.trim(),
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

      const handleDelete = (item: ActivityItem) => {
            if (!confirm(`Bạn có chắc chắn muốn xóa sự kiện "${item.title}"?`)) {
                  return;
            }

            setItems((current) => current.filter((row) => row.id !== item.id));
      };

      const clearFilters = () => {
            setSearchTerm('');
            setTypeFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<ActivityItem>[]>(
            () => [
                  {
                        key: 'title',
                        label: 'Sự kiện',
                        sortable: true,
                        sortValue: (item) => item.title,
                        render: (item) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{item.title}</p>
                                    <p className="mt-1 font-mono text-xs text-slate-500">
                                          {item.code}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'activityType',
                        label: 'Loại',
                        sortable: true,
                        sortValue: (item) => getActivityTypeLabel(item.activityType),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getActivityTypeClass(
                                          item.activityType
                                    )}`}
                              >
                                    {getActivityTypeLabel(item.activityType)}
                              </span>
                        ),
                  },
                  {
                        key: 'time',
                        label: 'Thời gian',
                        sortable: true,
                        sortValue: (item) => `${item.activityDate} ${item.startTime}`,
                        render: (item) => (
                              <div className="min-w-[150px]">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                          <CalendarDays className="h-4 w-4 text-slate-500" />
                                          {formatDate(item.activityDate)}
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
                        render: (item) => item.location || '-',
                  },
                  {
                        key: 'ownerGroup',
                        label: 'Phụ trách',
                        sortable: true,
                        sortValue: (item) => item.ownerGroup,
                        render: (item) => item.ownerGroup || '-',
                  },
                  {
                        key: 'participants',
                        label: 'Tham gia',
                        sortable: true,
                        sortValue: (item) => item.actualParticipants || item.expectedParticipants,
                        render: (item) => (
                              <span>
                                    {item.actualParticipants || 0}/{item.expectedParticipants || 0}
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
                        key: 'description',
                        label: 'Mô tả',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (item) => item.description,
                        render: (item) => item.description || '-',
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
                                          title="Sửa sự kiện"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => handleDelete(item)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa sự kiện"
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
                                          Sinh hoạt & Đời sống
                                    </p>
                                    <h1 className="mt-1 text-3xl font-bold text-neutral-900">
                                          Sự kiện
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Quản lý các sự kiện, buổi sinh hoạt, giao lưu, thiện nguyện và hoạt động đặc biệt trong lưu xá.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm sự kiện
                              </button>
                        </div>

                        {error && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">Có lỗi khi xử lý sự kiện.</p>
                                                <p className="mt-1 text-sm">{error}</p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="activities"
                                    cardKey="activities.total"
                                    label="Tổng sự kiện"
                                    value={stats.total}
                                    description="Tổng hoạt động đã khai báo"
                                    tone="blue"
                                    icon={<Sparkles className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="activities"
                                    cardKey="activities.scheduled"
                                    label="Đã lên lịch"
                                    value={stats.scheduled}
                                    description="Sự kiện sắp diễn ra"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="activities"
                                    cardKey="activities.inProgress"
                                    label="Đang diễn ra"
                                    value={stats.inProgress}
                                    description="Hoạt động đang thực hiện"
                                    tone="orange"
                                    icon={<Clock className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="activities"
                                    cardKey="activities.completed"
                                    label="Hoàn thành"
                                    value={stats.completed}
                                    description="Sự kiện đã kết thúc"
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
                                                placeholder="Tìm sự kiện, địa điểm, nhóm phụ trách..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={typeFilter}
                                          onChange={(event) =>
                                                setTypeFilter(
                                                      event.target.value as 'all' | ActivityType
                                                )
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả loại</option>
                                          <option value="community">Sinh hoạt cộng đoàn</option>
                                          <option value="spiritual">Đời sống thiêng liêng</option>
                                          <option value="study">Học tập</option>
                                          <option value="sports">Thể thao</option>
                                          <option value="culture">Văn hóa / Giao lưu</option>
                                          <option value="volunteer">Thiện nguyện</option>
                                          <option value="meeting">Họp / Trao đổi</option>
                                          <option value="other">Khác</option>
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(
                                                      event.target.value as 'all' | ActivityStatus
                                                )
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="draft">Nháp</option>
                                          <option value="scheduled">Đã lên lịch</option>
                                          <option value="in_progress">Đang diễn ra</option>
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

                        <ActivityCalendarPreview items={filteredItems} />

                        <ConfigurableDataTable
                              moduleKey="activities"
                              tableKey="activities.list"
                              columns={columns}
                              data={filteredItems}
                              getRowKey={(item) => item.id}
                              emptyTitle="Chưa có sự kiện"
                              emptyDescription="Thêm sự kiện để quản lý các hoạt động đặc biệt trong lưu xá."
                        />

                        {isFormOpen && (
                              <ActivityFormModal
                                    title={editingItem ? 'Cập nhật sự kiện' : 'Thêm sự kiện'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={handleSave}
                                    submitText={editingItem ? 'Cập nhật' : 'Thêm sự kiện'}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function ActivityCalendarPreview({ items }: { items: ActivityItem[] }) {
      if (items.length === 0) {
            return (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                        Không có sự kiện phù hợp với bộ lọc hiện tại.
                  </div>
            );
      }

      const visibleItems = items.slice(0, 6);

      return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                              <h2 className="text-lg font-bold text-neutral-900">
                                    Lịch sự kiện gần nhất
                              </h2>
                              <p className="mt-1 text-sm text-neutral-500">
                                    Theo dõi nhanh các hoạt động theo thời gian tổ chức.
                              </p>
                        </div>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {items.length} sự kiện
                        </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                        {visibleItems.map((item) => (
                              <div
                                    key={item.id}
                                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm"
                              >
                                    <div className="flex items-start justify-between gap-3">
                                          <div>
                                                <p className="text-sm font-bold text-slate-900">
                                                      {formatDate(item.activityDate)}
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
                                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getActivityTypeClass(
                                                      item.activityType
                                                )}`}
                                          >
                                                {getActivityTypeLabel(item.activityType)}
                                          </span>
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

function ActivityFormModal({
      title,
      formData,
      setFormData,
      error,
      onClose,
      onSubmit,
      submitText,
}: {
      title: string;
      formData: ActivityFormData;
      setFormData: React.Dispatch<React.SetStateAction<ActivityFormData>>;
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
                                          Khai báo nội dung, thời gian, địa điểm và nhóm phụ trách sự kiện.
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
                                          <Label htmlFor="code">Mã sự kiện</Label>
                                          <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: COMMUNITY_MEETING_01"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="title">Tên sự kiện</Label>
                                          <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            title: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Sinh hoạt cộng đoàn tháng"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="activityType">Loại sự kiện</Label>
                                          <select
                                                id="activityType"
                                                value={formData.activityType}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            activityType: event.target.value as ActivityType,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="community">Sinh hoạt cộng đoàn</option>
                                                <option value="spiritual">Đời sống thiêng liêng</option>
                                                <option value="study">Học tập</option>
                                                <option value="sports">Thể thao</option>
                                                <option value="culture">Văn hóa / Giao lưu</option>
                                                <option value="volunteer">Thiện nguyện</option>
                                                <option value="meeting">Họp / Trao đổi</option>
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
                                                            status: event.target.value as ActivityStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="draft">Nháp</option>
                                                <option value="scheduled">Đã lên lịch</option>
                                                <option value="in_progress">Đang diễn ra</option>
                                                <option value="completed">Hoàn thành</option>
                                                <option value="cancelled">Đã hủy</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="activityDate">Ngày tổ chức</Label>
                                          <Input
                                                id="activityDate"
                                                type="date"
                                                value={formData.activityDate}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            activityDate: event.target.value,
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
                                                placeholder="VD: Phòng sinh hoạt chung"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="ownerGroup">Nhóm phụ trách</Label>
                                          <Input
                                                id="ownerGroup"
                                                value={formData.ownerGroup}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            ownerGroup: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Ban sinh hoạt"
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
                                          <Label htmlFor="actualParticipants">Số người tham gia thực tế</Label>
                                          <Input
                                                id="actualParticipants"
                                                type="number"
                                                min={0}
                                                value={formData.actualParticipants}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            actualParticipants: event.target.value,
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
                              </div>

                              <div>
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea
                                          id="description"
                                          value={formData.description}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      description: event.target.value,
                                                })
                                          }
                                          placeholder="Mô tả mục tiêu, nội dung hoặc ý nghĩa của sự kiện"
                                          className="min-h-24"
                                    />
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
                                          placeholder="Ghi chú thêm về chuẩn bị, nhân sự hoặc lưu ý thực hiện"
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
