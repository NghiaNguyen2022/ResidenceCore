import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerInput } from '@/components/shared/form/DatePickerInput';
import { residenceMediumStyle } from '@/components/shared/styleMedium';
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
                                    className="rounded-xl p-2 text-slate-500 transition hover:bg-white/70 hover:text-slate-700"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <form
                              onSubmit={(event) => {
                                    event.preventDefault();
                                    onSubmit();
                              }}
                              className="min-h-0 overflow-y-auto px-5 py-4"
                        >
                              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                                    <div className="space-y-4">
                                          {error && (
                                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                      {error}
                                                </div>
                                          )}

                                          <div
                                                className={[
                                                      'rounded-2xl border px-4 py-3 text-sm leading-6',
                                                      memberHasRoom
                                                            ? 'border-amber-100 bg-amber-50/70 text-amber-800'
                                                            : 'border-emerald-100 bg-emerald-50/70 text-emerald-800',
                                                ].join(' ')}
                                          >
                                                {memberHasRoom
                                                      ? 'Học viên đang có phòng hiện tại. Có thể chuyển sang phòng khác hoặc trả phòng.'
                                                      : 'Học viên hiện chưa có phòng. Có thể gán phòng mới cho học viên.'}
                                          </div>

                                          <div className={residenceMediumStyle.cardSection}>
                                                <div className="mb-3">
                                                      <h3 className="text-base font-bold text-slate-950">
                                                            Thao tác phòng
                                                      </h3>
                                                      <p className="mt-1 text-sm text-slate-500">
                                                            Chọn loại thao tác, phòng và ngày hiệu lực.
                                                      </p>
                                                </div>

                                                <div className="grid gap-3 md:grid-cols-2">
                                                      <div>
                                                            <label className={residenceMediumStyle.fieldLabel}>
                                                                  Loại thao tác *
                                                            </label>
                                                            <select
                                                                  value={formData.eventType}
                                                                  onChange={(event) =>
                                                                        setFormData({
                                                                              ...formData,
                                                                              eventType: event.target.value as RoomEventType,
                                                                              roomId: '',
                                                                        })
                                                                  }
                                                                  className="mt-1 h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
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

                                                      <div>
                                                            <label className={residenceMediumStyle.fieldLabel}>
                                                                  Ngày hiệu lực *
                                                            </label>
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

                                                      {showRoomSelect && (
                                                            <div className="md:col-span-2">
                                                                  <label className={residenceMediumStyle.fieldLabel}>
                                                                        {formData.eventType === 'transfer'
                                                                              ? 'Phòng chuyển đến *'
                                                                              : 'Phòng *'}
                                                                  </label>

                                                                  <select
                                                                        value={formData.roomId}
                                                                        onChange={(event) =>
                                                                              setFormData({
                                                                                    ...formData,
                                                                                    roomId: event.target.value,
                                                                              })
                                                                        }
                                                                        className="mt-1 h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
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
                                                            <div className="md:col-span-2 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm leading-6 text-orange-700">
                                                                  Hệ thống sẽ ghi nhận học viên trả phòng hiện tại. Sau khi lưu,
                                                                  học viên không còn được tính vào sức chứa phòng.
                                                            </div>
                                                      )}

                                                      <div className="md:col-span-2">
                                                            <label className={residenceMediumStyle.fieldLabel}>
                                                                  Lý do / ghi chú
                                                            </label>
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
                                          </div>
                                    </div>

                                    <aside className="h-fit rounded-2xl border border-amber-100/80 bg-amber-50/45 p-4 shadow-sm shadow-amber-900/5 lg:sticky lg:top-24">
                                          <div className="mb-3">
                                                <div className="text-base font-bold text-slate-950">
                                                      Thêm phòng nhanh
                                                </div>
                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                      Dùng khi cần gán phòng nhưng phòng chưa có trong danh sách.
                                                </p>
                                          </div>

                                          <div className="space-y-3">
                                                <div>
                                                      <label className={residenceMediumStyle.fieldLabel}>
                                                            Tên / mã phòng
                                                      </label>
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
                                                      <label className={residenceMediumStyle.fieldLabel}>
                                                            Sức chứa
                                                      </label>
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
                                                      <label className={residenceMediumStyle.fieldLabel}>
                                                            Ghi chú
                                                      </label>
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
                                                      className={`${residenceMediumStyle.primaryButton} w-full`}
                                                >
                                                      {isCreatingRoom ? 'Đang thêm phòng...' : '+ Thêm phòng'}
                                                </button>
                                          </div>
                                    </aside>
                              </div>

                              <div className="sticky bottom-0 mt-4 flex flex-col-reverse gap-2 border-t border-amber-100/80 bg-white/90 px-0 py-4 backdrop-blur sm:flex-row sm:justify-end">
                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className={residenceMediumStyle.secondaryButton}
                                    >
                                          Hủy
                                    </button>

                                    <button
                                          type="submit"
                                          disabled={isSubmitting}
                                          className={residenceMediumStyle.primaryButton}
                                    >
                                          {isSubmitting ? 'Đang lưu...' : 'Lưu thao tác phòng'}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}
