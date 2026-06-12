import { useState } from "react";
import { GraduationCap, Pencil } from "lucide-react";

import {
      AppSection,
      EmptyState,
      InfoRow,
      StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { EducationInfoModal } from "./EducationInfoModal";

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

export function EducationInfoSection({
      residentId,
      education,
      readonly = false,
      isSaving = false,
      onSave,
}: EducationInfoSectionProps) {
      const [isModalOpen, setIsModalOpen] = useState(false);

      const hasEducation = Boolean(education?.schoolName);

      return (
            <>
                  <AppSection
                        title="Thông tin học hành"
                        compact
                        action={
                              !readonly && (
                                    <Button
                                          type="button"
                                          size="sm"
                                          variant={hasEducation ? "outline" : "default"}
                                          onClick={() => setIsModalOpen(true)}
                                    >
                                          <Pencil className="mr-2 h-4 w-4" />
                                          {hasEducation ? "Cập nhật" : "Thêm thông tin"}
                                    </Button>
                              )
                        }
                  >
                        {!hasEducation ? (
                              <EmptyState
                                    compact
                                    icon={<GraduationCap className="h-8 w-8" />}
                                    title="Chưa có thông tin học hành"
                                    description="Bổ sung trường, lớp/ngành và khóa học để phục vụ quản lý lưu trú và phân công công tác."
                              />
                        ) : (
                              <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                          <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                      {education?.schoolName}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                      {education?.classOrMajor ||
                                                            "Chưa nhập lớp/ngành"}
                                                </p>
                                          </div>

                                          {education?.educationLevel && (
                                                <StatusBadge tone="info">
                                                      {
                                                            EDUCATION_LEVEL_LABELS[
                                                            education.educationLevel
                                                            ]
                                                      }
                                                </StatusBadge>
                                          )}
                                    </div>

                                    <InfoRow
                                          label="Lớp / ngành"
                                          value={education?.classOrMajor}
                                    />

                                    <InfoRow
                                          label="Khóa / năm học"
                                          value={education?.academicYear}
                                    />

                                    <InfoRow label="Ghi chú" value={education?.notes} />
                              </div>
                        )}
                  </AppSection>

                  <EducationInfoModal
                        open={isModalOpen}
                        residentId={residentId}
                        education={education}
                        isSaving={isSaving}
                        onClose={() => setIsModalOpen(false)}
                        onSave={(data) => {
                              onSave(data);
                              setIsModalOpen(false);
                        }}
                  />
            </>
      );
}