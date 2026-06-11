'use client';

import { CheckCircle2, SkipForward, X } from 'lucide-react';

import {
      Badge,
      DateNavigator,
      EmptyState,
      SectionCard,
      TimeBox,
      getAssigneeTypeLabel,
      getDutyStatusClass,
      getDutyStatusLabel,
      getDutyTypeLabel,
      getDutyVisualState,
      getTimelineCardClass,
      getVisualStateBadgeClass,
      getVisualStateLabel,
} from '@/components/daily-routine/shared';

type DutyStatusFilter = 'all' | 'open' | 'overdue' | 'completed' | 'skipped' | 'cancelled';

type DutyDayViewProps = {
      selectedDate: string;
      onDateChange: (value: string) => void;
      statusFilter: DutyStatusFilter;
      onStatusFilterChange: (value: DutyStatusFilter) => void;
      assignments: any[];
      isLoading?: boolean;
      onCompleteDuty: (assignment: any) => void;
      onSkipDuty: (assignment: any) => void;
      onCancelDuty: (assignment: any) => void;
};

function getAssigneeName(assignment: any) {
      return (
            assignment.assigneeName ||
            assignment.residentName ||
            assignment.memberName ||
            assignment.assignedToName ||
            assignment.roomName ||
            assignment.unitName ||
            assignment.resident?.fullName ||
            assignment.member?.fullName ||
            'Đối tượng được phân công'
      );
}

export function DutyDayView({
      selectedDate,
      onDateChange,
      statusFilter,
      onStatusFilterChange,
      assignments,
      isLoading,
      onCompleteDuty,
      onSkipDuty,
      onCancelDuty,
}: DutyDayViewProps) {
      return (
            <SectionCard
                  title="Công tác trong ngày"
                  description="Theo dõi và cập nhật tình trạng công tác theo từng ngày."
                  action={
                        <div className="flex flex-wrap items-center gap-2">
                              <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                          onStatusFilterChange(
                                                event.target.value as DutyStatusFilter
                                          )
                                    }
                                    className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                              >
                                    <option value="all">Tất cả</option>
                                    <option value="open">Chưa hoàn tất</option>
                                    <option value="overdue">Đã quá giờ</option>
                                    <option value="completed">Hoàn thành</option>
                                    <option value="skipped">Vắng / Không làm</option>
                                    <option value="cancelled">Đã hủy</option>
                              </select>

                              <DateNavigator
                                    value={selectedDate}
                                    onChange={onDateChange}
                              />
                        </div>
                  }
            >
                  {isLoading ? (
                        <EmptyState
                              title="Đang tải công tác"
                              description="Vui lòng chờ trong giây lát."
                        />
                  ) : assignments.length === 0 ? (
                        <EmptyState
                              title="Chưa có công tác trong ngày"
                              description="Chưa có công tác phù hợp với bộ lọc hiện tại."
                        />
                  ) : (
                        <div className="space-y-3">
                              {assignments.map((assignment: any) => {
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
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                      <div className="flex gap-4">
                                                            <TimeBox
                                                                  startTime={
                                                                        assignment.startDateTime ||
                                                                        assignment.startTime ||
                                                                        assignment.dutyConfig
                                                                              ?.startTime
                                                                  }
                                                                  endTime={
                                                                        assignment.endDateTime ||
                                                                        assignment.endTime ||
                                                                        assignment.dutyConfig?.endTime
                                                                  }
                                                            />

                                                            <div>
                                                                  <div className="flex flex-wrap items-center gap-2">
                                                                        <h3 className="font-bold text-slate-950">
                                                                              {assignment.dutyName ||
                                                                                    assignment.dutyConfig
                                                                                          ?.dutyName ||
                                                                                    `Công tác #${assignment.id}`}
                                                                        </h3>

                                                                        <Badge
                                                                              className={getDutyStatusClass(
                                                                                    assignment.status
                                                                              )}
                                                                        >
                                                                              {getDutyStatusLabel(
                                                                                    assignment.status
                                                                              )}
                                                                        </Badge>

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

                                                                  <p className="mt-1 text-sm text-slate-500">
                                                                        {getAssigneeTypeLabel(
                                                                              assignment.assignedToType ||
                                                                                    (assignment.residentId
                                                                                          ? 'resident'
                                                                                          : null)
                                                                        )}
                                                                        :{' '}
                                                                        <span className="font-semibold text-slate-700">
                                                                              {getAssigneeName(
                                                                                    assignment
                                                                              )}
                                                                        </span>
                                                                  </p>

                                                                  {assignment.dutyConfig && (
                                                                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                                                              <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                                                                                    {getDutyTypeLabel(
                                                                                          assignment
                                                                                                .dutyConfig
                                                                                                .dutyType
                                                                                    )}
                                                                              </span>

                                                                              {(assignment.dutyConfig
                                                                                    .minPersons ||
                                                                                    assignment.dutyConfig
                                                                                          .maxPersons) && (
                                                                                    <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                                                                                          Số người:{' '}
                                                                                          {assignment
                                                                                                .dutyConfig
                                                                                                .minPersons ||
                                                                                                0}
                                                                                          {assignment
                                                                                                .dutyConfig
                                                                                                .maxPersons
                                                                                                ? ` - ${assignment.dutyConfig.maxPersons}`
                                                                                                : '+'}
                                                                                    </span>
                                                                              )}
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      </div>

                                                      {assignment.status !== 'completed' &&
                                                            assignment.status !== 'cancelled' && (
                                                                  <div className="flex flex-wrap gap-2 lg:justify-end">
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
                                                                              Vắng / Không làm
                                                                        </button>

                                                                        <button
                                                                              type="button"
                                                                              onClick={() =>
                                                                                    onCancelDuty(
                                                                                          assignment
                                                                                    )
                                                                              }
                                                                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                                                        >
                                                                              <X className="h-3.5 w-3.5" />
                                                                              Hủy
                                                                        </button>
                                                                  </div>
                                                            )}
                                                </div>
                                          </div>
                                    );
                              })}
                        </div>
                  )}
            </SectionCard>
      );
}

export default DutyDayView;
