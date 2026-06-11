'use client';

import { CheckCircle2, SkipForward } from 'lucide-react';
import {
      Badge,
      DutyStatusBadge,
      EmptyState,
      SectionCard,
      TimeBox,
      getTimelineCardClass,
      getVisualStateBadgeClass,
      getVisualStateLabel,
} from '@/components/daily-routine/shared';

type TodayTimelineProps = {
      items: any[];
      isLoading?: boolean;
      onCompleteDuty: (assignment: any) => void;
      onSkipDuty: (assignment: any) => void;
};

export function TodayTimeline({
      items,
      isLoading,
      onCompleteDuty,
      onSkipDuty,
}: TodayTimelineProps) {
      return (
            <SectionCard
                  title="Timeline trong ngày"
                  description="Lịch sinh hoạt và công tác được sắp theo giờ."
            >
                  {isLoading ? (
                        <EmptyState
                              title="Đang tải sinh hoạt trong ngày"
                              description="Vui lòng chờ trong giây lát."
                        />
                  ) : items.length === 0 ? (
                        <EmptyState
                              title="Chưa có nội dung trong ngày"
                              description="Thiết lập lịch sinh hoạt hoặc tạo công tác để hiển thị tại đây."
                        />
                  ) : (
                        <div className="space-y-3">
                              {items.map((entry: any) => (
                                    <div
                                          key={entry.key}
                                          className={[
                                                'rounded-3xl border p-4 shadow-sm transition',
                                                getTimelineCardClass(
                                                      entry.type,
                                                      entry.visualState
                                                ),
                                          ].join(' ')}
                                    >
                                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="flex gap-4">
                                                      <TimeBox
                                                            startTime={entry.startTime}
                                                            endTime={entry.endTime}
                                                      />

                                                      <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                  <h3 className="font-bold text-slate-950">
                                                                        {entry.title}
                                                                  </h3>

                                                                  {entry.type === 'routine' ? (
                                                                        <Badge className="border-blue-100 bg-blue-50 text-blue-700">
                                                                              Lịch sinh hoạt
                                                                        </Badge>
                                                                  ) : (
                                                                        <DutyStatusBadge
                                                                              status={entry.status}
                                                                        />
                                                                  )}

                                                                  {getVisualStateLabel(
                                                                        entry.type,
                                                                        entry.visualState
                                                                  ) && (
                                                                        <Badge
                                                                              className={getVisualStateBadgeClass(
                                                                                    entry.type,
                                                                                    entry.visualState
                                                                              )}
                                                                        >
                                                                              {getVisualStateLabel(
                                                                                    entry.type,
                                                                                    entry.visualState
                                                                              )}
                                                                        </Badge>
                                                                  )}
                                                            </div>

                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  {entry.subTitle}
                                                            </p>

                                                            {entry.description && (
                                                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                        {entry.description}
                                                                  </p>
                                                            )}
                                                      </div>
                                                </div>

                                                {entry.type === 'duty' &&
                                                      entry.status !== 'completed' &&
                                                      entry.status !== 'cancelled' && (
                                                            <div className="flex flex-wrap gap-2 lg:justify-end">
                                                                  <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                              onCompleteDuty(
                                                                                    entry.assignment
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
                                                                                    entry.assignment
                                                                              )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                                                  >
                                                                        <SkipForward className="h-3.5 w-3.5" />
                                                                        Vắng / Không làm
                                                                  </button>
                                                            </div>
                                                      )}
                                          </div>
                                    </div>
                              ))}
                        </div>
                  )}
            </SectionCard>
      );
}

export default TodayTimeline;
