'use client';

import { Save, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { residenceMediumStyle } from '@/components/shared/styleMedium';

type ItemForm = {
      id?: number;
      templateId: string;
      startTime: string;
      endTime: string;
      title: string;
      location: string;
      description: string;
      isActive: boolean;
      sortOrder: string;
};

type RoutineItemModalProps = {
      form: ItemForm;
      templates: any[];
      onChange: (form: ItemForm | null) => void;
      onSave: () => void;
      isSaving?: boolean;
};

const inputClass =
      'h-10 rounded-xl border-amber-100 bg-white/90 text-sm shadow-[0_8px_18px_rgba(120,53,15,0.045)] focus-visible:ring-amber-100';
const selectClass =
      'h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.045)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100';

export function RoutineItemModal({
      form,
      templates,
      onChange,
      onSave,
      isSaving,
}: RoutineItemModalProps) {
      const updateForm = (patch: Partial<ItemForm>) => {
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
                                    <p className={residenceMediumStyle.modalEyebrow}>Khung giờ</p>
                                    <h2 className={residenceMediumStyle.modalTitle}>
                                          {form.id ? 'Cập nhật khung giờ' : 'Thêm khung giờ'}
                                    </h2>
                                    <p className={residenceMediumStyle.modalSubtitle}>
                                          Thiết lập thời gian, địa điểm và nội dung sinh hoạt.
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
                              <label className="space-y-1.5 md:col-span-2">
                                    <Label>Mẫu lịch</Label>
                                    <select
                                          value={form.templateId}
                                          onChange={(event) =>
                                                updateForm({ templateId: event.target.value })
                                          }
                                          className={selectClass}
                                    >
                                          <option value="">Chọn mẫu lịch</option>
                                          {templates.map((template: any) => (
                                                <option key={template.id} value={template.id}>
                                                      {template.name}
                                                </option>
                                          ))}
                                    </select>
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Giờ bắt đầu</Label>
                                    <Input
                                          type="time"
                                          value={form.startTime}
                                          onChange={(event) =>
                                                updateForm({ startTime: event.target.value })
                                          }
                                          className={inputClass}
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
                                          className={inputClass}
                                    />
                              </label>

                              <label className="space-y-1.5 md:col-span-2">
                                    <Label>Tên hoạt động</Label>
                                    <Input
                                          value={form.title}
                                          onChange={(event) =>
                                                updateForm({ title: event.target.value })
                                          }
                                          placeholder="Giờ học bài"
                                          className={inputClass}
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Địa điểm</Label>
                                    <Input
                                          value={form.location}
                                          onChange={(event) =>
                                                updateForm({ location: event.target.value })
                                          }
                                          placeholder="Phòng sinh hoạt"
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
                                          placeholder="Mô tả ngắn cho khung giờ"
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

export default RoutineItemModal;
