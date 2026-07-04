import { useMemo, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { formatTime } from '@/lib/format';
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { TimePickerInput } from "@/components/shared/form/TimePickerInput";

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


type ScheduleViewMode = "day" | "week" | "month";

const STUDY_HOUR_START = 5;
const STUDY_HOUR_END = 23;
const STUDY_HOUR_HEIGHT = 54;
const STUDY_HOUR_EXPANDED_HEIGHT = 74;

function getScheduleTopOffset(startTime?: string | null, hourHeight = STUDY_HOUR_HEIGHT) {
      const minutes = timeToMinutes(startTime);

      if (minutes === null) return 0;

      const startMinutes = STUDY_HOUR_START * 60;
      const endMinutes = STUDY_HOUR_END * 60;

      return Math.max(0, Math.min(endMinutes - startMinutes, minutes - startMinutes)) / 60 * hourHeight;
}

function getScheduleBlockHeight(
      startTime?: string | null,
      endTime?: string | null,
      hourHeight = STUDY_HOUR_HEIGHT
) {
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);

      if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
            return hourHeight;
      }

      return Math.max(42, (endMinutes - startMinutes) / 60 * hourHeight);
}

function getDayOfWeekFromDate(date: Date): DayOfWeek {
      const day = date.getDay();

      if (day === 0) return "sunday";
      if (day === 1) return "monday";
      if (day === 2) return "tuesday";
      if (day === 3) return "wednesday";
      if (day === 4) return "thursday";
      if (day === 5) return "friday";
      if (day === 6) return "saturday";

      return "monday";
}

function startOfWeek(date: Date) {
      const current = new Date(date);
      current.setHours(0, 0, 0, 0);

      const day = current.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      current.setDate(current.getDate() + mondayOffset);

      return current;
}

function addDays(date: Date, days: number) {
      const next = new Date(date);
      next.setDate(next.getDate() + days);

      return next;
}

function addMonths(date: Date, months: number) {
      return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatShortDate(date: Date) {
      return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getWeekTitle(viewDate: Date) {
      const weekStart = startOfWeek(viewDate);
      const weekEnd = addDays(weekStart, 6);

      return `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}/${weekEnd.getFullYear()}`;
}

function buildMonthCells(viewDate: Date) {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const firstDate = new Date(year, month, 1);
      const lastDate = new Date(year, month + 1, 0);
      const firstOffset = firstDate.getDay() === 0 ? 6 : firstDate.getDay() - 1;
      const cells: Array<{ date: Date | null; dayOfWeek?: DayOfWeek }> = [];

      for (let index = 0; index < firstOffset; index += 1) {
            cells.push({ date: null });
      }

      for (let day = 1; day <= lastDate.getDate(); day += 1) {
            const date = new Date(year, month, day);
            cells.push({
                  date,
                  dayOfWeek: getDayOfWeekFromDate(date),
            });
      }

      while (cells.length % 7 !== 0) {
            cells.push({ date: null });
      }

      return cells;
}

function getMonthTitle(viewDate: Date) {
      return `Tháng ${viewDate.getMonth() + 1}/${viewDate.getFullYear()}`;
}

function getSchedulesByDay(schedules: StudySchedule[]) {
      const grouped = new Map<DayOfWeek, StudySchedule[]>();

      WEEK_DAYS.forEach((day) => grouped.set(day, []));

      schedules.forEach((schedule) => {
            const current = grouped.get(schedule.dayOfWeek) || [];
            current.push(schedule);
            grouped.set(schedule.dayOfWeek, current);
      });

      grouped.forEach((items) => {
            items.sort((left, right) =>
                  normalizeTime(left.startTime).localeCompare(normalizeTime(right.startTime))
            );
      });

      return grouped;
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
      const [scheduleViewMode, setScheduleViewMode] = useState<ScheduleViewMode>("week");
      const [calendarCursorDate, setCalendarCursorDate] = useState(() => new Date());
      const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
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

      const schedulesByDay = useMemo(
            () => getSchedulesByDay(sortedSchedules),
            [sortedSchedules]
      );

      const selectedDayOfWeek = useMemo(() => getDayOfWeekFromDate(calendarCursorDate), [calendarCursorDate]);
      const selectedDaySchedules = useMemo(
            () => schedulesByDay.get(selectedDayOfWeek) || [],
            [schedulesByDay, selectedDayOfWeek]
      );
      const dayTitle = useMemo(
            () => `${DAY_LABELS[selectedDayOfWeek]} ${formatShortDate(calendarCursorDate)}/${calendarCursorDate.getFullYear()}`,
            [calendarCursorDate, selectedDayOfWeek]
      );
      const weekTitle = useMemo(() => getWeekTitle(calendarCursorDate), [calendarCursorDate]);
      const monthCells = useMemo(() => buildMonthCells(calendarCursorDate), [calendarCursorDate]);
      const monthTitle = useMemo(() => getMonthTitle(calendarCursorDate), [calendarCursorDate]);

      const goToPreviousSchedulePeriod = () => {
            setCalendarCursorDate((current) =>
                  scheduleViewMode === "month"
                        ? addMonths(current, -1)
                        : scheduleViewMode === "week"
                              ? addDays(current, -7)
                              : addDays(current, -1)
            );
      };

      const goToNextSchedulePeriod = () => {
            setCalendarCursorDate((current) =>
                  scheduleViewMode === "month"
                        ? addMonths(current, 1)
                        : scheduleViewMode === "week"
                              ? addDays(current, 7)
                              : addDays(current, 1)
            );
      };

      const goToCurrentSchedulePeriod = () => {
            setCalendarCursorDate(new Date());
      };

      const calendarPeriodTitle =
            scheduleViewMode === "month"
                  ? monthTitle
                  : scheduleViewMode === "week"
                        ? `Tuần ${weekTitle}`
                        : dayTitle;

      const calendarHourHeight = STUDY_HOUR_HEIGHT;
      const calendarMinWidth = "820px";
      const calendarMaxHeight = "520px";
      const expandedCalendarHourHeight = STUDY_HOUR_EXPANDED_HEIGHT;
      const expandedCalendarMinWidth = "1180px";
      const expandedCalendarMaxHeight = "calc(100vh - 220px)";

      const openCalendarExpanded = () => {
            setIsCalendarExpanded(true);
      };

      const closeCalendarExpanded = () => {
            setIsCalendarExpanded(false);
      };

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
                        <div className="mb-3 flex flex-col gap-3 border-b border-amber-100/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                          Lịch học theo ngày/tuần/tháng
                                    </p>
                                    <p className="text-xs text-slate-500">
                                          Dùng để cảnh báo khi phân công công tác trùng giờ.
                                    </p>
                              </div>

                              <div className="flex flex-wrap items-center justify-end gap-2">
                                    <div className="inline-flex w-fit rounded-2xl bg-amber-50/80 p-1 ring-1 ring-amber-100">
                                          {([
                                                ["day", "Ngày"],
                                                ["week", "Tuần"],
                                                ["month", "Tháng"],
                                          ] as Array<[ScheduleViewMode, string]>).map(([key, label]) => (
                                                <button
                                                      key={key}
                                                      type="button"
                                                      onClick={() => setScheduleViewMode(key)}
                                                      className={[
                                                            "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                                                            scheduleViewMode === key
                                                                  ? "bg-white text-blue-700 shadow-sm"
                                                                  : "text-slate-500 hover:text-slate-800",
                                                      ].join(" ")}
                                                >
                                                      {label}
                                                </button>
                                          ))}
                                    </div>

                                    {(scheduleViewMode === "day" || scheduleViewMode === "week" || scheduleViewMode === "month") && (
                                          <>
                                                <div className="inline-flex items-center overflow-hidden rounded-2xl border border-amber-100 bg-white/75 shadow-sm">
                                                      <button
                                                            type="button"
                                                            onClick={goToPreviousSchedulePeriod}
                                                            className="px-2.5 py-2 text-slate-500 transition hover:bg-amber-50 hover:text-slate-800"
                                                            title={scheduleViewMode === "month" ? "Tháng trước" : scheduleViewMode === "week" ? "Tuần trước" : "Ngày trước"}
                                                      >
                                                            <ChevronLeft className="h-4 w-4" />
                                                      </button>

                                                      <button
                                                            type="button"
                                                            onClick={goToCurrentSchedulePeriod}
                                                            className="border-x border-amber-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-amber-50 hover:text-slate-900"
                                                            title="Về kỳ hiện tại"
                                                      >
                                                            <RotateCcw className="mr-1 inline h-3.5 w-3.5" />
                                                            Hiện tại
                                                      </button>

                                                      <button
                                                            type="button"
                                                            onClick={goToNextSchedulePeriod}
                                                            className="px-2.5 py-2 text-slate-500 transition hover:bg-amber-50 hover:text-slate-800"
                                                            title={scheduleViewMode === "month" ? "Tháng sau" : scheduleViewMode === "week" ? "Tuần sau" : "Ngày sau"}
                                                      >
                                                            <ChevronRight className="h-4 w-4" />
                                                      </button>
                                                </div>

                                                <span className="rounded-2xl border border-amber-100 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                                                      {calendarPeriodTitle}
                                                </span>

                                                <button
                                                      type="button"
                                                      onClick={isCalendarExpanded ? closeCalendarExpanded : openCalendarExpanded}
                                                      className={[
                                                            "rounded-2xl border px-3 py-2 text-xs font-semibold transition shadow-sm",
                                                            isCalendarExpanded
                                                                  ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                                                  : "border-amber-100 bg-white text-slate-600 hover:bg-amber-50",
                                                      ].join(" ")}
                                                      title={
                                                            isCalendarExpanded
                                                                  ? "Đóng khung lịch mở rộng"
                                                                  : "Mở rộng lịch ra ngoài form hồ sơ"
                                                      }
                                                >
                                                      {isCalendarExpanded ? "Đang mở rộng" : "Mở rộng"}
                                                </button>
                                          </>
                                    )}
                              </div>
                        </div>

                        {sortedSchedules.length === 0 ? (
                              <EmptyState
                                    compact
                                    icon={<CalendarClock className="h-8 w-8" />}
                                    title="Chưa có lịch học"
                                    description="Thêm lịch học để làm dữ liệu cảnh báo khi phân công công tác trùng giờ."
                              />
                        ) : scheduleViewMode === "day" ? (
                              <div className="rounded-2xl border border-slate-200 bg-white">
                                    <div className="flex flex-col gap-1 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                          <div>
                                                <div className="font-bold text-slate-900">{dayTitle}</div>
                                                <div className="text-xs text-slate-500">
                                                      Lịch ngày được sinh theo lịch học lặp hằng tuần.
                                                </div>
                                          </div>

                                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                                                {selectedDaySchedules.length} lịch
                                          </span>
                                    </div>

                                    {selectedDaySchedules.length === 0 ? (
                                          <div className="p-4">
                                                <EmptyState
                                                      compact
                                                      icon={<CalendarClock className="h-8 w-8" />}
                                                      title="Không có lịch trong ngày này"
                                                      description="Dùng Prev/Next để xem ngày khác hoặc thêm lịch học mới."
                                                />
                                          </div>
                                    ) : (
                                          <div className="space-y-3 p-4">
                                                {selectedDaySchedules.map((item) => (
                                                      <div
                                                            key={item.id}
                                                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                                                      >
                                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                                  <div>
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                              <StatusBadge tone="info">
                                                                                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                                                              </StatusBadge>

                                                                              <span className="text-sm font-semibold text-slate-900">
                                                                                    {item.subjectName || "Khung giờ học"}
                                                                              </span>
                                                                        </div>

                                                                        {item.location && (
                                                                              <p className="mt-2 text-sm text-slate-500">
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
                                                                                    onClick={() => handleEdit(item)}
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
                              </div>
                        ) : scheduleViewMode === "week" ? (
                              <div
                                    className={[
                                          "rounded-2xl border border-slate-200 bg-white",
                                          isCalendarExpanded ? "shadow-md" : "overflow-hidden",
                                    ].join(" ")}
                              >
                                    <div className="overflow-x-auto">
                                          <div
                                                className="grid grid-cols-[72px_repeat(7,minmax(120px,1fr))] border-b border-slate-200 bg-slate-50"
                                                style={{ minWidth: calendarMinWidth }}
                                          >
                                                <div className="px-3 py-3 text-xs font-bold uppercase text-slate-400">
                                                      Giờ
                                                </div>
                                                {WEEK_DAYS.map((dayOfWeek, index) => {
                                                      const date = addDays(startOfWeek(calendarCursorDate), index);

                                                      return (
                                                            <div
                                                                  key={dayOfWeek}
                                                                  className="border-l border-slate-200 px-3 py-3 text-center text-xs font-bold uppercase text-slate-500"
                                                            >
                                                                  <div>{DAY_LABELS[dayOfWeek]}</div>
                                                                  <div className="mt-0.5 text-[11px] font-semibold normal-case text-slate-400">
                                                                        {formatShortDate(date)}
                                                                  </div>
                                                            </div>
                                                      );
                                                })}
                                          </div>
                                    </div>

                                    <div
                                          className="overflow-auto"
                                          style={{ maxHeight: calendarMaxHeight }}
                                    >
                                          <div
                                                className="grid grid-cols-[72px_repeat(7,minmax(120px,1fr))]"
                                                style={{
                                                      minWidth: calendarMinWidth,
                                                      height: `${(STUDY_HOUR_END - STUDY_HOUR_START) * calendarHourHeight}px`,
                                                }}
                                          >
                                                <div className="relative bg-slate-50">
                                                      {Array.from(
                                                            { length: STUDY_HOUR_END - STUDY_HOUR_START + 1 },
                                                            (_, index) => STUDY_HOUR_START + index
                                                      ).map((hour) => (
                                                            <div
                                                                  key={hour}
                                                                  className="absolute left-0 right-0 border-t border-slate-200 px-2 pt-1 text-[11px] font-medium text-slate-400"
                                                                  style={{
                                                                        top: `${(hour - STUDY_HOUR_START) * calendarHourHeight}px`,
                                                                  }}
                                                            >
                                                                  {String(hour).padStart(2, "0")}:00
                                                            </div>
                                                      ))}
                                                </div>

                                                {WEEK_DAYS.map((dayOfWeek) => (
                                                      <div
                                                            key={dayOfWeek}
                                                            className="relative border-l border-slate-200"
                                                      >
                                                            {Array.from(
                                                                  { length: STUDY_HOUR_END - STUDY_HOUR_START + 1 },
                                                                  (_, index) => STUDY_HOUR_START + index
                                                            ).map((hour) => (
                                                                  <div
                                                                        key={hour}
                                                                        className="absolute left-0 right-0 border-t border-slate-100"
                                                                        style={{
                                                                              top: `${(hour - STUDY_HOUR_START) * calendarHourHeight}px`,
                                                                        }}
                                                                  />
                                                            ))}

                                                            {(schedulesByDay.get(dayOfWeek) || []).map((item) => (
                                                                  <button
                                                                        key={item.id}
                                                                        type="button"
                                                                        onClick={() => handleEdit(item)}
                                                                        className="group absolute left-2 right-2 overflow-visible rounded-xl border border-blue-200 bg-blue-50 px-2 py-1 text-left shadow-sm transition hover:z-20 hover:bg-blue-100"
                                                                        style={{
                                                                              top: `${getScheduleTopOffset(item.startTime, calendarHourHeight)}px`,
                                                                              height: `${getScheduleBlockHeight(item.startTime, item.endTime, calendarHourHeight)}px`,
                                                                        }}
                                                                        title={`${DAY_LABELS[item.dayOfWeek]} ${formatTime(item.startTime)} - ${formatTime(item.endTime)} · ${item.subjectName || "Khung giờ học"}${item.location ? ` · ${item.location}` : ""}`}
                                                                  >
                                                                        <div className="overflow-hidden">
                                                                              <div className="text-[11px] font-bold text-blue-700">
                                                                                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                                                              </div>
                                                                              <div className="mt-0.5 line-clamp-2 text-xs font-semibold text-slate-900">
                                                                                    {item.subjectName || "Khung giờ học"}
                                                                              </div>
                                                                              {item.location && (
                                                                                    <div className="mt-0.5 truncate text-[11px] text-slate-500">
                                                                                          {item.location}
                                                                                    </div>
                                                                              )}
                                                                        </div>

                                                                        <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-64 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-2xl group-hover:block">
                                                                              <div className="text-xs font-bold uppercase tracking-wide text-blue-600">
                                                                                    {DAY_LABELS[item.dayOfWeek]} · {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                                                              </div>
                                                                              <div className="mt-1 text-sm font-bold text-slate-950">
                                                                                    {item.subjectName || "Khung giờ học"}
                                                                              </div>
                                                                              {item.location && (
                                                                                    <div className="mt-1 text-xs text-slate-600">
                                                                                          Địa điểm: {item.location}
                                                                                    </div>
                                                                              )}
                                                                              {item.notes && (
                                                                                    <div className="mt-1 text-xs text-slate-500">
                                                                                          Ghi chú: {item.notes}
                                                                                    </div>
                                                                              )}
                                                                        </div>
                                                                  </button>
                                                            ))}
                                                      </div>
                                                ))}
                                          </div>
                                    </div>
                              </div>
                        ) : (
                              <div className="rounded-2xl border border-slate-200 bg-white">
                                    <div className="flex flex-col gap-1 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                          <div className="font-bold text-slate-900">{monthTitle}</div>
                                          <div className="text-xs text-slate-500">
                                                Lịch tháng được sinh theo lịch học lặp hằng tuần. Dùng Next/Prev để xem các tháng khác. Dùng Next/Prev để xem các tháng khác.
                                          </div>
                                    </div>

                                    <div className="overflow-auto" style={{ maxHeight: calendarMaxHeight }}>
                                          <div className="min-w-[760px]">
                                                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-bold uppercase text-slate-500">
                                                      {WEEK_DAYS.map((dayOfWeek) => (
                                                            <div key={dayOfWeek} className="px-2 py-2">
                                                                  {DAY_LABELS[dayOfWeek].replace("Thứ ", "T")}
                                                            </div>
                                                      ))}
                                                </div>

                                                <div className="grid grid-cols-7">
                                                      {monthCells.map((cell, index) => {
                                                const daySchedules = cell.dayOfWeek
                                                      ? schedulesByDay.get(cell.dayOfWeek) || []
                                                      : [];

                                                return (
                                                      <div
                                                            key={cell.date ? cell.date.toISOString() : `empty-${index}`}
                                                            className={[
                                                                  isCalendarExpanded
                                                                        ? "min-h-[170px] border-b border-r border-slate-100 p-2"
                                                                        : "min-h-[110px] border-b border-r border-slate-100 p-2",
                                                                  cell.date ? "bg-white" : "bg-slate-50/80",
                                                            ].join(" ")}
                                                      >
                                                            {cell.date && (
                                                                  <>
                                                                        <div className="mb-2 text-xs font-bold text-slate-500">
                                                                              {cell.date.getDate()}
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                              {daySchedules.slice(0, 3).map((item) => (
                                                                                    <button
                                                                                          key={`${cell.date?.toISOString()}-${item.id}`}
                                                                                          type="button"
                                                                                          onClick={() => handleEdit(item)}
                                                                                          title={`${DAY_LABELS[item.dayOfWeek]} ${formatTime(item.startTime)} - ${formatTime(item.endTime)} · ${item.subjectName || "Khung giờ học"}${item.location ? ` · ${item.location}` : ""}`}
                                                                                          className="block w-full truncate rounded-lg bg-blue-50 px-2 py-1 text-left text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                                                                                    >
                                                                                          {formatTime(item.startTime)} {item.subjectName || "Khung giờ học"}
                                                                                    </button>
                                                                              ))}

                                                                              {daySchedules.length > 3 && (
                                                                                    <div className="text-[11px] font-medium text-slate-400">
                                                                                          +{daySchedules.length - 3} lịch khác
                                                                                    </div>
                                                                              )}
                                                                        </div>
                                                                  </>
                                                            )}
                                                      </div>
                                                );
                                                      })}
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        )}

                  </AppSection>


                  {isCalendarExpanded && (scheduleViewMode === "week" || scheduleViewMode === "month") && (
                        <div className="fixed bottom-6 right-6 top-20 z-[95] w-[calc(100vw-3rem)] rounded-3xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_62%,#fff4e8_100%)] shadow-[0_30px_80px_rgba(15,23,42,0.22)] lg:left-72 lg:w-auto">
                              <div className="flex flex-col gap-3 border-b border-amber-100/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                          <p className={residenceMediumStyle.modalEyebrow}>
                                                Lịch học mở rộng
                                          </p>
                                          <h3 className="text-lg font-bold text-slate-950">
                                                {scheduleViewMode === "week" ? "Lịch tuần" : "Lịch tháng"}
                                          </h3>
                                          <p className="mt-1 text-xs text-slate-500">
                                                Khung xem nằm trên hồ sơ học viên, vẫn giữ menu bên trái. Có thể cuộn ngang/dọc để xem chi tiết.
                                          </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                          <div className="inline-flex rounded-2xl bg-amber-50/80 p-1 ring-1 ring-amber-100">
                                                {([
                                                      ["week", "Lịch tuần"],
                                                      ["month", "Lịch tháng"],
                                                ] as Array<[ScheduleViewMode, string]>).map(([key, label]) => (
                                                      <button
                                                            key={key}
                                                            type="button"
                                                            onClick={() => setScheduleViewMode(key)}
                                                            className={[
                                                                  "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                                                                  scheduleViewMode === key
                                                                        ? "bg-white text-blue-700 shadow-sm"
                                                                        : "text-slate-500 hover:text-slate-800",
                                                            ].join(" ")}
                                                      >
                                                            {label}
                                                      </button>
                                                ))}
                                          </div>

                                          <div className="inline-flex items-center overflow-hidden rounded-2xl border border-amber-100 bg-white/75 shadow-sm">
                                                <button
                                                      type="button"
                                                      onClick={goToPreviousSchedulePeriod}
                                                      className="px-2.5 py-2 text-slate-500 transition hover:bg-amber-50 hover:text-slate-800"
                                                      title={scheduleViewMode === "month" ? "Tháng trước" : "Tuần trước"}
                                                >
                                                      <ChevronLeft className="h-4 w-4" />
                                                </button>

                                                <button
                                                      type="button"
                                                      onClick={goToCurrentSchedulePeriod}
                                                      className="border-x border-amber-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-amber-50 hover:text-slate-900"
                                                      title="Về kỳ hiện tại"
                                                >
                                                      Hiện tại
                                                </button>

                                                <button
                                                      type="button"
                                                      onClick={goToNextSchedulePeriod}
                                                      className="px-2.5 py-2 text-slate-500 transition hover:bg-amber-50 hover:text-slate-800"
                                                      title={scheduleViewMode === "month" ? "Tháng sau" : "Tuần sau"}
                                                >
                                                      <ChevronRight className="h-4 w-4" />
                                                </button>
                                          </div>

                                          <span className="rounded-2xl border border-amber-100 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                                                {calendarPeriodTitle}
                                          </span>

                                          <button
                                                type="button"
                                                onClick={closeCalendarExpanded}
                                                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                                title="Trở về trạng thái ban đầu trong form hồ sơ học viên"
                                          >
                                                Trở về
                                          </button>

                                          <button
                                                type="button"
                                                onClick={closeCalendarExpanded}
                                                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                                                title="Đóng khung lịch mở rộng"
                                          >
                                                <X className="h-5 w-5" />
                                          </button>
                                    </div>
                              </div>

                              <div className="h-[calc(100%-104px)] overflow-hidden p-4">
                                    {scheduleViewMode === "week" ? (
                                          <div className="h-full rounded-2xl border border-slate-200 bg-white">
                                                <div className="overflow-x-auto">
                                                      <div
                                                            className="grid grid-cols-[80px_repeat(7,minmax(140px,1fr))] border-b border-slate-200 bg-slate-50"
                                                            style={{ minWidth: expandedCalendarMinWidth }}
                                                      >
                                                            <div className="px-3 py-3 text-xs font-bold uppercase text-slate-400">
                                                                  Giờ
                                                            </div>
                                                            {WEEK_DAYS.map((dayOfWeek) => (
                                                                  <div
                                                                        key={dayOfWeek}
                                                                        className="border-l border-slate-200 px-3 py-3 text-center text-xs font-bold uppercase text-slate-500"
                                                                  >
                                                                        {DAY_LABELS[dayOfWeek]}
                                                                  </div>
                                                            ))}
                                                      </div>
                                                </div>

                                                <div
                                                      className="overflow-auto"
                                                      style={{ maxHeight: expandedCalendarMaxHeight }}
                                                >
                                                      <div
                                                            className="grid grid-cols-[80px_repeat(7,minmax(140px,1fr))]"
                                                            style={{
                                                                  minWidth: expandedCalendarMinWidth,
                                                                  height: `${(STUDY_HOUR_END - STUDY_HOUR_START) * expandedCalendarHourHeight}px`,
                                                            }}
                                                      >
                                                            <div className="relative bg-slate-50">
                                                                  {Array.from(
                                                                        { length: STUDY_HOUR_END - STUDY_HOUR_START + 1 },
                                                                        (_, index) => STUDY_HOUR_START + index
                                                                  ).map((hour) => (
                                                                        <div
                                                                              key={hour}
                                                                              className="absolute left-0 right-0 border-t border-slate-200 px-2 pt-1 text-[11px] font-medium text-slate-400"
                                                                              style={{
                                                                                    top: `${(hour - STUDY_HOUR_START) * expandedCalendarHourHeight}px`,
                                                                              }}
                                                                        >
                                                                              {String(hour).padStart(2, "0")}:00
                                                                        </div>
                                                                  ))}
                                                            </div>

                                                            {WEEK_DAYS.map((dayOfWeek) => (
                                                                  <div
                                                                        key={dayOfWeek}
                                                                        className="relative border-l border-slate-200"
                                                                  >
                                                                        {Array.from(
                                                                              { length: STUDY_HOUR_END - STUDY_HOUR_START + 1 },
                                                                              (_, index) => STUDY_HOUR_START + index
                                                                        ).map((hour) => (
                                                                              <div
                                                                                    key={hour}
                                                                                    className="absolute left-0 right-0 border-t border-slate-100"
                                                                                    style={{
                                                                                          top: `${(hour - STUDY_HOUR_START) * expandedCalendarHourHeight}px`,
                                                                                    }}
                                                                              />
                                                                        ))}

                                                                        {(schedulesByDay.get(dayOfWeek) || []).map((item) => (
                                                                              <button
                                                                                    key={item.id}
                                                                                    type="button"
                                                                                    onClick={() => handleEdit(item)}
                                                                                    className="group absolute left-2 right-2 overflow-visible rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-left shadow-sm transition hover:z-20 hover:bg-blue-100"
                                                                                    style={{
                                                                                          top: `${getScheduleTopOffset(item.startTime, expandedCalendarHourHeight)}px`,
                                                                                          height: `${getScheduleBlockHeight(item.startTime, item.endTime, expandedCalendarHourHeight)}px`,
                                                                                    }}
                                                                                    title={`${DAY_LABELS[item.dayOfWeek]} ${formatTime(item.startTime)} - ${formatTime(item.endTime)} · ${item.subjectName || "Khung giờ học"}${item.location ? ` · ${item.location}` : ""}`}
                                                                              >
                                                                                    <div className="overflow-hidden">
                                                                                          <div className="text-xs font-bold text-blue-700">
                                                                                                {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                                                                          </div>
                                                                                          <div className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
                                                                                                {item.subjectName || "Khung giờ học"}
                                                                                          </div>
                                                                                          {item.location && (
                                                                                                <div className="mt-1 truncate text-xs text-slate-500">
                                                                                                      {item.location}
                                                                                                </div>
                                                                                          )}
                                                                                    </div>

                                                                                    <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-2xl group-hover:block">
                                                                                          <div className="text-xs font-bold uppercase tracking-wide text-blue-600">
                                                                                                {DAY_LABELS[item.dayOfWeek]} · {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                                                                          </div>
                                                                                          <div className="mt-1 text-sm font-bold text-slate-950">
                                                                                                {item.subjectName || "Khung giờ học"}
                                                                                          </div>
                                                                                          {item.location && (
                                                                                                <div className="mt-1 text-xs text-slate-600">
                                                                                                      Địa điểm: {item.location}
                                                                                                </div>
                                                                                          )}
                                                                                          {item.notes && (
                                                                                                <div className="mt-1 text-xs text-slate-500">
                                                                                                      Ghi chú: {item.notes}
                                                                                                </div>
                                                                                          )}
                                                                                    </div>
                                                                              </button>
                                                                        ))}
                                                                  </div>
                                                            ))}
                                                      </div>
                                                </div>
                                          </div>
                                    ) : (
                                          <div className="h-full rounded-2xl border border-slate-200 bg-white">
                                                <div className="flex flex-col gap-1 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                                      <div className="font-bold text-slate-900">{monthTitle}</div>
                                                      <div className="text-xs text-slate-500">
                                                            Lịch tháng được sinh theo lịch học lặp hằng tuần. Dùng Next/Prev để xem các tháng khác. Dùng Next/Prev để xem các tháng khác.
                                                      </div>
                                                </div>

                                                <div className="overflow-auto" style={{ maxHeight: expandedCalendarMaxHeight }}>
                                                      <div className="min-w-[920px]">
                                                            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-bold uppercase text-slate-500">
                                                                  {WEEK_DAYS.map((dayOfWeek) => (
                                                                        <div key={dayOfWeek} className="px-2 py-2">
                                                                              {DAY_LABELS[dayOfWeek].replace("Thứ ", "T")}
                                                                        </div>
                                                                  ))}
                                                            </div>

                                                            <div className="grid grid-cols-7">
                                                                  {monthCells.map((cell, index) => {
                                                                        const daySchedules = cell.dayOfWeek
                                                                              ? schedulesByDay.get(cell.dayOfWeek) || []
                                                                              : [];

                                                                        return (
                                                                              <div
                                                                                    key={cell.date ? cell.date.toISOString() : `expanded-empty-${index}`}
                                                                                    className={[
                                                                                          "min-h-[170px] border-b border-r border-slate-100 p-2",
                                                                                          cell.date ? "bg-white" : "bg-slate-50/80",
                                                                                    ].join(" ")}
                                                                              >
                                                                                    {cell.date && (
                                                                                          <>
                                                                                                <div className="mb-2 text-xs font-bold text-slate-500">
                                                                                                      {cell.date.getDate()}
                                                                                                </div>

                                                                                                <div className="space-y-1">
                                                                                                      {daySchedules.map((item) => (
                                                                                                            <button
                                                                                                                  key={`${cell.date?.toISOString()}-${item.id}`}
                                                                                                                  type="button"
                                                                                                                  onClick={() => handleEdit(item)}
                                                                                                                  title={`${DAY_LABELS[item.dayOfWeek]} ${formatTime(item.startTime)} - ${formatTime(item.endTime)} · ${item.subjectName || "Khung giờ học"}${item.location ? ` · ${item.location}` : ""}`}
                                                                                                                  className="block w-full truncate rounded-lg bg-blue-50 px-2 py-1 text-left text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                                                                                                            >
                                                                                                                  {formatTime(item.startTime)} - {formatTime(item.endTime)} · {item.subjectName || "Khung giờ học"}
                                                                                                            </button>
                                                                                                      ))}
                                                                                                </div>
                                                                                          </>
                                                                                    )}
                                                                              </div>
                                                                        );
                                                                  })}
                                                            </div>
                                                      </div>
                                                </div>
                                          </div>
                                    )}
                              </div>
                        </div>
                  )}

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
                                                      <TimePickerInput
                                                            value={formData.startTime}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        startTime: event.target.value,
                                                                  }))
                                                            }
                                                            className="h-11 rounded-2xl border-slate-200 bg-white text-sm font-semibold text-slate-800"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <span className="text-sm font-bold text-slate-800">
                                                            Giờ kết thúc <span className="text-rose-500">*</span>
                                                      </span>
                                                      <TimePickerInput
                                                            value={formData.endTime}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        endTime: event.target.value,
                                                                  }))
                                                            }
                                                            className="h-11 rounded-2xl border-slate-200 bg-white text-sm font-semibold text-slate-800"
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
