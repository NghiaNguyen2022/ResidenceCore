import { useEffect, useState } from "react";

import { AppModal, FormField } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

type EducationInfoModalProps = {
      open: boolean;
      residentId: number;
      education?: EducationInfo | null;
      isSaving?: boolean;
      onClose: () => void;
      onSave: (data: {
            residentId: number;
            schoolName: string;
            educationLevel?: EducationLevel | null;
            classOrMajor?: string | null;
            academicYear?: string | null;
            notes?: string | null;
      }) => void;
};

const EDUCATION_LEVEL_OPTIONS: Array<{
      value: EducationLevel;
      label: string;
}> = [
            { value: "high_school", label: "THPT" },
            { value: "vocational", label: "Trung cấp / Nghề" },
            { value: "college", label: "Cao đẳng" },
            { value: "university", label: "Đại học" },
            { value: "other", label: "Khác" },
      ];

export function EducationInfoModal({
      open,
      residentId,
      education,
      isSaving = false,
      onClose,
      onSave,
}: EducationInfoModalProps) {
      const [schoolName, setSchoolName] = useState("");
      const [educationLevel, setEducationLevel] =
            useState<EducationLevel>("university");
      const [classOrMajor, setClassOrMajor] = useState("");
      const [academicYear, setAcademicYear] = useState("");
      const [notes, setNotes] = useState("");

      useEffect(() => {
            if (!open) return;

            setSchoolName(education?.schoolName || "");
            setEducationLevel(education?.educationLevel || "university");
            setClassOrMajor(education?.classOrMajor || "");
            setAcademicYear(education?.academicYear || "");
            setNotes(education?.notes || "");
      }, [open, education]);

      const handleSubmit = () => {
            const trimmedSchoolName = schoolName.trim();

            if (!trimmedSchoolName) {
                  return;
            }

            onSave({
                  residentId,
                  schoolName: trimmedSchoolName,
                  educationLevel,
                  classOrMajor: classOrMajor.trim() || null,
                  academicYear: academicYear.trim() || null,
                  notes: notes.trim() || null,
            });
      };

      return (
            <AppModal
                  open={open}
                  onOpenChange={(nextOpen) => {
                        if (!nextOpen) onClose();
                  }}
                  title={
                        education
                              ? "Cập nhật thông tin học hành"
                              : "Thêm thông tin học hành"
                  }
                  description="Thông tin này dùng để nắm tình hình học tập cơ bản và làm dữ liệu cho lịch học, phân công công tác."
                  size="lg"
                  footer={
                        <div className="flex justify-end gap-2">
                              <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isSaving}
                              >
                                    Hủy
                              </Button>

                              <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSaving || !schoolName.trim()}
                              >
                                    {isSaving ? "Đang lưu..." : "Lưu thông tin"}
                              </Button>
                        </div>
                  }
            >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField label="Trường đang học" required>
                              <Input
                                    value={schoolName}
                                    onChange={(event) =>
                                          setSchoolName(event.target.value)
                                    }
                                    placeholder="Ví dụ: Đại học Sài Gòn"
                              />
                        </FormField>

                        <FormField label="Bậc học">
                              <select
                                    value={educationLevel}
                                    onChange={(event) =>
                                          setEducationLevel(event.target.value as EducationLevel)
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-900 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                    {EDUCATION_LEVEL_OPTIONS.map((item) => (
                                          <option key={item.value} value={item.value}>
                                                {item.label}
                                          </option>
                                    ))}
                              </select>
                        </FormField>

                        <FormField label="Lớp / ngành">
                              <Input
                                    value={classOrMajor}
                                    onChange={(event) =>
                                          setClassOrMajor(event.target.value)
                                    }
                                    placeholder="Ví dụ: Công nghệ thông tin"
                              />
                        </FormField>

                        <FormField label="Khóa / năm học">
                              <Input
                                    value={academicYear}
                                    onChange={(event) =>
                                          setAcademicYear(event.target.value)
                                    }
                                    placeholder="Ví dụ: K2026 hoặc năm 1"
                              />
                        </FormField>

                        <FormField label="Ghi chú" className="md:col-span-2">
                              <Textarea
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    placeholder="Ghi chú thêm nếu có"
                                    rows={3}
                              />
                        </FormField>
                  </div>
            </AppModal>
      );
}