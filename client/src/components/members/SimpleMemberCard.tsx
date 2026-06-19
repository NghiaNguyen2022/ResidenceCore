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
      if (isResidentLeft(member) || isResidentInactive(member)) {
            return getRoomLabelFromMember(member);
      }

      if (hasCurrentRoom(member)) {
            return getRoomLabelFromMember(member);
      }

      return 'Chưa gán';
}

function getInitials(name: string) {
      const words = name.trim().split(/\s+/).filter(Boolean);
      const picked = words.length >= 2 ? [words[0], words[words.length - 1]] : words;

      return picked
            .map((word) => word.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);
}

function getAccentClasses(index: number) {
      const accents = [
            {
                  strip: 'from-blue-400 to-indigo-400',
                  avatar: 'from-slate-800 to-blue-700',
                  soft: 'bg-blue-50 text-blue-700 ring-blue-100',
            },
            {
                  strip: 'from-emerald-400 to-teal-400',
                  avatar: 'from-emerald-700 to-teal-600',
                  soft: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
            },
            {
                  strip: 'from-violet-300 to-fuchsia-300',
                  avatar: 'from-violet-700 to-indigo-600',
                  soft: 'bg-violet-50 text-violet-700 ring-violet-100',
            },
            {
                  strip: 'from-amber-300 to-orange-300',
                  avatar: 'from-amber-700 to-orange-600',
                  soft: 'bg-amber-50 text-amber-700 ring-amber-100',
            },
      ];

      return accents[index % accents.length];
}

function InfoItem({ label, value, warning = false, muted = false }: { label: string; value: string; warning?: boolean; muted?: boolean }) {
      return (
            <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {label}
                  </div>
                  <div
                        className={[
                              'mt-0.5 truncate text-sm font-semibold',
                              warning ? 'text-amber-700' : muted ? 'text-slate-500' : 'text-slate-800',
                        ].join(' ')}
                        title={value}
                  >
                        {value}
                  </div>
            </div>
      );
}

function ActionButton({ children, onClick, disabled, tone = 'light' }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; tone?: 'dark' | 'green' | 'light'; }) {
      const toneClass = {
            dark: 'bg-slate-900 text-white hover:bg-slate-800',
            green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100',
            light: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
      }[tone];

      return (
            <button
                  type="button"
                  onClick={onClick}
                  disabled={disabled}
                  className={[
                        'inline-flex h-9 items-center justify-center rounded-2xl px-3.5 text-sm font-semibold transition',
                        'disabled:cursor-not-allowed disabled:opacity-60',
                        toneClass,
                  ].join(' ')}
            >
                  {children}
            </button>
      );
}

export function SimpleMemberCard({
      member,
      memberIndex = 0,
      organizationTitles = [],
      organizationUnits = [],
      onView,
      onEdit,
      onContacts,
      onRoomAction,
      onOrganization,
      onLeaveOrDelete,
      onReactivate,
      isRoomProcessing = false,
      isLeaving = false,
      isReactivating = false,
}: {
      member: any;
      memberIndex?: number;
      organizationTitles?: string[];
      organizationUnits?: string[];
      onView: (member: any) => void;
      onEdit?: (member: any) => void;
      onContacts?: (member: any) => void;
      onRoomAction: (member: any) => void;
      onOrganization?: (member: any) => void;
      onLeaveOrDelete: (member: any) => void;
      onReactivate: (member: any) => void;
      isRoomProcessing?: boolean;
      isLeaving?: boolean;
      isReactivating?: boolean;
}) {
      const memberHasRoom = hasCurrentRoom(member);
      const memberIsLeft = isResidentLeft(member);
      const memberIsInactive = isResidentInactive(member);
      const memberIsClosed = memberIsLeft || memberIsInactive;
      const accountBadge = getAccountBadge(member);
      const attentionItems = getAttentionItems(member);
      const accent = getAccentClasses(memberIndex);

      const displayName = getDisplayName(member);
      const statusLabel = getStatusLabel(member?.status || member?.residenceStatus || 'active');
      const roomText = getRoomTextForCard(member);
      const primaryContactText = getPrimaryContactText(member);
      const residentCode = member?.residentCode || member?.code || 'Chưa có mã';
      const phoneNumber = member?.phoneNumber || 'Chưa có SĐT';
      const unitText = organizationUnits.length > 0 ? organizationUnits.join(', ') : 'Chưa phân tổ';
      const titleText = organizationTitles.length > 0 ? organizationTitles.join(', ') : 'Chưa có chức vụ';
      const shouldHighlightMissingRoom = !memberHasRoom && !memberIsLeft && !memberIsInactive;
      const shouldHighlightMissingContact = primaryContactText === 'Chưa có người liên hệ' && !memberIsClosed;

      const cardClass = memberIsLeft
            ? 'border-rose-200/80 bg-[linear-gradient(135deg,rgba(255,241,242,0.92)_0%,rgba(255,255,255,0.82)_100%)]'
            : memberIsInactive
                  ? 'border-amber-200/85 bg-[linear-gradient(135deg,rgba(255,247,237,0.92)_0%,rgba(255,255,255,0.82)_100%)]'
                  : 'border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.86)_0%,rgba(255,251,235,0.64)_58%,rgba(245,158,11,0.12)_100%)] hover:border-amber-200/80';

      return (
            <article className={['group relative overflow-visible rounded-3xl border p-4 shadow-[0_20px_44px_rgba(12,10,9,0.075),inset_0_1px_0_rgba(255,255,255,0.72)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_60px_rgba(12,10,9,0.11),0_0_0_1px_rgba(251,191,36,0.10)]', cardClass].join(' ')}>
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0%,transparent_40%,rgba(245,158,11,0.08)_100%)]" />
                  <div className={["absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r", accent.strip].join(' ')} />
                  <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent opacity-90" />

                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-3">
                                    <div className={["hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] sm:flex", accent.avatar].join(' ')}>
                                          {getInitials(displayName)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                          <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="truncate text-base font-semibold leading-6 text-slate-950 sm:text-[17px]">
                                                      {displayName}
                                                </h3>

                                                <span className={['inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1', getStatusBadgeClass(member)].join(' ')}>
                                                      {statusLabel}
                                                </span>

                                                <span className={['inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1', accountBadge.className].join(' ')}>
                                                      {accountBadge.label}
                                                </span>
                                          </div>

                                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
                                                <span>{residentCode}</span>
                                                <span className="text-slate-300">•</span>
                                                <span>{phoneNumber}</span>
                                          </div>
                                    </div>
                              </div>

                              <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <InfoItem label="Phòng" value={roomText} warning={shouldHighlightMissingRoom} />
                                    <InfoItem label="Tổ / Ban" value={unitText} muted={organizationUnits.length === 0} />
                                    <InfoItem label="Chức vụ" value={titleText} muted={organizationTitles.length === 0} />
                                    <InfoItem label="Liên hệ chính" value={primaryContactText} warning={shouldHighlightMissingContact} />
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                    {attentionItems.length > 0 ? (
                                          attentionItems.map((item) => (
                                                <span key={item} className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                                      {item}
                                                </span>
                                          ))
                                    ) : (
                                          <span className={["inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1", accent.soft].join(' ')}>
                                                Hồ sơ ổn định
                                          </span>
                                    )}
                              </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
                              <ActionButton onClick={() => onView(member)} tone="dark">
                                    Xem
                              </ActionButton>

                              {memberIsClosed ? (
                                    <ActionButton onClick={() => onReactivate(member)} disabled={isReactivating} tone="green">
                                          {isReactivating ? 'Đang đăng ký...' : 'Đăng ký lại'}
                                    </ActionButton>
                              ) : (
                                    <>
                                          <ActionButton onClick={() => onRoomAction(member)} disabled={isRoomProcessing} tone="green">
                                                {memberHasRoom ? 'Chuyển phòng' : 'Gắn phòng'}
                                          </ActionButton>
                                    </>
                              )}
                        </div>
                  </div>
            </article>
      );
}

export default SimpleMemberCard;
