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
      assignedDate: Date | string;
      notes: string | null;
      status: string;
      startDateTime: Date | string | null;
      endDateTime: Date | string | null;
};

function getStatusLabel(status: string) {
      switch (status) {
            case "pending":
                  return "Chờ xử lý";
            case "confirmed":
                  return "Đã xác nhận";
            case "in_progress":
                  return "Đang thực hiện";
            case "completed":
                  return "Hoàn thành";
            case "skipped":
                  return "Bỏ qua";
            case "cancelled":
                  return "Đã hủy";
            default:
                  return status;
      }
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
      switch (status) {
            case "pending":
                  return "secondary";
            case "confirmed":
                  return "default";
            case "in_progress":
                  return "default";
            case "completed":
                  return "outline";
            case "skipped":
                  return "secondary";
            case "cancelled":
                  return "destructive";
            default:
                  return "secondary";
      }
}

export default function MyDuties() {
      const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
      const isResident = user?.role === "resident";

      const assignmentsQuery = trpc.duties.getMyAssignments.useQuery(undefined, {
            enabled: Boolean(user) && isResident,
            retry: 1,
      });

      const updateMutation = trpc.duties.updateMyAssignment.useMutation({
            onSuccess: () => {
                  assignmentsQuery.refetch();
                  toast.success("Cập nhật công tác thành công");
            },
            onError: () => {
                  toast.error("Cập nhật công tác thất bại");
            },
      });

      const assignments = (assignmentsQuery.data ?? []) as MyDutyAssignment[];

      const canShowResidentView = useMemo(() => {
            if (loading) return false;
            return Boolean(user) && isResident;
      }, [loading, user, isResident]);

      const handleMarkComplete = async (assignmentId: number) => {
            await updateMutation.mutateAsync({
                  id: assignmentId,
                  status: "completed",
                  completedAt: new Date(),
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
                                          Chỉ cư dân có quyền xem trang này. Nếu bạn là nhân viên, hãy sử dụng trang quản lý công tác.
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
                                    <h1 className={residenceMediumStyle.topTitle}>Công tác của tôi</h1>
                                    <p className={residenceMediumStyle.topSubtitle}>
                                          Xem nhanh công tác hôm nay và đánh dấu hoàn thành khi đã xử lý xong.
                                    </p>
                              </div>
                        </div>

                        <div className="grid gap-3">
                              {assignmentsQuery.isLoading ? (
                                    <Card className="rounded-[26px] border-amber-100/80 bg-white/90 p-8 text-center text-sm text-slate-500 shadow-[0_16px_36px_rgba(120,53,15,0.06)]">Đang tải công tác...</Card>
                              ) : assignments.length === 0 ? (
                                    <Card className="rounded-[26px] border border-dashed border-amber-100 bg-white/75 p-8 text-center text-sm text-slate-500 shadow-sm">Chưa có công tác được giao.</Card>
                              ) : (
                                    assignments.map((assignment) => (
                                          <Card
                                                key={assignment.id}
                                                className="space-y-4 rounded-[26px] border-amber-100/80 bg-white/90 p-5 shadow-[0_14px_34px_rgba(120,53,15,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(120,53,15,0.08)]"
                                          >
                                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                      <div>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Ngày giao: {new Date(assignment.assignedDate).toLocaleDateString()}</p>
                                                            <div className="mt-1 text-[18px] font-semibold tracking-tight text-[#17335f]">Công tác #{assignment.id}</div>
                                                            {assignment.notes ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Ghi chú: {assignment.notes}</p> : null}
                                                      </div>
                                                      <div className="flex flex-col items-start gap-2 sm:items-end">
                                                            <Badge variant={getStatusBadgeVariant(assignment.status)}>{getStatusLabel(assignment.status)}</Badge>
                                                            {assignment.startDateTime ? (
                                                                  <p className="text-xs font-medium text-slate-500">Bắt đầu: {new Date(assignment.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            ) : null}
                                                      </div>
                                                </div>
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                      <div className="grid gap-2 sm:grid-cols-2">
                                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                                                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Trạng thái</p>
                                                                  <p className="mt-1 text-sm font-semibold text-slate-800">{getStatusLabel(assignment.status)}</p>
                                                            </div>
                                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                                                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Thời gian</p>
                                                                  <p className="mt-1 text-sm font-semibold text-slate-800">
                                                                        {assignment.startDateTime ? new Date(assignment.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Chưa có"}
                                                                        {assignment.endDateTime ? ` - ${new Date(assignment.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ""}
                                                                  </p>
                                                            </div>
                                                      </div>

                                                      <Button
                                                            disabled={assignment.status === "completed" || assignment.status === "cancelled" || updateMutation.isPending}
                                                            onClick={() => handleMarkComplete(assignment.id)}
                                                            className={cx(
                                                                  "rounded-xl px-4 text-sm font-semibold",
                                                                  assignment.status === "completed" || assignment.status === "cancelled"
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
