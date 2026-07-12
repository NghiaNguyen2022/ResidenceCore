'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Clock, MapPin, Search, Sparkles } from 'lucide-react';

import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { EmptyState, ErrorState, LoadingState, StatusBadge } from '@/components/shared';
import { residenceMediumStyle } from '@/components/shared/styleMedium';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import { trpc } from '@/lib/trpc';

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

type ActivityType = (typeof ACTIVITY_TYPES)[number]['value'];
type ActivityStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

const ui = {
      statCard: "relative overflow-hidden rounded-[1.75rem] border border-amber-100/80 bg-[linear-gradient(135deg,#fffaf0_0%,#ffffff_56%,#fde68a_145%)] p-5 shadow-lg shadow-amber-950/10",
      statLabel: "text-xs font-black uppercase tracking-[0.18em] text-slate-500",
      statValue: "mt-3 text-3xl font-black tracking-tight text-slate-800",
      statIconBox: "absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-white/85 text-amber-700 shadow-sm",
      filterPanel: "rounded-[1.75rem] border border-amber-100/80 bg-white/85 p-4 shadow-lg shadow-amber-950/10",
      searchInput: "h-12 rounded-2xl border-slate-200 bg-white/90 text-base shadow-sm focus-visible:ring-amber-300",
      pill: "inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-amber-200 hover:text-amber-800",
      pillActive: "inline-flex h-10 items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 text-sm font-black text-amber-800 shadow-sm shadow-amber-950/5",
      section: "overflow-hidden rounded-[2rem] border border-amber-100/80 bg-white/88 shadow-xl shadow-amber-950/10",
      sectionHeader: "flex flex-col gap-3 border-b border-amber-100/70 bg-[linear-gradient(135deg,#fffaf0_0%,#ffffff_60%,#fffbeb_100%)] p-5 sm:p-6",
      eyebrow: "text-xs font-black uppercase tracking-[0.24em] text-slate-500",
      sectionTitle: "mt-2 text-3xl font-black tracking-tight text-slate-950",
      sectionSubtitle: "mt-1 text-sm leading-6 text-slate-600",
      sectionBody: "p-4 sm:p-5",
};

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
            <article className="group overflow-hidden rounded-[1.75rem] border border-amber-100/80 bg-white/90 shadow-sm shadow-amber-950/5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-950/10">
                  <div className="h-1 bg-gradient-to-r from-amber-200 via-orange-200 to-transparent" />
                  <div className="p-4 sm:p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                          <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-amber-700">
                                                <span>{typeMeta.icon}</span>
                                                {typeMeta.label}
                                          </span>
                                          <StatusBadge tone={getStatusTone(activity.status)}>{getStatusLabel(activity.status)}</StatusBadge>
                                    </div>
                                    <h2 className="mt-3 line-clamp-2 text-xl font-black tracking-tight text-slate-950">
                                          {activity.title}
                                    </h2>
                                    {(activity.ownerGroup || activity.description) && (
                                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                                                {activity.ownerGroup ? `Phụ trách: ${activity.ownerGroup}. ` : ''}
                                                {activity.description || ''}
                                          </p>
                                    )}
                              </div>

                              <div className="grid shrink-0 gap-2 text-sm text-slate-600 sm:min-w-[300px] sm:grid-cols-1">
                                    <span className="inline-flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2">
                                          <CalendarDays className="h-4 w-4 shrink-0 text-amber-600" />
                                          <span className="truncate font-semibold text-slate-700">{formatDate(activity.activityDate)}</span>
                                    </span>
                                    <span className="inline-flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2">
                                          <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                                          <span className="truncate font-semibold text-slate-700">{formatTimeRange(activity)}</span>
                                    </span>
                                    <span className="inline-flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2">
                                          <MapPin className="h-4 w-4 shrink-0 text-amber-600" />
                                          <span className="truncate font-semibold text-slate-700">{activity.location || 'Chưa ghi địa điểm'}</span>
                                    </span>
                              </div>
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
      const completedCount = activities.filter((item) => item.status === 'completed').length;

      return (
            <ResidenceCareLayout>
                  <div className={residenceMediumStyle.page}>
                        <span className={residenceMediumStyle.pageAura} />
                        <div className={residenceMediumStyle.standardPageContent}>
                              <div className={residenceMediumStyle.standardHeader}>
                                    <div className={residenceMediumStyle.standardHeaderAura} />
                                    <div className={residenceMediumStyle.standardHeaderInner}>
                                          <div className={residenceMediumStyle.standardHeaderTextWrap}>
                                                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700/80">Lưu xá của tôi</p>
                                                <h1 className={residenceMediumStyle.standardHeaderTitle}>Hoạt động công khai</h1>
                                                <p className={residenceMediumStyle.standardHeaderSubtitle}>
                                                      Theo dõi sinh hoạt, học tập, phục vụ và các sự kiện được lưu xá công khai cho học viên.
                                                </p>
                                          </div>
                                    </div>
                              </div>

                              <section className="grid gap-4 md:grid-cols-3">
                                    <div className={ui.statCard}>
                                          <div>
                                                <p className={ui.statLabel}>Tổng hoạt động</p>
                                                <p className={ui.statValue}>{activities.length}</p>
                                          </div>
                                          <div className={ui.statIconBox}><Sparkles className="h-5 w-5" /></div>
                                    </div>
                                    <div className={ui.statCard}>
                                          <div>
                                                <p className={ui.statLabel}>Sắp/đang diễn ra</p>
                                                <p className={ui.statValue}>{upcomingCount}</p>
                                          </div>
                                          <div className={ui.statIconBox}><CalendarDays className="h-5 w-5" /></div>
                                    </div>
                                    <div className={ui.statCard}>
                                          <div>
                                                <p className={ui.statLabel}>Đã diễn ra</p>
                                                <p className={ui.statValue}>{completedCount}</p>
                                          </div>
                                          <div className={ui.statIconBox}><Clock className="h-5 w-5" /></div>
                                    </div>
                              </section>

                              <section className={ui.filterPanel}>
                                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                                          <div className="relative min-w-0">
                                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <Input
                                                      value={search}
                                                      onChange={(event) => setSearch(event.target.value)}
                                                      placeholder="Tìm hoạt động, địa điểm, ban phụ trách..."
                                                      className={`${ui.searchInput} pl-10`}
                                                />
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                                <button
                                                      type="button"
                                                      onClick={() => setTypeFilter('all')}
                                                      className={typeFilter === 'all' ? ui.pillActive : ui.pill}
                                                >
                                                      Tất cả loại
                                                </button>
                                                {ACTIVITY_TYPES.map((type) => (
                                                      <button
                                                            key={type.value}
                                                            type="button"
                                                            onClick={() => setTypeFilter(type.value)}
                                                            className={typeFilter === type.value ? ui.pillActive : ui.pill}
                                                      >
                                                            <span>{type.icon}</span>
                                                            {type.label}
                                                      </button>
                                                ))}
                                          </div>
                                    </div>
                              </section>

                              <section className={ui.section}>
                                    <div className={ui.sectionHeader}>
                                          <div>
                                                <p className={ui.eyebrow}>Danh sách</p>
                                                <h2 className={ui.sectionTitle}>Hoạt động lưu xá</h2>
                                                <p className={ui.sectionSubtitle}>
                                                      {activities.length} hoạt động công khai theo bộ lọc hiện tại.
                                                </p>
                                          </div>
                                    </div>
                                    <div className={ui.sectionBody}>
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
                              </section>
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
