import { Save, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import type {
      AssignmentForm,
      OrganizationRole,
      OrganizationTerm,
      OrganizationUnit,
} from './types';
import {
      buildAssignmentTitle,
      getResidentDisplayName,
      getRoomLabelFromMember,
      getUnitTypeLabel,
      roleRequiresUnit,
} from './utils';

type AssignmentModalProps = {
      assignmentForm: AssignmentForm;
      terms: OrganizationTerm[];
      roles: OrganizationRole[];
      units: OrganizationUnit[];
      activeUnits: OrganizationUnit[];
      activeMembers: any[];
      selectedRole: OrganizationRole | null;
      assignmentError: string | null;
      isSaving: boolean;
      onChange: (form: AssignmentForm) => void;
      onClose: () => void;
      onSave: () => void;
};

export function AssignmentModal({
      assignmentForm,
      terms,
      roles,
      units,
      activeUnits,
      activeMembers,
      selectedRole,
      assignmentError,
      isSaving,
      onChange,
      onClose,
      onSave,
}: AssignmentModalProps) {
      const selectedRoleNeedsUnit = roleRequiresUnit(selectedRole);

      const filteredUnits = activeUnits.filter((unit) => {
            if (selectedRole?.roleType === 'team_leader') return unit.unitType === 'team';
            if (selectedRole?.roleType === 'committee_head') return unit.unitType === 'committee';
            return true;
      });

      const getUnitPlaceholder = () => {
            if (selectedRole?.roleType === 'team_leader') return 'Chọn Tổ';
            if (selectedRole?.roleType === 'committee_head') return 'Chọn Ban';
            return 'Chọn Tổ/Ban';
      };

      const getUnitLabel = () => {
            if (selectedRole?.roleType === 'team_leader') return 'Tổ';
            if (selectedRole?.roleType === 'committee_head') return 'Ban';
            return 'Tổ/Ban';
      };

      const updateForm = (changes: Partial<AssignmentForm>) => {
            onChange({
                  ...assignmentForm,
                  ...changes,
            });
      };

      const handleRoleChange = (roleId: string) => {
            const role = roles.find((item) => String(item.id) === roleId) || null;

            onChange({
                  ...assignmentForm,
                  roleId,
                  unitId: '',
                  assignmentTitle: buildAssignmentTitle(role, null),
            });
      };

      const handleUnitChange = (unitId: string) => {
            const unit = units.find((item) => String(item.id) === unitId) || null;

            onChange({
                  ...assignmentForm,
                  unitId,
                  assignmentTitle: buildAssignmentTitle(selectedRole, unit),
            });
      };

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 px-4 py-6 backdrop-blur-sm">
                  <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
                        <div className="mb-5 flex items-start justify-between gap-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-950">
                                          {assignmentForm.id ? 'Cập nhật phân công' : 'Bổ nhiệm / Phân công'}
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                          Chọn học viên, chức vụ và nhiệm kỳ phù hợp.
                                    </p>
                              </div>
                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50"
                              >
                                    <X className="h-4 w-4" />
                              </button>
                        </div>

                        {assignmentError && (
                              <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                    {assignmentError}
                              </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                              <label className="space-y-1.5">
                                    <Label>Nhiệm kỳ</Label>
                                    <select
                                          value={assignmentForm.termId}
                                          onChange={(event) =>
                                                updateForm({
                                                      termId: event.target.value,
                                                })
                                          }
                                          className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
                                    >
                                          <option value="">Chọn nhiệm kỳ</option>
                                          {terms.map((term) => (
                                                <option key={term.id} value={term.id}>
                                                      {term.name}
                                                </option>
                                          ))}
                                    </select>
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Chức vụ</Label>
                                    <select
                                          value={assignmentForm.roleId}
                                          onChange={(event) => handleRoleChange(event.target.value)}
                                          className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
                                    >
                                          <option value="">Chọn chức vụ</option>
                                          {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                      {role.name}
                                                </option>
                                          ))}
                                    </select>
                              </label>

                              {selectedRoleNeedsUnit && (
                                    <label className="space-y-1.5">
                                          <Label>{getUnitLabel()}</Label>
                                          <select
                                                value={assignmentForm.unitId}
                                                onChange={(event) => handleUnitChange(event.target.value)}
                                                className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
                                          >
                                                <option value="">{getUnitPlaceholder()}</option>
                                                {filteredUnits.map((unit) => (
                                                      <option key={unit.id} value={unit.id}>
                                                            {unit.name}
                                                      </option>
                                                ))}
                                          </select>

                                          {filteredUnits.length === 0 && (
                                                <p className="text-xs text-amber-600">
                                                      {selectedRole?.roleType === 'team_leader'
                                                            ? 'Chưa có Tổ đang hoạt động để bổ nhiệm Tổ trưởng.'
                                                            : 'Chưa có Ban đang hoạt động để bổ nhiệm Trưởng ban.'}
                                                </p>
                                          )}
                                    </label>
                              )}

                              <label className="space-y-1.5">
                                    <Label>Học viên</Label>
                                    <select
                                          value={assignmentForm.residentId}
                                          onChange={(event) =>
                                                updateForm({
                                                      residentId: event.target.value,
                                                })
                                          }
                                          className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
                                    >
                                          <option value="">Chọn học viên</option>
                                          {activeMembers.map((member: any) => (
                                                <option key={member.id} value={member.id}>
                                                      {getResidentDisplayName(member)} · {getRoomLabelFromMember(member)}
                                                </option>
                                          ))}
                                    </select>
                              </label>

                              <label className="space-y-1.5 md:col-span-2">
                                    <Label>Chức danh hiển thị</Label>
                                    <Input
                                          value={assignmentForm.assignmentTitle}
                                          onChange={(event) =>
                                                updateForm({
                                                      assignmentTitle: event.target.value,
                                                })
                                          }
                                          placeholder="Ví dụ: Tổ trưởng Tổ 1"
                                          className="rounded-2xl"
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Ngày bắt đầu</Label>
                                    <Input
                                          type="date"
                                          value={assignmentForm.startDate}
                                          onChange={(event) =>
                                                updateForm({
                                                      startDate: event.target.value,
                                                })
                                          }
                                          className="rounded-2xl"
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Ngày kết thúc</Label>
                                    <Input
                                          type="date"
                                          value={assignmentForm.endDate}
                                          onChange={(event) =>
                                                updateForm({
                                                      endDate: event.target.value,
                                                })
                                          }
                                          className="rounded-2xl"
                                    />
                              </label>

                              <label className="space-y-1.5 md:col-span-2">
                                    <Label>Ghi chú</Label>
                                    <Textarea
                                          value={assignmentForm.notes}
                                          onChange={(event) =>
                                                updateForm({
                                                      notes: event.target.value,
                                                })
                                          }
                                          rows={3}
                                          className="rounded-2xl"
                                    />
                              </label>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                              >
                                    Hủy
                              </button>
                              <button
                                    type="button"
                                    onClick={onSave}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                              >
                                    <Save className="h-4 w-4" />
                                    Lưu
                              </button>
                        </div>
                  </div>
            </div>
      );
}
