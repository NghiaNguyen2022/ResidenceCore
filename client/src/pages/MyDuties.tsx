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

type DutyFilter = "all" | "pending" | "completed" | "other";

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
            case "skipped":
            case "absent":
                  return "secondary";
            case "cancelled":
                  return "destructive";
            default:
                  return "secondary";
      }
}

function getStatusTone(status: string) {
      switch (status) {
            case "completed":
                  return {
                        chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
                        bar: "from-emerald-200/90 via-emerald-100/50 to-transparent",
                        icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
                  };
            case "pending":
            case "confirmed":
            case "in_progress":
                  return {
                        chip: "border-amber-200 bg-amber-50 text-amber-700",
                        bar: "from-amber-200/90 via-amber-100/60 to-transparent",
                        icon: "bg-amber-50 text-amber-700 ring-amber-100",
                  };
            case "cancelled":
                  return {
                        chip: "border-rose-200 bg-rose-50 text-rose-700",
                        bar: "from-rose-200/80 via-rose-100/50 to-transparent",
                        icon: "bg-rose-50 text-rose-700 ring-rose-100",
                  };
            default:
                  return {
                        chip: "border-slate-200 bg-slate-50 text-slate-600",
                        bar: "from-slate-200/80 via-slate-100/50 to-transparent",
                        icon: "bg-slate-50 text-slate-600 ring-slate-100",
                  };
      }
}

function formatDateText(value?: string | Date | null) {
      if (!value) return "Hôm nay";

      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return String(value).slice(0, 10) || "Hôm nay";

      return date.toLocaleDateString("vi-VN");
}

function getFilterKey(status: string): DutyFilter {
      if (status === "completed") return "completed";
      if (["pending", "confirmed", "in_progress"].includes(status)) return "pending";
      return "other";
}

export default function MyDuties() {
      const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
      const isResident = user?.role === "resident";
      const [activeFilter, setActiveFilter] = useState<DutyFilter>("all");

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
      const dutyStats = summary?.dutyStats ?? {};

      const canShowResidentView = useMemo(() => {
            if (loading) return false;
            return Boolean(user) && isResident;
      }, [loading, user, isResident]);

      const filteredAssignments = useMemo(() => {
            if (activeFilter === "all") return assignments;
            return assignments.filter((assignment) => getFilterKey(assignment.status) === activeFilter);
      }, [assignments, activeFilter]);

      const pendingCount = dutyStats.pending ?? assignments.filter((assignment) => getFilterKey(assignment.status) === "pending").length;
      const completedCount = dutyStats.completed ?? assignments.filter((assignment) => assignment.status === "completed").length;
      const otherCount = assignments.filter((assignment) => getFilterKey(assignment.status) === "other").length;

      const filterItems: Array<{ key: DutyFilter; label: string; count: number }> = [
            { key: "all", label: "Tất cả", count: assignments.length },
            { key: "pending", label: "Chưa làm", count: pendingCount },
            { key: "completed", label: "Hoàn thành", count: completedCount },
            { key: "other", label: "Khác", count: otherCount },
      ];

      const handleMarkComplete = async (assignmentId: number) => {
            await completeMutation.mutateAsync({
                  assignmentId,
            });
      };

      if (!canShowResidentView) {
            return (
                  <ResidenceCareLayout>
                        <div className={residenceMediumStyle.page}>
                              <div className={residenceMediumStyle.pageShell}>
                                    <Card className="rounded-[30px] border border-amber-100/80 bg-white/90 p-8 text-center shadow-[0_18px_42px_rgba(120,53,15,0.08)]">
                                          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-700">Công tác</p>
                                          <div className="mt-2 text-[28px] font-black tracking-tight text-slate-950">Trang công tác học viên</div>
                                          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
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
                  <div className={cx(residenceMediumStyle.page, "relative overflow-hidden")}>
                        <div className={residenceMediumStyle.pageAura} />
                        <div className={cx(residenceMediumStyle.pageShell, "relative z-10 space-y-5")}>
                              <section className="relative overflow-hidden rounded-[34px] border border-amber-100/80 bg-[radial-gradient(circle_at_20%_12%,rgba(251,191,36,0.24),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,251,235,0.9),rgba(255,255,255,0.92))] px-5 py-8 text-center shadow-[0_22px_60px_rgba(120,53,15,0.10)] sm:px-8">
                                    <div className="absolute right-6 top-6 hidden rounded-full border border-amber-100 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm md:block">
                                          {today?.dayLabel || "Hôm nay"} · {today?.date ? formatDateText(today.date) : formatDateText(new Date())}
                                    </div>
                                    <div className="mx-auto inline-flex items-center rounded-full border border-amber-200/80 bg-white/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700 shadow-sm">
                                          Công tác của tôi
                                    </div>
                                    <h1 className="mx-auto mt-4 max-w-3xl text-[34px] font-black leading-tight tracking-tight text-slate-950 sm:text-[42px]">
                                          Việc được giao hôm nay
                                    </h1>
                                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                                          Theo dõi công tác cá nhân, phòng, tổ hoặc ban được giao trong ngày và đánh dấu hoàn thành khi đã xử lý xong.
                                    </p>
                                    {pendingCount > 0 ? (
                                          <div className="mx-auto mt-4 inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
                                                Bạn còn {pendingCount} công tác chưa hoàn thành
                                          </div>
                                    ) : assignments.length > 0 ? (
                                          <div className="mx-auto mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                                                Các công tác hôm nay đã được xử lý
                                          </div>
                                    ) : null}
                              </section>

                              <section className="grid gap-3 md:grid-cols-3">
                                    <Card className="group overflow-hidden rounded-[26px] border border-amber-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,248,225,0.86))] p-5 shadow-[0_16px_38px_rgba(120,53,15,0.08)]">
                                          <div className="flex items-center justify-between gap-3">
                                                <div>
                                                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Tổng công tác</p>
                                                      <p className="mt-2 text-[30px] font-black tracking-tight text-slate-950">{dutyStats.total ?? assignments.length}</p>
                                                      <p className="mt-1 text-xs font-medium text-slate-500">Gồm cá nhân/phòng/tổ/ban</p>
                                                </div>
                                                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-100 bg-white text-lg shadow-sm">📋</div>
                                          </div>
                                    </Card>
                                    <Card className="overflow-hidden rounded-[26px] border border-orange-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,237,213,0.78))] p-5 shadow-[0_16px_38px_rgba(120,53,15,0.08)]">
                                          <div className="flex items-center justify-between gap-3">
                                                <div>
                                                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Chưa làm</p>
                                                      <p className="mt-2 text-[30px] font-black tracking-tight text-orange-700">{pendingCount}</p>
                                                      <p className="mt-1 text-xs font-medium text-slate-500">Ưu tiên xử lý trước</p>
                                                </div>
                                                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-orange-100 bg-white text-lg shadow-sm">⏳</div>
                                          </div>
                                    </Card>
                                    <Card className="overflow-hidden rounded-[26px] border border-emerald-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(209,250,229,0.72))] p-5 shadow-[0_16px_38px_rgba(120,53,15,0.08)]">
                                          <div className="flex items-center justify-between gap-3">
                                                <div>
                                                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Hoàn thành</p>
                                                      <p className="mt-2 text-[30px] font-black tracking-tight text-emerald-700">{completedCount}</p>
                                                      <p className="mt-1 text-xs font-medium text-slate-500">Đã ghi nhận trong ngày</p>
                                                </div>
                                                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-100 bg-white text-lg shadow-sm">✓</div>
                                          </div>
                                    </Card>
                              </section>

                              <section className="rounded-[28px] border border-amber-100/80 bg-white/85 p-3 shadow-[0_16px_40px_rgba(120,53,15,0.07)] backdrop-blur">
                                    <div className="grid gap-2 sm:grid-cols-4">
                                          {filterItems.map((item) => (
                                                <button
                                                      key={item.key}
                                                      type="button"
                                                      onClick={() => setActiveFilter(item.key)}
                                                      className={cx(
                                                            "rounded-[22px] px-4 py-3 text-sm font-bold transition",
                                                            activeFilter === item.key
                                                                  ? "bg-white text-amber-800 shadow-[0_10px_24px_rgba(120,53,15,0.12)] ring-1 ring-amber-200"
                                                                  : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                                                      )}
                                                >
                                                      <span>{item.label}</span>
                                                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{item.count}</span>
                                                </button>
                                          ))}
                                    </div>
                              </section>

                              <section className="rounded-[32px] border border-amber-100/80 bg-white/90 p-5 shadow-[0_20px_54px_rgba(120,53,15,0.08)] sm:p-6">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                          <div>
                                                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-500">Danh sách</p>
                                                <h2 className="mt-1 text-[28px] font-black tracking-tight text-slate-950">Công tác hôm nay</h2>
                                                <p className="mt-1 text-sm text-slate-500">
                                                      {filteredAssignments.length} công tác theo bộ lọc hiện tại.
                                                </p>
                                          </div>
                                    </div>

                                    <div className="mt-5 grid gap-3">
                                          {todayQuery.isLoading ? (
                                                <div className="rounded-[26px] border border-dashed border-amber-100 bg-amber-50/40 p-10 text-center text-sm font-medium text-slate-500">
                                                      Đang tải công tác...
                                                </div>
                                          ) : todayQuery.error ? (
                                                <div className="rounded-[26px] border border-red-100 bg-red-50/80 p-10 text-center text-sm font-semibold text-red-600">
                                                      {todayQuery.error.message || "Không tải được công tác."}
                                                </div>
                                          ) : filteredAssignments.length === 0 ? (
                                                <div className="rounded-[26px] border border-dashed border-amber-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,251,235,0.75))] p-10 text-center">
                                                      <div className="text-base font-bold text-slate-900">Không có công tác phù hợp</div>
                                                      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                                            Hôm nay chưa có công tác trong bộ lọc này, hoặc các công tác đã được xử lý.
                                                      </p>
                                                </div>
                                          ) : (
                                                filteredAssignments.map((assignment) => {
                                                      const tone = getStatusTone(assignment.status);
                                                      return (
                                                            <Card
                                                                  key={assignment.id}
                                                                  className="group relative overflow-hidden rounded-[26px] border border-amber-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,251,235,0.82))] p-4 shadow-[0_14px_34px_rgba(120,53,15,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(120,53,15,0.10)] sm:p-5"
                                                            >
                                                                  <div className={cx("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", tone.bar)} />
                                                                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                                        <div className="flex min-w-0 gap-3">
                                                                              <div className={cx("mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-1", tone.icon)}>
                                                                                    {assignment.status === "completed" ? "✓" : "•"}
                                                                              </div>
                                                                              <div className="min-w-0">
                                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                                          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700">
                                                                                                {assignment.assignmentScopeLabel || "Cá nhân"}
                                                                                          </span>
                                                                                          <span className={cx("rounded-full border px-3 py-1 text-[11px] font-bold", tone.chip)}>
                                                                                                {getStatusLabel(assignment.status, assignment.statusLabel)}
                                                                                          </span>
                                                                                    </div>
                                                                                    <h3 className="mt-2 truncate text-[18px] font-black tracking-tight text-slate-950 sm:text-[20px]">
                                                                                          {assignment.dutyName || `Công tác #${assignment.id}`}
                                                                                    </h3>
                                                                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                                                                                          <span>{formatDateText(assignment.assignedDate)}</span>
                                                                                          <span>{assignment.timeRange || "Chưa có khung giờ"}</span>
                                                                                    </div>
                                                                                    {assignment.notes ? (
                                                                                          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600">
                                                                                                {assignment.notes}
                                                                                          </p>
                                                                                    ) : null}
                                                                              </div>
                                                                        </div>

                                                                        <div className="flex shrink-0 items-center gap-2 lg:justify-end">
                                                                              <Badge variant={getStatusBadgeVariant(assignment.status)}>
                                                                                    {getStatusLabel(assignment.status, assignment.statusLabel)}
                                                                              </Badge>
                                                                              <Button
                                                                                    disabled={!assignment.canComplete || completeMutation.isPending}
                                                                                    onClick={() => handleMarkComplete(assignment.id)}
                                                                                    className={cx(
                                                                                          "rounded-2xl px-4 text-sm font-bold shadow-sm",
                                                                                          !assignment.canComplete
                                                                                                ? "bg-slate-100 text-slate-400"
                                                                                                : "bg-slate-950 text-white hover:bg-slate-800"
                                                                                    )}
                                                                              >
                                                                                    Hoàn thành
                                                                              </Button>
                                                                        </div>
                                                                  </div>
                                                            </Card>
                                                      );
                                                })
                                          )}
                                    </div>
                              </section>
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
