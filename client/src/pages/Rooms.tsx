/**
 * ============================================
 * ROOMS PAGE
 * ============================================
 * Quản Lý Phòng - Danh sách phòng, thêm/sửa/xóa
 * File: client/src/pages/Rooms.tsx
 */

import { useState, useEffect, type FormEvent } from "react";
import { Link } from "wouter";
import { ResidenceCareLayout } from "../components/ResidenceCareLayout";
import { trpc } from "../lib/trpc";

interface Room {
  id: number;
  roomCode: string;
  capacity: number;
  currentOccupancy: number;
  available: number;
  isFull: boolean;
  leader: {
    id: number;
    residentId: number;
    residentCode: string;
    fullName: string;
    appointedDate: string;
  } | null;
  group: {
    id: number;
    groupCode: string;
    groupName: string;
  } | null;
  notes: string | null;
}

interface RoomsStats {
  totalRooms: number;
  totalCapacity: number;
  totalOccupancy: number;
  totalAvailable: number;
  fullRooms: number;
  occupancyRate: number;
}

/**
 * StatCard Component
 */
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className={`stat-card-icon ${color}`}>{icon}</span>
        <h3 className="stat-card-title">{title}</h3>
      </div>
      <div className="stat-card-value">{value}</div>
      {subtitle && <div className="stat-card-description">{subtitle}</div>}
    </div>
  );
}

/**
 * Rooms Page Component
 */
export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<RoomsStats | null>(null);
  const [search, setSearch] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // tRPC queries
  const roomsListQuery = trpc.rooms.list.useQuery({
    search: search || undefined,
    capacity: capacity ? Number(capacity) : undefined,
  });

  const roomsStatsQuery = trpc.rooms.getStats.useQuery();

  // Load data
  useEffect(() => {
    if (roomsListQuery.data) {
      // Handle both success/error response formats
      if (roomsListQuery.data.success) {
        setRooms(roomsListQuery.data.data || []);
      } else if (Array.isArray(roomsListQuery.data)) {
        // Direct array response
        setRooms(roomsListQuery.data);
      }
    }
  }, [roomsListQuery.data]);

  useEffect(() => {
    if (roomsStatsQuery.data) {
      setStats(roomsStatsQuery.data);
    }
  }, [roomsStatsQuery.data]);

  useEffect(() => {
    setLoading(roomsListQuery.isLoading || roomsStatsQuery.isLoading);
  }, [roomsListQuery.isLoading, roomsStatsQuery.isLoading]);

  // Delete room
  const deleteRoomMutation = trpc.rooms.delete.useMutation();

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa phòng này?")) return;

    try {
      await deleteRoomMutation.mutateAsync({ id: roomId });
      alert("Xóa phòng thành công");
      roomsListQuery.refetch();
      roomsStatsQuery.refetch();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Lỗi xóa phòng");
    }
  };

  return (
    <ResidenceCareLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-display-lg text-neutral-900 mb-2">Quản Lý Phòng</h1>
            <p className="text-body-md text-neutral-600">
              Quản lý thông tin phòng lưu trú, danh sách học viên, trưởng phòng
            </p>
          </div>
          <button
            onClick={() => {
              setEditingRoom(null);
              setShowAddForm(true);
            }}
            className="btn-primary"
          >
            + Thêm Phòng
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Tổng Phòng"
              value={stats.totalRooms}
              subtitle={`Sức chứa: ${stats.totalCapacity}`}
              icon="🏠"
              color="bg-blue-100"
            />
            <StatCard
              title="Chỗ Có Sẵn"
              value={stats.totalAvailable}
              subtitle={`${stats.totalAvailable} chỗ còn trống`}
              icon="✓"
              color="bg-green-100"
            />
            <StatCard
              title="Phòng Đầy"
              value={stats.fullRooms}
              subtitle={`${stats.totalOccupancy} / ${stats.totalCapacity}`}
              icon="⚠️"
              color="bg-orange-100"
            />
            <StatCard
              title="Tỷ Lệ Chiếm Dụng"
              value={`${stats.occupancyRate}%`}
              subtitle={`${stats.totalOccupancy} / ${stats.totalCapacity} chỗ`}
              icon="📊"
              color="bg-purple-100"
            />
          </div>
        )}

        {/* Search & Filter */}
        <div className="card-elevated mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-body-sm text-neutral-700 mb-2">
                Tìm kiếm mã phòng
              </label>
              <input
                type="text"
                placeholder="VD: A101, B201..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-body-sm text-neutral-700 mb-2">
                Lọc theo sức chứa
              </label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : "")}
                className="input-field"
              >
                <option value="">Tất cả</option>
                <option value="4">4 chỗ</option>
                <option value="6">6 chỗ</option>
                <option value="8">8 chỗ</option>
                <option value="12">12 chỗ</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearch("");
                  setCapacity("");
                }}
                className="btn-secondary w-full"
              >
                Xóa Bộ Lọc
              </button>
            </div>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="card-elevated overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-neutral-600">
              Đang tải dữ liệu...
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-neutral-600">
              Không có phòng nào
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="px-6 py-4 text-left text-body-sm font-semibold text-neutral-900">
                    Mã Phòng
                  </th>
                  <th className="px-6 py-4 text-left text-body-sm font-semibold text-neutral-900">
                    Sức Chứa
                  </th>
                  <th className="px-6 py-4 text-left text-body-sm font-semibold text-neutral-900">
                    Hiện Tại / Sức Chứa
                  </th>
                  <th className="px-6 py-4 text-left text-body-sm font-semibold text-neutral-900">
                    Trưởng Phòng
                  </th>
                  <th className="px-6 py-4 text-left text-body-sm font-semibold text-neutral-900">
                    Tổ
                  </th>
                  <th className="px-6 py-4 text-left text-body-sm font-semibold text-neutral-900">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr
                    key={room.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-neutral-900">
                        {room.roomCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-md text-neutral-700">
                      {room.capacity} chỗ
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-body-sm font-medium ${
                            room.isFull
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {room.currentOccupancy}/{room.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-md text-neutral-700">
                      {room.leader ? (
                        <div>
                          <div className="font-medium">{room.leader.fullName}</div>
                          <div className="text-body-sm text-neutral-600">
                            {room.leader.residentCode}
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-500">Chưa có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-body-md text-neutral-700">
                      {room.group ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-body-sm">
                          {room.group.groupName}
                        </span>
                      ) : (
                        <span className="text-neutral-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/rooms/${room.id}`}>
                          <button className="btn-ghost-sm">
                            👁️ Xem
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            setEditingRoom(room);
                            setShowAddForm(true);
                          }}
                          className="btn-ghost-sm"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="btn-danger-sm"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <AddRoomModal
            room={editingRoom}
            onClose={() => {
              setShowAddForm(false);
              setEditingRoom(null);
            }}
            onSuccess={() => {
              setShowAddForm(false);
              setEditingRoom(null);
              roomsListQuery.refetch();
              roomsStatsQuery.refetch();
            }}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

/**
 * Add/Edit Room Modal Component
 */
function AddRoomModal({
  room,
  onClose,
  onSuccess,
}: {
  room: Room | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    roomCode: room?.roomCode || "",
    capacity: room?.capacity || 4,
    groupId: room?.group?.id || "",
    notes: room?.notes || "",
  });

  const createRoomMutation = trpc.rooms.create.useMutation();
  const updateRoomMutation = trpc.rooms.update.useMutation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.roomCode.trim()) {
      alert("Vui lòng nhập mã phòng");
      return;
    }

    try {
      if (room) {
        // Update
        await updateRoomMutation.mutateAsync({
          id: room.id,
          capacity: formData.capacity,
          groupId: formData.groupId ? Number(formData.groupId) : undefined,
          notes: formData.notes,
        });

        alert("Cập nhật phòng thành công");
        onSuccess();
      } else {
        // Create
        await createRoomMutation.mutateAsync({
          roomCode: formData.roomCode,
          capacity: formData.capacity,
          groupId: formData.groupId ? Number(formData.groupId) : undefined,
          notes: formData.notes,
        });

        alert("Tạo phòng thành công");
        onSuccess();
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Lỗi xử lý");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-display-md text-neutral-900 mb-6">
          {room ? "Sửa Phòng" : "Thêm Phòng Mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-body-sm text-neutral-700 mb-2">
              Mã Phòng *
            </label>
            <input
              type="text"
              placeholder="VD: A101, B201..."
              value={formData.roomCode}
              onChange={(e) =>
                setFormData({ ...formData, roomCode: e.target.value })
              }
              disabled={!!room}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-body-sm text-neutral-700 mb-2">
              Sức Chứa *
            </label>
            <select
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: Number(e.target.value) })
              }
              className="input-field"
            >
              <option value="4">4 chỗ</option>
              <option value="6">6 chỗ</option>
              <option value="8">8 chỗ</option>
              <option value="12">12 chỗ</option>
            </select>
          </div>

          <div>
            <label className="block text-body-sm text-neutral-700 mb-2">
              Tổ (Optional)
            </label>
            <select
              value={formData.groupId}
              onChange={(e) =>
                setFormData({ ...formData, groupId: e.target.value })
              }
              className="input-field"
            >
              <option value="">Không chọn</option>
              <option value="1">Tổ A</option>
              <option value="2">Tổ B</option>
              <option value="3">Tổ C</option>
            </select>
          </div>

          <div>
            <label className="block text-body-sm text-neutral-700 mb-2">
              Ghi Chú
            </label>
            <textarea
              placeholder="Ghi chú thêm..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="input-field min-h-24"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={
                createRoomMutation.isPending || updateRoomMutation.isPending
              }
            >
              {createRoomMutation.isPending || updateRoomMutation.isPending
                ? "Đang xử lý..."
                : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}