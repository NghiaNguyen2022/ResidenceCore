'use client';

import { Edit2, Plus, Trash2 } from 'lucide-react';

import {
      Badge,
      EmptyState,
      SectionCard,
      TimeBox,
} from '@/components/daily-routine/shared';

type RoutineItemListProps = {
      currentTemplate?: any | null;
      items: any[];
      isLoading?: boolean;
      onCreateItem: () => void;
      onEditItem: (item: any) => void;
      onRemoveItem: (item: any) => void;
};

function getDayTypeLabel(dayType?: string | null) {
      if (dayType === 'sunday') return 'Chúa nhật';
      if (dayType === 'special') return 'Ngày đặc biệt';
      return 'Ngày thường';
}

export function RoutineItemList({
      currentTemplate,
      items,
      isLoading,
      onCreateItem,
      onEditItem,
      onRemoveItem,
}: RoutineItemListProps) {
      return (
            <SectionCard
                  title={currentTemplate?.name || 'Chưa chọn mẫu lịch'}
                  description={
                        currentTemplate
                              ? `${getDayTypeLabel(currentTemplate.dayType)} · ${currentTemplate.code}`
                              : 'Chọn một mẫu lịch ở bên trái để xem khung giờ.'
                  }
                  action={
                        <button
                              type="button"
                              onClick={onCreateItem}
                              disabled={!currentTemplate}
                              className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                              <Plus className="h-4 w-4" />
                              Thêm khung giờ
                        </button>
                  }
            >
                  {!currentTemplate ? (
                        <EmptyState
                              title="Chưa chọn mẫu lịch"
                              description="Chọn một mẫu lịch để quản lý các khung giờ sinh hoạt."
                        />
                  ) : isLoading ? (
                        <EmptyState
                              title="Đang tải khung giờ"
                              description="Vui lòng chờ trong giây lát."
                        />
                  ) : items.length === 0 ? (
                        <EmptyState
                              title="Chưa có khung giờ"
                              description="Thêm các hoạt động trong ngày cho mẫu lịch này."
                              action={
                                    <button
                                          type="button"
                                          onClick={onCreateItem}
                                          className="rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-200"
                                    >
                                          Thêm khung giờ
                                    </button>
                              }
                        />
                  ) : (
                        <div className="space-y-3">
                              {items.map((item: any) => (
                                    <div
                                          key={item.id}
                                          className={[
                                                'rounded-xl border p-3 shadow-[0_4px_12px_rgba(120,53,15,0.035)]',
                                                item.isActive
                                                      ? 'border-amber-100 bg-amber-50/60/70'
                                                      : 'border-amber-100 bg-amber-50/55 opacity-70',
                                          ].join(' ')}
                                    >
                                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="flex gap-4">
                                                      <TimeBox
                                                            startTime={item.startTime}
                                                            endTime={item.endTime}
                                                            className="min-w-[96px]"
                                                      />

                                                      <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                  <h3 className="font-bold text-slate-900">
                                                                        {item.title}
                                                                  </h3>

                                                                  <Badge
                                                                        className={
                                                                              item.isActive
                                                                                    ? 'border-green-100 bg-green-50 text-green-700'
                                                                                    : 'border-amber-100 bg-amber-50/55 text-slate-600'
                                                                        }
                                                                  >
                                                                        {item.isActive
                                                                              ? 'Đang áp dụng'
                                                                              : 'Ngừng dùng'}
                                                                  </Badge>
                                                            </div>

                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  {item.location || 'Chưa có địa điểm'}
                                                            </p>

                                                            {item.description && (
                                                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                        {item.description}
                                                                  </p>
                                                            )}
                                                      </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                                      <button
                                                            type="button"
                                                            onClick={() => onEditItem(item)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100 bg-white/88 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-amber-50"
                                                      >
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                            Sửa
                                                      </button>

                                                      <button
                                                            type="button"
                                                            onClick={() => onRemoveItem(item)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                                      >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Xóa
                                                      </button>
                                                </div>
                                          </div>
                                    </div>
                              ))}
                        </div>
                  )}
            </SectionCard>
      );
}

export default RoutineItemList;
