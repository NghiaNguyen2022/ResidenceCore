'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Clock, MapPin, Search, Sparkles } from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { formatDate } from '@/lib/format';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { AppCard, EmptyState, ErrorState, FormSelect, LoadingState, StatusBadge } from '@/components/shared';

const ACTIVITY_TYPES = [
      { value: 'community', label: 'Sinh hoạt chung', icon: '🌿' },
      { value: 'spiritual', label: 'Thiêng liêng', icon: '⛪' },
      { value: 'study', label: 'Học tập', icon: '📚' },
      { value: 'sports', label: 'Thể thao', icon: '🏃' },
      { value: 'culture', label: 'Văn hóa', icon: '🎭' },
      { value: 'volunteer', label: 'Phục vụ', icon: '🤝' },
      { value: 'meeting', label: 'Họp', icon: '📝' },
      { value: 'other', label: 'Khác', icon: '✨' },
] as const;

const ACTIVITY_TYPE_OPTIONS = ACTIVITY_TYPES.map(({ value, label }) => ({ value, label }));

type ActivityType = (typeof ACTIVITY_TYPES)[number]['value'];
type ActivityStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

type Activity = {
      id: number;
      code: string;
      title: string;
      activityType: ActivityType;
      status: ActivityStatus;
      activityDate: string;
      startTime?: string | null;
      endTime?: string | null;
      location?: string | null;
      ownerGroup?: string | null;
      description?: string | null;
};

function getTypeMeta(type?: string | null) {
      return ACTIVITY_TYPES.find((item) => item.value === type) ?? ACTIVITY_TYPES[0];
}

function getStatusLabel(status?: string | null) {
      if (status === 'in_progress') return 'Đang diễn ra';
      if (status === 'completed') return 'Đã diễn ra';
      if (status === 'cancelled') return 'Đã hủy';
      if (status === 'draft') return 'Nháp';
      return 'Dự kiến';
}

function getStatusTone(status?: string | null) {
      if (status === 'completed') return 'success' as const;
      if (status === 'in_progress') return 'warning' as const;
      if (status === 'cancelled') return 'danger' as const;
      return 'info' as const;
}

function formatTimeRange(activity: Activity) {
      if (activity.startTime && activity.endTime) return `${activity.startTime} – ${activity.endTime}`;
      if (activity.startTime) return activity.startTime;
      if (activity.endTime) return `Đến ${activity.endTime}`;
      return 'Chưa ghi giờ';
}

function ActivityCard({ activity }: { activity: Activity }) {
      const typeMeta = getTypeMeta(activity.activityType);

      return (
            <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-slate-950/5">
                  <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-xl">
                              {typeMeta.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-base font-black text-slate-950">{activity.title}</h2>
                                    <StatusBadge tone={getStatusTone(activity.status)}>{getStatusLabel(activity.status)}</StatusBadge>
                              </div>
                              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-700/70">
                                    {typeMeta.label}
                              </p>

                              <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                                    <span className="inline-flex min-w-0 items-center gap-2">
                                          <CalendarDays className="h-4 w-4 shrink-0 text-amber-600" />
                                          <span className="truncate">{formatDate(activity.activityDate)}</span>
                                    </span>
                                    <span className="inline-flex min-w-0 items-center gap-2">
                                          <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                                          <span className="truncate">{formatTimeRange(activity)}</span>
                                    </span>
                                    <span className="inline-flex min-w-0 items-center gap-2">
                                          <MapPin className="h-4 w-4 shrink-0 text-amber-600" />
                                          <span className="truncate">{activity.location || 'Chưa ghi địa điểm'}</span>
                                    </span>
                              </div>

                              {(activity.ownerGroup || activity.description) && (
                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                                          {activity.ownerGroup ? `Phụ trách: ${activity.ownerGroup}. ` : ''}
                                          {activity.description || ''}
                                    </p>
                              )}
                        </div>
                  </div>
            </article>
      );
}

export default function ResidentActivities() {
      const [search, setSearch] = useState('');
      const [typeFilter, setTypeFilter] = useState<'all' | ActivityType>('all');

      const activitiesQuery = trpc.activities.listPublic.useQuery({
            search: search || undefined,
            activityType: typeFilter !== 'all' ? typeFilter : undefined,
            limit: 200,
            offset: 0,
      });

      const activities = useMemo<Activity[]>(() => (activitiesQuery.data ?? []) as Activity[], [activitiesQuery.data]);
      const upcomingCount = activities.filter((item) => item.status === 'scheduled' || item.status === 'in_progress').length;

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6">
                        <section className="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_54%,#fffbeb_100%)] p-6 shadow-lg shadow-amber-950/10">
                              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-amber-200/20 blur-3xl" />
                              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div>
                                          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700/80">
                                                Portal học viên
                                          </p>
                                          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                                                Hoạt động lưu xá
                                          </h1>
                                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                                Theo dõi các hoạt động chung được công khai cho học viên.
                                          </p>
                                    </div>
                                    <div className="rounded-3xl border border-amber-100 bg-white/80 px-4 py-3 text-right shadow-sm">
                                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700/70">Sắp/đang diễn ra</p>
                                          <p className="mt-1 text-2xl font-black text-slate-950">{upcomingCount}</p>
                                    </div>
                              </div>
                        </section>

                        <AppCard className="rounded-3xl border-slate-200/80 bg-white/90 shadow-sm">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="relative min-w-0 flex-1">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                          <Input
                                                value={search}
                                                onChange={(event) => setSearch(event.target.value)}
                                                placeholder="Tìm hoạt động, địa điểm, ban phụ trách..."
                                                className="h-10 rounded-2xl pl-9"
                                          />
                                    </div>
                                    <FormSelect
                                          value={typeFilter}
                                          onValueChange={(value) => setTypeFilter(value as 'all' | ActivityType)}
                                          options={[{ value: 'all', label: 'Tất cả loại' }, ...ACTIVITY_TYPE_OPTIONS]}
                                          className="h-10 w-48 rounded-2xl"
                                    />
                              </div>
                        </AppCard>

                        {activitiesQuery.isLoading ? (
                              <LoadingState />
                        ) : activitiesQuery.isError ? (
                              <ErrorState message={activitiesQuery.error.message} onRetry={() => activitiesQuery.refetch()} />
                        ) : activities.length === 0 ? (
                              <EmptyState
                                    title="Chưa có hoạt động công khai"
                                    description="Khi lưu xá công khai hoạt động mới, danh sách sẽ hiển thị tại đây."
                                    icon={<Sparkles className="h-10 w-10" />}
                              />
                        ) : (
                              <div className="space-y-3">
                                    {activities.map((activity) => (
                                          <ActivityCard key={activity.id} activity={activity} />
                                    ))}
                              </div>
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}
