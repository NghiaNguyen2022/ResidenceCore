import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, DoorOpen, Briefcase, TrendingUp, AlertCircle, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { cx, residenceMediumStyle } from "@/components/shared/styleMedium";

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
    blue: "border-blue-100 bg-blue-50/80 text-blue-700",
    green: "border-emerald-100 bg-emerald-50/80 text-emerald-700",
    orange: "border-amber-100 bg-amber-50/80 text-amber-700",
    red: "border-rose-100 bg-rose-50/80 text-rose-700",
    purple: "border-indigo-100 bg-indigo-50/80 text-indigo-700",
  };

  return (
    <div className={cx(
      "relative overflow-hidden rounded-2xl border border-amber-100/80 bg-white/90 p-4 shadow-[0_14px_34px_rgba(120,53,15,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(120,53,15,0.08)]"
    )}>
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
          <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-[#17335f]">{value}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <div className={`${colorClasses[color]} flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function DashboardPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-amber-100/80 bg-white/90 p-5 shadow-[0_16px_36px_rgba(120,53,15,0.06)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className={residenceMediumStyle.subsectionTitle}>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function SummaryItem({
  label,
  value,
  tone,
  withDivider = true,
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "orange" | "purple" | "slate";
  withDivider?: boolean;
}) {
  const toneClass = {
    blue: "bg-blue-500 text-blue-700",
    green: "bg-emerald-500 text-emerald-700",
    orange: "bg-amber-500 text-amber-700",
    purple: "bg-indigo-500 text-indigo-700",
    slate: "bg-slate-400 text-slate-600",
  }[tone];

  return (
    <div className={cx("flex items-center justify-between gap-4 pb-4", withDivider && "border-b border-slate-100")}>
      <div className="flex min-w-0 items-center gap-2">
        <span className={cx("h-2.5 w-2.5 rounded-full", toneClass.split(" ")[0])} />
        <span className="truncate text-sm font-medium text-slate-600">{label}</span>
      </div>
      <span className={cx("text-base font-semibold", toneClass.split(" ")[1])}>{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const dashboardQuery = trpc.dashboard.getFullDashboard.useQuery();

  if (dashboardQuery.isLoading) {
    return (
      <ResidenceCareLayout>
        <div className={residenceMediumStyle.page}>
          <div className={residenceMediumStyle.pageShell}>
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/4 rounded-2xl bg-amber-100/70"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/80 shadow-sm"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-80 rounded-[26px] bg-white/80 shadow-sm"></div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </ResidenceCareLayout>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <ResidenceCareLayout>
        <div className={residenceMediumStyle.page}>
          <div className={residenceMediumStyle.pageShell}>
          <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900">Lỗi tải dữ liệu</h3>
                <p className="text-red-700 text-sm">Không thể tải thông tin dashboard. Vui lòng thử lại.</p>
              </div>
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
        <div className={residenceMediumStyle.page}>
          <div className={residenceMediumStyle.pageShell}>
          <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900">Không có dữ liệu</h3>
                <p className="text-red-700 text-sm">Không thể tải thông tin dashboard.</p>
              </div>
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
      <div className={residenceMediumStyle.page}>
        <div className={residenceMediumStyle.pageShell}>
        <div className={residenceMediumStyle.topArea}>
          <div className={residenceMediumStyle.topInner}>
            <p className={residenceMediumStyle.modalEyebrow}>Tổng quan vận hành</p>
            <h1 className={residenceMediumStyle.topTitle}>Dashboard</h1>
            <p className={residenceMediumStyle.topSubtitle}>
              Theo dõi nhanh tình hình học viên, phòng ở và các điểm cần chú ý trong ngày.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Tổng học viên lưu trú"
            value={residents.total || 0}
            description="Số học viên hiện tại"
            color="blue"
          />
          <StatCard
            icon={<DoorOpen className="h-5 w-5" />}
            label="Phòng ở"
            value={`${rooms.totalOccupancy || 0}/${rooms.totalCapacity || 0}`}
            description="Phòng sử dụng / tổng phòng"
            color="green"
          />
          <StatCard
            icon={<Briefcase className="h-5 w-5" />}
            label="Tỷ lệ chiếm dụng"
            value={`${rooms.occupancyRate || 0}%`}
            description="Mức sử dụng phòng"
            color="orange"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Phòng có sẵn"
            value={rooms.totalAvailable || 0}
            description="Phòng trống"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <DashboardPanel title="Trạng thái phòng ở">
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
                  <Cell fill="#1d4ed8" />
                  <Cell fill="#d97706" />
                  <Cell fill="#e11d48" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </DashboardPanel>

          <DashboardPanel title="Phân bổ công tác hôm nay">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                  }}
                />
                <Bar dataKey="value" fill="#17335f" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </DashboardPanel>
        </div>

        <DashboardPanel title="Tóm tắt phòng ở">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryItem label="Phòng có sẵn" value={availableRooms} tone="green" />
            <SummaryItem label="Phòng đầy" value={fullRooms} tone="blue" />
            <SummaryItem label="Tổng phòng" value={rooms.totalRooms} tone="orange" />
            <SummaryItem label="Sức chứa" value={rooms.totalCapacity} tone="purple" withDivider={false} />
          </div>
        </DashboardPanel>

        <DashboardPanel title="Tóm tắt học viên">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryItem label="Đang lưu trú" value={residents.active} tone="blue" />
            <SummaryItem label="Không hoạt động" value={residents.inactive} tone="slate" />
            <SummaryItem label="Chuyển đi" value={residents.transferredOut} tone="orange" />
            <SummaryItem label="Tổng cộng" value={residents.total} tone="green" withDivider={false} />
          </div>
        </DashboardPanel>
        </div>
      </div>
    </ResidenceCareLayout>
  );
}
