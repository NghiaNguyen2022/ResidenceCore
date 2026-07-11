import type { ReactNode } from 'react';
import { CalendarDays, Clock, Edit2, Eye, EyeOff, MapPin, Trash2, XCircle } from 'lucide-react';

import { formatDate } from '@/lib/format';
import { residenceMediumStyle } from '@/components/shared/styleMedium';
import { StatusBadge } from '@/components/shared';

import { formatTimeRange, getActivityTypeMeta, getStatusLabel, getStatusTone, type Activity } from './types';

function ActivityToolbarButton({
      children,
      tone = 'default',
      onClick,
}: {
      children: ReactNode;
      tone?: 'default' | 'danger';
      onClick: () => void;
}) {
      return (
            <button
                  type="button"
                  onClick={onClick}
                  className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition ${tone === 'danger'
                        ? 'border-red-100 bg-white text-red-600 hover:bg-red-50 hover:text-red-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50 hover:text-slate-950'
                        }`}
            >
                  {children}
            </button>
      );
}

export function ActivityRow({
      activity,
      onEdit,
      onCancel,
      onDelete,
}: {
      activity: Activity;
      onEdit: (activity: Activity) => void;
      onCancel: (activity: Activity) => void;
      onDelete: (activity: Activity) => void;
}) {
      const typeMeta = getActivityTypeMeta(activity.activityType);
      const isPublic = Boolean(activity.isPublicOnPortal);

      return (
            <div className="group relative overflow-hidden rounded-2xl border border-amber-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#fffdfa_100%)] px-4 py-3 shadow-[0_14px_34px_rgba(120,53,15,0.055)] transition hover:-translate-y-0.5 hover:border-amber-200/80 hover:shadow-[0_20px_44px_rgba(120,53,15,0.10)]">
                  <span className={residenceMediumStyle.premiumGoldBlackGlossThin} />
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-base ring-1 ring-amber-100">
                                          {typeMeta.icon}
                                    </span>
                                    <h3 className="min-w-0 flex-1 truncate text-[15px] font-black text-slate-950">{activity.title}</h3>
                                    <StatusBadge tone={getStatusTone(activity.status)}>{getStatusLabel(activity.status)}</StatusBadge>
                                    <span
                                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${isPublic
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                                                : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                                                }`}
                                    >
                                          {isPublic ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                          {isPublic ? 'Portal' : 'Nội bộ'}
                                    </span>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                                    <span className="inline-flex items-center gap-1.5">
                                          <CalendarDays className="h-3.5 w-3.5 text-amber-600" />
                                          {formatDate(activity.activityDate)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                                          {formatTimeRange(activity)}
                                    </span>
                                    <span className="inline-flex min-w-0 items-center gap-1.5">
                                          <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                          <span className="truncate">{activity.location || 'Chưa ghi địa điểm'}</span>
                                    </span>
                                    <span className="text-slate-400">{activity.code}</span>
                              </div>

                              {(activity.ownerGroup || activity.description) && (
                                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                                          {activity.ownerGroup ? <span className="font-semibold text-slate-700">{activity.ownerGroup}: </span> : null}
                                          {activity.description || 'Chưa có mô tả.'}
                                    </p>
                              )}
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 xl:justify-start">
                              <ActivityToolbarButton onClick={() => onEdit(activity)}>
                                    <Edit2 className="h-3.5 w-3.5" />
                                    Sửa
                              </ActivityToolbarButton>
                              {activity.status !== 'cancelled' && (
                                    <ActivityToolbarButton onClick={() => onCancel(activity)}>
                                          <XCircle className="h-3.5 w-3.5" />
                                          Hủy
                                    </ActivityToolbarButton>
                              )}
                              <ActivityToolbarButton tone="danger" onClick={() => onDelete(activity)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Xóa
                              </ActivityToolbarButton>
                        </div>
                  </div>
            </div>
      );
}
