'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      Award,
      BookOpenCheck,
      CheckCircle2,
      Edit2,
      GraduationCap,
      Plus,
      Search,
      Star,
      Trash2,
      TrendingUp,
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

type EvaluationStatus = 'draft' | 'reviewed' | 'approved' | 'archived';
type AcademicLevel = 'excellent' | 'good' | 'average' | 'warning' | 'support_needed';
type SupportLevel = 'none' | 'monitor' | 'support' | 'priority';

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

type SemesterEvaluation = {
      id: number;
      code: string;
      residentId: number | null;
      residentName: string;
      roomLabel: string;
      schoolName: string;
      majorName: string;
      semester: string;
      academicYear: string;
      averageScore: number | null;
      academicLevel: AcademicLevel;
      supportLevel: SupportLevel;
      status: EvaluationStatus;
      strengths: string;
      concerns: string;
      supportPlan: string;
      reviewedBy: string;
      reviewedDate: string;
      note?: string | null;
      sortOrder: number;
};

type EvaluationFormData = {
      code: string;
      residentId: string;
      schoolName: string;
      majorName: string;
      semester: string;
      academicYear: string;
      averageScore: string;
      academicLevel: AcademicLevel;
      supportLevel: SupportLevel;
      status: EvaluationStatus;
      strengths: string;
      concerns: string;
      supportPlan: string;
      reviewedBy: string;
      reviewedDate: string;
      note: string;
      sortOrder: string;
};

const initialEvaluations: SemesterEvaluation[] = [
      {
            id: 1,
            code: 'EVAL-2026-001',
            residentId: null,
            residentName: 'Nguyễn Văn A',
            roomLabel: 'Phòng 101',
            schoolName: 'Trường Đại học Khoa học Tự nhiên',
            majorName: 'Công nghệ thông tin',
            semester: 'HK2',
            academicYear: '2025-2026',
            averageScore: 8.1,
            academicLevel: 'good',
            supportLevel: 'none',
            status: 'reviewed',
            strengths: 'Tinh thần học tập ổn định, chủ động trong các buổi học nhóm.',
            concerns: 'Cần duy trì giờ giấc nghỉ ngơi để tránh ảnh hưởng sức khỏe.',
            supportPlan: 'Tiếp tục theo dõi trong kỳ tiếp theo.',
            reviewedBy: 'Ban học tập',
            reviewedDate: '2026-06-01',
            note: '',
            sortOrder: 10,
      },
      {
            id: 2,
            code: 'EVAL-2026-002',
            residentId: null,
            residentName: 'Trần Thị B',
            roomLabel: 'Phòng 203',
            schoolName: 'Trường Đại học Kinh tế - Luật',
            majorName: 'Quản trị kinh doanh',
            semester: 'HK2',
            academicYear: '2025-2026',
            averageScore: 6.4,
            academicLevel: 'average',
            supportLevel: 'monitor',
            status: 'reviewed',
            strengths: 'Tham gia sinh hoạt chung tốt, có cố gắng trong học kỳ.',
            concerns: 'Một số môn cần cải thiện điểm kiểm tra giữa kỳ.',
            supportPlan: 'Khuyến khích tham gia nhóm học tập buổi tối 2 lần/tuần.',
            reviewedBy: 'Ban học tập',
            reviewedDate: '2026-06-01',
            note: '',
            sortOrder: 20,
      },
      {
            id: 3,
            code: 'EVAL-2026-003',
            residentId: null,
            residentName: 'Lê Văn C',
            roomLabel: 'Phòng 305',
            schoolName: 'Trường Cao đẳng Kỹ thuật',
            majorName: 'Kỹ thuật điện',
            semester: 'HK2',
            academicYear: '2025-2026',
            averageScore: 5.2,
            academicLevel: 'support_needed',
            supportLevel: 'support',
            status: 'draft',
            strengths: 'Có thái độ hợp tác khi được trao đổi.',
            concerns: 'Kết quả một số môn chuyên ngành chưa đạt yêu cầu.',
            supportPlan: 'Trao đổi riêng, lập lịch học phụ đạo và theo dõi hằng tuần.',
            reviewedBy: 'Người phụ trách học vụ',
            reviewedDate: '2026-06-02',
            note: 'Cần liên hệ thêm với phụ huynh nếu kết quả không cải thiện.',
            sortOrder: 30,
      },
];

const defaultFormData: EvaluationFormData = {
      code: '',
      residentId: '',
      schoolName: '',
      majorName: '',
      semester: 'HK1',
      academicYear: '',
      averageScore: '',
      academicLevel: 'average',
      supportLevel: 'none',
      status: 'draft',
      strengths: '',
      concerns: '',
      supportPlan: '',
      reviewedBy: '',
      reviewedDate: '',
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

function buildEvaluationCode(items: SemesterEvaluation[]) {
      const year = new Date().getFullYear();
      const nextNumber = Math.max(...items.map((item) => item.id), 0) + 1;

      return `EVAL-${year}-${String(nextNumber).padStart(3, '0')}`;
}

function getTodayDateString() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
      if (!value) return '-';

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleDateString('vi-VN');
}

function formatScore(value: number | null) {
      if (value === null || value === undefined || Number.isNaN(value)) return '-';

      return value.toFixed(1);
}

function getResidentName(resident?: Resident | null) {
      return resident?.fullName || resident?.name || 'Chưa có tên';
}

function getResidentCode(resident?: Resident | null) {
      return resident?.residentCode || resident?.code || '';
}

function getRoomLabel(resident?: Resident | null) {
      if (!resident) return '';

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

function getAcademicLevelLabel(level: AcademicLevel) {
      if (level === 'excellent') return 'Xuất sắc';
      if (level === 'good') return 'Tốt';
      if (level === 'average') return 'Trung bình';
      if (level === 'warning') return 'Cần lưu ý';
      return 'Cần hỗ trợ';
}

function getAcademicLevelClass(level: AcademicLevel) {
      if (level === 'excellent') return 'border-purple-200 bg-purple-50 text-purple-700';
      if (level === 'good') return 'border-green-200 bg-green-50 text-green-700';
      if (level === 'average') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (level === 'warning') return 'border-amber-200 bg-amber-50 text-amber-700';
      return 'border-red-200 bg-red-50 text-red-700';
}

function getSupportLevelLabel(level: SupportLevel) {
      if (level === 'none') return 'Ổn định';
      if (level === 'monitor') return 'Theo dõi';
      if (level === 'support') return 'Cần hỗ trợ';
      return 'Ưu tiên hỗ trợ';
}

function getSupportLevelClass(level: SupportLevel) {
      if (level === 'none') return 'border-green-200 bg-green-50 text-green-700';
      if (level === 'monitor') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (level === 'support') return 'border-orange-200 bg-orange-50 text-orange-700';
      return 'border-red-200 bg-red-50 text-red-700';
}

function getStatusLabel(status: EvaluationStatus) {
      if (status === 'draft') return 'Đang ghi nhận';
      if (status === 'reviewed') return 'Đã lượng giá';
      if (status === 'approved') return 'Đã duyệt';
      return 'Lưu trữ';
}

function getStatusClass(status: EvaluationStatus) {
      if (status === 'draft') return 'border-slate-200 bg-slate-50 text-slate-700';
      if (status === 'reviewed') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (status === 'approved') return 'border-green-200 bg-green-50 text-green-700';
      return 'border-neutral-200 bg-neutral-100 text-neutral-600';
}

function getNextId(items: SemesterEvaluation[]) {
      return Math.max(...items.map((item) => item.id), 0) + 1;
}

function getNextSortOrder(items: SemesterEvaluation[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function validateForm({
      evaluations,
      formData,
      editingId,
}: {
      evaluations: SemesterEvaluation[];
      formData: EvaluationFormData;
      editingId?: number;
}) {
      const code = normalizeCode(formData.code);

      if (!code) return 'Vui lòng nhập mã lượng giá.';
      if (!formData.semester.trim()) return 'Vui lòng nhập học kỳ.';
      if (!formData.academicYear.trim()) return 'Vui lòng nhập năm học.';

      if (formData.averageScore.trim()) {
            const score = Number(formData.averageScore);

            if (!Number.isFinite(score) || score < 0 || score > 10) {
                  return 'Điểm trung bình phải nằm trong khoảng từ 0 đến 10.';
            }
      }

      const sortOrder = Number(formData.sortOrder || 0);

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCode = evaluations
            .filter((item) => item.id !== editingId)
            .some((item) => normalizeText(item.code) === normalizeText(code));

      if (duplicatedCode) {
            return 'Mã lượng giá đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

export default function AcademicEvaluations() {
      const [evaluations, setEvaluations] =
            useState<SemesterEvaluation[]>(initialEvaluations);
      const [searchTerm, setSearchTerm] = useState('');
      const [academicLevelFilter, setAcademicLevelFilter] = useState<'all' | AcademicLevel>('all');
      const [supportLevelFilter, setSupportLevelFilter] = useState<'all' | SupportLevel>('all');
      const [statusFilter, setStatusFilter] = useState<'all' | EvaluationStatus>('all');

      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingEvaluation, setEditingEvaluation] = useState<SemesterEvaluation | null>(null);
      const [formData, setFormData] = useState<EvaluationFormData>(defaultFormData);
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

      const filteredEvaluations = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return evaluations
                  .filter((item) => {
                        if (
                              academicLevelFilter !== 'all' &&
                              item.academicLevel !== academicLevelFilter
                        ) {
                              return false;
                        }

                        if (
                              supportLevelFilter !== 'all' &&
                              item.supportLevel !== supportLevelFilter
                        ) {
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
                              item.semester,
                              item.academicYear,
                              getAcademicLevelLabel(item.academicLevel),
                              getSupportLevelLabel(item.supportLevel),
                              getStatusLabel(item.status),
                              item.strengths,
                              item.concerns,
                              item.supportPlan,
                              item.reviewedBy,
                              item.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => {
                        const yearCompare = b.academicYear.localeCompare(a.academicYear, 'vi');

                        if (yearCompare !== 0) return yearCompare;

                        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
                  });
      }, [
            evaluations,
            searchTerm,
            academicLevelFilter,
            supportLevelFilter,
            statusFilter,
      ]);

      const stats = useMemo(() => {
            const scoredItems = evaluations.filter((item) => item.averageScore !== null);
            const average =
                  scoredItems.length > 0
                        ? scoredItems.reduce((sum, item) => sum + Number(item.averageScore || 0), 0) /
                          scoredItems.length
                        : 0;

            return {
                  total: evaluations.length,
                  reviewed: evaluations.filter(
                        (item) => item.status === 'reviewed' || item.status === 'approved'
                  ).length,
                  supportNeeded: evaluations.filter(
                        (item) => item.supportLevel === 'support' || item.supportLevel === 'priority'
                  ).length,
                  average,
            };
      }, [evaluations]);

      const openCreateForm = () => {
            setEditingEvaluation(null);
            setFormData({
                  ...defaultFormData,
                  code: buildEvaluationCode(evaluations),
                  reviewedDate: getTodayDateString(),
                  sortOrder: getNextSortOrder(evaluations),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (item: SemesterEvaluation) => {
            setEditingEvaluation(item);
            setFormData({
                  code: item.code,
                  residentId: item.residentId ? String(item.residentId) : '',
                  schoolName: item.schoolName,
                  majorName: item.majorName,
                  semester: item.semester,
                  academicYear: item.academicYear,
                  averageScore:
                        item.averageScore !== null && item.averageScore !== undefined
                              ? String(item.averageScore)
                              : '',
                  academicLevel: item.academicLevel,
                  supportLevel: item.supportLevel,
                  status: item.status,
                  strengths: item.strengths,
                  concerns: item.concerns,
                  supportPlan: item.supportPlan,
                  reviewedBy: item.reviewedBy,
                  reviewedDate: item.reviewedDate,
                  note: item.note || '',
                  sortOrder: String(item.sortOrder || 0),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const closeForm = () => {
            setIsFormOpen(false);
            setEditingEvaluation(null);
            setFormData(defaultFormData);
            setError(null);
      };

      const saveEvaluation = () => {
            const validationMessage = validateForm({
                  evaluations,
                  formData,
                  editingId: editingEvaluation?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const selectedResident = formData.residentId
                  ? residents.find((resident) => resident.id === Number(formData.residentId))
                  : null;

            const averageScore = formData.averageScore.trim()
                  ? Number(formData.averageScore)
                  : null;

            const payload: SemesterEvaluation = {
                  id: editingEvaluation?.id || getNextId(evaluations),
                  code: normalizeCode(formData.code),
                  residentId: selectedResident?.id || null,
                  residentName: selectedResident
                        ? getResidentName(selectedResident)
                        : editingEvaluation?.residentName || 'Chưa chọn học viên',
                  roomLabel: selectedResident
                        ? getRoomLabel(selectedResident)
                        : editingEvaluation?.roomLabel || '',
                  schoolName:
                        formData.schoolName.trim() ||
                        selectedResident?.schoolName ||
                        editingEvaluation?.schoolName ||
                        '',
                  majorName:
                        formData.majorName.trim() ||
                        selectedResident?.majorName ||
                        editingEvaluation?.majorName ||
                        '',
                  semester: formData.semester.trim(),
                  academicYear: formData.academicYear.trim(),
                  averageScore,
                  academicLevel: formData.academicLevel,
                  supportLevel: formData.supportLevel,
                  status: formData.status,
                  strengths: formData.strengths.trim(),
                  concerns: formData.concerns.trim(),
                  supportPlan: formData.supportPlan.trim(),
                  reviewedBy: formData.reviewedBy.trim(),
                  reviewedDate: formData.reviewedDate,
                  note: formData.note.trim() || null,
                  sortOrder: Number(formData.sortOrder || 0),
            };

            if (editingEvaluation) {
                  setEvaluations((current) =>
                        current.map((item) =>
                              item.id === editingEvaluation.id ? payload : item
                        )
                  );
            } else {
                  setEvaluations((current) => [...current, payload]);
            }

            closeForm();
      };

      const deleteEvaluation = (item: SemesterEvaluation) => {
            if (!confirm(`Bạn có chắc chắn muốn xóa lượng giá "${item.code}"?`)) {
                  return;
            }

            setEvaluations((current) => current.filter((row) => row.id !== item.id));
      };

      const clearFilters = () => {
            setSearchTerm('');
            setAcademicLevelFilter('all');
            setSupportLevelFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<SemesterEvaluation>[]>(
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
                        key: 'academicInfo',
                        label: 'Thông tin học tập',
                        sortable: true,
                        sortValue: (item) => `${item.academicYear}-${item.semester}`,
                        render: (item) => (
                              <div>
                                    <p className="font-semibold text-slate-900">
                                          {item.semester} · {item.academicYear}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                          {item.schoolName || 'Chưa có trường'} ·{' '}
                                          {item.majorName || 'Chưa có ngành'}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'score',
                        label: 'Điểm TB',
                        sortable: true,
                        sortValue: (item) => item.averageScore || 0,
                        render: (item) => (
                              <span className="text-sm font-bold text-slate-900">
                                    {formatScore(item.averageScore)}
                              </span>
                        ),
                  },
                  {
                        key: 'academicLevel',
                        label: 'Xếp loại',
                        sortable: true,
                        sortValue: (item) => getAcademicLevelLabel(item.academicLevel),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getAcademicLevelClass(
                                          item.academicLevel
                                    )}`}
                              >
                                    {getAcademicLevelLabel(item.academicLevel)}
                              </span>
                        ),
                  },
                  {
                        key: 'supportLevel',
                        label: 'Hỗ trợ',
                        sortable: true,
                        sortValue: (item) => getSupportLevelLabel(item.supportLevel),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getSupportLevelClass(
                                          item.supportLevel
                                    )}`}
                              >
                                    {getSupportLevelLabel(item.supportLevel)}
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
                        key: 'reviewedBy',
                        label: 'Người lượng giá',
                        sortable: true,
                        sortValue: (item) => item.reviewedBy,
                        render: (item) => (
                              <div>
                                    <p className="text-sm text-slate-700">{item.reviewedBy || '-'}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                          {formatDate(item.reviewedDate)}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'supportPlan',
                        label: 'Kế hoạch hỗ trợ',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (item) => item.supportPlan,
                        render: (item) => item.supportPlan || '-',
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
                                          title="Sửa lượng giá"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => deleteEvaluation(item)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa lượng giá"
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              </div>
                        ),
                  },
            ],
            [residents, evaluations]
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
                                          Lượng giá học kỳ
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Ghi nhận kết quả học tập tổng quan, mức độ cần hỗ trợ và kế hoạch đồng hành với học viên theo từng học kỳ.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm lượng giá
                              </button>
                        </div>

                        {(error || membersQuery.error) && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">
                                                      Có lỗi khi xử lý lượng giá học kỳ.
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
                                    moduleKey="academicEvaluations"
                                    cardKey="academicEvaluations.total"
                                    label="Tổng lượng giá"
                                    value={stats.total}
                                    description="Tổng hồ sơ lượng giá"
                                    tone="blue"
                                    icon={<BookOpenCheck className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="academicEvaluations"
                                    cardKey="academicEvaluations.reviewed"
                                    label="Đã lượng giá"
                                    value={stats.reviewed}
                                    description="Hồ sơ đã được xem xét"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="academicEvaluations"
                                    cardKey="academicEvaluations.supportNeeded"
                                    label="Cần hỗ trợ"
                                    value={stats.supportNeeded}
                                    description="Học viên cần theo dõi thêm"
                                    tone="orange"
                                    icon={<UserRound className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="academicEvaluations"
                                    cardKey="academicEvaluations.average"
                                    label="Điểm TB chung"
                                    value={Number(stats.average.toFixed(1))}
                                    description="Trung bình các hồ sơ có điểm"
                                    tone="purple"
                                    icon={<TrendingUp className="h-6 w-6" />}
                                    decimalPlaces={1}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1fr_220px_220px_220px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm học viên, trường, ngành, năm học, nhận xét..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={academicLevelFilter}
                                          onChange={(event) =>
                                                setAcademicLevelFilter(
                                                      event.target.value as 'all' | AcademicLevel
                                                )
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả xếp loại</option>
                                          <option value="excellent">Xuất sắc</option>
                                          <option value="good">Tốt</option>
                                          <option value="average">Trung bình</option>
                                          <option value="warning">Cần lưu ý</option>
                                          <option value="support_needed">Cần hỗ trợ</option>
                                    </select>

                                    <select
                                          value={supportLevelFilter}
                                          onChange={(event) =>
                                                setSupportLevelFilter(
                                                      event.target.value as 'all' | SupportLevel
                                                )
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả hỗ trợ</option>
                                          <option value="none">Ổn định</option>
                                          <option value="monitor">Theo dõi</option>
                                          <option value="support">Cần hỗ trợ</option>
                                          <option value="priority">Ưu tiên hỗ trợ</option>
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(
                                                      event.target.value as 'all' | EvaluationStatus
                                                )
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="draft">Đang ghi nhận</option>
                                          <option value="reviewed">Đã lượng giá</option>
                                          <option value="approved">Đã duyệt</option>
                                          <option value="archived">Lưu trữ</option>
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

                        <EvaluationOverview evaluations={filteredEvaluations} />

                        <ConfigurableDataTable
                              moduleKey="academicEvaluations"
                              tableKey="academicEvaluations.list"
                              columns={columns}
                              data={filteredEvaluations}
                              getRowKey={(item) => item.id}
                              isLoading={membersQuery.isLoading}
                              loadingText="Đang tải danh sách học viên..."
                              emptyTitle="Chưa có lượng giá học kỳ"
                              emptyDescription="Thêm lượng giá để theo dõi kết quả học tập và kế hoạch hỗ trợ học viên."
                        />

                        {isFormOpen && (
                              <EvaluationFormModal
                                    title={
                                          editingEvaluation
                                                ? 'Cập nhật lượng giá'
                                                : 'Thêm lượng giá'
                                    }
                                    formData={formData}
                                    setFormData={setFormData}
                                    residents={residents}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={saveEvaluation}
                                    submitText={editingEvaluation ? 'Cập nhật' : 'Thêm lượng giá'}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function EvaluationOverview({ evaluations }: { evaluations: SemesterEvaluation[] }) {
      if (evaluations.length === 0) {
            return (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                        Không có lượng giá phù hợp với bộ lọc hiện tại.
                  </div>
            );
      }

      const priorityItems = evaluations
            .filter(
                  (item) =>
                        item.supportLevel === 'support' ||
                        item.supportLevel === 'priority' ||
                        item.academicLevel === 'support_needed'
            )
            .slice(0, 3);

      const visibleItems = priorityItems.length > 0 ? priorityItems : evaluations.slice(0, 3);

      return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                              <h2 className="text-lg font-bold text-neutral-900">
                                    Học viên cần theo dõi
                              </h2>
                              <p className="mt-1 text-sm text-neutral-500">
                                    Danh sách ưu tiên dựa trên kết quả học tập và mức hỗ trợ cần thiết.
                              </p>
                        </div>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {evaluations.length} hồ sơ
                        </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                        {visibleItems.map((item) => (
                              <div
                                    key={item.id}
                                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm"
                              >
                                    <div className="flex items-start justify-between gap-3">
                                          <div>
                                                <p className="font-bold text-slate-900">
                                                      {item.residentName}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                      {item.semester} · {item.academicYear}
                                                </p>
                                          </div>

                                          <span
                                                className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getSupportLevelClass(
                                                      item.supportLevel
                                                )}`}
                                          >
                                                {getSupportLevelLabel(item.supportLevel)}
                                          </span>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2">
                                          <span
                                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getAcademicLevelClass(
                                                      item.academicLevel
                                                )}`}
                                          >
                                                {getAcademicLevelLabel(item.academicLevel)}
                                          </span>

                                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                TB: {formatScore(item.averageScore)}
                                          </span>
                                    </div>

                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                          {item.supportPlan || item.concerns || 'Chưa có kế hoạch hỗ trợ.'}
                                    </p>
                              </div>
                        ))}
                  </div>
            </div>
      );
}

function EvaluationFormModal({
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
      formData: EvaluationFormData;
      setFormData: React.Dispatch<React.SetStateAction<EvaluationFormData>>;
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
                  <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                                    <p className="text-sm text-neutral-500">
                                          Ghi nhận kết quả tổng quan, nhận xét và kế hoạch hỗ trợ học viên.
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
                                          <Label htmlFor="code">Mã lượng giá</Label>
                                          <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: EVAL-2026-001"
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
                                          <Label htmlFor="semester">Học kỳ</Label>
                                          <Input
                                                id="semester"
                                                value={formData.semester}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            semester: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: HK1, HK2"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="academicYear">Năm học</Label>
                                          <Input
                                                id="academicYear"
                                                value={formData.academicYear}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            academicYear: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: 2025-2026"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="averageScore">Điểm trung bình</Label>
                                          <Input
                                                id="averageScore"
                                                type="number"
                                                step="0.1"
                                                min={0}
                                                max={10}
                                                value={formData.averageScore}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            averageScore: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: 7.5"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="academicLevel">Xếp loại</Label>
                                          <select
                                                id="academicLevel"
                                                value={formData.academicLevel}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            academicLevel: event.target.value as AcademicLevel,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="excellent">Xuất sắc</option>
                                                <option value="good">Tốt</option>
                                                <option value="average">Trung bình</option>
                                                <option value="warning">Cần lưu ý</option>
                                                <option value="support_needed">Cần hỗ trợ</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="supportLevel">Mức hỗ trợ</Label>
                                          <select
                                                id="supportLevel"
                                                value={formData.supportLevel}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            supportLevel: event.target.value as SupportLevel,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="none">Ổn định</option>
                                                <option value="monitor">Theo dõi</option>
                                                <option value="support">Cần hỗ trợ</option>
                                                <option value="priority">Ưu tiên hỗ trợ</option>
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
                                                            status: event.target.value as EvaluationStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="draft">Đang ghi nhận</option>
                                                <option value="reviewed">Đã lượng giá</option>
                                                <option value="approved">Đã duyệt</option>
                                                <option value="archived">Lưu trữ</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="reviewedBy">Người lượng giá</Label>
                                          <Input
                                                id="reviewedBy"
                                                value={formData.reviewedBy}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            reviewedBy: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Ban học tập"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="reviewedDate">Ngày lượng giá</Label>
                                          <Input
                                                id="reviewedDate"
                                                type="date"
                                                value={formData.reviewedDate}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            reviewedDate: event.target.value,
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
                                    <Label htmlFor="strengths">Điểm tích cực</Label>
                                    <Textarea
                                          id="strengths"
                                          value={formData.strengths}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      strengths: event.target.value,
                                                })
                                          }
                                          placeholder="Những điểm học viên làm tốt trong học kỳ"
                                          className="min-h-24"
                                    />
                              </div>

                              <div>
                                    <Label htmlFor="concerns">Điểm cần lưu ý</Label>
                                    <Textarea
                                          id="concerns"
                                          value={formData.concerns}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      concerns: event.target.value,
                                                })
                                          }
                                          placeholder="Các khó khăn, môn học cần cải thiện hoặc vấn đề cần theo dõi"
                                          className="min-h-24"
                                    />
                              </div>

                              <div>
                                    <Label htmlFor="supportPlan">Kế hoạch hỗ trợ</Label>
                                    <Textarea
                                          id="supportPlan"
                                          value={formData.supportPlan}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      supportPlan: event.target.value,
                                                })
                                          }
                                          placeholder="Kế hoạch đồng hành, học nhóm, theo dõi hoặc trao đổi thêm"
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
