import { useMemo } from "react";
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
      canComplete?: boolean;
};

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

function formatDateText(value?: string | Date | null) {
      if (!value) return "Hôm nay";

      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return String(value).slice(0, 10) || "Hôm nay";

      return date.toLocaleDateString("vi-VN");
}

export default function MyDuties() {
      const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
      const isResident = user?.role === "resident";

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

      const canShowResidentView = useMemo(() => {
            if (loading) return false;
            return Boolean(user) && isResident;
      }, [loading, user, isResident]);

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
                                    <Card className="space-y-3 rounded-[26px] border-amber-100/80 bg-white/90 p-6 shadow-[0_16px_36px_rgba(120,53,15,0.06)]">
                                          <div className="text-[22px] font-semibold tracking-tight text-[#17335f]">Trang công tác</div>
                                          <p className="max-w-2xl text-sm leading-6 text-slate-500">
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
                        <div className={residenceMediumStyle.pageShell}>
                              <div className={residenceMediumStyle.topArea}>
                                    <div className={residenceMediumStyle.topInner}>
                                          <p className={residenceMediumStyle.modalEyebrow}>Công tác cá nhân</p>
                                          <h1 className={residenceMediumStyle.topTitle}>Công tác hôm nay</h1>
                                          <p className={residenceMediumStyle.topSubtitle}>
                                                Xem công tác được giao trực tiếp trong ngày và đánh dấu hoàn thành khi đã xử lý xong.
                                          </p>
                                    </div>
                              </div>

                              <div className="grid gap-3 md:grid-cols-3">
                                    <Card className="rounded-[24px] border-amber-100/80 bg-white/90 p-4 shadow-[0_14px_32px_rgba(120,53,15,0.05)]">
                                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Ngày</p>
                                          <p className="mt-1 text-base font-semibold text-[#17335f]">
                                                {today?.dayLabel || "Hôm nay"} · {today?.date ? formatDateText(today.date) : ""}
                                          </p>
                                    </Card>
                                    <Card className="rounded-[24px] border-amber-100/80 bg-white/90 p-4 shadow-[0_14px_32px_rgba(120,53,15,0.05)]">
                                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Công tác</p>
                                          <p className="mt-1 text-base font-semibold text-[#17335f]">{summary?.dutyStats?.total ?? assignments.length} việc</p>
                                    </Card>
                                    <Card className="rounded-[24px] border-amber-100/80 bg-white/90 p-4 shadow-[0_14px_32px_rgba(120,53,15,0.05)]">
                                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Đã hoàn thành</p>
                                          <p className="mt-1 text-base font-semibold text-[#17335f]">{summary?.dutyStats?.completed ?? 0} việc</p>
                                    </Card>
                              </div>

                              <div className="mt-4 grid gap-3">
                                    {todayQuery.isLoading ? (
                                          <Card className="rounded-[26px] border-amber-100/80 bg-white/90 p-8 text-center text-sm text-slate-500 shadow-[0_16px_36px_rgba(120,53,15,0.06)]">Đang tải công tác...</Card>
                                    ) : todayQuery.error ? (
                                          <Card className="rounded-[26px] border-red-100 bg-red-50/80 p-8 text-center text-sm text-red-600 shadow-sm">
                                                {todayQuery.error.message || "Không tải được công tác."}
                                          </Card>
                                    ) : assignments.length === 0 ? (
                                          <Card className="rounded-[26px] border border-dashed border-amber-100 bg-white/75 p-8 text-center text-sm text-slate-500 shadow-sm">Hôm nay chưa có công tác được giao trực tiếp.</Card>
                                    ) : (
                                          assignments.map((assignment) => (
                                                <Card
                                                      key={assignment.id}
                                                      className="space-y-4 rounded-[26px] border-amber-100/80 bg-white/90 p-5 shadow-[0_14px_34px_rgba(120,53,15,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(120,53,15,0.08)]"
                                                >
                                                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                            <div className="min-w-0">
                                                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                                        {formatDateText(assignment.assignedDate)}
                                                                  </p>
                                                                  <div className="mt-1 truncate text-[18px] font-semibold tracking-tight text-[#17335f]">
                                                                        {assignment.dutyName || `Công tác #${assignment.id}`}
                                                                  </div>
                                                                  {assignment.notes ? (
                                                                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Ghi chú: {assignment.notes}</p>
                                                                  ) : null}
                                                            </div>
                                                            <div className="flex flex-col items-start gap-2 sm:items-end">
                                                                  <Badge variant={getStatusBadgeVariant(assignment.status)}>
                                                                        {getStatusLabel(assignment.status, assignment.statusLabel)}
                                                                  </Badge>
                                                                  {assignment.timeRange ? (
                                                                        <p className="text-xs font-medium text-slate-500">{assignment.timeRange}</p>
                                                                  ) : null}
                                                            </div>
                                                      </div>

                                                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                            <div className="grid gap-2 sm:grid-cols-2">
                                                                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Trạng thái</p>
                                                                        <p className="mt-1 text-sm font-semibold text-slate-800">
                                                                              {getStatusLabel(assignment.status, assignment.statusLabel)}
                                                                        </p>
                                                                  </div>
                                                                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Thời gian</p>
                                                                        <p className="mt-1 text-sm font-semibold text-slate-800">
                                                                              {assignment.timeRange || "Chưa có"}
                                                                        </p>
                                                                  </div>
                                                            </div>

                                                            <Button
                                                                  disabled={!assignment.canComplete || completeMutation.isPending}
                                                                  onClick={() => handleMarkComplete(assignment.id)}
                                                                  className={cx(
                                                                        "rounded-xl px-4 text-sm font-semibold",
                                                                        !assignment.canComplete
                                                                              ? "bg-slate-100 text-slate-400"
                                                                              : "bg-[#17335f] text-white hover:bg-[#244878]"
                                                                  )}
                                                            >
                                                                  Đánh dấu hoàn thành
                                                            </Button>
                                                      </div>
                                                </Card>
                                          ))
                                    )}
                              </div>
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
