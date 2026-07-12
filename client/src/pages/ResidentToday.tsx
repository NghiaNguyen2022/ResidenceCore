import { useEffect, useMemo, useState } from "react";
import { BookOpen, BriefcaseBusiness, CalendarDays, CheckCircle2, Home, ShieldCheck } from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { trpc } from "@/lib/trpc";

function formatDateText(value?: string | null) {
      if (!value) return "";
      const [year, month, day] = String(value).slice(0, 10).split("-");
      if (!year || !month || !day) return String(value);
      return `${day}/${month}/${year}`;
}


function normalizeStatus(status?: string | null) {
      const value = String(status || "pending").toLowerCase();

      if (value === "absent") return "skipped";

      if (["pending", "in_progress", "confirmed"].includes(value)) {
            return "pending";
      }

      if (["completed", "skipped", "cancelled"].includes(value)) {
            return value;
      }

      return "pending";
}

function sortTodayDuties(items: any[]) {
      const priority: Record<string, number> = {
            pending: 1,
            skipped: 2,
            completed: 3,
            cancelled: 4,
      };

      return [...items].sort((left, right) => {
            const leftPriority = priority[normalizeStatus(left?.status)] || 9;
            const rightPriority = priority[normalizeStatus(right?.status)] || 9;

            if (leftPriority !== rightPriority) {
                  return leftPriority - rightPriority;
            }

            const leftTime = String(left?.startTime || left?.timeRange || "");
            const rightTime = String(right?.startTime || right?.timeRange || "");

            return leftTime.localeCompare(rightTime);
      });
}

function getStatusTone(status?: string | null) {
      switch (normalizeStatus(status)) {
            case "completed":
                  return "bg-emerald-50 text-emerald-700 ring-emerald-100";
            case "skipped":
                  return "bg-amber-50 text-amber-700 ring-amber-100";
            case "cancelled":
                  return "bg-slate-100 text-slate-500 ring-slate-200";
            default:
                  return "bg-orange-50 text-orange-700 ring-orange-100";
      }
}

function EmptyBox({ title, description }: { title: string; description: string }) {
      return (
            <div className="rounded-[26px] border border-dashed border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,248,230,0.70))] px-5 py-8 text-center shadow-inner">
                  <div className="font-bold text-[#17233f]">{title}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            </div>
      );
}

function SummaryCard({
      icon: Icon,
      label,
      value,
      hint,
}: {
      icon: any;
      label: string;
      value: string | number;
      hint?: string;
}) {
      return (
            <div className="group relative overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(255,250,236,0.92)_46%,rgba(243,190,84,0.60)_100%)] p-5 shadow-[0_22px_60px_rgba(120,53,15,0.12)] ring-1 ring-amber-100/70">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/45 blur-2xl" />
                  <div className="pointer-events-none absolute bottom-0 right-0 h-20 w-40 bg-[radial-gradient(circle_at_bottom_right,rgba(180,83,9,0.18),transparent_62%)]" />
                  <div className="relative flex items-start justify-between gap-4">
                        <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-600">{label}</p>
                              <p className="mt-4 text-4xl font-black tracking-tight text-[#17233f]">{value}</p>
                              {hint && <p className="mt-2 text-sm font-medium leading-5 text-slate-600">{hint}</p>}
                        </div>
                        <div className="rounded-[22px] border border-white/80 bg-white/80 p-3 text-amber-700 shadow-[0_12px_30px_rgba(120,53,15,0.12)]">
                              <Icon className="h-6 w-6" />
                        </div>
                  </div>
            </div>
      );
}

function StudyCard({ item }: { item: any }) {
      return (
            <div className="rounded-[26px] border border-amber-100/80 bg-white/92 px-4 py-3.5 shadow-[0_18px_42px_rgba(120,53,15,0.07)] ring-1 ring-white/70">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                                    {item.timeRange || `${item.startTime || "--:--"} - ${item.endTime || "--:--"}`}
                              </div>
                              <div className="mt-1 text-base font-bold text-[#17335f]">
                                    {item.subjectName || "Khung giờ học"}
                              </div>
                              {item.location && (
                                    <p className="mt-1 text-sm text-slate-500">Địa điểm: {item.location}</p>
                              )}
                              {item.notes && (
                                    <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
                                          {item.notes}
                                    </p>
                              )}
                        </div>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                              {item.dayLabel || "Hôm nay"}
                        </span>
                  </div>
            </div>
      );
}

function DutyCard({
      item,
      isCompleting,
      onComplete,
}: {
      item: any;
      isCompleting?: boolean;
      onComplete?: (item: any) => void;
}) {
      const isAssignedToMe = Boolean(item.isAssignedToMe);
      const canComplete = Boolean(item.canComplete);

      return (
            <div className="rounded-[26px] border border-amber-100/80 bg-white/92 px-4 py-3.5 shadow-[0_18px_42px_rgba(120,53,15,0.07)] ring-1 ring-white/70">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    {item.timeRange || `${item.startTime || "--:--"} - ${item.endTime || "--:--"}`}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <div className="text-lg font-bold text-slate-950">
                                          {item.dutyName || "Công tác"}
                                    </div>
                                    {isAssignedToMe && (
                                          <span className="rounded-full bg-[#17335f] px-2.5 py-1 text-xs font-semibold text-white">
                                                Phân công cho tôi
                                          </span>
                                    )}
                              </div>
                              {item.description && (
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                          {item.description}
                                    </p>
                              )}
                              {item.notes && (
                                    <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
                                          {item.notes}
                                    </p>
                              )}
                        </div>
                        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                              <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusTone(
                                          item.status
                                    )}`}
                              >
                                    {item.statusLabel || "Chưa làm"}
                              </span>

                              {canComplete && (
                                    <button
                                          type="button"
                                          onClick={() => onComplete?.(item)}
                                          disabled={isCompleting}
                                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#17335f] px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#244878] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                          <CheckCircle2 className="h-4 w-4" />
                                          {isCompleting ? "Đang lưu..." : "Hoàn thành"}
                                    </button>
                              )}
                        </div>
                  </div>
            </div>
      );
}

function DutyStats({ stats }: { stats: any }) {
      const items = [
            { label: "Tổng", value: stats?.total ?? 0, className: "bg-slate-50 text-slate-700 ring-slate-200" },
            { label: "Chưa làm", value: stats?.pending ?? 0, className: "bg-orange-50 text-orange-700 ring-orange-100" },
            { label: "Hoàn thành", value: stats?.completed ?? 0, className: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
            { label: "Vắng", value: stats?.skipped ?? 0, className: "bg-amber-50 text-amber-700 ring-amber-100" },
      ];

      return (
            <div className="mb-4 grid gap-2 sm:grid-cols-4">
                  {items.map((item) => (
                        <div
                              key={item.label}
                              className={`rounded-2xl px-3 py-2 text-center text-sm font-semibold ring-1 ${item.className}`}
                        >
                              <div className="text-lg font-bold">{item.value}</div>
                              <div className="text-xs">{item.label}</div>
                        </div>
                  ))}
            </div>
      );
}

function ScopeDutyGroup({
      title,
      description,
      assignments,
}: {
      title: string;
      description?: string;
      assignments: any[];
}) {
      return (
            <div className="rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,250,236,0.78))] p-5 shadow-[0_22px_60px_rgba(120,53,15,0.09)] ring-1 ring-amber-100/70">
                  <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                              <h3 className="text-lg font-bold text-slate-950">{title}</h3>
                              {description && (
                                    <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                              )}
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                              {assignments.length} việc
                        </span>
                  </div>

                  <div className="space-y-3">
                        {assignments.length === 0 ? (
                              <EmptyBox
                                    title="Chưa có công tác trong phạm vi này"
                                    description="Hôm nay chưa có công tác nào được giao cho phạm vi vai trò này."
                              />
                        ) : (
                              assignments.map((item: any) => (
                                    <DutyCard
                                          key={`${title}-${item.id}`}
                                          item={{
                                                ...item,
                                                canComplete: false,
                                                isAssignedToMe: false,
                                          }}
                                    />
                              ))
                        )}
                  </div>
            </div>
      );
}

function ScopeDutiesPanel({ scopeDuties }: { scopeDuties: any }) {
      const executiveAssignments = scopeDuties?.executive?.assignments || [];
      const teams = scopeDuties?.teams || [];
      const committees = scopeDuties?.committees || [];
      const hasAnyScope =
            Boolean(scopeDuties?.executive?.enabled) || teams.length > 0 || committees.length > 0;

      if (!hasAnyScope) {
            return null;
      }

      return (
            <section className="rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,250,236,0.78))] p-5 shadow-[0_22px_60px_rgba(120,53,15,0.09)] ring-1 ring-amber-100/70">
                  <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                              <h2 className="text-2xl font-black tracking-tight text-[#07152f]">Công tác theo vai trò hôm nay</h2>
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Các công tác thuộc phạm vi bạn đang phụ trách. Phần này dùng để theo dõi,
                                    không đánh dấu hoàn thành thay cho từng cá nhân.
                              </p>
                        </div>
                        <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                              {scopeDuties?.summary?.total || 0} công tác
                        </span>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                        {scopeDuties?.executive?.enabled && (
                              <ScopeDutyGroup
                                    title="Toàn lưu xá"
                                    description="Công tác toàn hệ thống dành cho nhóm điều hành."
                                    assignments={executiveAssignments}
                              />
                        )}

                        {teams.map((team: any) => (
                              <ScopeDutyGroup
                                    key={`team-${team.unitId || team.unitName}`}
                                    title={`Tổ của tôi · ${team.unitName || "Tổ chưa xác định"}`}
                                    description="Công tác được giao cho tổ bạn phụ trách."
                                    assignments={team.assignments || []}
                              />
                        ))}

                        {committees.map((committee: any) => (
                              <ScopeDutyGroup
                                    key={`committee-${committee.unitId || committee.unitName}`}
                                    title={`Ban của tôi · ${committee.unitName || "Ban chưa xác định"}`}
                                    description="Công tác được giao cho ban bạn phụ trách."
                                    assignments={committee.assignments || []}
                              />
                        ))}
                  </div>
            </section>
      );
}

function RoleCard({ role }: { role: any }) {
      return (
            <div className="rounded-[22px] border border-amber-100/80 bg-white/90 px-4 py-3 shadow-[0_12px_28px_rgba(120,53,15,0.045)]">
                  <div className="font-semibold text-[#17335f]">{role.roleName || "Chức vụ"}</div>
                  <div className="mt-1 text-sm text-slate-500">
                        {role.unitName || "Toàn lưu xá"}
                  </div>
            </div>
      );
}

export default function ResidentToday() {
      const [successMessage, setSuccessMessage] = useState("");
      const [errorMessage, setErrorMessage] = useState("");
      const [completingDutyId, setCompletingDutyId] = useState<number | null>(null);

      const todayQuery = trpc.residentPortal.getTodayOverview.useQuery(undefined, {
            retry: false,
            refetchOnWindowFocus: false,
      });

      const completeDutyMutation = trpc.residentPortal.completeTodayDuty.useMutation({
            onSuccess: async (result: any) => {
                  setErrorMessage("");
                  setSuccessMessage(result?.message || "Đã đánh dấu hoàn thành công tác.");
                  await todayQuery.refetch();
            },
            onError: (error: any) => {
                  setSuccessMessage("");
                  setErrorMessage(error?.message || "Không thể hoàn thành công tác.");
            },
            onSettled: () => {
                  setCompletingDutyId(null);
            },
      });

      useEffect(() => {
            if (!successMessage) return;

            const timer = window.setTimeout(() => {
                  setSuccessMessage("");
            }, 5000);

            return () => window.clearTimeout(timer);
      }, [successMessage]);

      useEffect(() => {
            if (!errorMessage) return;

            const timer = window.setTimeout(() => {
                  setErrorMessage("");
            }, 7000);

            return () => window.clearTimeout(timer);
      }, [errorMessage]);

      const data: any = todayQuery.data;
      const studySchedules = data?.studySchedules || [];
      const duties = data?.duties || [];
      const sortedDuties = useMemo(() => sortTodayDuties(duties), [duties]);
      const pendingDirectDutyCount = sortedDuties.filter(
            (item: any) => normalizeStatus(item?.status) === "pending"
      ).length;

      const roles = data?.roles || [];
      const scopeDuties = data?.scopeDuties || null;
      const resident = data?.resident;
      const today = data?.today;
      const dutyStats = data?.summary?.dutyStats || {
            total: duties.length,
            pending: duties.filter((item: any) => normalizeStatus(item.status) === "pending").length,
            completed: duties.filter((item: any) => normalizeStatus(item.status) === "completed").length,
            skipped: duties.filter((item: any) => normalizeStatus(item.status) === "skipped").length,
      };

      const handleCompleteDuty = (item: any) => {
            if (!item?.id) return;
            const assignmentId = Number(item.id);
            setCompletingDutyId(assignmentId);
            completeDutyMutation.mutate({ assignmentId });
      };

      return (
            <ResidenceCareLayout>
                  <div className="relative min-h-[calc(100vh-96px)] overflow-hidden bg-[radial-gradient(circle_at_18%_0%,rgba(255,214,128,0.42),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(15,23,42,0.12),transparent_30%),linear-gradient(180deg,#fffdf8_0%,#fff7df_44%,#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-10">
                        <div className="pointer-events-none absolute inset-x-8 top-0 h-40 rounded-full bg-white/45 blur-3xl" />
                        <div className="relative mx-auto max-w-[1180px] space-y-6">
                        <section className="relative overflow-hidden rounded-[34px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,250,236,0.84)_50%,rgba(231,194,124,0.34))] px-6 py-7 text-center shadow-[0_26px_70px_rgba(120,53,15,0.12)] ring-1 ring-amber-100/80">
                              <div className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full bg-amber-200/35 blur-3xl" />
                              <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-slate-900/10 blur-3xl" />
                              <div className="relative mx-auto max-w-3xl">
                                    <p className="mx-auto inline-flex rounded-full border border-amber-200 bg-white/80 px-4 py-1 text-xs font-black uppercase tracking-[0.24em] text-amber-700 shadow-sm">
                                          Portal học viên
                                    </p>
                                    <h1 className="mt-4 text-4xl font-black tracking-tight text-[#07152f] sm:text-5xl">
                                          {today?.dayLabel || "Hôm nay"} · {formatDateText(today?.date)}
                                    </h1>
                                    <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
                                          Tổng hợp lịch học, công tác trực tiếp và phạm vi vai trò trong ngày.
                                    </p>
                                    {pendingDirectDutyCount > 0 && (
                                          <div className="mt-4 inline-flex rounded-full border border-amber-200 bg-amber-50/90 px-4 py-2 text-sm font-bold text-amber-800 shadow-sm">
                                                Bạn còn {pendingDirectDutyCount} công tác trực tiếp chưa hoàn thành
                                          </div>
                                    )}
                              </div>

                              {resident && (
                                    <div className="relative mx-auto mt-5 flex w-fit flex-wrap items-center justify-center gap-2 rounded-full border border-white/80 bg-white/82 px-4 py-2 text-sm text-slate-600 shadow-[0_14px_34px_rgba(120,53,15,0.10)] ring-1 ring-amber-100/80">
                                          <span className="font-black text-[#17233f]">{resident.fullName}</span>
                                          <span className="text-slate-300">•</span>
                                          <span>{resident.residentCode}</span>
                                          {resident.roomName && (
                                                <>
                                                      <span className="text-slate-300">•</span>
                                                      <span>Phòng: {resident.roomName}</span>
                                                </>
                                          )}
                                    </div>
                              )}
                        </section>

                        {todayQuery.isLoading && (
                              <section className="rounded-[26px] border border-amber-100/80 bg-white/90 p-6 text-sm text-slate-500 shadow-[0_16px_38px_rgba(120,53,15,0.055)]">
                                    Đang tải thông tin hôm nay...
                              </section>
                        )}

                        {todayQuery.error && (
                              <section className="rounded-[26px] border border-red-100 bg-red-50/80 p-6 text-sm font-semibold text-red-700 shadow-sm">
                                    {todayQuery.error.message || "Không thể tải thông tin hôm nay."}
                              </section>
                        )}

                        {successMessage && (
                              <section className="rounded-[22px] border border-emerald-100 bg-emerald-50/80 p-4 text-sm font-semibold text-emerald-700 shadow-sm">
                                    {successMessage}
                              </section>
                        )}

                        {errorMessage && (
                              <section className="rounded-[22px] border border-red-100 bg-red-50/80 p-4 text-sm font-semibold text-red-700 shadow-sm">
                                    {errorMessage}
                              </section>
                        )}

                        {!todayQuery.isLoading && !todayQuery.error && (
                              <>
                                    <div className="grid gap-4 md:grid-cols-3">
                                          <SummaryCard
                                                icon={BookOpen}
                                                label="Lịch học"
                                                value={studySchedules.length}
                                                hint="Khung giờ học hôm nay"
                                          />
                                          <SummaryCard
                                                icon={BriefcaseBusiness}
                                                label="Công tác của tôi"
                                                value={dutyStats.total}
                                                hint={`${dutyStats.pending} chưa làm · ${dutyStats.completed} hoàn thành`}
                                          />
                                          <SummaryCard
                                                icon={ShieldCheck}
                                                label="Vai trò"
                                                value={roles.length || "Học viên"}
                                                hint={roles.length ? "Chức vụ đang đảm nhiệm" : "Vai trò cơ bản"}
                                          />
                                    </div>

                                    <section className="grid gap-5 lg:grid-cols-2">
                                          <div className="rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,250,236,0.78))] p-5 shadow-[0_22px_60px_rgba(120,53,15,0.09)] ring-1 ring-amber-100/70">
                                                <div className="mb-4 flex items-center justify-between gap-3">
                                                      <div>
                                                            <h2 className="text-2xl font-black tracking-tight text-[#07152f]">
                                                                  Lịch học hôm nay
                                                            </h2>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  Các khung giờ học đã đăng ký trong hồ sơ.
                                                            </p>
                                                      </div>
                                                      <CalendarDays className="h-5 w-5 text-slate-400" />
                                                </div>

                                                <div className="space-y-3">
                                                      {studySchedules.length === 0 ? (
                                                            <EmptyBox
                                                                  title="Không có lịch học hôm nay"
                                                                  description="Hôm nay chưa có khung giờ học nào được ghi nhận."
                                                            />
                                                      ) : (
                                                            studySchedules.map((item: any) => (
                                                                  <StudyCard key={item.id} item={item} />
                                                            ))
                                                      )}
                                                </div>
                                          </div>

                                          <div className="rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,250,236,0.78))] p-5 shadow-[0_22px_60px_rgba(120,53,15,0.09)] ring-1 ring-amber-100/70">
                                                <div className="mb-4 flex items-center justify-between gap-3">
                                                      <div>
                                                            <h2 className="text-2xl font-black tracking-tight text-[#07152f]">
                                                                  Công tác hôm nay
                                                            </h2>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  Công tác trực tiếp được ưu tiên sắp xếp việc chưa làm lên trước.
                                                            </p>
                                                      </div>
                                                      <BriefcaseBusiness className="h-5 w-5 text-slate-400" />
                                                </div>

                                                <DutyStats stats={dutyStats} />

                                                <div className="space-y-3">
                                                      {duties.length === 0 ? (
                                                            <EmptyBox
                                                                  title="Chưa có công tác hôm nay"
                                                                  description="Bạn chưa được phân công công tác nào trong ngày này."
                                                            />
                                                      ) : (
                                                            sortedDuties.map((item: any) => (
                                                                  <DutyCard
                                                                        key={item.id}
                                                                        item={item}
                                                                        isCompleting={
                                                                              completeDutyMutation.isPending &&
                                                                              completingDutyId === Number(item.id)
                                                                        }
                                                                        onComplete={handleCompleteDuty}
                                                                  />
                                                            ))
                                                      )}
                                                </div>
                                          </div>
                                    </section>

                                    <ScopeDutiesPanel scopeDuties={scopeDuties} />

                                    <section className="rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,250,236,0.78))] p-5 shadow-[0_22px_60px_rgba(120,53,15,0.09)] ring-1 ring-amber-100/70">
                                          <div className="mb-4 flex items-center justify-between gap-3">
                                                <div>
                                                      <h2 className="text-2xl font-black tracking-tight text-[#07152f]">
                                                            Thông tin lưu trú & vai trò
                                                      </h2>
                                                      <p className="mt-1 text-sm text-slate-500">
                                                            Thông tin cơ bản giúp bạn nắm phạm vi sinh hoạt trong lưu xá.
                                                      </p>
                                                </div>
                                                <Home className="h-5 w-5 text-slate-400" />
                                          </div>

                                          <div className="grid gap-3 md:grid-cols-2">
                                                <div className="rounded-[22px] border border-amber-100/80 bg-amber-50/40 px-4 py-3">
                                                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                            Phòng hiện tại
                                                      </div>
                                                      <div className="mt-1 font-bold text-slate-950">
                                                            {resident?.roomName || "Chưa gán phòng"}
                                                      </div>
                                                </div>

                                                {roles.length === 0 ? (
                                                      <RoleCard role={{ roleName: "Học viên lưu trú", unitName: "Vai trò cơ bản" }} />
                                                ) : (
                                                      roles.map((role: any) => (
                                                            <RoleCard
                                                                  key={`${role.roleCode}-${role.unitType || "all"}-${role.unitId || ""}`}
                                                                  role={role}
                                                            />
                                                      ))
                                                )}
                                          </div>
                                    </section>
                              </>
                        )}
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
