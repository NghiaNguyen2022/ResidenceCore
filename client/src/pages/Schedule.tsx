'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      CalendarDays,
      CheckCircle2,
      Edit2,
      GraduationCap,
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

type ScheduleStatus = 'active' | 'inactive';
type StudyMode = 'school' | 'online' | 'self_study' | 'extra_class' | 'exam' | 'other';
type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 0;

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
      schoolName?: string | null;
      majorName?: string | null;
};

type StudyScheduleItem = {
      id: number;
      code: string;
      residentId: number | null;
      residentName: string;
      roomLabel: string;
      schoolName: string;
      majorName: string;
      subjectName: string;
      studyMode: StudyMode;
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
      location: string;
      semester: string;
      status: ScheduleStatus;
      note?: string | null;
      sortOrder: number;
};

type ScheduleFormData = {
      code: string;
      residentId: string;
      schoolName: string;
      majorName: string;
      subjectName: string;
      studyMode: StudyMode;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      location: string;
      semester: string;
      status: ScheduleStatus;
      note: string;
      sortOrder: string;
};

const initialSchedules: StudyScheduleItem[] = [
      {
            id: 1,
            code: 'SCH-2026-001',
            residentId: null,
            residentName: 'Nguyễn Văn A',
            roomLabel: 'Phòng 101',
            schoolName: 'Trường Đại học Khoa học Tự nhiên',
            majorName: 'Công nghệ thông tin',
            subjectName: 'Lập trình cơ bản',
            studyMode: 'school',
            dayOfWeek: 2,
            startTime: '07:30',
            endTime: '11:00',
            location: 'Cơ sở chính',
            semester: 'HK2 2025-2026',
            status: 'active',
            note: 'Lịch học tham chiếu để tránh phân công trực nhật trùng giờ.',
            sortOrder: 10,
      },
      {
            id: 2,
            code: 'SCH-2026-002',
            residentId: null,
            residentName: 'Trần Thị B',
            roomLabel: 'Phòng 203',
            schoolName: 'Trường Đại học Kinh tế - Luật',
            majorName: 'Quản trị kinh doanh',
            subjectName: 'Kinh tế vi mô',
            studyMode: 'school',
            dayOfWeek: 4,
            startTime: '13:00',
            endTime: '16:30',
            location: 'Giảng đường B',
            semester: 'HK2 2025-2026',
            status: 'active',
            note: '',
            sortOrder: 20,
      },
      {
            id: 3,
            code: 'SCH-2026-003',
            residentId: null,
            residentName: 'Lê Văn C',
            roomLabel: 'Phòng 305',
            schoolName: 'Trường Cao đẳng Kỹ thuật',
            majorName: 'Kỹ thuật điện',
            subjectName: 'Ôn tập cuối kỳ',
            studyMode: 'self_study',
            dayOfWeek: 6,
            startTime: '19:00',
            endTime: '21:00',
            location: 'Phòng học chung',
            semester: 'HK2 2025-2026',
            status: 'active',
            note: 'Có thể dùng để theo dõi giờ học tối.',
            sortOrder: 30,
      },
];

const defaultFormData: ScheduleFormData = {
      code: '',
      residentId: '',
      schoolName: '',
      majorName: '',
      subjectName: '',
      studyMode: 'school',
      dayOfWeek: '2',
      startTime: '07:30',
      endTime: '11:00',
      location: '',
      semester: '',
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

function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9-]+/g, '-')
            .replace(/^-+|-+$/g, '');
}

function buildScheduleCode(items: StudyScheduleItem[]) {
      const year = new Date().getFullYear();
      const nextNumber = Math.max(...items.map((item) => item.id), 0) + 1;

      return `SCH-${year}-${String(nextNumber).padStart(3, '0')}`;
}

function getResidentName(resident?: Resident | null) {
      return resident?.fullName || resident?.name || 'Chưa có tên';
}

function getResidentCode(resident?: Resident | null) {
      return resident?.residentCode || resident?.code || '';
}

function getRoomLabel(resident?: Resident | null) {
      if (!resident) return '';

      if (resident.roomCode && resident.roomName) {
            return `${resident.roomCode} - ${resident.roomName}`;
      }

      if (resident.roomCode) return resident.roomCode;
      if (resident.roomName) return resident.roomName;
      if (resident.roomId) return `Phòng ${resident.roomId}`;

      return 'Chưa có phòng';
}

function isActiveResident(resident: Resident) {
      const status = normalizeText(resident.status);

      if (!status) return true;

      return ![
            'inactive',
            'left',
            'ended',
            'archived',
            'da roi',
            'nghi',
            'ngung',
      ].includes(status);
}

function timeToMinutes(value: string) {
      const [hour, minute] = value.split(':').map(Number);

      if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;

      return hour * 60 + minute;
}

function formatTimeRange(startTime: string, endTime: string) {
      return `${startTime} - ${endTime}`;
}

function getDayLabel(day: DayOfWeek) {
      if (day === 0) return 'Chủ Nhật';
      if (day === 1) return 'Thứ Hai';
      if (day === 2) return 'Thứ Ba';
      if (day === 3) return 'Thứ Tư';
      if (day === 4) return 'Thứ Năm';
      if (day === 5) return 'Thứ Sáu';

      return 'Thứ Bảy';
}

function getStudyModeLabel(mode: StudyMode) {
      if (mode === 'school') return 'Học tại trường';
      if (mode === 'online') return 'Học online';
      if (mode === 'self_study') return 'Tự học';
      if (mode === 'extra_class') return 'Học thêm';
      if (mode === 'exam') return 'Thi / Kiểm tra';

      return 'Khác';
}

function getStudyModeClass(mode: StudyMode) {
      if (mode === 'school') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (mode === 'online') return 'border-sky-200 bg-sky-50 text-sky-700';
      if (mode === 'self_study') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (mode === 'extra_class') return 'border-violet-200 bg-violet-50 text-violet-700';
      if (mode === 'exam') return 'border-orange-200 bg-orange-50 text-orange-700';

      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getStatusLabel(status: ScheduleStatus) {
      if (status === 'active') return 'Đang áp dụng';

      return 'Ngưng áp dụng';
}

function getStatusClass(status: ScheduleStatus) {
      if (status === 'active') return 'border-green-200 bg-green-50 text-green-700';

      return 'border-neutral-200 bg-neutral-100 text-neutral-600';
}

function getNextId(items: StudyScheduleItem[]) {
      return Math.max(...items.map((item) => item.id), 0) + 1;
}

function getNextSortOrder(items: StudyScheduleItem[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function validateForm({
      schedules,
      formData,
      editingId,
}: {
      schedules: StudyScheduleItem[];
      formData: ScheduleFormData;
      editingId?: number;
}) {
      const code = normalizeCode(formData.code);

      if (!code) return 'Vui lòng nhập mã lịch học.';
      if (!formData.subjectName.trim()) return 'Vui lòng nhập tên môn học / nội dung học.';
      if (!formData.startTime || !formData.endTime) {
            return 'Vui lòng nhập giờ bắt đầu và kết thúc.';
      }

      if (timeToMinutes(formData.endTime) <= timeToMinutes(formData.startTime)) {
            return 'Giờ kết thúc phải lớn hơn giờ bắt đầu.';
      }

      const sortOrder = Number(formData.sortOrder || 0);

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCode = schedules
            .filter((item) => item.id !== editingId)
            .some((item) => normalizeText(item.code) === normalizeText(code));

      if (duplicatedCode) {
            return 'Mã lịch học đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

export default function Schedule() {
      const [schedules, setSchedules] = useState<StudyScheduleItem[]>(initialSchedules);
      const [searchTerm, setSearchTerm] = useState('');
      const [dayFilter, setDayFilter] = useState<'all' | string>('all');
      const [modeFilter, setModeFilter] = useState<'all' | StudyMode>('all');
      const [statusFilter, setStatusFilter] = useState<'all' | ScheduleStatus>('all');

      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingSchedule, setEditingSchedule] = useState<StudyScheduleItem | null>(null);
      const [formData, setFormData] = useState<ScheduleFormData>(defaultFormData);
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

      const filteredSchedules = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return schedules
                  .filter((item) => {
                        if (dayFilter !== 'all' && String(item.dayOfWeek) !== dayFilter) {
                              return false;
                        }

                        if (modeFilter !== 'all' && item.studyMode !== modeFilter) {
                              return false;
                        }

                        if (statusFilter !== 'all' && item.status !== statusFilter) {
                              return false;
                        }

                        if (!keyword) return true;

                        const haystack = [
                              item.code,
                              item.residentName,
                              item.roomLabel,
                              item.schoolName,
                              item.majorName,
                              item.subjectName,
                              getStudyModeLabel(item.studyMode),
                              getDayLabel(item.dayOfWeek),
                              item.location,
                              item.semester,
                              item.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => {
                        if (a.dayOfWeek !== b.dayOfWeek) {
                              return Number(a.dayOfWeek) - Number(b.dayOfWeek);
                        }

                        const timeCompare = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);

                        if (timeCompare !== 0) return timeCompare;

                        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
                  });
      }, [schedules, searchTerm, dayFilter, modeFilter, statusFilter]);

      const stats = useMemo(() => {
            return {
                  total: schedules.length,
                  active: schedules.filter((item) => item.status === 'active').length,
                  residents: new Set(
                        schedules
                              .filter((item) => item.residentName)
                              .map((item) => item.residentName)
                  ).size,
                  exam: schedules.filter((item) => item.studyMode === 'exam').length,
            };
      }, [schedules]);

      const openCreateForm = () => {
            setEditingSchedule(null);
            setFormData({
                  ...defaultFormData,
                  code: buildScheduleCode(schedules),
                  sortOrder: getNextSortOrder(schedules),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (item: StudyScheduleItem) => {
            setEditingSchedule(item);
            setFormData({
                  code: item.code,
                  residentId: item.residentId ? String(item.residentId) : '',
                  schoolName: item.schoolName,
                  majorName: item.majorName,
                  subjectName: item.subjectName,
                  studyMode: item.studyMode,
                  dayOfWeek: String(item.dayOfWeek),
                  startTime: item.startTime,
                  endTime: item.endTime,
                  location: item.location,
                  semester: item.semester,
                  status: item.status,
                  note: item.note || '',
                  sortOrder: String(item.sortOrder || 0),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const closeForm = () => {
            setIsFormOpen(false);
            setEditingSchedule(null);
            setFormData(defaultFormData);
            setError(null);
      };

      const saveSchedule = () => {
            const validationMessage = validateForm({
                  schedules,
                  formData,
                  editingId: editingSchedule?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const selectedResident = formData.residentId
                  ? residents.find((resident) => resident.id === Number(formData.residentId))
                  : null;

            const payload: StudyScheduleItem = {
                  id: editingSchedule?.id || getNextId(schedules),
                  code: normalizeCode(formData.code),
                  residentId: selectedResident?.id || null,
                  residentName: selectedResident
                        ? getResidentName(selectedResident)
                        : editingSchedule?.residentName || 'Chưa chọn học viên',
                  roomLabel: selectedResident
                        ? getRoomLabel(selectedResident)
                        : editingSchedule?.roomLabel || '',
                  schoolName:
                        formData.schoolName.trim() ||
                        selectedResident?.schoolName ||
                        editingSchedule?.schoolName ||
                        '',
                  majorName:
                        formData.majorName.trim() ||
                        selectedResident?.majorName ||
                        editingSchedule?.majorName ||
                        '',
                  subjectName: formData.subjectName.trim(),
                  studyMode: formData.studyMode,
                  dayOfWeek: Number(formData.dayOfWeek) as DayOfWeek,
                  startTime: formData.startTime,
                  endTime: formData.endTime,
                  location: formData.location.trim(),
                  semester: formData.semester.trim(),
                  status: formData.status,
                  note: formData.note.trim() || null,
                  sortOrder: Number(formData.sortOrder || 0),
            };

            if (editingSchedule) {
                  setSchedules((current) =>
                        current.map((item) => (item.id === editingSchedule.id ? payload : item))
                  );
            } else {
                  setSchedules((current) => [...current, payload]);
            }

            closeForm();
      };

      const deleteSchedule = (item: StudyScheduleItem) => {
            if (!confirm(`Bạn có chắc chắn muốn xóa lịch học "${item.subjectName}"?`)) {
                  return;
            }

            setSchedules((current) => current.filter((row) => row.id !== item.id));
      };

      const clearFilters = () => {
            setSearchTerm('');
            setDayFilter('all');
            setModeFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<StudyScheduleItem>[]>(
            () => [
                  {
                        key: 'resident',
                        label: 'Học viên',
                        sortable: true,
                        sortValue: (item) => item.residentName,
                        render: (item) => (
                              <div>
                                    <p className="font-semibold text-slate-900">
                                          {item.residentName}
                                    </p>
                                    {item.roomLabel && (
                                          <p className="mt-1 text-xs text-slate-500">
                                                {item.roomLabel}
                                          </p>
                                    )}
                              </div>
                        ),
                  },
                  {
                        key: 'subject',
                        label: 'Thông tin học',
                        sortable: true,
                        sortValue: (item) => item.subjectName,
                        render: (item) => (
                              <div>
                                    <p className="font-semibold text-slate-900">
                                          {item.subjectName}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                          {item.schoolName || 'Chưa có trường'} ·{' '}
                                          {item.majorName || 'Chưa có ngành'}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'mode',
                        label: 'Hình thức',
                        sortable: true,
                        sortValue: (item) => getStudyModeLabel(item.studyMode),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStudyModeClass(
                                          item.studyMode
                                    )}`}
                              >
                                    {getStudyModeLabel(item.studyMode)}
                              </span>
                        ),
                  },
                  {
                        key: 'time',
                        label: 'Thời gian',
                        sortable: true,
                        sortValue: (item) => `${item.dayOfWeek}-${item.startTime}`,
                        render: (item) => (
                              <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                          <CalendarDays className="h-4 w-4 text-slate-500" />
                                          {getDayLabel(item.dayOfWeek)}
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
                        key: 'semester',
                        label: 'Học kỳ',
                        sortable: true,
                        sortValue: (item) => item.semester,
                        render: (item) => item.semester || '-',
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
                        defaultVisible: false,
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
                                          title="Sửa lịch học"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => deleteSchedule(item)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa lịch học"
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              </div>
                        ),
                  },
            ],
            [residents, schedules]
      );

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                    <p className="text-sm font-semibold text-blue-600">
                                          Học vụ & Phát triển
                                    </p>
                                    <h1 className="mt-1 text-3xl font-bold text-neutral-900">
                                          Lịch học
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Theo dõi lịch học cơ bản của học viên để hỗ trợ điểm danh, sắp xếp sinh hoạt và phân công công tác phù hợp.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm lịch học
                              </button>
                        </div>

                        {(error || membersQuery.error) && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">
                                                      Có lỗi khi xử lý lịch học.
                                                </p>
                                                <p className="mt-1 text-sm">
                                                      {error ||
                                                            membersQuery.error?.message ||
                                                            'Vui lòng kiểm tra lại dữ liệu.'}
                                                </p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="schedule"
                                    cardKey="schedule.total"
                                    label="Tổng lịch học"
                                    value={stats.total}
                                    description="Tổng số lịch đã khai báo"
                                    tone="blue"
                                    icon={<CalendarDays className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="schedule"
                                    cardKey="schedule.active"
                                    label="Đang áp dụng"
                                    value={stats.active}
                                    description="Lịch còn hiệu lực"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="schedule"
                                    cardKey="schedule.residents"
                                    label="Học viên"
                                    value={stats.residents}
                                    description="Học viên đã có lịch học"
                                    tone="orange"
                                    icon={<Users className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="schedule"
                                    cardKey="schedule.exam"
                                    label="Lịch thi"
                                    value={stats.exam}
                                    description="Lịch thi hoặc kiểm tra"
                                    tone="purple"
                                    icon={<GraduationCap className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1fr_180px_220px_220px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm học viên, trường, ngành, môn học..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={dayFilter}
                                          onChange={(event) => setDayFilter(event.target.value)}
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả ngày</option>
                                          <option value="1">Thứ Hai</option>
                                          <option value="2">Thứ Ba</option>
                                          <option value="3">Thứ Tư</option>
                                          <option value="4">Thứ Năm</option>
                                          <option value="5">Thứ Sáu</option>
                                          <option value="6">Thứ Bảy</option>
                                          <option value="0">Chủ Nhật</option>
                                    </select>

                                    <select
                                          value={modeFilter}
                                          onChange={(event) =>
                                                setModeFilter(event.target.value as 'all' | StudyMode)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả hình thức</option>
                                          <option value="school">Học tại trường</option>
                                          <option value="online">Học online</option>
                                          <option value="self_study">Tự học</option>
                                          <option value="extra_class">Học thêm</option>
                                          <option value="exam">Thi / Kiểm tra</option>
                                          <option value="other">Khác</option>
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(event.target.value as 'all' | ScheduleStatus)
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

                        <WeeklySchedulePreview schedules={filteredSchedules} />

                        <ConfigurableDataTable
                              moduleKey="schedule"
                              tableKey="schedule.list"
                              columns={columns}
                              data={filteredSchedules}
                              getRowKey={(item) => item.id}
                              isLoading={membersQuery.isLoading}
                              loadingText="Đang tải danh sách học viên..."
                              emptyTitle="Chưa có lịch học"
                              emptyDescription="Thêm lịch học để hỗ trợ điểm danh, sinh hoạt và phân công công tác."
                        />

                        {isFormOpen && (
                              <ScheduleFormModal
                                    title={editingSchedule ? 'Cập nhật lịch học' : 'Thêm lịch học'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    residents={residents}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={saveSchedule}
                                    submitText={editingSchedule ? 'Cập nhật' : 'Thêm lịch'}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function WeeklySchedulePreview({ schedules }: { schedules: StudyScheduleItem[] }) {
      if (schedules.length === 0) {
            return (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                        Không có lịch học phù hợp với bộ lọc hiện tại.
                  </div>
            );
      }

      const days: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

      return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                              <h2 className="text-lg font-bold text-neutral-900">
                                    Tổng quan lịch trong tuần
                              </h2>
                              <p className="mt-1 text-sm text-neutral-500">
                                    Xem nhanh các khung giờ học để sắp xếp sinh hoạt và công tác phù hợp.
                              </p>
                        </div>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {schedules.length} lịch học
                        </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-7">
                        {days.map((day) => {
                              const dayItems = schedules
                                    .filter((item) => item.dayOfWeek === day)
                                    .sort(
                                          (a, b) =>
                                                timeToMinutes(a.startTime) -
                                                timeToMinutes(b.startTime)
                                    );

                              return (
                                    <div
                                          key={day}
                                          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
                                    >
                                          <p className="mb-3 text-sm font-bold text-slate-900">
                                                {getDayLabel(day)}
                                          </p>

                                          <div className="space-y-2">
                                                {dayItems.length > 0 ? (
                                                      dayItems.slice(0, 4).map((item) => (
                                                            <div
                                                                  key={item.id}
                                                                  className="rounded-xl border border-white bg-white p-2 shadow-sm"
                                                            >
                                                                  <p className="truncate text-xs font-bold text-slate-900">
                                                                        {item.residentName}
                                                                  </p>
                                                                  <p className="mt-0.5 text-[11px] text-slate-500">
                                                                        {item.startTime} - {item.endTime}
                                                                  </p>
                                                                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                                                        {item.subjectName}
                                                                  </p>
                                                            </div>
                                                      ))
                                                ) : (
                                                      <div className="rounded-xl border border-dashed border-slate-200 px-2 py-5 text-center text-xs text-slate-400">
                                                            Không có lịch
                                                      </div>
                                                )}
                                          </div>
                                    </div>
                              );
                        })}
                  </div>
            </div>
      );
}

function ScheduleFormModal({
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
      formData: ScheduleFormData;
      setFormData: React.Dispatch<React.SetStateAction<ScheduleFormData>>;
      residents: Resident[];
      error: string | null;
      onClose: () => void;
      onSubmit: () => void;
      submitText: string;
}) {
      const handleResidentChange = (residentId: string) => {
            const selectedResident = residentId
                  ? residents.find((resident) => resident.id === Number(residentId))
                  : null;

            setFormData({
                  ...formData,
                  residentId,
                  schoolName: selectedResident?.schoolName || formData.schoolName,
                  majorName: selectedResident?.majorName || formData.majorName,
            });
      };

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">
                                          {title}
                                    </h2>
                                    <p className="text-sm text-neutral-500">
                                          Khai báo lịch học cơ bản để tham chiếu trong vận hành lưu xá.
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
                                          <Label htmlFor="code">Mã lịch học</Label>
                                          <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: SCH-2026-001"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="residentId">Học viên</Label>
                                          <select
                                                id="residentId"
                                                value={formData.residentId}
                                                onChange={(event) =>
                                                      handleResidentChange(event.target.value)
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="">Chưa chọn học viên</option>
                                                {residents.map((resident) => (
                                                      <option
                                                            key={resident.id}
                                                            value={String(resident.id)}
                                                      >
                                                            {getResidentName(resident)} ·{' '}
                                                            {getResidentCode(resident) ||
                                                                  getRoomLabel(resident)}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="schoolName">Trường học</Label>
                                          <Input
                                                id="schoolName"
                                                value={formData.schoolName}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            schoolName: event.target.value,
                                                      })
                                                }
                                                placeholder="Tên trường học"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="majorName">Ngành học</Label>
                                          <Input
                                                id="majorName"
                                                value={formData.majorName}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            majorName: event.target.value,
                                                      })
                                                }
                                                placeholder="Tên ngành học"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="subjectName">
                                                Môn học / Nội dung học
                                          </Label>
                                          <Input
                                                id="subjectName"
                                                value={formData.subjectName}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            subjectName: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Lập trình cơ bản"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="studyMode">Hình thức</Label>
                                          <select
                                                id="studyMode"
                                                value={formData.studyMode}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            studyMode: event.target.value as StudyMode,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="school">Học tại trường</option>
                                                <option value="online">Học online</option>
                                                <option value="self_study">Tự học</option>
                                                <option value="extra_class">Học thêm</option>
                                                <option value="exam">Thi / Kiểm tra</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="dayOfWeek">Ngày trong tuần</Label>
                                          <select
                                                id="dayOfWeek"
                                                value={formData.dayOfWeek}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            dayOfWeek: event.target.value,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="1">Thứ Hai</option>
                                                <option value="2">Thứ Ba</option>
                                                <option value="3">Thứ Tư</option>
                                                <option value="4">Thứ Năm</option>
                                                <option value="5">Thứ Sáu</option>
                                                <option value="6">Thứ Bảy</option>
                                                <option value="0">Chủ Nhật</option>
                                          </select>
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
                                                placeholder="VD: Cơ sở chính, phòng học chung..."
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="semester">Học kỳ / Giai đoạn</Label>
                                          <Input
                                                id="semester"
                                                value={formData.semester}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            semester: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: HK2 2025-2026"
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
                                                            status: event.target.value as ScheduleStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="active">Đang áp dụng</option>
                                                <option value="inactive">Ngưng áp dụng</option>
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
                                          placeholder="Ghi chú về lịch học, lịch thi, hoặc lưu ý khi phân công công tác"
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