'use client';

import { Edit2, Plus, Trash2 } from 'lucide-react';

import {
      Badge,
      EmptyState,
      getDutyTypeLabel,
} from '@/components/daily-routine/shared';

type DutyTemplateDialogProps = {
      dutyConfigs: any[];
      isLoading?: boolean;
      isDeleting?: boolean;
      onClose: () => void;
      onCreate: () => void;
      onEdit: (duty: any) => void;
      onDelete: (duty: any) => void;
};

/**
 * TIME fields must be displayed as time-of-day, not DateTime.
 *
 * Backend/MySQL TIME may come as:
 * - "08:00"
 * - "08:00:00"
 * - Date object
 * - ISO string like "1970-01-01T08:00:00.000Z"
 *
 * For ISO/Date values, use UTC hours to preserve the stored TIME value and avoid
 * browser timezone shifting, e.g. 08:00 becoming 15:00 in Vietnam timezone.
 */
function formatTimeOnly(value: unknown) {
      if (!value) return '';

      if (typeof value === 'string') {
            const text = value.trim();

            if (!text) return '';

            // Normal TIME from MySQL: 08:00 or 08:00:00
            const timeMatch = text.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
            if (timeMatch) {
                  return `${timeMatch[1]}:${timeMatch[2]}`;
            }

            // ISO datetime string. Use UTC to avoid local timezone shifting.
            if (text.includes('T')) {
                  const date = new Date(text);

                  if (!Number.isNaN(date.getTime())) {
                        const hours = String(date.getUTCHours()).padStart(2, '0');
                        const minutes = String(date.getUTCMinutes()).padStart(2, '0');

                        return `${hours}:${minutes}`;
                  }
            }

            // Fallback for unexpected but readable values.
            return text.slice(0, 5);
      }

      if (value instanceof Date && !Number.isNaN(value.getTime())) {
            const hours = String(value.getUTCHours()).padStart(2, '0');
            const minutes = String(value.getUTCMinutes()).padStart(2, '0');

            return `${hours}:${minutes}`;
      }

      return String(value).slice(0, 5);
}

function getDutyTimeRange(duty: any) {
      const startTime = formatTimeOnly(duty?.startTime);
      const endTime = formatTimeOnly(duty?.endTime);

      if (!startTime && !endTime) return '';

      return `${startTime || '--:--'} - ${endTime || '--:--'}`;
}

export function DutyTemplateDialog({
      dutyConfigs,
      isLoading,
      isDeleting,
      onClose,
      onCreate,
      onEdit,
      onDelete,
}: DutyTemplateDialogProps) {
      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-700/40 px-4 py-6 backdrop-blur-sm">
                  <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_72%,#fff7ed_100%)] p-3 shadow-[0_16px_40px_rgba(120,53,15,0.08)]">
                        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                          Mẫu công tác
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Quản lý các mẫu công tác dùng lại khi phân công hằng ngày.
                                    </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                    <button
                                          type="button"
                                          onClick={onCreate}
                                          className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-200"
                                    >
                                          <Plus className="h-4 w-4" />
                                          Thêm mẫu
                                    </button>

                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className="rounded-xl border border-amber-100 bg-white/88 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-amber-50"
                                    >
                                          Đóng
                                    </button>
                              </div>
                        </div>

                        {isLoading ? (
                              <EmptyState
                                    title="Đang tải mẫu công tác"
                                    description="Vui lòng chờ trong giây lát."
                              />
                        ) : dutyConfigs.length === 0 ? (
                              <EmptyState
                                    title="Chưa có mẫu công tác"
                                    description="Thêm mẫu công tác để tạo phân công nhanh."
                                    action={
                                          <button
                                                type="button"
                                                onClick={onCreate}
                                                className="rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-200"
                                          >
                                                Thêm mẫu
                                          </button>
                                    }
                              />
                        ) : (
                              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {dutyConfigs.map((duty: any) => {
                                          const timeRange = getDutyTimeRange(duty);

                                          return (
                                                <div
                                                      key={duty.id}
                                                      className="rounded-xl border border-amber-100 bg-amber-50/60/70 p-3 shadow-[0_4px_12px_rgba(120,53,15,0.035)]"
                                                >
                                                      <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                  <p className="font-bold text-slate-900">
                                                                        {duty.dutyName}
                                                                  </p>
                                                                  <p className="mt-1 text-xs text-slate-500">
                                                                        {duty.dutyCode}
                                                                  </p>
                                                            </div>

                                                            <Badge className="border-amber-100 bg-amber-50 text-amber-800">
                                                                  {getDutyTypeLabel(duty.dutyType)}
                                                            </Badge>
                                                      </div>

                                                      {duty.description && (
                                                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                                                  {duty.description}
                                                            </p>
                                                      )}

                                                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                                                            {timeRange && (
                                                                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                                                                        {timeRange}
                                                                  </span>
                                                            )}

                                                            {(duty.minPersons || duty.maxPersons) && (
                                                                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                                                                        Số người: {duty.minPersons || 0}
                                                                        {duty.maxPersons
                                                                              ? ` - ${duty.maxPersons}`
                                                                              : '+'}
                                                                  </span>
                                                            )}

                                                            <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                                                                  {duty.isActive === false
                                                                        ? 'Ngừng dùng'
                                                                        : 'Đang dùng'}
                                                            </span>
                                                      </div>

                                                      <div className="mt-4 flex flex-wrap gap-2">
                                                            <button
                                                                  type="button"
                                                                  onClick={() => onEdit(duty)}
                                                                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100 bg-white/88 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-amber-50"
                                                            >
                                                                  <Edit2 className="h-3.5 w-3.5" />
                                                                  Sửa
                                                            </button>

                                                            <button
                                                                  type="button"
                                                                  onClick={() => onDelete(duty)}
                                                                  disabled={isDeleting}
                                                                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                  <Trash2 className="h-3.5 w-3.5" />
                                                                  Xóa
                                                            </button>
                                                      </div>
                                                </div>
                                          );
                                    })}
                              </div>
                        )}
                  </div>
            </div>
      );
}

export default DutyTemplateDialog;