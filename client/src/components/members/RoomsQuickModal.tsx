"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Pencil, Plus, Search, X } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type RoomFormData = {
  roomCode: string;
  capacity: string;
  notes: string;
};

const defaultRoomFormData: RoomFormData = {
  roomCode: "",
  capacity: "4",
  notes: "",
};

function getRoomCurrentOccupancy(room: any) {
  return Number(
    room?.currentOccupancy ??
      room?.residentsCount ??
      room?.residentCount ??
      room?.occupied ??
      room?.currentResidents ??
      0,
  );
}

function getRoomAvailableSlots(room: any) {
  const capacity = Number(room?.capacity || 0);
  const occupied = getRoomCurrentOccupancy(room);

  if (!capacity) return 0;

  return Math.max(capacity - occupied, 0);
}

function isRoomFull(room: any) {
  const capacity = Number(room?.capacity || 0);

  if (!capacity) return false;

  return getRoomCurrentOccupancy(room) >= capacity;
}

function normalizeRoomCode(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getFriendlyRoomError(err: any, fallback: string) {
  const rawMessage = String(err?.message || err?.data?.message || "");

  if (
    rawMessage.includes("ER_DUP_ENTRY") ||
    rawMessage.includes("Duplicate entry") ||
    rawMessage.includes("rooms_roomCode_unique") ||
    err?.data?.code === "CONFLICT"
  ) {
    return "Mã phòng đã tồn tại. Vui lòng dùng mã phòng khác.";
  }

  if (rawMessage.includes("Không thể xác định phòng vừa tạo")) {
    return "Phòng đã được lưu. Danh sách phòng đã được cập nhật lại.";
  }

  return rawMessage || fallback;
}

export function RoomsQuickModal({
  onClose,
  onChanged,
}: {
  onClose: () => void;
  onChanged?: () => void | Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [formData, setFormData] = useState<RoomFormData>(defaultRoomFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const roomsQuery = trpc.rooms.list.useQuery({
    search: search || undefined,
    limit: 300,
    offset: 0,
  } as any);

  const createRoomMutation = trpc.rooms.create.useMutation();
  const updateRoomMutation = trpc.rooms.update.useMutation();

  const rooms = roomsQuery.data || [];

  const summary = useMemo(() => {
    const totalRooms = rooms.length;
    const totalCapacity = rooms.reduce(
      (sum: number, room: any) => sum + Number(room?.capacity || 0),
      0,
    );
    const totalOccupied = rooms.reduce(
      (sum: number, room: any) => sum + getRoomCurrentOccupancy(room),
      0,
    );
    const totalAvailable = Math.max(totalCapacity - totalOccupied, 0);

    return {
      totalRooms,
      totalCapacity,
      totalOccupied,
      totalAvailable,
    };
  }, [rooms]);

  const resetForm = () => {
    setFormData(defaultRoomFormData);
    setEditingRoom(null);
    setError(null);
  };

  const openCreate = () => {
    resetForm();
    setSuccess(null);
    setMode("create");
  };

  const openEdit = (room: any) => {
    setEditingRoom(room);
    setFormData({
      roomCode: room?.roomCode || "",
      capacity: String(room?.capacity || "4"),
      notes: room?.notes || "",
    });
    setError(null);
    setSuccess(null);
    setMode("edit");
  };

  const cancelForm = () => {
    resetForm();
    setSuccess(null);
    setMode("list");
  };

  const refetchAll = async () => {
    await roomsQuery.refetch();
    await onChanged?.();
  };

  const handleCreateRoom = async () => {
    const roomCode = formData.roomCode.trim();
    const capacity = Number(formData.capacity);

    setError(null);
    setSuccess(null);

    if (!roomCode) {
      setError("Vui lòng nhập mã phòng.");
      return;
    }

    if (!capacity || capacity <= 0) {
      setError("Sức chứa phải lớn hơn 0.");
      return;
    }

    const existedRoom = rooms.some(
      (room: any) =>
        normalizeRoomCode(room?.roomCode) === normalizeRoomCode(roomCode),
    );

    if (existedRoom) {
      setError(`Mã phòng ${roomCode} đã tồn tại. Vui lòng dùng mã phòng khác.`);
      return;
    }

    try {
      await createRoomMutation.mutateAsync({
        roomCode,
        capacity,
        notes: formData.notes.trim() || undefined,
      } as any);

      setFormData(defaultRoomFormData);
      setEditingRoom(null);
      setMode("list");
      setSuccess("Đã thêm phòng thành công.");
      await refetchAll();
    } catch (err: any) {
      const message = getFriendlyRoomError(err, "Không thể thêm phòng.");

      if (message.includes("Phòng đã được lưu")) {
        setFormData(defaultRoomFormData);
        setEditingRoom(null);
        setMode("list");
        setSuccess(message);
        await refetchAll();
        return;
      }

      setError(message);
    }
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom?.id) return;

    const capacity = Number(formData.capacity);
    const occupied = getRoomCurrentOccupancy(editingRoom);

    if (!capacity || capacity <= 0) {
      setError("Sức chứa phải lớn hơn 0.");
      return;
    }

    if (capacity < occupied) {
      setError(
        `Sức chứa không được nhỏ hơn số học viên đang ở trong phòng (${occupied}).`,
      );
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      await updateRoomMutation.mutateAsync({
        id: editingRoom.id,
        capacity,
        notes: formData.notes.trim() || undefined,
      } as any);

      setFormData(defaultRoomFormData);
      setEditingRoom(null);
      setMode("list");
      setSuccess("Đã cập nhật phòng thành công.");
      await refetchAll();
    } catch (err: any) {
      setError(getFriendlyRoomError(err, "Không thể cập nhật phòng."));
    }
  };

  const isSaving = createRoomMutation.isPending || updateRoomMutation.isPending;

  return (
    <div className={residenceMediumStyle.modalOverlay}>
      <div className={`${residenceMediumStyle.modalShell} max-w-6xl`}>
        <div className={residenceMediumStyle.modalHeader}>
          <div>
            <p className={residenceMediumStyle.modalEyebrow}>
              Quản lý phòng
            </p>
            <h2 className={residenceMediumStyle.modalTitle}>
              Phòng & sức chứa
            </h2>
            <p className={residenceMediumStyle.modalSubtitle}>
              Xem nhanh tình trạng phòng, thêm phòng mới hoặc cập nhật sức chứa cơ bản.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/70 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_340px]">
          <div className="min-h-0 overflow-y-auto p-4">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Số phòng", summary.totalRooms],
                ["Sức chứa", summary.totalCapacity],
                ["Đang ở", summary.totalOccupied],
                ["Còn trống", summary.totalAvailable],
              ].map(([label, value]) => (
                <div key={label} className={residenceMediumStyle.metricCard}>
                  <div className={residenceMediumStyle.metricLabel}>{label}</div>
                  <div className={residenceMediumStyle.metricValue}>{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm mã phòng hoặc ghi chú..."
                  className={residenceMediumStyle.searchInput}
                />
              </div>

              <button
                type="button"
                onClick={openCreate}
                className={`${residenceMediumStyle.primaryButton} inline-flex items-center justify-center gap-2`}
              >
                <Plus className="h-4 w-4" />
                Thêm phòng
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-amber-100/80 bg-white/80 shadow-sm shadow-amber-900/5">
              <div className="grid grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr_0.7fr_auto] gap-3 bg-amber-50/50 px-4 py-2.5 text-xs font-semibold text-slate-500">
                <div>Phòng</div>
                <div>Sức chứa</div>
                <div>Đang ở</div>
                <div>Còn trống</div>
                <div>Trạng thái</div>
                <div className="text-right">Sửa</div>
              </div>

              {roomsQuery.isLoading ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  Đang tải danh sách phòng...
                </div>
              ) : rooms.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  Chưa có phòng nào phù hợp.
                </div>
              ) : (
                <div className="divide-y divide-amber-100/70">
                  {rooms.map((room: any) => {
                    const occupied = getRoomCurrentOccupancy(room);
                    const available = getRoomAvailableSlots(room);
                    const full = isRoomFull(room);

                    return (
                      <div
                        key={room.id}
                        className="grid grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr_0.7fr_auto] items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-amber-50/40"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">
                            {room.roomCode || `Phòng ${room.id}`}
                          </div>
                          {room.notes && (
                            <div className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                              {room.notes}
                            </div>
                          )}
                        </div>

                        <div className="font-medium text-slate-700">
                          {room.capacity || 0}
                        </div>

                        <div className="font-medium text-slate-700">
                          {occupied}
                        </div>

                        <div
                          className={
                            available > 0
                              ? "font-medium text-emerald-700"
                              : "font-medium text-rose-700"
                          }
                        >
                          {available}
                        </div>

                        <div>
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                              full
                                ? "bg-rose-50 text-rose-700 ring-rose-200"
                                : "bg-emerald-50 text-emerald-700 ring-emerald-200",
                            ].join(" ")}
                          >
                            {full ? "Đầy" : "Còn chỗ"}
                          </span>
                        </div>

                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => openEdit(room)}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-amber-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Sửa
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="min-h-0 border-t border-amber-100/80 bg-amber-50/35 p-4 lg:border-l lg:border-t-0">
            <div className="sticky top-0">
              <div className={residenceMediumStyle.cardSection}>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    {mode === "edit"
                      ? "Sửa phòng"
                      : mode === "create"
                        ? "Thêm phòng"
                        : "Thông tin phòng"}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {mode === "list"
                      ? "Chọn một phòng để sửa hoặc bấm Thêm phòng."
                      : "Chỉ nhập các thông tin cơ bản cần thiết."}
                  </p>
                </div>

                {error && (
                  <div className="mt-3 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    {success}
                  </div>
                )}

                {mode === "list" ? (
                  <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm leading-6 text-slate-600">
                    Mã phòng không chỉnh sửa sau khi tạo. Có thể dùng ghi chú để mô tả tầng, vị trí hoặc ghi chú vận hành.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className={residenceMediumStyle.fieldLabel}>
                        Mã phòng {mode === "edit" ? "(không sửa)" : "*"}
                      </label>
                      <Input
                        value={formData.roomCode}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            roomCode: event.target.value,
                          }))
                        }
                        disabled={mode === "edit"}
                        placeholder="Ví dụ: A101"
                        className={residenceMediumStyle.formInput}
                      />
                    </div>

                    <div>
                      <label className={residenceMediumStyle.fieldLabel}>
                        Sức chứa *
                      </label>
                      <Input
                        value={formData.capacity}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            capacity: event.target.value,
                          }))
                        }
                        type="number"
                        min={1}
                        className={residenceMediumStyle.formInput}
                      />
                      {mode === "edit" && editingRoom && (
                        <p className="mt-1 text-xs text-slate-400">
                          Đang ở: {getRoomCurrentOccupancy(editingRoom)} học viên.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={residenceMediumStyle.fieldLabel}>
                        Ghi chú
                      </label>
                      <Textarea
                        value={formData.notes}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            notes: event.target.value,
                          }))
                        }
                        placeholder="Ví dụ: tầng 1, gần cầu thang..."
                        className={residenceMediumStyle.formTextarea}
                      />
                    </div>

                    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={cancelForm}
                        disabled={isSaving}
                        className={residenceMediumStyle.secondaryButton}
                      >
                        Hủy
                      </button>

                      <button
                        type="button"
                        onClick={
                          mode === "edit" ? handleUpdateRoom : handleCreateRoom
                        }
                        disabled={isSaving}
                        className={residenceMediumStyle.primaryButton}
                      >
                        {isSaving
                          ? "Đang lưu..."
                          : mode === "edit"
                            ? "Lưu phòng"
                            : "Thêm phòng"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomsQuickModal;
