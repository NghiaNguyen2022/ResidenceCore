'use client';

import {
      Badge,
      EmptyState,
      SectionCard,
      TimeBox,
      getRoutineVisualState,
      getTimelineCardClass,
      getVisualStateBadgeClass,
      getVisualStateLabel,
} from '@/components/daily-routine/shared';

type TodayTimelineProps = {
      routineItems: any[];
      selectedDate: string;
      isLoading?: boolean;
};

export function TodayTimeline({
      routineItems,
      selectedDate,
      isLoading,
}: TodayTimelineProps) {
      const activeRoutineItems = routineItems
            .filter((item: any) => item.isActive !== false)
            .slice()
            .sort((a: any, b: any) =>
                  String(a.startTime || '').localeCompare(String(b.startTime || ''))
            );

      return (
            <SectionCard
                  title="Sinh hoạt trong ngày"
                  description="Các khung giờ sinh hoạt cố định, chỉ để theo dõi nhanh."
            >
                  {isLoading ? (
                        <EmptyState
                              title="Đang tải lịch sinh hoạt"
                              description="Vui lòng chờ trong giây lát."
                        />
                  ) : activeRoutineItems.length === 0 ? (
                        <EmptyState
                              title="Chưa có lịch sinh hoạt"
                              description="Thiết lập lịch sinh hoạt để hiển thị tại đây."
                        />
                  ) : (
                        <div className="space-y-3">
                              {activeRoutineItems.map((item: any) => {
                                    const visualState = getRoutineVisualState(
                                          item,
                                          selectedDate
                                    );

                                    return (
                                          <div
                                                key={item.id || `${item.startTime}-${item.title}`}
                                                className={[
                                                      'rounded-xl border p-3 shadow-[0_4px_12px_rgba(120,53,15,0.035)] transition',
                                                      getTimelineCardClass(
                                                            'routine',
                                                            visualState
                                                      ),
                                                ].join(' ')}
                                          >
                                                <div className="flex gap-4">
                                                      <TimeBox
                                                            startTime={item.startTime}
                                                            endTime={item.endTime}
                                                      />

                                                      <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                  <h3 className="font-bold text-slate-900">
                                                                        {item.title}
                                                                  </h3>

                                                                  <Badge className="border-amber-100 bg-amber-50 text-amber-800">
                                                                        Lịch sinh hoạt
                                                                  </Badge>

                                                                  {getVisualStateLabel(
                                                                        'routine',
                                                                        visualState
                                                                  ) && (
                                                                        <Badge
                                                                              className={getVisualStateBadgeClass(
                                                                                    'routine',
                                                                                    visualState
                                                                              )}
                                                                        >
                                                                              {getVisualStateLabel(
                                                                                    'routine',
                                                                                    visualState
                                                                              )}
                                                                        </Badge>
                                                                  )}
                                                            </div>

                                                            {item.location && (
                                                                  <p className="mt-1 text-sm text-slate-500">
                                                                        {item.location}
                                                                  </p>
                                                            )}

                                                            {item.description && (
                                                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                        {item.description}
                                                                  </p>
                                                            )}
                                                      </div>
                                                </div>
                                          </div>
                                    );
                              })}
                        </div>
                  )}
            </SectionCard>
      );
}

export default TodayTimeline;
