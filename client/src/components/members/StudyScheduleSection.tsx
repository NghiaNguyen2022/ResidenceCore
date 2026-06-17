import { useMemo, useState } from "react";
import { CalendarClock, Pencil, Plus, Trash2, X } from "lucide-react";
import { formatTime } from '@/lib/format';

import {
      AppSection,
      EmptyState,
      StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
      AppMessageBox,
      type AppMessageBoxState,
} from "@/components/common/AppMessageBox";

type DayOfWeek =
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";

type StudySchedule = {
      id: number;
      residentId: number;
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
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

type StudyScheduleFormData = {
      selectedDays: DayOfWeek[];
      startTime: string;
      endTime: string;
      subjectName: string;
      location: string;
      notes: string;
};

type StudyScheduleSectionProps = {
      residentId: number;
      schedules?: StudySchedule[] | null;
      readonly?: boolean;
      isSaving?: boolean;
      isDeleting?: boolean;
      onSave: (data: StudySchedulePayload) => void;
      onDelete: (input: { id: number; residentId: number }) => void;
};

const DAY_LABELS: Record<DayOfWeek, string> = {
      monday: "Thứ 2",
      tuesday: "Thứ 3",
      wednesday: "Thứ 4",
      thursday: "Thứ 5",
      friday: "Thứ 6",
      saturday: "Thứ 7",
      sunday: "Chúa nhật",
};

const DAY_ORDER: Record<DayOfWeek, number> = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7,
};

const WEEK_DAYS: DayOfWeek[] = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
];

function createEmptyForm(): StudyScheduleFormData {
      return {
            selectedDays: ["monday"],
            startTime: "08:00",
            endTime: "12:00",
            subjectName: "",
            location: "",
            notes: "",
      };
}

function normalizeTime(value?: string | null) {
      return String(value || "").slice(0, 5);
}

function timeToMinutes(value?: string | null) {
      const normalized = normalizeTime(value);
      const [hours, minutes] = normalized.split(":").map(Number);

      if (
            !normalized ||
            normalized.length < 5 ||
            Number.isNaN(hours) ||
            Number.isNaN(minutes)
      ) {
            return null;
      }

      return hours * 60 + minutes;
}

function isOverlappingTimeRange(
      firstStart?: string | null,
      firstEnd?: string | null,
      secondStart?: string | null,
      secondEnd?: string | null
) {
      const firstStartMinutes = timeToMinutes(firstStart);
      const firstEndMinutes = timeToMinutes(firstEnd);
      const secondStartMinutes = timeToMinutes(secondStart);
      const secondEndMinutes = timeToMinutes(secondEnd);

      if (
            firstStartMinutes === null ||
            firstEndMinutes === null ||
            secondStartMinutes === null ||
            secondEndMinutes === null
      ) {
            return false;
      }

      return firstStartMinutes < secondEndMinutes && secondStartMinutes < firstEndMinutes;
}

function validateScheduleForm(
      formData: StudyScheduleFormData,
      schedules: StudySchedule[],
      editingScheduleId?: number | null
) {
      const startTime = normalizeTime(formData.startTime);
      const endTime = normalizeTime(formData.endTime);

      if (formData.selectedDays.length === 0) {
            return "Vui lòng chọn ít nhất một ngày học trong tuần.";
      }

      if (!startTime || !endTime) {
            return "Vui lòng nhập giờ bắt đầu và giờ kết thúc.";
      }

      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);

      if (startMinutes === null || endMinutes === null) {
            return "Giờ học không hợp lệ.";
      }

      if (startMinutes >= endMinutes) {
            return "Giờ kết thúc phải lớn hơn giờ bắt đầu.";
      }

      for (const dayOfWeek of formData.selectedDays) {
            const conflicted = schedules.find((schedule) => {
                  if (editingScheduleId && Number(schedule.id) === Number(editingScheduleId)) {
                        return false;
                  }

                  if (schedule.dayOfWeek !== dayOfWeek) return false;

                  return isOverlappingTimeRange(
                        startTime,
                        endTime,
                        schedule.startTime,
                        schedule.endTime
                  );
            });

            if (conflicted) {
                  return `Lịch học bị trùng với ${DAY_LABELS[conflicted.dayOfWeek]} ${formatTime(
                        conflicted.startTime
                  )} - ${formatTime(conflicted.endTime)}.`;
            }
      }

      return null;
}

function createPayload(
      residentId: number,
      dayOfWeek: DayOfWeek,
      formData: StudyScheduleFormData,
      scheduleId?: number
): StudySchedulePayload {
      return {
            id: scheduleId,
            residentId,
            dayOfWeek,
            startTime: normalizeTime(formData.startTime),
            endTime: normalizeTime(formData.endTime),
            subjectName: formData.subjectName.trim() || null,
            location: formData.location.trim() || null,
            notes: formData.notes.trim() || null,
      };
}

export function StudyScheduleSection({
      residentId,
      schedules,
      readonly = false,
      isSaving = false,
      isDeleting = false,
      onSave,
      onDelete,
}: StudyScheduleSectionProps) {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingSchedule, setEditingSchedule] =
            useState<StudySchedule | null>(null);
      const [formData, setFormData] = useState<StudyScheduleFormData>(createEmptyForm());
      const [formError, setFormError] = useState<string | null>(null);
      const [scheduleToDelete, setScheduleToDelete] =
            useState<StudySchedule | null>(null);
      const [deleteMessageBox, setDeleteMessageBox] = useState<AppMessageBoxState>({
            open: false,
            title: "",
            message: "",
            variant: "warning",
            actions: [],
      });

      const sortedSchedules = useMemo(() => {
            return [...(schedules || [])].sort((a, b) => {
                  const dayDiff =
                        DAY_ORDER[a.dayOfWeek] - DAY_ORDER[b.dayOfWeek];

                  if (dayDiff !== 0) return dayDiff;

                  return formatTime(a.startTime).localeCompare(
                        formatTime(b.startTime)
                  );
            });
      }, [schedules]);

      const handleAdd = () => {
            setFormError(null);
            setEditingSchedule(null);
            setFormData(createEmptyForm());
            setIsModalOpen(true);
      };

      const handleEdit = (schedule: StudySchedule) => {
            setFormError(null);
            setEditingSchedule(schedule);
            setFormData({
                  selectedDays: [schedule.dayOfWeek],
                  startTime: normalizeTime(schedule.startTime),
                  endTime: normalizeTime(schedule.endTime),
                  subjectName: schedule.subjectName || "",
                  location: schedule.location || "",
                  notes: schedule.notes || "",
            });
            setIsModalOpen(true);
      };

      const handleCloseModal = () => {
            setFormError(null);
            setEditingSchedule(null);
            setFormData(createEmptyForm());
            setIsModalOpen(false);
      };

      const toggleSelectedDay = (dayOfWeek: DayOfWeek) => {
            if (editingSchedule) {
                  setFormData((current) => ({
                        ...current,
                        selectedDays: [dayOfWeek],
                  }));
                  return;
            }

            setFormData((current) => {
                  const exists = current.selectedDays.includes(dayOfWeek);
                  const selectedDays = exists
                        ? current.selectedDays.filter((item) => item !== dayOfWeek)
                        : [...current.selectedDays, dayOfWeek];

                  return {
                        ...current,
                        selectedDays: selectedDays.sort(
                              (left, right) => DAY_ORDER[left] - DAY_ORDER[right]
                        ),
                  };
            });
      };

      const handleSave = () => {
            const error = validateScheduleForm(
                  formData,
                  sortedSchedules,
                  editingSchedule?.id
            );

            if (error) {
                  setFormError(error);
                  return;
            }

            setFormError(null);

            if (editingSchedule) {
                  onSave(
                        createPayload(
                              residentId,
                              formData.selectedDays[0],
                              formData,
                              editingSchedule.id
                        )
                  );
            } else {
                  formData.selectedDays.forEach((dayOfWeek) => {
                        onSave(createPayload(residentId, dayOfWeek, formData));
                  });
            }

            handleCloseModal();
      };

      const requestDelete = (schedule: StudySchedule) => {
            setScheduleToDelete(schedule);
            setDeleteMessageBox({
                  open: true,
                  title: "Xóa lịch học?",
                  message:
                        `Xóa lịch ${DAY_LABELS[schedule.dayOfWeek]} ${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}. ` +
                        "Thao tác này sẽ ngừng dùng lịch này cho kiểm tra trùng giờ phân công.",
                  variant: "warning",
                  selectedValue: "deleteStudySchedule",
                  cancelText: "Hủy",
                  actions: [
                        {
                              label: "Xóa lịch",
                              value: "deleteStudySchedule",
                              description: "Xóa khung giờ học này khỏi hồ sơ học viên.",
                              variant: "danger",
                        },
                  ],
            });
      };

      const closeDeleteMessageBox = () => {
            setDeleteMessageBox({
                  open: false,
                  title: "",
                  message: "",
                  variant: "warning",
                  actions: [],
            });
            setScheduleToDelete(null);
      };

      const handleDeleteMessageBoxConfirm = (value: string) => {
            if (value !== "deleteStudySchedule" || !scheduleToDelete) {
                  closeDeleteMessageBox();
                  return;
            }

            onDelete({
                  id: scheduleToDelete.id,
                  residentId,
            });
            closeDeleteMessageBox();
      };

      return (
            <>
                  <AppSection
                        title="Lịch học"
                        compact
                        action={
                              !readonly && (
                                    <Button type="button" size="sm" onClick={handleAdd}>
                                          <Plus className="mr-2 h-4 w-4" />
                                          Thêm lịch học
                                    </Button>
                              )
                        }
                  >
                        {sortedSchedules.length === 0 ? (
                              <EmptyState
                                    compact
                                    icon={<CalendarClock className="h-8 w-8" />}
                                    title="Chưa có lịch học"
                                    description="Thêm lịch học để làm dữ liệu cảnh báo khi phân công công tác trùng giờ."
                              />
                        ) : (
                              <div className="space-y-3">
                                    {sortedSchedules.map((item) => (
                                          <div
                                                key={item.id}
                                                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                                          >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                      <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                  <StatusBadge tone="info">
                                                                        {DAY_LABELS[item.dayOfWeek]}
                                                                  </StatusBadge>

                                                                  <span className="text-sm font-semibold text-slate-900">
                                                                        {formatTime(item.startTime)} -{" "}
                                                                        {formatTime(item.endTime)}
                                                                  </span>
                                                            </div>

                                                            <p className="mt-2 text-sm font-medium text-slate-800">
                                                                  {item.subjectName ||
                                                                        "Khung giờ học"}
                                                            </p>

                                                            {item.location && (
                                                                  <p className="mt-1 text-sm text-slate-500">
                                                                        Địa điểm: {item.location}
                                                                  </p>
                                                            )}

                                                            {item.notes && (
                                                                  <p className="mt-1 text-sm text-slate-500">
                                                                        Ghi chú: {item.notes}
                                                                  </p>
                                                            )}
                                                      </div>

                                                      {!readonly && (
                                                            <div className="flex shrink-0 gap-2">
                                                                  <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                              handleEdit(item)
                                                                        }
                                                                  >
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        Sửa
                                                                  </Button>

                                                                  <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        disabled={isDeleting}
                                                                        onClick={() => requestDelete(item)}
                                                                  >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Xóa
                                                                  </Button>
                                                            </div>
                                                      )}
                                                </div>
                                          </div>
                                    ))}
                              </div>
                        )}
                  </AppSection>

                  {formError && isModalOpen && (
                        <div className="fixed left-1/2 top-6 z-[130] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-2xl">
                              {formError}
                        </div>
                  )}

                  {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
                              <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                                    <div className="mb-5 flex items-start justify-between gap-4">
                                          <div>
                                                <h3 className="text-2xl font-bold text-slate-950">
                                                      {editingSchedule ? "Sửa lịch học" : "Thêm lịch học"}
                                                </h3>
                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                      Chọn các ngày trong tuần có cùng khung giờ học. Môn học và địa điểm có thể để trống.
                                                </p>
                                          </div>

                                          <button
                                                type="button"
                                                onClick={handleCloseModal}
                                                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                                          >
                                                <X className="h-5 w-5" />
                                          </button>
                                    </div>

                                    <div className="space-y-5">
                                          <div>
                                                <div className="mb-2 text-sm font-bold text-slate-800">
                                                      Ngày học trong tuần <span className="text-rose-500">*</span>
                                                </div>
                                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                                      {WEEK_DAYS.map((dayOfWeek) => {
                                                            const checked = formData.selectedDays.includes(dayOfWeek);

                                                            return (
                                                                  <label
                                                                        key={dayOfWeek}
                                                                        className={[
                                                                              "flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                                                                              checked
                                                                                    ? "border-blue-200 bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                                                                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                                                                        ].join(" ")}
                                                                  >
                                                                        <input
                                                                              type="checkbox"
                                                                              checked={checked}
                                                                              onChange={() => toggleSelectedDay(dayOfWeek)}
                                                                              className="h-4 w-4 rounded border-slate-300"
                                                                        />
                                                                        {DAY_LABELS[dayOfWeek]}
                                                                  </label>
                                                            );
                                                      })}
                                                </div>

                                                {editingSchedule && (
                                                      <p className="mt-2 text-xs text-slate-500">
                                                            Khi sửa lịch học, chỉ cập nhật một ngày cho dòng lịch hiện tại.
                                                      </p>
                                                )}
                                          </div>

                                          <div className="grid gap-4 md:grid-cols-2">
                                                <label className="space-y-1.5">
                                                      <span className="text-sm font-bold text-slate-800">
                                                            Giờ bắt đầu <span className="text-rose-500">*</span>
                                                      </span>
                                                      <input
                                                            type="time"
                                                            value={formData.startTime}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        startTime: event.target.value,
                                                                  }))
                                                            }
                                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <span className="text-sm font-bold text-slate-800">
                                                            Giờ kết thúc <span className="text-rose-500">*</span>
                                                      </span>
                                                      <input
                                                            type="time"
                                                            value={formData.endTime}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        endTime: event.target.value,
                                                                  }))
                                                            }
                                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <span className="text-sm font-bold text-slate-800">
                                                            Tên môn / nội dung học
                                                      </span>
                                                      <input
                                                            value={formData.subjectName}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        subjectName: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Có thể để trống"
                                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <span className="text-sm font-bold text-slate-800">
                                                            Địa điểm
                                                      </span>
                                                      <input
                                                            value={formData.location}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        location: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Có thể để trống"
                                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                                      />
                                                </label>

                                                <label className="space-y-1.5 md:col-span-2">
                                                      <span className="text-sm font-bold text-slate-800">
                                                            Ghi chú
                                                      </span>
                                                      <textarea
                                                            value={formData.notes}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        notes: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Ghi chú thêm nếu có"
                                                            rows={3}
                                                            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                                      />
                                                </label>
                                          </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-2">
                                          <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCloseModal}
                                                disabled={isSaving}
                                          >
                                                Hủy
                                          </Button>

                                          <Button
                                                type="button"
                                                onClick={handleSave}
                                                disabled={isSaving}
                                          >
                                                {isSaving ? "Đang lưu..." : "Lưu lịch học"}
                                          </Button>
                                    </div>
                              </div>
                        </div>
                  )}

                  <AppMessageBox
                        state={deleteMessageBox}
                        onCancel={closeDeleteMessageBox}
                        onConfirm={handleDeleteMessageBoxConfirm}
                        isProcessing={isDeleting}
                  />
            </>
      );
}
