import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, DoorOpen, Briefcase, TrendingUp, AlertCircle, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";

const taskChartData = [
  { name: "Nấu ăn", value: 5 },
  { name: "Vệ sinh", value: 4 },
  { name: "An ninh", value: 3 },
  { name: "Khác", value: 2 },
];

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
  color: "blue" | "green" | "orange" | "red" | "purple";
}

type DashboardResidentsStats = {
  total: number;
  active: number;
  inactive: number;
  transferredOut: number;
  transferred_out?: number;
};

type DashboardRoomsStats = {
  totalRooms: number;
  totalCapacity: number;
  totalOccupancy: number;
  totalAvailable: number;
  fullRooms: number;
  occupancyRate: number;
};

const defaultResidentsStats: DashboardResidentsStats = {
  total: 0,
  active: 0,
  inactive: 0,
  transferredOut: 0,
};

const defaultRoomsStats: DashboardRoomsStats = {
  totalRooms: 0,
  totalCapacity: 0,
  totalOccupancy: 0,
  totalAvailable: 0,
  fullRooms: 0,
  occupancyRate: 0,
};

function StatCard({ icon, label, value, description, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-2">{label}</p>
          <p className="stat-card-value">{value}</p>
          <p className="stat-card-description">{description}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const dashboardQuery = trpc.dashboard.getFullDashboard.useQuery();

  if (dashboardQuery.isLoading) {
    return (
      <ResidenceCareLayout>
        <div className="px-6 py-8 max-w-7xl mx-auto w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-neutral-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-80 bg-neutral-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </ResidenceCareLayout>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <ResidenceCareLayout>
        <div className="px-6 py-8 max-w-7xl mx-auto w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900">Lỗi tải dữ liệu</h3>
                <p className="text-red-700 text-sm">Không thể tải thông tin dashboard. Vui lòng thử lại.</p>
              </div>
            </div>
          </div>
        </div>
      </ResidenceCareLayout>
    );
  }

  const data = dashboardQuery.data;

  // Nếu không có data, return error
  if (!data) {
    return (
      <ResidenceCareLayout>
        <div className="px-6 py-8 max-w-7xl mx-auto w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900">Không có dữ liệu</h3>
                <p className="text-red-700 text-sm">Không thể tải thông tin dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </ResidenceCareLayout>
    );
  }

  const rawResidents = (data.residents || defaultResidentsStats) as Partial<DashboardResidentsStats>;
  const rawRooms = (data.rooms || defaultRoomsStats) as Partial<DashboardRoomsStats>;
  const residents: DashboardResidentsStats = {
    ...defaultResidentsStats,
    ...rawResidents,
    transferredOut: rawResidents.transferredOut ?? rawResidents.transferred_out ?? 0,
  };
  const rooms: DashboardRoomsStats = {
    ...defaultRoomsStats,
    ...rawRooms,
  };

  // Tính toán room status
  const availableRooms = rooms.totalAvailable || 0;
  const fullRooms = rooms.fullRooms || 0;
  const maintenanceRooms = 0; // Không có trong data hiện tại
  const closedRooms = 0; // Không có trong data hiện tại

  return (
    <ResidenceCareLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-display-lg text-neutral-900 mb-2">Dashboard</h1>
          <p className="text-body-md text-neutral-600">Tổng quan quản lý ký túc xá - Cập nhật thời gian thực</p>
        </div>

        {/* Stat Cards Grid - 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Tổng học viên lưu trú"
            value={residents.total || 0}
            description="Số học viên hiện tại"
            color="blue"
          />
          <StatCard
            icon={<DoorOpen className="w-6 h-6" />}
            label="Phòng ở"
            value={`${rooms.totalOccupancy || 0}/${rooms.totalCapacity || 0}`}
            description="Phòng sử dụng / tổng phòng"
            color="green"
          />
          <StatCard
            icon={<Briefcase className="w-6 h-6" />}
            label="Tỷ lệ chiếm dụng"
            value={`${rooms.occupancyRate || 0}%`}
            description="Mức sử dụng phòng"
            color="orange"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Phòng có sẵn"
            value={rooms.totalAvailable || 0}
            description="Phòng trống"
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Room Status Chart */}
          <div className="card-elevated">
            <h3 className="text-heading-md text-neutral-900 mb-6">Trạng thái phòng ở</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Có sẵn", value: availableRooms },
                    { name: "Đầy", value: fullRooms },
                    { name: "Bảo trì", value: maintenanceRooms },
                    { name: "Đóng", value: closedRooms },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Tasks/Assignments Chart */}
          <div className="card-elevated">
            <h3 className="text-heading-md text-neutral-900 mb-6">Phân bổ công tác hôm nay</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="value" fill="#0284c7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Summary Section */}
        <div className="card-elevated mb-8">
          <h3 className="text-heading-md text-neutral-900 mb-6">Tóm tắt phòng ở</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-body-md text-neutral-600">Phòng có sẵn</span>
              </div>
              <span className="text-heading-md text-green-600">{availableRooms}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-body-md text-neutral-600">Phòng đầy</span>
              </div>
              <span className="text-heading-md text-blue-600">{fullRooms}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-body-md text-neutral-600">Tổng phòng</span>
              </div>
              <span className="text-heading-md text-orange-600">{rooms.totalRooms}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-body-md text-neutral-600">Sức chứa</span>
              </div>
              <span className="text-heading-md text-purple-600">{rooms.totalCapacity}</span>
            </div>
          </div>
        </div>

        {/* Residents Summary Section */}
        <div className="card-elevated">
          <h3 className="text-heading-md text-neutral-900 mb-6">Tóm tắt học viên</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-body-md text-neutral-600">Đang lưu trú</span>
              </div>
              <span className="text-heading-md text-blue-600">{residents.active}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-body-md text-neutral-600">Không hoạt động</span>
              </div>
              <span className="text-heading-md text-gray-600">{residents.inactive}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-body-md text-neutral-600">Chuyển đi</span>
              </div>
              <span className="text-heading-md text-orange-600">{residents.transferredOut}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-body-md text-neutral-600">Tổng cộng</span>
              </div>
              <span className="text-heading-md text-green-600">{residents.total}</span>
            </div>
          </div>
        </div>
      </div>
    </ResidenceCareLayout>
  );
}
