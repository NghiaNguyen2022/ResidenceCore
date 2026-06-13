'use client';

import { useEffect, useMemo, useState } from 'react';
import {
      BookOpen,
      Edit2,
      GraduationCap,
      Save,
      User,
} from 'lucide-react';
import { toast } from 'sonner';
import { normalizeText } from '@/lib/text';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
      AppCard,
      EmptyState,
      ErrorState,
      FormField,
      FormSelect,
      LoadingState,
      StatusBadge,
} from '@/components/shared';
import { ConfigurableStatCard } from '@/components/configurable/ConfigurableStatCard';

type EducationLevel = 'high_school' | 'vocational' | 'college' | 'university' | 'other';

const EDUCATION_LEVEL_OPTIONS: { value: EducationLevel; label: string }[] = [
      { value: 'university', label: 'Đại học' },
      { value: 'college', label: 'Cao đẳng' },
      { value: 'high_school', label: 'Trung học phổ thông' },
      { value: 'vocational', label: 'Trung cấp / Nghề' },
      { value: 'other', label: 'Khác' },
];

function getLevelLabel(level?: EducationLevel | null) {
      return EDUCATION_LEVEL_OPTIONS.find((o) => o.value === level)?.label ?? '—';
}

function getLevelTone(level?: EducationLevel | null) {
      if (level === 'university') return 'info' as const;
      if (level === 'college') return 'purple' as const;
      if (level === 'high_school') return 'success' as const;
      if (level === 'vocational') return 'warning' as const;
      return 'default' as const;
}

type ResidentEducation = {
      id?: number;
      residentId: number;
      schoolName: string;
      educationLevel?: EducationLevel | null;
      classOrMajor?: string | null;
      academicYear?: string | null;
      notes?: string | null;
};

type EducationFormData = {
      schoolName: string;
      educationLevel: EducationLevel;
      classOrMajor: string;
      academicYear: string;
      notes: string;
};

const DEFAULT_FORM: EducationFormData = {
      schoolName: '',
      educationLevel: 'university',
      classOrMajor: '',
      academicYear: '',
      notes: '',
};


function ResidentEducationPanel({
      residentId,
      residentName,
}: {
      residentId: number;
      residentName: string;
}) {
      const [isEditing, setIsEditing] = useState(false);
      const [formData, setFormData] = useState<EducationFormData>(DEFAULT_FORM);
      const [formError, setFormError] = useState<string | null>(null);

      const educationQuery = trpc.members.getEducation.useQuery({ residentId });
      const utils = trpc.useUtils();

      const upsertMutation = trpc.members.upsertEducation.useMutation({
            onSuccess: () => {
                  utils.members.getEducation.invalidate({ residentId });
                  toast.success('Đã lưu thông tin học hành.');
                  setIsEditing(false);
            },
            onError: (err) => setFormError(err.message),
      });

      useEffect(() => {
            if (educationQuery.data) {
                  const d = educationQuery.data as ResidentEducation;
                  setFormData({
                        schoolName: d.schoolName || '',
                        educationLevel: (d.educationLevel as EducationLevel) || 'university',
                        classOrMajor: d.classOrMajor || '',
                        academicYear: d.academicYear || '',
                        notes: d.notes || '',
                  });
            }
      }, [educationQuery.data]);

      function handleSave() {
            if (!formData.schoolName.trim()) {
                  setFormError('Vui lòng nhập tên trường đang học.');
                  return;
            }
            setFormError(null);
            upsertMutation.mutate({
                  residentId,
                  schoolName: formData.schoolName.trim(),
                  educationLevel: formData.educationLevel || undefined,
                  classOrMajor: formData.classOrMajor.trim() || null,
                  academicYear: formData.academicYear.trim() || null,
                  notes: formData.notes.trim() || null,
            });
      }

      function startEdit() {
            const d = educationQuery.data as ResidentEducation | null;
            setFormData({
                  schoolName: d?.schoolName || '',
                  educationLevel: (d?.educationLevel as EducationLevel) || 'university',
                  classOrMajor: d?.classOrMajor || '',
                  academicYear: d?.academicYear || '',
                  notes: d?.notes || '',
            });
            setFormError(null);
            setIsEditing(true);
      }

      if (educationQuery.isLoading) return <LoadingState size="sm" />;
      if (educationQuery.isError)
            return (
                  <ErrorState
                        message={educationQuery.error.message}
                        onRetry={() => educationQuery.refetch()}
                  />
            );

      const education = educationQuery.data as ResidentEducation | null;
      const isSaving = upsertMutation.isPending;

      return (
            <div className="space-y-4">
                  {!isEditing && (
                        <div className="flex items-start justify-between">
                              <div className="space-y-3">
                                    {education?.schoolName ? (
                                          <>
                                                <div>
                                                      <p className="text-xs text-slate-500">Trường đang học</p>
                                                      <p className="font-semibold text-slate-900">
                                                            {education.schoolName}
                                                      </p>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                      {education.educationLevel && (
                                                            <StatusBadge tone={getLevelTone(education.educationLevel)}>
                                                                  {getLevelLabel(education.educationLevel)}
                                                            </StatusBadge>
                                                      )}
                                                      {education.classOrMajor && (
                                                            <span className="text-sm text-slate-700">
                                                                  Ngành / Lớp: {education.classOrMajor}
                                                            </span>
                                                      )}
                                                      {education.academicYear && (
                                                            <span className="text-sm text-slate-700">
                                                                  Năm học: {education.academicYear}
                                                            </span>
                                                      )}
                                                </div>
                                                {education.notes && (
                                                      <p className="text-xs text-slate-500">{education.notes}</p>
                                                )}
                                          </>
                                    ) : (
                                          <p className="text-sm text-slate-400">Chưa có thông tin học hành</p>
                                    )}
                              </div>
                              <Button size="sm" variant="outline" onClick={startEdit}>
                                    <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                                    {education?.schoolName ? 'Sửa' : 'Thêm'}
                              </Button>
                        </div>
                  )}

                  {isEditing && (
                        <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                              {formError && (
                                    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                                          {formError}
                                    </p>
                              )}

                              <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField label="Tên trường đang học" required className="sm:col-span-2">
                                          <Input
                                                value={formData.schoolName}
                                                onChange={(e) =>
                                                      setFormData((d) => ({ ...d, schoolName: e.target.value }))
                                                }
                                                placeholder="VD: Đại học Khoa học Tự nhiên"
                                                disabled={isSaving}
                                          />
                                    </FormField>

                                    <FormField label="Bậc học">
                                          <FormSelect
                                                value={formData.educationLevel}
                                                onValueChange={(v) =>
                                                      setFormData((d) => ({
                                                            ...d,
                                                            educationLevel: v as EducationLevel,
                                                      }))
                                                }
                                                options={EDUCATION_LEVEL_OPTIONS}
                                                disabled={isSaving}
                                          />
                                    </FormField>

                                    <FormField label="Ngành / Lớp">
                                          <Input
                                                value={formData.classOrMajor}
                                                onChange={(e) =>
                                                      setFormData((d) => ({
                                                            ...d,
                                                            classOrMajor: e.target.value,
                                                      }))
                                                }
                                                placeholder="VD: Công nghệ thông tin - K45"
                                                disabled={isSaving}
                                          />
                                    </FormField>

                                    <FormField label="Năm học">
                                          <Input
                                                value={formData.academicYear}
                                                onChange={(e) =>
                                                      setFormData((d) => ({
                                                            ...d,
                                                            academicYear: e.target.value,
                                                      }))
                                                }
                                                placeholder="VD: 2025-2026"
                                                disabled={isSaving}
                                          />
                                    </FormField>

                                    <FormField label="Ghi chú" className="sm:col-span-2">
                                          <Textarea
                                                value={formData.notes}
                                                onChange={(e) =>
                                                      setFormData((d) => ({ ...d, notes: e.target.value }))
                                                }
                                                placeholder="Ghi chú thêm (nếu có)"
                                                rows={2}
                                                disabled={isSaving}
                                          />
                                    </FormField>
                              </div>

                              <div className="flex gap-2">
                                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                          <Save className="mr-1.5 h-3.5 w-3.5" />
                                          {isSaving ? 'Đang lưu...' : 'Lưu'}
                                    </Button>
                                    <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setIsEditing(false)}
                                          disabled={isSaving}
                                    >
                                          Hủy
                                    </Button>
                              </div>
                        </div>
                  )}
            </div>
      );
}

export default function AcademicInfo() {
      const [searchTerm, setSearchTerm] = useState('');
      const [expandedId, setExpandedId] = useState<number | null>(null);

      const membersQuery = trpc.members.list.useQuery({ limit: 500, offset: 0 });

      const residents = useMemo(() => {
            const kw = normalizeText(searchTerm);
            const all = ((membersQuery.data || []) as any[]).filter(
                  (r) => r.status === 'active'
            );
            if (!kw) return all;
            return all.filter((r) => {
                  const hay = normalizeText(r.fullName) + ' ' + normalizeText(r.holyName);
                  return hay.includes(kw);
            });
      }, [membersQuery.data, searchTerm]);

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6">
                        {/* Header */}
                        <div>
                              <h1 className="text-2xl font-bold text-slate-900">Thông tin học hành</h1>
                              <p className="mt-1 text-sm text-slate-500">
                                    Quản lý thông tin trường học, ngành học của từng học viên
                              </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                              <ConfigurableStatCard
                                    moduleKey="academic-info"
                                    cardKey="total-residents"
                                    title="Tổng học viên"
                                    value={String(
                                          ((membersQuery.data || []) as any[]).filter(
                                                (r) => r.status === 'active'
                                          ).length
                                    )}
                                    icon={<User className="h-4 w-4" />}
                              />
                              <ConfigurableStatCard
                                    moduleKey="academic-info"
                                    cardKey="search-results"
                                    title="Kết quả tìm kiếm"
                                    value={String(residents.length)}
                                    icon={<BookOpen className="h-4 w-4" />}
                              />
                              <ConfigurableStatCard
                                    moduleKey="academic-info"
                                    cardKey="currently-viewing"
                                    title="Đang xem"
                                    value={expandedId ? '1' : '—'}
                                    icon={<GraduationCap className="h-4 w-4" />}
                              />
                        </div>

                        {/* Search */}
                        <div className="max-w-sm">
                              <Input
                                    placeholder="Tìm theo tên học viên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                              />
                        </div>

                        {/* Resident list */}
                        {membersQuery.isLoading ? (
                              <LoadingState />
                        ) : membersQuery.isError ? (
                              <ErrorState
                                    message="Không thể tải danh sách học viên."
                                    onRetry={() => membersQuery.refetch()}
                              />
                        ) : residents.length === 0 ? (
                              <EmptyState
                                    title="Không tìm thấy học viên"
                                    description="Thử thay đổi từ khóa tìm kiếm."
                              />
                        ) : (
                              <div className="space-y-3">
                                    {residents.map((r: any) => (
                                          <AppCard
                                                key={r.id}
                                                compact
                                                title={
                                                      <button
                                                            className="flex items-center gap-2 text-left font-semibold text-slate-900 hover:text-blue-600"
                                                            onClick={() =>
                                                                  setExpandedId(
                                                                        expandedId === r.id ? null : r.id
                                                                  )
                                                            }
                                                      >
                                                            <User className="h-4 w-4 shrink-0 text-slate-400" />
                                                            {r.holyName
                                                                  ? `${r.holyName} ${r.fullName}`
                                                                  : r.fullName}
                                                            {r.roomCode && (
                                                                  <span className="text-xs font-normal text-slate-400">
                                                                        — {r.roomCode}
                                                                  </span>
                                                            )}
                                                      </button>
                                                }
                                          >
                                                {expandedId === r.id && (
                                                      <ResidentEducationPanel
                                                            residentId={r.id}
                                                            residentName={r.fullName}
                                                      />
                                                )}
                                                {expandedId !== r.id && (
                                                      <p
                                                            className="cursor-pointer text-xs text-slate-400 hover:text-slate-600"
                                                            onClick={() => setExpandedId(r.id)}
                                                      >
                                                            Nhấn để xem / chỉnh sửa thông tin học hành
                                                      </p>
                                                )}
                                          </AppCard>
                                    ))}
                              </div>
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}
