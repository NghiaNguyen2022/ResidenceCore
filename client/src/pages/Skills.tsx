'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      Award,
      BookOpenCheck,
      CheckCircle2,
      Edit2,
      Layers3,
      Plus,
      Search,
      Sparkles,
      Trash2,
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

type SkillStatus = 'active' | 'inactive';
type SkillLevel = 'basic' | 'intermediate' | 'advanced';
type SkillCategory =
      | 'life'
      | 'communication'
      | 'learning'
      | 'leadership'
      | 'digital'
      | 'career'
      | 'spiritual'
      | 'community'
      | 'other';

type SkillItem = {
      id: number;
      code: string;
      name: string;
      category: SkillCategory;
      level: SkillLevel;
      status: SkillStatus;
      description: string;
      objective: string;
      evaluationCriteria: string;
      suggestedDuration: string;
      ownerGroup: string;
      note?: string | null;
      classCount: number;
      completedCount: number;
      sortOrder: number;
};

type SkillFormData = {
      code: string;
      name: string;
      category: SkillCategory;
      level: SkillLevel;
      status: SkillStatus;
      description: string;
      objective: string;
      evaluationCriteria: string;
      suggestedDuration: string;
      ownerGroup: string;
      note: string;
      sortOrder: string;
};

const initialSkills: SkillItem[] = [
      {
            id: 1,
            code: 'COMMUNICATION_BASIC',
            name: 'Giao tiếp căn bản',
            category: 'communication',
            level: 'basic',
            status: 'active',
            description: 'Kỹ năng giao tiếp hằng ngày, lắng nghe và phản hồi phù hợp trong môi trường chung.',
            objective: 'Giúp học viên tự tin trao đổi, trình bày ý kiến và ứng xử lịch sự trong cộng đoàn.',
            evaluationCriteria: 'Tham gia đầy đủ, thực hành tình huống và có nhận xét đạt yêu cầu từ người phụ trách.',
            suggestedDuration: '2 buổi',
            ownerGroup: 'Ban kỹ năng',
            note: '',
            classCount: 2,
            completedCount: 18,
            sortOrder: 10,
      },
      {
            id: 2,
            code: 'TIME_MANAGEMENT',
            name: 'Quản lý thời gian',
            category: 'learning',
            level: 'basic',
            status: 'active',
            description: 'Kỹ năng lập kế hoạch học tập, sinh hoạt và cân bằng thời gian cá nhân.',
            objective: 'Hỗ trợ học viên chủ động hơn trong lịch học, giờ sinh hoạt và công tác chung.',
            evaluationCriteria: 'Có kế hoạch tuần cá nhân và duy trì thực hiện tối thiểu trong 2 tuần.',
            suggestedDuration: '1 buổi',
            ownerGroup: 'Ban học tập',
            note: '',
            classCount: 1,
            completedCount: 12,
            sortOrder: 20,
      },
      {
            id: 3,
            code: 'TEAMWORK',
            name: 'Làm việc nhóm',
            category: 'community',
            level: 'intermediate',
            status: 'active',
            description: 'Kỹ năng phối hợp, phân vai và hoàn thành công việc chung trong nhóm.',
            objective: 'Tăng khả năng cộng tác trong sinh hoạt, sự kiện, trực nhật và hoạt động cộng đoàn.',
            evaluationCriteria: 'Tham gia hoạt động nhóm, hoàn thành phần việc được giao và có phản hồi tích cực.',
            suggestedDuration: '2 buổi',
            ownerGroup: 'Tổ chức lưu xá',
            note: '',
            classCount: 3,
            completedCount: 20,
            sortOrder: 30,
      },
];

const defaultFormData: SkillFormData = {
      code: '',
      name: '',
      category: 'life',
      level: 'basic',
      status: 'active',
      description: '',
      objective: '',
      evaluationCriteria: '',
      suggestedDuration: '',
      ownerGroup: '',
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
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}

function getCategoryLabel(category: SkillCategory) {
      if (category === 'life') return 'Kỹ năng sống';
      if (category === 'communication') return 'Giao tiếp';
      if (category === 'learning') return 'Học tập';
      if (category === 'leadership') return 'Lãnh đạo';
      if (category === 'digital') return 'Công nghệ số';
      if (category === 'career') return 'Nghề nghiệp';
      if (category === 'spiritual') return 'Đời sống thiêng liêng';
      if (category === 'community') return 'Cộng đoàn';
      return 'Khác';
}

function getCategoryClass(category: SkillCategory) {
      if (category === 'life') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (category === 'communication') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (category === 'learning') return 'border-sky-200 bg-sky-50 text-sky-700';
      if (category === 'leadership') return 'border-purple-200 bg-purple-50 text-purple-700';
      if (category === 'digital') return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      if (category === 'career') return 'border-orange-200 bg-orange-50 text-orange-700';
      if (category === 'spiritual') return 'border-violet-200 bg-violet-50 text-violet-700';
      if (category === 'community') return 'border-pink-200 bg-pink-50 text-pink-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getLevelLabel(level: SkillLevel) {
      if (level === 'basic') return 'Cơ bản';
      if (level === 'intermediate') return 'Trung cấp';
      return 'Nâng cao';
}

function getLevelClass(level: SkillLevel) {
      if (level === 'basic') return 'border-green-200 bg-green-50 text-green-700';
      if (level === 'intermediate') return 'border-amber-200 bg-amber-50 text-amber-700';
      return 'border-red-200 bg-red-50 text-red-700';
}

function getStatusLabel(status: SkillStatus) {
      if (status === 'active') return 'Đang sử dụng';
      return 'Ngưng sử dụng';
}

function getStatusClass(status: SkillStatus) {
      if (status === 'active') return 'border-green-200 bg-green-50 text-green-700';
      return 'border-neutral-200 bg-neutral-100 text-neutral-600';
}

function getNextId(items: SkillItem[]) {
      return Math.max(...items.map((item) => item.id), 0) + 1;
}

function getNextSortOrder(items: SkillItem[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function validateForm({
      skills,
      formData,
      editingId,
}: {
      skills: SkillItem[];
      formData: SkillFormData;
      editingId?: number;
}) {
      const code = normalizeCode(formData.code);

      if (!code) return 'Vui lòng nhập mã kỹ năng.';
      if (!formData.name.trim()) return 'Vui lòng nhập tên kỹ năng.';

      const sortOrder = Number(formData.sortOrder || 0);

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCode = skills
            .filter((item) => item.id !== editingId)
            .some((item) => normalizeText(item.code) === normalizeText(code));

      if (duplicatedCode) {
            return 'Mã kỹ năng đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

export default function Skills() {
      const [skills, setSkills] = useState<SkillItem[]>(initialSkills);
      const [searchTerm, setSearchTerm] = useState('');
      const [categoryFilter, setCategoryFilter] = useState<'all' | SkillCategory>('all');
      const [levelFilter, setLevelFilter] = useState<'all' | SkillLevel>('all');
      const [statusFilter, setStatusFilter] = useState<'all' | SkillStatus>('all');

      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
      const [formData, setFormData] = useState<SkillFormData>(defaultFormData);
      const [error, setError] = useState<string | null>(null);

      const filteredSkills = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return skills
                  .filter((item) => {
                        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
                        if (levelFilter !== 'all' && item.level !== levelFilter) return false;
                        if (statusFilter !== 'all' && item.status !== statusFilter) return false;

                        if (!keyword) return true;

                        const haystack = [
                              item.code,
                              item.name,
                              getCategoryLabel(item.category),
                              getLevelLabel(item.level),
                              item.description,
                              item.objective,
                              item.evaluationCriteria,
                              item.suggestedDuration,
                              item.ownerGroup,
                              item.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
      }, [skills, searchTerm, categoryFilter, levelFilter, statusFilter]);

      const stats = useMemo(() => {
            return {
                  total: skills.length,
                  active: skills.filter((item) => item.status === 'active').length,
                  classes: skills.reduce((sum, item) => sum + (item.classCount || 0), 0),
                  completed: skills.reduce((sum, item) => sum + (item.completedCount || 0), 0),
            };
      }, [skills]);

      const openCreateForm = () => {
            setEditingSkill(null);
            setFormData({
                  ...defaultFormData,
                  sortOrder: getNextSortOrder(skills),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (item: SkillItem) => {
            setEditingSkill(item);
            setFormData({
                  code: item.code,
                  name: item.name,
                  category: item.category,
                  level: item.level,
                  status: item.status,
                  description: item.description,
                  objective: item.objective,
                  evaluationCriteria: item.evaluationCriteria,
                  suggestedDuration: item.suggestedDuration,
                  ownerGroup: item.ownerGroup,
                  note: item.note || '',
                  sortOrder: String(item.sortOrder || 0),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const closeForm = () => {
            setIsFormOpen(false);
            setEditingSkill(null);
            setFormData(defaultFormData);
            setError(null);
      };

      const saveSkill = () => {
            const validationMessage = validateForm({
                  skills,
                  formData,
                  editingId: editingSkill?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const payload: SkillItem = {
                  id: editingSkill?.id || getNextId(skills),
                  code: normalizeCode(formData.code),
                  name: formData.name.trim(),
                  category: formData.category,
                  level: formData.level,
                  status: formData.status,
                  description: formData.description.trim(),
                  objective: formData.objective.trim(),
                  evaluationCriteria: formData.evaluationCriteria.trim(),
                  suggestedDuration: formData.suggestedDuration.trim(),
                  ownerGroup: formData.ownerGroup.trim(),
                  note: formData.note.trim() || null,
                  classCount: editingSkill?.classCount || 0,
                  completedCount: editingSkill?.completedCount || 0,
                  sortOrder: Number(formData.sortOrder || 0),
            };

            if (editingSkill) {
                  setSkills((current) =>
                        current.map((item) => (item.id === editingSkill.id ? payload : item))
                  );
            } else {
                  setSkills((current) => [...current, payload]);
            }

            closeForm();
      };

      const deleteSkill = (item: SkillItem) => {
            if ((item.classCount || 0) > 0 || (item.completedCount || 0) > 0) {
                  setError('Không thể xóa kỹ năng đã có lớp hoặc kết quả hoàn thành. Có thể chuyển sang trạng thái ngưng sử dụng.');
                  return;
            }

            if (!confirm(`Bạn có chắc chắn muốn xóa kỹ năng "${item.name}"?`)) return;

            setSkills((current) => current.filter((row) => row.id !== item.id));
      };

      const clearFilters = () => {
            setSearchTerm('');
            setCategoryFilter('all');
            setLevelFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<SkillItem>[]>(
            () => [
                  {
                        key: 'skill',
                        label: 'Kỹ năng',
                        sortable: true,
                        sortValue: (item) => item.name,
                        render: (item) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{item.name}</p>
                                    <p className="mt-1 font-mono text-xs text-slate-500">{item.code}</p>
                              </div>
                        ),
                  },
                  {
                        key: 'category',
                        label: 'Nhóm kỹ năng',
                        sortable: true,
                        sortValue: (item) => getCategoryLabel(item.category),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getCategoryClass(
                                          item.category
                                    )}`}
                              >
                                    {getCategoryLabel(item.category)}
                              </span>
                        ),
                  },
                  {
                        key: 'level',
                        label: 'Cấp độ',
                        sortable: true,
                        sortValue: (item) => getLevelLabel(item.level),
                        render: (item) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getLevelClass(
                                          item.level
                                    )}`}
                              >
                                    {getLevelLabel(item.level)}
                              </span>
                        ),
                  },
                  {
                        key: 'ownerGroup',
                        label: 'Phụ trách',
                        sortable: true,
                        sortValue: (item) => item.ownerGroup,
                        render: (item) => item.ownerGroup || '-',
                  },
                  {
                        key: 'suggestedDuration',
                        label: 'Thời lượng',
                        sortable: true,
                        sortValue: (item) => item.suggestedDuration,
                        render: (item) => item.suggestedDuration || '-',
                  },
                  {
                        key: 'usage',
                        label: 'Sử dụng',
                        sortable: true,
                        sortValue: (item) => item.classCount,
                        render: (item) => (
                              <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                          {item.classCount || 0} lớp
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                          {item.completedCount || 0} lượt hoàn thành
                                    </p>
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
                        key: 'objective',
                        label: 'Mục tiêu',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (item) => item.objective,
                        render: (item) => item.objective || '-',
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
                                          title="Sửa kỹ năng"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => deleteSkill(item)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa kỹ năng"
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              </div>
                        ),
                  },
            ],
            [skills]
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
                                          Danh mục kỹ năng
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Quản lý danh mục kỹ năng dùng cho các lớp kỹ năng, hoạt động phát triển bản thân và ghi nhận kết quả hoàn thành của học viên.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm kỹ năng
                              </button>
                        </div>

                        {error && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">
                                                      Có lỗi khi xử lý danh mục kỹ năng.
                                                </p>
                                                <p className="mt-1 text-sm">{error}</p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="skills"
                                    cardKey="skills.total"
                                    label="Tổng kỹ năng"
                                    value={stats.total}
                                    description="Tổng số kỹ năng đã khai báo"
                                    tone="blue"
                                    icon={<Sparkles className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="skills"
                                    cardKey="skills.active"
                                    label="Đang sử dụng"
                                    value={stats.active}
                                    description="Kỹ năng còn áp dụng"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="skills"
                                    cardKey="skills.classes"
                                    label="Lớp kỹ năng"
                                    value={stats.classes}
                                    description="Số lớp đang tham chiếu"
                                    tone="orange"
                                    icon={<Layers3 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="skills"
                                    cardKey="skills.completed"
                                    label="Hoàn thành"
                                    value={stats.completed}
                                    description="Tổng lượt hoàn thành"
                                    tone="purple"
                                    icon={<Award className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1fr_220px_180px_220px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm kỹ năng, mã, nhóm, mục tiêu..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={categoryFilter}
                                          onChange={(event) =>
                                                setCategoryFilter(event.target.value as 'all' | SkillCategory)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả nhóm kỹ năng</option>
                                          <option value="life">Kỹ năng sống</option>
                                          <option value="communication">Giao tiếp</option>
                                          <option value="learning">Học tập</option>
                                          <option value="leadership">Lãnh đạo</option>
                                          <option value="digital">Công nghệ số</option>
                                          <option value="career">Nghề nghiệp</option>
                                          <option value="spiritual">Đời sống thiêng liêng</option>
                                          <option value="community">Cộng đoàn</option>
                                          <option value="other">Khác</option>
                                    </select>

                                    <select
                                          value={levelFilter}
                                          onChange={(event) =>
                                                setLevelFilter(event.target.value as 'all' | SkillLevel)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả cấp độ</option>
                                          <option value="basic">Cơ bản</option>
                                          <option value="intermediate">Trung cấp</option>
                                          <option value="advanced">Nâng cao</option>
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(event.target.value as 'all' | SkillStatus)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="active">Đang sử dụng</option>
                                          <option value="inactive">Ngưng sử dụng</option>
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

                        <SkillHighlights skills={filteredSkills} />

                        <ConfigurableDataTable
                              moduleKey="skills"
                              tableKey="skills.list"
                              columns={columns}
                              data={filteredSkills}
                              getRowKey={(item) => item.id}
                              emptyTitle="Chưa có kỹ năng"
                              emptyDescription="Thêm kỹ năng để dùng cho lớp kỹ năng và kết quả phát triển của học viên."
                        />

                        {isFormOpen && (
                              <SkillFormModal
                                    title={editingSkill ? 'Cập nhật kỹ năng' : 'Thêm kỹ năng'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={saveSkill}
                                    submitText={editingSkill ? 'Cập nhật' : 'Thêm kỹ năng'}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function SkillHighlights({ skills }: { skills: SkillItem[] }) {
      if (skills.length === 0) {
            return (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                        Không có kỹ năng phù hợp với bộ lọc hiện tại.
                  </div>
            );
      }

      return (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {skills.slice(0, 3).map((item) => (
                        <div
                              key={item.id}
                              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                              <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                          <p className="line-clamp-1 font-bold text-slate-900">
                                                {item.name}
                                          </p>
                                          <p className="mt-1 text-xs text-slate-500">
                                                {item.ownerGroup || 'Chưa phân công phụ trách'}
                                          </p>
                                    </div>

                                    <span
                                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getLevelClass(
                                                item.level
                                          )}`}
                                    >
                                          {getLevelLabel(item.level)}
                                    </span>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span
                                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getCategoryClass(
                                                item.category
                                          )}`}
                                    >
                                          {getCategoryLabel(item.category)}
                                    </span>

                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                          {item.suggestedDuration || 'Chưa có thời lượng'}
                                    </span>
                              </div>

                              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                    {item.objective || item.description || 'Chưa có mô tả mục tiêu.'}
                              </p>
                        </div>
                  ))}
            </div>
      );
}

function SkillFormModal({
      title,
      formData,
      setFormData,
      error,
      onClose,
      onSubmit,
      submitText,
}: {
      title: string;
      formData: SkillFormData;
      setFormData: React.Dispatch<React.SetStateAction<SkillFormData>>;
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
                                          Khai báo kỹ năng để sử dụng trong lớp kỹ năng và kết quả phát triển học viên.
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
                                          <Label htmlFor="code">Mã kỹ năng</Label>
                                          <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: COMMUNICATION_BASIC"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="name">Tên kỹ năng</Label>
                                          <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            name: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Giao tiếp căn bản"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="category">Nhóm kỹ năng</Label>
                                          <select
                                                id="category"
                                                value={formData.category}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            category: event.target.value as SkillCategory,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="life">Kỹ năng sống</option>
                                                <option value="communication">Giao tiếp</option>
                                                <option value="learning">Học tập</option>
                                                <option value="leadership">Lãnh đạo</option>
                                                <option value="digital">Công nghệ số</option>
                                                <option value="career">Nghề nghiệp</option>
                                                <option value="spiritual">Đời sống thiêng liêng</option>
                                                <option value="community">Cộng đoàn</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="level">Cấp độ</Label>
                                          <select
                                                id="level"
                                                value={formData.level}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            level: event.target.value as SkillLevel,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="basic">Cơ bản</option>
                                                <option value="intermediate">Trung cấp</option>
                                                <option value="advanced">Nâng cao</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="suggestedDuration">Thời lượng gợi ý</Label>
                                          <Input
                                                id="suggestedDuration"
                                                value={formData.suggestedDuration}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            suggestedDuration: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: 2 buổi"
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
                                          <Label htmlFor="status">Trạng thái</Label>
                                          <select
                                                id="status"
                                                value={formData.status}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            status: event.target.value as SkillStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="active">Đang sử dụng</option>
                                                <option value="inactive">Ngưng sử dụng</option>
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
                                          placeholder="Mô tả ngắn gọn nội dung kỹ năng"
                                          className="min-h-24"
                                    />
                              </div>

                              <div>
                                    <Label htmlFor="objective">Mục tiêu</Label>
                                    <Textarea
                                          id="objective"
                                          value={formData.objective}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      objective: event.target.value,
                                                })
                                          }
                                          placeholder="Mục tiêu sau khi học viên hoàn thành kỹ năng"
                                          className="min-h-24"
                                    />
                              </div>

                              <div>
                                    <Label htmlFor="evaluationCriteria">Tiêu chí đánh giá</Label>
                                    <Textarea
                                          id="evaluationCriteria"
                                          value={formData.evaluationCriteria}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      evaluationCriteria: event.target.value,
                                                })
                                          }
                                          placeholder="Tiêu chí ghi nhận hoàn thành hoặc đạt yêu cầu"
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
