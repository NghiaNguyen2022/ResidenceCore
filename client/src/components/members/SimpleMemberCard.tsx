'use client';

import {
      getAccountBadge,
      getAttentionItems,
      getDisplayName,
      getPrimaryContactText,
      getRoomLabelFromMember,
      getStatusBadgeClass,
      getStatusLabel,
      hasCurrentRoom,
      isResidentLeft,
} from './memberUtils';

function isResidentInactive(member: any) {
      const status = member?.status || member?.residenceStatus;

      return (
            status === 'inactive' ||
            status === 'temporary_leave' ||
            status === 'Tạm ngưng' ||
            status === 'Tạm vắng'
      );
}

function getRoomTextForCard(member: any) {
      /**
       * Card Simple Mode chỉ hiển thị phòng hiện tại.
       * Không dùng roomId/roomCode/roomName fallback để quyết định học viên đang có phòng,
       * vì các field đó có thể là dữ liệu lịch sử sau khi học viên rời và đăng ký lại.
       */
      if (isResidentLeft(member) || isResidentInactive(member)) {
            return getRoomLabelFromMember(member);
      }

      if (hasCurrentRoom(member)) {
            return getRoomLabelFromMember(member);
      }

      return 'Chưa gán';
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
      const memberHasRoom = hasCurrentRoom(member);
      const memberIsLeft = isResidentLeft(member);
      const memberIsInactive = isResidentInactive(member);
      const accountBadge = getAccountBadge(member);
      const attentionItems = getAttentionItems(member);

      const statusLabel = getStatusLabel(
            member?.status || member?.residenceStatus || 'active'
      );

      const roomText = getRoomTextForCard(member);
      const primaryContactText = getPrimaryContactText(member);
      const shouldHighlightMissingRoom =
            !memberHasRoom && !memberIsLeft && !memberIsInactive;

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
                                                            shouldHighlightMissingRoom
                                                                  ? 'font-medium text-amber-700'
                                                                  : 'font-medium text-slate-800'
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
                                                            !memberIsLeft
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
