import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerInput } from '@/components/shared/form/DatePickerInput';
import type { QuickRoomFormData, RoomAssignmentData, RoomEventType } from './memberTypes';
import {
      getRoomAvailableSlots,
      getRoomCapacity,
      getRoomLabel,
      getRoomLabelFromMember,
      isRoomFull,
} from './memberUtils';

function memberHasActiveRoom(member: any) {
      /**
       * Chỉ dùng currentRoom* để quyết định nghiệp vụ phòng hiện tại.
       * Không dùng roomId/roomCode/roomName vì các field đó có thể là fallback/lịch sử.
       */
      return Boolean(
            member?.currentRoomId ||
                  member?.currentRoomName ||
                  member?.currentRoomCode ||
                  member?.currentRoomNumber
      );
}

function getActiveRoomIdFromMember(member: any) {
      return member?.currentRoomId ?? null;
}

function getCurrentRoomLabel(member: any) {
      if (!memberHasActiveRoom(member)) {
            return 'Chưa gán';
      }

      return getRoomLabelFromMember(member);
}

function getModalTitle(member: any) {
      return memberHasActiveRoom(member) ? 'Chuyển / trả phòng' : 'Gán phòng';
}

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
      const memberHasRoom = memberHasActiveRoom(member);
      const currentRoomId = getActiveRoomIdFromMember(member);
      const currentRoomLabel = getCurrentRoomLabel(member);

      useEffect(() => {
            setFormData((current) => {
                  if (!memberHasRoom && current.eventType !== 'new_entry') {
                        return {
                              ...current,
                              eventType: 'new_entry',
                              roomId: '',
                        };
                  }

                  if (memberHasRoom && current.eventType === 'new_entry') {
                        return {
                              ...current,
                              eventType: 'transfer',
                              roomId: '',
                        };
                  }

                  return current;
            });
      }, [memberHasRoom, setFormData]);

      const availableRooms = rooms.filter((room: any) => {
            if (
                  formData.eventType === 'transfer' &&
                  currentRoomId &&
                  String(room.id) === String(currentRoomId)
            ) {
                  return false;
            }

            return !isRoomFull(room);
      });

      const showRoomSelect =
            formData.eventType === 'new_entry' || formData.eventType === 'transfer';

      return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <p className="text-sm font-semibold text-green-600">
                                          {getModalTitle(member)}
                                    </p>
                                    <h2 className="text-2xl font-bold text-neutral-900">
                                          {member?.fullName || '-'}
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                          Phòng hiện tại: {currentRoomLabel}
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
                              className="p-6"
                        >
                              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                                    <div className="space-y-5">
                                          {error && (
                                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                      {error}
                                                </div>
                                          )}

                                          {memberHasRoom ? (
                                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                                      Học viên đang có phòng hiện tại. Bạn có thể chuyển sang phòng khác hoặc trả phòng.
                                                </div>
                                          ) : (
                                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                                                      Học viên hiện chưa có phòng. Có thể gán phòng mới cho học viên.
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
                                                      {memberHasRoom && (
                                                            <option value="transfer">Chuyển phòng</option>
                                                      )}
                                                      {memberHasRoom && (
                                                            <option value="left">Trả phòng / rời phòng</option>
                                                      )}
                                                </select>
                                          </div>

                                          {showRoomSelect && (
                                                <div>
                                                      <Label>
                                                            {formData.eventType === 'transfer'
                                                                  ? 'Phòng chuyển đến *'
                                                                  : 'Phòng *'}
                                                      </Label>

                                                      <select
                                                            value={formData.roomId}
                                                            onChange={(event) =>
                                                                  setFormData({
                                                                        ...formData,
                                                                        roomId: event.target.value,
                                                                  })
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
                                                <DatePickerInput
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
                                                      className="min-h-28"
                                                />
                                          </div>
                                    </div>

                                    <aside className="h-fit rounded-2xl border border-dashed border-green-200 bg-green-50/40 p-4 lg:sticky lg:top-24">
                                          <div className="mb-4">
                                                <div className="text-sm font-semibold text-green-800">
                                                      Thêm phòng nhanh
                                                </div>
                                                <p className="mt-1 text-xs leading-5 text-green-700">
                                                      Dùng khi cần gán phòng cho học viên nhưng phòng chưa có trong danh sách.
                                                      Phần này độc lập với nút lưu thao tác phòng.
                                                </p>
                                          </div>

                                          <div className="space-y-3">
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

                                                <div>
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
                                                            className="min-h-24"
                                                      />
                                                </div>

                                                <button
                                                      type="button"
                                                      onClick={onQuickCreateRoom}
                                                      disabled={isCreatingRoom}
                                                      className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                      {isCreatingRoom ? 'Đang thêm phòng...' : '+ Thêm phòng'}
                                                </button>
                                          </div>
                                    </aside>
                              </div>

                              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
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
