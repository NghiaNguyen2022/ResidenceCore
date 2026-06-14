import { useEffect, useState } from "react";

import { AppModal, FormField } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DAY_OPTIONS, type DayOfWeek } from "@/lib/days";
import { DEFAULT_TIME } from "@/lib/formDefaults";

type StudySchedule = {
      id?: number;
      residentId?: number;
      dayOfWeek?: DayOfWeek | null;
      startTime?: string | null;
      endTime?: string | null;
      subjectName?: string | null;
      location?: string | null;
      notes?: string | null;
};

type StudySchedulePayload = {
      id?: number;
      residentId: number;
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
      subjectName?: string | null;
      location?: string | null;
      notes?: string | null;
};

type StudyScheduleModalProps = {
      open: boolean;
      residentId: number;
      schedule?: StudySchedule | null;
      isSaving?: boolean;
      onClose: () => void;
      onSave: (data: StudySchedulePayload) => void;
};

function normalizeTimeForInput(value?: string | null) {
      if (!value) return DEFAULT_TIME;
      return value.slice(0, 5);
}

export function StudyScheduleModal({
      open,
      residentId,
      schedule,
      isSaving = false,
      onClose,
      onSave,
}: StudyScheduleModalProps) {
      const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("monday");
      const [startTime, setStartTime] = useState(DEFAULT_TIME);
      const [endTime, setEndTime] = useState(DEFAULT_TIME);
      const [subjectName, setSubjectName] = useState("");
      const [location, setLocation] = useState("");
      const [notes, setNotes] = useState("");
      const [error, setError] = useState("");

      const isEdit = Boolean(schedule?.id);

      useEffect(() => {
            if (!open) return;

            setDayOfWeek(schedule?.dayOfWeek || "monday");
            setStartTime(normalizeTimeForInput(schedule?.startTime));
            setEndTime(normalizeTimeForInput(schedule?.endTime));
            setSubjectName(schedule?.subjectName || "");
            setLocation(schedule?.location || "");
            setNotes(schedule?.notes || "");
            setError("");
      }, [open, schedule]);

      const handleSubmit = () => {
            setError("");

            if (!startTime || !endTime) {
                  setError("Vui lòng nhập giờ bắt đầu và giờ kết thúc.");
                  return;
            }

            if (startTime >= endTime) {
                  setError("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
                  return;
            }

            onSave({
                  id: schedule?.id,
                  residentId,
                  dayOfWeek,
                  startTime,
                  endTime,
                  subjectName: subjectName.trim() || null,
                  location: location.trim() || null,
                  notes: notes.trim() || null,
            });
      };

      return (
            <AppModal
                  open={open}
                  onOpenChange={(nextOpen) => {
                        if (!nextOpen) onClose();
                  }}
                  title={isEdit ? "Cập nhật lịch học" : "Thêm lịch học"}
                  description="Lịch học giúp quản lý tránh phân công công tác trùng thời gian học của học viên."
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
                                    disabled={isSaving || !startTime || !endTime}
                              >
                                    {isSaving ? "Đang lưu..." : "Lưu lịch học"}
                              </Button>
                        </div>
                  }
            >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField label="Thứ trong tuần" required>
                              <select
                                    value={dayOfWeek}
                                    onChange={(event) =>
                                          setDayOfWeek(event.target.value as DayOfWeek)
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-900 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                    {DAY_OPTIONS.map((item) => (
                                          <option key={item.value} value={item.value}>
                                                {item.label}
                                          </option>
                                    ))}
                              </select>
                        </FormField>

                        <FormField
                              label="Tên môn / nội dung học"
                              hint="Có thể để trống nếu chỉ cần ghi nhận khung giờ bận học."
                        >
                              <Input
                                    value={subjectName}
                                    onChange={(event) =>
                                          setSubjectName(event.target.value)
                                    }
                                    placeholder="Ví dụ: Toán cao cấp"
                              />
                        </FormField>

                        <FormField label="Giờ bắt đầu" required>
                              <Input
                                    type="time"
                                    value={startTime}
                                    onChange={(event) =>
                                          setStartTime(event.target.value)
                                    }
                              />
                        </FormField>

                        <FormField label="Giờ kết thúc" required>
                              <Input
                                    type="time"
                                    value={endTime}
                                    onChange={(event) =>
                                          setEndTime(event.target.value)
                                    }
                              />
                        </FormField>

                        <FormField label="Địa điểm">
                              <Input
                                    value={location}
                                    onChange={(event) =>
                                          setLocation(event.target.value)
                                    }
                                    placeholder="Ví dụ: Trường / cơ sở / phòng học"
                              />
                        </FormField>

                        <FormField label="Ghi chú">
                              <Textarea
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    placeholder="Ghi chú thêm nếu có"
                                    rows={3}
                              />
                        </FormField>

                        {error && (
                              <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                              </div>
                        )}
                  </div>
            </AppModal>
      );
}