/**
 * OrganizationHierarchyChart Component
 * 
 * Layout structure (as requested):
 * 
 *                      [  TRƯỞNG  ]
 *                            |
 *                     -----+---------
 *                    |      |      |
 *               [ PHÓ ]  [ THƯ KÝ ] [ THỦ QUỸ ]
 *                    |      |      |
 *                     -----+---------
 *                            |
 *          ----------+------+------+----------
 *         |                            |
 *      [  TỔ  ]                    [  BAN  ]
 *  (Teams/Groups)            (Committees/Boards)
 */

import { Users, Crown, UserRound, AlertCircle } from 'lucide-react';
import React from 'react';

export type OrganizationAssignment = {
  id: number;
  termId: number;
  roleId: number;
  residentId: number;
  unitId?: number | null;
  assignmentTitle?: string | null;
  startDate: string | Date;
  endDate?: string | Date | null;
  status: 'active' | 'ended';
  notes?: string | null;
  
  roleCode?: string;
  roleName?: string;
  roleType?: string | null;
  
  residentCode?: string;
  residentName?: string;
  residentFullName?: string;
  holyName?: string;
  currentRoom?: string;
  currentRoomCode?: string;
  
  unitId?: number;
  unitName?: string;
  unitType?: 'team' | 'committee';
};

type OrganizationUnit = {
  id: number;
  code: string;
  name: string;
  unitType: 'team' | 'committee';
  isActive: boolean;
  sortOrder: number;
};

type OrganizationRole = {
  id: number;
  code: string;
  name: string;
  roleType?: string | null;
  allowMultipleMembers?: boolean;
  level?: number;
};

type Props = {
  assignments: OrganizationAssignment[];
  roles?: OrganizationRole[];
  units?: OrganizationUnit[];
};

// Helper: Get role category
function getRoleType(assignment: OrganizationAssignment): 'leader' | 'vice' | 'secretary' | 'treasurer' | 'team_leader' | 'committee_head' | 'support' | 'other' {
  const roleCode = assignment.roleCode?.toLowerCase() || '';
  const roleType = assignment.roleType?.toLowerCase() || '';
  
  // Check specific roles FIRST (before general 'trưởng')
  if (roleCode.includes('tổ trưởng') || roleType === 'team_leader') return 'team_leader';
  if (roleCode.includes('trưởng ban') || roleCode.includes('ban trưởng') || roleType === 'committee_head') return 'committee_head';
  
  // Then check general roles
  if (roleCode.includes('trưởng') || roleType === 'leader') return 'leader';
  if (roleCode.includes('phó') || roleType === 'vice') return 'vice';
  if (roleCode.includes('thư ký') || roleCode.includes('thư kí') || roleType === 'secretary') return 'secretary';
  if (roleCode.includes('thủ quỹ') || roleType === 'treasurer') return 'treasurer';
  if (roleType?.includes('support')) return 'support';
  
  return 'other';
}

// Person Card Component
function PersonCard({
  assignment,
  size = 'md',
  showRoom = true,
}: {
  assignment?: OrganizationAssignment;
  size?: 'sm' | 'md' | 'lg';
  showRoom?: boolean;
}) {
  const sizeClasses = {
    sm: 'px-2 py-1.5 min-w-[100px]',
    md: 'px-3 py-2 min-w-[140px]',
    lg: 'px-4 py-3 min-w-[180px]',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (!assignment) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center`}
      >
        <div className="text-center">
          <UserRound className={`h-6 w-6 mx-auto text-neutral-300 mb-1`} />
          <p className="text-[11px] text-neutral-400">Chưa có người</p>
        </div>
      </div>
    );
  }

  const name = assignment.residentFullName || assignment.residentName || 'N/A';
  const code = assignment.residentCode || '';
  const room = assignment.currentRoomCode || assignment.currentRoom || '';
  const holyName = assignment.holyName || '';

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg border border-blue-200 bg-blue-50 shadow-sm hover:shadow-md transition`}
    >
      <div className={`${textSizeClasses[size]} font-semibold text-blue-900`}>
        {name}
      </div>
      {code && (
        <div className="text-[11px] text-blue-700 opacity-75">
          {code}
        </div>
      )}
      {holyName && (
        <div className="text-[11px] text-blue-600 italic">
          {holyName}
        </div>
      )}
      {showRoom && room && (
        <div className="text-[10px] text-blue-600 mt-0.5">
          {room}
        </div>
      )}
    </div>
  );
}

// Empty Slot Component
function EmptySlot({ label, size = 'md' }: { label: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'px-2 py-1.5 min-w-[100px]',
    md: 'px-3 py-2 min-w-[140px]',
    lg: 'px-4 py-3 min-w-[180px]',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center`}
    >
      <p className="text-xs text-neutral-400 text-center">{label}</p>
    </div>
  );
}

// Main Component
export function OrganizationHierarchyChart({
  assignments = [],
  roles = [],
  units = [],
}: Props) {
  // Filter active assignments
  const activeAssignments = assignments.filter((a) => a.status === 'active');

  if (activeAssignments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-6 w-6 text-neutral-400" />
          <p className="font-semibold text-neutral-700">Chưa có cơ cấu tổ chức</p>
          <p className="text-sm text-neutral-500">Hãy gán vai trò để xây dựng cơ cấu</p>
        </div>
      </div>
    );
  }

  // Main roles
  const leader = activeAssignments.find((a) => getRoleType(a) === 'leader');
  const viceLeaders = activeAssignments.filter((a) => getRoleType(a) === 'vice');
  const secretary = activeAssignments.find((a) => getRoleType(a) === 'secretary');
  const treasurer = activeAssignments.find((a) => getRoleType(a) === 'treasurer');

  // Support - teams and committees
  const teamLeaders = activeAssignments.filter((a) => getRoleType(a) === 'team_leader');
  const committeeHeads = activeAssignments.filter((a) => getRoleType(a) === 'committee_head');

  // Group teams and committees
  const teamsMap = new Map<number, OrganizationAssignment[]>();
  const committeesMap = new Map<number, OrganizationAssignment[]>();

  teamLeaders.forEach((assignment) => {
    const unitId = assignment.unitId || 0;
    if (!teamsMap.has(unitId)) {
      teamsMap.set(unitId, []);
    }
    teamsMap.get(unitId)!.push(assignment);
  });

  committeeHeads.forEach((assignment) => {
    const unitId = assignment.unitId || 0;
    if (!committeesMap.has(unitId)) {
      committeesMap.set(unitId, []);
    }
    committeesMap.get(unitId)!.push(assignment);
  });

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-gradient-to-b from-blue-50 to-white p-6 shadow-sm">
      {/* LEVEL 1: LEADER */}
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown className="h-4 w-4 text-amber-500" />
            <p className="text-xs font-semibold text-neutral-600 uppercase">Điều hành chính</p>
          </div>
          {leader ? (
            <PersonCard assignment={leader} size="lg" />
          ) : (
            <EmptySlot label="Trưởng lưu xá" size="lg" />
          )}
        </div>
      </div>

      {/* Connector line */}
      <div className="flex justify-center">
        <div className="w-0.5 h-6 bg-gradient-to-b from-neutral-300 to-neutral-200" />
      </div>

      {/* LEVEL 2: Management roles (Phó, Thư ký, Thủ quỹ) */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-600 uppercase text-center mb-3">
          Cấp phó hỗ trợ
        </p>

        {/* Management 3-column layout */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 w-full max-w-2xl">
            {/* PHÓ Column */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-center text-neutral-600">Phó</p>
              <div className="space-y-2">
                {viceLeaders.length > 0 ? (
                  viceLeaders.map((assignment) => (
                    <PersonCard
                      key={assignment.id}
                      assignment={assignment}
                      size="md"
                    />
                  ))
                ) : (
                  <EmptySlot label="Chưa có phó" size="md" />
                )}
              </div>
            </div>

            {/* THƯ KÝ Column */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-center text-neutral-600">Thư ký</p>
              {secretary ? (
                <PersonCard assignment={secretary} size="md" />
              ) : (
                <EmptySlot label="Chưa có thư ký" size="md" />
              )}
            </div>

            {/* THỦ QUỸ Column */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-center text-neutral-600">Thủ quỹ</p>
              {treasurer ? (
                <PersonCard assignment={treasurer} size="md" />
              ) : (
                <EmptySlot label="Chưa có thủ quỹ" size="md" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connector line */}
      <div className="flex justify-center">
        <div className="w-0.5 h-6 bg-gradient-to-b from-neutral-300 to-neutral-200" />
      </div>

      {/* LEVEL 3: Support (Teams and Committees) */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-neutral-600 uppercase text-center mb-4">
          Hỗ trợ điều hành
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* TỔ (Teams) - Left side */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold text-green-900">Các Tổ</p>
              <span className="ml-auto text-xs font-semibold text-green-700 bg-white px-2 py-0.5 rounded">
                {teamsMap.size}
              </span>
            </div>

            <div className="space-y-3">
              {teamsMap.size > 0 ? (
                Array.from(teamsMap.entries()).map(([unitId, teamLeaders]) => (
                  <div key={unitId} className="space-y-1">
                    <p className="text-xs font-semibold text-green-800">
                      Tổ {teamLeaders[0]?.unitName || `#${unitId}`}
                    </p>
                    <div className="space-y-1">
                      {teamLeaders.map((assignment) => (
                        <PersonCard
                          key={assignment.id}
                          assignment={assignment}
                          size="sm"
                          showRoom={false}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-green-600 italic">Chưa có tổ nào được bổ nhiệm</div>
              )}
            </div>
          </div>

          {/* BAN (Committees) - Right side */}
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-purple-600" />
              <p className="text-sm font-semibold text-purple-900">Các Ban</p>
              <span className="ml-auto text-xs font-semibold text-purple-700 bg-white px-2 py-0.5 rounded">
                {committeesMap.size}
              </span>
            </div>

            <div className="space-y-3">
              {committeesMap.size > 0 ? (
                Array.from(committeesMap.entries()).map(([unitId, committeeHeads]) => (
                  <div key={unitId} className="space-y-1">
                    <p className="text-xs font-semibold text-purple-800">
                      Ban {committeeHeads[0]?.unitName || `#${unitId}`}
                    </p>
                    <div className="space-y-1">
                      {committeeHeads.map((assignment) => (
                        <PersonCard
                          key={assignment.id}
                          assignment={assignment}
                          size="sm"
                          showRoom={false}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-purple-600 italic">Chưa có ban nào được bổ nhiệm</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 border-t border-neutral-200 pt-4">
        <p className="text-xs text-neutral-500">
          <span className="font-semibold">Hướng dẫn:</span> Vị trí trống được hiển thị với khung đứt nét. Bổ nhiệm
          người đảm nhiệm bằng nút "Gán vai trò".
        </p>
      </div>
    </div>
  );
}

export default OrganizationHierarchyChart;
