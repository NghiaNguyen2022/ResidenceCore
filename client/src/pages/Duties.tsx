import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DutyConfigForm from "@/components/DutyConfigForm";
import DutyRotation from "@/components/DutyRotation";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";

interface DutyConfig {
  id: number;
  dutyCode: string;
  dutyName: string;
  description?: string;
  dutyType: "daily" | "weekly" | "monthly";
  startTime?: string;
  endTime?: string;
  minPersons: number;
  maxPersons: number;
  frequency: "daily" | "weekly" | "monthly";
  dayOfWeek?: number;
  requiresStudyScheduleCheck: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DutyStats {
  totalDuties: number;
  completedCount: number;
  pendingCount: number;
  skippedCount: number;
}

function DutiesPageContent() {
  const [duties, setDuties] = useState<DutyConfig[]>([]);
  const [stats, setStats] = useState<DutyStats>({
    totalDuties: 0,
    completedCount: 0,
    pendingCount: 0,
    skippedCount: 0,
  });
  const [search, setSearch] = useState("");
  const [dutyTypeFilter, setDutyTypeFilter] = useState<"all" | "daily" | "weekly" | "monthly">(
    "all"
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showRotation, setShowRotation] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState<DutyConfig | null>(null);

  // tRPC queries & mutations
  const listDutiesQuery = trpc.duties.listConfigs.useQuery({ isActive: true });
  const getDutyStatsQuery = trpc.duties.getDutyStats.useQuery({});
  const deleteDutyMutation = trpc.duties.deleteConfig.useMutation();

  // Load data
  useEffect(() => {
    if (listDutiesQuery.data) {
      setDuties(listDutiesQuery.data);
    }
  }, [listDutiesQuery.data]);

  useEffect(() => {
    if (getDutyStatsQuery.data) {
      setStats(getDutyStatsQuery.data);
    }
  }, [getDutyStatsQuery.data]);

  // Filter duties
  const filteredDuties = duties.filter((duty) => {
    const matchSearch =
      duty.dutyCode.toLowerCase().includes(search.toLowerCase()) ||
      duty.dutyName.toLowerCase().includes(search.toLowerCase());

    const matchType = dutyTypeFilter === "all" || duty.dutyType === dutyTypeFilter;

    return matchSearch && matchType;
  });

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa công tác này?")) return;

    try {
      await deleteDutyMutation.mutateAsync({ id });
      listDutiesQuery.refetch();
      getDutyStatsQuery.refetch();
    } catch (error) {
      console.error("Error deleting duty:", error);
      alert("Lỗi khi xóa công tác");
    }
  };

  // Handle edit click
  const handleEditClick = (duty: DutyConfig) => {
    setSelectedDuty(duty);
    setIsEditDialogOpen(true);
  };

  // Handle form save
  const handleFormSave = () => {
    listDutiesQuery.refetch();
    getDutyStatsQuery.refetch();
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedDuty(null);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedDuty(null);
  };

  // Handle rotation close
  const handleRotationClose = () => {
    setShowRotation(false);
  };

  // Handle rotation success
  const handleRotationSuccess = () => {
    listDutiesQuery.refetch();
    getDutyStatsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Công Tác</h1>
          <p className="text-gray-600 mt-2">Quản lý và phân công công tác hàng ngày</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRotation(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium transition"
          >
            🔄 Chia Công Tác
          </button>
          <button
            onClick={() => {
              setSelectedDuty(null);
              setIsAddDialogOpen(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
          >
            + Thêm Công Tác
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">Tổng Công Tác</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDuties}</div>
          <div className="text-gray-500 text-xs mt-2">Tất cả công tác</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">Hoàn Thành</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats.completedCount}</div>
          <div className="text-gray-500 text-xs mt-2">Công tác đã hoàn thành</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">Chưa Làm</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingCount}</div>
          <div className="text-gray-500 text-xs mt-2">Công tác chưa hoàn thành</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">Bỏ/Hủy</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{stats.skippedCount}</div>
          <div className="text-gray-500 text-xs mt-2">Công tác bị bỏ hoặc hủy</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm mã hoặc tên công tác..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={dutyTypeFilter}
            onChange={(e) => setDutyTypeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất Cả Loại</option>
            <option value="daily">Hàng Ngày</option>
            <option value="weekly">Hàng Tuần</option>
            <option value="monthly">Hàng Tháng</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Mã Công Tác
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Tên Công Tác
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Giờ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Số Người
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Trạng Thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Hành Động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDuties.length > 0 ? (
              filteredDuties.map((duty) => (
                <tr key={duty.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {duty.dutyCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {duty.dutyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        duty.dutyType === "daily"
                          ? "bg-blue-100 text-blue-800"
                          : duty.dutyType === "weekly"
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {duty.dutyType === "daily"
                        ? "Hàng Ngày"
                        : duty.dutyType === "weekly"
                        ? "Hàng Tuần"
                        : "Hàng Tháng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {duty.startTime && duty.endTime
                      ? `${duty.startTime} - ${duty.endTime}`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {duty.minPersons} - {duty.maxPersons}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        duty.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {duty.isActive ? "Hoạt Động" : "Không Hoạt Động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEditClick(duty)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(duty.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Không có công tác nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Dialog - Using DutyConfigForm Component */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thêm Công Tác Mới</h2>
            <DutyConfigForm
              duty={null}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      {/* Edit Dialog - Using DutyConfigForm Component */}
      {isEditDialogOpen && selectedDuty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sửa Công Tác</h2>
            <DutyConfigForm
              duty={selectedDuty}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      {/* Duty Rotation Modal - Using DutyRotation Component */}
      {showRotation && (
        <DutyRotation
          onClose={handleRotationClose}
          onSuccess={handleRotationSuccess}
        />
      )}
    </div>
  );
}

// Export with ResidenceCareLayout wrapper
export default function DutiesPage() {
  return (
    <ResidenceCareLayout>
      <DutiesPageContent />
    </ResidenceCareLayout>
  );
}