'use client';

import { Edit2, Search, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Badge, EmptyState, SectionCard } from '@/components/daily-routine/shared';

type DayTypeFilter = 'all' | 'weekday' | 'sunday' | 'special';

type RoutineTemplateListProps = {
      templates: any[];
      currentTemplate?: any | null;
      isLoading?: boolean;
      searchTerm: string;
      onSearchTermChange: (value: string) => void;
      dayTypeFilter: DayTypeFilter;
      onDayTypeFilterChange: (value: DayTypeFilter) => void;
      onSelectTemplate: (templateId: number) => void;
      onCreateTemplate: () => void;
      onEditTemplate: (template: any) => void;
      onRemoveTemplate: (template: any) => void;
};

function getDayTypeLabel(dayType?: string | null) {
      if (dayType === 'sunday') return 'Chúa nhật';
      if (dayType === 'special') return 'Ngày đặc biệt';
      return 'Ngày thường';
}

function getDayTypeClass(dayType?: string | null) {
      if (dayType === 'sunday') return 'border-purple-100 bg-purple-50 text-purple-700';
      if (dayType === 'special') return 'border-amber-100 bg-amber-50 text-amber-700';
      return 'border-amber-100 bg-amber-50 text-amber-800';
}

export function RoutineTemplateList({
      templates,
      currentTemplate,
      isLoading,
      searchTerm,
      onSearchTermChange,
      dayTypeFilter,
      onDayTypeFilterChange,
      onSelectTemplate,
      onCreateTemplate,
      onEditTemplate,
      onRemoveTemplate,
}: RoutineTemplateListProps) {
      return (
            <SectionCard
                  title="Mẫu lịch sinh hoạt"
                  description="Chọn mẫu lịch để xem và sắp xếp các khung giờ."
                  action={
                        <button
                              type="button"
                              onClick={onCreateTemplate}
                              className="rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-200"
                        >
                              Thêm mẫu
                        </button>
                  }
            >
                  <div className="mb-4 space-y-3">
                        <div className="relative">
                              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <Input
                                    value={searchTerm}
                                    onChange={(event) =>
                                          onSearchTermChange(event.target.value)
                                    }
                                    placeholder="Tìm mẫu lịch..."
                                    className="rounded-xl pl-9"
                              />
                        </div>

                        <select
                              value={dayTypeFilter}
                              onChange={(event) =>
                                    onDayTypeFilterChange(event.target.value as DayTypeFilter)
                              }
                              className="h-10 w-full rounded-xl border border-amber-100 bg-white/88 px-3 text-sm"
                        >
                              <option value="all">Tất cả loại ngày</option>
                              <option value="weekday">Ngày thường</option>
                              <option value="sunday">Chúa nhật</option>
                              <option value="special">Ngày đặc biệt</option>
                        </select>
                  </div>

                  {isLoading ? (
                        <EmptyState
                              title="Đang tải mẫu lịch"
                              description="Vui lòng chờ trong giây lát."
                        />
                  ) : templates.length === 0 ? (
                        <EmptyState
                              title="Chưa có mẫu lịch"
                              description="Thêm mẫu lịch để bắt đầu thiết lập lịch sinh hoạt."
                              action={
                                    <button
                                          type="button"
                                          onClick={onCreateTemplate}
                                          className="rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-200"
                                    >
                                          Thêm mẫu lịch
                                    </button>
                              }
                        />
                  ) : (
                        <div className="space-y-3">
                              {templates.map((template: any) => {
                                    const isSelected = currentTemplate?.id === template.id;

                                    return (
                                          <button
                                                type="button"
                                                key={template.id}
                                                onClick={() => onSelectTemplate(template.id)}
                                                className={[
                                                      'w-full rounded-xl border p-3 text-left transition',
                                                      isSelected
                                                            ? 'border-amber-200 bg-amber-50/70 shadow-[0_4px_12px_rgba(120,53,15,0.035)]'
                                                            : 'border-amber-100 bg-white/88 hover:border-amber-200 hover:bg-amber-50',
                                                ].join(' ')}
                                          >
                                                <div className="flex items-start justify-between gap-3">
                                                      <div>
                                                            <p className="font-bold text-slate-900">
                                                                  {template.name}
                                                            </p>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                  {template.code}
                                                            </p>
                                                      </div>

                                                      <Badge className={getDayTypeClass(template.dayType)}>
                                                            {getDayTypeLabel(template.dayType)}
                                                      </Badge>
                                                </div>

                                                {template.description && (
                                                      <p className="mt-3 text-sm leading-6 text-slate-500">
                                                            {template.description}
                                                      </p>
                                                )}

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                      <button
                                                            type="button"
                                                            onClick={(event) => {
                                                                  event.stopPropagation();
                                                                  onEditTemplate(template);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100 bg-white/88 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-amber-50"
                                                      >
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                            Sửa
                                                      </button>

                                                      <button
                                                            type="button"
                                                            onClick={(event) => {
                                                                  event.stopPropagation();
                                                                  onRemoveTemplate(template);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                                      >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Xóa
                                                      </button>
                                                </div>
                                          </button>
                                    );
                              })}
                        </div>
                  )}
            </SectionCard>
      );
}

export default RoutineTemplateList;
