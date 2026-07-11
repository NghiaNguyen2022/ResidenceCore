import type { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TimePickerInput } from '@/components/shared/form/TimePickerInput';
import { AppModal, FormDateInput, FormField } from '@/components/shared';

import { ACTIVITY_STATUS_OPTIONS, ACTIVITY_TYPE_OPTIONS, normalizeCode, type Activity, type ActivityForm, type ActivityStatus, type ActivityType } from './types';

const modalInputClass =
      'h-11 rounded-2xl border-slate-200 bg-white/95 text-[15px] shadow-[0_10px_24px_rgba(15,23,42,0.055)] focus-visible:border-amber-300 focus-visible:ring-amber-200';
const modalSelectClass =
      'h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white/95 px-4 pr-10 text-[15px] font-semibold text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.055)] outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200/70';
const modalTextareaClass =
      'min-h-[78px] rounded-2xl border-slate-200 bg-white/95 text-[15px] shadow-[0_10px_24px_rgba(15,23,42,0.055)] focus-visible:border-amber-300 focus-visible:ring-amber-200';

function ModalSelectField<T extends string>({
      label,
      value,
      options,
      onChange,
      className = '',
}: {
      label: string;
      value: T;
      options: Array<{ value: T; label: string }>;
      onChange: (value: T) => void;
      className?: string;
}) {
      return (
            <FormField label={label} className={className}>
                  <div className="relative">
                        <select value={value} onChange={(event) => onChange(event.target.value as T)} className={modalSelectClass}>
                              {options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                          {option.label}
                                    </option>
                              ))}
                        </select>
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">⌄</span>
                  </div>
            </FormField>
      );
}

export function ActivityFormModal({
      open,
      editingActivity,
      form,
      formError,
      isSaving,
      setForm,
      onClose,
      onSave,
}: {
      open: boolean;
      editingActivity: Activity | null;
      form: ActivityForm;
      formError: string | null;
      isSaving: boolean;
      setForm: Dispatch<SetStateAction<ActivityForm>>;
      onClose: () => void;
      onSave: () => void;
}) {
      return (
            <>
                  <style>{`
                        .activity-modal-date-field input,
                        .activity-modal-date-field button,
                        .activity-modal-time-field input,
                        .activity-modal-time-field button {
                              min-width: 0;
                        }
                        .activity-modal-date-field > *,
                        .activity-modal-time-field > * {
                              width: 100%;
                        }
                  `}</style>

                  <AppModal
                        open={open}
                        onOpenChange={(nextOpen) => !nextOpen && onClose()}
                        title={editingActivity ? 'Sửa hoạt động' : 'Tạo hoạt động mới'}
                        description="Giữ thông tin gọn để demo, có thể mở rộng đăng ký/điểm danh sau."
                        size="lg"
                        footer={
                              <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                                    <Button variant="outline" className="h-10 rounded-2xl px-4 font-bold" onClick={onClose} disabled={isSaving}>
                                          Hủy
                                    </Button>
                                    <Button
                                          className="h-10 rounded-2xl bg-slate-950 px-5 font-bold text-white hover:bg-slate-800"
                                          onClick={onSave}
                                          disabled={isSaving}
                                    >
                                          {isSaving ? 'Đang lưu...' : editingActivity ? 'Cập nhật' : 'Tạo hoạt động'}
                                    </Button>
                              </div>
                        }
                  >
                        <div className="space-y-4">
                              {formError && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{formError}</div>}

                              <div className="rounded-3xl border border-amber-100/70 bg-gradient-to-br from-white via-amber-50/25 to-slate-50/80 p-4 shadow-inner shadow-white/80 ring-1 ring-white/80">
                                    <div className="grid gap-4 lg:grid-cols-12">
                                          {!editingActivity && (
                                                <FormField label="Mã hoạt động" required className="min-w-0 lg:col-span-4">
                                                      <Input
                                                            value={form.code}
                                                            onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                                                            onBlur={() => setForm((prev) => ({ ...prev, code: normalizeCode(prev.code) }))}
                                                            placeholder="VD: SINH-HOAT-07"
                                                            className={modalInputClass}
                                                      />
                                                </FormField>
                                          )}

                                          <FormField label="Tên hoạt động" required className={editingActivity ? 'min-w-0 lg:col-span-12' : 'min-w-0 lg:col-span-8'}>
                                                <Input
                                                      value={form.title}
                                                      onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                                                      placeholder="VD: Sinh hoạt cộng đoàn tháng 7"
                                                      className={modalInputClass}
                                                />
                                          </FormField>

                                          <ModalSelectField<ActivityType>
                                                label="Loại"
                                                value={form.activityType}
                                                onChange={(value) => setForm((prev) => ({ ...prev, activityType: value }))}
                                                options={ACTIVITY_TYPE_OPTIONS}
                                                className="min-w-0 lg:col-span-4"
                                          />

                                          <ModalSelectField<ActivityStatus>
                                                label="Trạng thái"
                                                value={form.status}
                                                onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                                                options={ACTIVITY_STATUS_OPTIONS}
                                                className="min-w-0 lg:col-span-3"
                                          />

                                          <FormField label="Dự kiến" className="min-w-0 lg:col-span-2">
                                                <Input
                                                      type="number"
                                                      min={0}
                                                      value={form.expectedParticipants}
                                                      onChange={(event) => setForm((prev) => ({ ...prev, expectedParticipants: event.target.value }))}
                                                      className={modalInputClass}
                                                />
                                          </FormField>

                                          <label className="flex min-h-[72px] cursor-pointer items-center gap-3 rounded-2xl border border-amber-100 bg-white/90 px-4 py-3 shadow-[0_10px_24px_rgba(120,53,15,0.06)] lg:col-span-3">
                                                <input
                                                      type="checkbox"
                                                      checked={form.isPublicOnPortal}
                                                      onChange={(event) => setForm((prev) => ({ ...prev, isPublicOnPortal: event.target.checked }))}
                                                      className="h-4 w-4 shrink-0 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                                />
                                                <span className="min-w-0">
                                                      <span className="block text-sm font-black leading-5 text-slate-900">Hiển thị portal</span>
                                                      <span className="block truncate text-xs text-slate-500">Cho học viên xem</span>
                                                </span>
                                          </label>

                                          <FormField label="Ngày" required className="min-w-0 lg:col-span-4">
                                                <div className="activity-modal-date-field">
                                                      <FormDateInput
                                                            value={form.activityDate}
                                                            onChange={(event) => setForm((prev) => ({ ...prev, activityDate: event.target.value }))}
                                                      />
                                                </div>
                                          </FormField>

                                          <FormField label="Bắt đầu" className="min-w-0 lg:col-span-4">
                                                <div className="activity-modal-time-field">
                                                      <TimePickerInput
                                                            value={form.startTime}
                                                            onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
                                                            placeholder="Bắt đầu"
                                                      />
                                                </div>
                                          </FormField>

                                          <FormField label="Kết thúc" className="min-w-0 lg:col-span-4">
                                                <div className="activity-modal-time-field">
                                                      <TimePickerInput
                                                            value={form.endTime}
                                                            onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
                                                            placeholder="Kết thúc"
                                                      />
                                                </div>
                                          </FormField>

                                          <FormField label="Địa điểm" className="min-w-0 lg:col-span-6">
                                                <Input
                                                      value={form.location}
                                                      onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                                                      placeholder="VD: Phòng sinh hoạt chung"
                                                      className={modalInputClass}
                                                />
                                          </FormField>

                                          <FormField label="Phụ trách" className="min-w-0 lg:col-span-6">
                                                <Input
                                                      value={form.ownerGroup}
                                                      onChange={(event) => setForm((prev) => ({ ...prev, ownerGroup: event.target.value }))}
                                                      placeholder="VD: Ban Sinh hoạt"
                                                      className={modalInputClass}
                                                />
                                          </FormField>

                                          <FormField label="Mô tả" className="min-w-0 lg:col-span-6">
                                                <Textarea
                                                      value={form.description}
                                                      onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                                                      rows={2}
                                                      placeholder="Nội dung chính của hoạt động..."
                                                      className={modalTextareaClass}
                                                />
                                          </FormField>

                                          <FormField label="Ghi chú" className="min-w-0 lg:col-span-6">
                                                <Textarea
                                                      value={form.notes}
                                                      onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                                                      rows={2}
                                                      placeholder="Ghi chú thêm nếu có"
                                                      className={modalTextareaClass}
                                                />
                                          </FormField>
                                    </div>
                              </div>
                        </div>
                  </AppModal>
            </>
      );
}
