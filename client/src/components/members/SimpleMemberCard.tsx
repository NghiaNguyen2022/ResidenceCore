// @ts-nocheck
'use client';

import { useState, type ReactNode } from 'react';
import { cx, residenceMediumAccents, residenceMediumStyle } from '@/components/shared/styleMedium';
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
      return residenceMediumAccents[index % residenceMediumAccents.length];
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


function getRoomBadgeText(roomText: string, hasRoom: boolean) {
      if (!hasRoom || roomText === 'Chưa gán' || roomText === 'Chưa gán phòng') {
            return 'Chưa có phòng';
      }

      if (roomText.toLowerCase().includes('phòng')) {
            return roomText;
      }

      return `Phòng ${roomText}`;
}

function getProfileSummary(input: {
      memberIsLeft: boolean;
      memberIsInactive: boolean;
      attentionItems: string[];
}) {
      if (input.memberIsLeft) {
            return {
                  label: 'Hồ sơ lưu trữ',
                  message: 'Học viên đã rời lưu xá. Các thao tác lưu trú thường ngày đã được khóa.',
                  className: 'border-rose-200 bg-rose-50 text-rose-800',
                  icon: '●',
            };
      }

      if (input.memberIsInactive) {
            return {
                  label: 'Tạm ngưng lưu trú',
                  message: 'Hồ sơ đang tạm ngưng. Có thể đăng ký lại khi học viên quay lại lưu xá.',
                  className: 'border-amber-200 bg-amber-50 text-amber-800',
                  icon: '●',
            };
      }

      if (input.attentionItems.length > 0) {
            return {
                  label: 'Cần bổ sung',
                  message: input.attentionItems.join(' · '),
                  className: 'border-amber-200 bg-amber-50 text-amber-800',
                  icon: '!',
            };
      }

      return {
            label: 'Hồ sơ ổn định',
            message: 'Thông tin lưu trú, liên hệ và tổ chức đang đầy đủ.',
            className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
            icon: '✓',
      };
}

function getOrganizationSummaryText(display: MemberOrganizationDisplay) {
      const parts = [
            `${display.teams.length} tổ`,
            `${display.committees.length} ban`,
            `${display.roles.length} chức vụ`,
      ];

      return parts.join(' · ');
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

function EmptyValue({ children }: { children: ReactNode }) {
      return (
            <span className="text-sm font-medium text-slate-400">
                  {children}
            </span>
      );
}

function RoleBadge({ role }: { role: OrganizationRoleDisplay }) {
      return (
            <span
                  className="inline-flex max-w-full rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                  title={role.title}
            >
                  <span className="truncate">{role.title}</span>
            </span>
      );
}

function ResidenceContactSummary({
      contact,
      roomText,
      shouldHighlightMissingRoom,
      onOpenContacts,
}: {
      contact: PrimaryContactSummary;
      roomText: string;
      shouldHighlightMissingRoom: boolean;
      onOpenContacts?: () => void;
}) {
      return (
            <section className={residenceMediumStyle.cardSection}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              Lưu trú & liên hệ
                        </div>

                        {onOpenContacts && (
                              <button
                                    type="button"
                                    onClick={onOpenContacts}
                                    className="rounded-full px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800 hover:ring-1 hover:ring-slate-200"
                              >
                                    {contact.isMissing ? '+ Bổ sung' : 'Xem/sửa'}
                              </button>
                        )}
                  </div>

                  <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                              <span className="font-bold text-slate-900">Phòng</span>
                              <span className="text-slate-300">•</span>
                              <span
                                    className={[
                                          'font-semibold',
                                          shouldHighlightMissingRoom ? 'text-amber-700' : 'text-slate-700',
                                    ].join(' ')}
                              >
                                    {roomText}
                              </span>
                        </div>

                        {contact.isMissing ? (
                              <div className="text-sm font-semibold text-amber-700">
                                    Chưa có liên hệ chính
                              </div>
                        ) : (
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-700">
                                    <span className="font-bold text-slate-900">{contact.relation}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-semibold">{contact.name}</span>
                                    {contact.phone && (
                                          <>
                                                <span className="text-slate-300">•</span>
                                                <span className="font-medium text-slate-600">{contact.phone}</span>
                                          </>
                                    )}
                              </div>
                        )}
                  </div>
            </section>
      );
}

function OrganizationSummary({
      display,
}: {
      display: MemberOrganizationDisplay;
}) {
      return (
            <section className={residenceMediumStyle.cardSection}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                    Tổ chức lưu xá
                              </div>
                              <div className="mt-0.5 text-xs font-medium text-slate-500">
                                    {getOrganizationSummaryText(display)}
                              </div>
                        </div>
                  </div>

                  <div className="space-y-2.5">
                        <div className="grid grid-cols-[58px_1fr] gap-2">
                              <div className="pt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                    Tổ
                              </div>
                              <div className="flex min-w-0 flex-wrap gap-1.5">
                                    {display.teams.length > 0 ? (
                                          display.teams.map((unit) => (
                                                <UnitBadge
                                                      key={`${unit.unitType}-${unit.unitId || unit.unitName}`}
                                                      unit={unit}
                                                />
                                          ))
                                    ) : (
                                          <EmptyValue>Chưa vào tổ</EmptyValue>
                                    )}
                              </div>
                        </div>

                        <div className="grid grid-cols-[58px_1fr] gap-2">
                              <div className="pt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                    Ban
                              </div>
                              <div className="flex min-w-0 flex-wrap gap-1.5">
                                    {display.committees.length > 0 ? (
                                          display.committees.map((unit) => (
                                                <UnitBadge
                                                      key={`${unit.unitType}-${unit.unitId || unit.unitName}`}
                                                      unit={unit}
                                                />
                                          ))
                                    ) : (
                                          <EmptyValue>Chưa vào ban</EmptyValue>
                                    )}
                              </div>
                        </div>

                        <div className="grid grid-cols-[58px_1fr] gap-2">
                              <div className="pt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                    Chức vụ
                              </div>
                              <div className="flex min-w-0 flex-wrap gap-1.5">
                                    {display.roles.length > 0 ? (
                                          display.roles.map((role) => (
                                                <RoleBadge
                                                      key={`${role.id || role.title}`}
                                                      role={role}
                                                />
                                          ))
                                    ) : (
                                          <EmptyValue>Chưa có chức vụ</EmptyValue>
                                    )}
                              </div>
                        </div>
                  </div>
            </section>
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
      const [isExpanded, setIsExpanded] = useState(false);
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
      const roomBadgeText = getRoomBadgeText(roomText, memberHasRoom);
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
      const rolePreview = fallbackOrganization.roles.slice(0, 2);
      const extraRoleCount = Math.max(0, fallbackOrganization.roles.length - rolePreview.length);
      const profileSummary = getProfileSummary({
            memberIsLeft,
            memberIsInactive,
            attentionItems,
      });

      const cardClass = memberIsLeft
            ? residenceMediumStyle.cardLeft
            : memberIsInactive
                  ? residenceMediumStyle.cardInactive
                  : residenceMediumStyle.cardActive;

      const openOrganization = (
            action: OrganizationAction,
            context?: { unitId?: number | null }
      ) => {
            onOrganization?.(member, action, context);
      };

      const canQuickAddContact = attentionItems.includes('Thiếu liên hệ') && !!onContacts && !memberIsClosed;
      const canQuickAssignTeam = attentionItems.includes('Chưa vào tổ') && !!onOrganization && !memberIsClosed;
      const canShowQuickAction =
            shouldHighlightMissingRoom || canQuickAddContact || canQuickAssignTeam;

      const handleQuickAction = () => {
            if (shouldHighlightMissingRoom) {
                  onRoomAction(member);
                  return;
            }

            if (canQuickAddContact) {
                  onContacts?.(member);
                  return;
            }

            if (canQuickAssignTeam) {
                  openOrganization('add_team');
            }
      };

      const quickActionLabel = shouldHighlightMissingRoom
            ? 'Gắn phòng'
            : canQuickAddContact
                  ? 'Bổ sung liên hệ'
                  : canQuickAssignTeam
                        ? 'Phân tổ'
                        : 'Xử lý nhanh';

      return (
            <article
                  className={cx(residenceMediumStyle.card, cardClass)}
            >
                  <div className={["absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r", accent.strip].join(' ')} />

                  <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                              <div className="flex min-w-0 flex-1 items-start gap-3">
                                    <div
                                          className={[
                                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white shadow-md shadow-slate-900/10",
                                                accent.avatar,
                                          ].join(' ')}
                                    >
                                          {getInitials(displayName)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                          <div className="flex flex-wrap items-center gap-2">

                                                <h3 className={residenceMediumStyle.cardTitle}>
                                                      {displayName}
                                                </h3>
                                          </div>

                                          {isExpanded && (
                                                <div className={residenceMediumStyle.cardMeta}>
                                                      <span>{residentCode}</span>
                                                      <span className="text-slate-300">•</span>
                                                      <span>{phoneNumber}</span>
                                                </div>
                                          )}

                                          <div className="mt-2 flex flex-wrap gap-1.5">
                                                <span className={['inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1', getStatusBadgeClass(member)].join(' ')}>
                                                      {statusLabel}
                                                </span>

                                                {!isExpanded && (
                                                      <>
                                                            {rolePreview.length > 0 ? (
                                                                  rolePreview.map((role) => (
                                                                        <span
                                                                              key={`${role.id || role.title}`}
                                                                              className="inline-flex max-w-full rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100"
                                                                              title={role.title}
                                                                        >
                                                                              <span className="truncate">{role.title}</span>
                                                                        </span>
                                                                  ))
                                                            ) : (
                                                                  <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                                                                        Chưa có chức vụ
                                                                  </span>
                                                            )}

                                                            {extraRoleCount > 0 && (
                                                                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                                                        +{extraRoleCount}
                                                                  </span>
                                                            )}
                                                      </>
                                                )}

                                                {isExpanded && (
                                                      <>
                                                            <span
                                                                  className={[
                                                                        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                                                                        shouldHighlightMissingRoom
                                                                              ? 'bg-amber-50 text-amber-700 ring-amber-200'
                                                                              : 'bg-blue-50 text-blue-700 ring-blue-100',
                                                                  ].join(' ')}
                                                            >
                                                                  {roomBadgeText}
                                                            </span>

                                                            <span className={['inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1', accountBadge.className].join(' ')}>
                                                                  {accountBadge.label}
                                                            </span>

                                                            {attentionItems.map((item) => (
                                                                  <span
                                                                        key={item}
                                                                        className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200"
                                                                  >
                                                                        {item}
                                                                  </span>
                                                            ))}
                                                      </>
                                                )}
                                          </div>
                                    </div>
                              </div>

                              <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
                                    <ActionButton onClick={() => onView(member)} tone="dark">
                                          Xem hồ sơ
                                    </ActionButton>

                                    <ActionButton
                                          onClick={() => {
                                                setIsExpanded((value) => !value);
                                                setIsActionMenuOpen(false);
                                          }}
                                    >
                                          {isExpanded ? 'Thu gọn' : 'Mở rộng'}
                                    </ActionButton>

                                    {isExpanded && (
                                          <>
                                                {memberIsClosed ? (
                                                      <ActionButton onClick={() => onReactivate(member)} disabled={isReactivating} tone="green">
                                                            {isReactivating ? 'Đang đăng ký...' : 'Đăng ký lại'}
                                                      </ActionButton>
                                                ) : (
                                                      <>
                                                            {canShowQuickAction && (
                                                                  <ActionButton onClick={handleQuickAction} disabled={isRoomProcessing} tone="green">
                                                                        {quickActionLabel}
                                                                  </ActionButton>
                                                            )}

                                                            <div className="relative">
                                                                  <ActionButton onClick={() => setIsActionMenuOpen((value) => !value)}>
                                                                        Xử lý
                                                                  </ActionButton>

                                                                  {isActionMenuOpen && (
                                                                        <div className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
                                                                              <div className="px-4 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                                                    Hồ sơ
                                                                              </div>

                                                                              {onEdit && (
                                                                                    <button
                                                                                          type="button"
                                                                                          onClick={() => {
                                                                                                setIsActionMenuOpen(false);
                                                                                                onEdit(member);
                                                                                          }}
                                                                                          className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                                                    >
                                                                                          Sửa hồ sơ
                                                                                    </button>
                                                                              )}

                                                                              {onContacts && (
                                                                                    <button
                                                                                          type="button"
                                                                                          onClick={() => {
                                                                                                setIsActionMenuOpen(false);
                                                                                                onContacts(member);
                                                                                          }}
                                                                                          className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                                                    >
                                                                                          Liên hệ gia đình
                                                                                    </button>
                                                                              )}

                                                                              <div className="my-1 border-t border-slate-100" />

                                                                              <div className="px-4 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                                                    Lưu trú
                                                                              </div>

                                                                              <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                          setIsActionMenuOpen(false);
                                                                                          onRoomAction(member);
                                                                                    }}
                                                                                    disabled={isRoomProcessing}
                                                                                    className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                                              >
                                                                                    {memberHasRoom ? 'Chuyển / Trả phòng' : 'Gắn phòng'}
                                                                              </button>

                                                                              {onOrganization && (
                                                                                    <>
                                                                                          <div className="my-1 border-t border-slate-100" />

                                                                                          <div className="px-4 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                                                                Tổ chức
                                                                                          </div>

                                                                                          <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                      setIsActionMenuOpen(false);
                                                                                                      openOrganization(
                                                                                                            fallbackOrganization.teams[0]?.unitId
                                                                                                                  ? 'transfer_team'
                                                                                                                  : 'add_team',
                                                                                                            {
                                                                                                                  unitId: fallbackOrganization.teams[0]?.unitId ?? null,
                                                                                                            }
                                                                                                      );
                                                                                                }}
                                                                                                className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                                                          >
                                                                                                {fallbackOrganization.teams.length > 0 ? 'Đổi tổ' : '+ Tổ'}
                                                                                          </button>

                                                                                          <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                      setIsActionMenuOpen(false);
                                                                                                      openOrganization('add_committee');
                                                                                                }}
                                                                                                className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                                                          >
                                                                                                + Ban
                                                                                          </button>

                                                                                          <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                      setIsActionMenuOpen(false);
                                                                                                      openOrganization('appointment');
                                                                                                }}
                                                                                                className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                                                          >
                                                                                                Bổ nhiệm chức vụ
                                                                                          </button>
                                                                                    </>
                                                                              )}

                                                                              <div className="my-1 border-t border-slate-100" />

                                                                              <div className="px-4 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                                                    Trạng thái
                                                                              </div>

                                                                              <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                          setIsActionMenuOpen(false);
                                                                                          onLeaveOrDelete(member);
                                                                                    }}
                                                                                    disabled={isLeaving}
                                                                                    className="w-full px-4 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                                              >
                                                                                    Ngừng / Rời lưu xá
                                                                              </button>
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      </>
                                                )}
                                          </>
                                    )}
                              </div>
                        </div>

                        {isExpanded && (
                              <>
                                    <div
                                          className={[
                                                'flex flex-col gap-1 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between shadow-sm',
                                                profileSummary.className,
                                          ].join(' ')}
                                    >
                                          <div className="flex items-center gap-2">
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/70 text-xs font-black">
                                                      {profileSummary.icon}
                                                </span>
                                                <span className="text-sm font-bold">{profileSummary.label}</span>
                                          </div>
                                          <div className="text-sm font-semibold sm:text-right">
                                                {profileSummary.message}
                                          </div>
                                    </div>

                                    <div className="grid gap-3 xl:grid-cols-[minmax(260px,0.75fr)_minmax(420px,1.25fr)]">
                                          <ResidenceContactSummary
                                                contact={contact}
                                                roomText={roomBadgeText}
                                                shouldHighlightMissingRoom={shouldHighlightMissingRoom}
                                                onOpenContacts={onContacts ? () => onContacts(member) : undefined}
                                          />

                                          <OrganizationSummary display={fallbackOrganization} />
                                    </div>
                              </>
                        )}
                  </div>
            </article>
      );
}

export default SimpleMemberCard;
