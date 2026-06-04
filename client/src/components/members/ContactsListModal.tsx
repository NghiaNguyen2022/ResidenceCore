'use client';

import { useMemo, useState } from 'react';
import { Edit2, Phone, Search, UserRound, X } from 'lucide-react';

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
}: {
      onClose: () => void;
      onChanged?: () => void | Promise<void>;
}) {
      const [searchTerm, setSearchTerm] = useState('');
      const [parentTypeFilter, setParentTypeFilter] = useState<'all' | ParentType>('all');
      const [editingContact, setEditingContact] = useState<any>(null);
      const [formData, setFormData] = useState<ContactFormData>(defaultContactFormData);
      const [error, setError] = useState<string | null>(null);

      const contactsQuery = trpc.members.listParents.useQuery(
            {
                  search: searchTerm.trim() || undefined,
                  parentType: parentTypeFilter !== 'all' ? parentTypeFilter : undefined,
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

      const contacts = contactsQuery.data || [];

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

      const handleSaveContact = async () => {
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
                                          Danh sách liên hệ gia đình
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                          Xem và cập nhật nhanh thông tin cha, mẹ, người giám hộ của học viên.
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                                          <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                                Tổng liên hệ: <span className="font-semibold text-slate-800">{summary.total}</span>
                                          </span>
                                          <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                                Có số điện thoại: <span className="font-semibold text-slate-800">{summary.withPhone}</span>
                                          </span>
                                    </div>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg p-2 transition hover:bg-neutral-100"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <div className="grid max-h-[calc(90vh-104px)] grid-cols-1 overflow-hidden lg:grid-cols-[1fr_360px]">
                              <div className="overflow-y-auto p-6">
                                    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
                                          <div className="relative">
                                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                                <Input
                                                      value={searchTerm}
                                                      onChange={(event) => setSearchTerm(event.target.value)}
                                                      placeholder="Tìm tên học viên, tên liên hệ, số điện thoại..."
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
                                                Chưa có liên hệ phù hợp.
                                          </div>
                                    ) : (
                                          <div className="space-y-3">
                                                {contacts.map((contact: any) => (
                                                      <div
                                                            key={contact.id}
                                                            className={[
                                                                  'rounded-2xl border bg-white p-4 shadow-sm transition',
                                                                  editingContact?.id === contact.id
                                                                        ? 'border-blue-300 ring-2 ring-blue-100'
                                                                        : 'border-slate-200 hover:border-slate-300',
                                                            ].join(' ')}
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

                                                                              <div className="flex items-center gap-2">
                                                                                    <UserRound className="h-4 w-4 text-slate-400" />
                                                                                    <span>{getResidentDisplayName(contact)}</span>
                                                                              </div>
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

                              <div className="border-t bg-slate-50 p-6 lg:border-l lg:border-t-0">
                                    <h3 className="text-lg font-bold text-slate-900">
                                          {editingContact ? 'Sửa liên hệ' : 'Thông tin liên hệ'}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Chọn một liên hệ bên trái để cập nhật thông tin cơ bản.
                                    </p>

                                    {error && (
                                          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                {error}
                                          </div>
                                    )}

                                    {!editingContact ? (
                                          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                                                Chưa chọn liên hệ để sửa.
                                          </div>
                                    ) : (
                                          <div className="mt-5 space-y-4">
                                                <div>
                                                      <Label>Quan hệ</Label>
                                                      <select
                                                            value={formData.parentType}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        parentType: event.target.value as ParentType,
                                                                  }))
                                                            }
                                                            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                      >
                                                            <option value="mother">Mẹ</option>
                                                            <option value="father">Cha</option>
                                                            <option value="guardian">Người giám hộ</option>
                                                      </select>
                                                </div>

                                                <div>
                                                      <Label>Họ tên liên hệ *</Label>
                                                      <Input
                                                            value={formData.fullName}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        fullName: event.target.value,
                                                                  }))
                                                            }
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
                                                      />
                                                </div>

                                                <div>
                                                      <Label>Địa chỉ</Label>
                                                      <Textarea
                                                            value={formData.address}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        address: event.target.value,
                                                                  }))
                                                            }
                                                            className="min-h-20"
                                                      />
                                                </div>

                                                <div>
                                                      <Label>Ghi chú</Label>
                                                      <Textarea
                                                            value={formData.notes}
                                                            onChange={(event) =>
                                                                  setFormData((current) => ({
                                                                        ...current,
                                                                        notes: event.target.value,
                                                                  }))
                                                            }
                                                            className="min-h-20"
                                                      />
                                                </div>

                                                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                                      <button
                                                            type="button"
                                                            onClick={handleCancelEdit}
                                                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                                                      >
                                                            Hủy
                                                      </button>

                                                      <button
                                                            type="button"
                                                            onClick={handleSaveContact}
                                                            disabled={updateParentMutation.isPending}
                                                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                      >
                                                            {updateParentMutation.isPending ? 'Đang lưu...' : 'Lưu liên hệ'}
                                                      </button>
                                                </div>
                                          </div>
                                    )}
                              </div>
                        </div>
                  </div>
            </div>
      );
}

export default ContactsListModal;
