'use client';

import { Save, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { residenceMediumStyle } from '@/components/shared/styleMedium';

type DayType = 'weekday' | 'sunday' | 'special';

type TemplateForm = {
      id?: number;
      code: string;
      name: string;
      dayType: DayType;
      description: string;
      isActive: boolean;
      sortOrder: string;
};

type RoutineTemplateModalProps = {
      form: TemplateForm;
      onChange: (form: TemplateForm | null) => void;
      onSave: () => void;
      isSaving?: boolean;
};

const inputClass =
      'h-10 rounded-xl border-amber-100 bg-white/90 text-sm shadow-[0_8px_18px_rgba(120,53,15,0.045)] focus-visible:ring-amber-100';
const selectClass =
      'h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.045)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100';

export function RoutineTemplateModal({
      form,
      onChange,
      onSave,
      isSaving,
}: RoutineTemplateModalProps) {
      const updateForm = (patch: Partial<TemplateForm>) => {
            onChange({
                  ...form,
                  ...patch,
            });
      };

      return (
            <div className={residenceMediumStyle.modalOverlay}>
                  <div className={`${residenceMediumStyle.modalShell} max-w-xl`}>
                        <div className={residenceMediumStyle.modalHeader}>
                              <div>
                                    <p className={residenceMediumStyle.modalEyebrow}>Mẫu lịch</p>
                                    <h2 className={residenceMediumStyle.modalTitle}>
                                          {form.id ? 'Cập nhật mẫu lịch' : 'Thêm mẫu lịch'}
                                    </h2>
                                    <p className={residenceMediumStyle.modalSubtitle}>
                                          Thiết lập loại ngày và tên mẫu lịch sinh hoạt.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={() => onChange(null)}
                                    className="rounded-xl border border-amber-100 bg-white/90 p-2 text-slate-500 transition hover:bg-amber-50/70"
                              >
                                    <X className="h-4 w-4" />
                              </button>
                        </div>

                        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
                              <label className="space-y-1.5">
                                    <Label>Mã mẫu lịch</Label>
                                    <Input
                                          value={form.code}
                                          onChange={(event) =>
                                                updateForm({ code: event.target.value })
                                          }
                                          placeholder="WEEKDAY_DEFAULT"
                                          className={inputClass}
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Loại ngày</Label>
                                    <select
                                          value={form.dayType}
                                          onChange={(event) =>
                                                updateForm({
                                                      dayType: event.target.value as DayType,
                                                })
                                          }
                                          className={selectClass}
                                    >
                                          <option value="weekday">Ngày thường</option>
                                          <option value="sunday">Chúa nhật</option>
                                          <option value="special">Ngày đặc biệt</option>
                                    </select>
                              </label>

                              <label className="space-y-1.5 md:col-span-2">
                                    <Label>Tên mẫu lịch</Label>
                                    <Input
                                          value={form.name}
                                          onChange={(event) =>
                                                updateForm({ name: event.target.value })
                                          }
                                          placeholder="Lịch ngày thường"
                                          className={inputClass}
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Thứ tự</Label>
                                    <Input
                                          type="number"
                                          value={form.sortOrder}
                                          onChange={(event) =>
                                                updateForm({ sortOrder: event.target.value })
                                          }
                                          className={inputClass}
                                    />
                              </label>

                              <label className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white/80 px-4 py-3 text-sm text-slate-700">
                                    <input
                                          type="checkbox"
                                          checked={form.isActive}
                                          onChange={(event) =>
                                                updateForm({ isActive: event.target.checked })
                                          }
                                          className="h-4 w-4 rounded border-amber-200"
                                    />
                                    Đang áp dụng
                              </label>

                              <label className="space-y-1.5 md:col-span-2">
                                    <Label>Ghi chú</Label>
                                    <Textarea
                                          value={form.description}
                                          onChange={(event) =>
                                                updateForm({ description: event.target.value })
                                          }
                                          placeholder="Mô tả ngắn cho mẫu lịch"
                                          className="min-h-[100px] rounded-xl border-amber-100 bg-white/90 text-sm shadow-[0_8px_18px_rgba(120,53,15,0.045)] focus-visible:ring-amber-100"
                                    />
                              </label>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-amber-100/80 px-5 py-4">
                              <button
                                    type="button"
                                    onClick={() => onChange(null)}
                                    className="rounded-xl border border-amber-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-amber-50/70"
                              >
                                    Hủy
                              </button>

                              <button
                                    type="button"
                                    onClick={onSave}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#17335f] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(23,51,95,0.16)] transition hover:bg-[#244878] disabled:opacity-60"
                              >
                                    <Save className="h-4 w-4" />
                                    Lưu
                              </button>
                        </div>
                  </div>
            </div>
      );
}

export default RoutineTemplateModal;
