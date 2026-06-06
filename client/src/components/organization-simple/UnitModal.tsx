import { X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import type { UnitForm, UnitType } from './types';

type UnitModalProps = {
      unitForm: UnitForm;
      onChange: (form: UnitForm) => void;
      onClose: () => void;
      onSave: () => void;
};

export function UnitModal({
      unitForm,
      onChange,
      onClose,
      onSave,
}: UnitModalProps) {
      const updateForm = (changes: Partial<UnitForm>) => {
            onChange({
                  ...unitForm,
                  ...changes,
            });
      };

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 px-4 py-6 backdrop-blur-sm">
                  <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl">
                        <div className="mb-5 flex items-start justify-between">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-950">
                                          {unitForm.id ? 'Cập nhật Tổ/Ban' : 'Thêm Tổ/Ban'}
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                          Quản lý đơn vị phụ trách trong lưu xá.
                                    </p>
                              </div>
                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50"
                              >
                                    <X className="h-4 w-4" />
                              </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                              <label className="space-y-1.5">
                                    <Label>Mã</Label>
                                    <Input
                                          value={unitForm.code}
                                          onChange={(event) =>
                                                updateForm({
                                                      code: event.target.value,
                                                })
                                          }
                                          className="rounded-2xl"
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Loại</Label>
                                    <select
                                          value={unitForm.unitType}
                                          onChange={(event) =>
                                                updateForm({
                                                      unitType: event.target.value as UnitType,
                                                })
                                          }
                                          className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
                                    >
                                          <option value="team">Tổ</option>
                                          <option value="committee">Ban</option>
                                    </select>
                              </label>

                              <label className="space-y-1.5 md:col-span-2">
                                    <Label>Tên</Label>
                                    <Input
                                          value={unitForm.name}
                                          onChange={(event) =>
                                                updateForm({
                                                      name: event.target.value,
                                                })
                                          }
                                          className="rounded-2xl"
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Thứ tự</Label>
                                    <Input
                                          value={unitForm.sortOrder}
                                          onChange={(event) =>
                                                updateForm({
                                                      sortOrder: event.target.value,
                                                })
                                          }
                                          className="rounded-2xl"
                                    />
                              </label>

                              <label className="flex items-center gap-2 pt-7 text-sm font-semibold text-neutral-700">
                                    <input
                                          type="checkbox"
                                          checked={unitForm.isActive}
                                          onChange={(event) =>
                                                updateForm({
                                                      isActive: event.target.checked,
                                                })
                                          }
                                          className="h-4 w-4 rounded border-neutral-300"
                                    />
                                    Đang sử dụng
                              </label>

                              <label className="space-y-1.5 md:col-span-2">
                                    <Label>Ghi chú</Label>
                                    <Textarea
                                          value={unitForm.description}
                                          onChange={(event) =>
                                                updateForm({
                                                      description: event.target.value,
                                                })
                                          }
                                          rows={3}
                                          className="rounded-2xl"
                                    />
                              </label>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                              >
                                    Hủy
                              </button>
                              <button
                                    type="button"
                                    onClick={onSave}
                                    className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                              >
                                    Lưu
                              </button>
                        </div>
                  </div>
            </div>
      );
}
