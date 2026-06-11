'use client';

import { CheckCircle2, SkipForward } from 'lucide-react';
import {
      Badge,
      DutyStatusBadge,
      EmptyState,
      SectionCard,
      TimeBox,
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
                  title="Công tác cần theo dõi"
                  description="Ưu tiên xử lý các công tác chưa hoàn thành hoặc đã quá giờ."
            >
                  {isLoading ? (
                        <EmptyState
                              title="Đang tải công tác"
                              description="Vui lòng chờ trong giây lát."
                        />
                  ) : sortedAssignments.length === 0 ? (
                        <EmptyState
                              title="Chưa có công tác"
                              description="Bấm Thêm phân công để tạo công tác trong ngày."
                              action={
                                    <button
                                          type="button"
                                          onClick={onCreateDuty}
                                          className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                          Thêm phân công
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
                                                      'rounded-3xl border p-4 shadow-sm transition',
                                                      getTimelineCardClass(
                                                            'duty',
                                                            visualState
                                                      ),
                                                ].join(' ')}
                                          >
                                                <div className="flex flex-wrap items-center gap-2">
                                                      <h4 className="font-bold text-slate-950">
                                                            {assignment.dutyName ||
                                                                  assignment.dutyConfig
                                                                        ?.dutyName ||
                                                                  `Công tác #${assignment.id}`}
                                                      </h4>
                                                      <DutyStatusBadge
                                                            status={assignment.status}
                                                      />
                                                      {getVisualStateLabel(
                                                            'duty',
                                                            visualState
                                                      ) && (
                                                            <Badge
                                                                  className={getVisualStateBadgeClass(
                                                                        'duty',
                                                                        visualState
                                                                  )}
                                                            >
                                                                  {getVisualStateLabel(
                                                                        'duty',
                                                                        visualState
                                                                  )}
                                                            </Badge>
                                                      )}
                                                </div>

                                                <p className="mt-2 text-sm text-slate-600">
                                                      {formatTime(
                                                            assignment.startDateTime ||
                                                                  assignment.startTime ||
                                                                  assignment.dutyConfig
                                                                        ?.startTime
                                                      )}{' '}
                                                      -{' '}
                                                      {formatTime(
                                                            assignment.endDateTime ||
                                                                  assignment.endTime ||
                                                                  assignment.dutyConfig?.endTime
                                                      )}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                      {getAssigneeTypeLabel(
                                                            assignment.assignedToType ||
                                                                  (assignment.residentId
                                                                        ? 'resident'
                                                                        : null)
                                                      )}
                                                      :{' '}
                                                      <span className="font-semibold text-slate-700">
                                                            {assignment.assigneeName ||
                                                                  assignment.residentName ||
                                                                  assignment.memberName ||
                                                                  assignment.assigneeName ||
                                                                  assignment.assignedToName ||
                                                                  assignment.roomName ||
                                                                  assignment.unitName ||
                                                                  assignment.resident?.fullName ||
                                                                  assignment.member?.fullName ||
                                                                  'Đối tượng được phân công'}
                                                      </span>
                                                </p>

                                                {assignment.status !== 'completed' &&
                                                      assignment.status !== 'cancelled' && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                  <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                              onCompleteDuty(
                                                                                    assignment
                                                                              )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
                                                                  >
                                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                                        Hoàn thành
                                                                  </button>

                                                                  <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                              onSkipDuty(
                                                                                    assignment
                                                                              )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                                                  >
                                                                        <SkipForward className="h-3.5 w-3.5" />
                                                                        Vắng
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
