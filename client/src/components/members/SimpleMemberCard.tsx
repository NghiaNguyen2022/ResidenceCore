'use client';

import { useState } from 'react';

function getDisplayName(member: any) {
      if (member?.holyName && member?.fullName) {
            return `${member.holyName} ${member.fullName}`;
      }

      return member?.fullName || member?.name || 'Chưa có tên';
}

function getRoomText(member: any) {
      if (member?.roomName) return member.roomName;
      if (member?.roomNumber) return member.roomNumber;
      if (member?.roomCode) return member.roomCode;
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

function getPrimaryContactText(member: any) {
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
      return !!(member?.roomId || member?.roomName || member?.roomNumber || member?.roomCode);
}

function hasUser(member: any) {
      return !!member?.userId;
}

function StatusBadge({ label }: { label: string }) {
      return (
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                  {label}
            </span>
      );
}

function AccountBadge({ hasAccount }: { hasAccount: boolean }) {
      return (
            <span
                  className={[
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1',
                        hasAccount
                              ? 'bg-slate-50 text-slate-700 ring-slate-200'
                              : 'bg-amber-50 text-amber-700 ring-amber-200',
                  ].join(' ')}
            >
                  {hasAccount ? 'Đã có tài khoản' : 'Chưa có tài khoản'}
            </span>
      );
}

export function SimpleMemberCard({
      member,
      onView,
      onEdit,
      onAssignRoom,
      onTransferRoom,
      onReturnRoom,
      onOpenFamily,
      onCreateUser,
      isCreatingUser,
}: {
      member: any;
      onView: (member: any) => void;
      onEdit: (member: any) => void;
      onAssignRoom: (member: any) => void;
      onTransferRoom: (member: any) => void;
      onReturnRoom: (member: any) => void;
      onOpenFamily: (member: any) => void;
      onCreateUser?: (member: any) => void;
      isCreatingUser?: boolean;
}) {
      const [isActionOpen, setIsActionOpen] = useState(false);

      const memberHasRoom = hasRoom(member);
      const memberHasUser = hasUser(member);

      const statusLabel =
            member?.statusLabel ||
            member?.status ||
            member?.residenceStatus ||
            'Đang lưu trú';

      return (
            <div className="rounded-2xl border bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                    <div className="text-base font-semibold text-slate-900">
                                          {getDisplayName(member)}
                                    </div>

                                    <StatusBadge label={statusLabel} />
                                    <AccountBadge hasAccount={memberHasUser} />
                              </div>

                              <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                                    <div>
                                          <div className="text-xs text-slate-400">Phòng</div>
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
                                          <div className="text-xs text-slate-400">Học tập</div>
                                          <div className="font-medium text-slate-800">
                                                {getSchoolText(member)}
                                          </div>
                                    </div>

                                    <div>
                                          <div className="text-xs text-slate-400">Gia đình / liên hệ</div>
                                          <div className="font-medium text-slate-800">
                                                {getPrimaryContactText(member)}
                                          </div>
                                    </div>

                                    <div>
                                          <div className="text-xs text-slate-400">Mã học viên</div>
                                          <div className="font-medium text-slate-800">
                                                {member?.residentCode || member?.code || 'Chưa có'}
                                          </div>
                                    </div>
                              </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                              <button
                                    type="button"
                                    onClick={() => onView(member)}
                                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                    Chi tiết
                              </button>

                              <div className="relative">
                                    <button
                                          type="button"
                                          onClick={() => setIsActionOpen((value) => !value)}
                                          className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
                                    >
                                          Thao tác
                                    </button>

                                    {isActionOpen && (
                                          <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border bg-white py-1 shadow-lg">
                                                <button
                                                      type="button"
                                                      onClick={() => {
                                                            setIsActionOpen(false);
                                                            onEdit(member);
                                                      }}
                                                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                                >
                                                      Sửa thông tin
                                                </button>

                                                {!memberHasRoom ? (
                                                      <button
                                                            type="button"
                                                            onClick={() => {
                                                                  setIsActionOpen(false);
                                                                  onAssignRoom(member);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                                      >
                                                            Gán phòng
                                                      </button>
                                                ) : (
                                                      <>
                                                            <button
                                                                  type="button"
                                                                  onClick={() => {
                                                                        setIsActionOpen(false);
                                                                        onTransferRoom(member);
                                                                  }}
                                                                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                                            >
                                                                  Chuyển phòng
                                                            </button>

                                                            <button
                                                                  type="button"
                                                                  onClick={() => {
                                                                        setIsActionOpen(false);
                                                                        onReturnRoom(member);
                                                                  }}
                                                                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                                            >
                                                                  Trả phòng
                                                            </button>
                                                      </>
                                                )}

                                                <button
                                                      type="button"
                                                      onClick={() => {
                                                            setIsActionOpen(false);
                                                            onOpenFamily(member);
                                                      }}
                                                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                                >
                                                      Gia đình / người liên hệ
                                                </button>

                                                {!memberHasUser && onCreateUser && (
                                                      <button
                                                            type="button"
                                                            onClick={() => {
                                                                  setIsActionOpen(false);
                                                                  onCreateUser(member);
                                                            }}
                                                            disabled={isCreatingUser}
                                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                      >
                                                            {isCreatingUser
                                                                  ? 'Đang tạo tài khoản...'
                                                                  : 'Tạo tài khoản đăng nhập'}
                                                      </button>
                                                )}
                                          </div>
                                    )}
                              </div>
                        </div>
                  </div>
            </div>
      );
}

export default SimpleMemberCard;