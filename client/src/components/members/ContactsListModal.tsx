'use client';

import { useMemo, useState } from 'react';
import { Edit2, Phone, Plus, Search, UserRound, X } from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { residenceMediumStyle } from '@/components/shared/styleMedium';
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
      initialMode = 'view',
      initialResidentId,
      closeAfterSave = false,
      formOnly = false,
}: {
      onClose: () => void;
      onChanged?: () => void | Promise<void>;
      initialSearchTerm?: string;
      initialMode?: 'view' | 'create';
      initialResidentId?: number;
      closeAfterSave?: boolean;
      formOnly?: boolean;
}) {
      const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
      const [parentTypeFilter, setParentTypeFilter] = useState<'all' | ParentType>('all');
      const [editingContact, setEditingContact] = useState<any>(null);
      const [formMode, setFormMode] = useState<'view' | 'create' | 'edit'>(initialMode);
      const [selectedResidentId, setSelectedResidentId] = useState(initialResidentId ? String(initialResidentId) : '');
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

      const residentsQuery = trpc.members.list.useQuery(
            {
                  status: 'active' as any,
                  limit: 500,
                  offset: 0,
            },
            {
                  refetchOnWindowFocus: false,
            }
      );

      const createParentMutation = trpc.members.createParent.useMutation({
            onSuccess: async () => {
                  await contactsQuery.refetch();
                  await onChanged?.();
            },
      });

      const updateParentMutation = trpc.members.updateParent.useMutation({
            onSuccess: async () => {
                  await contactsQuery.refetch();
                  await onChanged?.();
            },
      });

      const contacts = contactsQuery.data || [];
      const activeResidents = residentsQuery.data || [];

      const summary = useMemo(() => {
            const total = contacts.length;
            const withPhone = contacts.filter((item: any) => !!item.phoneNumber).length;

            return {
                  total,
                  withPhone,
            };
      }, [contacts]);

      const handleOpenCreateContact = () => {
            setEditingContact(null);
            setSelectedResidentId('');
            setFormData(defaultContactFormData);
            setFormMode('create');
            setError(null);
      };

      const handleEditContact = (contact: any) => {
            setEditingContact(contact);
            setSelectedResidentId(String(contact?.residentId || contact?.residentID || contact?.resident?.id || ''));
            setFormData(buildContactFormData(contact));
            setFormMode('edit');
            setError(null);
      };

      const handleCancelEdit = () => {
            setEditingContact(null);
            setSelectedResidentId('');
            setFormData(defaultContactFormData);
            setFormMode('view');
            setError(null);
      };

      const validateContactForm = () => {
            if (formMode === 'create' && !selectedResidentId) {
                  setError('Vui lòng chọn học viên cần thêm liên hệ.');
                  return false;
            }

            if (!formData.fullName.trim()) {
                  setError('Vui lòng nhập họ tên người liên hệ.');
                  return false;
            }

            if (!formData.phoneNumber.trim()) {
                  setError('Vui lòng nhập số điện thoại người liên hệ.');
                  return false;
            }

            return true;
      };

      const handleSaveContact = async () => {
            if (!validateContactForm()) return;

            try {
                  if (formMode === 'create') {
                        await createParentMutation.mutateAsync({
                              residentId: Number(selectedResidentId),
                              parentType: formData.parentType,
                              fullName: formData.fullName.trim(),
                              phoneNumber: formData.phoneNumber.trim(),
                              email: formData.email.trim() || undefined,
                              idNumber: formData.idNumber.trim() || undefined,
                              occupation: formData.occupation.trim() || undefined,
                              address: formData.address.trim() || undefined,
                              notes: formData.notes.trim() || undefined,
                        });
                  } else {
                        if (!editingContact?.id) {
                              setError('Không tìm thấy liên hệ cần cập nhật.');
                              return;
                        }

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
                  }

                  if (closeAfterSave) {
                        onClose();
                  } else {
                        handleCancelEdit();
                  }
            } catch (err: any) {
                  setError(err?.message || (formMode === 'create' ? 'Không thể thêm liên hệ.' : 'Không thể cập nhật liên hệ.'));
            }
      };

      const isSavingContact =
            createParentMutation.isPending || updateParentMutation.isPending;

      const selectedResidentName =
            activeResidents.find((resident: any) => String(resident.id) === selectedResidentId)?.fullName ||
            activeResidents.find((resident: any) => String(resident.id) === selectedResidentId)?.name ||
            initialSearchTerm ||
            '';

      const contactFormTitle = formMode === 'create'
            ? 'Thêm liên hệ'
            : formMode === 'edit'
                  ? 'Sửa liên hệ'
                  : 'Thông tin liên hệ';

      const contactFormDescription = formOnly
            ? 'Nhập thông tin liên hệ gia đình cho học viên này.'
            : 'Chọn một liên hệ để cập nhật, hoặc bấm Thêm liên hệ để tạo mới cho học viên.';

      const contactForm = (
            <div className={formOnly ? 'overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6' : 'mt-5 space-y-4'}>
                  {formMode === 'create' && !initialResidentId && (
                        <div>
                              <Label>Học viên *</Label>
                              <select
                                    value={selectedResidentId}
                                    onChange={(event) => setSelectedResidentId(event.target.value)}
                                    className="h-10 w-full rounded-2xl border border-amber-100/70 bg-white/70 px-3 text-sm font-semibold text-slate-700 outline-none transition hover:bg-white focus:border-amber-200 focus:bg-white focus:ring-2 focus:ring-amber-100/70"
                              >
                                    <option value="">Chọn học viên</option>
                                    {activeResidents.map((resident: any) => (
                                          <option key={resident.id} value={resident.id}>
                                                {resident.holyName ? `${resident.holyName} ` : ''}{resident.fullName || resident.name || `Học viên ${resident.id}`}
                                          </option>
                                    ))}
                              </select>
                              <p className="mt-1 text-xs text-slate-500">
                                    Chỉ hiển thị học viên đang lưu trú để tránh thêm liên hệ vào hồ sơ đã rời.
                              </p>
                        </div>
                  )}

                  {formMode === 'create' && initialResidentId && (
                        <div className="rounded-2xl border border-amber-100/60 bg-white/58 px-4 py-3 shadow-sm shadow-slate-900/5">
                              <p className={residenceMediumStyle.memberLabel}>Học viên</p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {selectedResidentName || `Học viên ${initialResidentId}`}
                              </p>
                        </div>
                  )}

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
                              className="h-10 w-full rounded-2xl border border-amber-100/70 bg-white/70 px-3 text-sm font-semibold text-slate-700 outline-none transition hover:bg-white focus:border-amber-200 focus:bg-white focus:ring-2 focus:ring-amber-100/70"
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
                              className={residenceMediumStyle.formInput}
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
                              className={residenceMediumStyle.formInput}
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
                              className={residenceMediumStyle.formInput}
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
                              className={residenceMediumStyle.formInput}
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
                              className={residenceMediumStyle.formTextarea}
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
                              className={residenceMediumStyle.formTextarea}
                        />
                  </div>

                  <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                        <button
                              type="button"
                              onClick={formOnly ? onClose : handleCancelEdit}
                              className={residenceMediumStyle.buttonCard}
                        >
                              Hủy
                        </button>

                        <button
                              type="button"
                              onClick={handleSaveContact}
                              disabled={isSavingContact}
                              className={residenceMediumStyle.buttonCardPrimary}
                        >
                              {isSavingContact ? 'Đang lưu...' : formMode === 'create' ? 'Thêm liên hệ' : 'Lưu liên hệ'}
                        </button>
                  </div>
            </div>
      );

      if (formOnly) {
            return (
                  <div className={residenceMediumStyle.modalOverlay}>
                        <div className={`${residenceMediumStyle.modalShell} max-w-xl`}>
                              <div className={residenceMediumStyle.modalHeader}>
                                    <div>
                                          <h2 className={residenceMediumStyle.modalTitle}>
                                                {contactFormTitle}
                                          </h2>
                                          <p className={residenceMediumStyle.modalSubtitle}>
                                                {contactFormDescription}
                                          </p>
                                    </div>

                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className="rounded-xl border border-amber-100 bg-white/75 p-2 text-slate-500 shadow-sm shadow-slate-900/5 transition hover:bg-white hover:text-slate-800"
                                    >
                                          <X className="h-5 w-5" />
                                    </button>
                              </div>

                              <div className="min-h-0 overflow-hidden bg-[linear-gradient(180deg,rgba(255,251,235,0.26)_0%,rgba(248,250,252,0.46)_100%)]">
                                    {error && (
                                          <div className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-6">
                                                {error}
                                          </div>
                                    )}

                                    {contactForm}
                              </div>
                        </div>
                  </div>
            );
      }

      return (
            <div className={residenceMediumStyle.modalOverlay}>
                  <div className={`${residenceMediumStyle.modalShell} max-w-5xl`}>
                        <div className={residenceMediumStyle.modalHeader}>
                              <div>
                                    <h2 className={residenceMediumStyle.modalTitle}>
                                          Danh sách liên hệ gia đình
                                    </h2>
                                    <p className={residenceMediumStyle.modalSubtitle}>
                                          Xem và cập nhật nhanh thông tin cha, mẹ, người giám hộ của học viên.
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                                          <span className={residenceMediumStyle.statDetailPill}>
                                                Tổng liên hệ: <span className="font-semibold text-slate-800">{summary.total}</span>
                                          </span>
                                          <span className={residenceMediumStyle.statDetailPill}>
                                                Có số điện thoại: <span className="font-semibold text-slate-800">{summary.withPhone}</span>
                                          </span>
                                    </div>
                              </div>

                              <div className="flex items-center gap-2">
                                    <button
                                          type="button"
                                          onClick={handleOpenCreateContact}
                                          className={residenceMediumStyle.buttonCardPrimary}
                                    >
                                          <Plus className={residenceMediumStyle.buttonCardIcon} />
                                          Thêm liên hệ
                                    </button>

                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className="rounded-xl border border-amber-100 bg-white/75 p-2 text-slate-500 shadow-sm shadow-slate-900/5 transition hover:bg-white hover:text-slate-800"
                                    >
                                          <X className="h-5 w-5" />
                                    </button>
                              </div>
                        </div>

                        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden bg-[linear-gradient(180deg,rgba(255,251,235,0.26)_0%,rgba(248,250,252,0.46)_100%)] lg:grid-cols-[1fr_360px]">
                              <div className="overflow-y-auto p-5 sm:p-6">
                                    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
                                          <div className="relative">
                                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <Input
                                                      value={searchTerm}
                                                      onChange={(event) => setSearchTerm(event.target.value)}
                                                      placeholder="Tìm tên học viên, tên liên hệ, số điện thoại..."
                                                      className="h-10 rounded-2xl border-amber-100/70 bg-white/70 pl-10 text-sm font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition placeholder:text-slate-400 focus:border-amber-200 focus:bg-white focus:ring-2 focus:ring-amber-100/70"
                                                />
                                          </div>

                                          <select
                                                value={parentTypeFilter}
                                                onChange={(event) =>
                                                      setParentTypeFilter(event.target.value as 'all' | ParentType)
                                                }
                                                className="h-10 rounded-2xl border border-amber-100/70 bg-white/70 px-3 text-sm font-semibold text-slate-700 outline-none transition hover:bg-white focus:border-amber-200 focus:bg-white focus:ring-2 focus:ring-amber-100/70"
                                          >
                                                <option value="all">Tất cả quan hệ</option>
                                                <option value="mother">Mẹ</option>
                                                <option value="father">Cha</option>
                                                <option value="guardian">Người giám hộ</option>
                                          </select>
                                    </div>

                                    {contactsQuery.isLoading ? (
                                          <div className="rounded-2xl border border-dashed border-amber-100/70 bg-white/70 p-8 text-center text-sm text-slate-500 shadow-sm shadow-slate-900/5">
                                                Đang tải danh sách liên hệ...
                                          </div>
                                    ) : contacts.length === 0 ? (
                                          <div className="rounded-2xl border border-dashed border-amber-100/70 bg-white/70 p-8 text-center text-sm text-slate-500 shadow-sm shadow-slate-900/5">
                                                Chưa có liên hệ phù hợp.
                                          </div>
                                    ) : (
                                          <div className="space-y-3">
                                                {contacts.map((contact: any) => (
                                                      <div
                                                            key={contact.id}
                                                            className={[
                                                                  'rounded-[22px] border bg-[linear-gradient(135deg,rgba(255,255,255,0.80)_0%,rgba(255,251,235,0.52)_70%,rgba(248,250,252,0.68)_100%)] p-4 shadow-[0_12px_30px_rgba(12,10,9,0.055),inset_0_1px_0_rgba(255,255,255,0.72)] transition hover:-translate-y-0.5',
                                                                  editingContact?.id === contact.id
                                                                        ? 'border-amber-300/80 ring-2 ring-amber-100/80'
                                                                        : 'border-amber-100/60 hover:border-amber-200/80 hover:shadow-[0_18px_42px_rgba(12,10,9,0.08)]',
                                                            ].join(' ')}
                                                      >
                                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                                  <div className="min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                              <span className="rounded-full bg-white/72 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100/70">
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
                                                                        className={residenceMediumStyle.buttonCard}
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

                              <div className="border-t border-amber-100/60 bg-white/42 p-5 shadow-[inset_1px_0_0_rgba(251,191,36,0.10)] lg:border-l lg:border-t-0 lg:p-6">
                                    <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                                          {formMode === 'create' ? 'Thêm liên hệ' : formMode === 'edit' ? 'Sửa liên hệ' : 'Thông tin liên hệ'}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Chọn một liên hệ để cập nhật, hoặc bấm Thêm liên hệ để tạo mới cho học viên.
                                    </p>

                                    {error && (
                                          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                {error}
                                          </div>
                                    )}

                                    {formMode === 'view' ? (
                                          <div className="mt-6 rounded-2xl border border-dashed border-amber-100/70 bg-white/60 p-6 text-center text-sm text-slate-500 shadow-sm shadow-slate-900/5">
                                                Chưa chọn liên hệ để sửa. Bấm Thêm liên hệ ở góc trên để tạo liên hệ mới.
                                          </div>
                                    ) : (
                                          contactForm
                                    )}
                              </div>
                        </div>
                  </div>
            </div>
      );
}

export default ContactsListModal;
