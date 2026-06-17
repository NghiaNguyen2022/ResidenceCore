'use client';

import { useMemo, useState } from 'react';
import { Edit2, Phone, Plus, Search, UserRound, X } from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type ParentType = 'father' | 'mother' | 'guardian';

type ContactFormData = {
      parentType: ParentType;
      fullName: string;
      phoneNumber: string;
      email: string;
      idNumber: string;
      occupation: string;
      address: string;
      notes: string;
};

const defaultContactFormData: ContactFormData = {
      parentType: 'mother',
      fullName: '',
      phoneNumber: '',
      email: '',
      idNumber: '',
      occupation: '',
      address: '',
      notes: '',
};

function getParentTypeLabel(parentType?: string | null) {
      switch (parentType) {
            case 'father':
                  return 'Cha';
            case 'mother':
                  return 'Mẹ';
            case 'guardian':
                  return 'Người giám hộ';
            default:
                  return 'Liên hệ';
      }
}

function getResidentDisplayName(contact: any) {
      if (contact?.residentHolyName && contact?.residentFullName) {
            return `${contact.residentHolyName} ${contact.residentFullName}`;
      }

      return contact?.residentFullName || contact?.residentName || 'Chưa rõ học viên';
}

function buildContactFormData(contact: any): ContactFormData {
      return {
            parentType: (contact?.parentType || 'guardian') as ParentType,
            fullName: contact?.fullName || '',
            phoneNumber: contact?.phoneNumber || '',
            email: contact?.email || '',
            idNumber: contact?.idNumber || '',
            occupation: contact?.occupation || '',
            address: contact?.address || '',
            notes: contact?.notes || '',
      };
}

export function ContactsListModal({
      onClose,
      onChanged,
      initialSearchTerm = '',
      residentId,
      residentName,
}: {
      onClose: () => void;
      onChanged?: () => void | Promise<void>;
      initialSearchTerm?: string;
      residentId?: number;
      residentName?: string;
}) {
      const isResidentScoped = Boolean(residentId && residentId > 0);
      const [searchTerm, setSearchTerm] = useState(isResidentScoped ? '' : initialSearchTerm);
      const [parentTypeFilter, setParentTypeFilter] = useState<'all' | ParentType>('all');
      const [editingContact, setEditingContact] = useState<any>(null);
      const [formData, setFormData] = useState<ContactFormData>(defaultContactFormData);
      const [error, setError] = useState<string | null>(null);

      const contactsQuery = trpc.members.listParents.useQuery(
            {
                  search: searchTerm.trim() || undefined,
                  parentType: parentTypeFilter !== 'all' ? parentTypeFilter : undefined,
                  residentId: isResidentScoped ? residentId : undefined,
            },
            {
                  refetchOnWindowFocus: false,
            }
      );

      const updateParentMutation = trpc.members.updateParent.useMutation({
            onSuccess: async () => {
                  await contactsQuery.refetch();
                  await onChanged?.();
            },
      });

      const createParentMutation = trpc.members.createParent.useMutation({
            onSuccess: async () => {
                  await contactsQuery.refetch();
                  await onChanged?.();
            },
      });

      const contacts = contactsQuery.data || [];
      const isContactFormOpen = Boolean(editingContact);
      const isSaving = updateParentMutation.isPending || createParentMutation.isPending;
      const isCreatingContact = editingContact?.id === 'new';

      const summary = useMemo(() => {
            const total = contacts.length;
            const withPhone = contacts.filter((item: any) => !!item.phoneNumber).length;

            return {
                  total,
                  withPhone,
            };
      }, [contacts]);

      const handleEditContact = (contact: any) => {
            setEditingContact(contact);
            setFormData(buildContactFormData(contact));
            setError(null);
      };

      const handleCancelEdit = () => {
            setEditingContact(null);
            setFormData(defaultContactFormData);
            setError(null);
      };

      const handleStartCreateContact = () => {
            if (!residentId) {
                  setError('Vui lòng mở liên hệ từ một học viên cụ thể để thêm mới.');
                  return;
            }

            setEditingContact({ id: 'new' });
            setFormData(defaultContactFormData);
            setError(null);
      };

      const handleSaveNewContact = async () => {
            if (!residentId) {
                  setError('Không tìm thấy học viên cần thêm liên hệ.');
                  return;
            }

            if (!formData.fullName.trim()) {
                  setError('Vui lòng nhập họ tên người liên hệ.');
                  return;
            }

            if (!formData.phoneNumber.trim()) {
                  setError('Vui lòng nhập số điện thoại người liên hệ.');
                  return;
            }

            try {
                  await createParentMutation.mutateAsync({
                        residentId,
                        parentType: formData.parentType,
                        fullName: formData.fullName.trim(),
                        phoneNumber: formData.phoneNumber.trim(),
                        email: formData.email.trim() || null,
                        idNumber: formData.idNumber.trim() || null,
                        occupation: formData.occupation.trim() || null,
                        address: formData.address.trim() || null,
                        notes: formData.notes.trim() || null,
                  });

                  handleCancelEdit();
            } catch (err: any) {
                  setError(err?.message || 'Không thể thêm liên hệ.');
            }
      };

      const handleSaveContact = async () => {
            if (editingContact?.id === 'new') {
                  await handleSaveNewContact();
                  return;
            }

            if (!editingContact?.id) {
                  setError('Không tìm thấy liên hệ cần cập nhật.');
                  return;
            }

            if (!formData.fullName.trim()) {
                  setError('Vui lòng nhập họ tên người liên hệ.');
                  return;
            }

            if (!formData.phoneNumber.trim()) {
                  setError('Vui lòng nhập số điện thoại người liên hệ.');
                  return;
            }

            try {
                  await updateParentMutation.mutateAsync({
                        id: editingContact.id,
                        parentType: formData.parentType,
                        fullName: formData.fullName.trim(),
                        phoneNumber: formData.phoneNumber.trim(),
                        email: formData.email.trim() || null,
                        idNumber: formData.idNumber.trim() || null,
                        occupation: formData.occupation.trim() || null,
                        address: formData.address.trim() || null,
                        notes: formData.notes.trim() || null,
                  });

                  handleCancelEdit();
            } catch (err: any) {
                  setError(err?.message || 'Không thể cập nhật liên hệ.');
            }
      };

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-4">
                              <div>
                                    <h2 className="text-2xl font-bold text-neutral-900">
                                          {isResidentScoped ? 'Liên hệ gia đình' : 'Danh sách liên hệ gia đình'}
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                          {isResidentScoped
                                                ? `Học viên: ${residentName || 'Chưa rõ học viên'}`
                                                : 'Xem và cập nhật nhanh thông tin cha, mẹ, người giám hộ của học viên.'}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                                          {isResidentScoped && (
                                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100">
                                                      Đang xem đúng học viên
                                                </span>
                                          )}

                                          <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                                Tổng liên hệ: <span className="font-semibold text-slate-800">{summary.total}</span>
                                          </span>
                                          <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                                Có số điện thoại: <span className="font-semibold text-slate-800">{summary.withPhone}</span>
                                          </span>
                                    </div>
                              </div>

                              <div className="flex items-center gap-2">
                                    {isResidentScoped && (
                                          <button
                                                type="button"
                                                onClick={handleStartCreateContact}
                                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                          >
                                                <Plus className="h-4 w-4" />
                                                Thêm liên hệ
                                          </button>
                                    )}

                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className="rounded-lg p-2 transition hover:bg-neutral-100"
                                    >
                                          <X className="h-5 w-5" />
                                    </button>
                              </div>
                        </div>

                        {error && !isContactFormOpen && (
                              <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                              </div>
                        )}

                        <div className="max-h-[calc(90vh-104px)] overflow-y-auto p-6">
                              <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder={
                                                      isResidentScoped
                                                            ? 'Tìm tên liên hệ hoặc số điện thoại...'
                                                            : 'Tìm tên học viên, tên liên hệ, số điện thoại...'
                                                }
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={parentTypeFilter}
                                          onChange={(event) =>
                                                setParentTypeFilter(event.target.value as 'all' | ParentType)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả quan hệ</option>
                                          <option value="mother">Mẹ</option>
                                          <option value="father">Cha</option>
                                          <option value="guardian">Người giám hộ</option>
                                    </select>
                              </div>

                              {contactsQuery.isLoading ? (
                                    <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
                                          Đang tải danh sách liên hệ...
                                    </div>
                              ) : contacts.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
                                          <div>Chưa có liên hệ phù hợp.</div>
                                          {isResidentScoped && (
                                                <button
                                                      type="button"
                                                      onClick={handleStartCreateContact}
                                                      className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                                >
                                                      Thêm liên hệ mới
                                                </button>
                                          )}
                                    </div>
                              ) : (
                                    <div className="space-y-3">
                                          {contacts.map((contact: any) => (
                                                <div
                                                      key={contact.id}
                                                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
                                                >
                                                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                            <div className="min-w-0">
                                                                  <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                                                              {getParentTypeLabel(contact.parentType)}
                                                                        </span>

                                                                        <div className="font-semibold text-slate-900">
                                                                              {contact.fullName || 'Chưa có tên'}
                                                                        </div>
                                                                  </div>

                                                                  <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                                                                        <div className="flex items-center gap-2">
                                                                              <Phone className="h-4 w-4 text-slate-400" />
                                                                              <span>{contact.phoneNumber || 'Chưa có số điện thoại'}</span>
                                                                        </div>

                                                                        {!isResidentScoped && (
                                                                              <div className="flex items-center gap-2">
                                                                                    <UserRound className="h-4 w-4 text-slate-400" />
                                                                                    <span>{getResidentDisplayName(contact)}</span>
                                                                              </div>
                                                                        )}
                                                                  </div>

                                                                  {(contact.email || contact.occupation) && (
                                                                        <div className="mt-2 text-sm text-slate-500">
                                                                              {[contact.email, contact.occupation].filter(Boolean).join(' · ')}
                                                                        </div>
                                                                  )}
                                                            </div>

                                                            <button
                                                                  type="button"
                                                                  onClick={() => handleEditContact(contact)}
                                                                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                            >
                                                                  <Edit2 className="h-4 w-4" />
                                                                  Sửa
                                                            </button>
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              )}
                        </div>
                  </div>

                  {isContactFormOpen && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 py-6">
                              <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                                    <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                                          <div>
                                                <h3 className="text-2xl font-bold text-slate-950">
                                                      {isCreatingContact ? 'Thêm liên hệ' : 'Sửa liên hệ'}
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500">
                                                      Cập nhật thông tin phụ huynh hoặc người giám hộ. Sau khi lưu hoặc hủy, bạn sẽ quay lại danh sách liên hệ.
                                                </p>
                                          </div>

                                          <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                                          >
                                                <X className="h-5 w-5" />
                                          </button>
                                    </div>

                                    <div className="overflow-y-auto px-6 py-5">
                                          {error && (
                                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                      {error}
                                                </div>
                                          )}

                                          <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                      <Label>Loại liên hệ *</Label>
                                                      <select
                                                            value={formData.parentType}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        parentType: event.target.value as ParentType,
                                                                  }))
                                                            }
                                                            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        fullName: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Nhập họ tên liên hệ"
                                                      />
                                                </div>

                                                <div>
                                                      <Label>Số điện thoại *</Label>
                                                      <Input
                                                            value={formData.phoneNumber}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        phoneNumber: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Nhập số điện thoại"
                                                      />
                                                </div>

                                                <div>
                                                      <Label>Email</Label>
                                                      <Input
                                                            value={formData.email}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        email: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Nhập email"
                                                      />
                                                </div>

                                                <div>
                                                      <Label>Số CCCD</Label>
                                                      <Input
                                                            value={formData.idNumber}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        idNumber: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Nhập số CCCD"
                                                      />
                                                </div>

                                                <div>
                                                      <Label>Nghề nghiệp</Label>
                                                      <Input
                                                            value={formData.occupation}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        occupation: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Nhập nghề nghiệp"
                                                      />
                                                </div>

                                                <div className="md:col-span-2">
                                                      <Label>Địa chỉ</Label>
                                                      <Textarea
                                                            value={formData.address}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        address: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Nhập địa chỉ liên hệ"
                                                            className="min-h-24"
                                                      />
                                                </div>

                                                <div className="md:col-span-2">
                                                      <Label>Ghi chú</Label>
                                                      <Textarea
                                                            value={formData.notes}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        notes: event.target.value,
                                                                  }))
                                                            }
                                                            placeholder="Ghi chú thêm nếu có"
                                                            className="min-h-24"
                                                      />
                                                </div>
                                          </div>
                                    </div>

                                    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
                                          <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                disabled={isSaving}
                                                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                                Hủy
                                          </button>

                                          <button
                                                type="button"
                                                onClick={handleSaveContact}
                                                disabled={isSaving}
                                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                                {isSaving ? 'Đang lưu...' : isCreatingContact ? 'Thêm liên hệ' : 'Lưu liên hệ'}
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
}

export default ContactsListModal;
