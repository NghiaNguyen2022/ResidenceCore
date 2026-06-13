import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
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
import { normalizeText } from '@/lib/text';

type ViewMode = "all" | "byResident";
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
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
          <p className="mt-1 text-xs text-neutral-500">{description}</p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">{icon}</div>
      </div>
    </div>
  );
}

export default function Parents() {
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [formResidentId, setFormResidentId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [parentTypeFilter, setParentTypeFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<any>(null);
  const [formData, setFormData] = useState<ParentFormData>(defaultFormData);
  const [error, setError] = useState<string | null>(null);

  const membersQuery = trpc.members.list.useQuery({
    search: "",
    status: undefined,
    limit: 300,
    offset: 0,
  });

  const members = membersQuery.data || [];
  const selectedResidentIdNumber = selectedResidentId ? Number(selectedResidentId) : 0;
  const formResidentIdNumber = formResidentId ? Number(formResidentId) : 0;

  const selectedResident = useMemo(() => {
    return members.find((member: any) => String(member.id) === selectedResidentId);
  }, [members, selectedResidentId]);

  const formResident = useMemo(() => {
    return members.find((member: any) => String(member.id) === formResidentId);
  }, [members, formResidentId]);

  const allParentsQuery = trpc.members.listParents.useQuery(
    {
      search: searchTerm.trim() || undefined,
      parentType:
        parentTypeFilter === "all" ? undefined : (parentTypeFilter as ParentType),
      limit: 500,
      offset: 0,
    },
    {
      enabled: viewMode === "all",
    }
  );

  const parentsByResidentQuery = trpc.members.getParents.useQuery(
    {
      residentId: selectedResidentIdNumber,
    },
    {
      enabled: viewMode === "byResident" && Boolean(selectedResidentIdNumber),
    }
  );

  const formParentsQuery = trpc.members.getParents.useQuery(
    {
      residentId: formResidentIdNumber,
    },
    {
      enabled: isFormOpen && Boolean(formResidentIdNumber),
    }
  );

  const createParentMutation = trpc.members.createParent.useMutation();
  const updateParentMutation = trpc.members.updateParent.useMutation();
  const deleteParentMutation = trpc.members.deleteParent.useMutation();

  const parents = useMemo(() => {
    if (viewMode === "all") {
      return allParentsQuery.data || [];
    }

    const byResidentParents = parentsByResidentQuery.data || [];
    const keyword = searchTerm.trim().toLowerCase();

    return byResidentParents.filter((parent: any) => {
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
  }, [
    viewMode,
    allParentsQuery.data,
    parentsByResidentQuery.data,
    searchTerm,
    parentTypeFilter,
  ]);

  const rawParentsForStats =
    viewMode === "all"
      ? allParentsQuery.data || []
      : parentsByResidentQuery.data || [];

  const fatherCount = rawParentsForStats.filter(
    (item: any) => item.parentType === "father"
  ).length;
  const motherCount = rawParentsForStats.filter(
    (item: any) => item.parentType === "mother"
  ).length;
  const guardianCount = rawParentsForStats.filter(
    (item: any) => item.parentType === "guardian"
  ).length;

  const isLoading =
    membersQuery.isLoading ||
    (viewMode === "all" ? allParentsQuery.isLoading : parentsByResidentQuery.isLoading);

  const queryError =
    membersQuery.error ||
    (viewMode === "all" ? allParentsQuery.error : parentsByResidentQuery.error);

  const refetchParents = () => {
    if (viewMode === "all") {
      allParentsQuery.refetch();
    } else {
      parentsByResidentQuery.refetch();
    }
  };

  const openCreateForm = () => {
    if (viewMode === "byResident" && !selectedResidentIdNumber) {
      setError("Vui lòng chọn học viên trước khi thêm liên hệ.");
      return;
    }

    setEditingParent(null);
    setFormData(defaultFormData);
    setFormResidentId(viewMode === "byResident" ? selectedResidentId : "");
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
    setFormResidentId(String(parent.residentId || selectedResidentId || ""));
    setError(null);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    const targetResidentId = editingParent?.residentId
      ? Number(editingParent.residentId)
      : formResidentIdNumber;

    if (!targetResidentId) {
      setError("Vui lòng chọn học viên trước khi lưu liên hệ.");
      return;
    }

    const parentsForValidation =
      formParentsQuery.data ||
      rawParentsForStats.filter(
        (parent: any) => Number(parent.residentId) === targetResidentId
      );

    const validationMessage = validateParentFormBeforeSave({
      parents: parentsForValidation,
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
        email: formData.email.trim() || undefined,
        idNumber: formData.idNumber.trim() || undefined,
        occupation: formData.occupation.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      if (editingParent?.id) {
        await updateParentMutation.mutateAsync({
          id: editingParent.id,
          ...payload,
        });
      } else {
        await createParentMutation.mutateAsync({
          residentId: targetResidentId,
          ...payload,
        });
      }

      setIsFormOpen(false);
      setEditingParent(null);
      setFormData(defaultFormData);
      setFormResidentId("");
      setError(null);
      refetchParents();
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
      refetchParents();
    } catch (err: any) {
      setError(err.message || "Lỗi khi xóa liên hệ.");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setParentTypeFilter("all");
  };

  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setSearchTerm("");
    setParentTypeFilter("all");
    setError(null);
  };

  return (
    <ResidenceCareLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Quản lý lưu trú
              </p>
              <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold text-neutral-900">
                <Users className="h-7 w-7 text-blue-600" />
                Phụ huynh / Gia đình
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                Quản lý thông tin cha, mẹ, người giám hộ theo từng học viên lưu trú.
                Có thể xem tổng hợp toàn bộ phụ huynh hoặc lọc theo một học viên cụ thể.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Thêm liên hệ
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Tổng liên hệ"
            value={rawParentsForStats.length}
            description={viewMode === "all" ? "Toàn bộ hệ thống" : "Theo học viên đang chọn"}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Cha"
            value={fatherCount}
            description="Liên hệ loại Cha"
            icon={<UserRound className="h-5 w-5" />}
          />
          <StatCard
            label="Mẹ"
            value={motherCount}
            description="Liên hệ loại Mẹ"
            icon={<UserRound className="h-5 w-5" />}
          />
          <StatCard
            label="Người giám hộ"
            value={guardianCount}
            description="Liên hệ hỗ trợ / khẩn cấp"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <Label>Phạm vi xem</Label>
              <div className="inline-flex rounded-2xl border border-neutral-200 bg-neutral-50 p-1">
                <button
                  type="button"
                  onClick={() => changeViewMode("all")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    viewMode === "all"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Tất cả phụ huynh
                </button>
                <button
                  type="button"
                  onClick={() => changeViewMode("byResident")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    viewMode === "byResident"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Theo học viên
                </button>
              </div>
            </div>

            {viewMode === "byResident" && (
              <div className="min-w-[280px] flex-1">
                <Label htmlFor="residentFilter">Chọn học viên *</Label>
                <select
                  id="residentFilter"
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
                    <option key={member.id} value={member.id}>
                      {member.fullName} - {member.residentCode || `ID: ${member.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[1fr_220px_auto]">
              <div>
                <Label htmlFor="searchParent">Tìm kiếm</Label>
                <div className="relative mt-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    id="searchParent"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Tìm phụ huynh, SĐT, email, học viên..."
                    className="pl-10"
                    disabled={viewMode === "byResident" && !selectedResidentIdNumber}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="parentTypeFilter">Loại liên hệ</Label>
                <select
                  id="parentTypeFilter"
                  value={parentTypeFilter}
                  onChange={(event) => setParentTypeFilter(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={viewMode === "byResident" && !selectedResidentIdNumber}
                >
                  <option value="all">Tất cả loại liên hệ</option>
                  <option value="father">Cha</option>
                  <option value="mother">Mẹ</option>
                  <option value="guardian">Người giám hộ</option>
                </select>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                <X className="h-4 w-4" />
                Xóa lọc
              </button>
            </div>
          </div>

          {viewMode === "byResident" && (
            <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-700">Học viên đang xem</p>
              {selectedResident ? (
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 font-bold text-blue-700">
                    {selectedResident.fullName?.charAt(0)?.toUpperCase() || "H"}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{selectedResident.fullName}</p>
                    <p className="text-xs text-neutral-500">
                      {selectedResident.residentCode || `ID: ${selectedResident.id}`}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">Chưa chọn học viên.</p>
              )}
            </div>
          )}
        </div>

        {(error || queryError) && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
              <div>
                <p className="font-semibold">Có lỗi khi xử lý dữ liệu liên hệ.</p>
                <p className="mt-1 text-sm">
                  {error || queryError?.message || "Vui lòng kiểm tra lại kết nối."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-neutral-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Danh sách liên hệ gia đình</h2>
              <p className="mt-1 text-sm text-neutral-500">
                {parents.length} liên hệ đang hiển thị
                {viewMode === "all" ? " trên toàn hệ thống." : " cho học viên đang chọn."}
              </p>
            </div>
          </div>

          {viewMode === "byResident" && !selectedResidentIdNumber ? (
            <div className="p-10 text-center text-sm text-neutral-500">
              Vui lòng chọn học viên để xem liên hệ gia đình.
            </div>
          ) : isLoading ? (
            <div className="p-10 text-center text-sm text-neutral-500">
              Đang tải danh sách liên hệ...
            </div>
          ) : parents.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="mx-auto h-10 w-10 text-neutral-300" />
              <p className="mt-3 font-semibold text-neutral-700">Chưa có liên hệ phù hợp</p>
              <p className="mt-1 text-sm text-neutral-500">
                Thêm liên hệ mới hoặc thay đổi bộ lọc để xem dữ liệu.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Người liên hệ
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Học viên
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Loại
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
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {parents.map((parent: any) => {
                    const residentName =
                      parent.residentFullName || selectedResident?.fullName || "-";
                    const residentCode =
                      parent.residentCode || selectedResident?.residentCode || "";

                    return (
                      <tr key={parent.id} className="hover:bg-neutral-50/70">
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-neutral-100 font-bold text-neutral-700">
                              {parent.fullName?.charAt(0)?.toUpperCase() || "P"}
                            </div>
                            <div>
                              <p className="font-semibold text-neutral-900">{parent.fullName}</p>
                              <p className="mt-1 text-xs text-neutral-500">ID: {parent.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-neutral-800">{residentName}</p>
                          <p className="mt-1 text-xs text-neutral-500">
                            {residentCode || `Resident ID: ${parent.residentId}`}
                          </p>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getParentTypeClass(
                              parent.parentType
                            )}`}
                          >
                            {getParentTypeLabel(parent.parentType)}
                          </span>
                        </td>

                        <td className="px-5 py-4 align-top text-sm text-neutral-600">
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-neutral-400" />
                            {parent.phoneNumber || "-"}
                          </p>
                          <p className="mt-2 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-neutral-400" />
                            {parent.email || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4 align-top text-sm text-neutral-600">
                          <p className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-neutral-400" />
                            {parent.occupation || "-"}
                          </p>
                          <p className="mt-2 flex items-center gap-2">
                            <IdCard className="h-4 w-4 text-neutral-400" />
                            {parent.idNumber || "-"}
                          </p>
                        </td>

                        <td className="max-w-xs px-5 py-4 align-top text-sm text-neutral-600">
                          <p className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 flex-none text-neutral-400" />
                            <span>{parent.address || "-"}</span>
                          </p>
                          {parent.notes && (
                            <p className="mt-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
                              {parent.notes}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right align-top">
                          <div className="flex justify-end gap-2">
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isFormOpen && (
          <ParentContactFormModal
            title={editingParent ? "Cập nhật liên hệ gia đình" : "Thêm liên hệ gia đình"}
            formData={formData}
            setFormData={setFormData}
            members={members}
            formResidentId={formResidentId}
            setFormResidentId={setFormResidentId}
            selectedResident={formResident}
            lockResident={Boolean(editingParent)}
            error={error}
            onClose={() => {
              setIsFormOpen(false);
              setEditingParent(null);
              setFormData(defaultFormData);
              setFormResidentId("");
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
  members,
  formResidentId,
  setFormResidentId,
  selectedResident,
  lockResident,
  error,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  title: string;
  formData: ParentFormData;
  setFormData: Dispatch<SetStateAction<ParentFormData>>;
  members: any[];
  formResidentId: string;
  setFormResidentId: Dispatch<SetStateAction<string>>;
  selectedResident: any;
  lockResident: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {lockResident
                ? "Khi sửa liên hệ, học viên được khóa để tránh đổi sai quan hệ dữ liệu."
                : "Chọn học viên cần gắn liên hệ, sau đó nhập thông tin cha/mẹ/người giám hộ."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="max-h-[calc(92vh-90px)] space-y-5 overflow-y-auto p-6"
        >
          <div>
            <Label htmlFor="formResidentId">Học viên *</Label>
            <select
              id="formResidentId"
              value={formResidentId}
              disabled={lockResident}
              onChange={(event) => setFormResidentId(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-neutral-100 disabled:text-neutral-500"
              required
            >
              <option value="">-- Chọn học viên --</option>
              {members.map((member: any) => (
                <option key={member.id} value={member.id}>
                  {member.fullName} - {member.residentCode || `ID: ${member.id}`}
                </option>
              ))}
            </select>
            {selectedResident && (
              <p className="mt-2 text-xs text-neutral-500">
                Đang gắn liên hệ cho: {selectedResident.fullName} - {selectedResident.residentCode || `ID: ${selectedResident.id}`}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
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
                className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  setFormData({ ...formData, fullName: event.target.value })
                }
                placeholder="Nhập họ tên cha/mẹ/người giám hộ"
                required
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Điện thoại *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(event) =>
                  setFormData({ ...formData, phoneNumber: event.target.value })
                }
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData({ ...formData, email: event.target.value })
                }
                placeholder="Nhập email"
              />
            </div>

            <div>
              <Label htmlFor="idNumber">CCCD</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(event) =>
                  setFormData({ ...formData, idNumber: event.target.value })
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
                  setFormData({ ...formData, occupation: event.target.value })
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
                setFormData({ ...formData, address: event.target.value })
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
              {isSubmitting ? "Đang lưu..." : "Lưu liên hệ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
