'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      BookOpenCheck,
      CheckCircle2,
      Edit2,
      FileText,
      Plus,
      Search,
      ShieldAlert,
      ShieldCheck,
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

type RuleStatus = 'active' | 'inactive';
type RuleSeverity = 'low' | 'medium' | 'high' | 'critical';
type RuleCategory =
      | 'daily_life'
      | 'study'
      | 'room'
      | 'liturgy'
      | 'safety'
      | 'conduct'
      | 'finance'
      | 'other';

type DisciplineRule = {
      id: number;
      code: string;
      title: string;
      category: RuleCategory;
      severity: RuleSeverity;
      status: RuleStatus;
      description: string;
      expectedBehavior: string;
      handlingSuggestion: string;
      effectiveFrom: string;
      note?: string | null;
      sortOrder: number;
};

type RuleFormData = {
      code: string;
      title: string;
      category: RuleCategory;
      severity: RuleSeverity;
      status: RuleStatus;
      description: string;
      expectedBehavior: string;
      handlingSuggestion: string;
      effectiveFrom: string;
      note: string;
      sortOrder: string;
};

const initialRules: DisciplineRule[] = [
      {
            id: 1,
            code: 'QUIET_HOURS',
            title: 'Giữ trật tự trong giờ nghỉ và giờ học',
            category: 'daily_life',
            severity: 'medium',
            status: 'active',
            description: 'Học viên cần giữ trật tự trong khung giờ nghỉ trưa, nghỉ đêm và giờ học chung.',
            expectedBehavior: 'Không gây ồn, không mở nhạc lớn, không tụ tập ảnh hưởng đến sinh hoạt chung.',
            handlingSuggestion: 'Nhắc nhở lần đầu, ghi nhận nếu tái diễn nhiều lần.',
            effectiveFrom: '2026-01-01',
            note: '',
            sortOrder: 10,
      },
      {
            id: 2,
            code: 'ROOM_CLEANLINESS',
            title: 'Giữ vệ sinh phòng ở và khu vực chung',
            category: 'room',
            severity: 'medium',
            status: 'active',
            description: 'Phòng ở và khu vực chung cần được giữ sạch sẽ, gọn gàng theo lịch trực nhật.',
            expectedBehavior: 'Thực hiện đúng lịch trực, không xả rác, không để đồ dùng cá nhân bừa bãi.',
            handlingSuggestion: 'Nhắc nhở tổ/phòng phụ trách và yêu cầu khắc phục trong ngày.',
            effectiveFrom: '2026-01-01',
            note: '',
            sortOrder: 20,
      },
      {
            id: 3,
            code: 'ABSENCE_NOTICE',
            title: 'Thông báo khi vắng mặt hoặc về trễ',
            category: 'conduct',
            severity: 'high',
            status: 'active',
            description: 'Học viên cần thông báo trước khi vắng mặt, về trễ hoặc có thay đổi lịch sinh hoạt.',
            expectedBehavior: 'Thông báo với người phụ trách hoặc tổ trưởng theo quy định của lưu xá.',
            handlingSuggestion: 'Ghi nhận lý do, trao đổi riêng nếu vắng không phép hoặc tái diễn.',
            effectiveFrom: '2026-01-01',
            note: '',
            sortOrder: 30,
      },
];

const defaultFormData: RuleFormData = {
      code: '',
      title: '',
      category: 'daily_life',
      severity: 'medium',
      status: 'active',
      description: '',
      expectedBehavior: '',
      handlingSuggestion: '',
      effectiveFrom: '',
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

function formatDate(value: string) {
      if (!value) return '-';

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleDateString('vi-VN');
}

function getCategoryLabel(category: RuleCategory) {
      if (category === 'daily_life') return 'Sinh hoạt hằng ngày';
      if (category === 'study') return 'Học tập';
      if (category === 'room') return 'Phòng ở';
      if (category === 'liturgy') return 'Phụng vụ';
      if (category === 'safety') return 'An toàn';
      if (category === 'conduct') return 'Nề nếp / Tác phong';
      if (category === 'finance') return 'Tài chính';
      return 'Khác';
}

function getCategoryClass(category: RuleCategory) {
      if (category === 'daily_life') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (category === 'study') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (category === 'room') return 'border-sky-200 bg-sky-50 text-sky-700';
      if (category === 'liturgy') return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      if (category === 'safety') return 'border-red-200 bg-red-50 text-red-700';
      if (category === 'conduct') return 'border-orange-200 bg-orange-50 text-orange-700';
      if (category === 'finance') return 'border-violet-200 bg-violet-50 text-violet-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getSeverityLabel(severity: RuleSeverity) {
      if (severity === 'low') return 'Nhẹ';
      if (severity === 'medium') return 'Trung bình';
      if (severity === 'high') return 'Nghiêm trọng';
      return 'Rất nghiêm trọng';
}

function getSeverityClass(severity: RuleSeverity) {
      if (severity === 'low') return 'border-slate-200 bg-slate-50 text-slate-700';
      if (severity === 'medium') return 'border-amber-200 bg-amber-50 text-amber-700';
      if (severity === 'high') return 'border-orange-200 bg-orange-50 text-orange-700';
      return 'border-red-200 bg-red-50 text-red-700';
}

function getStatusLabel(status: RuleStatus) {
      if (status === 'active') return 'Đang áp dụng';
      return 'Ngưng áp dụng';
}

function getStatusClass(status: RuleStatus) {
      if (status === 'active') return 'border-green-200 bg-green-50 text-green-700';
      return 'border-neutral-200 bg-neutral-100 text-neutral-600';
}

function getNextId(items: DisciplineRule[]) {
      return Math.max(...items.map((item) => item.id), 0) + 1;
}

function getNextSortOrder(items: DisciplineRule[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function validateForm({
      rules,
      formData,
      editingId,
}: {
      rules: DisciplineRule[];
      formData: RuleFormData;
      editingId?: number;
}) {
      const code = normalizeCode(formData.code);

      if (!code) return 'Vui lòng nhập mã nội quy.';
      if (!formData.title.trim()) return 'Vui lòng nhập tên nội quy.';
      if (!formData.description.trim()) return 'Vui lòng nhập nội dung mô tả.';
      if (!formData.effectiveFrom) return 'Vui lòng nhập ngày áp dụng.';

      const sortOrder = Number(formData.sortOrder || 0);

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCode = rules
            .filter((rule) => rule.id !== editingId)
            .some((rule) => normalizeText(rule.code) === normalizeText(code));

      if (duplicatedCode) {
            return 'Mã nội quy đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

export default function DisciplineRules() {
      const [rules, setRules] = useState<DisciplineRule[]>(initialRules);
      const [searchTerm, setSearchTerm] = useState('');
      const [categoryFilter, setCategoryFilter] = useState<'all' | RuleCategory>('all');
      const [severityFilter, setSeverityFilter] = useState<'all' | RuleSeverity>('all');
      const [statusFilter, setStatusFilter] = useState<'all' | RuleStatus>('all');
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingRule, setEditingRule] = useState<DisciplineRule | null>(null);
      const [formData, setFormData] = useState<RuleFormData>(defaultFormData);
      const [error, setError] = useState<string | null>(null);

      const filteredRules = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return rules
                  .filter((rule) => {
                        if (categoryFilter !== 'all' && rule.category !== categoryFilter) return false;
                        if (severityFilter !== 'all' && rule.severity !== severityFilter) return false;
                        if (statusFilter !== 'all' && rule.status !== statusFilter) return false;

                        if (!keyword) return true;

                        const haystack = [
                              rule.code,
                              rule.title,
                              getCategoryLabel(rule.category),
                              getSeverityLabel(rule.severity),
                              rule.description,
                              rule.expectedBehavior,
                              rule.handlingSuggestion,
                              rule.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
      }, [rules, searchTerm, categoryFilter, severityFilter, statusFilter]);

      const stats = useMemo(() => {
            return {
                  total: rules.length,
                  active: rules.filter((rule) => rule.status === 'active').length,
                  high: rules.filter((rule) => rule.severity === 'high' || rule.severity === 'critical').length,
                  categories: new Set(rules.map((rule) => rule.category)).size,
            };
      }, [rules]);

      const openCreateForm = () => {
            setEditingRule(null);
            setFormData({
                  ...defaultFormData,
                  sortOrder: getNextSortOrder(rules),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (rule: DisciplineRule) => {
            setEditingRule(rule);
            setFormData({
                  code: rule.code,
                  title: rule.title,
                  category: rule.category,
                  severity: rule.severity,
                  status: rule.status,
                  description: rule.description,
                  expectedBehavior: rule.expectedBehavior,
                  handlingSuggestion: rule.handlingSuggestion,
                  effectiveFrom: rule.effectiveFrom,
                  note: rule.note || '',
                  sortOrder: String(rule.sortOrder || 0),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const closeForm = () => {
            setIsFormOpen(false);
            setEditingRule(null);
            setFormData(defaultFormData);
            setError(null);
      };

      const handleSave = () => {
            const validationMessage = validateForm({
                  rules,
                  formData,
                  editingId: editingRule?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const payload: DisciplineRule = {
                  id: editingRule?.id || getNextId(rules),
                  code: normalizeCode(formData.code),
                  title: formData.title.trim(),
                  category: formData.category,
                  severity: formData.severity,
                  status: formData.status,
                  description: formData.description.trim(),
                  expectedBehavior: formData.expectedBehavior.trim(),
                  handlingSuggestion: formData.handlingSuggestion.trim(),
                  effectiveFrom: formData.effectiveFrom,
                  note: formData.note.trim() || null,
                  sortOrder: Number(formData.sortOrder || 0),
            };

            if (editingRule) {
                  setRules((current) =>
                        current.map((rule) => (rule.id === editingRule.id ? payload : rule))
                  );
            } else {
                  setRules((current) => [...current, payload]);
            }

            closeForm();
      };

      const handleDelete = (rule: DisciplineRule) => {
            if (!confirm(`Bạn có chắc chắn muốn xóa nội quy "${rule.title}"?`)) {
                  return;
            }

            setRules((current) => current.filter((item) => item.id !== rule.id));
      };

      const clearFilters = () => {
            setSearchTerm('');
            setCategoryFilter('all');
            setSeverityFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<DisciplineRule>[]>(
            () => [
                  {
                        key: 'rule',
                        label: 'Nội quy',
                        sortable: true,
                        sortValue: (rule) => rule.title,
                        render: (rule) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{rule.title}</p>
                                    <p className="mt-1 font-mono text-xs text-slate-500">{rule.code}</p>
                              </div>
                        ),
                  },
                  {
                        key: 'category',
                        label: 'Nhóm',
                        sortable: true,
                        sortValue: (rule) => getCategoryLabel(rule.category),
                        render: (rule) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getCategoryClass(
                                          rule.category
                                    )}`}
                              >
                                    {getCategoryLabel(rule.category)}
                              </span>
                        ),
                  },
                  {
                        key: 'severity',
                        label: 'Mức độ',
                        sortable: true,
                        sortValue: (rule) => getSeverityLabel(rule.severity),
                        render: (rule) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getSeverityClass(
                                          rule.severity
                                    )}`}
                              >
                                    {getSeverityLabel(rule.severity)}
                              </span>
                        ),
                  },
                  {
                        key: 'effectiveFrom',
                        label: 'Ngày áp dụng',
                        sortable: true,
                        sortValue: (rule) => rule.effectiveFrom,
                        render: (rule) => formatDate(rule.effectiveFrom),
                  },
                  {
                        key: 'status',
                        label: 'Trạng thái',
                        sortable: true,
                        sortValue: (rule) => getStatusLabel(rule.status),
                        render: (rule) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                          rule.status
                                    )}`}
                              >
                                    {getStatusLabel(rule.status)}
                              </span>
                        ),
                  },
                  {
                        key: 'description',
                        label: 'Mô tả',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (rule) => rule.description,
                        render: (rule) => rule.description || '-',
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[140px]',
                        render: (rule) => (
                              <div className="flex items-center gap-1.5">
                                    <button
                                          type="button"
                                          onClick={() => openEditForm(rule)}
                                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                          title="Sửa nội quy"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => handleDelete(rule)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa nội quy"
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
                                          Danh mục nội quy
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Quản lý các quy định sinh hoạt, học tập, phòng ở, an toàn và nề nếp chung trong lưu xá.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm nội quy
                              </button>
                        </div>

                        {error && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">Có lỗi khi xử lý nội quy.</p>
                                                <p className="mt-1 text-sm">{error}</p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="disciplineRules"
                                    cardKey="disciplineRules.total"
                                    label="Tổng nội quy"
                                    value={stats.total}
                                    description="Tổng số quy định đã khai báo"
                                    tone="blue"
                                    icon={<FileText className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="disciplineRules"
                                    cardKey="disciplineRules.active"
                                    label="Đang áp dụng"
                                    value={stats.active}
                                    description="Quy định còn hiệu lực"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="disciplineRules"
                                    cardKey="disciplineRules.high"
                                    label="Mức cao"
                                    value={stats.high}
                                    description="Quy định cần lưu ý đặc biệt"
                                    tone="orange"
                                    icon={<ShieldAlert className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="disciplineRules"
                                    cardKey="disciplineRules.categories"
                                    label="Nhóm nội quy"
                                    value={stats.categories}
                                    description="Số nhóm quy định đang có"
                                    tone="purple"
                                    icon={<BookOpenCheck className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1fr_220px_220px_220px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm nội quy, mô tả, hướng xử lý..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={categoryFilter}
                                          onChange={(event) =>
                                                setCategoryFilter(event.target.value as 'all' | RuleCategory)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả nhóm</option>
                                          <option value="daily_life">Sinh hoạt hằng ngày</option>
                                          <option value="study">Học tập</option>
                                          <option value="room">Phòng ở</option>
                                          <option value="liturgy">Phụng vụ</option>
                                          <option value="safety">An toàn</option>
                                          <option value="conduct">Nề nếp / Tác phong</option>
                                          <option value="finance">Tài chính</option>
                                          <option value="other">Khác</option>
                                    </select>

                                    <select
                                          value={severityFilter}
                                          onChange={(event) =>
                                                setSeverityFilter(event.target.value as 'all' | RuleSeverity)
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
                                                setStatusFilter(event.target.value as 'all' | RuleStatus)
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

                        <DisciplineRuleHighlights rules={filteredRules} />

                        <ConfigurableDataTable
                              moduleKey="disciplineRules"
                              tableKey="disciplineRules.list"
                              columns={columns}
                              data={filteredRules}
                              getRowKey={(rule) => rule.id}
                              emptyTitle="Chưa có nội quy"
                              emptyDescription="Thêm nội quy để chuẩn hóa quy định sinh hoạt và nề nếp chung."
                        />

                        {isFormOpen && (
                              <RuleFormModal
                                    title={editingRule ? 'Cập nhật nội quy' : 'Thêm nội quy'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={handleSave}
                                    submitText={editingRule ? 'Cập nhật' : 'Thêm nội quy'}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function DisciplineRuleHighlights({ rules }: { rules: DisciplineRule[] }) {
      if (rules.length === 0) {
            return (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                        Không có nội quy phù hợp với bộ lọc hiện tại.
                  </div>
            );
      }

      return (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {rules.slice(0, 3).map((rule) => (
                        <div
                              key={rule.id}
                              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                              <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                          <p className="line-clamp-1 font-bold text-slate-900">
                                                {rule.title}
                                          </p>
                                          <p className="mt-1 text-xs text-slate-500">
                                                Áp dụng từ {formatDate(rule.effectiveFrom)}
                                          </p>
                                    </div>

                                    <span
                                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getSeverityClass(
                                                rule.severity
                                          )}`}
                                    >
                                          {getSeverityLabel(rule.severity)}
                                    </span>
                              </div>

                              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                    {rule.description}
                              </p>

                              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                    <span className="font-semibold">Hướng xử lý:</span>{' '}
                                    {rule.handlingSuggestion || 'Chưa khai báo'}
                              </div>
                        </div>
                  ))}
            </div>
      );
}

function RuleFormModal({
      title,
      formData,
      setFormData,
      error,
      onClose,
      onSubmit,
      submitText,
}: {
      title: string;
      formData: RuleFormData;
      setFormData: React.Dispatch<React.SetStateAction<RuleFormData>>;
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
                                          Khai báo nội dung quy định, mức độ và hướng xử lý phù hợp.
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
                                          <Label htmlFor="code">Mã nội quy</Label>
                                          <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: QUIET_HOURS"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="title">Tên nội quy</Label>
                                          <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            title: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Giữ trật tự trong giờ nghỉ"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="category">Nhóm nội quy</Label>
                                          <select
                                                id="category"
                                                value={formData.category}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            category: event.target.value as RuleCategory,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="daily_life">Sinh hoạt hằng ngày</option>
                                                <option value="study">Học tập</option>
                                                <option value="room">Phòng ở</option>
                                                <option value="liturgy">Phụng vụ</option>
                                                <option value="safety">An toàn</option>
                                                <option value="conduct">Nề nếp / Tác phong</option>
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
                                                            severity: event.target.value as RuleSeverity,
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
                                          <Label htmlFor="effectiveFrom">Ngày áp dụng</Label>
                                          <Input
                                                id="effectiveFrom"
                                                type="date"
                                                value={formData.effectiveFrom}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            effectiveFrom: event.target.value,
                                                      })
                                                }
                                                required
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
                                                            status: event.target.value as RuleStatus,
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
                                    <Label htmlFor="description">Nội dung mô tả</Label>
                                    <Textarea
                                          id="description"
                                          value={formData.description}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      description: event.target.value,
                                                })
                                          }
                                          placeholder="Mô tả quy định cần tuân thủ"
                                          className="min-h-24"
                                    />
                              </div>

                              <div>
                                    <Label htmlFor="expectedBehavior">Hành vi mong đợi</Label>
                                    <Textarea
                                          id="expectedBehavior"
                                          value={formData.expectedBehavior}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      expectedBehavior: event.target.value,
                                                })
                                          }
                                          placeholder="Mô tả hành vi hoặc cách thực hiện đúng"
                                          className="min-h-24"
                                    />
                              </div>

                              <div>
                                    <Label htmlFor="handlingSuggestion">Hướng xử lý gợi ý</Label>
                                    <Textarea
                                          id="handlingSuggestion"
                                          value={formData.handlingSuggestion}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      handlingSuggestion: event.target.value,
                                                })
                                          }
                                          placeholder="Nhắc nhở, trao đổi riêng, ghi nhận hồ sơ..."
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
