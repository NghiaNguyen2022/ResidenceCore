'use client';

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
      isLoading,
}: TodayOverviewTabProps) {
      const activeRoutineCount = routineItems.filter(
            (item: any) => item.isActive !== false
      ).length;

      return (
            <div className="space-y-4">
                  <TodaySummaryBar
                        selectedDate={selectedDate}
                        onDateChange={onDateChange}
                        routineCount={activeRoutineCount}
                  />

                  <TodayTimeline
                        routineItems={routineItems}
                        selectedDate={selectedDate}
                        isLoading={isLoading}
                  />
            </div>
      );
}

export default TodayOverviewTab;
