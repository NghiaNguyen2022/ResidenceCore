import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { X } from 'lucide-react';
import { residenceMediumStyle } from '@/components/shared/styleMedium';
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
            <div className={residenceMediumStyle.modalOverlay}>
                  <div className={`${residenceMediumStyle.modalShell} max-w-5xl`}>
                        <div className={residenceMediumStyle.modalHeader}>
                              <div>
                                    <p className={residenceMediumStyle.modalEyebrow}>
                                          {getModalTitle(member)}
                                    </p>
                                    <h2 className={residenceMediumStyle.modalTitle}>
                                          {member?.fullName || '-'}
                                    </h2>
                                    <p className={residenceMediumStyle.modalSubtitle}>
                                          Phòng hiện tại: {currentRoomLabel}
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl border border-amber-100 bg-white/75 p-2 text-slate-500 shadow-sm shadow-slate-900/5 transition hover:bg-white hover:text-slate-800"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <form
                              onSubmit={(event) => {
                                    event.preventDefault();
                                    onSubmit();
                              }}
                              className="overflow-y-auto bg-[linear-gradient(180deg,rgba(255,251,235,0.26)_0%,rgba(248,250,252,0.46)_100%)] p-5 sm:p-6"
                        >
                              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                                    <div className="space-y-5">
                                          {error && (
                                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                      {error}
                                                </div>
                                          )}

                                          {memberHasRoom ? (
                                                <div className="rounded-2xl border border-amber-100/70 bg-white/62 p-4 text-sm leading-6 text-amber-800 shadow-sm shadow-slate-900/5">
                                                      Học viên đang có phòng hiện tại. Bạn có thể chuyển sang phòng khác hoặc trả phòng.
                                                </div>
                                          ) : (
                                                <div className="rounded-2xl border border-amber-100/70 bg-white/62 p-4 text-sm leading-6 text-slate-700 shadow-sm shadow-slate-900/5">
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
                                                      className="h-10 w-full rounded-2xl border border-amber-100/70 bg-white/70 px-3 text-sm font-semibold text-slate-700 outline-none transition hover:bg-white focus:border-amber-200 focus:bg-white focus:ring-2 focus:ring-amber-100/70"
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
                                                            className="h-10 w-full rounded-2xl border border-amber-100/70 bg-white/70 px-3 text-sm font-semibold text-slate-700 outline-none transition hover:bg-white focus:border-amber-200 focus:bg-white focus:ring-2 focus:ring-amber-100/70"
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
                                                <div className="rounded-2xl border border-amber-100/70 bg-white/62 p-4 text-sm leading-6 text-amber-800 shadow-sm shadow-slate-900/5">
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
                                                      className={residenceMediumStyle.formTextarea}
                                                />
                                          </div>
                                    </div>

                                    <aside className={`${residenceMediumStyle.premiumGoldBlackSoftSurface} h-fit border-dashed p-4 lg:sticky lg:top-24`}>
                                          <div className="mb-4">
                                                <div className="text-sm font-semibold text-slate-900">
                                                      Thêm phòng nhanh
                                                </div>
                                                <p className="mt-1 text-xs leading-5 text-slate-600">
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
                                                            className={residenceMediumStyle.formInput}
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
                                                            className={residenceMediumStyle.formInput}
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
                                                            className={residenceMediumStyle.formTextarea}
                                                      />
                                                </div>

                                                <button
                                                      type="button"
                                                      onClick={onQuickCreateRoom}
                                                      disabled={isCreatingRoom}
                                                      className={`${residenceMediumStyle.buttonCardPrimary} w-full`}
                                                >
                                                      {isCreatingRoom ? 'Đang thêm phòng...' : '+ Thêm phòng'}
                                                </button>
                                          </div>
                                    </aside>
                              </div>

                              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-amber-100/60 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className={residenceMediumStyle.buttonCard}
                                    >
                                          Hủy
                                    </button>

                                    <button
                                          type="submit"
                                          disabled={isSubmitting}
                                          className={residenceMediumStyle.buttonCardPrimary}
                                    >
                                          {isSubmitting ? 'Đang lưu...' : 'Lưu thao tác phòng'}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}
