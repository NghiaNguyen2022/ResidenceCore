'use client';

import { CheckCircle2, SkipForward } from 'lucide-react';
import {
      Badge,
      DutyStatusBadge,
      EmptyState,
      SectionCard,
      formatTime,
      getAssigneeTypeLabel,
      getDutyVisualState,
      getTimelineCardClass,
      getVisualStateBadgeClass,
      getVisualStateLabel,
} from '@/components/daily-routine/shared';

type TodayDutyPanelProps = {
      assignments: any[];
      selectedDate: string;
      isLoading?: boolean;
      onCreateDuty: () => void;
      onCompleteDuty: (assignment: any) => void;
      onSkipDuty: (assignment: any) => void;
};

function getDutyPlace(assignment: any) {
      return (
            assignment.place ||
            assignment.location ||
            assignment.workPlace ||
            assignment.notes ||
            assignment.dutyConfig?.place ||
            assignment.dutyConfig?.location ||
            assignment.dutyConfig?.description ||
            'Chưa ghi nơi làm'
      );
}

function getSimpleDutyStatusLabel(status?: string | null) {
      const normalized = String(status || 'pending').toLowerCase();

      if (normalized === 'completed') return 'Đã hoàn thành';
      if (normalized === 'cancelled') return 'Đã hủy';

      return 'Chưa hoàn thành';
}

function getSimpleDutyStatusClass(status?: string | null) {
      const normalized = String(status || 'pending').toLowerCase();

      if (normalized === 'completed') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
      if (normalized === 'cancelled') return 'border-amber-100 bg-amber-50/55 text-slate-500';

      return 'border-amber-100 bg-amber-50 text-amber-700';
}

const dutyRank: Record<string, number> = {
      overdue: 1,
      normal: 2,
      skipped: 3,
      completed: 4,
      cancelled: 5,
};

export function TodayDutyPanel({
      assignments,
      selectedDate,
      isLoading,
      onCreateDuty,
      onCompleteDuty,
      onSkipDuty,
}: TodayDutyPanelProps) {
      const sortedAssignments = assignments
            .slice()
            .sort((a: any, b: any) => {
                  const aState = getDutyVisualState(a, selectedDate);
                  const bState = getDutyVisualState(b, selectedDate);
                  return (dutyRank[aState] || 9) - (dutyRank[bState] || 9);
            });

      return (
            <SectionCard
                  title="Công tác hôm nay"
                  description="Theo dõi ngắn gọn: ngày, nơi làm, hoàn thành/chưa hoàn thành."
            >
                  {isLoading ? (
                        <EmptyState
                              title="Đang tải lịch công tác"
                              description="Vui lòng chờ trong giây lát."
                        />
                  ) : sortedAssignments.length === 0 ? (
                        <EmptyState
                              title="Chưa có công tác"
                              description="Bấm Thêm công tác để tạo công tác trong ngày."
                              action={
                                    <button
                                          type="button"
                                          onClick={onCreateDuty}
                                          className="rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-200"
                                    >
                                          Thêm công tác
                                    </button>
                              }
                        />
                  ) : (
                        <div className="space-y-3">
                              {sortedAssignments.map((assignment: any) => {
                                    const visualState = getDutyVisualState(
                                          assignment,
                                          selectedDate
                                    );

                                    return (
                                          <div
                                                key={assignment.id}
                                                className={[
                                                      'rounded-xl border p-3 shadow-[0_4px_12px_rgba(120,53,15,0.035)] transition',
                                                      getTimelineCardClass(
                                                            'duty',
                                                            visualState
                                                      ),
                                                ].join(' ')}
                                          >
                                                <div className="flex flex-wrap items-center gap-2">
                                                      <h4 className="font-bold text-slate-900">
                                                            {assignment.dutyName ||
                                                                  assignment.dutyConfig?.dutyName ||
                                                                  `Công tác #${assignment.id}`}
                                                      </h4>

                                                      <Badge className={getSimpleDutyStatusClass(assignment.status)}>
                                                            {getSimpleDutyStatusLabel(assignment.status)}
                                                      </Badge>

                                                      {getVisualStateLabel('duty', visualState) && (
                                                            <Badge className={getVisualStateBadgeClass('duty', visualState)}>
                                                                  {getVisualStateLabel('duty', visualState)}
                                                            </Badge>
                                                      )}
                                                </div>

                                                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                                                      <div className="rounded-xl border border-slate-100 bg-white/80 px-3 py-2">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ngày</p>
                                                            <p className="mt-1 font-semibold text-slate-800">{selectedDate}</p>
                                                      </div>

                                                      <div className="rounded-xl border border-slate-100 bg-white/80 px-3 py-2">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nơi làm</p>
                                                            <p className="mt-1 font-semibold text-slate-800">{getDutyPlace(assignment)}</p>
                                                      </div>

                                                      <div className="rounded-xl border border-slate-100 bg-white/80 px-3 py-2">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phân công</p>
                                                            <p className="mt-1 font-semibold text-slate-800">
                                                                  {getAssigneeTypeLabel(
                                                                        assignment.assignedToType ||
                                                                              (assignment.residentId ? 'resident' : null)
                                                                  )}
                                                                  :{' '}
                                                                  {assignment.assigneeName ||
                                                                        assignment.residentName ||
                                                                        assignment.memberName ||
                                                                        assignment.assignedToName ||
                                                                        assignment.roomName ||
                                                                        assignment.unitName ||
                                                                        assignment.resident?.fullName ||
                                                                        assignment.member?.fullName ||
                                                                        'Đối tượng được phân công'}
                                                            </p>
                                                      </div>
                                                </div>

                                                {assignment.status !== 'completed' &&
                                                      assignment.status !== 'cancelled' && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => onCompleteDuty(assignment)}
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                                                  >
                                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                                        Đã hoàn thành
                                                                  </button>

                                                                  <button
                                                                        type="button"
                                                                        onClick={() => onSkipDuty(assignment)}
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                                                  >
                                                                        <SkipForward className="h-3.5 w-3.5" />
                                                                        Chưa hoàn thành
                                                                  </button>
                                                            </div>
                                                      )}
                                          </div>
                                    );
                              })}
                        </div>
                  )}
            </SectionCard>
      );
}

export default TodayDutyPanel;
