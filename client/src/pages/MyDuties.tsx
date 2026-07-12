import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cx, residenceMediumStyle } from "@/components/shared/styleMedium";
import { toast } from "sonner";

type MyDutyAssignment = {
      id: number;
      dutyName?: string | null;
      assignedDate?: string | Date | null;
      notes?: string | null;
      status: string;
      statusLabel?: string | null;
      startTime?: string | null;
      endTime?: string | null;
      timeRange?: string | null;
      assignmentScopeLabel?: string | null;
      assignmentScope?: string | null;
      canComplete?: boolean;
};

type DutyFilter = "all" | "todo" | "completed" | "other";

function getStatusLabel(status: string, fallback?: string | null) {
      if (fallback) return fallback;

      switch (status) {
            case "pending":
                  return "Chưa làm";
            case "confirmed":
                  return "Đã xác nhận";
            case "in_progress":
                  return "Đang thực hiện";
            case "completed":
                  return "Hoàn thành";
            case "skipped":
            case "absent":
                  return "Vắng / Không làm";
            case "cancelled":
                  return "Đã hủy";
            default:
                  return status;
      }
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
      switch (status) {
            case "pending":
            case "confirmed":
            case "in_progress":
                  return "secondary";
            case "completed":
                  return "outline";
            case "cancelled":
                  return "destructive";
            default:
                  return "secondary";
      }
}

function formatDateText(value?: string | Date | null) {
      if (!value) return "Hôm nay";

      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return String(value).slice(0, 10) || "Hôm nay";

      return date.toLocaleDateString("vi-VN");
}

function isTodoDuty(status: string) {
      return ["pending", "confirmed", "in_progress"].includes(status);
}

function getScopeTone(scope?: string | null) {
      switch (scope) {
            case "room":
                  return "border-sky-100 bg-sky-50 text-sky-700";
            case "team":
                  return "border-emerald-100 bg-emerald-50 text-emerald-700";
            case "committee":
            case "ban":
                  return "border-violet-100 bg-violet-50 text-violet-700";
            default:
                  return "border-amber-100 bg-amber-50 text-amber-700";
      }
}

export default function MyDuties() {
      const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
      const isResident = user?.role === "resident";
      const [filter, setFilter] = useState<DutyFilter>("all");

      const todayQuery = trpc.residentPortal.getTodayOverview.useQuery(undefined, {
            enabled: Boolean(user) && isResident,
            retry: 1,
      });

      const completeMutation = trpc.residentPortal.completeTodayDuty.useMutation({
            onSuccess: (result) => {
                  todayQuery.refetch();
                  toast.success(result?.message || "Đã đánh dấu hoàn thành công tác");
            },
            onError: (error) => {
                  toast.error(error.message || "Cập nhật công tác thất bại");
            },
      });

      const assignments = ((todayQuery.data as any)?.duties ?? []) as MyDutyAssignment[];
      const today = (todayQuery.data as any)?.today;
      const summary = (todayQuery.data as any)?.summary;

      const dutyStats = useMemo(() => {
            const total = summary?.dutyStats?.total ?? assignments.length;
            const completed = summary?.dutyStats?.completed ?? assignments.filter((item) => item.status === "completed").length;
            const todo = assignments.filter((item) => isTodoDuty(item.status)).length;
            const other = Math.max(total - completed - todo, 0);

            return { total, completed, todo, other };
      }, [assignments, summary]);

      const filteredAssignments = useMemo(() => {
            switch (filter) {
                  case "todo":
                        return assignments.filter((item) => isTodoDuty(item.status));
                  case "completed":
                        return assignments.filter((item) => item.status === "completed");
                  case "other":
                        return assignments.filter((item) => !isTodoDuty(item.status) && item.status !== "completed");
                  default:
                        return assignments;
            }
      }, [assignments, filter]);

      const canShowResidentView = useMemo(() => {
            if (loading) return false;
            return Boolean(user) && isResident;
      }, [loading, user, isResident]);

      const handleMarkComplete = async (assignmentId: number) => {
            await completeMutation.mutateAsync({ assignmentId });
      };

      const filters: Array<{ key: DutyFilter; label: string; count: number }> = [
            { key: "all", label: "Tất cả", count: dutyStats.total },
            { key: "todo", label: "Chưa làm", count: dutyStats.todo },
            { key: "completed", label: "Hoàn thành", count: dutyStats.completed },
            { key: "other", label: "Khác", count: dutyStats.other },
      ];

      if (!canShowResidentView) {
            return (
                  <ResidenceCareLayout>
                        <div className={residenceMediumStyle.page}>
                              <div className={residenceMediumStyle.pageShell}>
                                    <Card className="rounded-[28px] border-amber-100/80 bg-white/90 p-6 shadow-[0_18px_44px_rgba(120,53,15,0.06)]">
                                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-600">Portal học viên</p>
                                          <div className="mt-2 text-[22px] font-semibold tracking-tight text-[#17335f]">Trang công tác</div>
                                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                                Chỉ học viên có quyền xem trang này. Nếu bạn là quản lý, hãy sử dụng trang quản lý công tác.
                                          </p>
                                    </Card>
                              </div>
                        </div>
                  </ResidenceCareLayout>
            );
      }

      return (
            <ResidenceCareLayout>
                  <div className={residenceMediumStyle.page}>
                        <div className={residenceMediumStyle.pageAura} />
                        <div className={residenceMediumStyle.pageShell}>
                              <div className="relative overflow-hidden rounded-[32px] border border-amber-100/80 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_34%),linear-gradient(135deg,rgba(255,251,235,0.96),rgba(255,255,255,0.94)_54%,rgba(254,243,199,0.88))] px-5 py-7 text-center shadow-[0_24px_70px_rgba(120,53,15,0.08)] md:px-8">
                                    <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-amber-200/30 blur-3xl" />
                                    <div className="pointer-events-none absolute -bottom-20 left-8 h-40 w-40 rounded-full bg-orange-100/50 blur-3xl" />
                                    <div className="relative mx-auto max-w-3xl">
                                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">Lưu xá của tôi</p>
                                          <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-[#17335f] md:text-[34px]">Công tác hôm nay</h1>
                                          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                                                Theo dõi các công tác được giao cho cá nhân, phòng, tổ hoặc ban của bạn trong ngày.
                                          </p>
                                          <div className="mt-4 flex flex-wrap justify-center gap-2">
                                                <span className="rounded-full border border-amber-100 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                                                      {today?.dayLabel || "Hôm nay"} · {today?.date ? formatDateText(today.date) : formatDateText(new Date())}
                                                </span>
                                                <span className="rounded-full border border-amber-100 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                                                      {dutyStats.total} công tác
                                                </span>
                                          </div>
                                    </div>
                              </div>

                              <div className="mt-4 grid gap-3 md:grid-cols-3">
                                    {[
                                          { label: "Tổng công tác", value: dutyStats.total, hint: "Cá nhân / phòng / tổ / ban" },
                                          { label: "Chưa hoàn thành", value: dutyStats.todo, hint: "Cần xử lý trong ngày" },
                                          { label: "Đã hoàn thành", value: dutyStats.completed, hint: "Đã cập nhật trạng thái" },
                                    ].map((item) => (
                                          <Card
                                                key={item.label}
                                                className="relative overflow-hidden rounded-[26px] border-amber-100/80 bg-[linear-gradient(135deg,rgba(255,251,235,0.96),rgba(255,255,255,0.92))] p-4 shadow-[0_16px_40px_rgba(120,53,15,0.06)]"
                                          >
                                                <div className="absolute right-4 top-4 h-9 w-9 rounded-full bg-amber-100/70" />
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-amber-700">{item.label}</p>
                                                <p className="mt-2 text-2xl font-semibold tracking-tight text-[#17335f]">{item.value}</p>
                                                <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
                                          </Card>
                                    ))}
                              </div>

                              <Card className="mt-4 overflow-hidden rounded-[30px] border-amber-100/80 bg-white/90 shadow-[0_18px_48px_rgba(120,53,15,0.065)]">
                                    <div className="flex flex-col gap-3 border-b border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.94),rgba(255,255,255,0.9))] px-5 py-4 md:flex-row md:items-center md:justify-between">
                                          <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Danh sách công tác</p>
                                                <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#17335f]">Việc cần theo dõi</h2>
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                                {filters.map((item) => (
                                                      <button
                                                            key={item.key}
                                                            type="button"
                                                            onClick={() => setFilter(item.key)}
                                                            className={cx(
                                                                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                                                                  filter === item.key
                                                                        ? "border-[#17335f] bg-[#17335f] text-white shadow-sm"
                                                                        : "border-amber-100 bg-white/80 text-slate-600 hover:border-amber-200 hover:bg-amber-50"
                                                            )}
                                                      >
                                                            {item.label}
                                                            <span className="ml-1 opacity-70">{item.count}</span>
                                                      </button>
                                                ))}
                                          </div>
                                    </div>

                                    <div className="space-y-3 p-4 md:p-5">
                                          {todayQuery.isLoading ? (
                                                <div className="rounded-[24px] border border-dashed border-amber-100 bg-amber-50/50 p-8 text-center text-sm text-slate-500">
                                                      Đang tải công tác...
                                                </div>
                                          ) : todayQuery.error ? (
                                                <div className="rounded-[24px] border border-red-100 bg-red-50/80 p-8 text-center text-sm text-red-600">
                                                      {todayQuery.error.message || "Không tải được công tác."}
                                                </div>
                                          ) : assignments.length === 0 ? (
                                                <div className="rounded-[24px] border border-dashed border-amber-100 bg-amber-50/50 p-8 text-center">
                                                      <p className="text-base font-semibold text-[#17335f]">Hôm nay chưa có công tác</p>
                                                      <p className="mt-2 text-sm text-slate-500">Khi được phân công theo cá nhân, phòng, tổ hoặc ban, công tác sẽ hiện tại đây.</p>
                                                </div>
                                          ) : filteredAssignments.length === 0 ? (
                                                <div className="rounded-[24px] border border-dashed border-amber-100 bg-amber-50/50 p-8 text-center text-sm text-slate-500">
                                                      Không có công tác phù hợp với bộ lọc hiện tại.
                                                </div>
                                          ) : (
                                                filteredAssignments.map((assignment) => {
                                                      const isCompleted = assignment.status === "completed";
                                                      const scopeLabel = assignment.assignmentScopeLabel || "Cá nhân";

                                                      return (
                                                            <div
                                                                  key={assignment.id}
                                                                  className="group rounded-[24px] border border-amber-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,251,235,0.72))] p-4 shadow-[0_12px_30px_rgba(120,53,15,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(120,53,15,0.07)]"
                                                            >
                                                                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                                        <div className="min-w-0 flex-1">
                                                                              <div className="flex flex-wrap items-center gap-2">
                                                                                    <span
                                                                                          className={cx(
                                                                                                "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                                                                                getScopeTone(assignment.assignmentScope)
                                                                                          )}
                                                                                    >
                                                                                          {scopeLabel}
                                                                                    </span>
                                                                                    <Badge variant={getStatusBadgeVariant(assignment.status)}>
                                                                                          {getStatusLabel(assignment.status, assignment.statusLabel)}
                                                                                    </Badge>
                                                                                    <span className="text-xs font-medium text-slate-400">
                                                                                          {formatDateText(assignment.assignedDate)}
                                                                                    </span>
                                                                              </div>
                                                                              <h3 className="mt-2 truncate text-base font-semibold tracking-tight text-[#17335f]">
                                                                                    {assignment.dutyName || `Công tác #${assignment.id}`}
                                                                              </h3>
                                                                              <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                                                                                    <span className="rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-100">
                                                                                          {assignment.timeRange || "Chưa có giờ"}
                                                                                    </span>
                                                                                    {assignment.notes ? (
                                                                                          <span className="min-w-0 max-w-full truncate rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-100">
                                                                                                {assignment.notes}
                                                                                          </span>
                                                                                    ) : null}
                                                                              </div>
                                                                        </div>

                                                                        <Button
                                                                              disabled={!assignment.canComplete || completeMutation.isPending || isCompleted}
                                                                              onClick={() => handleMarkComplete(assignment.id)}
                                                                              className={cx(
                                                                                    "shrink-0 rounded-full px-4 text-sm font-semibold",
                                                                                    !assignment.canComplete || isCompleted
                                                                                          ? "bg-slate-100 text-slate-400"
                                                                                          : "bg-[#17335f] text-white hover:bg-[#244878]"
                                                                              )}
                                                                        >
                                                                              {isCompleted ? "Đã hoàn thành" : "Hoàn thành"}
                                                                        </Button>
                                                                  </div>
                                                            </div>
                                                      );
                                                })
                                          )}
                                    </div>
                              </Card>
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
