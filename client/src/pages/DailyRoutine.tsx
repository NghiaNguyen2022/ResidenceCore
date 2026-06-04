'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      Bell,
      BookOpenCheck,
      CalendarDays,
      CheckCircle2,
      Clock,
      Edit2,
      Moon,
      Plus,
      RefreshCcw,
      Search,
      SunMedium,
      Trash2,
      Users,
      Utensils,
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

import { trpc } from '@/lib/trpc';

type RoutineStatus = 'active' | 'inactive';
type RoutineCategory =
      | 'morning'
      | 'study'
      | 'meal'
      | 'community'
      | 'rest'
      | 'spiritual'
      | 'duty'
      | 'other';

type DailyRoutineItem = {
      id: number;
      routineDate: string;
      title: string;
      category: RoutineCategory;
      startTime: string;
      endTime: string;
      location: string;
      responsibleGroup: string;
      isRequired: boolean;
      status: RoutineStatus;
      note?: string | null;
      sortOrder: number;
};

type RoutineFormData = {
      routineDate: string;
      title: string;
      category: RoutineCategory;
      startTime: string;
      endTime: string;
      location: string;
      responsibleGroup: string;
      isRequired: boolean;
      status: RoutineStatus;
      note: string;
      sortOrder: string;
};

const todayString = new Date().toISOString().slice(0, 10);

const defaultFormData: RoutineFormData = {
      routineDate: todayString,
      title: '',
      category: 'other',
      startTime: '06:00',
      endTime: '06:30',
      location: '',
      responsibleGroup: '',
      isRequired: true,
      status: 'active',
      note: '',
      sortOrder: '10',
};

function normalizeText(value?: string | null) {
      return (value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
}

function getCategoryLabel(category: RoutineCategory) {
      if (category === 'morning') return 'Buổi sáng';
      if (category === 'study') return 'Học tập';
      if (category === 'meal') return 'Ăn uống';
      if (category === 'community') return 'Sinh hoạt chung';
      if (category === 'rest') return 'Nghỉ ngơi';
      if (category === 'spiritual') return 'Đời sống thiêng liêng';
      if (category === 'duty') return 'Công tác';
      return 'Khác';
}

function getCategoryClass(category: RoutineCategory) {
      if (category === 'morning') return 'border-amber-200 bg-amber-50 text-amber-700';
      if (category === 'study') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (category === 'meal') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (category === 'community') return 'border-violet-200 bg-violet-50 text-violet-700';
      if (category === 'rest') return 'border-slate-200 bg-slate-50 text-slate-700';
      if (category === 'spiritual') return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      if (category === 'duty') return 'border-orange-200 bg-orange-50 text-orange-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getCategoryIcon(category: RoutineCategory) {
      if (category === 'morning') return <SunMedium className="h-4 w-4" />;
      if (category === 'study') return <BookOpenCheck className="h-4 w-4" />;
      if (category === 'meal') return <Utensils className="h-4 w-4" />;
      if (category === 'community') return <Users className="h-4 w-4" />;
      if (category === 'rest') return <Moon className="h-4 w-4" />;
      if (category === 'spiritual') return <Bell className="h-4 w-4" />;
      return <CalendarDays className="h-4 w-4" />;
}

function timeToMinutes(value: string) {
      const [hour, minute] = value.split(':').map(Number);
      if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;
      return hour * 60 + minute;
}

function formatTimeRange(startTime: string, endTime: string) {
      if (!startTime && !endTime) return '--:--';
      if (!endTime) return startTime;
      return `${startTime} - ${endTime}`;
}

function normalizeTime(value?: string | null) {
      if (!value) return '';
      return String(value).slice(0, 5);
}

function toApiTime(value: string) {
      return value ? `${value}:00` : null;
}

function normalizeDate(value: unknown) {
      if (!value) return todayString;

      if (value instanceof Date) {
            return value.toISOString().slice(0, 10);
      }

      return String(value).slice(0, 10);
}

function normalizeCategory(value?: string | null): RoutineCategory {
      const category = value as RoutineCategory;

      if (
            category === 'morning' ||
            category === 'study' ||
            category === 'meal' ||
            category === 'community' ||
            category === 'rest' ||
            category === 'spiritual' ||
            category === 'duty' ||
            category === 'other'
      ) {
            return category;
      }

      return 'other';
}

function validateForm(formData: RoutineFormData) {
      const title = formData.title.trim();

      if (!formData.routineDate) return 'Vui lòng chọn ngày sinh hoạt.';
      if (!title) return 'Vui lòng nhập tên hoạt động.';

      if (!formData.startTime || !formData.endTime) {
            return 'Vui lòng nhập thời gian bắt đầu và kết thúc.';
      }

      if (timeToMinutes(formData.endTime) <= timeToMinutes(formData.startTime)) {
            return 'Giờ kết thúc phải lớn hơn giờ bắt đầu.';
      }

      const sortOrder = Number(formData.sortOrder);

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      return null;
}

function getNextSortOrder(items: DailyRoutineItem[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function mapRoutine(row: any): DailyRoutineItem {
      return {
            id: Number(row.id),
            routineDate: normalizeDate(row.routineDate),
            title: row.title || '',
            category: normalizeCategory(row.category),
            startTime: normalizeTime(row.startTime),
            endTime: normalizeTime(row.endTime),
            location: row.location || '',
            responsibleGroup: row.responsibleLabel || '',
            isRequired: Number(row.isRequired ?? 1) === 1,
            status: Number(row.isActive ?? 1) === 1 ? 'active' : 'inactive',
            note: row.description || row.notes || '',
            sortOrder: Number(row.displayOrder || 0),
      };
}

export default function DailyRoutine() {
      const [selectedDate, setSelectedDate] = useState(todayString);
      const [searchTerm, setSearchTerm] = useState('');
      const [categoryFilter, setCategoryFilter] = useState<'all' | RoutineCategory>('all');
      const [statusFilter, setStatusFilter] = useState<'all' | RoutineStatus>('all');

      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingItem, setEditingItem] = useState<DailyRoutineItem | null>(null);
      const [formData, setFormData] = useState<RoutineFormData>({
            ...defaultFormData,
            routineDate: selectedDate,
      });
      const [error, setError] = useState<string | null>(null);
      const [message, setMessage] = useState<string | null>(null);

      const routinesQuery = trpc.dailyRoutine.list.useQuery({
            fromDate: selectedDate,
            toDate: selectedDate,
            status: 'all',
      });

      const createRoutine = trpc.dailyRoutine.create.useMutation();
      const updateRoutine = trpc.dailyRoutine.update.useMutation();
      const deleteRoutine = trpc.dailyRoutine.delete.useMutation();

      const items = useMemo(() => {
            return (routinesQuery.data || [])
                  .map(mapRoutine)
                  .sort((a, b) => {
                        const sortCompare = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
                        if (sortCompare !== 0) return sortCompare;

                        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
                  });
      }, [routinesQuery.data]);

      const filteredItems = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return items.filter((item) => {
                  if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
                  if (statusFilter !== 'all' && item.status !== statusFilter) return false;

                  if (!keyword) return true;

                  const haystack = [
                        item.title,
                        item.location,
                        item.responsibleGroup,
                        item.note,
                        getCategoryLabel(item.category),
                  ]
                        .map((value) => normalizeText(value))
                        .join(' ');

                  return haystack.includes(keyword);
            });
      }, [items, searchTerm, categoryFilter, statusFilter]);

      const stats = useMemo(() => {
            return {
                  total: items.length,
                  active: items.filter((item) => item.status === 'active').length,
                  required: items.filter((item) => item.isRequired).length,
                  study: items.filter((item) => item.category === 'study').length,
            };
      }, [items]);

      const refetch = async () => {
            await routinesQuery.refetch();
      };

      const openCreateForm = () => {
            setEditingItem(null);
            setFormData({
                  ...defaultFormData,
                  routineDate: selectedDate,
                  sortOrder: getNextSortOrder(items),
            });
            setError(null);
            setMessage(null);
            setIsFormOpen(true);
      };

      const openEditForm = (item: DailyRoutineItem) => {
            setEditingItem(item);
            setFormData({
                  routineDate: item.routineDate,
                  title: item.title,
                  category: item.category,
                  startTime: item.startTime,
                  endTime: item.endTime,
                  location: item.location,
                  responsibleGroup: item.responsibleGroup,
                  isRequired: item.isRequired,
                  status: item.status,
                  note: item.note || '',
                  sortOrder: String(item.sortOrder || 0),
            });
            setError(null);
            setMessage(null);
            setIsFormOpen(true);
      };

      const closeForm = () => {
            setIsFormOpen(false);
            setEditingItem(null);
            setFormData({
                  ...defaultFormData,
                  routineDate: selectedDate,
            });
            setError(null);
      };

      const buildPayload = () => ({
            routineDate: formData.routineDate,
            startTime: toApiTime(formData.startTime),
            endTime: toApiTime(formData.endTime),
            title: formData.title.trim(),
            description: formData.note.trim() || null,
            location: formData.location.trim() || null,
            category: formData.category,
            responsibleLabel: formData.responsibleGroup.trim() || null,
            assigneeType: 'all' as const,
            assigneeId: null,
            status: 'pending' as const,
            isRequired: formData.isRequired,
            displayOrder: Number(formData.sortOrder || 0),
            routineType: 'daily' as const,
            isActive: formData.status === 'active',
            notes: formData.note.trim() || null,
      });

      const handleSave = async () => {
            const validationMessage = validateForm(formData);

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            setError(null);
            setMessage(null);

            try {
                  const payload = buildPayload();

                  if (editingItem) {
                        await updateRoutine.mutateAsync({
                              id: editingItem.id,
                              ...payload,
                        });

                        setMessage('Đã cập nhật lịch sinh hoạt.');
                  } else {
                        await createRoutine.mutateAsync(payload);
                        setMessage('Đã thêm lịch sinh hoạt.');
                  }

                  closeForm();
                  await refetch();
            } catch (err: any) {
                  setError(err?.message || 'Không thể lưu lịch sinh hoạt. Vui lòng kiểm tra lại thông tin.');
            }
      };

      const handleDelete = async (item: DailyRoutineItem) => {
            if (!confirm(`Bạn có chắc chắn muốn xóa lịch "${item.title}"?`)) {
                  return;
            }

            setError(null);
            setMessage(null);

            try {
                  await deleteRoutine.mutateAsync({ id: item.id });
                  setMessage('Đã xóa lịch sinh hoạt.');
                  await refetch();
            } catch (err: any) {
                  setError(err?.message || 'Không thể xóa lịch sinh hoạt.');
            }
      };

      const handleToggleStatus = async (item: DailyRoutineItem) => {
            setError(null);
            setMessage(null);

            try {
                  await updateRoutine.mutateAsync({
                        id: item.id,
                        isActive: item.status !== 'active',
                  });

                  setMessage(
                        item.status === 'active'
                              ? 'Đã ngưng áp dụng lịch sinh hoạt.'
                              : 'Đã kích hoạt lịch sinh hoạt.'
                  );

                  await refetch();
            } catch (err: any) {
                  setError(err?.message || 'Không thể cập nhật trạng thái lịch sinh hoạt.');
            }
      };

      const clearFilters = () => {
            setSearchTerm('');
            setCategoryFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<DailyRoutineItem>[]>(
            () => [
                  {
                        key: 'time',
                        label: 'Thời gian',
                        sortable: true,
                        sortValue: (item) => timeToMinutes(item.startTime),
                        render: (item) => (
                              <div className="min-w-[120px]">
                                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                                          <Clock className="h-4 w-4 text-slate-500" />
                                          {formatTimeRange(item.startTime, item.endTime)}
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">{item.routineDate}</p>
                              </div>
                        ),
                  },
                  {
                        key: 'activity',
                        label: 'Hoạt động',
                        sortable: true,
                        sortValue: (item) => item.title,
                        render: (item) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{item.title}</p>
                                    {item.note && (
                                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                                {item.note}
                                          </p>
                                    )}
                              </div>
                        ),
                  },
                  {
                        key: 'category',
                        label: 'Nhóm',
                        sortable: true,
                        sortValue: (item) => getCategoryLabel(item.category),
                        render: (item) => (
                              <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getCategoryClass(
                                          item.category
                                    )}`}
                              >
                                    {getCategoryIcon(item.category)}
                                    {getCategoryLabel(item.category)}
                              </span>
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
                        key: 'responsibleGroup',
                        label: 'Phụ trách',
                        sortable: true,
                        sortValue: (item) => item.responsibleGroup,
                        render: (item) => item.responsibleGroup || '-',
                  },
                  {
                        key: 'isRequired',
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
                        sortValue: (item) => item.status,
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${item.status === 'active'
                                          ? 'border-green-200 bg-green-50 text-green-700'
                                          : 'border-neutral-200 bg-neutral-100 text-neutral-600'
                                          }`}
                              >
                                    {item.status === 'active' ? 'Đang áp dụng' : 'Ngưng áp dụng'}
                              </span>
                        ),
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[220px]',
                        render: (item) => (
                              <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                          type="button"
                                          onClick={() => handleToggleStatus(item)}
                                          className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${item.status === 'active'
                                                ? 'text-orange-700 hover:bg-orange-50'
                                                : 'text-green-700 hover:bg-green-50'
                                                }`}
                                    >
                                          {item.status === 'active' ? 'Ngưng' : 'Kích hoạt'}
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => openEditForm(item)}
                                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                          title="Sửa lịch sinh hoạt"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => handleDelete(item)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa lịch sinh hoạt"
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              </div>
                        ),
                  },
            ],
            [handleToggleStatus, openEditForm]
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
                                          Lịch sinh hoạt hằng ngày
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Thiết lập các khung giờ sinh hoạt, học tập, nghỉ ngơi và hoạt động chung để duy trì nề nếp trong lưu xá.
                                    </p>
                              </div>

                              <div className="flex flex-col gap-2 sm:flex-row">
                                    <button
                                          type="button"
                                          onClick={() => refetch()}
                                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                    >
                                          <RefreshCcw className="h-4 w-4" />
                                          Làm mới
                                    </button>

                                    <button
                                          type="button"
                                          onClick={openCreateForm}
                                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                    >
                                          <Plus className="h-4 w-4" />
                                          Thêm lịch sinh hoạt
                                    </button>
                              </div>
                        </div>

                        {error && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">
                                                      Có lỗi khi xử lý lịch sinh hoạt.
                                                </p>
                                                <p className="mt-1 text-sm">{error}</p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        {message && (
                              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
                                    {message}
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="dailyRoutine"
                                    cardKey="dailyRoutine.total"
                                    label="Tổng lịch"
                                    value={stats.total}
                                    description="Tổng số khung giờ trong ngày"
                                    tone="blue"
                                    icon={<CalendarDays className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="dailyRoutine"
                                    cardKey="dailyRoutine.active"
                                    label="Đang áp dụng"
                                    value={stats.active}
                                    description="Khung giờ đang được sử dụng"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="dailyRoutine"
                                    cardKey="dailyRoutine.required"
                                    label="Bắt buộc"
                                    value={stats.required}
                                    description="Hoạt động cần tham gia đầy đủ"
                                    tone="orange"
                                    icon={<Bell className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="dailyRoutine"
                                    cardKey="dailyRoutine.study"
                                    label="Học tập"
                                    value={stats.study}
                                    description="Khung giờ liên quan đến học tập"
                                    tone="purple"
                                    icon={<BookOpenCheck className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[180px_1fr_220px_220px_auto]">
                                    <Input
                                          type="date"
                                          value={selectedDate}
                                          onChange={(event) => {
                                                setSelectedDate(event.target.value);
                                                setFormData((current) => ({
                                                      ...current,
                                                      routineDate: event.target.value,
                                                }));
                                          }}
                                    />

                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm hoạt động, địa điểm, nhóm phụ trách..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={categoryFilter}
                                          onChange={(event) =>
                                                setCategoryFilter(
                                                      event.target.value as 'all' | RoutineCategory
                                                )
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả nhóm</option>
                                          <option value="morning">Buổi sáng</option>
                                          <option value="study">Học tập</option>
                                          <option value="meal">Ăn uống</option>
                                          <option value="community">Sinh hoạt chung</option>
                                          <option value="rest">Nghỉ ngơi</option>
                                          <option value="spiritual">Đời sống thiêng liêng</option>
                                          <option value="duty">Công tác</option>
                                          <option value="other">Khác</option>
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(
                                                      event.target.value as 'all' | RoutineStatus
                                                )
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="active">Đang áp dụng</option>
                                          <option value="inactive">Ngưng áp dụng</option>
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

                        {routinesQuery.isLoading ? (
                              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
                                    Đang tải lịch sinh hoạt...
                              </div>
                        ) : (
                              <>
                                    <DailyRoutineTimeline items={filteredItems} />

                                    <ConfigurableDataTable
                                          moduleKey="dailyRoutine"
                                          tableKey="dailyRoutine.list"
                                          columns={columns}
                                          data={filteredItems}
                                          getRowKey={(item) => item.id}
                                          emptyTitle="Chưa có lịch sinh hoạt"
                                          emptyDescription="Thêm lịch sinh hoạt để thiết lập nề nếp hằng ngày trong lưu xá."
                                    />
                              </>
                        )}

                        {isFormOpen && (
                              <RoutineFormModal
                                    title={editingItem ? 'Cập nhật lịch sinh hoạt' : 'Thêm lịch sinh hoạt'}
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

function DailyRoutineTimeline({ items }: { items: DailyRoutineItem[] }) {
      if (items.length === 0) {
            return (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                        Không có lịch sinh hoạt phù hợp với bộ lọc hiện tại.
                  </div>
            );
      }

      return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                              <h2 className="text-lg font-bold text-neutral-900">
                                    Dòng thời gian sinh hoạt
                              </h2>
                              <p className="mt-1 text-sm text-neutral-500">
                                    Tổng quan các hoạt động theo thứ tự thời gian trong ngày.
                              </p>
                        </div>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {items.length} hoạt động
                        </span>
                  </div>

                  <div className="space-y-3">
                        {items.map((item) => (
                              <div
                                    key={item.id}
                                    className={`grid grid-cols-1 gap-3 rounded-2xl border p-4 md:grid-cols-[130px_1fr_auto] ${item.status === 'active'
                                          ? 'border-slate-200 bg-gradient-to-r from-white to-slate-50/70'
                                          : 'border-neutral-200 bg-neutral-50 opacity-70'
                                          }`}
                              >
                                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                                          <Clock className="h-4 w-4 text-slate-500" />
                                          {formatTimeRange(item.startTime, item.endTime)}
                                    </div>

                                    <div>
                                          <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-bold text-slate-900">{item.title}</p>
                                                <span
                                                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getCategoryClass(
                                                            item.category
                                                      )}`}
                                                >
                                                      {getCategoryIcon(item.category)}
                                                      {getCategoryLabel(item.category)}
                                                </span>
                                          </div>

                                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                <span>{item.location || 'Chưa ghi địa điểm'}</span>
                                                <span>·</span>
                                                <span>{item.responsibleGroup || 'Chưa phân công'}</span>
                                          </div>
                                    </div>

                                    <div className="flex items-center gap-2 md:justify-end">
                                          <span
                                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${item.isRequired
                                                      ? 'border-red-200 bg-red-50 text-red-700'
                                                      : 'border-slate-200 bg-slate-50 text-slate-600'
                                                      }`}
                                          >
                                                {item.isRequired ? 'Bắt buộc' : 'Khuyến khích'}
                                          </span>
                                    </div>
                              </div>
                        ))}
                  </div>
            </div>
      );
}

function RoutineFormModal({
      title,
      formData,
      setFormData,
      error,
      onClose,
      onSubmit,
      submitText,
}: {
      title: string;
      formData: RoutineFormData;
      setFormData: React.Dispatch<React.SetStateAction<RoutineFormData>>;
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
                                          Khai báo khung giờ, nội dung và nhóm phụ trách sinh hoạt.
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
                                          <Label htmlFor="routineDate">Ngày sinh hoạt</Label>
                                          <Input
                                                id="routineDate"
                                                type="date"
                                                value={formData.routineDate}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            routineDate: event.target.value,
                                                      })
                                                }
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="title">Tên hoạt động</Label>
                                          <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            title: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Giờ học buổi tối"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="category">Nhóm hoạt động</Label>
                                          <select
                                                id="category"
                                                value={formData.category}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            category: event.target.value as RoutineCategory,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="morning">Buổi sáng</option>
                                                <option value="study">Học tập</option>
                                                <option value="meal">Ăn uống</option>
                                                <option value="community">Sinh hoạt chung</option>
                                                <option value="rest">Nghỉ ngơi</option>
                                                <option value="spiritual">Đời sống thiêng liêng</option>
                                                <option value="duty">Công tác</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="status">Trạng thái áp dụng</Label>
                                          <select
                                                id="status"
                                                value={formData.status}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            status: event.target.value as RoutineStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="active">Đang áp dụng</option>
                                                <option value="inactive">Ngưng áp dụng</option>
                                          </select>
                                    </div>

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
                                                placeholder="VD: Phòng học chung"
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
                                                placeholder="VD: Ban học tập, Tổ trực"
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
                                                            Đây là hoạt động bắt buộc
                                                      </Label>
                                                      <p className="text-xs text-neutral-500">
                                                            Dùng để phân biệt các khung giờ cần tham gia đầy đủ và các hoạt động khuyến khích.
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
                                          placeholder="Ghi chú thêm về quy định hoặc hướng dẫn thực hiện"
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
