import { Edit2, Plus } from 'lucide-react';

import type { OrganizationAssignment } from './types';
import {
      formatDate,
      getAssignmentDisplayTitle,
      getAssignmentStatusClass,
      getAssignmentStatusLabel,
      getRoomLabelFromAssignment,
} from './utils';
import { Badge, SectionEmpty } from './OrgCards';

type AssignmentsTabProps = {
      filteredAssignments: OrganizationAssignment[];
      onCreateAssignment: () => void;
      onEditAssignment: (assignment: OrganizationAssignment) => void;
      onEndAssignment: (assignment: OrganizationAssignment) => void;
};

export function AssignmentsTab({
      filteredAssignments,
      onCreateAssignment,
      onEditAssignment,
      onEndAssignment,
}: AssignmentsTabProps) {
      return (
            <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                              <h2 className="text-lg font-bold text-neutral-950">
                                    Bổ nhiệm / Phân công
                              </h2>
                              <p className="mt-1 text-sm text-neutral-500">
                                    Quản lý người đang đảm nhiệm vai trò theo nhiệm kỳ.
                              </p>
                        </div>
                        <button
                              type="button"
                              onClick={onCreateAssignment}
                              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                              <Plus className="h-4 w-4" />
                              Bổ nhiệm
                        </button>
                  </div>

                  {filteredAssignments.length === 0 ? (
                        <SectionEmpty
                              title="Chưa có dữ liệu phân công"
                              description="Bổ nhiệm học viên vào các chức vụ để hiển thị cơ cấu tổ chức."
                        />
                  ) : (
                        <div className="overflow-hidden rounded-2xl border border-neutral-200">
                              <div className="grid grid-cols-[1.3fr_1fr_1fr_auto] gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-neutral-500">
                                    <span>Học viên</span>
                                    <span>Chức danh</span>
                                    <span>Thời gian</span>
                                    <span className="text-right">Thao tác</span>
                              </div>

                              {filteredAssignments.map((assignment) => (
                                    <div
                                          key={assignment.id}
                                          className="grid grid-cols-[1.3fr_1fr_1fr_auto] gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0"
                                    >
                                          <div>
                                                <p className="font-semibold text-neutral-900">
                                                      {assignment.residentName || '-'}
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-500">
                                                      {getRoomLabelFromAssignment(assignment)}
                                                </p>
                                          </div>

                                          <div>
                                                <p className="font-semibold text-neutral-900">
                                                      {getAssignmentDisplayTitle(assignment)}
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-500">
                                                      {assignment.unitName || assignment.roleName || '-'}
                                                </p>
                                          </div>

                                          <div>
                                                <p className="text-sm text-neutral-700">
                                                      {formatDate(assignment.startDate)}
                                                </p>
                                                <Badge className={getAssignmentStatusClass(assignment.status)}>
                                                      {getAssignmentStatusLabel(assignment.status)}
                                                </Badge>
                                          </div>

                                          <div className="flex justify-end gap-2">
                                                <button
                                                      type="button"
                                                      onClick={() => onEditAssignment(assignment)}
                                                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                                                >
                                                      <Edit2 className="h-3.5 w-3.5" />
                                                      Sửa
                                                </button>

                                                {assignment.status === 'active' && (
                                                      <button
                                                            type="button"
                                                            onClick={() => onEndAssignment(assignment)}
                                                            className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                                                      >
                                                            Kết thúc
                                                      </button>
                                                )}
                                          </div>
                                    </div>
                              ))}
                        </div>
                  )}
            </div>
      );
}
