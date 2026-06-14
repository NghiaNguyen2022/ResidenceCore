'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      CalendarDays,
      CheckCircle2,
      Edit2,
      FileWarning,
      MessageSquareWarning,
      Plus,
      Search,
      ShieldAlert,
      Trash2,
      UserRound,
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

type CaseStatus = 'open' | 'reviewing' | 'resolved' | 'closed';
type CaseSeverity = 'low' | 'medium' | 'high' | 'critical';
type CaseType =
      | 'reminder'
      | 'absence'
      | 'conduct'
      | 'room'
      | 'study'
      | 'safety'
      | 'finance'
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

type DisciplineCase = {
      id: number;
      caseNo: string;
      caseDate: string;
      residentId: number | null;
      residentName: string;
      roomLabel: string;
      caseType: CaseType;
      severity: CaseSeverity;
      status: CaseStatus;
      title: string;
      description: string;
      actionTaken: string;
      followUpDate: string;
      handledBy: string;
      note?: string | null;
      sortOrder: number;
};

type CaseFormData = {
      caseNo: string;
      caseDate: string;
      residentId: string;
      caseType: CaseType;
      severity: CaseSeverity;
      status: CaseStatus;
      title: string;
      description: string;
      actionTaken: string;
      followUpDate: string;
      handledBy: string;
      note: string;
      sortOrder: string;
};

const initialCases: DisciplineCase[] = [
      {
            id: 1,
            caseNo: 'CASE-2026-001',
            caseDate: '2026-06-01',
            residentId: null,
            residentName: 'Nguyễn Văn A',
            roomLabel: 'Phòng 101',
            caseType: 'reminder',
            severity: 'low',
            status: 'resolved',
            title: 'Nhắc nhở giữ trật tự sau giờ nghỉ',
            description: 'Học viên nói chuyện lớn tiếng sau giờ nghỉ tối, ảnh hưởng đến phòng bên cạnh.',
            actionTaken: 'Đã trao đổi riêng và nhắc nhở giữ trật tự trong khung giờ nghỉ.',
            followUpDate: '2026-06-08',
            handledBy: 'Tổ trưởng',
            note: '',
            sortOrder: 10,
      },
      {
            id: 2,
            caseNo: 'CASE-2026-002',
            caseDate: '2026-06-02',
            residentId: null,
            residentName: 'Trần Thị B',
            roomLabel: 'Phòng 203',
            caseType: 'absence',
            severity: 'medium',
            status: 'reviewing',
            title: 'Vắng giờ học tối chưa thông báo',
            description: 'Học viên không tham gia giờ học tối và chưa thông báo trước cho người phụ trách.',
            actionTaken: 'Đang xác minh lý do và trao đổi với học viên.',
            followUpDate: '2026-06-04',
            handledBy: 'Ban học tập',
            note: 'Cần kiểm tra lịch học thêm bên ngoài.',
            sortOrder: 20,
      },
      {
            id: 3,
            caseNo: 'CASE-2026-003',
            caseDate: '2026-06-02',
            residentId: null,
            residentName: 'Lê Văn C',
            roomLabel: 'Phòng 305',
            caseType: 'room',
            severity: 'medium',
            status: 'open',
            title: 'Chưa hoàn thành trực nhật phòng',
            description: 'Khu vực phòng ở chưa được vệ sinh theo lịch trực đã phân công.',
            actionTaken: 'Đã ghi nhận và yêu cầu hoàn thành trong ngày.',
            followUpDate: '2026-06-03',
            handledBy: 'Tổ trưởng',
            note: '',
            sortOrder: 30,
      },
];

const defaultFormData: CaseFormData = {
      caseNo: '',
      caseDate: '',
      residentId: '',
      caseType: 'reminder',
      severity: 'low',
      status: 'open',
      title: '',
      description: '',
      actionTaken: '',
      followUpDate: '',
      handledBy: '',
      note: '',
      sortOrder: '10',
};


function getTodayDateString() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
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

function buildCaseNo(items: DisciplineCase[]) {
      const year = new Date().getFullYear();
      const nextNumber = Math.max(...items.map((item) => item.id), 0) + 1;

      return `CASE-${year}-${String(nextNumber).padStart(3, '0')}`;
}

function getCaseTypeLabel(type: CaseType) {
      if (type === 'reminder') return 'Nhắc nhở';
      if (type === 'absence') return 'Vắng mặt / Về trễ';
      if (type === 'conduct') return 'Nề nếp / Tác phong';
      if (type === 'room') return 'Phòng ở';
      if (type === 'study') return 'Học tập';
      if (type === 'safety') return 'An toàn';
      if (type === 'finance') return 'Tài chính';
      return 'Khác';
}

function getCaseTypeClass(type: CaseType) {
      if (type === 'reminder') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (type === 'absence') return 'border-amber-200 bg-amber-50 text-amber-700';
      if (type === 'conduct') return 'border-orange-200 bg-orange-50 text-orange-700';
      if (type === 'room') return 'border-sky-200 bg-sky-50 text-sky-700';
      if (type === 'study') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (type === 'safety') return 'border-red-200 bg-red-50 text-red-700';
      if (type === 'finance') return 'border-violet-200 bg-violet-50 text-violet-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getSeverityLabel(severity: CaseSeverity) {
      if (severity === 'low') return 'Nhẹ';
      if (severity === 'medium') return 'Trung bình';
      if (severity === 'high') return 'Nghiêm trọng';
      return 'Rất nghiêm trọng';
}

function getSeverityClass(severity: CaseSeverity) {
      if (severity === 'low') return 'border-slate-200 bg-slate-50 text-slate-700';
      if (severity === 'medium') return 'border-amber-200 bg-amber-50 text-amber-700';
      if (severity === 'high') return 'border-orange-200 bg-orange-50 text-orange-700';
      return 'border-red-200 bg-red-50 text-red-700';
}

function getStatusLabel(status: CaseStatus) {
      if (status === 'open') return 'Mới ghi nhận';
      if (status === 'reviewing') return 'Đang theo dõi';
      if (status === 'resolved') return 'Đã xử lý';
      return 'Đã đóng';
}

function getStatusClass(status: CaseStatus) {
      if (status === 'open') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (status === 'reviewing') return 'border-amber-200 bg-amber-50 text-amber-700';
      if (status === 'resolved') return 'border-green-200 bg-green-50 text-green-700';
      return 'border-slate-200 bg-slate-50 text-slate-700';
}

function getNextId(items: DisciplineCase[]) {
      return Math.max(...items.map((item) => item.id), 0) + 1;
}

function getNextSortOrder(items: DisciplineCase[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function validateForm({
      cases,
      formData,
      editingId,
}: {
      cases: DisciplineCase[];
      formData: CaseFormData;
      editingId?: number;
}) {
      const caseNo = formData.caseNo.trim();

      if (!caseNo) return 'Vui lòng nhập mã hồ sơ.';
      if (!formData.caseDate) return 'Vui lòng nhập ngày ghi nhận.';
      if (!formData.title.trim()) return 'Vui lòng nhập tiêu đề hồ sơ.';
      if (!formData.description.trim()) return 'Vui lòng nhập nội dung sự việc.';

      const sortOrder = Number(formData.sortOrder || 0);

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCaseNo = cases
            .filter((item) => item.id !== editingId)
            .some((item) => normalizeText(item.caseNo) === normalizeText(caseNo));

      if (duplicatedCaseNo) {
            return 'Mã hồ sơ đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

export default function DisciplineCases() {
      const [cases, setCases] = useState<DisciplineCase[]>(initialCases);
      const [searchTerm, setSearchTerm] = useState('');
      const [typeFilter, setTypeFilter] = useState<'all' | CaseType>('all');
      const [severityFilter, setSeverityFilter] = useState<'all' | CaseSeverity>('all');
      const [statusFilter, setStatusFilter] = useState<'all' | CaseStatus>('all');
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingCase, setEditingCase] = useState<DisciplineCase | null>(null);
      const [formData, setFormData] = useState<CaseFormData>(defaultFormData);
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

      const filteredCases = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return cases
                  .filter((item) => {
                        if (typeFilter !== 'all' && item.caseType !== typeFilter) return false;
                        if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
                        if (statusFilter !== 'all' && item.status !== statusFilter) return false;

                        if (!keyword) return true;

                        const haystack = [
                              item.caseNo,
                              item.title,
                              item.residentName,
                              item.roomLabel,
                              getCaseTypeLabel(item.caseType),
                              getSeverityLabel(item.severity),
                              getStatusLabel(item.status),
                              item.description,
                              item.actionTaken,
                              item.handledBy,
                              item.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => {
                        const dateCompare = new Date(b.caseDate).getTime() - new Date(a.caseDate).getTime();

                        if (dateCompare !== 0) return dateCompare;

                        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
                  });
      }, [cases, searchTerm, typeFilter, severityFilter, statusFilter]);

      const stats = useMemo(() => {
            return {
                  total: cases.length,
                  open: cases.filter((item) => item.status === 'open').length,
                  reviewing: cases.filter((item) => item.status === 'reviewing').length,
                  serious: cases.filter((item) => item.severity === 'high' || item.severity === 'critical').length,
            };
      }, [cases]);

      const openCreateForm = () => {
            setEditingCase(null);
            setFormData({
                  ...defaultFormData,
                  caseNo: buildCaseNo(cases),
                  caseDate: getTodayDateString(),
                  sortOrder: getNextSortOrder(cases),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (item: DisciplineCase) => {
            setEditingCase(item);
            setFormData({
                  caseNo: item.caseNo,
                  caseDate: item.caseDate,
                  residentId: item.residentId ? String(item.residentId) : '',
                  caseType: item.caseType,
                  severity: item.severity,
                  status: item.status,
                  title: item.title,
                  description: item.description,
                  actionTaken: item.actionTaken,
                  followUpDate: item.followUpDate,
                  handledBy: item.handledBy,
                  note: item.note || '',
                  sortOrder: String(item.sortOrder || 0),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const closeForm = () => {
            setIsFormOpen(false);
            setEditingCase(null);
            setFormData(defaultFormData);
            setError(null);
      };

      const handleSave = () => {
            const validationMessage = validateForm({
                  cases,
                  formData,
                  editingId: editingCase?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const selectedResident = formData.residentId
                  ? residents.find((resident) => resident.id === Number(formData.residentId))
                  : null;

            const payload: DisciplineCase = {
                  id: editingCase?.id || getNextId(cases),
                  caseNo: formData.caseNo.trim(),
                  caseDate: formData.caseDate,
                  residentId: selectedResident?.id || null,
                  residentName: selectedResident
                        ? getResidentName(selectedResident)
                        : editingCase?.residentName || 'Chưa chọn học viên',
                  roomLabel: selectedResident ? getRoomLabel(selectedResident) : editingCase?.roomLabel || '',
                  caseType: formData.caseType,
                  severity: formData.severity,
                  status: formData.status,
                  title: formData.title.trim(),
                  description: formData.description.trim(),
                  actionTaken: formData.actionTaken.trim(),
                  followUpDate: formData.followUpDate,
                  handledBy: formData.handledBy.trim(),
                  note: formData.note.trim() || null,
                  sortOrder: Number(formData.sortOrder || 0),
            };

            if (editingCase) {
                  setCases((current) =>
                        current.map((item) => (item.id === editingCase.id ? payload : item))
                  );
            } else {
                  setCases((current) => [...current, payload]);
            }

            closeForm();
      };

      const handleDelete = (item: DisciplineCase) => {
            if (!confirm(`Bạn có chắc chắn muốn xóa hồ sơ "${item.caseNo}"?`)) {
                  return;
            }

            setCases((current) => current.filter((row) => row.id !== item.id));
      };

      const clearFilters = () => {
            setSearchTerm('');
            setTypeFilter('all');
            setSeverityFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<DisciplineCase>[]>(
            () => [
                  {
                        key: 'case',
                        label: 'Hồ sơ',
                        sortable: true,
                        sortValue: (item) => item.caseNo,
                        render: (item) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{item.title}</p>
                                    <p className="mt-1 font-mono text-xs text-slate-500">{item.caseNo}</p>
                              </div>
                        ),
                  },
                  {
                        key: 'resident',
                        label: 'Học viên',
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
                        key: 'caseDate',
                        label: 'Ngày ghi nhận',
                        sortable: true,
                        sortValue: (item) => item.caseDate,
                        render: (item) => (
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <CalendarDays className="h-4 w-4 text-slate-400" />
                                    {formatDate(item.caseDate)}
                              </div>
                        ),
                  },
                  {
                        key: 'type',
                        label: 'Loại',
                        sortable: true,
                        sortValue: (item) => getCaseTypeLabel(item.caseType),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getCaseTypeClass(
                                          item.caseType
                                    )}`}
                              >
                                    {getCaseTypeLabel(item.caseType)}
                              </span>
                        ),
                  },
                  {
                        key: 'severity',
                        label: 'Mức độ',
                        sortable: true,
                        sortValue: (item) => getSeverityLabel(item.severity),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getSeverityClass(
                                          item.severity
                                    )}`}
                              >
                                    {getSeverityLabel(item.severity)}
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
                        key: 'handledBy',
                        label: 'Phụ trách',
                        sortable: true,
                        sortValue: (item) => item.handledBy,
                        render: (item) => item.handledBy || '-',
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
                                          title="Sửa hồ sơ"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => handleDelete(item)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa hồ sơ"
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
                                          Nội quy & Kỷ luật
                                    </p>
                                    <h1 className="mt-1 text-3xl font-bold text-neutral-900">
                                          Hồ sơ xử lý / Nhắc nhở
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Ghi nhận, theo dõi và xử lý các trường hợp cần nhắc nhở, trao đổi hoặc hỗ trợ điều chỉnh nề nếp.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm hồ sơ
                              </button>
                        </div>

                        {(error || membersQuery.error) && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">Có lỗi khi xử lý hồ sơ.</p>
                                                <p className="mt-1 text-sm">
                                                      {error || membersQuery.error?.message || 'Vui lòng kiểm tra lại dữ liệu.'}
                                                </p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="disciplineCases"
                                    cardKey="disciplineCases.total"
                                    label="Tổng hồ sơ"
                                    value={stats.total}
                                    description="Tổng số hồ sơ đã ghi nhận"
                                    tone="blue"
                                    icon={<FileWarning className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="disciplineCases"
                                    cardKey="disciplineCases.open"
                                    label="Mới ghi nhận"
                                    value={stats.open}
                                    description="Hồ sơ cần xem xét"
                                    tone="green"
                                    icon={<MessageSquareWarning className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="disciplineCases"
                                    cardKey="disciplineCases.reviewing"
                                    label="Đang theo dõi"
                                    value={stats.reviewing}
                                    description="Hồ sơ chưa kết thúc"
                                    tone="orange"
                                    icon={<UserRound className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="disciplineCases"
                                    cardKey="disciplineCases.serious"
                                    label="Mức cao"
                                    value={stats.serious}
                                    description="Cần quan tâm đặc biệt"
                                    tone="purple"
                                    icon={<ShieldAlert className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1fr_220px_220px_220px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm hồ sơ, học viên, nội dung, người phụ trách..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={typeFilter}
                                          onChange={(event) =>
                                                setTypeFilter(event.target.value as 'all' | CaseType)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả loại</option>
                                          <option value="reminder">Nhắc nhở</option>
                                          <option value="absence">Vắng mặt / Về trễ</option>
                                          <option value="conduct">Nề nếp / Tác phong</option>
                                          <option value="room">Phòng ở</option>
                                          <option value="study">Học tập</option>
                                          <option value="safety">An toàn</option>
                                          <option value="finance">Tài chính</option>
                                          <option value="other">Khác</option>
                                    </select>

                                    <select
                                          value={severityFilter}
                                          onChange={(event) =>
                                                setSeverityFilter(event.target.value as 'all' | CaseSeverity)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả mức độ</option>
                                          <option value="low">Nhẹ</option>
                                          <option value="medium">Trung bình</option>
                                          <option value="high">Nghiêm trọng</option>
                                          <option value="critical">Rất nghiêm trọng</option>
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(event.target.value as 'all' | CaseStatus)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="open">Mới ghi nhận</option>
                                          <option value="reviewing">Đang theo dõi</option>
                                          <option value="resolved">Đã xử lý</option>
                                          <option value="closed">Đã đóng</option>
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

                        <DisciplineCaseOverview cases={filteredCases} />

                        <ConfigurableDataTable
                              moduleKey="disciplineCases"
                              tableKey="disciplineCases.list"
                              columns={columns}
                              data={filteredCases}
                              getRowKey={(item) => item.id}
                              isLoading={membersQuery.isLoading}
                              loadingText="Đang tải danh sách học viên..."
                              emptyTitle="Chưa có hồ sơ xử lý"
                              emptyDescription="Thêm hồ sơ để theo dõi quá trình nhắc nhở và hỗ trợ học viên."
                        />

                        {isFormOpen && (
                              <CaseFormModal
                                    title={editingCase ? 'Cập nhật hồ sơ' : 'Thêm hồ sơ'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    residents={residents}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={handleSave}
                                    submitText={editingCase ? 'Cập nhật' : 'Thêm hồ sơ'}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function DisciplineCaseOverview({ cases }: { cases: DisciplineCase[] }) {
      if (cases.length === 0) {
            return (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                        Không có hồ sơ phù hợp với bộ lọc hiện tại.
                  </div>
            );
      }

      return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                              <h2 className="text-lg font-bold text-neutral-900">Hồ sơ cần theo dõi</h2>
                              <p className="mt-1 text-sm text-neutral-500">
                                    Các trường hợp mới ghi nhận hoặc đang trong quá trình xử lý.
                              </p>
                        </div>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {cases.length} hồ sơ
                        </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                        {cases
                              .filter((item) => item.status === 'open' || item.status === 'reviewing')
                              .slice(0, 3)
                              .map((item) => (
                                    <div
                                          key={item.id}
                                          className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm"
                                    >
                                          <div className="flex items-start justify-between gap-3">
                                                <div>
                                                      <p className="font-bold text-slate-900">{item.caseNo}</p>
                                                      <p className="mt-1 text-xs text-slate-500">
                                                            {formatDate(item.caseDate)}
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

                                          <p className="mt-3 line-clamp-1 font-semibold text-slate-900">
                                                {item.title}
                                          </p>

                                          <p className="mt-1 text-xs text-slate-500">
                                                {item.residentName} · {item.roomLabel || 'Chưa có phòng'}
                                          </p>

                                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                                {item.actionTaken || item.description}
                                          </p>
                                    </div>
                              ))}
                  </div>
            </div>
      );
}

function CaseFormModal({
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
      formData: CaseFormData;
      setFormData: React.Dispatch<React.SetStateAction<CaseFormData>>;
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
                                          Ghi nhận thông tin sự việc, hướng xử lý và người phụ trách theo dõi.
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
                                          <Label htmlFor="caseNo">Mã hồ sơ</Label>
                                          <Input
                                                id="caseNo"
                                                value={formData.caseNo}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            caseNo: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: CASE-2026-001"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="caseDate">Ngày ghi nhận</Label>
                                          <DatePickerInput
                                                id="caseDate"
                                                value={formData.caseDate}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            caseDate: event.target.value,
                                                      })
                                                }
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="residentId">Học viên</Label>
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
                                          <Label htmlFor="title">Tiêu đề hồ sơ</Label>
                                          <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            title: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Nhắc nhở giữ trật tự"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="caseType">Loại hồ sơ</Label>
                                          <select
                                                id="caseType"
                                                value={formData.caseType}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            caseType: event.target.value as CaseType,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="reminder">Nhắc nhở</option>
                                                <option value="absence">Vắng mặt / Về trễ</option>
                                                <option value="conduct">Nề nếp / Tác phong</option>
                                                <option value="room">Phòng ở</option>
                                                <option value="study">Học tập</option>
                                                <option value="safety">An toàn</option>
                                                <option value="finance">Tài chính</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="severity">Mức độ</Label>
                                          <select
                                                id="severity"
                                                value={formData.severity}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            severity: event.target.value as CaseSeverity,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="low">Nhẹ</option>
                                                <option value="medium">Trung bình</option>
                                                <option value="high">Nghiêm trọng</option>
                                                <option value="critical">Rất nghiêm trọng</option>
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
                                                            status: event.target.value as CaseStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="open">Mới ghi nhận</option>
                                                <option value="reviewing">Đang theo dõi</option>
                                                <option value="resolved">Đã xử lý</option>
                                                <option value="closed">Đã đóng</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="handledBy">Người / nhóm phụ trách</Label>
                                          <Input
                                                id="handledBy"
                                                value={formData.handledBy}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            handledBy: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Tổ trưởng, Ban học tập"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="followUpDate">Ngày theo dõi tiếp</Label>
                                          <DatePickerInput
                                                id="followUpDate"
                                                value={formData.followUpDate}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            followUpDate: event.target.value,
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
                                    <Label htmlFor="description">Nội dung sự việc</Label>
                                    <Textarea
                                          id="description"
                                          value={formData.description}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      description: event.target.value,
                                                })
                                          }
                                          placeholder="Mô tả ngắn gọn sự việc đã ghi nhận"
                                          className="min-h-24"
                                    />
                              </div>

                              <div>
                                    <Label htmlFor="actionTaken">Hướng xử lý / Trao đổi</Label>
                                    <Textarea
                                          id="actionTaken"
                                          value={formData.actionTaken}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      actionTaken: event.target.value,
                                                })
                                          }
                                          placeholder="Ghi nhận cách xử lý, nội dung trao đổi hoặc bước tiếp theo"
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
