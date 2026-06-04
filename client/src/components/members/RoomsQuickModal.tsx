'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, Pencil, Plus, Search, X } from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type RoomFormData = {
      roomCode: string;
      capacity: string;
      notes: string;
};

const defaultRoomFormData: RoomFormData = {
      roomCode: '',
      capacity: '4',
      notes: '',
};

function getRoomCurrentOccupancy(room: any) {
      return Number(
            room?.currentOccupancy ??
                  room?.residentsCount ??
                  room?.residentCount ??
                  room?.occupied ??
                  room?.currentResidents ??
                  0
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

export function RoomsQuickModal({
      onClose,
      onChanged,
}: {
      onClose: () => void;
      onChanged?: () => void | Promise<void>;
}) {
      const [search, setSearch] = useState('');
      const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
      const [editingRoom, setEditingRoom] = useState<any>(null);
      const [formData, setFormData] = useState<RoomFormData>(defaultRoomFormData);
      const [error, setError] = useState<string | null>(null);

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
                  0
            );
            const totalOccupied = rooms.reduce(
                  (sum: number, room: any) => sum + getRoomCurrentOccupancy(room),
                  0
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
            setMode('create');
      };

      const openEdit = (room: any) => {
            setEditingRoom(room);
            setFormData({
                  roomCode: room?.roomCode || '',
                  capacity: String(room?.capacity || '4'),
                  notes: room?.notes || '',
            });
            setError(null);
            setMode('edit');
      };

      const cancelForm = () => {
            resetForm();
            setMode('list');
      };

      const refetchAll = async () => {
            await roomsQuery.refetch();
            await onChanged?.();
      };

      const handleCreateRoom = async () => {
            const roomCode = formData.roomCode.trim();
            const capacity = Number(formData.capacity);

            if (!roomCode) {
                  setError('Vui lòng nhập mã phòng.');
                  return;
            }

            if (!capacity || capacity <= 0) {
                  setError('Sức chứa phải lớn hơn 0.');
                  return;
            }

            try {
                  await createRoomMutation.mutateAsync({
                        roomCode,
                        capacity,
                        notes: formData.notes.trim() || undefined,
                  } as any);

                  cancelForm();
                  await refetchAll();
            } catch (err: any) {
                  setError(err.message || 'Không thể thêm phòng.');
            }
      };

      const handleUpdateRoom = async () => {
            if (!editingRoom?.id) return;

            const capacity = Number(formData.capacity);
            const occupied = getRoomCurrentOccupancy(editingRoom);

            if (!capacity || capacity <= 0) {
                  setError('Sức chứa phải lớn hơn 0.');
                  return;
            }

            if (capacity < occupied) {
                  setError(
                        `Sức chứa không được nhỏ hơn số học viên đang ở trong phòng (${occupied}).`
                  );
                  return;
            }

            try {
                  await updateRoomMutation.mutateAsync({
                        id: editingRoom.id,
                        capacity,
                        notes: formData.notes.trim() || undefined,
                  } as any);

                  cancelForm();
                  await refetchAll();
            } catch (err: any) {
                  setError(err.message || 'Không thể cập nhật phòng.');
            }
      };

      const isSaving = createRoomMutation.isPending || updateRoomMutation.isPending;

      return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4">
                  <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                              <div>
                                    <p className="text-sm font-semibold text-blue-600">
                                          Quản lý phòng nhanh
                                    </p>
                                    <h2 className="text-2xl font-bold text-slate-950">
                                          Danh sách phòng & sức chứa
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Xem sức chứa, thêm phòng và cập nhật thông tin cơ bản của phòng.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_360px]">
                              <div className="min-h-0 overflow-y-auto p-6">
                                    <div className="grid gap-3 md:grid-cols-4">
                                          <div className="rounded-2xl border bg-white p-4">
                                                <div className="text-xs text-slate-400">Số phòng</div>
                                                <div className="mt-1 text-2xl font-bold text-slate-900">
                                                      {summary.totalRooms}
                                                </div>
                                          </div>
                                          <div className="rounded-2xl border bg-white p-4">
                                                <div className="text-xs text-slate-400">Tổng sức chứa</div>
                                                <div className="mt-1 text-2xl font-bold text-slate-900">
                                                      {summary.totalCapacity}
                                                </div>
                                          </div>
                                          <div className="rounded-2xl border bg-white p-4">
                                                <div className="text-xs text-slate-400">Đang ở</div>
                                                <div className="mt-1 text-2xl font-bold text-slate-900">
                                                      {summary.totalOccupied}
                                                </div>
                                          </div>
                                          <div className="rounded-2xl border bg-white p-4">
                                                <div className="text-xs text-slate-400">Còn trống</div>
                                                <div className="mt-1 text-2xl font-bold text-slate-900">
                                                      {summary.totalAvailable}
                                                </div>
                                          </div>
                                    </div>

                                    <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                          <div className="relative flex-1">
                                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <Input
                                                      value={search}
                                                      onChange={(event) => setSearch(event.target.value)}
                                                      placeholder="Tìm mã phòng, ghi chú..."
                                                      className="pl-10"
                                                />
                                          </div>

                                          <button
                                                type="button"
                                                onClick={openCreate}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                          >
                                                <Plus className="h-4 w-4" />
                                                Thêm phòng
                                          </button>
                                    </div>

                                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                                          <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                <div>Phòng</div>
                                                <div>Sức chứa</div>
                                                <div>Đang ở</div>
                                                <div>Còn trống</div>
                                                <div>Trạng thái</div>
                                                <div className="text-right">Thao tác</div>
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
                                                <div className="divide-y divide-slate-100">
                                                      {rooms.map((room: any) => {
                                                            const occupied = getRoomCurrentOccupancy(room);
                                                            const available = getRoomAvailableSlots(room);
                                                            const full = isRoomFull(room);

                                                            return (
                                                                  <div
                                                                        key={room.id}
                                                                        className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] items-center gap-3 px-4 py-3 text-sm"
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
                                                                                          ? 'font-medium text-emerald-700'
                                                                                          : 'font-medium text-rose-700'
                                                                              }
                                                                        >
                                                                              {available}
                                                                        </div>

                                                                        <div>
                                                                              <span
                                                                                    className={[
                                                                                          'inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1',
                                                                                          full
                                                                                                ? 'bg-rose-50 text-rose-700 ring-rose-200'
                                                                                                : 'bg-emerald-50 text-emerald-700 ring-emerald-200',
                                                                                    ].join(' ')}
                                                                              >
                                                                                    {full ? 'Đầy' : 'Còn chỗ'}
                                                                              </span>
                                                                        </div>

                                                                        <div className="text-right">
                                                                              <button
                                                                                    type="button"
                                                                                    onClick={() => openEdit(room)}
                                                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
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

                              <div className="min-h-0 border-t border-slate-100 bg-slate-50 p-6 lg:border-l lg:border-t-0">
                                    <div className="sticky top-0">
                                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                                <div className="flex items-start justify-between gap-3">
                                                      <div>
                                                            <h3 className="text-lg font-bold text-slate-950">
                                                                  {mode === 'edit'
                                                                        ? 'Sửa phòng'
                                                                        : mode === 'create'
                                                                              ? 'Thêm phòng'
                                                                              : 'Thông tin phòng'}
                                                            </h3>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  {mode === 'list'
                                                                        ? 'Chọn một phòng để sửa hoặc bấm Thêm phòng.'
                                                                        : 'Cập nhật thông tin cơ bản của phòng.'}
                                                            </p>
                                                      </div>
                                                </div>

                                                {error && (
                                                      <div className="mt-4 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                                            <span>{error}</span>
                                                      </div>
                                                )}

                                                {mode === 'list' ? (
                                                      <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                                                            Mã phòng không chỉnh sửa sau khi tạo. Khi cần đổi cách hiển thị, dùng phần ghi chú/tên hiển thị tạm thời.
                                                      </div>
                                                ) : (
                                                      <div className="mt-5 space-y-4">
                                                            <div>
                                                                  <label className="text-sm font-semibold text-slate-700">
                                                                        Mã phòng {mode === 'edit' ? '(không sửa)' : '*'}
                                                                  </label>
                                                                  <Input
                                                                        value={formData.roomCode}
                                                                        onChange={(event) =>
                                                                              setFormData((current) => ({
                                                                                    ...current,
                                                                                    roomCode: event.target.value,
                                                                              }))
                                                                        }
                                                                        disabled={mode === 'edit'}
                                                                        placeholder="Ví dụ: A101"
                                                                        className="mt-1"
                                                                  />
                                                            </div>

                                                            <div>
                                                                  <label className="text-sm font-semibold text-slate-700">
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
                                                                        className="mt-1"
                                                                  />
                                                                  {mode === 'edit' && editingRoom && (
                                                                        <p className="mt-1 text-xs text-slate-400">
                                                                              Đang ở: {getRoomCurrentOccupancy(editingRoom)} học viên.
                                                                        </p>
                                                                  )}
                                                            </div>

                                                            <div>
                                                                  <label className="text-sm font-semibold text-slate-700">
                                                                        Ghi chú / tên hiển thị
                                                                  </label>
                                                                  <Textarea
                                                                        value={formData.notes}
                                                                        onChange={(event) =>
                                                                              setFormData((current) => ({
                                                                                    ...current,
                                                                                    notes: event.target.value,
                                                                              }))
                                                                        }
                                                                        placeholder="Ví dụ: Phòng gần cầu thang, tầng 1..."
                                                                        className="mt-1 min-h-24"
                                                                  />
                                                            </div>

                                                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                                                  <button
                                                                        type="button"
                                                                        onClick={cancelForm}
                                                                        disabled={isSaving}
                                                                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                                  >
                                                                        Hủy
                                                                  </button>

                                                                  <button
                                                                        type="button"
                                                                        onClick={
                                                                              mode === 'edit'
                                                                                    ? handleUpdateRoom
                                                                                    : handleCreateRoom
                                                                        }
                                                                        disabled={isSaving}
                                                                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                                  >
                                                                        {isSaving
                                                                              ? 'Đang lưu...'
                                                                              : mode === 'edit'
                                                                                    ? 'Lưu phòng'
                                                                                    : 'Thêm phòng'}
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
