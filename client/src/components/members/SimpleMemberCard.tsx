'use client';
import { getStatusLabel } from './memberUtils';
function getDisplayName(member: any) {
      if (member?.holyName && member?.fullName) {
            return `${member.holyName} ${member.fullName}`;
      }

      return member?.fullName || member?.name || 'Chưa có tên';
}

function getRoomText(member: any) {
      if (member?.currentRoomName) return member.currentRoomName;
      if (member?.currentRoomCode) return member.currentRoomCode;
      if (member?.currentRoomNumber) return member.currentRoomNumber;

      if (member?.roomName) return member.roomName;
      if (member?.roomCode) return member.roomCode;
      if (member?.roomNumber) return member.roomNumber;

      if (member?.room?.roomName) return member.room.roomName;
      if (member?.room?.roomCode) return member.room.roomCode;
      if (member?.room?.roomNumber) return member.room.roomNumber;

      if (member?.currentRoomId) return `Phòng ID: ${member.currentRoomId}`;
      if (member?.roomId) return `Phòng ID: ${member.roomId}`;

      return 'Chưa gán phòng';
}

function getSchoolText(member: any) {
      if (member?.schoolName && member?.className) {
            return `${member.schoolName} / ${member.className}`;
      }

      if (member?.schoolName) return member.schoolName;
      if (member?.school) return member.school;
      if (member?.className) return member.className;

      return 'Chưa có thông tin học tập';
}

function getParentTypeLabel(parentType?: string | null) {
      switch (parentType) {
            case 'father':
                  return 'Cha';
            case 'mother':
                  return 'Mẹ';
            case 'guardian':
                  return 'Người giám hộ';
            default:
                  return 'Liên hệ';
      }
}

function getPrimaryContactText(member: any) {
      if (member?.primaryContactName && member?.primaryContactPhone) {
            return `${getParentTypeLabel(member.primaryContactType)} - ${member.primaryContactName} - ${member.primaryContactPhone}`;
      }

      if (member?.primaryContactName) {
            return `${getParentTypeLabel(member.primaryContactType)} - ${member.primaryContactName}`;
      }

      if (member?.primaryParentName && member?.primaryParentPhone) {
            return `${member.primaryParentName} - ${member.primaryParentPhone}`;
      }

      if (member?.parentName && member?.parentPhone) {
            return `${member.parentName} - ${member.parentPhone}`;
      }

      if (member?.contactName && member?.contactPhone) {
            return `${member.contactName} - ${member.contactPhone}`;
      }

      return 'Chưa có người liên hệ';
}

function hasRoom(member: any) {
      if (
            member?.currentRoomId ||
            member?.currentRoomCode ||
            member?.currentRoomName
      ) {
            return true;
      }

      if (member?.roomCode || member?.roomName || member?.roomNumber) {
            return true;
      }

      /**
       * Không chỉ dựa vào roomId nếu backend chưa đồng bộ roomId khi trả/trả phòng.
       * Nhưng nếu hiện tại DB đang dùng roomId là nguồn chính thì vẫn fallback.
       */
      return !!member?.roomId;
}

function hasUser(member: any) {
      return !!member?.userId;
}

function getMissingItems(member: any) {
      const missingItems: string[] = [];

      const missingRoom = !(
            member.currentRoomId ||
            member.currentRoomCode ||
            member.currentRoomName ||
            member.roomId ||
            member.roomName ||
            member.roomNumber ||
            member.roomCode
      );
      const missingUser = !member?.userId;

      const missingContact = !(
            (member?.primaryContactName && member?.primaryContactPhone) ||
            (member?.primaryParentName && member?.primaryParentPhone) ||
            (member?.parentName && member?.parentPhone) ||
            (member?.contactName && member?.contactPhone)
      );

      if (missingRoom) missingItems.push('chưa có phòng');
      if (missingUser) missingItems.push('chưa có tài khoản');
      if (missingContact) missingItems.push('thiếu liên hệ');

      return missingItems;
}

export function SimpleMemberCard({
      member,
      selected,
      onToggleSelect,
}: {
      member: any;
      selected: boolean;
      onToggleSelect: (member: any) => void;
}) {
      const memberHasRoom = hasRoom(member);
      const memberHasUser = hasUser(member);
      const missingItems = getMissingItems(member);

      const statusLabel = getStatusLabel(
            member?.status || member?.residenceStatus || 'active'
      );

      return (
            <button
                  type="button"
                  onClick={() => onToggleSelect(member)}
                  className={[
                        'w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md',
                        selected
                              ? 'border-slate-900 ring-2 ring-slate-900/10'
                              : 'border-slate-200',
                  ].join(' ')}
            >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 flex-1 gap-3">
                              <div className="pt-1">
                                    <span
                                          className={[
                                                'flex h-5 w-5 items-center justify-center rounded-md border text-xs',
                                                selected
                                                      ? 'border-slate-900 bg-slate-900 text-white'
                                                      : 'border-slate-300 bg-white text-transparent',
                                          ].join(' ')}
                                    >
                                          ✓
                                    </span>
                              </div>

                              <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                          <div className="text-base font-semibold text-slate-900">
                                                {getDisplayName(member)}
                                          </div>

                                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                                                {statusLabel}
                                          </span>

                                          <span
                                                className={[
                                                      'inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1',
                                                      memberHasUser
                                                            ? 'bg-slate-50 text-slate-700 ring-slate-200'
                                                            : 'bg-amber-50 text-amber-700 ring-amber-200',
                                                ].join(' ')}
                                          >
                                                {memberHasUser
                                                      ? 'Đã có tài khoản'
                                                      : 'Chưa có tài khoản'}
                                          </span>

                                          {missingItems.length > 0 && (
                                                <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
                                                      Cần xử lý: {missingItems.join(', ')}
                                                </span>
                                          )}
                                    </div>

                                    <div className="mt-3 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                                          <div>
                                                <div className="text-xs text-slate-400">
                                                      Phòng
                                                </div>
                                                <div
                                                      className={
                                                            memberHasRoom
                                                                  ? 'font-medium text-slate-800'
                                                                  : 'font-medium text-amber-700'
                                                      }
                                                >
                                                      {getRoomText(member)}
                                                </div>
                                          </div>

                                          <div>
                                                <div className="text-xs text-slate-400">
                                                      Gia đình / liên hệ
                                                </div>
                                                <div className="font-medium text-slate-800">
                                                      {getPrimaryContactText(member)}
                                                </div>
                                          </div>

                                          <div>
                                                <div className="text-xs text-slate-400">
                                                      Học tập
                                                </div>
                                                <div className="font-medium text-slate-800">
                                                      {getSchoolText(member)}
                                                </div>
                                          </div>

                                          <div>
                                                <div className="text-xs text-slate-400">
                                                      Mã học viên
                                                </div>
                                                <div className="font-medium text-slate-800">
                                                      {member?.residentCode ||
                                                            member?.code ||
                                                            'Chưa có'}
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        <div className="text-xs font-medium text-slate-400">
                              {selected ? 'Đang chọn' : 'Bấm để chọn'}
                        </div>
                  </div>
            </button>
      );
}
function getAttentionItems(member: any) {
      const items: string[] = [];

      const hasRoom = !!(
            member.currentRoomId ||
            member.currentRoomCode ||
            member.currentRoomName ||
            member.roomId ||
            member.roomName ||
            member.roomNumber ||
            member.roomCode
      );

      const hasUser = !!member.userId;

      const hasContact = !!(
            member.primaryContactName &&
            member.primaryContactPhone
      );

      if (!hasRoom) {
            items.push('Chưa có phòng');
      }

      if (!hasUser) {
            items.push('Chưa có tài khoản');
      }

      if (!hasContact) {
            items.push('Thiếu liên hệ');
      }

      return items;
}

export default SimpleMemberCard;