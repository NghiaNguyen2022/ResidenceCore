'use client';

import { getStatusLabel } from './memberUtils';

function getDisplayName(member: any) {
      if (member?.holyName && member?.fullName) {
            return `${member.holyName} ${member.fullName}`;
      }

      return member?.fullName || member?.name || 'Chưa có tên';
}

function getRawStatus(member: any) {
      return member?.status || member?.residenceStatus || '';
}

function isResidentLeft(member: any) {
      const status = getRawStatus(member);

      return (
            status === 'transferred_out' ||
            status === 'left' ||
            status === 'Đã rời lưu xá'
      );
}

function isResidentInactive(member: any) {
      const status = getRawStatus(member);

      return (
            status === 'inactive' ||
            status === 'temporary_leave' ||
            status === 'Tạm ngưng' ||
            status === 'Tạm vắng'
      );
}

function getRoomText(member: any) {
      if (isResidentLeft(member)) {
            return 'Đã rời lưu xá';
      }

      if (isResidentInactive(member)) {
            return 'Tạm ngưng lưu trú';
      }

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

function hasRoom(member: any) {
      if (isResidentLeft(member) || isResidentInactive(member)) {
            return true;
      }

      return !!(
            member?.currentRoomId ||
            member?.currentRoomName ||
            member?.currentRoomCode ||
            member?.currentRoomNumber ||
            member?.roomId ||
            member?.roomName ||
            member?.roomCode ||
            member?.roomNumber ||
            member?.room?.id ||
            member?.room?.roomId ||
            member?.room?.roomName ||
            member?.room?.roomCode ||
            member?.room?.roomNumber
      );
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

function getAccountBadge(member: any) {
      const hasUser = !!member?.userId;

      if (!hasUser) {
            return {
                  label: 'Chưa có tài khoản',
                  className: 'bg-amber-50 text-amber-700 ring-amber-200',
            };
      }

      const isAccountInactive =
            member?.userIsActive === false ||
            member?.isUserActive === false ||
            member?.accountIsActive === false;

      if (isAccountInactive || isResidentLeft(member) || isResidentInactive(member)) {
            return {
                  label: 'Đã khóa tài khoản',
                  className: 'bg-slate-100 text-slate-600 ring-slate-300',
            };
      }

      return {
            label: 'Đã có tài khoản',
            className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      };
}

function getStatusBadgeClass(member: any) {
      if (isResidentLeft(member)) {
            return 'bg-rose-50 text-rose-700 ring-rose-200';
      }

      if (isResidentInactive(member)) {
            return 'bg-amber-50 text-amber-700 ring-amber-200';
      }

      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
}

function getAttentionItems(member: any) {
      /**
       * Học viên đã rời lưu xá không còn là hồ sơ cần xử lý hằng ngày.
       * Không báo thiếu phòng, thiếu liên hệ, thiếu tài khoản ở card Simple.
       */
      if (isResidentLeft(member)) {
            return [];
      }

      const items: string[] = [];

      if (!hasRoom(member)) {
            items.push('Chưa có phòng');
      }

      if (!member?.userId) {
            items.push('Chưa có tài khoản');
      }

      const hasContact = !!(
            member?.primaryContactName &&
            member?.primaryContactPhone
      );

      if (!hasContact) {
            items.push('Thiếu liên hệ');
      }

      return items;
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
      const accountBadge = getAccountBadge(member);
      const attentionItems = getAttentionItems(member);

      const statusLabel = getStatusLabel(
            member?.status || member?.residenceStatus || 'active'
      );

      const roomText = getRoomText(member);
      const primaryContactText = getPrimaryContactText(member);

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
                                          <span
                                                className={[
                                                      'inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1',
                                                      getStatusBadgeClass(member),
                                                ].join(' ')}
                                          >
                                                {statusLabel}
                                          </span>

                                          <span
                                                className={[
                                                      'inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1',
                                                      accountBadge.className,
                                                ].join(' ')}
                                          >
                                                {accountBadge.label}
                                          </span>
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
                                                      {roomText}
                                                </div>
                                          </div>

                                          <div>
                                                <div className="text-xs text-slate-400">
                                                      Gia đình / liên hệ
                                                </div>
                                                <div
                                                      className={
                                                            primaryContactText === 'Chưa có người liên hệ' &&
                                                                  !isResidentLeft(member)
                                                                  ? 'font-medium text-amber-700'
                                                                  : 'font-medium text-slate-800'
                                                      }
                                                >
                                                      {primaryContactText}
                                                </div>
                                          </div>

                                          <div>
                                                <div className="text-xs text-slate-400">
                                                      Điện thoại
                                                </div>
                                                <div className="font-medium text-slate-800">
                                                      {member?.phoneNumber || '-'}
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

                                    {attentionItems.length > 0 && (
                                          <div className="mt-3 flex flex-wrap gap-2">
                                                {attentionItems.map((item) => (
                                                      <span
                                                            key={item}
                                                            className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
                                                      >
                                                            {item}
                                                      </span>
                                                ))}
                                          </div>
                                    )}
                              </div>
                        </div>

                        <div className="text-xs font-medium text-slate-400">
                              {selected ? 'Đang chọn' : 'Bấm để chọn'}
                        </div>
                  </div>
            </button>
      );
}

export default SimpleMemberCard;