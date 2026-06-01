/**
 * ============================================
 * ROOMS PAGE
 * ============================================
 * Quản lý phòng - danh sách phòng, thêm/sửa/xóa
 * File: client/src/pages/Rooms.tsx
 */

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { ResidenceCareLayout } from "../components/ResidenceCareLayout";
import { RoomFormFields } from "../components/forms/RoomFormFields";
import { Form } from "@/components/ui/form";
import { trpc } from "../lib/trpc";

interface Room {
  id: number;
  roomCode: string;
  capacity: number;
  currentOccupancy?: number;
  residentsCount?: number;
  residentCount?: number;
  occupied?: number;
  currentResidents?: number;
  available?: number;
  isFull?: boolean;
  leader:
    | {
        id: number;
        residentId: number;
        residentCode: string;
        fullName: string;
        appointedDate: string;
      }
    | null;
  group:
    | {
        id: number;
        groupCode: string;
        groupName: string;
      }
    | null;
  notes: string | null;
}

interface RoomsStats {
  totalRooms: number;
}

function getRoomCurrentOccupancy(room: Room | any) {
  return Number(
    room.currentOccupancy ??
      room.residentsCount ??
      room.residentCount ??
      room.occupied ??
      room.currentResidents ??
      0
  );
}

function getRoomAvailableSlots(room: Room | any) {
  const capacity = Number(room.capacity || 0);
  const occupied = getRoomCurrentOccupancy(room);

  if (!capacity) return 0;

  return Math.max(capacity - occupied, 0);
}

function isRoomFull(room: Room | any) {
  const capacity = Number(room.capacity || 0);

  if (!capacity) return false;

  return getRoomCurrentOccupancy(room) >= capacity;
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
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${color}`}
        >
          {icon}
        </div>
      </div>
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

  const roomsListQuery = trpc.rooms.list.useQuery({
    search: search || undefined,
    capacity: capacity ? Number(capacity) : undefined,
  });

  const roomsStatsQuery = trpc.rooms.getStats.useQuery();

  useEffect(() => {
    if (roomsListQuery.data) {
      setRooms(roomsListQuery.data as Room[]);
    }
  }, [roomsListQuery.data]);

  useEffect(() => {
    if (roomsStatsQuery.data) {
      setStats({
        totalRooms: roomsStatsQuery.data.total,
      });
    }
  }, [roomsStatsQuery.data]);

  useEffect(() => {
    setLoading(roomsListQuery.isLoading || roomsStatsQuery.isLoading);
  }, [roomsListQuery.isLoading, roomsStatsQuery.isLoading]);

  const summary = useMemo(() => {
    const totalCapacity = rooms.reduce(
      (sum, room) => sum + Number(room.capacity || 0),
      0
    );

    const totalOccupied = rooms.reduce(
      (sum, room) => sum + getRoomCurrentOccupancy(room),
      0
    );

    const totalAvailable = Math.max(totalCapacity - totalOccupied, 0);
    const fullRooms = rooms.filter((room) => isRoomFull(room)).length;

    return {
      totalCapacity,
      totalOccupied,
      totalAvailable,
      fullRooms,
    };
  }, [rooms]);

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
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Quản lý lưu trú
            </p>

            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              Quản lý phòng
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Quản lý thông tin phòng lưu trú, sức chứa, số học viên hiện tại,
              trưởng phòng và tổ phòng.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingRoom(null);
              setShowAddForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Thêm phòng
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Tổng phòng"
              value={stats.totalRooms}
              subtitle="Tổng số phòng trong hệ thống"
              icon="🏢"
              color="bg-blue-50 text-blue-600"
            />

            <StatCard
              title="Tổng sức chứa"
              value={summary.totalCapacity}
              subtitle="Tổng số chỗ tối đa"
              icon="🛏️"
              color="bg-green-50 text-green-600"
            />

            <StatCard
              title="Đang ở"
              value={summary.totalOccupied}
              subtitle="Số học viên đang có phòng"
              icon="👥"
              color="bg-purple-50 text-purple-600"
            />

            <StatCard
              title="Còn trống"
              value={summary.totalAvailable}
              subtitle={`${summary.fullRooms} phòng đã đầy`}
              icon="✅"
              color="bg-orange-50 text-orange-600"
            />
          </div>
        )}

        {/* Search & Filter */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_auto]">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Tìm kiếm mã phòng
              </label>
              <input
                type="text"
                placeholder="Nhập mã phòng..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Lọc theo sức chứa
              </label>
              <select
                value={capacity}
                onChange={(event) =>
                  setCapacity(event.target.value ? Number(event.target.value) : "")
                }
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                type="button"
                onClick={() => {
                  setSearch("");
                  setCapacity("");
                }}
                className="h-10 rounded-md border border-neutral-300 px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-lg font-bold text-neutral-900">
              Danh sách phòng
            </h2>
            <p className="text-sm text-neutral-500">
              {rooms.length} phòng đang hiển thị
            </p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-10 text-center text-sm text-neutral-500">
                Đang tải dữ liệu...
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-semibold text-neutral-900">
                  Không có phòng nào
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Thử thay đổi bộ lọc hoặc thêm phòng mới.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[980px]">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Mã phòng
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Sức chứa
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Hiện tại / Sức chứa
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Còn trống
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Trưởng phòng
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Tổ
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Hành động
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                  {rooms.map((room) => {
                    const occupied = getRoomCurrentOccupancy(room);
                    const available = getRoomAvailableSlots(room);
                    const full = isRoomFull(room);

                    return (
                      <tr key={room.id} className="transition hover:bg-neutral-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-neutral-900">
                            {room.roomCode}
                          </p>
                          {room.notes && (
                            <p className="mt-1 text-xs text-neutral-500">
                              {room.notes}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-700">
                          {room.capacity} chỗ
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                              full
                                ? "bg-red-50 text-red-700"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {occupied}/{room.capacity}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                              full
                                ? "bg-red-50 text-red-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {full ? "Đã đầy" : `Còn ${available}`}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-700">
                          {room.leader ? (
                            <div>
                              <p className="font-medium text-neutral-900">
                                {room.leader.fullName}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {room.leader.residentCode}
                              </p>
                            </div>
                          ) : (
                            <span className="text-neutral-500">Chưa có</span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-700">
                          {room.group ? room.group.groupName : "-"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="rounded-lg px-2 py-1 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                            >
                              👁️ Xem
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingRoom(room);
                                setShowAddForm(true);
                              }}
                              className="rounded-lg px-2 py-1 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                            >
                              ✏️ Sửa
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteRoom(room.id)}
                              className="rounded-lg px-2 py-1 text-sm font-medium text-red-700 transition hover:bg-red-50"
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

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
  const roomSchema = z.object({
    roomCode: z.string().min(1, "Mã phòng không được để trống"),
    capacity: z.number().min(1, "Sức chứa phải lớn hơn 0"),
    groupId: z.preprocess((value) => {
      if (value === "" || value === undefined || value === null) {
        return undefined;
      }

      return Number(value);
    }, z.number().optional()),
    notes: z.string().optional(),
  });

  type RoomFormValues = z.infer<typeof roomSchema>;

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomCode: room?.roomCode || "",
      capacity: room?.capacity || 4,
      groupId: room?.group?.id,
      notes: room?.notes || "",
    },
  });

  const createRoomMutation = trpc.rooms.create.useMutation();
  const updateRoomMutation = trpc.rooms.update.useMutation();

  useEffect(() => {
    form.reset({
      roomCode: room?.roomCode || "",
      capacity: room?.capacity || 4,
      groupId: room?.group?.id,
      notes: room?.notes || "",
    });
  }, [room, form]);

  const onSubmit = async (data: RoomFormValues) => {
    try {
      if (room) {
        await updateRoomMutation.mutateAsync({
          id: room.id,
          capacity: data.capacity,
          groupId: data.groupId,
          notes: data.notes,
        });

        alert("Cập nhật phòng thành công");
        onSuccess();
      } else {
        await createRoomMutation.mutateAsync({
          roomCode: data.roomCode,
          capacity: data.capacity,
          groupId: data.groupId,
          notes: data.notes,
        });

        alert("Tạo phòng thành công");
        onSuccess();
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Lỗi xử lý");
    }
  };

  const capacityOptions = [
    { value: 4, label: "4 chỗ" },
    { value: 6, label: "6 chỗ" },
    { value: 8, label: "8 chỗ" },
    { value: 12, label: "12 chỗ" },
  ];

  const groupOptions = [
    { value: "", label: "Không chọn" },
    { value: 1, label: "Tổ A" },
    { value: 2, label: "Tổ B" },
    { value: 3, label: "Tổ C" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              {room ? "Sửa phòng" : "Thêm phòng mới"}
            </h2>
            <p className="text-sm text-neutral-500">
              Sức chứa là số chỗ tối đa, không tự giảm khi có học viên vào phòng.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <RoomFormFields
                form={form}
                capacityOptions={capacityOptions}
                groupOptions={groupOptions}
                disabledRoomCode={Boolean(room)}
              />

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
                  disabled={
                    createRoomMutation.isPending || updateRoomMutation.isPending
                  }
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createRoomMutation.isPending || updateRoomMutation.isPending
                    ? "Đang xử lý..."
                    : "Lưu"}
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}