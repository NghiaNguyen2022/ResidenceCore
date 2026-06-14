'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      Award,
      CalendarDays,
      CheckCircle2,
      Clock,
      Edit2,
      GraduationCap,
      MapPin,
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
import { formatDate, formatDateRange, formatTimeRange, timeToMinutes } from '@/lib/format';
import { DatePickerInput } from '@/components/shared/form/DatePickerInput';

type SkillClassStatus = 'planned' | 'open' | 'in_progress' | 'completed' | 'cancelled';
type SkillClassType = 'workshop' | 'course' | 'sharing' | 'practice' | 'retreat' | 'other';
type AttendanceMode = 'optional' | 'recommended' | 'required';

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

type SkillReference = {
      id: number;
      code: string;
      name: string;
      category: string;
      level: string;
};

type SkillClassItem = {
      id: number;
      code: string;
      title: string;
      skillId: number | null;
      skillName: string;
      classType: SkillClassType;
      attendanceMode: AttendanceMode;
      status: SkillClassStatus;
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
      location: string;
      facilitator: string;
      ownerGroup: string;
      capacity: number;
      enrolledCount: number;
      completedCount: number;
      description: string;
      objective: string;
      note?: string | null;
      sortOrder: number;
};

type SkillClassFormData = {
      code: string;
      title: string;
      skillId: string;
      skillName: string;
      classType: SkillClassType;
      attendanceMode: AttendanceMode;
      status: SkillClassStatus;
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
      location: string;
      facilitator: string;
      ownerGroup: string;
      capacity: string;
      enrolledCount: string;
      completedCount: string;
      description: string;
      objective: string;
      note: string;
      sortOrder: string;
};

const skillReferences: SkillReference[] = [
      {
            id: 1,
            code: 'COMMUNICATION_BASIC',
            name: 'Giao tiếp căn bản',
            category: 'Giao tiếp',
            level: 'Cơ bản',
      },
      {
            id: 2,
            code: 'TIME_MANAGEMENT',
            name: 'Quản lý thời gian',
            category: 'Học tập',
            level: 'Cơ bản',
      },
      {
            id: 3,
            code: 'TEAMWORK',
            name: 'Làm việc nhóm',
            category: 'Cộng đoàn',
            level: 'Trung cấp',
      },
];

const initialClasses: SkillClassItem[] = [
      {
            id: 1,
            code: 'CLASS-2026-001',
            title: 'Giao tiếp căn bản trong đời sống chung',
            skillId: 1,
            skillName: 'Giao tiếp căn bản',
            classType: 'workshop',
            attendanceMode: 'recommended',
            status: 'open',
            startDate: '2026-06-08',
            endDate: '2026-06-08',
            startTime: '19:30',
            endTime: '21:00',
            location: 'Phòng sinh hoạt chung',
            facilitator: 'Ban kỹ năng',
            ownerGroup: 'Ban kỹ năng',
            capacity: 30,
            enrolledCount: 18,
            completedCount: 0,
            description: 'Buổi thực hành giao tiếp, lắng nghe và phản hồi trong môi trường lưu xá.',
            objective: 'Giúp học viên tự tin trao đổi, biết lắng nghe và xử lý tình huống giao tiếp cơ bản.',
            note: '',
            sortOrder: 10,
      },
      {
            id: 2,
            code: 'CLASS-2026-002',
            title: 'Quản lý thời gian học tập và sinh hoạt',
            skillId: 2,
            skillName: 'Quản lý thời gian',
            classType: 'sharing',
            attendanceMode: 'recommended',
            status: 'planned',
            startDate: '2026-06-15',
            endDate: '2026-06-15',
            startTime: '19:30',
            endTime: '21:00',
            location: 'Phòng học chung',
            facilitator: 'Ban học tập',
            ownerGroup: 'Ban học tập',
            capacity: 25,
            enrolledCount: 12,
            completedCount: 0,
            description: 'Chia sẻ phương pháp lập kế hoạch tuần, cân bằng giờ học, sinh hoạt và công tác chung.',
            objective: 'Học viên có thể tự lập kế hoạch tuần và theo dõi việc thực hiện.',
            note: '',
            sortOrder: 20,
      },
      {
            id: 3,
            code: 'CLASS-2026-003',
            title: 'Làm việc nhóm qua hoạt động cộng đoàn',
            skillId: 3,
            skillName: 'Làm việc nhóm',
            classType: 'practice',
            attendanceMode: 'required',
            status: 'completed',
            startDate: '2026-05-25',
            endDate: '2026-05-25',
            startTime: '08:00',
            endTime: '11:00',
            location: 'Sân sinh hoạt',
            facilitator: 'Tổ chức lưu xá',
            ownerGroup: 'Tổ chức lưu xá',
            capacity: 40,
            enrolledCount: 32,
            completedCount: 30,
            description: 'Thực hành phối hợp theo nhóm thông qua một hoạt động chung của lưu xá.',
            objective: 'Rèn luyện phân công, phối hợp và hoàn thành phần việc được giao.',
            note: 'Có thể dùng kết quả cho màn hình kết quả kỹ năng.',
            sortOrder: 30,
      },
];

const defaultFormData: SkillClassFormData = {
      code: '',
      title: '',
      skillId: '',
      skillName: '',
      classType: 'workshop',
      attendanceMode: 'recommended',
      status: 'planned',
      startDate: '',
      endDate: '',
      startTime: '19:30',
      endTime: '21:00',
      location: '',
      facilitator: '',
      ownerGroup: '',
      capacity: '0',
      enrolledCount: '0',
      completedCount: '0',
      description: '',
      objective: '',
      note: '',
      sortOrder: '10',
};


function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9-]+/g, '-')
            .replace(/^-+|-+$/g, '');
}

function buildClassCode(items: SkillClassItem[]) {
      const year = new Date().getFullYear();
      const nextNumber = Math.max(...items.map((item) => item.id), 0) + 1;

      return `CLASS-${year}-${String(nextNumber).padStart(3, '0')}`;
}

function getTodayDateString() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
}

function getResidentName(resident?: Resident | null) {
      return resident?.fullName || resident?.name || 'Chưa có tên';
}

function isActiveResident(resident: Resident) {
      const status = normalizeText(resident.status);

      if (!status) return true;

      return !['inactive', 'left', 'ended', 'archived', 'da roi', 'nghi', 'ngung'].includes(status);
}

function getClassTypeLabel(type: SkillClassType) {
      if (type === 'workshop') return 'Workshop';
      if (type === 'course') return 'Khóa học';
      if (type === 'sharing') return 'Chia sẻ';
      if (type === 'practice') return 'Thực hành';
      if (type === 'retreat') return 'Tĩnh tâm / Chuyên đề';
      return 'Khác';
}

function getClassTypeClass(type: SkillClassType) {
      if (type === 'workshop') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (type === 'course') return 'border-violet-200 bg-violet-50 text-violet-700';
      if (type === 'sharing') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (type === 'practice') return 'border-orange-200 bg-orange-50 text-orange-700';
      if (type === 'retreat') return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getAttendanceModeLabel(mode: AttendanceMode) {
      if (mode === 'optional') return 'Tự chọn';
      if (mode === 'recommended') return 'Khuyến khích';
      return 'Bắt buộc';
}

function getAttendanceModeClass(mode: AttendanceMode) {
      if (mode === 'optional') return 'border-slate-200 bg-slate-50 text-slate-700';
      if (mode === 'recommended') return 'border-blue-200 bg-blue-50 text-blue-700';
      return 'border-red-200 bg-red-50 text-red-700';
}

function getStatusLabel(status: SkillClassStatus) {
      if (status === 'planned') return 'Dự kiến';
      if (status === 'open') return 'Đang mở';
      if (status === 'in_progress') return 'Đang học';
      if (status === 'completed') return 'Hoàn thành';
      return 'Đã hủy';
}

function getStatusClass(status: SkillClassStatus) {
      if (status === 'planned') return 'border-slate-200 bg-slate-50 text-slate-700';
      if (status === 'open') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (status === 'in_progress') return 'border-amber-200 bg-amber-50 text-amber-700';
      if (status === 'completed') return 'border-green-200 bg-green-50 text-green-700';
      return 'border-red-200 bg-red-50 text-red-700';
}

function getNextId(items: SkillClassItem[]) {
      return Math.max(...items.map((item) => item.id), 0) + 1;
}

function getNextSortOrder(items: SkillClassItem[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function validateForm({
      items,
      formData,
      editingId,
}: {
      items: SkillClassItem[];
      formData: SkillClassFormData;
      editingId?: number;
}) {
      const code = normalizeCode(formData.code);

      if (!code) return 'Vui lòng nhập mã lớp kỹ năng.';
      if (!formData.title.trim()) return 'Vui lòng nhập tên lớp kỹ năng.';
      if (!formData.startDate) return 'Vui lòng nhập ngày bắt đầu.';

      if (formData.startTime && formData.endTime && timeToMinutes(formData.endTime) <= timeToMinutes(formData.startTime)) {
            return 'Giờ kết thúc phải lớn hơn giờ bắt đầu.';
      }

      const capacity = Number(formData.capacity || 0);
      const enrolledCount = Number(formData.enrolledCount || 0);
      const completedCount = Number(formData.completedCount || 0);

      if (!Number.isFinite(capacity) || capacity < 0) return 'Sức chứa phải là số lớn hơn hoặc bằng 0.';
      if (!Number.isFinite(enrolledCount) || enrolledCount < 0) return 'Số học viên đăng ký phải là số lớn hơn hoặc bằng 0.';
      if (!Number.isFinite(completedCount) || completedCount < 0) return 'Số học viên hoàn thành phải là số lớn hơn hoặc bằng 0.';

      if (capacity > 0 && enrolledCount > capacity) {
            return 'Số học viên đăng ký không được vượt quá sức chứa.';
      }

      if (completedCount > enrolledCount) {
            return 'Số học viên hoàn thành không được vượt quá số học viên đăng ký.';
      }

      const sortOrder = Number(formData.sortOrder || 0);

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCode = items
            .filter((item) => item.id !== editingId)
            .some((item) => normalizeText(item.code) === normalizeText(code));

      if (duplicatedCode) {
            return 'Mã lớp kỹ năng đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

export default function SkillClasses() {
      const [items, setItems] = useState<SkillClassItem[]>(initialClasses);
      const [searchTerm, setSearchTerm] = useState('');
      const [classTypeFilter, setClassTypeFilter] = useState<'all' | SkillClassType>('all');
      const [attendanceModeFilter, setAttendanceModeFilter] = useState<'all' | AttendanceMode>('all');
      const [statusFilter, setStatusFilter] = useState<'all' | SkillClassStatus>('all');

      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingItem, setEditingItem] = useState<SkillClassItem | null>(null);
      const [formData, setFormData] = useState<SkillClassFormData>(defaultFormData);
      const [error, setError] = useState<string | null>(null);

      const membersQuery = trpc.members.list.useQuery({
            limit: 500,
            offset: 0,
      });

      const activeResidentsCount = useMemo(() => {
            const data = (membersQuery.data || []) as Resident[];

            return data.filter(isActiveResident).length;
      }, [membersQuery.data]);

      const filteredItems = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return items
                  .filter((item) => {
                        if (classTypeFilter !== 'all' && item.classType !== classTypeFilter) return false;
                        if (attendanceModeFilter !== 'all' && item.attendanceMode !== attendanceModeFilter) return false;
                        if (statusFilter !== 'all' && item.status !== statusFilter) return false;

                        if (!keyword) return true;

                        const haystack = [
                              item.code,
                              item.title,
                              item.skillName,
                              getClassTypeLabel(item.classType),
                              getAttendanceModeLabel(item.attendanceMode),
                              getStatusLabel(item.status),
                              item.location,
                              item.facilitator,
                              item.ownerGroup,
                              item.description,
                              item.objective,
                              item.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => {
                        const dateCompare = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();

                        if (dateCompare !== 0) return dateCompare;

                        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
                  });
      }, [items, searchTerm, classTypeFilter, attendanceModeFilter, statusFilter]);

      const stats = useMemo(() => {
            return {
                  total: items.length,
                  open: items.filter((item) => item.status === 'open' || item.status === 'in_progress').length,
                  enrolled: items.reduce((sum, item) => sum + (item.enrolledCount || 0), 0),
                  completed: items.reduce((sum, item) => sum + (item.completedCount || 0), 0),
            };
      }, [items]);

      const openCreateForm = () => {
            setEditingItem(null);
            setFormData({
                  ...defaultFormData,
                  code: buildClassCode(items),
                  startDate: getTodayDateString(),
                  endDate: getTodayDateString(),
                  sortOrder: getNextSortOrder(items),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (item: SkillClassItem) => {
            setEditingItem(item);
            setFormData({
                  code: item.code,
                  title: item.title,
                  skillId: item.skillId ? String(item.skillId) : '',
                  skillName: item.skillName,
                  classType: item.classType,
                  attendanceMode: item.attendanceMode,
                  status: item.status,
                  startDate: item.startDate,
                  endDate: item.endDate,
                  startTime: item.startTime,
                  endTime: item.endTime,
                  location: item.location,
                  facilitator: item.facilitator,
                  ownerGroup: item.ownerGroup,
                  capacity: String(item.capacity || 0),
                  enrolledCount: String(item.enrolledCount || 0),
                  completedCount: String(item.completedCount || 0),
                  description: item.description,
                  objective: item.objective,
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

      const saveItem = () => {
            const validationMessage = validateForm({
                  items,
                  formData,
                  editingId: editingItem?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const selectedSkill = formData.skillId
                  ? skillReferences.find((skill) => skill.id === Number(formData.skillId))
                  : null;

            const payload: SkillClassItem = {
                  id: editingItem?.id || getNextId(items),
                  code: normalizeCode(formData.code),
                  title: formData.title.trim(),
                  skillId: selectedSkill?.id || null,
                  skillName: selectedSkill?.name || formData.skillName.trim() || 'Chưa gắn kỹ năng',
                  classType: formData.classType,
                  attendanceMode: formData.attendanceMode,
                  status: formData.status,
                  startDate: formData.startDate,
                  endDate: formData.endDate || formData.startDate,
                  startTime: formData.startTime,
                  endTime: formData.endTime,
                  location: formData.location.trim(),
                  facilitator: formData.facilitator.trim(),
                  ownerGroup: formData.ownerGroup.trim(),
                  capacity: Number(formData.capacity || 0),
                  enrolledCount: Number(formData.enrolledCount || 0),
                  completedCount: Number(formData.completedCount || 0),
                  description: formData.description.trim(),
                  objective: formData.objective.trim(),
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

      const deleteItem = (item: SkillClassItem) => {
            if ((item.enrolledCount || 0) > 0 || (item.completedCount || 0) > 0) {
                  setError('Không thể xóa lớp đã có học viên đăng ký hoặc kết quả hoàn thành. Có thể chuyển lớp sang trạng thái đã hủy.');
                  return;
            }

            if (!confirm(`Bạn có chắc chắn muốn xóa lớp "${item.title}"?`)) return;

            setItems((current) => current.filter((row) => row.id !== item.id));
      };

      const markCompleted = (item: SkillClassItem) => {
            setItems((current) =>
                  current.map((row) =>
                        row.id === item.id
                              ? {
                                      ...row,
                                      status: 'completed',
                                      completedCount: row.completedCount || row.enrolledCount || 0,
                                }
                              : row
                  )
            );
      };

      const clearFilters = () => {
            setSearchTerm('');
            setClassTypeFilter('all');
            setAttendanceModeFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<SkillClassItem>[]>(
            () => [
                  {
                        key: 'class',
                        label: 'Lớp kỹ năng',
                        sortable: true,
                        sortValue: (item) => item.title,
                        render: (item) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{item.title}</p>
                                    <p className="mt-1 font-mono text-xs text-slate-500">{item.code}</p>
                                    <p className="mt-1 text-xs text-slate-500">{item.skillName}</p>
                              </div>
                        ),
                  },
                  {
                        key: 'type',
                        label: 'Loại lớp',
                        sortable: true,
                        sortValue: (item) => getClassTypeLabel(item.classType),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getClassTypeClass(
                                          item.classType
                                    )}`}
                              >
                                    {getClassTypeLabel(item.classType)}
                              </span>
                        ),
                  },
                  {
                        key: 'time',
                        label: 'Thời gian',
                        sortable: true,
                        sortValue: (item) => `${item.startDate}-${item.startTime}`,
                        render: (item) => (
                              <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                          <CalendarDays className="h-4 w-4 text-slate-500" />
                                          {formatDateRange(item.startDate, item.endDate)}
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
                        key: 'enrolled',
                        label: 'Sĩ số',
                        sortable: true,
                        sortValue: (item) => item.enrolledCount,
                        render: (item) => (
                              <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                          {item.enrolledCount || 0}/{item.capacity || 0}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                          Hoàn thành: {item.completedCount || 0}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'attendanceMode',
                        label: 'Tham gia',
                        sortable: true,
                        sortValue: (item) => getAttendanceModeLabel(item.attendanceMode),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getAttendanceModeClass(
                                          item.attendanceMode
                                    )}`}
                              >
                                    {getAttendanceModeLabel(item.attendanceMode)}
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
                        key: 'facilitator',
                        label: 'Phụ trách',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (item) => item.facilitator,
                        render: (item) => item.facilitator || item.ownerGroup || '-',
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[200px]',
                        render: (item) => (
                              <div className="flex items-center gap-1.5">
                                    {item.status !== 'completed' && item.status !== 'cancelled' && (
                                          <button
                                                type="button"
                                                onClick={() => markCompleted(item)}
                                                className="rounded-lg px-2 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                                          >
                                                Hoàn thành
                                          </button>
                                    )}

                                    <button
                                          type="button"
                                          onClick={() => openEditForm(item)}
                                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                          title="Sửa lớp kỹ năng"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => deleteItem(item)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa lớp kỹ năng"
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              </div>
                        ),
                  },
            ],
            [items]
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
                                          Các lớp kỹ năng
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Quản lý các lớp kỹ năng, chuyên đề và buổi thực hành nhằm hỗ trợ học viên phát triển bản thân trong môi trường lưu xá.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm lớp kỹ năng
                              </button>
                        </div>

                        {(error || membersQuery.error) && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">
                                                      Có lỗi khi xử lý lớp kỹ năng.
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
                                    moduleKey="skillClasses"
                                    cardKey="skillClasses.total"
                                    label="Tổng lớp"
                                    value={stats.total}
                                    description="Tổng số lớp kỹ năng"
                                    tone="blue"
                                    icon={<GraduationCap className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="skillClasses"
                                    cardKey="skillClasses.open"
                                    label="Đang mở"
                                    value={stats.open}
                                    description="Lớp đang mở hoặc đang học"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="skillClasses"
                                    cardKey="skillClasses.enrolled"
                                    label="Đăng ký"
                                    value={stats.enrolled}
                                    description="Tổng lượt học viên đăng ký"
                                    tone="orange"
                                    icon={<Users className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="skillClasses"
                                    cardKey="skillClasses.completed"
                                    label="Hoàn thành"
                                    value={stats.completed}
                                    description={`Tổng lượt hoàn thành / ${activeResidentsCount} học viên`}
                                    tone="purple"
                                    icon={<Award className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1fr_220px_220px_220px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm lớp kỹ năng, kỹ năng, địa điểm, phụ trách..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={classTypeFilter}
                                          onChange={(event) =>
                                                setClassTypeFilter(event.target.value as 'all' | SkillClassType)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả loại lớp</option>
                                          <option value="workshop">Workshop</option>
                                          <option value="course">Khóa học</option>
                                          <option value="sharing">Chia sẻ</option>
                                          <option value="practice">Thực hành</option>
                                          <option value="retreat">Tĩnh tâm / Chuyên đề</option>
                                          <option value="other">Khác</option>
                                    </select>

                                    <select
                                          value={attendanceModeFilter}
                                          onChange={(event) =>
                                                setAttendanceModeFilter(event.target.value as 'all' | AttendanceMode)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả yêu cầu</option>
                                          <option value="optional">Tự chọn</option>
                                          <option value="recommended">Khuyến khích</option>
                                          <option value="required">Bắt buộc</option>
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(event.target.value as 'all' | SkillClassStatus)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="planned">Dự kiến</option>
                                          <option value="open">Đang mở</option>
                                          <option value="in_progress">Đang học</option>
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

                        <SkillClassBoard items={filteredItems} />

                        <ConfigurableDataTable
                              moduleKey="skillClasses"
                              tableKey="skillClasses.list"
                              columns={columns}
                              data={filteredItems}
                              getRowKey={(item) => item.id}
                              isLoading={membersQuery.isLoading}
                              loadingText="Đang tải dữ liệu học viên..."
                              emptyTitle="Chưa có lớp kỹ năng"
                              emptyDescription="Thêm lớp kỹ năng để quản lý các buổi đào tạo và hoạt động phát triển học viên."
                        />

                        {isFormOpen && (
                              <SkillClassFormModal
                                    title={editingItem ? 'Cập nhật lớp kỹ năng' : 'Thêm lớp kỹ năng'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={saveItem}
                                    submitText={editingItem ? 'Cập nhật' : 'Thêm lớp'}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function SkillClassBoard({ items }: { items: SkillClassItem[] }) {
      if (items.length === 0) {
            return (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                        Không có lớp kỹ năng phù hợp với bộ lọc hiện tại.
                  </div>
            );
      }

      return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                              <h2 className="text-lg font-bold text-neutral-900">
                                    Lớp kỹ năng sắp tới
                              </h2>
                              <p className="mt-1 text-sm text-neutral-500">
                                    Theo dõi nhanh các lớp đang mở, đang học hoặc chuẩn bị tổ chức.
                              </p>
                        </div>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {items.length} lớp
                        </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                        {items.slice(0, 6).map((item) => (
                              <div
                                    key={item.id}
                                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm"
                              >
                                    <div className="flex items-start justify-between gap-3">
                                          <div className="min-w-0">
                                                <p className="line-clamp-1 font-bold text-slate-900">
                                                      {item.title}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                      {item.skillName}
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

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                          <span
                                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getClassTypeClass(
                                                      item.classType
                                                )}`}
                                          >
                                                {getClassTypeLabel(item.classType)}
                                          </span>

                                          <span
                                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getAttendanceModeClass(
                                                      item.attendanceMode
                                                )}`}
                                          >
                                                {getAttendanceModeLabel(item.attendanceMode)}
                                          </span>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                                          <div className="flex items-center gap-1.5">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                {formatDateRange(item.startDate, item.endDate)}
                                          </div>

                                          <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                {formatTimeRange(item.startTime, item.endTime)}
                                          </div>
                                    </div>

                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                          {item.objective || item.description || 'Chưa có mục tiêu lớp học.'}
                                    </p>
                              </div>
                        ))}
                  </div>
            </div>
      );
}

function SkillClassFormModal({
      title,
      formData,
      setFormData,
      error,
      onClose,
      onSubmit,
      submitText,
}: {
      title: string;
      formData: SkillClassFormData;
      setFormData: React.Dispatch<React.SetStateAction<SkillClassFormData>>;
      error: string | null;
      onClose: () => void;
      onSubmit: () => void;
      submitText: string;
}) {
      const handleSkillChange = (skillId: string) => {
            const selectedSkill = skillId
                  ? skillReferences.find((skill) => skill.id === Number(skillId))
                  : null;

            setFormData({
                  ...formData,
                  skillId,
                  skillName: selectedSkill?.name || formData.skillName,
            });
      };

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                                    <p className="text-sm text-neutral-500">
                                          Khai báo thông tin lớp, thời gian, người phụ trách và số lượng học viên tham gia.
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
                                          <Label htmlFor="code">Mã lớp</Label>
                                          <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: CLASS-2026-001"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="title">Tên lớp kỹ năng</Label>
                                          <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            title: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Giao tiếp căn bản"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="skillId">Kỹ năng tham chiếu</Label>
                                          <select
                                                id="skillId"
                                                value={formData.skillId}
                                                onChange={(event) => handleSkillChange(event.target.value)}
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="">Chưa gắn kỹ năng</option>
                                                {skillReferences.map((skill) => (
                                                      <option key={skill.id} value={String(skill.id)}>
                                                            {skill.name} · {skill.category} · {skill.level}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="skillName">Tên kỹ năng hiển thị</Label>
                                          <Input
                                                id="skillName"
                                                value={formData.skillName}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            skillName: event.target.value,
                                                      })
                                                }
                                                placeholder="Tên kỹ năng nếu chưa chọn danh mục"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="classType">Loại lớp</Label>
                                          <select
                                                id="classType"
                                                value={formData.classType}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            classType: event.target.value as SkillClassType,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="workshop">Workshop</option>
                                                <option value="course">Khóa học</option>
                                                <option value="sharing">Chia sẻ</option>
                                                <option value="practice">Thực hành</option>
                                                <option value="retreat">Tĩnh tâm / Chuyên đề</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="attendanceMode">Yêu cầu tham gia</Label>
                                          <select
                                                id="attendanceMode"
                                                value={formData.attendanceMode}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            attendanceMode: event.target.value as AttendanceMode,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="optional">Tự chọn</option>
                                                <option value="recommended">Khuyến khích</option>
                                                <option value="required">Bắt buộc</option>
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
                                                            status: event.target.value as SkillClassStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="planned">Dự kiến</option>
                                                <option value="open">Đang mở</option>
                                                <option value="in_progress">Đang học</option>
                                                <option value="completed">Hoàn thành</option>
                                                <option value="cancelled">Đã hủy</option>
                                          </select>
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
                                          <Label htmlFor="startDate">Ngày bắt đầu</Label>
                                          <DatePickerInput
                                                id="startDate"
                                                value={formData.startDate}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            startDate: event.target.value,
                                                      })
                                                }
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="endDate">Ngày kết thúc</Label>
                                          <DatePickerInput
                                                id="endDate"
                                                value={formData.endDate}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            endDate: event.target.value,
                                                      })
                                                }
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
                                                />
                                          </div>
                                    </div>

                                    <div>
                                          <Label htmlFor="facilitator">Người hướng dẫn</Label>
                                          <Input
                                                id="facilitator"
                                                value={formData.facilitator}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            facilitator: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Ban kỹ năng"
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
                                                placeholder="VD: Ban kỹ năng"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="capacity">Sức chứa</Label>
                                          <Input
                                                id="capacity"
                                                type="number"
                                                min={0}
                                                value={formData.capacity}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            capacity: event.target.value,
                                                      })
                                                }
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="enrolledCount">Đã đăng ký</Label>
                                          <Input
                                                id="enrolledCount"
                                                type="number"
                                                min={0}
                                                value={formData.enrolledCount}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            enrolledCount: event.target.value,
                                                      })
                                                }
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="completedCount">Đã hoàn thành</Label>
                                          <Input
                                                id="completedCount"
                                                type="number"
                                                min={0}
                                                value={formData.completedCount}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            completedCount: event.target.value,
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
                                          placeholder="Mô tả nội dung lớp kỹ năng"
                                          className="min-h-24"
                                    />
                              </div>

                              <div>
                                    <Label htmlFor="objective">Mục tiêu lớp học</Label>
                                    <Textarea
                                          id="objective"
                                          value={formData.objective}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      objective: event.target.value,
                                                })
                                          }
                                          placeholder="Mục tiêu học viên đạt được sau lớp"
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
                                          placeholder="Ghi chú bổ sung nếu có"
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
