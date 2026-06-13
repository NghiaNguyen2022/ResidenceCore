'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      Award,
      CalendarDays,
      CheckCircle2,
      Edit2,
      GraduationCap,
      Plus,
      Search,
      Star,
      Trash2,
      TrendingUp,
      UserCheck,
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

type ResultStatus = 'draft' | 'completed' | 'not_completed' | 'exempted' | 'cancelled';
type ResultLevel = 'excellent' | 'good' | 'passed' | 'needs_practice' | 'not_passed';
type EvaluationMethod = 'attendance' | 'observation' | 'practice' | 'assignment' | 'self_review' | 'other';

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

type SkillClassReference = {
      id: number;
      code: string;
      title: string;
      skillId: number | null;
      skillName: string;
      startDate: string;
};

type SkillResultItem = {
      id: number;
      code: string;
      residentId: number | null;
      residentName: string;
      roomLabel: string;
      skillId: number | null;
      skillName: string;
      classId: number | null;
      classTitle: string;
      resultStatus: ResultStatus;
      resultLevel: ResultLevel;
      evaluationMethod: EvaluationMethod;
      score: number | null;
      completedDate: string;
      evaluatedBy: string;
      evidence: string;
      feedback: string;
      nextSuggestion: string;
      note?: string | null;
      sortOrder: number;
};

type SkillResultFormData = {
      code: string;
      residentId: string;
      skillId: string;
      skillName: string;
      classId: string;
      classTitle: string;
      resultStatus: ResultStatus;
      resultLevel: ResultLevel;
      evaluationMethod: EvaluationMethod;
      score: string;
      completedDate: string;
      evaluatedBy: string;
      evidence: string;
      feedback: string;
      nextSuggestion: string;
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

const classReferences: SkillClassReference[] = [
      {
            id: 1,
            code: 'CLASS-2026-001',
            title: 'Giao tiếp căn bản trong đời sống chung',
            skillId: 1,
            skillName: 'Giao tiếp căn bản',
            startDate: '2026-06-08',
      },
      {
            id: 2,
            code: 'CLASS-2026-002',
            title: 'Quản lý thời gian học tập và sinh hoạt',
            skillId: 2,
            skillName: 'Quản lý thời gian',
            startDate: '2026-06-15',
      },
      {
            id: 3,
            code: 'CLASS-2026-003',
            title: 'Làm việc nhóm qua hoạt động cộng đoàn',
            skillId: 3,
            skillName: 'Làm việc nhóm',
            startDate: '2026-05-25',
      },
];

const initialResults: SkillResultItem[] = [
      {
            id: 1,
            code: 'RESULT-2026-001',
            residentId: null,
            residentName: 'Nguyễn Văn A',
            roomLabel: 'Phòng 101',
            skillId: 1,
            skillName: 'Giao tiếp căn bản',
            classId: 1,
            classTitle: 'Giao tiếp căn bản trong đời sống chung',
            resultStatus: 'completed',
            resultLevel: 'good',
            evaluationMethod: 'practice',
            score: 8.0,
            completedDate: '2026-06-08',
            evaluatedBy: 'Ban kỹ năng',
            evidence: 'Tham gia thực hành tình huống và phản hồi nhóm.',
            feedback: 'Có tiến bộ trong cách lắng nghe và trình bày ý kiến.',
            nextSuggestion: 'Tiếp tục tham gia các buổi làm việc nhóm để thực hành thêm.',
            note: '',
            sortOrder: 10,
      },
      {
            id: 2,
            code: 'RESULT-2026-002',
            residentId: null,
            residentName: 'Trần Thị B',
            roomLabel: 'Phòng 203',
            skillId: 2,
            skillName: 'Quản lý thời gian',
            classId: 2,
            classTitle: 'Quản lý thời gian học tập và sinh hoạt',
            resultStatus: 'draft',
            resultLevel: 'needs_practice',
            evaluationMethod: 'self_review',
            score: 6.5,
            completedDate: '2026-06-15',
            evaluatedBy: 'Ban học tập',
            evidence: 'Đã nộp kế hoạch tuần cá nhân.',
            feedback: 'Cần theo dõi thêm việc duy trì kế hoạch hằng tuần.',
            nextSuggestion: 'Tổ trưởng hỗ trợ nhắc lịch trong 2 tuần tiếp theo.',
            note: '',
            sortOrder: 20,
      },
      {
            id: 3,
            code: 'RESULT-2026-003',
            residentId: null,
            residentName: 'Lê Văn C',
            roomLabel: 'Phòng 305',
            skillId: 3,
            skillName: 'Làm việc nhóm',
            classId: 3,
            classTitle: 'Làm việc nhóm qua hoạt động cộng đoàn',
            resultStatus: 'completed',
            resultLevel: 'passed',
            evaluationMethod: 'observation',
            score: 7.0,
            completedDate: '2026-05-25',
            evaluatedBy: 'Tổ chức lưu xá',
            evidence: 'Hoàn thành phần việc được phân công trong nhóm.',
            feedback: 'Phối hợp tốt, cần chủ động hơn trong vai trò điều phối.',
            nextSuggestion: 'Có thể tham gia thêm hoạt động cộng đoàn để rèn luyện tiếp.',
            note: '',
            sortOrder: 30,
      },
];

const defaultFormData: SkillResultFormData = {
      code: '',
      residentId: '',
      skillId: '',
      skillName: '',
      classId: '',
      classTitle: '',
      resultStatus: 'draft',
      resultLevel: 'passed',
      evaluationMethod: 'attendance',
      score: '',
      completedDate: '',
      evaluatedBy: '',
      evidence: '',
      feedback: '',
      nextSuggestion: '',
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

function buildResultCode(items: SkillResultItem[]) {
      const year = new Date().getFullYear();
      const nextNumber = Math.max(...items.map((item) => item.id), 0) + 1;

      return `RESULT-${year}-${String(nextNumber).padStart(3, '0')}`;
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


function formatScore(value: number | null) {
      if (value === null || value === undefined || Number.isNaN(value)) return '-';

      return value.toFixed(1);
}

function getStatusLabel(status: ResultStatus) {
      if (status === 'draft') return 'Đang ghi nhận';
      if (status === 'completed') return 'Hoàn thành';
      if (status === 'not_completed') return 'Chưa hoàn thành';
      if (status === 'exempted') return 'Miễn tham gia';
      return 'Đã hủy';
}

function getStatusClass(status: ResultStatus) {
      if (status === 'draft') return 'border-slate-200 bg-slate-50 text-slate-700';
      if (status === 'completed') return 'border-green-200 bg-green-50 text-green-700';
      if (status === 'not_completed') return 'border-orange-200 bg-orange-50 text-orange-700';
      if (status === 'exempted') return 'border-blue-200 bg-blue-50 text-blue-700';
      return 'border-red-200 bg-red-50 text-red-700';
}

function getLevelLabel(level: ResultLevel) {
      if (level === 'excellent') return 'Xuất sắc';
      if (level === 'good') return 'Tốt';
      if (level === 'passed') return 'Đạt';
      if (level === 'needs_practice') return 'Cần thực hành thêm';
      return 'Chưa đạt';
}

function getLevelClass(level: ResultLevel) {
      if (level === 'excellent') return 'border-purple-200 bg-purple-50 text-purple-700';
      if (level === 'good') return 'border-green-200 bg-green-50 text-green-700';
      if (level === 'passed') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (level === 'needs_practice') return 'border-amber-200 bg-amber-50 text-amber-700';
      return 'border-red-200 bg-red-50 text-red-700';
}

function getEvaluationMethodLabel(method: EvaluationMethod) {
      if (method === 'attendance') return 'Theo tham dự';
      if (method === 'observation') return 'Quan sát';
      if (method === 'practice') return 'Thực hành';
      if (method === 'assignment') return 'Bài tập';
      if (method === 'self_review') return 'Tự đánh giá';
      return 'Khác';
}

function getEvaluationMethodClass(method: EvaluationMethod) {
      if (method === 'attendance') return 'border-slate-200 bg-slate-50 text-slate-700';
      if (method === 'observation') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (method === 'practice') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (method === 'assignment') return 'border-orange-200 bg-orange-50 text-orange-700';
      if (method === 'self_review') return 'border-violet-200 bg-violet-50 text-violet-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getNextId(items: SkillResultItem[]) {
      return Math.max(...items.map((item) => item.id), 0) + 1;
}

function getNextSortOrder(items: SkillResultItem[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function validateForm({
      items,
      formData,
      editingId,
}: {
      items: SkillResultItem[];
      formData: SkillResultFormData;
      editingId?: number;
}) {
      const code = normalizeCode(formData.code);

      if (!code) return 'Vui lòng nhập mã kết quả.';
      if (!formData.residentId) return 'Vui lòng chọn học viên.';
      if (!formData.skillId && !formData.skillName.trim()) return 'Vui lòng chọn hoặc nhập kỹ năng.';
      if (!formData.completedDate) return 'Vui lòng nhập ngày ghi nhận.';

      if (formData.score.trim()) {
            const score = Number(formData.score);

            if (!Number.isFinite(score) || score < 0 || score > 10) {
                  return 'Điểm đánh giá phải nằm trong khoảng từ 0 đến 10.';
            }
      }

      const sortOrder = Number(formData.sortOrder || 0);

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCode = items
            .filter((item) => item.id !== editingId)
            .some((item) => normalizeText(item.code) === normalizeText(code));

      if (duplicatedCode) {
            return 'Mã kết quả đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

export default function SkillResults() {
      const [items, setItems] = useState<SkillResultItem[]>(initialResults);
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState<'all' | ResultStatus>('all');
      const [levelFilter, setLevelFilter] = useState<'all' | ResultLevel>('all');
      const [methodFilter, setMethodFilter] = useState<'all' | EvaluationMethod>('all');

      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingItem, setEditingItem] = useState<SkillResultItem | null>(null);
      const [formData, setFormData] = useState<SkillResultFormData>(defaultFormData);
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
                        if (statusFilter !== 'all' && item.resultStatus !== statusFilter) return false;
                        if (levelFilter !== 'all' && item.resultLevel !== levelFilter) return false;
                        if (methodFilter !== 'all' && item.evaluationMethod !== methodFilter) return false;

                        if (!keyword) return true;

                        const haystack = [
                              item.code,
                              item.residentName,
                              item.roomLabel,
                              item.skillName,
                              item.classTitle,
                              getStatusLabel(item.resultStatus),
                              getLevelLabel(item.resultLevel),
                              getEvaluationMethodLabel(item.evaluationMethod),
                              item.evaluatedBy,
                              item.evidence,
                              item.feedback,
                              item.nextSuggestion,
                              item.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => {
                        const dateCompare = new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();

                        if (dateCompare !== 0) return dateCompare;

                        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
                  });
      }, [items, searchTerm, statusFilter, levelFilter, methodFilter]);

      const stats = useMemo(() => {
            const scoredItems = items.filter((item) => item.score !== null);
            const average =
                  scoredItems.length > 0
                        ? scoredItems.reduce((sum, item) => sum + Number(item.score || 0), 0) /
                          scoredItems.length
                        : 0;

            return {
                  total: items.length,
                  completed: items.filter((item) => item.resultStatus === 'completed').length,
                  needPractice: items.filter(
                        (item) =>
                              item.resultLevel === 'needs_practice' ||
                              item.resultLevel === 'not_passed' ||
                              item.resultStatus === 'not_completed'
                  ).length,
                  average,
            };
      }, [items]);

      const openCreateForm = () => {
            setEditingItem(null);
            setFormData({
                  ...defaultFormData,
                  code: buildResultCode(items),
                  completedDate: getTodayDateString(),
                  sortOrder: getNextSortOrder(items),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (item: SkillResultItem) => {
            setEditingItem(item);
            setFormData({
                  code: item.code,
                  residentId: item.residentId ? String(item.residentId) : '',
                  skillId: item.skillId ? String(item.skillId) : '',
                  skillName: item.skillName,
                  classId: item.classId ? String(item.classId) : '',
                  classTitle: item.classTitle,
                  resultStatus: item.resultStatus,
                  resultLevel: item.resultLevel,
                  evaluationMethod: item.evaluationMethod,
                  score: item.score !== null && item.score !== undefined ? String(item.score) : '',
                  completedDate: item.completedDate,
                  evaluatedBy: item.evaluatedBy,
                  evidence: item.evidence,
                  feedback: item.feedback,
                  nextSuggestion: item.nextSuggestion,
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

            const selectedResident = residents.find(
                  (resident) => resident.id === Number(formData.residentId)
            );

            const selectedSkill = formData.skillId
                  ? skillReferences.find((skill) => skill.id === Number(formData.skillId))
                  : null;

            const selectedClass = formData.classId
                  ? classReferences.find((item) => item.id === Number(formData.classId))
                  : null;

            const payload: SkillResultItem = {
                  id: editingItem?.id || getNextId(items),
                  code: normalizeCode(formData.code),
                  residentId: selectedResident?.id || null,
                  residentName: selectedResident ? getResidentName(selectedResident) : 'Chưa chọn học viên',
                  roomLabel: selectedResident ? getRoomLabel(selectedResident) : '',
                  skillId: selectedSkill?.id || selectedClass?.skillId || null,
                  skillName:
                        selectedSkill?.name ||
                        selectedClass?.skillName ||
                        formData.skillName.trim() ||
                        'Chưa chọn kỹ năng',
                  classId: selectedClass?.id || null,
                  classTitle: selectedClass?.title || formData.classTitle.trim() || '',
                  resultStatus: formData.resultStatus,
                  resultLevel: formData.resultLevel,
                  evaluationMethod: formData.evaluationMethod,
                  score: formData.score.trim() ? Number(formData.score) : null,
                  completedDate: formData.completedDate,
                  evaluatedBy: formData.evaluatedBy.trim(),
                  evidence: formData.evidence.trim(),
                  feedback: formData.feedback.trim(),
                  nextSuggestion: formData.nextSuggestion.trim(),
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

      const deleteItem = (item: SkillResultItem) => {
            if (!confirm(`Bạn có chắc chắn muốn xóa kết quả "${item.code}"?`)) return;

            setItems((current) => current.filter((row) => row.id !== item.id));
      };

      const markCompleted = (item: SkillResultItem) => {
            setItems((current) =>
                  current.map((row) =>
                        row.id === item.id
                              ? {
                                      ...row,
                                      resultStatus: 'completed',
                                      resultLevel:
                                            row.resultLevel === 'not_passed' ? 'passed' : row.resultLevel,
                                      completedDate: row.completedDate || getTodayDateString(),
                                }
                              : row
                  )
            );
      };

      const clearFilters = () => {
            setSearchTerm('');
            setStatusFilter('all');
            setLevelFilter('all');
            setMethodFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<SkillResultItem>[]>(
            () => [
                  {
                        key: 'resident',
                        label: 'Học viên',
                        sortable: true,
                        sortValue: (item) => item.residentName,
                        render: (item) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{item.residentName}</p>
                                    {item.roomLabel && (
                                          <p className="mt-1 text-xs text-slate-500">{item.roomLabel}</p>
                                    )}
                              </div>
                        ),
                  },
                  {
                        key: 'skill',
                        label: 'Kỹ năng / Lớp',
                        sortable: true,
                        sortValue: (item) => item.skillName,
                        render: (item) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{item.skillName}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                          {item.classTitle || 'Không gắn lớp cụ thể'}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'status',
                        label: 'Kết quả',
                        sortable: true,
                        sortValue: (item) => getStatusLabel(item.resultStatus),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                          item.resultStatus
                                    )}`}
                              >
                                    {getStatusLabel(item.resultStatus)}
                              </span>
                        ),
                  },
                  {
                        key: 'level',
                        label: 'Mức đạt',
                        sortable: true,
                        sortValue: (item) => getLevelLabel(item.resultLevel),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getLevelClass(
                                          item.resultLevel
                                    )}`}
                              >
                                    {getLevelLabel(item.resultLevel)}
                              </span>
                        ),
                  },
                  {
                        key: 'score',
                        label: 'Điểm',
                        sortable: true,
                        sortValue: (item) => item.score || 0,
                        render: (item) => (
                              <span className="text-sm font-bold text-slate-900">
                                    {formatScore(item.score)}
                              </span>
                        ),
                  },
                  {
                        key: 'method',
                        label: 'Đánh giá',
                        sortable: true,
                        sortValue: (item) => getEvaluationMethodLabel(item.evaluationMethod),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getEvaluationMethodClass(
                                          item.evaluationMethod
                                    )}`}
                              >
                                    {getEvaluationMethodLabel(item.evaluationMethod)}
                              </span>
                        ),
                  },
                  {
                        key: 'completedDate',
                        label: 'Ngày ghi nhận',
                        sortable: true,
                        sortValue: (item) => item.completedDate,
                        render: (item) => (
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <CalendarDays className="h-4 w-4 text-slate-400" />
                                    {formatDate(item.completedDate)}
                              </div>
                        ),
                  },
                  {
                        key: 'evaluatedBy',
                        label: 'Người đánh giá',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (item) => item.evaluatedBy,
                        render: (item) => item.evaluatedBy || '-',
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[190px]',
                        render: (item) => (
                              <div className="flex items-center gap-1.5">
                                    {item.resultStatus !== 'completed' && (
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
                                          title="Sửa kết quả"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => deleteItem(item)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa kết quả"
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
                                          Kết quả kỹ năng
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Ghi nhận kết quả tham gia lớp kỹ năng, mức độ hoàn thành, phản hồi và đề xuất phát triển tiếp theo cho từng học viên.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm kết quả
                              </button>
                        </div>

                        {(error || membersQuery.error) && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">
                                                      Có lỗi khi xử lý kết quả kỹ năng.
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
                                    moduleKey="skillResults"
                                    cardKey="skillResults.total"
                                    label="Tổng kết quả"
                                    value={stats.total}
                                    description="Tổng số kết quả đã ghi nhận"
                                    tone="blue"
                                    icon={<GraduationCap className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="skillResults"
                                    cardKey="skillResults.completed"
                                    label="Hoàn thành"
                                    value={stats.completed}
                                    description="Kết quả đã hoàn thành"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="skillResults"
                                    cardKey="skillResults.needPractice"
                                    label="Cần rèn thêm"
                                    value={stats.needPractice}
                                    description="Cần theo dõi hoặc thực hành thêm"
                                    tone="orange"
                                    icon={<UserCheck className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="skillResults"
                                    cardKey="skillResults.average"
                                    label="Điểm TB"
                                    value={Number(stats.average.toFixed(1))}
                                    description="Trung bình các kết quả có điểm"
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
                                                placeholder="Tìm học viên, kỹ năng, lớp, phản hồi..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(event.target.value as 'all' | ResultStatus)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả kết quả</option>
                                          <option value="draft">Đang ghi nhận</option>
                                          <option value="completed">Hoàn thành</option>
                                          <option value="not_completed">Chưa hoàn thành</option>
                                          <option value="exempted">Miễn tham gia</option>
                                          <option value="cancelled">Đã hủy</option>
                                    </select>

                                    <select
                                          value={levelFilter}
                                          onChange={(event) =>
                                                setLevelFilter(event.target.value as 'all' | ResultLevel)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả mức đạt</option>
                                          <option value="excellent">Xuất sắc</option>
                                          <option value="good">Tốt</option>
                                          <option value="passed">Đạt</option>
                                          <option value="needs_practice">Cần thực hành thêm</option>
                                          <option value="not_passed">Chưa đạt</option>
                                    </select>

                                    <select
                                          value={methodFilter}
                                          onChange={(event) =>
                                                setMethodFilter(event.target.value as 'all' | EvaluationMethod)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả cách đánh giá</option>
                                          <option value="attendance">Theo tham dự</option>
                                          <option value="observation">Quan sát</option>
                                          <option value="practice">Thực hành</option>
                                          <option value="assignment">Bài tập</option>
                                          <option value="self_review">Tự đánh giá</option>
                                          <option value="other">Khác</option>
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

                        <SkillResultOverview items={filteredItems} />

                        <ConfigurableDataTable
                              moduleKey="skillResults"
                              tableKey="skillResults.list"
                              columns={columns}
                              data={filteredItems}
                              getRowKey={(item) => item.id}
                              isLoading={membersQuery.isLoading}
                              loadingText="Đang tải danh sách học viên..."
                              emptyTitle="Chưa có kết quả kỹ năng"
                              emptyDescription="Thêm kết quả để theo dõi quá trình tham gia và phát triển kỹ năng của học viên."
                        />

                        {isFormOpen && (
                              <SkillResultFormModal
                                    title={editingItem ? 'Cập nhật kết quả kỹ năng' : 'Thêm kết quả kỹ năng'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    residents={residents}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={saveItem}
                                    submitText={editingItem ? 'Cập nhật' : 'Thêm kết quả'}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function SkillResultOverview({ items }: { items: SkillResultItem[] }) {
      if (items.length === 0) {
            return (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                        Không có kết quả phù hợp với bộ lọc hiện tại.
                  </div>
            );
      }

      const visibleItems = items
            .filter(
                  (item) =>
                        item.resultLevel === 'needs_practice' ||
                        item.resultLevel === 'not_passed' ||
                        item.resultStatus === 'not_completed'
            )
            .slice(0, 3);

      const displayItems = visibleItems.length > 0 ? visibleItems : items.slice(0, 3);

      return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                              <h2 className="text-lg font-bold text-neutral-900">
                                    Kết quả cần theo dõi
                              </h2>
                              <p className="mt-1 text-sm text-neutral-500">
                                    Ưu tiên các học viên cần thực hành thêm hoặc chưa hoàn thành kỹ năng.
                              </p>
                        </div>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {items.length} kết quả
                        </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                        {displayItems.map((item) => (
                              <div
                                    key={item.id}
                                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm"
                              >
                                    <div className="flex items-start justify-between gap-3">
                                          <div className="min-w-0">
                                                <p className="line-clamp-1 font-bold text-slate-900">
                                                      {item.residentName}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                      {item.skillName}
                                                </p>
                                          </div>

                                          <span
                                                className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getLevelClass(
                                                      item.resultLevel
                                                )}`}
                                          >
                                                {getLevelLabel(item.resultLevel)}
                                          </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                          <span
                                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                                      item.resultStatus
                                                )}`}
                                          >
                                                {getStatusLabel(item.resultStatus)}
                                          </span>

                                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                Điểm: {formatScore(item.score)}
                                          </span>
                                    </div>

                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                          {item.nextSuggestion || item.feedback || 'Chưa có đề xuất tiếp theo.'}
                                    </p>
                              </div>
                        ))}
                  </div>
            </div>
      );
}

function SkillResultFormModal({
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
      formData: SkillResultFormData;
      setFormData: React.Dispatch<React.SetStateAction<SkillResultFormData>>;
      residents: Resident[];
      error: string | null;
      onClose: () => void;
      onSubmit: () => void;
      submitText: string;
}) {
      const handleClassChange = (classId: string) => {
            const selectedClass = classId
                  ? classReferences.find((item) => item.id === Number(classId))
                  : null;

            setFormData({
                  ...formData,
                  classId,
                  classTitle: selectedClass?.title || formData.classTitle,
                  skillId: selectedClass?.skillId ? String(selectedClass.skillId) : formData.skillId,
                  skillName: selectedClass?.skillName || formData.skillName,
            });
      };

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
                                          Ghi nhận kết quả hoàn thành kỹ năng, phản hồi và đề xuất phát triển tiếp theo.
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
                                          <Label htmlFor="code">Mã kết quả</Label>
                                          <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: RESULT-2026-001"
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
                                                required
                                          >
                                                <option value="">Chọn học viên</option>
                                                {residents.map((resident) => (
                                                      <option key={resident.id} value={String(resident.id)}>
                                                            {getResidentName(resident)} · {getResidentCode(resident) || getRoomLabel(resident)}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="classId">Lớp kỹ năng</Label>
                                          <select
                                                id="classId"
                                                value={formData.classId}
                                                onChange={(event) => handleClassChange(event.target.value)}
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="">Không gắn lớp cụ thể</option>
                                                {classReferences.map((item) => (
                                                      <option key={item.id} value={String(item.id)}>
                                                            {item.title}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="skillId">Kỹ năng</Label>
                                          <select
                                                id="skillId"
                                                value={formData.skillId}
                                                onChange={(event) => handleSkillChange(event.target.value)}
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="">Chọn kỹ năng</option>
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
                                          <Label htmlFor="classTitle">Tên lớp hiển thị</Label>
                                          <Input
                                                id="classTitle"
                                                value={formData.classTitle}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            classTitle: event.target.value,
                                                      })
                                                }
                                                placeholder="Tên lớp kỹ năng nếu cần"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="resultStatus">Trạng thái kết quả</Label>
                                          <select
                                                id="resultStatus"
                                                value={formData.resultStatus}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            resultStatus: event.target.value as ResultStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="draft">Đang ghi nhận</option>
                                                <option value="completed">Hoàn thành</option>
                                                <option value="not_completed">Chưa hoàn thành</option>
                                                <option value="exempted">Miễn tham gia</option>
                                                <option value="cancelled">Đã hủy</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="resultLevel">Mức đạt</Label>
                                          <select
                                                id="resultLevel"
                                                value={formData.resultLevel}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            resultLevel: event.target.value as ResultLevel,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="excellent">Xuất sắc</option>
                                                <option value="good">Tốt</option>
                                                <option value="passed">Đạt</option>
                                                <option value="needs_practice">Cần thực hành thêm</option>
                                                <option value="not_passed">Chưa đạt</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="evaluationMethod">Cách đánh giá</Label>
                                          <select
                                                id="evaluationMethod"
                                                value={formData.evaluationMethod}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            evaluationMethod: event.target.value as EvaluationMethod,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="attendance">Theo tham dự</option>
                                                <option value="observation">Quan sát</option>
                                                <option value="practice">Thực hành</option>
                                                <option value="assignment">Bài tập</option>
                                                <option value="self_review">Tự đánh giá</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="score">Điểm đánh giá</Label>
                                          <Input
                                                id="score"
                                                type="number"
                                                min={0}
                                                max={10}
                                                step="0.1"
                                                value={formData.score}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            score: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: 8.0"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="completedDate">Ngày ghi nhận</Label>
                                          <Input
                                                id="completedDate"
                                                type="date"
                                                value={formData.completedDate}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            completedDate: event.target.value,
                                                      })
                                                }
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="evaluatedBy">Người đánh giá</Label>
                                          <Input
                                                id="evaluatedBy"
                                                value={formData.evaluatedBy}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            evaluatedBy: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Ban kỹ năng"
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
                                    <Label htmlFor="evidence">Minh chứng / Căn cứ đánh giá</Label>
                                    <Textarea
                                          id="evidence"
                                          value={formData.evidence}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      evidence: event.target.value,
                                                })
                                          }
                                          placeholder="Tham dự, thực hành, bài tập, quan sát..."
                                          className="min-h-24"
                                    />
                              </div>

                              <div>
                                    <Label htmlFor="feedback">Nhận xét</Label>
                                    <Textarea
                                          id="feedback"
                                          value={formData.feedback}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      feedback: event.target.value,
                                                })
                                          }
                                          placeholder="Nhận xét về quá trình tham gia và mức độ đạt được"
                                          className="min-h-24"
                                    />
                              </div>

                              <div>
                                    <Label htmlFor="nextSuggestion">Đề xuất tiếp theo</Label>
                                    <Textarea
                                          id="nextSuggestion"
                                          value={formData.nextSuggestion}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      nextSuggestion: event.target.value,
                                                })
                                          }
                                          placeholder="Đề xuất lớp tiếp theo, thực hành thêm hoặc hỗ trợ cá nhân"
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
