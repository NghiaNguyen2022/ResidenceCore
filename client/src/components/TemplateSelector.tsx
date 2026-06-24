'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

import { trpc } from '@/lib/trpc';

export interface DutyTemplate {
      id: number;
      templateCode: string;
      templateName: string;
      dutyType: 'daily' | 'weekly' | 'monthly' | 'event';
      startTime: string | null;
      endTime: string | null;
      minPersons: number;
      maxPersons: number;
      description: string | null;
      isActive: boolean;
}

interface TemplateSelectorProps {
      onSelect: (template: DutyTemplate) => void;
      onCancel: () => void;
}

type DutyTemplateType = 'daily' | 'weekly' | 'monthly';

const DUTY_TYPE_OPTIONS: Array<{ value: DutyTemplateType; label: string }> = [
      { value: 'daily', label: 'Hằng ngày' },
      { value: 'weekly', label: 'Hằng tuần' },
      { value: 'monthly', label: 'Hằng tháng' },
];

function formatTimeText(value?: string | null) {
      if (!value) return '--:--';

      return String(value).slice(0, 5);
}

export default function TemplateSelector({ onSelect, onCancel }: TemplateSelectorProps) {
      const [dutyType, setDutyType] = useState<DutyTemplateType>('daily');
      const [selectedTemplate, setSelectedTemplate] = useState<DutyTemplate | null>(null);

      const { data: templates = [], isLoading } = trpc.duties.getTemplatesByType.useQuery({
            dutyType,
      });

      const handleSelect = () => {
            if (selectedTemplate) {
                  onSelect(selectedTemplate);
            }
      };

      return (
            <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/38 px-4 py-8 backdrop-blur-sm">
                  <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_72%,#fff8ef_100%)] shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
                        <div className="flex items-start justify-between gap-4 border-b border-amber-100/70 bg-white/92 px-5 py-4">
                              <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                                          Công tác mẫu
                                    </p>
                                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                          Chọn công tác mẫu
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Chọn mẫu có sẵn rồi điều chỉnh lại cho phù hợp với lịch thực tế.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={onCancel}
                                    className="rounded-xl border border-amber-100 bg-white px-2.5 py-2 text-slate-500 shadow-[0_4px_12px_rgba(120,53,15,0.035)] transition hover:bg-amber-50"
                              >
                                    <X className="h-4 w-4" />
                              </button>
                        </div>

                        <div className="space-y-4 px-5 py-4">
                              <div>
                                    <p className="mb-2 text-sm font-semibold text-slate-700">
                                          Loại công tác
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                          {DUTY_TYPE_OPTIONS.map((option) => (
                                                <button
                                                      key={option.value}
                                                      type="button"
                                                      onClick={() => {
                                                            setDutyType(option.value);
                                                            setSelectedTemplate(null);
                                                      }}
                                                      className={[
                                                            'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                                                            dutyType === option.value
                                                                  ? 'border-amber-200 bg-amber-50 text-amber-900 ring-1 ring-amber-100'
                                                                  : 'border-amber-100 bg-white/90 text-slate-600 hover:bg-amber-50',
                                                      ].join(' ')}
                                                >
                                                      {option.label}
                                                </button>
                                          ))}
                                    </div>
                              </div>

                              <div>
                                    <p className="mb-2 text-sm font-semibold text-slate-700">
                                          Danh sách mẫu
                                    </p>

                                    {isLoading ? (
                                          <div className="rounded-2xl border border-amber-100 bg-white/75 p-6 text-center text-sm text-slate-500">
                                                Đang tải mẫu công tác...
                                          </div>
                                    ) : templates.length === 0 ? (
                                          <div className="rounded-2xl border border-dashed border-amber-200 bg-white/65 p-6 text-center text-sm text-slate-500">
                                                Chưa có công tác mẫu thuộc loại này.
                                          </div>
                                    ) : (
                                          <div className="max-h-[310px] space-y-2 overflow-y-auto rounded-2xl border border-amber-100 bg-white/65 p-3">
                                                {templates.map((template) => {
                                                      const isSelected =
                                                            selectedTemplate?.id === template.id;

                                                      return (
                                                            <button
                                                                  key={template.id}
                                                                  type="button"
                                                                  onClick={() => setSelectedTemplate(template)}
                                                                  className={[
                                                                        'w-full rounded-xl border px-4 py-3 text-left transition',
                                                                        isSelected
                                                                              ? 'border-amber-200 bg-amber-50/75 shadow-[0_4px_14px_rgba(120,53,15,0.035)]'
                                                                              : 'border-amber-100 bg-white/90 hover:bg-amber-50/70',
                                                                  ].join(' ')}
                                                            >
                                                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                                        <div>
                                                                              <p className="font-semibold text-slate-900">
                                                                                    {template.templateName}
                                                                              </p>
                                                                              <p className="mt-1 text-xs text-slate-500">
                                                                                    {template.templateCode}
                                                                              </p>
                                                                        </div>

                                                                        <span className="rounded-full border border-amber-100 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800">
                                                                              {formatTimeText(template.startTime)} - {formatTimeText(template.endTime)}
                                                                        </span>
                                                                  </div>
                                                            </button>
                                                      );
                                                })}
                                          </div>
                                    )}
                              </div>

                              {selectedTemplate && (
                                    <div className="rounded-2xl border border-amber-100 bg-amber-50/45 p-4">
                                          <p className="font-semibold text-slate-900">
                                                {selectedTemplate.templateName}
                                          </p>
                                          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                                <p>
                                                      <span className="font-medium text-slate-700">Mã:</span>{' '}
                                                      {selectedTemplate.templateCode}
                                                </p>
                                                <p>
                                                      <span className="font-medium text-slate-700">Giờ:</span>{' '}
                                                      {formatTimeText(selectedTemplate.startTime)} - {formatTimeText(selectedTemplate.endTime)}
                                                </p>
                                                <p>
                                                      <span className="font-medium text-slate-700">Số người:</span>{' '}
                                                      {selectedTemplate.minPersons} - {selectedTemplate.maxPersons}
                                                </p>
                                                <p>
                                                      <span className="font-medium text-slate-700">Loại:</span>{' '}
                                                      {selectedTemplate.dutyType}
                                                </p>
                                          </div>
                                          {selectedTemplate.description && (
                                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                                      {selectedTemplate.description}
                                                </p>
                                          )}
                                    </div>
                              )}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-amber-100/70 bg-white/88 px-5 py-4">
                              <button
                                    type="button"
                                    onClick={onCancel}
                                    className="rounded-xl border border-amber-100 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-amber-50"
                              >
                                    Hủy
                              </button>
                              <button
                                    type="button"
                                    onClick={handleSelect}
                                    disabled={!selectedTemplate}
                                    className={[
                                          'rounded-xl border px-4 py-2 text-sm font-semibold transition',
                                          selectedTemplate
                                                ? 'border-amber-100 bg-amber-50 text-amber-900 hover:bg-amber-100'
                                                : 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400',
                                    ].join(' ')}
                              >
                                    Chọn mẫu
                              </button>
                        </div>
                  </div>
            </div>
      );
}
