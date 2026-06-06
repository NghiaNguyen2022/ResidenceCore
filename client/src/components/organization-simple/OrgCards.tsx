import { Edit2 } from 'lucide-react';

import type { OrganizationAssignment } from './types';
import {
      getAssignmentDisplayTitle,
      getAssignmentStatusClass,
      getAssignmentStatusLabel,
      getRoomLabelFromAssignment,
      getUnitTypeLabel,
      normalizeText,
} from './utils';

export function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
      return (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
                  {children}
            </span>
      );
}

export function SectionEmpty({ title, description }: { title: string; description: string }) {
      return (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                  <p className="font-semibold text-neutral-800">{title}</p>
                  <p className="mt-1 text-sm text-neutral-500">{description}</p>
            </div>
      );
}

export function getCardToneClass(tone: 'slate' | 'blue' | 'emerald' | 'violet' | 'amber' = 'slate') {
      if (tone === 'blue') return 'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-sky-50';
      if (tone === 'emerald') return 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50';
      if (tone === 'violet') return 'border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50';
      if (tone === 'amber') return 'border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50';
      return 'border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100';
}

export function getAssignmentTone(assignment?: OrganizationAssignment | null) {
      const roleName = normalizeText(assignment?.roleName || assignment?.assignmentTitle || '');

      if (roleName === 'truong') return 'blue' as const;
      if (roleName === 'pho') return 'emerald' as const;
      if (roleName === 'thu ky') return 'violet' as const;
      if (roleName === 'thu quy') return 'amber' as const;
      if (assignment?.roleType === 'team_leader' || assignment?.unitType === 'team') return 'blue' as const;
      if (assignment?.roleType === 'committee_head' || assignment?.unitType === 'committee') return 'violet' as const;

      return 'slate' as const;
}

export function OrgMiniCard({
      assignment,
      onEdit,
      onEnd,
      tone,
      compact = false,
}: {
      assignment: OrganizationAssignment;
      onEdit: (assignment: OrganizationAssignment) => void;
      onEnd: (assignment: OrganizationAssignment) => void;
      tone?: 'slate' | 'blue' | 'emerald' | 'violet' | 'amber';
      compact?: boolean;
}) {
      const resolvedTone = tone || getAssignmentTone(assignment);

      return (
            <div
                  className={[
                        'rounded-3xl border shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]',
                        getCardToneClass(resolvedTone),
                        compact ? 'p-3' : 'p-4',
                  ].join(' ')}
            >
                  <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                              <p className={compact ? 'text-sm font-bold text-slate-900' : 'text-base font-bold text-slate-900'}>
                                    {getAssignmentDisplayTitle(assignment)}
                              </p>
                              <p className={compact ? 'mt-1.5 truncate text-sm font-semibold text-slate-800' : 'mt-2 truncate text-sm font-semibold text-slate-800'}>
                                    {assignment.residentName || '-'}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">{getRoomLabelFromAssignment(assignment)}</p>
                              {(assignment.unitName || assignment.unitCode) && (
                                    <p className="mt-2 text-xs text-slate-500">
                                          {getUnitTypeLabel(assignment.unitType)}: {assignment.unitName || assignment.unitCode}
                                    </p>
                              )}
                        </div>

                        <Badge className={getAssignmentStatusClass(assignment.status)}>
                              {getAssignmentStatusLabel(assignment.status)}
                        </Badge>
                  </div>

                  <div className={compact ? 'mt-3 flex flex-wrap gap-2' : 'mt-4 flex flex-wrap gap-2'}>
                        <button
                              type="button"
                              onClick={() => onEdit(assignment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                        >
                              <Edit2 className="h-3.5 w-3.5" />
                              Cập nhật
                        </button>
                        <button
                              type="button"
                              onClick={() => onEnd(assignment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-orange-100 bg-orange-50/90 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                        >
                              Kết thúc vai trò
                        </button>
                  </div>
            </div>
      );
}

export function OrgPlaceholderCard({
      title,
      subtitle,
      tone = 'slate',
      compact = false,
}: {
      title: string;
      subtitle?: string;
      tone?: 'slate' | 'blue' | 'emerald' | 'violet' | 'amber';
      compact?: boolean;
}) {
      return (
            <div
                  className={[
                        'rounded-3xl border border-dashed p-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)]',
                        getCardToneClass(tone),
                        compact ? 'p-3' : 'p-4',
                  ].join(' ')}
            >
                  <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                              <p className={compact ? 'text-sm font-bold text-slate-800' : 'text-base font-bold text-slate-800'}>
                                    {title}
                              </p>
                              <p className="mt-2 text-sm font-semibold text-slate-500">
                                    Chưa bổ nhiệm
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                    {subtitle || 'Đang còn trống'}
                              </p>
                        </div>

                        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                              Còn trống
                        </Badge>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-xs text-slate-500">
                        Bổ nhiệm tại tab Bổ nhiệm / Phân công.
                  </div>
            </div>
      );
}
