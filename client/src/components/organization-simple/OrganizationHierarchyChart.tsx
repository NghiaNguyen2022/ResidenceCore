/**
 * OrganizationHierarchyChart
 *
 * Layout yêu cầu:
 *
 *                     [ TRƯỞNG ]
 *                         |
 *        [ PHÓ ]     [ THƯ KÝ ]     [ THỦ QUỸ ]
 *
 *        [ TỔ ]                         [ BAN ]
 *
 * Nguyên tắc:
 * - Trưởng nằm giữa, ở TOP.
 * - Hàng dưới luôn là 3 cột: Phó / Thư ký / Thủ quỹ.
 * - Tổ và Ban tách 2 bên rõ ràng.
 * - Luôn hiện placeholder khi chưa có người/chưa có đơn vị để layout không bị vỡ.
 */

import React from 'react';
import { AlertCircle, Crown, ShieldCheck, UserRound, Users } from 'lucide-react';
import { normalizeText } from '@/lib/text';

export type OrganizationAssignment = {
      id: number;
      termId: number;
      roleId: number;
      residentId: number;
      unitId?: number | null;
      assignmentTitle?: string | null;
      startDate: string | Date;
      endDate?: string | Date | null;
      status: 'active' | 'ended' | string;
      notes?: string | null;
      roleCode?: string | null;
      roleName?: string | null;
      roleType?: string | null;
      residentCode?: string | null;
      residentName?: string | null;
      residentFullName?: string | null;
      holyName?: string | null;
      currentRoom?: string | null;
      currentRoomCode?: string | null;
      unitName?: string | null;
      unitType?: 'team' | 'committee' | string | null;
};

type OrganizationUnit = {
      id: number;
      code: string;
      name: string;
      unitType: 'team' | 'committee' | string;
      isActive: boolean;
      sortOrder?: number | null;
};

type OrganizationRole = {
      id: number;
      code: string;
      name: string;
      roleType?: string | null;
      allowMultipleMembers?: boolean;
      level?: number | null;
};

type Props = {
      assignments: OrganizationAssignment[];
      roles?: OrganizationRole[];
      units?: OrganizationUnit[];
};

type RoleBucket =
      | 'leader'
      | 'vice'
      | 'secretary'
      | 'treasurer'
      | 'team_leader'
      | 'committee_head'
      | 'support'
      | 'other';

const MANAGEMENT_COLUMNS = [
      {
            key: 'vice',
            title: 'Phó',
            emptyText: 'Chưa bổ nhiệm Phó',
      },
      {
            key: 'secretary',
            title: 'Thư ký',
            emptyText: 'Chưa bổ nhiệm Thư ký',
      },
      {
            key: 'treasurer',
            title: 'Thủ quỹ',
            emptyText: 'Chưa bổ nhiệm Thủ quỹ',
      },
] as const;


function getRoleType(assignment: OrganizationAssignment): RoleBucket {
      const roleCode = normalizeText(assignment.roleCode);
      const roleName = normalizeText(assignment.roleName);
      const roleType = normalizeText(assignment.roleType);
      const title = `${roleCode} ${roleName} ${roleType}`;

      // Các vai trò phụ thuộc đơn vị phải check trước chữ "trưởng" chung.
      if (
            title.includes('tổ trưởng') ||
            title.includes('to truong') ||
            roleType === 'team_leader'
      ) {
            return 'team_leader';
      }

      if (
            title.includes('trưởng ban') ||
            title.includes('ban trưởng') ||
            title.includes('truong ban') ||
            roleType === 'committee_head'
      ) {
            return 'committee_head';
      }

      if (title.includes('thủ quỹ') || title.includes('thu quy') || roleType === 'treasurer') {
            return 'treasurer';
      }

      if (title.includes('thư ký') || title.includes('thư kí') || title.includes('thu ky') || roleType === 'secretary') {
            return 'secretary';
      }

      if (title.includes('phó') || title.includes('pho') || roleType === 'vice') {
            return 'vice';
      }

      if (title.includes('trưởng') || title.includes('truong') || roleType === 'leader') {
            return 'leader';
      }

      if (roleType.includes('support')) {
            return 'support';
      }

      return 'other';
}

function sortUnits(a: OrganizationUnit, b: OrganizationUnit) {
      const orderA = a.sortOrder ?? 9999;
      const orderB = b.sortOrder ?? 9999;

      if (orderA !== orderB) return orderA - orderB;

      return a.name.localeCompare(b.name, 'vi');
}

function getAssignmentName(assignment?: OrganizationAssignment) {
      if (!assignment) return '';
      return assignment.residentFullName || assignment.residentName || 'Chưa có tên';
}

function getAssignmentSubInfo(assignment?: OrganizationAssignment) {
      if (!assignment) return [];

      return [
            assignment.residentCode,
            assignment.holyName,
            assignment.currentRoomCode || assignment.currentRoom,
      ].filter(Boolean) as string[];
}

function PersonCard({
      assignment,
      label,
      tone = 'default',
      size = 'md',
}: {
      assignment?: OrganizationAssignment;
      label?: string;
      tone?: 'leader' | 'default' | 'unit';
      size?: 'sm' | 'md' | 'lg';
}) {
      const isEmpty = !assignment;
      const name = getAssignmentName(assignment);
      const subInfo = getAssignmentSubInfo(assignment);

      const toneClass = isEmpty
            ? 'border-dashed border-slate-300 bg-white/70 text-slate-400'
            : tone === 'leader'
                  ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-md shadow-amber-100/60'
                  : tone === 'unit'
                        ? 'border-blue-100 bg-white shadow-sm shadow-blue-50'
                        : 'border-slate-200 bg-white shadow-sm';

      const sizeClass =
            size === 'lg'
                  ? 'min-h-[108px] px-5 py-4'
                  : size === 'sm'
                        ? 'min-h-[74px] px-3 py-2.5'
                        : 'min-h-[88px] px-4 py-3';

      return (
            <div
                  className={`rounded-2xl border ${toneClass} ${sizeClass} flex w-full flex-col justify-center transition hover:-translate-y-0.5 hover:shadow-md`}
            >
                  {label && (
                        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              {label}
                        </div>
                  )}

                  {isEmpty ? (
                        <div className="text-sm font-semibold">Chưa có người</div>
                  ) : (
                        <>
                              <div className="line-clamp-2 text-sm font-bold text-slate-950">
                                    {name}
                              </div>

                              {subInfo.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                          {subInfo.map((item) => (
                                                <span
                                                      key={item}
                                                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500"
                                                >
                                                      {item}
                                                </span>
                                          ))}
                                    </div>
                              )}
                        </>
                  )}
            </div>
      );
}

function SectionTitle({
      icon,
      title,
      subtitle,
}: {
      icon: React.ReactNode;
      title: string;
      subtitle?: string;
}) {
      return (
            <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                        {icon}
                  </div>
                  <div>
                        <h3 className="text-base font-bold text-slate-950">{title}</h3>
                        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                  </div>
            </div>
      );
}

function ConnectorDown() {
      return (
            <div className="flex justify-center py-2" aria-hidden="true">
                  <div className="h-8 w-px bg-slate-300" />
            </div>
      );
}

function UnitGroup({
      title,
      count,
      assignments,
      emptyText,
}: {
      title: string;
      count?: number;
      assignments: OrganizationAssignment[];
      emptyText: string;
}) {
      return (
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="font-bold text-slate-900">{title}</h4>
                        {typeof count === 'number' && (
                              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                                    {count}
                              </span>
                        )}
                  </div>

                  <div className="space-y-2">
                        {assignments.length > 0 ? (
                              assignments.map((assignment) => (
                                    <PersonCard
                                          key={assignment.id}
                                          assignment={assignment}
                                          tone="unit"
                                          size="sm"
                                    />
                              ))
                        ) : (
                              <PersonCard label={emptyText} tone="unit" size="sm" />
                        )}
                  </div>
            </div>
      );
}

function buildUnitGroups(input: {
      units: OrganizationUnit[];
      assignments: OrganizationAssignment[];
      unitType: 'team' | 'committee';
}) {
      const activeUnits = input.units
            .filter((unit) => unit.isActive !== false && unit.unitType === input.unitType)
            .sort(sortUnits);

      const assignmentsByUnit = new Map<number | string, OrganizationAssignment[]>();

      input.assignments.forEach((assignment) => {
            const key = assignment.unitId ?? `unknown-${assignment.unitName || assignment.id}`;
            const current = assignmentsByUnit.get(key) || [];
            current.push(assignment);
            assignmentsByUnit.set(key, current);
      });

      if (activeUnits.length > 0) {
            return activeUnits.map((unit) => ({
                  id: unit.id,
                  title: unit.name,
                  assignments: assignmentsByUnit.get(unit.id) || [],
            }));
      }

      return Array.from(assignmentsByUnit.entries()).map(([key, assignments]) => ({
            id: key,
            title: assignments[0]?.unitName || (input.unitType === 'team' ? 'Tổ chưa xác định' : 'Ban chưa xác định'),
            assignments,
      }));
}

export function OrganizationHierarchyChart({
      assignments = [],
      roles = [],
      units = [],
}: Props) {
      const activeAssignments = assignments.filter((assignment) => assignment.status === 'active');

      const leader = activeAssignments.find((assignment) => getRoleType(assignment) === 'leader');
      const viceLeaders = activeAssignments.filter((assignment) => getRoleType(assignment) === 'vice');
      const secretary = activeAssignments.find((assignment) => getRoleType(assignment) === 'secretary');
      const treasurer = activeAssignments.find((assignment) => getRoleType(assignment) === 'treasurer');
      const teamLeaders = activeAssignments.filter((assignment) => getRoleType(assignment) === 'team_leader');
      const committeeHeads = activeAssignments.filter((assignment) => getRoleType(assignment) === 'committee_head');

      const teamGroups = buildUnitGroups({
            units,
            assignments: teamLeaders,
            unitType: 'team',
      });

      const committeeGroups = buildUnitGroups({
            units,
            assignments: committeeHeads,
            unitType: 'committee',
      });

      const hasAnyData = activeAssignments.length > 0 || units.some((unit) => unit.isActive !== false);

      return (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                  <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                              <h2 className="text-xl font-black text-slate-950">
                                    Sơ đồ tổ chức hiện tại
                              </h2>
                              <p className="mt-1 text-sm text-slate-500">
                                    Hiển thị theo cơ cấu: Trưởng ở trên, Phó / Thư ký / Thủ quỹ ở hàng dưới, Tổ và Ban tách hai bên.
                              </p>
                        </div>

                        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                              {activeAssignments.length} bổ nhiệm đang hiệu lực
                        </div>
                  </div>

                  {!hasAnyData && (
                        <div className="mb-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                              <AlertCircle className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                              <p className="font-bold text-slate-700">Chưa có cơ cấu tổ chức</p>
                              <p className="mt-1 text-sm text-slate-500">
                                    Hãy tạo Tổ/Ban hoặc bổ nhiệm vai trò để xây dựng sơ đồ.
                              </p>
                        </div>
                  )}

                  {/* LEVEL 1: TRƯỞNG - TOP CENTER */}
                  <div className="flex justify-center">
                        <div className="w-full max-w-[320px]">
                              <div className="mb-2 flex items-center justify-center gap-2 text-sm font-bold text-amber-700">
                                    <Crown className="h-4 w-4" />
                                    Trưởng
                              </div>
                              <PersonCard
                                    assignment={leader}
                                    label="Điều hành chính"
                                    tone="leader"
                                    size="lg"
                              />
                        </div>
                  </div>

                  <ConnectorDown />

                  {/* LEVEL 2: THREE MANAGEMENT COLUMNS */}
                  <div className="mx-auto max-w-4xl">
                        <SectionTitle
                              icon={<ShieldCheck className="h-5 w-5" />}
                              title="Ban điều hành"
                              subtitle="Ba nhóm vai trò chính dưới Trưởng"
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              {MANAGEMENT_COLUMNS.map((column) => {
                                    if (column.key === 'vice') {
                                          return (
                                                <div key={column.key} className="space-y-2">
                                                      <div className="text-center text-sm font-bold text-slate-700">
                                                            {column.title}
                                                      </div>
                                                      {viceLeaders.length > 0 ? (
                                                            viceLeaders.map((assignment) => (
                                                                  <PersonCard
                                                                        key={assignment.id}
                                                                        assignment={assignment}
                                                                        size="md"
                                                                  />
                                                            ))
                                                      ) : (
                                                            <PersonCard label={column.emptyText} size="md" />
                                                      )}
                                                </div>
                                          );
                                    }

                                    const assignment = column.key === 'secretary' ? secretary : treasurer;

                                    return (
                                          <div key={column.key} className="space-y-2">
                                                <div className="text-center text-sm font-bold text-slate-700">
                                                      {column.title}
                                                </div>
                                                <PersonCard
                                                      assignment={assignment}
                                                      label={!assignment ? column.emptyText : undefined}
                                                      size="md"
                                                />
                                          </div>
                                    );
                              })}
                        </div>
                  </div>

                  <ConnectorDown />

                  {/* LEVEL 3: TEAMS AND COMMITTEES - TWO SIDES */}
                  <div className="mx-auto max-w-6xl">
                        <SectionTitle
                              icon={<Users className="h-5 w-5" />}
                              title="Tổ / Ban hỗ trợ"
                              subtitle="Tổ đặt bên trái, Ban đặt bên phải để không lẫn vào hàng điều hành"
                        />

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                              <div className="rounded-[1.75rem] border border-blue-100 bg-blue-50/40 p-4">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                          <div>
                                                <h3 className="text-lg font-black text-slate-950">Tổ</h3>
                                                <p className="text-sm text-slate-500">Các tổ sinh hoạt / phục vụ</p>
                                          </div>
                                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">
                                                {teamGroups.length}
                                          </span>
                                    </div>

                                    <div className="space-y-3">
                                          {teamGroups.length > 0 ? (
                                                teamGroups.map((group) => (
                                                      <UnitGroup
                                                            key={String(group.id)}
                                                            title={group.title}
                                                            count={group.assignments.length}
                                                            assignments={group.assignments}
                                                            emptyText="Chưa có Tổ trưởng"
                                                      />
                                                ))
                                          ) : (
                                                <UnitGroup
                                                      title="Chưa có Tổ"
                                                      assignments={[]}
                                                      emptyText="Tạo Tổ và bổ nhiệm Tổ trưởng"
                                                />
                                          )}
                                    </div>
                              </div>

                              <div className="rounded-[1.75rem] border border-violet-100 bg-violet-50/40 p-4">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                          <div>
                                                <h3 className="text-lg font-black text-slate-950">Ban</h3>
                                                <p className="text-sm text-slate-500">Các ban chuyên trách</p>
                                          </div>
                                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-violet-700 shadow-sm">
                                                {committeeGroups.length}
                                          </span>
                                    </div>

                                    <div className="space-y-3">
                                          {committeeGroups.length > 0 ? (
                                                committeeGroups.map((group) => (
                                                      <UnitGroup
                                                            key={String(group.id)}
                                                            title={group.title}
                                                            count={group.assignments.length}
                                                            assignments={group.assignments}
                                                            emptyText="Chưa có Trưởng ban"
                                                      />
                                                ))
                                          ) : (
                                                <UnitGroup
                                                      title="Chưa có Ban"
                                                      assignments={[]}
                                                      emptyText="Tạo Ban và bổ nhiệm Trưởng ban"
                                                />
                                          )}
                                    </div>
                              </div>
                        </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                        Ghi chú: các khung trống là vị trí chưa bổ nhiệm. Sơ đồ luôn giữ đúng bố cục để nhìn rõ cấp điều hành và nhóm Tổ/Ban.
                  </div>
            </div>
      );
}

export default OrganizationHierarchyChart;
