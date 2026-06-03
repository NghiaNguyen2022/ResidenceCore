import { useState, type Dispatch, type SetStateAction } from 'react';
import { Briefcase, Edit2, Mail, MapPin, Phone, Plus, Trash2, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ParentFormData, ParentType } from './memberTypes';
import { defaultParentFormData } from './memberTypes';
import {
      getParentTypeClass,
      getParentTypeLabel,
      validateParentFormBeforeSave,
} from './memberUtils';

export function ParentsSection({
      residentId,
      onDataChange,
}: {
      residentId: number;
      onDataChange?: () => void | Promise<void>;
}) {
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingParent, setEditingParent] = useState<any>(null);
      const [parentForm, setParentForm] =
            useState<ParentFormData>(defaultParentFormData);
      const [parentError, setParentError] = useState<string | null>(null);

      const parentsQuery = trpc.members.getParents.useQuery(
            { residentId },
            {
                  enabled: Boolean(residentId),
            }
      );

      const createParentMutation = trpc.members.createParent.useMutation();
      const updateParentMutation = trpc.members.updateParent.useMutation();
      const deleteParentMutation = trpc.members.deleteParent.useMutation();

      const parents = parentsQuery.data || [];

      const openCreateParent = () => {
            setEditingParent(null);
            setParentForm(defaultParentFormData);
            setParentError(null);
            setIsFormOpen(true);
      };

      const openEditParent = (parent: any) => {
            setEditingParent(parent);
            setParentForm({
                  parentType: parent.parentType || 'father',
                  fullName: parent.fullName || '',
                  phoneNumber: parent.phoneNumber || '',
                  email: parent.email || '',
                  idNumber: parent.idNumber || '',
                  occupation: parent.occupation || '',
                  address: parent.address || '',
                  notes: parent.notes || '',
            });
            setParentError(null);
            setIsFormOpen(true);
      };

      const handleSaveParent = async () => {
            const validationMessage = validateParentFormBeforeSave({
                  parents,
                  formData: parentForm,
                  editingParentId: editingParent?.id,
            });

            if (validationMessage) {
                  setParentError(validationMessage);
                  return;
            }

            try {
                  const payload = {
                        parentType: parentForm.parentType,
                        fullName: parentForm.fullName.trim(),
                        phoneNumber: parentForm.phoneNumber.trim(),
                        email: parentForm.email || undefined,
                        idNumber: parentForm.idNumber || undefined,
                        occupation: parentForm.occupation || undefined,
                        address: parentForm.address || undefined,
                        notes: parentForm.notes || undefined,
                  };

                  if (editingParent?.id) {
                        await updateParentMutation.mutateAsync({
                              id: editingParent.id,
                              ...payload,
                        });
                  } else {
                        await createParentMutation.mutateAsync({
                              residentId,
                              ...payload,
                        });
                  }

                  setIsFormOpen(false);
                  setEditingParent(null);
                  setParentForm(defaultParentFormData);
                  setParentError(null);
                  await parentsQuery.refetch();
                  await onDataChange?.();
            } catch (err: any) {
                  setParentError(err.message || 'Lỗi khi lưu thông tin liên hệ.');
            }
      };

      const handleDeleteParent = async (parentId: number) => {
            if (!confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
                  return;
            }

            try {
                  await deleteParentMutation.mutateAsync({ id: parentId });
                  await parentsQuery.refetch();
                  await onDataChange?.();
            } catch (err: any) {
                  setParentError(err.message || 'Lỗi khi xóa liên hệ.');
            }
      };

      return (
            <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                              <p className="text-sm font-semibold text-neutral-800">
                                    Danh sách liên hệ
                              </p>
                              <p className="text-xs text-neutral-500">
                                    Một học viên chỉ có tối đa 1 Cha, 1 Mẹ. Người giám hộ có thể nhiều
                                    nếu không trùng tên hoặc số điện thoại.
                              </p>
                        </div>

                        <button
                              type="button"
                              onClick={openCreateParent}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                              <Plus className="h-3.5 w-3.5" />
                              Thêm liên hệ
                        </button>
                  </div>

                  {parentError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                              {parentError}
                        </div>
                  )}

                  {parentsQuery.isLoading ? (
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                              Đang tải danh sách liên hệ...
                        </div>
                  ) : parents.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
                              <p className="text-sm font-semibold text-neutral-700">
                                    Chưa có liên hệ phụ huynh / người giám hộ
                              </p>
                              <p className="mt-1 text-sm text-neutral-500">
                                    Bấm “Thêm liên hệ” để tạo liên hệ thật cho học viên này.
                              </p>
                        </div>
                  ) : (
                        <div className="space-y-3">
                              {parents.map((parent: any) => (
                                    <div
                                          key={parent.id}
                                          className="rounded-xl border border-neutral-200 bg-white p-4"
                                    >
                                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                      <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-semibold text-neutral-900">
                                                                  {parent.fullName || '-'}
                                                            </p>
                                                            <span
                                                                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getParentTypeClass(
                                                                        parent.parentType
                                                                  )}`}
                                                            >
                                                                  {getParentTypeLabel(parent.parentType)}
                                                            </span>
                                                      </div>

                                                      <div className="mt-2 space-y-1 text-sm text-neutral-600">
                                                            <p className="flex items-center gap-2">
                                                                  <Phone className="h-3.5 w-3.5 text-neutral-400" />
                                                                  {parent.phoneNumber || '-'}
                                                            </p>

                                                            {parent.email && (
                                                                  <p className="flex items-center gap-2">
                                                                        <Mail className="h-3.5 w-3.5 text-neutral-400" />
                                                                        {parent.email}
                                                                  </p>
                                                            )}

                                                            {parent.occupation && (
                                                                  <p className="flex items-center gap-2">
                                                                        <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
                                                                        {parent.occupation}
                                                                  </p>
                                                            )}

                                                            {parent.address && (
                                                                  <p className="flex items-center gap-2">
                                                                        <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                                                                        {parent.address}
                                                                  </p>
                                                            )}
                                                      </div>
                                                </div>

                                                <div className="flex gap-2">
                                                      <button
                                                            type="button"
                                                            onClick={() => openEditParent(parent)}
                                                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                            title="Sửa liên hệ"
                                                      >
                                                            <Edit2 className="h-4 w-4" />
                                                      </button>

                                                      <button
                                                            type="button"
                                                            onClick={() => handleDeleteParent(parent.id)}
                                                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                                            title="Xóa liên hệ"
                                                      >
                                                            <Trash2 className="h-4 w-4" />
                                                      </button>
                                                </div>
                                          </div>

                                          {parent.notes && (
                                                <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
                                                      {parent.notes}
                                                </div>
                                          )}
                                    </div>
                              ))}
                        </div>
                  )}

                  {isFormOpen && (
                        <ParentFormModal
                              title={editingParent ? 'Cập nhật liên hệ' : 'Thêm liên hệ'}
                              error={parentError}
                              formData={parentForm}
                              setFormData={setParentForm}
                              onClose={() => setIsFormOpen(false)}
                              onSubmit={handleSaveParent}
                              submitText={
                                    editingParent
                                          ? updateParentMutation.isPending
                                                ? 'Đang cập nhật...'
                                                : 'Cập nhật'
                                          : createParentMutation.isPending
                                                ? 'Đang thêm...'
                                                : 'Thêm liên hệ'
                              }
                              isSubmitting={
                                    createParentMutation.isPending || updateParentMutation.isPending
                              }
                        />
                  )}
            </div>
      );
}

function ParentFormModal({
      title,
      error,
      formData,
      setFormData,
      onClose,
      onSubmit,
      submitText,
      isSubmitting,
}: {
      title: string;
      error: string | null;
      formData: ParentFormData;
      setFormData: Dispatch<SetStateAction<ParentFormData>>;
      onClose: () => void;
      onSubmit: () => void;
      submitText: string;
      isSubmitting: boolean;
}) {
      return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                          Cập nhật thông tin phụ huynh hoặc người giám hộ.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg p-2 transition hover:bg-neutral-100"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <form
                              onSubmit={(event) => {
                                    event.preventDefault();
                                    onSubmit();
                              }}
                              className="space-y-5 p-6"
                        >
                              {error && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                          {error}
                                    </div>
                              )}

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                          <Label>Loại liên hệ *</Label>
                                          <select
                                                value={formData.parentType}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            parentType: event.target.value as ParentType,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="father">Cha</option>
                                                <option value="mother">Mẹ</option>
                                                <option value="guardian">Người giám hộ</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label>Họ tên *</Label>
                                          <Input
                                                value={formData.fullName}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, fullName: event.target.value })
                                                }
                                                placeholder="Nhập họ tên liên hệ"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label>Số điện thoại *</Label>
                                          <Input
                                                value={formData.phoneNumber}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            phoneNumber: event.target.value,
                                                      })
                                                }
                                                placeholder="Nhập số điện thoại"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label>Email</Label>
                                          <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, email: event.target.value })
                                                }
                                                placeholder="Nhập email"
                                          />
                                    </div>

                                    <div>
                                          <Label>Số CCCD</Label>
                                          <Input
                                                value={formData.idNumber}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, idNumber: event.target.value })
                                                }
                                                placeholder="Nhập số CCCD"
                                          />
                                    </div>

                                    <div>
                                          <Label>Nghề nghiệp</Label>
                                          <Input
                                                value={formData.occupation}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, occupation: event.target.value })
                                                }
                                                placeholder="Nhập nghề nghiệp"
                                          />
                                    </div>
                              </div>

                              <div>
                                    <Label>Địa chỉ</Label>
                                    <Textarea
                                          value={formData.address}
                                          onChange={(event) =>
                                                setFormData({ ...formData, address: event.target.value })
                                          }
                                          placeholder="Nhập địa chỉ liên hệ"
                                          className="min-h-20"
                                    />
                              </div>

                              <div>
                                    <Label>Ghi chú</Label>
                                    <Textarea
                                          value={formData.notes}
                                          onChange={(event) =>
                                                setFormData({ ...formData, notes: event.target.value })
                                          }
                                          placeholder="Ghi chú thêm nếu có"
                                          className="min-h-20"
                                    />
                              </div>

                              <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                    >
                                          Hủy
                                    </button>

                                    <button
                                          type="submit"
                                          disabled={isSubmitting}
                                          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                          {submitText}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}

