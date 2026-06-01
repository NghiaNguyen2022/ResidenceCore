import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Edit2,
  IdCard,
  Mail,
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

type ParentType = "father" | "mother" | "guardian";

type ParentFormData = {
  parentType: ParentType;
  fullName: string;
  phoneNumber: string;
  email: string;
  idNumber: string;
  occupation: string;
  address: string;
  notes: string;
};

const defaultFormData: ParentFormData = {
  parentType: "father",
  fullName: "",
  phoneNumber: "",
  email: "",
  idNumber: "",
  occupation: "",
  address: "",
  notes: "",
};

function normalizeText(value?: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function normalizePhone(value?: string) {
  return (value || "").replace(/[^\d]/g, "");
}

function getParentTypeLabel(type?: string) {
  if (type === "father") return "Cha";
  if (type === "mother") return "Mẹ";
  if (type === "guardian") return "Người giám hộ";

  return "Khác";
}

function getParentTypeClass(type?: string) {
  if (type === "father") return "bg-blue-50 text-blue-700";
  if (type === "mother") return "bg-pink-50 text-pink-700";
  if (type === "guardian") return "bg-purple-50 text-purple-700";

  return "bg-neutral-100 text-neutral-700";
}

function validateParentFormBeforeSave({
  parents,
  formData,
  editingParentId,
}: {
  parents: any[];
  formData: ParentFormData;
  editingParentId?: number;
}) {
  const fullName = normalizeText(formData.fullName);
  const phoneNumber = normalizePhone(formData.phoneNumber);

  if (!fullName) {
    return "Vui lòng nhập họ tên liên hệ.";
  }

  if (!phoneNumber) {
    return "Vui lòng nhập số điện thoại liên hệ.";
  }

  if (phoneNumber.length < 9 || phoneNumber.length > 15) {
    return "Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.";
  }

  const otherParents = parents.filter(
    (parent: any) => parent.id !== editingParentId
  );

  if (
    (formData.parentType === "father" || formData.parentType === "mother") &&
    otherParents.some((parent: any) => parent.parentType === formData.parentType)
  ) {
    return `Học viên này đã có thông tin ${getParentTypeLabel(
      formData.parentType
    )}. Không thể thêm trùng.`;
  }

  const duplicatedName = otherParents.some(
    (parent: any) => normalizeText(parent.fullName) === fullName
  );

  if (duplicatedName) {
    return "Tên liên hệ này đã tồn tại cho học viên đang chọn.";
  }

  const duplicatedPhone = otherParents.some(
    (parent: any) => normalizePhone(parent.phoneNumber) === phoneNumber
  );

  if (duplicatedPhone) {
    return "Số điện thoại này đã tồn tại cho học viên đang chọn.";
  }

  return null;
}

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
  const [selectedResidentId, setSelectedResidentId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [parentTypeFilter, setParentTypeFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<any>(null);
  const [formData, setFormData] = useState<ParentFormData>(defaultFormData);
  const [error, setError] = useState<string | null>(null);

  const membersQuery = trpc.members.list.useQuery({
    search: "",
    status: undefined,
    limit: 200,
    offset: 0,
  });

  const members = membersQuery.data || [];

  useEffect(() => {
    if (!selectedResidentId && members.length > 0) {
      setSelectedResidentId(String((members[0] as any).id));
    }
  }, [members, selectedResidentId]);

  const selectedResident = useMemo(() => {
    return members.find((member: any) => String(member.id) === selectedResidentId);
  }, [members, selectedResidentId]);

  const selectedResidentIdNumber = selectedResidentId
    ? Number(selectedResidentId)
    : 0;

  const parentsQuery = trpc.members.getParents.useQuery(
    {
      residentId: selectedResidentIdNumber,
    },
    {
      enabled: Boolean(selectedResidentIdNumber),
    }
  );

  const createParentMutation = trpc.members.createParent.useMutation();
  const updateParentMutation = trpc.members.updateParent.useMutation();
  const deleteParentMutation = trpc.members.deleteParent.useMutation();

  const parents = parentsQuery.data || [];

  const filteredParents = useMemo(() => {
    return parents.filter((parent: any) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        (parent.fullName || "").toLowerCase().includes(keyword) ||
        (parent.phoneNumber || "").toLowerCase().includes(keyword) ||
        (parent.email || "").toLowerCase().includes(keyword) ||
        (parent.idNumber || "").toLowerCase().includes(keyword) ||
        (parent.occupation || "").toLowerCase().includes(keyword) ||
        (parent.address || "").toLowerCase().includes(keyword) ||
        (parent.notes || "").toLowerCase().includes(keyword);

      const matchesType =
        parentTypeFilter === "all" || parent.parentType === parentTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [parents, searchTerm, parentTypeFilter]);

  const fatherCount = parents.filter((item: any) => item.parentType === "father").length;
  const motherCount = parents.filter((item: any) => item.parentType === "mother").length;
  const guardianCount = parents.filter(
    (item: any) => item.parentType === "guardian"
  ).length;

  const openCreateForm = () => {
    if (!selectedResidentIdNumber) {
      setError("Vui lòng chọn học viên trước khi thêm liên hệ.");
      return;
    }

    setEditingParent(null);
    setFormData(defaultFormData);
    setError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (parent: any) => {
    setEditingParent(parent);

    setFormData({
      parentType: parent.parentType || "father",
      fullName: parent.fullName || "",
      phoneNumber: parent.phoneNumber || "",
      email: parent.email || "",
      idNumber: parent.idNumber || "",
      occupation: parent.occupation || "",
      address: parent.address || "",
      notes: parent.notes || "",
    });

    setError(null);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!selectedResidentIdNumber) {
      setError("Vui lòng chọn học viên.");
      return;
    }

    const validationMessage = validateParentFormBeforeSave({
      parents,
      formData,
      editingParentId: editingParent?.id,
    });

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      const payload = {
        parentType: formData.parentType,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email || undefined,
        idNumber: formData.idNumber || undefined,
        occupation: formData.occupation || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
      };

      if (editingParent?.id) {
        await updateParentMutation.mutateAsync({
          id: editingParent.id,
          ...payload,
        });
      } else {
        await createParentMutation.mutateAsync({
          residentId: selectedResidentIdNumber,
          ...payload,
        });
      }

      setIsFormOpen(false);
      setEditingParent(null);
      setFormData(defaultFormData);
      setError(null);

      parentsQuery.refetch();
    } catch (err: any) {
      setError(err.message || "Lỗi khi lưu thông tin liên hệ.");
    }
  };

  const handleDelete = async (parentId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa liên hệ này?")) {
      return;
    }

    try {
      await deleteParentMutation.mutateAsync({ id: parentId });
      parentsQuery.refetch();
    } catch (err: any) {
      setError(err.message || "Lỗi khi xóa liên hệ.");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setParentTypeFilter("all");
  };

  return (
    <ResidenceCareLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Quản lý lưu trú
            </p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              Phụ huynh / Gia đình
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Quản lý thông tin cha, mẹ, người giám hộ và các liên hệ gia đình
              theo từng học viên lưu trú.
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

        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                Đã kết nối dữ liệu thật cho liên hệ gia đình
              </p>
              <p className="mt-1 text-sm">
                Mỗi học viên chỉ có tối đa 1 Cha, 1 Mẹ. Số điện thoại là bắt
                buộc và không được trùng trong cùng một học viên.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
            <div>
              <Label htmlFor="selectedResidentId">Chọn học viên *</Label>
              <select
                id="selectedResidentId"
                value={selectedResidentId}
                onChange={(event) => {
                  setSelectedResidentId(event.target.value);
                  setSearchTerm("");
                  setParentTypeFilter("all");
                  setError(null);
                }}
                className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  {membersQuery.isLoading
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

            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-800">
                Học viên đang xem
              </p>

              {selectedResident ? (
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {selectedResident.fullName?.charAt(0)?.toUpperCase() || "H"}
                  </div>

                  <div>
                    <p className="font-semibold text-neutral-900">
                      {selectedResident.fullName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {selectedResident.residentCode || `ID: ${selectedResident.id}`}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">
                  Chưa chọn học viên.
                </p>
              )}
            </div>
          </div>
        </div>

        {(error || parentsQuery.error || membersQuery.error) && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Có lỗi khi xử lý dữ liệu liên hệ.</p>
                <p className="mt-1 text-sm">
                  {error ||
                    parentsQuery.error?.message ||
                    membersQuery.error?.message ||
                    "Vui lòng kiểm tra lại kết nối."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng liên hệ"
            value={parents.length}
            description="Liên hệ của học viên đang chọn"
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            label="Cha"
            value={fatherCount}
            description="Tối đa 1 cha / học viên"
            icon={<UserRound className="h-5 w-5" />}
          />

          <StatCard
            label="Mẹ"
            value={motherCount}
            description="Tối đa 1 mẹ / học viên"
            icon={<UserRound className="h-5 w-5" />}
          />

          <StatCard
            label="Người giám hộ"
            value={guardianCount}
            description="Có thể nhiều nếu không trùng"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm người liên hệ, số điện thoại, email, địa chỉ..."
                className="pl-10"
                disabled={!selectedResidentIdNumber}
              />
            </div>

            <select
              value={parentTypeFilter}
              onChange={(event) => setParentTypeFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              disabled={!selectedResidentIdNumber}
            >
              <option value="all">Tất cả loại liên hệ</option>
              <option value="father">Cha</option>
              <option value="mother">Mẹ</option>
              <option value="guardian">Người giám hộ</option>
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

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-lg font-bold text-neutral-900">
              Danh sách liên hệ gia đình
            </h2>
            <p className="text-sm text-neutral-500">
              {filteredParents.length} liên hệ đang hiển thị cho học viên đang
              chọn.
            </p>
          </div>

          <div className="overflow-x-auto">
            {!selectedResidentIdNumber ? (
              <div className="p-10 text-center text-sm text-neutral-500">
                Vui lòng chọn học viên để xem liên hệ gia đình.
              </div>
            ) : parentsQuery.isLoading ? (
              <div className="p-10 text-center text-sm text-neutral-500">
                Đang tải danh sách liên hệ...
              </div>
            ) : filteredParents.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-semibold text-neutral-900">
                  Chưa có liên hệ phù hợp
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Thêm liên hệ mới cho học viên hoặc thay đổi bộ lọc.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[1080px]">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Người liên hệ
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Loại liên hệ
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Điện thoại / Email
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Nghề nghiệp / CCCD
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Địa chỉ / Ghi chú
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Hành động
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                  {filteredParents.map((parent: any) => (
                    <tr key={parent.id} className="transition hover:bg-neutral-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-neutral-900">
                          {parent.fullName}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Liên hệ của: {selectedResident?.fullName || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getParentTypeClass(
                            parent.parentType
                          )}`}
                        >
                          {getParentTypeLabel(parent.parentType)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-neutral-400" />
                          {parent.phoneNumber || "-"}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                          <Mail className="h-3.5 w-3.5 text-neutral-400" />
                          {parent.email || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        <p className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
                          {parent.occupation || "-"}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                          <IdCard className="h-3.5 w-3.5 text-neutral-400" />
                          {parent.idNumber || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        <div className="max-w-sm">
                          <p className="flex items-start gap-1.5">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
                            <span>{parent.address || "-"}</span>
                          </p>

                          {parent.notes && (
                            <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                              {parent.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditForm(parent)}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            title="Sửa liên hệ"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(parent.id)}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            title="Xóa liên hệ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {isFormOpen && (
          <ParentContactFormModal
            title={editingParent ? "Sửa liên hệ" : "Thêm liên hệ"}
            formData={formData}
            setFormData={setFormData}
            selectedResident={selectedResident}
            error={error}
            onClose={() => {
              setIsFormOpen(false);
              setEditingParent(null);
              setFormData(defaultFormData);
              setError(null);
            }}
            onSubmit={handleSave}
            isSubmitting={
              createParentMutation.isPending || updateParentMutation.isPending
            }
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
  selectedResident,
  error,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  title: string;
  formData: ParentFormData;
  setFormData: React.Dispatch<React.SetStateAction<ParentFormData>>;
  selectedResident: any;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
            <p className="text-sm text-neutral-500">
              Liên hệ này sẽ được gắn trực tiếp với học viên đang chọn.
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
          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-sm text-neutral-500">Học viên</p>
            <p className="mt-1 font-semibold text-neutral-900">
              {selectedResident?.fullName || "-"}
            </p>
            <p className="text-xs text-neutral-500">
              {selectedResident?.residentCode || `ID: ${selectedResident?.id || "-"}`}
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="parentType">Loại liên hệ *</Label>
            <select
              id="parentType"
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
            <Label htmlFor="fullName">Họ tên liên hệ *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  fullName: event.target.value,
                })
              }
              placeholder="Nhập họ tên cha/mẹ/người giám hộ"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="phoneNumber">Điện thoại *</Label>
              <Input
                id="phoneNumber"
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    email: event.target.value,
                  })
                }
                placeholder="Nhập email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="idNumber">CCCD</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    idNumber: event.target.value,
                  })
                }
                placeholder="Nhập CCCD nếu có"
              />
            </div>

            <div>
              <Label htmlFor="occupation">Nghề nghiệp</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    occupation: event.target.value,
                  })
                }
                placeholder="Nhập nghề nghiệp"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Địa chỉ</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  address: event.target.value,
                })
              }
              placeholder="Nhập địa chỉ liên hệ"
              className="min-h-24"
            />
          </div>

          <div>
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  notes: event.target.value,
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
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu liên hệ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}