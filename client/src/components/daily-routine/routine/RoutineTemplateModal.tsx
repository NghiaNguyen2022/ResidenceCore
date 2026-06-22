'use client';

import { Save, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-700/40 px-4 py-6 backdrop-blur-sm">
                  <div className="w-full max-w-xl rounded-xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_72%,#fff7ed_100%)] p-3 shadow-[0_16px_40px_rgba(120,53,15,0.08)]">
                        <div className="mb-5 flex items-start justify-between">
                              <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                          {form.id ? 'Cập nhật mẫu lịch' : 'Thêm mẫu lịch'}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Thiết lập loại ngày và tên mẫu lịch sinh hoạt.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={() => onChange(null)}
                                    className="rounded-xl border border-amber-100 p-2 text-slate-500 hover:bg-amber-50"
                              >
                                    <X className="h-4 w-4" />
                              </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                              <label className="space-y-1.5">
                                    <Label>Mã mẫu lịch</Label>
                                    <Input
                                          value={form.code}
                                          onChange={(event) =>
                                                updateForm({ code: event.target.value })
                                          }
                                          placeholder="WEEKDAY_DEFAULT"
                                          className="rounded-xl"
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
                                          className="h-10 w-full rounded-xl border border-amber-100 bg-white/88 px-3 text-sm"
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
                                          className="rounded-xl"
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
                                          className="rounded-xl"
                                    />
                              </label>

                              <label className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2.5 text-sm text-slate-700">
                                    <input
                                          type="checkbox"
                                          checked={form.isActive}
                                          onChange={(event) =>
                                                updateForm({ isActive: event.target.checked })
                                          }
                                          className="h-4 w-4 rounded border-slate-300"
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
                                          className="min-h-[100px] rounded-xl"
                                    />
                              </label>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                              <button
                                    type="button"
                                    onClick={() => onChange(null)}
                                    className="rounded-xl border border-amber-100 bg-white/88 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-amber-50"
                              >
                                    Hủy
                              </button>

                              <button
                                    type="button"
                                    onClick={onSave}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-200 disabled:opacity-60"
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
