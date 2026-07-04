import { useMemo, useState } from "react";
import { GraduationCap, Pencil, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { residenceMediumStyle } from "@/components/shared/styleMedium";

type EducationLevel =
      | "high_school"
      | "vocational"
      | "college"
      | "university"
      | "other";

type EducationInfo = {
      id?: number;
      residentId?: number;
      schoolName?: string | null;
      educationLevel?: EducationLevel | null;
      classOrMajor?: string | null;
      academicYear?: string | null;
      notes?: string | null;
};

type EducationInfoPayload = {
      residentId: number;
      schoolName: string;
      educationLevel?: EducationLevel | null;
      classOrMajor?: string | null;
      academicYear?: string | null;
      notes?: string | null;
};

type EducationInfoSectionProps = {
      residentId: number;
      education?: EducationInfo | null;
      readonly?: boolean;
      isSaving?: boolean;
      onSave: (data: EducationInfoPayload) => void;
};

const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
      high_school: "THPT",
      vocational: "Trung cấp / Nghề",
      college: "Cao đẳng",
      university: "Đại học",
      other: "Khác",
};

const educationLevelOptions: Array<{ value: EducationLevel; label: string }> = [
      { value: "high_school", label: "THPT" },
      { value: "vocational", label: "Trung cấp / Nghề" },
      { value: "college", label: "Cao đẳng" },
      { value: "university", label: "Đại học" },
      { value: "other", label: "Khác" },
];

function createEducationDraft(education?: EducationInfo | null) {
      return {
            schoolName: education?.schoolName || "",
            educationLevel: education?.educationLevel || "university",
            classOrMajor: education?.classOrMajor || "",
            academicYear: education?.academicYear || "",
            notes: education?.notes || "",
      };
}

function CompactInfo({
      label,
      value,
}: {
      label: string;
      value?: string | null;
}) {
      return (
            <div className="min-w-0 rounded-2xl border border-amber-100/80 bg-white/80 px-3 py-2.5 shadow-sm shadow-amber-900/5">
                  <div className="text-xs font-medium text-slate-400">{label}</div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-800">
                        {value || "Chưa cập nhật"}
                  </div>
            </div>
      );
}

export function EducationInfoSection({
      residentId,
      education,
      readonly = false,
      isSaving = false,
      onSave,
}: EducationInfoSectionProps) {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [formData, setFormData] = useState(() => createEducationDraft(education));
      const [formError, setFormError] = useState<string | null>(null);

      const hasEducation = Boolean(education?.schoolName);

      const educationLevelLabel = useMemo(() => {
            if (!education?.educationLevel) return "Chưa cập nhật";
            return EDUCATION_LEVEL_LABELS[education.educationLevel] || "Khác";
      }, [education?.educationLevel]);

      const openEdit = () => {
            setFormData(createEducationDraft(education));
            setFormError(null);
            setIsModalOpen(true);
      };

      const closeEdit = () => {
            setFormError(null);
            setIsModalOpen(false);
      };

      const handleSave = () => {
            if (!formData.schoolName.trim()) {
                  setFormError("Vui lòng nhập tên trường.");
                  return;
            }

            onSave({
                  residentId,
                  schoolName: formData.schoolName.trim(),
                  educationLevel: formData.educationLevel || null,
                  classOrMajor: formData.classOrMajor.trim() || null,
                  academicYear: formData.academicYear.trim() || null,
                  notes: formData.notes.trim() || null,
            });
            setIsModalOpen(false);
      };

      return (
            <>
                  <div className="min-w-0 overflow-hidden rounded-[26px] border border-amber-100/80 bg-white/90 p-4 shadow-[0_12px_30px_rgba(120,53,15,0.05)]">
                        <div className="mb-4 flex min-w-0 items-start justify-between gap-3 border-b border-amber-100/70 pb-3">
                              <div>
                                    <p className={residenceMediumStyle.compactSectionLabel}>
                                          Thông tin học tập
                                    </p>
                                    <p className={residenceMediumStyle.compactSectionHint}>
                                          Trường, lớp/ngành, bậc học và ghi chú.
                                    </p>
                              </div>

                              {!readonly && (
                                    <button
                                          type="button"
                                          onClick={openEdit}
                                          className={`${residenceMediumStyle.secondaryButton} inline-flex shrink-0 items-center gap-2 px-3 py-2`}
                                    >
                                          <Pencil className="h-4 w-4" />
                                          {hasEducation ? "Cập nhật" : "Thêm"}
                                    </button>
                              )}
                        </div>

                        {!hasEducation ? (
                              <div className="rounded-2xl border border-dashed border-amber-200/70 bg-amber-50/50 px-4 py-5 text-center">
                                    <GraduationCap className="mx-auto h-8 w-8 text-amber-700/70" />
                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                          Chưa có thông tin học tập
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                          Bổ sung trường, lớp/ngành và khóa học để tránh phân công trùng lịch.
                                    </p>
                              </div>
                        ) : (
                              <div className="min-w-0 space-y-3">
                                    <div className="min-w-0 rounded-2xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fff8ec_100%)] px-4 py-3 shadow-sm shadow-amber-900/5">
                                          <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                      <p className="truncate text-base font-bold text-slate-950">
                                                            {education?.schoolName}
                                                      </p>
                                                      <p className="mt-0.5 text-sm text-slate-500">
                                                            {education?.classOrMajor || "Chưa nhập lớp/ngành"}
                                                      </p>
                                                </div>

                                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
                                                      {educationLevelLabel}
                                                </span>
                                          </div>
                                    </div>

                                    <div className="grid gap-2">
                                          <CompactInfo label="Lớp / ngành" value={education?.classOrMajor} />
                                          <CompactInfo label="Khóa / năm học" value={education?.academicYear} />
                                    </div>

                                    <CompactInfo label="Ghi chú" value={education?.notes} />
                              </div>
                        )}
                  </div>

                  {isModalOpen && (
                        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
                              <div className={`${residenceMediumStyle.modalShell} max-w-2xl`}>
                                    <div className={residenceMediumStyle.modalHeader}>
                                          <div>
                                                <p className={residenceMediumStyle.modalEyebrow}>
                                                      Học tập
                                                </p>
                                                <h3 className={residenceMediumStyle.modalTitle}>
                                                      {hasEducation ? "Cập nhật thông tin học hành" : "Thêm thông tin học hành"}
                                                </h3>
                                                <p className={residenceMediumStyle.modalSubtitle}>
                                                      Cập nhật thông tin học tập đang dùng cho hồ sơ và lịch phân công.
                                                </p>
                                          </div>

                                          <button
                                                type="button"
                                                onClick={closeEdit}
                                                className="rounded-xl p-2 text-slate-500 transition hover:bg-white/70 hover:text-slate-700"
                                          >
                                                <X className="h-5 w-5" />
                                          </button>
                                    </div>

                                    <div className="space-y-3 overflow-y-auto px-5 py-4">
                                          {formError && (
                                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                      {formError}
                                                </div>
                                          )}

                                          <div className="grid gap-3 md:grid-cols-2">
                                                <div className="md:col-span-2">
                                                      <label className={residenceMediumStyle.fieldLabel}>
                                                            Tên trường *
                                                      </label>
                                                      <Input
                                                            value={formData.schoolName}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        schoolName: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Ví dụ: Đại học Kinh tế TP.HCM"
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </div>

                                                <div>
                                                      <label className={residenceMediumStyle.fieldLabel}>
                                                            Bậc học
                                                      </label>
                                                      <select
                                                            value={formData.educationLevel}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        educationLevel: event.target.value as EducationLevel,
                                                                  }))
                                                            }
                                                            className="mt-1 h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
                                                      >
                                                            {educationLevelOptions.map((option) => (
                                                                  <option key={option.value} value={option.value}>
                                                                        {option.label}
                                                                  </option>
                                                            ))}
                                                      </select>
                                                </div>

                                                <div>
                                                      <label className={residenceMediumStyle.fieldLabel}>
                                                            Lớp / ngành
                                                      </label>
                                                      <Input
                                                            value={formData.classOrMajor}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        classOrMajor: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Ví dụ: Kế toán K46"
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </div>

                                                <div>
                                                      <label className={residenceMediumStyle.fieldLabel}>
                                                            Khóa / năm học
                                                      </label>
                                                      <Input
                                                            value={formData.academicYear}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        academicYear: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Ví dụ: 2024 - 2028"
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </div>

                                                <div className="md:col-span-2">
                                                      <label className={residenceMediumStyle.fieldLabel}>
                                                            Ghi chú
                                                      </label>
                                                      <Textarea
                                                            value={formData.notes}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        notes: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Ghi chú thêm nếu có"
                                                            className={residenceMediumStyle.formTextarea}
                                                      />
                                                </div>
                                          </div>
                                    </div>

                                    <div className="flex flex-col-reverse gap-2 border-t border-amber-100/80 px-5 py-4 sm:flex-row sm:justify-end">
                                          <button
                                                type="button"
                                                onClick={closeEdit}
                                                disabled={isSaving}
                                                className={residenceMediumStyle.secondaryButton}
                                          >
                                                Hủy
                                          </button>

                                          <button
                                                type="button"
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className={residenceMediumStyle.primaryButton}
                                          >
                                                {isSaving ? "Đang lưu..." : "Lưu thông tin"}
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}
            </>
      );
}

export default EducationInfoSection;
