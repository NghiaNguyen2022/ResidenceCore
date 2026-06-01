import { useMemo, useState } from "react";
import {
  AlertCircle,
  Edit2,
  Eye,
  Home,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ParentContact = {
  id: number;
  residentId?: number;
  residentName: string;
  residentCode: string;
  contactName: string;
  relationship: string;
  phone: string;
  backupPhone?: string;
  address: string;
  isEmergencyContact: boolean;
  isPrimaryContact: boolean;
  note?: string;
};

type ParentFormData = {
  residentId: string;
  contactName: string;
  relationship: string;
  phone: string;
  backupPhone: string;
  address: string;
  isEmergencyContact: boolean;
  isPrimaryContact: boolean;
  note: string;
};

const initialContacts: ParentContact[] = [
  {
    id: 1,
    residentId: 1,
    residentName: "Nguyễn Văn A",
    residentCode: "HV0001",
    contactName: "Nguyễn Văn B",
    relationship: "Cha",
    phone: "090xxxxxxx",
    backupPhone: "091xxxxxxx",
    address: "Xã Xuân Phú, Đồng Nai",
    isEmergencyContact: true,
    isPrimaryContact: true,
    note: "Liên hệ chính khi có việc khẩn cấp.",
  },
  {
    id: 2,
    residentId: 1,
    residentName: "Nguyễn Văn A",
    residentCode: "HV0001",
    contactName: "Nguyễn Thị C",
    relationship: "Mẹ",
    phone: "093xxxxxxx",
    address: "Xã Xuân Phú, Đồng Nai",
    isEmergencyContact: true,
    isPrimaryContact: false,
    note: "Liên hệ phụ.",
  },
  {
    id: 3,
    residentId: 2,
    residentName: "Trần Thị D",
    residentCode: "HV0002",
    contactName: "Trần Văn E",
    relationship: "Cha",
    phone: "097xxxxxxx",
    address: "Quận Bình Thạnh, TP. Hồ Chí Minh",
    isEmergencyContact: true,
    isPrimaryContact: true,
    note: "Liên hệ chính.",
  },
];

const defaultFormData: ParentFormData = {
  residentId: "",
  contactName: "",
  relationship: "Cha",
  phone: "",
  backupPhone: "",
  address: "",
  isEmergencyContact: true,
  isPrimaryContact: false,
  note: "",
};

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
          <p className="mt-1 text-xs text-neutral-500">{description}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Parents() {
  const [contacts, setContacts] = useState<ParentContact[]>(initialContacts);
  const [searchTerm, setSearchTerm] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [editingContact, setEditingContact] = useState<ParentContact | null>(
    null
  );
  const [selectedContact, setSelectedContact] = useState<ParentContact | null>(
    null
  );

  const [formData, setFormData] = useState<ParentFormData>(defaultFormData);

  /**
   * CONNECTED DATA
   * Danh sách học viên lấy data thật từ API hiện tại.
   * Liên hệ gia đình vẫn là mock UI, chưa ghi database.
   */
  const membersQuery = trpc.members.list.useQuery({
    search: "",
    status: undefined,
  });

  const members = membersQuery.data || [];

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        contact.residentName.toLowerCase().includes(keyword) ||
        contact.residentCode.toLowerCase().includes(keyword) ||
        contact.contactName.toLowerCase().includes(keyword) ||
        contact.phone.toLowerCase().includes(keyword) ||
        contact.address.toLowerCase().includes(keyword);

      const matchesRelationship =
        relationshipFilter === "all" ||
        contact.relationship === relationshipFilter;

      return matchesSearch && matchesRelationship;
    });
  }, [contacts, searchTerm, relationshipFilter]);

  const emergencyCount = contacts.filter(
    (item) => item.isEmergencyContact
  ).length;

  const primaryContactCount = contacts.filter(
    (item) => item.isPrimaryContact
  ).length;

  const studentsWithContactsCount = new Set(
    contacts.map((item) => item.residentId).filter(Boolean)
  ).size;

  const openCreateForm = () => {
    setEditingContact(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (contact: ParentContact) => {
    setEditingContact(contact);
    setFormData({
      residentId: contact.residentId ? String(contact.residentId) : "",
      contactName: contact.contactName,
      relationship: contact.relationship,
      phone: contact.phone,
      backupPhone: contact.backupPhone || "",
      address: contact.address,
      isEmergencyContact: contact.isEmergencyContact,
      isPrimaryContact: contact.isPrimaryContact,
      note: contact.note || "",
    });
    setIsFormOpen(true);
  };

  const openDetail = (contact: ParentContact) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handleSave = () => {
    const selectedResident = members.find(
      (member: any) => String(member.id) === formData.residentId
    );

    if (!selectedResident) {
      alert("Vui lòng chọn học viên từ danh sách.");
      return;
    }

    const residentId = selectedResident.id;
    const residentName = selectedResident.fullName || "-";
    const residentCode =
      selectedResident.residentCode || `ID: ${selectedResident.id}`;

    if (editingContact) {
      setContacts((prev) =>
        prev.map((item) => {
          const isSameResident = item.residentId === residentId;
          const isCurrentEditing = item.id === editingContact.id;

          if (isCurrentEditing) {
            return {
              ...item,
              residentId,
              residentName,
              residentCode,
              contactName: formData.contactName,
              relationship: formData.relationship,
              phone: formData.phone,
              backupPhone: formData.backupPhone,
              address: formData.address,
              isEmergencyContact: formData.isEmergencyContact,
              isPrimaryContact: formData.isPrimaryContact,
              note: formData.note,
            };
          }

          if (formData.isPrimaryContact && isSameResident) {
            return {
              ...item,
              isPrimaryContact: false,
            };
          }

          return item;
        })
      );
    } else {
      const newContact: ParentContact = {
        id: Date.now(),
        residentId,
        residentName,
        residentCode,
        contactName: formData.contactName,
        relationship: formData.relationship,
        phone: formData.phone,
        backupPhone: formData.backupPhone,
        address: formData.address,
        isEmergencyContact: formData.isEmergencyContact,
        isPrimaryContact: formData.isPrimaryContact,
        note: formData.note,
      };

      setContacts((prev) => {
        const updatedContacts = formData.isPrimaryContact
          ? prev.map((item) =>
              item.residentId === residentId
                ? { ...item, isPrimaryContact: false }
                : item
            )
          : prev;

        return [newContact, ...updatedContacts];
      });
    }

    setIsFormOpen(false);
    setEditingContact(null);
    setFormData(defaultFormData);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa liên hệ này khỏi UI mock?")) {
      return;
    }

    setContacts((prev) => prev.filter((item) => item.id !== id));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRelationshipFilter("all");
  };

  return (
    <ResidenceCareLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Quản lý lưu trú
            </p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              Phụ huynh / Gia đình
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Quản lý thông tin liên hệ gia đình, người giám hộ, địa chỉ gia
              đình và liên hệ khẩn cấp của học viên.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm liên hệ
          </button>
        </div>

        {/* Data status */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                UI mock cho liên hệ gia đình - danh sách học viên lấy data thật
              </p>
              <p className="mt-1 text-sm">
                Khi thêm liên hệ, học viên được chọn từ API{" "}
                <span className="font-semibold">members.list</span>. Một học
                viên có thể có nhiều liên hệ. Thông tin liên hệ gia đình hiện
                vẫn lưu bằng state mock trên UI, chưa ghi database. Sau này sẽ
                mapping với bảng <span className="font-semibold">parents</span>{" "}
                hoặc <span className="font-semibold">familyContacts</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng liên hệ"
            value={contacts.length}
            description="Một học viên có thể có nhiều liên hệ"
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            label="Học viên đã có liên hệ"
            value={studentsWithContactsCount}
            description="Tính theo học viên duy nhất"
            icon={<Home className="h-5 w-5" />}
          />

          <StatCard
            label="Liên hệ chính"
            value={primaryContactCount}
            description="Mỗi học viên nên có một liên hệ chính"
            icon={<ShieldCheck className="h-5 w-5" />}
          />

          <StatCard
            label="Liên hệ khẩn cấp"
            value={emergencyCount}
            description="Dùng khi cần xử lý nhanh"
            icon={<Phone className="h-5 w-5" />}
          />
        </div>

        {/* Mapping */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Mapping checklist
            </h2>
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-neutral-50 p-3">
                Bổ sung địa chỉ liên hệ gia đình vào hồ sơ học viên.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Một học viên có thể có nhiều liên hệ gia đình.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Khi thêm liên hệ phải chọn học viên từ danh sách hiện có.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Có phân biệt liên hệ chính và liên hệ khẩn cấp.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Sau này hiển thị trong tab Gia đình của hồ sơ học viên.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Mapping backend / data
            </h2>
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-neutral-50 p-3">
                Danh sách học viên: <b>trpc.members.list</b> - đã connect.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Liên hệ gia đình: <b>parents</b> hoặc{" "}
                <b>familyContacts</b> - chưa connect API.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Quan hệ dữ liệu: <b>residents 1 - n familyContacts</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                API cần bổ sung: list, getByResident, create, update, delete.
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm học viên, người liên hệ, số điện thoại, địa chỉ..."
                className="pl-10"
              />
            </div>

            <select
              value={relationshipFilter}
              onChange={(event) => setRelationshipFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả quan hệ</option>
              <option value="Cha">Cha</option>
              <option value="Mẹ">Mẹ</option>
              <option value="Anh trai">Anh trai</option>
              <option value="Chị gái">Chị gái</option>
              <option value="Người giám hộ">Người giám hộ</option>
              <option value="Khác">Khác</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Xóa lọc
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Danh sách liên hệ gia đình
              </h2>
              <p className="text-sm text-neutral-500">
                {filteredContacts.length} liên hệ đang hiển thị. Dữ liệu liên
                hệ là mock, chưa ghi database.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Học viên
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Người liên hệ
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Quan hệ
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Điện thoại
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Địa chỉ gia đình
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {contact.residentName}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {contact.residentCode}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <UserRound className="mt-0.5 h-4 w-4 text-neutral-400" />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-neutral-800">
                              {contact.contactName}
                            </span>

                            {contact.isPrimaryContact && (
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                Chính
                              </span>
                            )}

                            {contact.isEmergencyContact && (
                              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                Khẩn cấp
                              </span>
                            )}
                          </div>

                          {contact.note && (
                            <p className="mt-1 max-w-xs truncate text-xs text-neutral-500">
                              {contact.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {contact.relationship}
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1 text-sm text-neutral-700">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-neutral-400" />
                          {contact.phone}
                        </div>
                        {contact.backupPhone && (
                          <p className="pl-6 text-xs text-neutral-500">
                            Phụ: {contact.backupPhone}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      <div className="max-w-xs truncate">{contact.address}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openDetail(contact)}
                          className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditForm(contact)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(contact.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Xóa mock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredContacts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Không có liên hệ nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && (
          <ParentContactFormModal
            title={editingContact ? "Chỉnh sửa liên hệ" : "Thêm liên hệ gia đình"}
            formData={formData}
            setFormData={setFormData}
            members={members}
            membersLoading={membersQuery.isLoading}
            onClose={() => {
              setIsFormOpen(false);
              setEditingContact(null);
            }}
            onSubmit={handleSave}
          />
        )}

        {isDetailOpen && selectedContact && (
          <ParentContactDetailModal
            contact={selectedContact}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedContact(null);
            }}
            onEdit={() => {
              setIsDetailOpen(false);
              openEditForm(selectedContact);
            }}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

function ParentContactFormModal({
  title,
  formData,
  setFormData,
  members,
  membersLoading,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: ParentFormData;
  setFormData: React.Dispatch<React.SetStateAction<ParentFormData>>;
  members: any[];
  membersLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
            <p className="text-sm text-neutral-500">
              Chọn học viên từ danh sách thật. Một học viên có thể có nhiều liên
              hệ. Thông tin liên hệ hiện chỉ lưu mock trên UI, chưa ghi database.
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
          <div>
            <Label htmlFor="residentId">Chọn học viên *</Label>
            <select
              id="residentId"
              value={formData.residentId}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  residentId: event.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">
                {membersLoading
                  ? "Đang tải danh sách học viên..."
                  : "-- Chọn học viên --"}
              </option>

              {members.map((member: any) => (
                <option key={member.id} value={String(member.id)}>
                  {member.fullName} - {member.residentCode || `ID: ${member.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="contactName">Người liên hệ *</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    contactName: event.target.value,
                  })
                }
                placeholder="Nhập họ tên người liên hệ"
                required
              />
            </div>

            <div>
              <Label htmlFor="relationship">Quan hệ</Label>
              <select
                id="relationship"
                value={formData.relationship}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    relationship: event.target.value,
                  })
                }
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Cha">Cha</option>
                <option value="Mẹ">Mẹ</option>
                <option value="Anh trai">Anh trai</option>
                <option value="Chị gái">Chị gái</option>
                <option value="Người giám hộ">Người giám hộ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="phone">Số điện thoại chính *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    phone: event.target.value,
                  })
                }
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            <div>
              <Label htmlFor="backupPhone">Số điện thoại phụ</Label>
              <Input
                id="backupPhone"
                value={formData.backupPhone}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    backupPhone: event.target.value,
                  })
                }
                placeholder="Nếu có"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Địa chỉ gia đình *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  address: event.target.value,
                })
              }
              placeholder="Nhập địa chỉ gia đình"
              className="min-h-24"
              required
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <input
              type="checkbox"
              checked={formData.isPrimaryContact}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  isPrimaryContact: event.target.checked,
                })
              }
              className="h-4 w-4"
            />
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Đánh dấu là liên hệ chính
              </p>
              <p className="text-xs text-neutral-500">
                Mỗi học viên nên có một liên hệ chính. Khi chọn mục này, các
                liên hệ khác của cùng học viên sẽ được chuyển thành liên hệ phụ
                trong UI mock.
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <input
              type="checkbox"
              checked={formData.isEmergencyContact}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  isEmergencyContact: event.target.checked,
                })
              }
              className="h-4 w-4"
            />
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Đánh dấu là liên hệ khẩn cấp
              </p>
              <p className="text-xs text-neutral-500">
                Dùng khi cần liên hệ nhanh với gia đình/người giám hộ.
              </p>
            </div>
          </label>

          <div>
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  note: event.target.value,
                })
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
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Lưu mock UI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ParentContactDetailModal({
  contact,
  onClose,
  onEdit,
}: {
  contact: ParentContact;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Chi tiết liên hệ gia đình
            </p>
            <h2 className="text-xl font-bold text-neutral-900">
              {contact.contactName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-2xl bg-neutral-50 p-5">
            <p className="text-sm text-neutral-500">Học viên</p>
            <p className="mt-1 text-lg font-bold text-neutral-900">
              {contact.residentName}
            </p>
            <p className="text-sm text-neutral-500">{contact.residentCode}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoBlock label="Người liên hệ" value={contact.contactName} />
            <InfoBlock label="Quan hệ" value={contact.relationship} />
            <InfoBlock label="Số điện thoại" value={contact.phone} />
            <InfoBlock
              label="Số phụ"
              value={contact.backupPhone || "Không có"}
            />
          </div>

          <InfoBlock label="Địa chỉ gia đình" value={contact.address} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoBlock
              label="Liên hệ chính"
              value={contact.isPrimaryContact ? "Có" : "Không"}
            />

            <InfoBlock
              label="Liên hệ khẩn cấp"
              value={contact.isEmergencyContact ? "Có" : "Không"}
            />
          </div>

          <InfoBlock label="Ghi chú" value={contact.note || "Không có"} />

          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Sửa liên hệ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-neutral-800">{value}</p>
    </div>
  );
}