'use client';

import {
      Badge,
      getPreviewDateLabel,
} from '@/components/daily-routine/shared';

type PreviewItem = {
      date: string;
      canCreate: boolean;
      reason?: string;
      currentResidentCount?: number;
      minPersons?: number | null;
      maxPersons?: number | null;
};

type DutyPreviewBoxProps = {
      isEnabled: boolean;
      isLoading?: boolean;
      preview?: {
            canCreateCount: number;
            skippedCount: number;
            items: PreviewItem[];
      } | null;
};

export function DutyPreviewBox({
      isEnabled,
      isLoading,
      preview,
}: DutyPreviewBoxProps) {
      if (!isEnabled) return null;

      if (isLoading) {
            return (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
                        Đang kiểm tra lịch phân công...
                  </div>
            );
      }

      if (!preview) {
            return (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-sm text-slate-600">
                        Chọn công tác và đối tượng để xem trước các ngày sẽ tạo.
                  </div>
            );
      }

      const canCreateItems = preview.items.filter((item) => item.canCreate);
      const skippedItems = preview.items.filter((item) => !item.canCreate);

      const boxClass =
            preview.canCreateCount === 0
                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                  : preview.skippedCount > 0
                        ? 'border-amber-200 bg-amber-50/70 text-amber-800'
                        : 'border-emerald-100 bg-emerald-50 text-emerald-800';

      return (
            <div className={['rounded-xl border p-3 text-sm shadow-[0_10px_24px_rgba(120,53,15,0.04)]', boxClass].join(' ')}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">
                              Sẽ tạo {preview.canCreateCount} ngày
                              {preview.skippedCount > 0
                                    ? `, bỏ qua ${preview.skippedCount} ngày`
                                    : ''}
                        </p>

                        {preview.canCreateCount === 0 && (
                              <Badge className="border-rose-200 bg-white text-rose-700">
                                    Không có ngày hợp lệ
                              </Badge>
                        )}
                  </div>

                  {canCreateItems.length > 0 && (
                        <div className="mt-3">
                              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                                    Ngày sẽ tạo
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                    {canCreateItems.map((item) => (
                                          <Badge
                                                key={item.date}
                                                className="border-emerald-100 bg-white text-emerald-700"
                                          >
                                                {getPreviewDateLabel(item.date)}
                                          </Badge>
                                    ))}
                              </div>
                        </div>
                  )}

                  {skippedItems.length > 0 && (
                        <details className="mt-3">
                              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide opacity-80">
                                    Xem ngày bỏ qua
                              </summary>

                              <div className="mt-2 space-y-2">
                                    {skippedItems.map((item) => (
                                          <div
                                                key={item.date}
                                                className="rounded-xl bg-white/80 px-3 py-1.5 text-xs"
                                          >
                                                <span className="font-semibold">
                                                      {getPreviewDateLabel(item.date)}
                                                </span>
                                                <span className="mx-1">-</span>
                                                <span>
                                                      {item.reason || 'Không đủ điều kiện tạo'}
                                                </span>
                                          </div>
                                    ))}
                              </div>
                        </details>
                  )}
            </div>
      );
}

export default DutyPreviewBox;
