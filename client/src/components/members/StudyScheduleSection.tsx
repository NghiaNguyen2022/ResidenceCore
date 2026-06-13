import { useMemo, useState } from "react";
import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react";
import { formatTime } from '@/lib/format';

import {
      AppSection,
      EmptyState,
      StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { StudyScheduleModal } from "./StudyScheduleModal";

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
            setEditingSchedule(null);
            setIsModalOpen(true);
      };

      const handleEdit = (schedule: StudySchedule) => {
            setEditingSchedule(schedule);
            setIsModalOpen(true);
      };

      const handleCloseModal = () => {
            setEditingSchedule(null);
            setIsModalOpen(false);
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
                                                                        onClick={() => {
                                                                              if (
                                                                                    window.confirm(
                                                                                          "Xóa lịch học này?"
                                                                                    )
                                                                              ) {
                                                                                    onDelete({
                                                                                          id: item.id,
                                                                                          residentId,
                                                                                    });
                                                                              }
                                                                        }}
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

                  <StudyScheduleModal
                        open={isModalOpen}
                        residentId={residentId}
                        schedule={editingSchedule}
                        isSaving={isSaving}
                        onClose={handleCloseModal}
                        onSave={(data) => {
                              onSave(data);
                              handleCloseModal();
                        }}
                  />
            </>
      );
}
