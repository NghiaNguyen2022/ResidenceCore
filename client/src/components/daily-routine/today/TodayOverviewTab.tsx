'use client';

import TodayDutyPanel from './TodayDutyPanel';
import TodaySummaryBar from './TodaySummaryBar';
import TodayTimeline from './TodayTimeline';

type TodayOverviewTabProps = {
      selectedDate: string;
      onDateChange: (value: string) => void;
      routineItems: any[];
      dutyAssignments: any[];
      timelineItems: any[];
      isLoading?: boolean;
      onCreateDuty: () => void;
      onCompleteDuty: (assignment: any) => void;
      onSkipDuty: (assignment: any) => void;
};

export function TodayOverviewTab({
      selectedDate,
      onDateChange,
      routineItems,
      dutyAssignments,
      timelineItems,
      isLoading,
      onCreateDuty,
      onCompleteDuty,
      onSkipDuty,
}: TodayOverviewTabProps) {
      return (
            <div className="space-y-5">
                  <TodaySummaryBar
                        selectedDate={selectedDate}
                        onDateChange={onDateChange}
                        routineCount={routineItems.filter((item: any) => item.isActive).length}
                        assignments={dutyAssignments}
                        onCreateDuty={onCreateDuty}
                  />

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
                        <TodayTimeline
                              items={timelineItems}
                              isLoading={isLoading}
                              onCompleteDuty={onCompleteDuty}
                              onSkipDuty={onSkipDuty}
                        />

                        <TodayDutyPanel
                              assignments={dutyAssignments}
                              selectedDate={selectedDate}
                              isLoading={isLoading}
                              onCreateDuty={onCreateDuty}
                              onCompleteDuty={onCompleteDuty}
                              onSkipDuty={onSkipDuty}
                        />
                  </div>
            </div>
      );
}

export default TodayOverviewTab;
