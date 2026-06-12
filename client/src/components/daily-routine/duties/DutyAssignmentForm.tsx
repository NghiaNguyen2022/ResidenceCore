'use client';

import { Users } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DutyPreviewBox from './DutyPreviewBox';

type AssignToType = 'resident' | 'team' | 'room' | 'committee';

type AssignmentForm = {
      dutyConfigId: string;
      assignedDate: string;
      startTime: string;
      endTime: string;
      assignedToType: AssignToType;
      assignedToId: string;
      assignWholeWeek: boolean;
      notes: string;
};

type DutyAssignmentFormProps = {
      form: AssignmentForm;
      onChange: (form: AssignmentForm) => void;

      dutyConfigs: any[];
      selectedDutyConfig?: any | null;
      assigneeOptions: Array<{ id: number | string; label: string }>;

      previewEnabled: boolean;
      previewLoading?: boolean;
      preview?: {
            canCreateCount: number;
            skippedCount: number;
            items: Array<{
                  date: string;
                  canCreate: boolean;
                  reason?: string;
                  currentResidentCount?: number;
                  minPersons?: number | null;
                  maxPersons?: number | null;
            }>;
      } | null;

      isSaving?: boolean;
      onSave: () => void;
      onOpenDutyTemplateDialog: () => void;
};

function formatTime(value?: string | Date | null) {
      if (!value) return '';

      if (typeof value === 'string') {
            const text = value.trim();

            if (!text) return '';

            const timeMatch = text.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
            if (timeMatch) {
                  return `${timeMatch[1]}:${timeMatch[2]}`;
            }

            if (text.includes('T')) {
                  const date = new Date(text);

                  if (!Number.isNaN(date.getTime())) {
                        const hours = String(date.getUTCHours()).padStart(2, '0');
                        const minutes = String(date.getUTCMinutes()).padStart(2, '0');

                        return `${hours}:${minutes}`;
                  }
            }

            if (text.includes(' ')) {
                  const timePart = text.split(' ')[1] || '';
                  const timePartMatch = timePart.match(/^(\d{2}):(\d{2})/);

                  if (timePartMatch) {
                        return `${timePartMatch[1]}:${timePartMatch[2]}`;
                  }
            }

            return text.slice(0, 5);
      }

      if (value instanceof Date && !Number.isNaN(value.getTime())) {
            const hours = String(value.getUTCHours()).padStart(2, '0');
            const minutes = String(value.getUTCMinutes()).padStart(2, '0');

            return `${hours}:${minutes}`;
      }

      return String(value).slice(0, 5);
}

export function DutyAssignmentForm({
      form,
      onChange,
      dutyConfigs,
      selectedDutyConfig,
      assigneeOptions,
      previewEnabled,
      previewLoading,
      preview,
      isSaving,
      onSave,
      onOpenDutyTemplateDialog,
}: DutyAssignmentFormProps) {
      const updateForm = (patch: Partial<AssignmentForm>) => {
            onChange({
                  ...form,
                  ...patch,
            });
      };

      const saveText = isSaving
            ? 'Đang lưu...'
            : preview?.canCreateCount
                  ? `Lưu ${preview.canCreateCount} ngày`
                  : 'Lưu phân công';

      return (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                              <h2 className="text-xl font-bold text-slate-950">
                                    Tạo phân công
                              </h2>
                              <p className="mt-1 text-sm text-slate-500">
                                    Giao công tác nhanh cho học viên, Tổ, phòng ngủ hoặc Ban.
                              </p>
                        </div>

                        <button
                              type="button"
                              onClick={onOpenDutyTemplateDialog}
                              className="shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                              Mẫu công tác
                        </button>
                  </div>

                  <div className="space-y-4">
                        <label className="space-y-1.5">
                              <Label>Ngày công tác</Label>
                              <Input
                                    type="date"
                                    value={form.assignedDate}
                                    onChange={(event) =>
                                          updateForm({ assignedDate: event.target.value })
                                    }
                                    className="rounded-2xl"
                              />
                        </label>

                        <label className="space-y-1.5">
                              <Label>Công tác</Label>
                              <select
                                    value={form.dutyConfigId}
                                    onChange={(event) => {
                                          const duty = dutyConfigs.find(
                                                (item: any) =>
                                                      String(item.id) === event.target.value
                                          );

                                          updateForm({
                                                dutyConfigId: event.target.value,
                                                startTime: formatTime(duty?.startTime),
                                                endTime: formatTime(duty?.endTime),
                                                assignWholeWeek: duty?.dutyType === 'daily',
                                          });
                                    }}
                                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                              >
                                    <option value="">Chọn công tác</option>
                                    {dutyConfigs.map((duty: any) => (
                                          <option key={duty.id} value={duty.id}>
                                                {duty.dutyName}
                                          </option>
                                    ))}
                              </select>
                        </label>

                        {selectedDutyConfig?.dutyType === 'daily' && (
                              <label className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                    <input
                                          type="checkbox"
                                          checked={form.assignWholeWeek}
                                          onChange={(event) =>
                                                updateForm({
                                                      assignWholeWeek: event.target.checked,
                                                })
                                          }
                                          className="mt-1 h-4 w-4 rounded border-blue-300"
                                    />
                                    <span>
                                          <span className="font-semibold">
                                                Gán nguyên tuần
                                          </span>
                                          <span className="mt-1 block text-xs leading-5">
                                                Áp dụng cho tuần từ thứ Hai đến Chúa nhật của ngày đã chọn.
                                          </span>
                                    </span>
                              </label>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                              <label className="space-y-1.5">
                                    <Label>Giờ bắt đầu</Label>
                                    <Input
                                          type="time"
                                          value={form.startTime}
                                          onChange={(event) =>
                                                updateForm({ startTime: event.target.value })
                                          }
                                          className="rounded-2xl"
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Giờ kết thúc</Label>
                                    <Input
                                          type="time"
                                          value={form.endTime}
                                          onChange={(event) =>
                                                updateForm({ endTime: event.target.value })
                                          }
                                          className="rounded-2xl"
                                    />
                              </label>
                        </div>

                        <label className="space-y-1.5">
                              <Label>Giao cho</Label>
                              <select
                                    value={form.assignedToType}
                                    onChange={(event) =>
                                          updateForm({
                                                assignedToType: event.target.value as AssignToType,
                                                assignedToId: '',
                                          })
                                    }
                                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                              >
                                    <option value="resident">Học viên</option>
                                    <option value="team">Tổ</option>
                                    <option value="room">Phòng</option>
                                    <option value="committee">Ban</option>
                              </select>
                        </label>

                        <label className="space-y-1.5">
                              <Label>Đối tượng</Label>
                              <select
                                    value={form.assignedToId}
                                    onChange={(event) =>
                                          updateForm({ assignedToId: event.target.value })
                                    }
                                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                              >
                                    <option value="">Chọn đối tượng</option>
                                    {assigneeOptions.map((option) => (
                                          <option key={option.id} value={option.id}>
                                                {option.label}
                                          </option>
                                    ))}
                              </select>
                        </label>

                        <label className="space-y-1.5">
                              <Label>Ghi chú</Label>
                              <Textarea
                                    value={form.notes}
                                    onChange={(event) =>
                                          updateForm({ notes: event.target.value })
                                    }
                                    placeholder="Ghi chú thêm nếu cần"
                                    className="min-h-[80px] rounded-2xl"
                              />
                        </label>

                        <DutyPreviewBox
                              isEnabled={previewEnabled}
                              isLoading={previewLoading}
                              preview={preview}
                        />

                        <button
                              type="button"
                              onClick={onSave}
                              disabled={
                                    isSaving ||
                                    previewLoading ||
                                    (previewEnabled && preview?.canCreateCount === 0)
                              }
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                              <Users className="h-4 w-4" />
                              {saveText}
                        </button>
                  </div>
            </div>
      );
}

export default DutyAssignmentForm;
