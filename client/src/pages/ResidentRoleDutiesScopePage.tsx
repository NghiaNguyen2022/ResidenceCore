import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { trpc } from "@/lib/trpc";

type DutyScopeKind = "executive" | "team" | "committee";

type ResidentRoleDutiesScopePageProps = {
      kind: DutyScopeKind;
      title: string;
      description: string;
      emptyTitle: string;
      emptyDescription: string;
};

function toDateInput(value: Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
      const next = new Date(date);
      next.setDate(next.getDate() + days);
      return next;
}

function formatDateText(value?: string | null) {
      if (!value) return "";
      const [year, month, day] = String(value).slice(0, 10).split("-");
      if (!year || !month || !day) return String(value);
      return `${day}/${month}/${year}`;
}

function getStatusTone(status?: string | null) {
      switch (String(status || "pending")) {
            case "completed":
                  return "bg-emerald-50 text-emerald-700 ring-emerald-100";
            case "skipped":
            case "absent":
                  return "bg-amber-50 text-amber-700 ring-amber-100";
            case "cancelled":
                  return "bg-slate-100 text-slate-500 ring-slate-200";
            default:
                  return "bg-orange-50 text-orange-700 ring-orange-100";
      }
}

function EmptyBox({ title, description }: { title: string; description: string }) {
      return (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                  <div className="font-semibold text-slate-800">{title}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            </div>
      );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
      return (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {label}
                  </div>
                  <div className="mt-1 text-2xl font-bold text-slate-950">{value}</div>
            </div>
      );
}

function DutyCard({ duty }: { duty: any }) {
      return (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                              <div className="text-sm font-semibold text-slate-500">
                                    {formatDateText(duty.assignedDate)}
                                    {duty.timeRange ? ` · ${duty.timeRange}` : ""}
                              </div>
                              <div className="mt-1 text-lg font-bold text-slate-950">
                                    {duty.dutyName || "Công tác"}
                              </div>
                              {duty.description && (
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                          {duty.description}
                                    </p>
                              )}
                              {duty.notes && (
                                    <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
                                          {duty.notes}
                                    </p>
                              )}
                        </div>

                        <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusTone(
                                    duty.status
                              )}`}
                        >
                              {duty.statusLabel || "Chưa làm"}
                        </span>
                  </div>
            </div>
      );
}

function ScopeSection({
      title,
      subtitle,
      assignments,
      emptyTitle,
      emptyDescription,
}: {
      title: string;
      subtitle?: string;
      assignments: any[];
      emptyTitle: string;
      emptyDescription: string;
}) {
      return (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                              <h2 className="text-xl font-bold text-slate-950">{title}</h2>
                              {subtitle && (
                                    <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
                              )}
                        </div>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                              {assignments.length} công tác
                        </span>
                  </div>

                  <div className="mt-4 space-y-3">
                        {assignments.length === 0 ? (
                              <EmptyBox title={emptyTitle} description={emptyDescription} />
                        ) : (
                              assignments.map((duty: any) => (
                                    <DutyCard key={`${duty.id}-${duty.assignedDate}`} duty={duty} />
                              ))
                        )}
                  </div>
            </section>
      );
}

export function ResidentRoleDutiesScopePage({
      kind,
      title,
      description,
      emptyTitle,
      emptyDescription,
}: ResidentRoleDutiesScopePageProps) {
      const today = useMemo(() => new Date(), []);
      const [startDate, setStartDate] = useState(toDateInput(today));
      const [endDate, setEndDate] = useState(toDateInput(addDays(today, 7)));

      const dutyScopeQuery = trpc.residentPortal.getMyDutyScope.useQuery(
            { startDate, endDate },
            {
                  retry: false,
                  refetchOnWindowFocus: false,
            }
      );

      const data: any = dutyScopeQuery.data;
      const summary = data?.summary || {
            total: 0,
            pending: 0,
            completed: 0,
            skipped: 0,
            cancelled: 0,
      };

      const sections = useMemo(() => {
            if (!data) return [];

            if (kind === "executive") {
                  return data.executive?.enabled
                        ? [
                                {
                                      key: "executive",
                                      title: "Công tác toàn lưu xá",
                                      subtitle: "Nhóm điều hành theo dõi toàn bộ công tác trong khoảng thời gian đã chọn.",
                                      assignments: data.executive?.assignments || [],
                                },
                          ]
                        : [];
            }

            if (kind === "team") {
                  return (data.teams || []).map((team: any) => ({
                        key: `team-${team.unitId || team.unitName}`,
                        title: team.unitName || "Tổ chưa xác định",
                        subtitle: `${team.myRoleName || "Tổ trưởng"} · Công tác được giao cho tổ`,
                        assignments: team.assignments || [],
                  }));
            }

            return (data.committees || []).map((committee: any) => ({
                  key: `committee-${committee.unitId || committee.unitName}`,
                  title: committee.unitName || "Ban chưa xác định",
                  subtitle: `${committee.myRoleName || "Trưởng ban"} · Công tác được giao cho ban`,
                  assignments: committee.assignments || [],
            }));
      }, [data, kind]);

      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                                                Công tác theo vai trò
                                          </p>
                                          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                                {title}
                                          </h1>
                                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                                {description}
                                          </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                Khoảng xem
                                          </div>
                                          <div className="grid gap-2 sm:grid-cols-2">
                                                <input
                                                      type="date"
                                                      value={startDate}
                                                      onChange={(event) => setStartDate(event.target.value)}
                                                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
                                                />
                                                <input
                                                      type="date"
                                                      value={endDate}
                                                      onChange={(event) => setEndDate(event.target.value)}
                                                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
                                                />
                                          </div>
                                    </div>
                              </div>
                        </section>

                        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                              <SummaryCard label="Tổng" value={summary.total || 0} />
                              <SummaryCard label="Chưa làm" value={summary.pending || 0} />
                              <SummaryCard label="Hoàn thành" value={summary.completed || 0} />
                              <SummaryCard label="Vắng" value={summary.skipped || 0} />
                              <SummaryCard label="Đã hủy" value={summary.cancelled || 0} />
                        </section>

                        {dutyScopeQuery.isLoading && (
                              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <p className="text-sm text-slate-500">Đang tải công tác...</p>
                              </section>
                        )}

                        {dutyScopeQuery.error && (
                              <section className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                    {dutyScopeQuery.error.message || "Không thể tải công tác theo vai trò."}
                              </section>
                        )}

                        {!dutyScopeQuery.isLoading && !dutyScopeQuery.error && sections.length === 0 && (
                              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <EmptyBox title={emptyTitle} description={emptyDescription} />
                              </section>
                        )}

                        <div className="space-y-5">
                              {sections.map((section: any) => (
                                    <ScopeSection
                                          key={section.key}
                                          title={section.title}
                                          subtitle={section.subtitle}
                                          assignments={section.assignments || []}
                                          emptyTitle="Chưa có công tác trong khoảng này"
                                          emptyDescription="Khi quản lý tạo phân công cho phạm vi này, dữ liệu sẽ xuất hiện tại đây."
                                    />
                              ))}
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
