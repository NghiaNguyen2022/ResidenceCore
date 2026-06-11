'use client';

import TodayDutyPanel from './TodayDutyPanel';
import TodaySummaryBar from './TodaySummaryBar';
import TodayTimeline from './TodayTimeline';

type TodayOverviewTabProps = {
      selectedDate: string;
      onDateChange: (value: string) => void;
      routineItems: any[];
      dutyAssignments: any[];
      timelineItems?: any[];
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
      isLoading,
      onCreateDuty,
      onCompleteDuty,
      onSkipDuty,
}: TodayOverviewTabProps) {
      const activeRoutineCount = routineItems.filter(
            (item: any) => item.isActive !== false
      ).length;

      return (
            <div className="space-y-5">
                  <TodaySummaryBar
                        selectedDate={selectedDate}
                        onDateChange={onDateChange}
                        routineCount={activeRoutineCount}
                        assignments={dutyAssignments}
                        onCreateDuty={onCreateDuty}
                  />

                  <div className="grid gap-6 xl:grid-cols-2">
                        <TodayTimeline
                              routineItems={routineItems}
                              selectedDate={selectedDate}
                              isLoading={isLoading}
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
