'use client';

import { useState, type ReactNode } from 'react';
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
import {
      createEmptyOrganizationDisplay,
      getOrganizationUnitColorClass,
      type MemberOrganizationDisplay,
      type OrganizationRoleDisplay,
      type OrganizationUnitDisplay,
} from './memberOrganizationDisplay';

type OrganizationAction = 'add_team' | 'transfer_team' | 'add_committee' | 'appointment';

type PrimaryContactSummary = {
      relation: string;
      name: string;
      phone: string;
      isMissing: boolean;
};

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

function getParentTypeLabel(parentType?: string | null) {
      switch (parentType) {
            case 'father':
                  return 'Cha';
            case 'mother':
                  return 'Mẹ';
            case 'guardian':
                  return 'Người giám hộ';
            default:
                  return 'Liên hệ chính';
      }
}

function splitContactText(text: string): PrimaryContactSummary {
      if (!text || text === 'Chưa có người liên hệ') {
            return {
                  relation: 'Chưa có liên hệ chính',
                  name: 'Cần bổ sung',
                  phone: '',
                  isMissing: true,
            };
      }

      const parts = text
            .split(/[-–—•|]/)
            .map((item) => item.trim())
            .filter(Boolean);

      if (parts.length >= 3) {
            return {
                  relation: parts[0],
                  name: parts[1],
                  phone: parts.slice(2).join(' - '),
                  isMissing: false,
            };
      }

      if (parts.length === 2) {
            return {
                  relation: parts[0],
                  name: parts[1],
                  phone: '',
                  isMissing: false,
            };
      }

      return {
            relation: 'Liên hệ chính',
            name: text,
            phone: '',
            isMissing: false,
      };
}

function getPrimaryContactSummary(member: any): PrimaryContactSummary {
      const relation =
            member?.primaryContactType ||
            member?.primaryParentType ||
            member?.contactType ||
            member?.parentType;

      const name =
            member?.primaryContactName ||
            member?.primaryParentName ||
            member?.contactName ||
            member?.parentName;

      const phone =
            member?.primaryContactPhone ||
            member?.primaryParentPhone ||
            member?.contactPhone ||
            member?.parentPhone;

      if (name || phone) {
            return {
                  relation: getParentTypeLabel(relation),
                  name: name || 'Chưa có tên',
                  phone: phone || 'Chưa có số điện thoại',
                  isMissing: false,
            };
      }

      return splitContactText(getPrimaryContactText(member));
}

function ActionButton({
      children,
      onClick,
      disabled,
      tone = 'light',
}: {
      children: ReactNode;
      onClick: () => void;
      disabled?: boolean;
      tone?: 'dark' | 'green' | 'light';
}) {
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

function InlineActionButton({
      children,
      onClick,
}: {
      children: ReactNode;
      onClick?: () => void;
}) {
      if (!onClick) return null;

      return (
            <button
                  type="button"
                  onClick={onClick}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
                  {children}
            </button>
      );
}

function UnitBadge({ unit }: { unit: OrganizationUnitDisplay }) {
      return (
            <span
                  className={[
                        'inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                        unit.colorClass || getOrganizationUnitColorClass(unit.unitName),
                  ].join(' ')}
                  title={unit.leaderLabel ? `${unit.unitName} - ${unit.leaderLabel}` : unit.unitName}
            >
                  <span className="truncate">{unit.unitName}</span>
                  {unit.isLeader && (
                        <span aria-label={unit.leaderLabel || 'Phụ trách'} title={unit.leaderLabel}>
                              {unit.unitType === 'committee' ? '♛' : '♕'}
                        </span>
                  )}
            </span>
      );
}

function UnitLine({
      label,
      units,
      emptyText,
      addText,
      changeText,
      actionText,
      onAdd,
}: {
      label: string;
      units: OrganizationUnitDisplay[];
      emptyText: string;
      addText: string;
      changeText: string;
      actionText?: string;
      onAdd?: () => void;
}) {
      return (
            <div className="grid grid-cols-[56px_1fr_auto] items-start gap-2">
                  <div className="pt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        {label}
                  </div>

                  <div className="flex min-w-0 flex-wrap gap-1.5">
                        {units.length > 0 ? (
                              units.map((unit) => (
                                    <UnitBadge
                                          key={`${unit.unitType}-${unit.unitId || unit.unitName}`}
                                          unit={unit}
                                    />
                              ))
                        ) : (
                              <span className="pt-1 text-sm font-medium text-slate-500">
                                    {emptyText}
                              </span>
                        )}
                  </div>

                  <InlineActionButton onClick={onAdd}>
                        {actionText || (units.length > 0 ? changeText : addText)}
                  </InlineActionButton>
            </div>
      );
}

function RoleList({
      roles,
      onAppoint,
}: {
      roles: OrganizationRoleDisplay[];
      onAppoint?: () => void;
}) {
      return (
            <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              Chức vụ
                        </div>

                        <InlineActionButton onClick={onAppoint}>
                              Bổ nhiệm
                        </InlineActionButton>
                  </div>

                  {roles.length > 0 ? (
                        <div className="space-y-1">
                              {roles.map((role) => (
                                    <div
                                          key={`${role.id || role.title}`}
                                          className="rounded-xl bg-white px-3 py-2 text-sm font-semibold leading-5 text-slate-800 ring-1 ring-slate-100"
                                    >
                                          {role.title}
                                    </div>
                              ))}
                        </div>
                  ) : (
                        <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500 ring-1 ring-slate-100">
                              Chưa có chức vụ
                        </div>
                  )}
            </div>
      );
}

function OrganizationBlock({
      display,
      onOrganization,
}: {
      display: MemberOrganizationDisplay;
      onOrganization?: (action: OrganizationAction, context?: { unitId?: number | null }) => void;
}) {
      const currentTeam = display.teams[0] || null;

      return (
            <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-2">
                        <div>
                              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                    Tổ chức
                              </div>
                              <div className="mt-0.5 text-xs font-medium text-slate-500">
                                    Tổ, ban và chức vụ hiện tại
                              </div>
                        </div>

                        <InlineActionButton onClick={onOrganization ? () => onOrganization('appointment') : undefined}>
                              Bổ nhiệm
                        </InlineActionButton>
                  </div>

                  <div className="grid gap-3 2xl:grid-cols-[1fr_1.15fr]">
                        <div className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                              <UnitLine
                                    label="Tổ"
                                    units={display.teams}
                                    emptyText="Chưa vào tổ"
                                    addText="+ Tổ"
                                    changeText="Đổi tổ"
                                    onAdd={
                                          onOrganization
                                                ? () =>
                                                        onOrganization(
                                                              currentTeam ? 'transfer_team' : 'add_team',
                                                              { unitId: currentTeam?.unitId ?? null }
                                                        )
                                                : undefined
                                    }
                              />

                              <div className="my-2 border-t border-slate-100" />

                              <UnitLine
                                    label="Ban"
                                    units={display.committees}
                                    emptyText="Chưa vào ban"
                                    addText="+ Ban"
                                    changeText="+ Ban"
                                    actionText="+ Ban"
                                    onAdd={onOrganization ? () => onOrganization('add_committee') : undefined}
                              />
                        </div>

                        <RoleList
                              roles={display.roles}
                              onAppoint={undefined}
                        />
                  </div>
            </div>
      );
}

function ContactBlock({
      contact,
      onOpenContacts,
}: {
      contact: PrimaryContactSummary;
      onOpenContacts?: () => void;
}) {
      return (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              Liên hệ chính
                        </div>

                        <InlineActionButton onClick={onOpenContacts}>
                              {contact.isMissing ? '+ Liên hệ' : 'Liên hệ'}
                        </InlineActionButton>
                  </div>

                  <div
                        className={[
                              'space-y-0.5 text-sm',
                              contact.isMissing ? 'text-amber-700' : 'text-slate-800',
                        ].join(' ')}
                  >
                        <div className="font-bold">{contact.relation}</div>
                        <div className="font-semibold">{contact.name}</div>
                        {contact.phone && (
                              <div className="font-medium text-slate-600">{contact.phone}</div>
                        )}
                  </div>
            </div>
      );
}

export function SimpleMemberCard({
      member,
      memberIndex = 0,
      organizationDisplay,
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
      organizationDisplay?: MemberOrganizationDisplay;
      organizationTitles?: string[];
      organizationUnits?: string[];
      onView: (member: any) => void;
      onEdit?: (member: any) => void;
      onContacts?: (member: any) => void;
      onRoomAction: (member: any) => void;
      onOrganization?: (member: any, action?: OrganizationAction, context?: { unitId?: number | null }) => void;
      onLeaveOrDelete: (member: any) => void;
      onReactivate: (member: any) => void;
      isRoomProcessing?: boolean;
      isLeaving?: boolean;
      isReactivating?: boolean;
}) {
      const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
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
      const residentCode = member?.residentCode || member?.code || 'Chưa có mã';
      const phoneNumber = member?.phoneNumber || 'Chưa có SĐT';
      const contact = getPrimaryContactSummary(member);
      const organization = organizationDisplay || createEmptyOrganizationDisplay();
      const fallbackOrganization =
            organization.roles.length === 0 &&
            (organizationTitles.length > 0 || organizationUnits.length > 0)
                  ? {
                          teams: organizationUnits.map((unitName) => ({
                                unitName,
                                unitType: 'team' as const,
                                isLeader: false,
                                colorClass: getOrganizationUnitColorClass(unitName),
                          })),
                          committees: [],
                          roles: organizationTitles.map((title, index) => ({
                                title,
                                rank: 90 + index,
                                isTeamLeader: false,
                                isCommitteeHead: false,
                          })),
                    }
                  : organization;
      const shouldHighlightMissingRoom = !memberHasRoom && !memberIsLeft && !memberIsInactive;

      const cardClass = memberIsLeft
            ? 'border-rose-200 bg-rose-50/80'
            : memberIsInactive
                  ? 'border-amber-200 bg-amber-50/80'
                  : 'border-slate-200 bg-white hover:border-slate-300';

      const openOrganization = (
            action: OrganizationAction,
            context?: { unitId?: number | null }
      ) => {
            onOrganization?.(member, action, context);
      };

      return (
            <article className={['relative overflow-visible rounded-3xl border p-4 shadow-sm transition hover:shadow-md', cardClass].join(' ')}>
                  <div className={["absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r", accent.strip].join(' ')} />

                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-3">
                                    <div className={["hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white shadow-sm sm:flex", accent.avatar].join(' ')}>
                                          {getInitials(displayName)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                          <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="truncate text-base font-bold leading-6 text-slate-950 sm:text-[17px]">
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

                              <div className="mt-3 grid items-stretch gap-3 xl:grid-cols-[34%_1fr]">
                                    <div className="grid gap-3">
                                          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                                                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                      Phòng
                                                </div>

                                                <div
                                                      className={[
                                                            'mt-1 text-sm font-bold',
                                                            shouldHighlightMissingRoom
                                                                  ? 'text-amber-700'
                                                                  : 'text-slate-900',
                                                      ].join(' ')}
                                                >
                                                      {roomText}
                                                </div>
                                          </div>

                                          <ContactBlock
                                                contact={contact}
                                                onOpenContacts={onContacts ? () => onContacts(member) : undefined}
                                          />
                                    </div>

                                    <OrganizationBlock
                                          display={fallbackOrganization}
                                          onOrganization={
                                                onOrganization && !memberIsClosed
                                                      ? openOrganization
                                                      : undefined
                                          }
                                    />
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

                                          <div className="relative">
                                                <ActionButton onClick={() => setIsActionMenuOpen((value) => !value)}>
                                                      Thao tác
                                                </ActionButton>

                                                {isActionMenuOpen && (
                                                      <div className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
                                                            {onEdit && (
                                                                  <button type="button" onClick={() => { setIsActionMenuOpen(false); onEdit(member); }} className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                                                                        Sửa hồ sơ
                                                                  </button>
                                                            )}
                                                            {onContacts && (
                                                                  <button type="button" onClick={() => { setIsActionMenuOpen(false); onContacts(member); }} className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                                                                        Liên hệ gia đình
                                                                  </button>
                                                            )}
                                                            <div className="my-1 border-t border-slate-100" />
                                                            <button type="button" onClick={() => { setIsActionMenuOpen(false); onLeaveOrDelete(member); }} disabled={isLeaving} className="w-full px-4 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60">
                                                                  Ngừng / Rời lưu xá
                                                            </button>
                                                      </div>
                                                )}
                                          </div>
                                    </>
                              )}
                        </div>
                  </div>
            </article>
      );
}

export default SimpleMemberCard;
