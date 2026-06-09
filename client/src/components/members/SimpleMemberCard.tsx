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

function getLeftCardClass(member: any) {
      if (isResidentLeft(member)) {
            return 'border-rose-200 bg-rose-50/60 hover:border-rose-300';
      }

      if (isResidentInactive(member)) {
            return 'border-amber-200 bg-amber-50/40 hover:border-amber-300';
      }

      return 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md';
}

export function SimpleMemberCard({
      member,
      organizationTitles = [],
      onView,
      onRoomAction,
      onLeaveOrDelete,
      onReactivate,
      isRoomProcessing = false,
      isLeaving = false,
      isReactivating = false,
}: {
      member: any;
      organizationTitles?: string[];
      onView: (member: any) => void;
      onRoomAction: (member: any) => void;
      onLeaveOrDelete: (member: any) => void;
      onReactivate: (member: any) => void;
      isRoomProcessing?: boolean;
      isLeaving?: boolean;
      isReactivating?: boolean;
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
            <div
                  className={[
                        'w-full rounded-2xl border p-4 text-left shadow-sm transition',
                        getLeftCardClass(member),
                  ].join(' ')}
            >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
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
                                          <div className="text-xs text-slate-400">Phòng</div>
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
                                          <div className="text-xs text-slate-400">Điện thoại</div>
                                          <div className="font-medium text-slate-800">
                                                {member?.phoneNumber || '-'}
                                          </div>
                                    </div>

                                    <div>
                                          <div className="text-xs text-slate-400">Mã học viên</div>
                                          <div className="font-medium text-slate-800">
                                                {member?.residentCode || member?.code || 'Chưa có'}
                                          </div>
                                    </div>
                              </div>

                              {organizationTitles.length > 0 && (
                                    <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-3 py-2">
                                          <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                                                      Chức vụ
                                                </span>

                                                {organizationTitles.map((title) => (
                                                      <span
                                                            key={title}
                                                            className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100"
                                                      >
                                                            {title}
                                                      </span>
                                                ))}
                                          </div>
                                    </div>
                              )}

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

                        <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
                              <button
                                    type="button"
                                    onClick={() => onView(member)}
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                    Xem chi tiết
                              </button>

                              {memberIsLeft ? (
                                    <button
                                          type="button"
                                          onClick={() => onReactivate(member)}
                                          disabled={isReactivating}
                                          className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                          {isReactivating ? 'Đang đăng ký...' : 'Đăng ký lại'}
                                    </button>
                              ) : (
                                    <>
                                          <button
                                                type="button"
                                                onClick={() => onRoomAction(member)}
                                                disabled={isRoomProcessing}
                                                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                                {memberHasRoom ? 'Chuyển phòng' : 'Gắn phòng'}
                                          </button>

                                          <button
                                                type="button"
                                                onClick={() => onLeaveOrDelete(member)}
                                                disabled={isLeaving}
                                                className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                                Ngừng / Rời
                                          </button>
                                    </>
                              )}
                        </div>
                  </div>
            </div>
      );
}

export default SimpleMemberCard;
