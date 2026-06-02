import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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

function getStatusBadgeVariant(status: string) {
      switch (status) {
            case "pending":
                  return "secondary";
            case "confirmed":
                  return "accent";
            case "in_progress":
                  return "info";
            case "completed":
                  return "success";
            case "skipped":
                  return "warning";
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

      const assignments = assignmentsQuery.data ?? [];

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
                        <div className="p-6 md:p-8">
                              <Card className="p-6 space-y-4">
                                    <h1 className="text-3xl font-semibold">Trang công tác</h1>
                                    <p className="text-sm text-slate-500">
                                          Chỉ cư dân có quyền xem trang này. Nếu bạn là nhân viên, hãy sử dụng trang quản lý công tác.
                                    </p>
                              </Card>
                        </div>
                  </ResidenceCareLayout>
            );
      }

      return (
            <ResidenceCareLayout>
                  <div className="p-6 md:p-8 space-y-6">
                        <div className="space-y-2">
                              <h1 className="text-4xl font-bold">Công tác của tôi</h1>
                              <p className="text-sm text-slate-500">Xem nhanh công tác hôm nay và đánh dấu hoàn thành.</p>
                        </div>

                        <div className="grid gap-4">
                              {assignmentsQuery.isLoading ? (
                                    <Card className="p-6 text-center text-slate-500">Đang tải công tác...</Card>
                              ) : assignments.length === 0 ? (
                                    <Card className="p-6 text-center text-slate-500">Chưa có công tác được giao.</Card>
                              ) : (
                                    assignments.map((assignment) => (
                                          <Card key={assignment.id} className="p-6 space-y-4">
                                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                      <div>
                                                            <p className="text-sm text-slate-500">Ngày giao: {new Date(assignment.assignedDate).toLocaleDateString()}</p>
                                                            <h2 className="text-xl font-semibold">Công tác #{assignment.id}</h2>
                                                            {assignment.notes ? <p className="mt-2 text-sm text-slate-600">Ghi chú: {assignment.notes}</p> : null}
                                                      </div>
                                                      <div className="flex flex-col items-start gap-2 sm:items-end">
                                                            <Badge variant={getStatusBadgeVariant(assignment.status)}>{getStatusLabel(assignment.status)}</Badge>
                                                            {assignment.startDateTime ? (
                                                                  <p className="text-sm text-slate-500">Bắt đầu: {new Date(assignment.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            ) : null}
                                                      </div>
                                                </div>
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                      <div className="grid gap-2 sm:grid-cols-2">
                                                            <div>
                                                                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trạng thái</p>
                                                                  <p className="text-sm font-medium">{getStatusLabel(assignment.status)}</p>
                                                            </div>
                                                            <div>
                                                                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Thời gian</p>
                                                                  <p className="text-sm font-medium">
                                                                        {assignment.startDateTime ? new Date(assignment.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Chưa có"}
                                                                        {assignment.endDateTime ? ` - ${new Date(assignment.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ""}
                                                                  </p>
                                                            </div>
                                                      </div>

                                                      <Button
                                                            disabled={assignment.status === "completed" || assignment.status === "cancelled" || updateMutation.isLoading}
                                                            onClick={() => handleMarkComplete(assignment.id)}
                                                      >
                                                            Đánh dấu hoàn thành
                                                      </Button>
                                                </div>
                                          </Card>
                                    ))
                              )}
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
