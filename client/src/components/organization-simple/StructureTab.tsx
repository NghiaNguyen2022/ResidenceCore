import { useMemo } from 'react';

import type {
      OrganizationAssignment,
      OrganizationTerm,
      OrganizationUnit,
} from './types';
import {
      getUnitTypeLabel,
      isAssignmentRole,
      isCommitteeAssignment,
      isTeamAssignment,
} from './utils';
import {
      OrgMiniCard,
      OrgPlaceholderCard,
      SectionEmpty,
} from './OrgCards';

type StructureTabProps = {
      currentTerm: OrganizationTerm | null;
      activeAssignments: OrganizationAssignment[];
      activeUnits: OrganizationUnit[];
      onEditAssignment: (assignment: OrganizationAssignment) => void;
      onEndAssignment: (assignment: OrganizationAssignment) => void;
};

export function StructureTab({
      currentTerm,
      activeAssignments,
      activeUnits,
      onEditAssignment,
      onEndAssignment,
}: StructureTabProps) {
      const leadershipAssignments = useMemo(() => {
            const head =
                  activeAssignments.find((assignment) =>
                        isAssignmentRole(assignment, ['Trưởng'])
                  ) || null;

            const deputies = activeAssignments.filter((assignment) =>
                  isAssignmentRole(assignment, ['Phó'])
            );

            const secretary =
                  activeAssignments.find((assignment) =>
                        isAssignmentRole(assignment, ['Thư ký'])
                  ) || null;

            const treasurer =
                  activeAssignments.find((assignment) =>
                        isAssignmentRole(assignment, ['Thủ quỹ'])
                  ) || null;

            return { head, deputies, secretary, treasurer };
      }, [activeAssignments]);

      const unitAssignments = useMemo(() => {
            const teams = activeUnits
                  .filter((unit) => unit.unitType === 'team')
                  .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
                  .map((unit) => {
                        const assignment =
                              activeAssignments.find(
                                    (item) =>
                                          isTeamAssignment(item) &&
                                          Number(item.unitId || 0) === Number(unit.id)
                              ) || null;

                        return {
                              unit,
                              assignment,
                              title: `Tổ trưởng ${unit.name}`,
                        };
                  });

            const committees = activeUnits
                  .filter((unit) => unit.unitType === 'committee')
                  .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
                  .map((unit) => {
                        const assignment =
                              activeAssignments.find(
                                    (item) =>
                                          isCommitteeAssignment(item) &&
                                          Number(item.unitId || 0) === Number(unit.id)
                              ) || null;

                        return {
                              unit,
                              assignment,
                              title: `Trưởng ban ${unit.name.replace(/^Ban\s+/i, '')}`,
                        };
                  });

            return { teams, committees };
      }, [activeAssignments, activeUnits]);

      if (!currentTerm) {
            return (
                  <SectionEmpty
                        title="Chưa có nhiệm kỳ hiện tại"
                        description="Tạo hoặc chọn một nhiệm kỳ để bắt đầu thiết lập cơ cấu tổ chức."
                  />
            );
      }

      return (
            <div className="space-y-6">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6">
                              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                    Điều hành chính
                              </h2>
                              <p className="mt-1 text-sm text-slate-500">
                                    {(leadershipAssignments.head ? 1 : 0) +
                                          leadershipAssignments.deputies.length +
                                          (leadershipAssignments.secretary ? 1 : 0) +
                                          (leadershipAssignments.treasurer ? 1 : 0)}{' '}
                                    vai trò đã có người phụ trách
                              </p>
                        </div>

                        <div className="space-y-6">
                              <div className="flex justify-center">
                                    <div className="w-full max-w-md">
                                          {leadershipAssignments.head ? (
                                                <OrgMiniCard
                                                      assignment={leadershipAssignments.head}
                                                      onEdit={onEditAssignment}
                                                      onEnd={onEndAssignment}
                                                />
                                          ) : (
                                                <OrgPlaceholderCard
                                                      title="Trưởng"
                                                      subtitle="Vai trò điều hành chính"
                                                      tone="blue"
                                                />
                                          )}
                                    </div>
                              </div>

                              <div className="mx-auto hidden h-8 w-px bg-slate-200 md:block" />

                              <div className="grid gap-4 xl:grid-cols-3">
                                    <div className="space-y-3">
                                          {leadershipAssignments.deputies.length === 0 ? (
                                                <OrgPlaceholderCard
                                                      title="Phó"
                                                      subtitle="Vai trò hỗ trợ điều hành"
                                                      tone="emerald"
                                                />
                                          ) : leadershipAssignments.deputies.length === 1 ? (
                                                <OrgMiniCard
                                                      assignment={leadershipAssignments.deputies[0]}
                                                      onEdit={onEditAssignment}
                                                      onEnd={onEndAssignment}
                                                />
                                          ) : (
                                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                                      {leadershipAssignments.deputies.map((assignment) => (
                                                            <OrgMiniCard
                                                                  key={assignment.id}
                                                                  assignment={assignment}
                                                                  onEdit={onEditAssignment}
                                                                  onEnd={onEndAssignment}
                                                                  compact
                                                            />
                                                      ))}
                                                </div>
                                          )}
                                    </div>

                                    <div>
                                          {leadershipAssignments.secretary ? (
                                                <OrgMiniCard
                                                      assignment={leadershipAssignments.secretary}
                                                      onEdit={onEditAssignment}
                                                      onEnd={onEndAssignment}
                                                />
                                          ) : (
                                                <OrgPlaceholderCard
                                                      title="Thư ký"
                                                      subtitle="Phụ trách ghi chép và tổng hợp"
                                                      tone="violet"
                                                />
                                          )}
                                    </div>

                                    <div>
                                          {leadershipAssignments.treasurer ? (
                                                <OrgMiniCard
                                                      assignment={leadershipAssignments.treasurer}
                                                      onEdit={onEditAssignment}
                                                      onEnd={onEndAssignment}
                                                />
                                          ) : (
                                                <OrgPlaceholderCard
                                                      title="Thủ quỹ"
                                                      subtitle="Phụ trách tài chính"
                                                      tone="amber"
                                                />
                                          )}
                                    </div>
                              </div>
                        </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6">
                              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                    Tổ / Ban phụ trách
                              </h2>
                              <p className="mt-1 text-sm text-slate-500">
                                    {unitAssignments.teams.filter((item) => item.assignment).length +
                                          unitAssignments.committees.filter((item) => item.assignment)
                                                .length}{' '}
                                    vị trí đã có người phụ trách
                              </p>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                              <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/60 p-5">
                                    <div>
                                          <h3 className="text-lg font-bold text-slate-900">Tổ</h3>
                                          <p className="mt-1 text-sm text-slate-500">
                                                Mỗi Tổ đang hoạt động cần có một Tổ trưởng.
                                          </p>
                                    </div>

                                    {unitAssignments.teams.length === 0 ? (
                                          <SectionEmpty
                                                title="Chưa có Tổ"
                                                description="Tạo Tổ ở tab Tổ / Ban để phát sinh vị trí Tổ trưởng."
                                          />
                                    ) : (
                                          <div className="space-y-4">
                                                {unitAssignments.teams.map((item) =>
                                                      item.assignment ? (
                                                            <OrgMiniCard
                                                                  key={item.unit.id}
                                                                  assignment={item.assignment}
                                                                  onEdit={onEditAssignment}
                                                                  onEnd={onEndAssignment}
                                                                  tone="blue"
                                                            />
                                                      ) : (
                                                            <OrgPlaceholderCard
                                                                  key={item.unit.id}
                                                                  title={item.title}
                                                                  subtitle={`${getUnitTypeLabel(item.unit.unitType)}: ${item.unit.name}`}
                                                                  tone="blue"
                                                            />
                                                      )
                                                )}
                                          </div>
                                    )}
                              </div>

                              <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/60 p-5">
                                    <div>
                                          <h3 className="text-lg font-bold text-slate-900">Ban</h3>
                                          <p className="mt-1 text-sm text-slate-500">
                                                Mỗi Ban đang hoạt động cần có một Trưởng ban.
                                          </p>
                                    </div>

                                    {unitAssignments.committees.length === 0 ? (
                                          <SectionEmpty
                                                title="Chưa có Ban"
                                                description="Tạo Ban ở tab Tổ / Ban để phát sinh vị trí Trưởng ban."
                                          />
                                    ) : (
                                          <div className="space-y-4">
                                                {unitAssignments.committees.map((item) =>
                                                      item.assignment ? (
                                                            <OrgMiniCard
                                                                  key={item.unit.id}
                                                                  assignment={item.assignment}
                                                                  onEdit={onEditAssignment}
                                                                  onEnd={onEndAssignment}
                                                                  tone="violet"
                                                            />
                                                      ) : (
                                                            <OrgPlaceholderCard
                                                                  key={item.unit.id}
                                                                  title={item.title}
                                                                  subtitle={`${getUnitTypeLabel(item.unit.unitType)}: ${item.unit.name}`}
                                                                  tone="violet"
                                                            />
                                                      )
                                                )}
                                          </div>
                                    )}
                              </div>
                        </div>
                  </div>
            </div>
      );
}
