import type { Dispatch, SetStateAction } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { QuickRoomFormData, RoomAssignmentData, RoomEventType } from './memberTypes';
import {
      getCurrentRoomIdFromMember,
      getRoomActionLabel,
      getRoomAvailableSlots,
      getRoomCapacity,
      getRoomLabel,
      getRoomLabelFromMember,
      hasCurrentRoom,
      isRoomFull,
} from './memberUtils';

export function AssignRoomModal({
      member,
      rooms,
      error,
      formData,
      setFormData,
      quickRoomFormData,
      setQuickRoomFormData,
      onQuickCreateRoom,
      onClose,
      onSubmit,
      isSubmitting,
      isCreatingRoom,
}: {
      member: any;
      rooms: any[];
      error: string | null;
      formData: RoomAssignmentData;
      setFormData: Dispatch<SetStateAction<RoomAssignmentData>>;
      quickRoomFormData: QuickRoomFormData;
      setQuickRoomFormData: Dispatch<SetStateAction<QuickRoomFormData>>;
      onQuickCreateRoom: () => void;
      onClose: () => void;
      onSubmit: () => void;
      isSubmitting: boolean;
      isCreatingRoom: boolean;
}) {
      const memberHasRoom = hasCurrentRoom(member);

      const availableRooms = rooms.filter((room: any) => {
            if (
                  formData.eventType === 'transfer' &&
                  String(room.id) === String(getCurrentRoomIdFromMember(member))
            ) {
                  return false;
            }

            return !isRoomFull(room);
      });

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <p className="text-sm font-semibold text-green-600">
                                          {getRoomActionLabel(member)}
                                    </p>
                                    <h2 className="text-2xl font-bold text-neutral-900">
                                          {member?.fullName || '-'}
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                          Phòng hiện tại: {getRoomLabelFromMember(member)}
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
                              {error && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                          {error}
                                    </div>
                              )}

                              <div>
                                    <Label>Loại thao tác *</Label>
                                    <select
                                          value={formData.eventType}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      eventType: event.target.value as RoomEventType,
                                                      roomId: '',
                                                })
                                          }
                                          className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          {!memberHasRoom && (
                                                <option value="new_entry">Gán phòng mới</option>
                                          )}
                                          {memberHasRoom && <option value="transfer">Chuyển phòng</option>}
                                          {memberHasRoom && <option value="left">Trả phòng / rời phòng</option>}
                                    </select>
                              </div>

                              {(formData.eventType === 'new_entry' ||
                                    formData.eventType === 'transfer') && (
                                          <div>
                                                <Label>
                                                      {formData.eventType === 'transfer'
                                                            ? 'Phòng chuyển đến *'
                                                            : 'Phòng *'}
                                                </Label>

                                                <select
                                                      value={formData.roomId}
                                                      onChange={(event) =>
                                                            setFormData({ ...formData, roomId: event.target.value })
                                                      }
                                                      className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                      required
                                                >
                                                      <option value="">Chọn phòng</option>
                                                      {availableRooms.map((room: any) => {
                                                            const available = getRoomAvailableSlots(room);

                                                            return (
                                                                  <option key={room.id} value={room.id}>
                                                                        {getRoomLabel(room)}
                                                                        {available !== null
                                                                              ? ` - còn ${available}/${getRoomCapacity(room)} chỗ`
                                                                              : ''}
                                                                  </option>
                                                            );
                                                      })}
                                                </select>

                                                {availableRooms.length === 0 && (
                                                      <p className="mt-2 text-sm text-red-600">
                                                            Không còn phòng trống phù hợp để chọn.
                                                      </p>
                                                )}

                                                <div className="mt-4 rounded-2xl border border-dashed border-green-200 bg-green-50/40 p-4">
                                                      <div className="mb-3">
                                                            <div className="text-sm font-semibold text-green-800">
                                                                  Thêm phòng nhanh
                                                            </div>
                                                            <p className="mt-1 text-xs text-green-700">
                                                                  Dùng khi cần gán phòng cho học viên nhưng phòng chưa có trong danh sách.
                                                            </p>
                                                      </div>

                                                      <div className="grid gap-3 md:grid-cols-2">
                                                            <div>
                                                                  <Label>Tên / mã phòng</Label>
                                                                  <Input
                                                                        value={quickRoomFormData.roomCode}
                                                                        onChange={(event) =>
                                                                              setQuickRoomFormData((current) => ({
                                                                                    ...current,
                                                                                    roomCode: event.target.value,
                                                                              }))
                                                                        }
                                                                        placeholder="Ví dụ: P.101"
                                                                  />
                                                            </div>

                                                            <div>
                                                                  <Label>Sức chứa</Label>
                                                                  <Input
                                                                        type="number"
                                                                        min={1}
                                                                        value={quickRoomFormData.capacity}
                                                                        onChange={(event) =>
                                                                              setQuickRoomFormData((current) => ({
                                                                                    ...current,
                                                                                    capacity: event.target.value,
                                                                              }))
                                                                        }
                                                                        placeholder="Ví dụ: 4"
                                                                  />
                                                            </div>
                                                      </div>

                                                      <div className="mt-3">
                                                            <Label>Ghi chú</Label>
                                                            <Textarea
                                                                  value={quickRoomFormData.notes}
                                                                  onChange={(event) =>
                                                                        setQuickRoomFormData((current) => ({
                                                                              ...current,
                                                                              notes: event.target.value,
                                                                        }))
                                                                  }
                                                                  placeholder="Ghi chú ngắn nếu có"
                                                                  className="min-h-20"
                                                            />
                                                      </div>

                                                      <div className="mt-3 flex justify-end">
                                                            <button
                                                                  type="button"
                                                                  onClick={onQuickCreateRoom}
                                                                  disabled={isCreatingRoom}
                                                                  className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                  {isCreatingRoom ? 'Đang thêm phòng...' : '+ Thêm phòng'}
                                                            </button>
                                                      </div>
                                                </div>
                                          </div>
                                    )}

                              {formData.eventType === 'left' && (
                                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
                                          Hệ thống sẽ ghi nhận học viên trả phòng hiện tại. Sau khi lưu,
                                          học viên không còn được tính vào sức chứa phòng.
                                    </div>
                              )}

                              <div>
                                    <Label>Ngày hiệu lực *</Label>
                                    <Input
                                          type="date"
                                          value={formData.assignedDate}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      assignedDate: event.target.value,
                                                })
                                          }
                                          required
                                    />
                              </div>

                              <div>
                                    <Label>Lý do / ghi chú</Label>
                                    <Textarea
                                          value={formData.reason}
                                          onChange={(event) =>
                                                setFormData({ ...formData, reason: event.target.value })
                                          }
                                          placeholder="Nhập lý do chuyển phòng, trả phòng hoặc ghi chú thêm"
                                          className="min-h-24"
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
                                          className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                          {isSubmitting ? 'Đang lưu...' : 'Lưu thao tác phòng'}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}
