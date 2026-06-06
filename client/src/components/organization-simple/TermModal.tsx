import { X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import type { TermForm, TermStatus } from './types';

type TermModalProps = {
      termForm: TermForm;
      onChange: (form: TermForm) => void;
      onClose: () => void;
      onSave: () => void;
};

export function TermModal({
      termForm,
      onChange,
      onClose,
      onSave,
}: TermModalProps) {
      const updateForm = (changes: Partial<TermForm>) => {
            onChange({
                  ...termForm,
                  ...changes,
            });
      };

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 px-4 py-6 backdrop-blur-sm">
                  <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl">
                        <div className="mb-5 flex items-start justify-between">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-950">
                                          {termForm.id ? 'Cập nhật nhiệm kỳ' : 'Thêm nhiệm kỳ'}
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                          Quản lý thời gian và trạng thái nhiệm kỳ tổ chức.
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
                                    <Label>Mã nhiệm kỳ</Label>
                                    <Input
                                          value={termForm.code}
                                          onChange={(event) =>
                                                updateForm({
                                                      code: event.target.value,
                                                })
                                          }
                                          className="rounded-2xl"
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Trạng thái</Label>
                                    <select
                                          value={termForm.status}
                                          onChange={(event) =>
                                                updateForm({
                                                      status: event.target.value as TermStatus,
                                                })
                                          }
                                          className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
                                    >
                                          <option value="inactive">Chưa kích hoạt</option>
                                          <option value="active">Đang áp dụng</option>
                                          <option value="closed">Đã kết thúc</option>
                                    </select>
                              </label>

                              <label className="space-y-1.5 md:col-span-2">
                                    <Label>Tên nhiệm kỳ</Label>
                                    <Input
                                          value={termForm.name}
                                          onChange={(event) =>
                                                updateForm({
                                                      name: event.target.value,
                                                })
                                          }
                                          className="rounded-2xl"
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Ngày bắt đầu</Label>
                                    <Input
                                          type="date"
                                          value={termForm.startDate}
                                          onChange={(event) =>
                                                updateForm({
                                                      startDate: event.target.value,
                                                })
                                          }
                                          className="rounded-2xl"
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Ngày kết thúc</Label>
                                    <Input
                                          type="date"
                                          value={termForm.endDate}
                                          onChange={(event) =>
                                                updateForm({
                                                      endDate: event.target.value,
                                                })
                                          }
                                          className="rounded-2xl"
                                    />
                              </label>

                              <label className="space-y-1.5 md:col-span-2">
                                    <Label>Ghi chú</Label>
                                    <Textarea
                                          value={termForm.description}
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
