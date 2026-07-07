import { useMemo } from "react";
import { Bell, CheckCircle2, CircleDot, LoaderCircle } from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

function formatDateTimeText(value?: string | Date | null) {
      if (!value) return "";
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);

      return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
      });
}

function getTypeLabel(type?: string | null) {
      switch (type) {
            case "task_assigned":
                  return "Công tác";
            case "fee_generated":
                  return "Tài chính";
            case "debt_overdue":
                  return "Quá hạn";
            case "attendance_alert":
                  return "Điểm danh";
            default:
                  return "Hệ thống";
      }
}

function getTypeTone(type?: string | null) {
      switch (type) {
            case "task_assigned":
                  return "bg-amber-50 text-amber-700 ring-amber-100";
            case "fee_generated":
                  return "bg-emerald-50 text-emerald-700 ring-emerald-100";
            case "debt_overdue":
                  return "bg-red-50 text-red-700 ring-red-100";
            default:
                  return "bg-slate-50 text-slate-600 ring-slate-200";
      }
}

export default function ResidentNotifications() {
      const utils = trpc.useUtils();
      const notificationsQuery = trpc.residentPortal.getMyNotifications.useQuery({ limit: 50 });
      const markReadMutation = trpc.residentPortal.markMyNotificationRead.useMutation({
            onSuccess: async () => {
                  await Promise.all([
                        utils.residentPortal.getMyNotifications.invalidate(),
                        utils.residentPortal.getMyUnreadNotificationCount.invalidate(),
                  ]);
            },
      });

      const items = useMemo(() => notificationsQuery.data || [], [notificationsQuery.data]);
      const unreadCount = items.filter((item: any) => !item.isRead).length;

      return (
            <ResidenceCareLayout>
                  <div className="min-h-screen bg-[linear-gradient(135deg,#fffdf7_0%,#ffffff_48%,#fff7ed_100%)] px-4 py-6 md:px-8">
                        <div className="mx-auto max-w-5xl space-y-6">
                              <section className="rounded-[30px] border border-amber-100/80 bg-white/90 p-6 shadow-[0_18px_48px_rgba(120,53,15,0.08)] backdrop-blur">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                          <div className="min-w-0">
                                                <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                                                      <Bell className="h-4 w-4" />
                                                      Thông báo
                                                </div>
                                                <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#17335f] md:text-3xl">
                                                      Thông báo của tôi
                                                </h1>
                                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                                      Theo dõi công tác, tài chính và các nhắc nhở nội bộ dành riêng cho bạn.
                                                </p>
                                          </div>
                                          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm font-semibold text-amber-800">
                                                {unreadCount} thông báo chưa đọc
                                          </div>
                                    </div>
                              </section>

                              {notificationsQuery.isLoading ? (
                                    <Card className="rounded-[26px] border-amber-100/80 bg-white/90 p-8 text-center text-sm text-slate-500 shadow-sm">
                                          <div className="inline-flex items-center gap-2 font-semibold">
                                                <LoaderCircle className="h-4 w-4 animate-spin text-amber-600" />
                                                Đang tải thông báo...
                                          </div>
                                    </Card>
                              ) : notificationsQuery.error ? (
                                    <Card className="rounded-[26px] border-red-100 bg-red-50/80 p-8 text-center text-sm text-red-600 shadow-sm">
                                          {notificationsQuery.error.message || "Không tải được thông báo."}
                                    </Card>
                              ) : items.length === 0 ? (
                                    <Card className="rounded-[26px] border border-dashed border-amber-100 bg-white/75 p-10 text-center shadow-sm">
                                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                                                <Bell className="h-5 w-5" />
                                          </div>
                                          <h2 className="mt-4 text-lg font-bold text-slate-900">Chưa có thông báo</h2>
                                          <p className="mt-2 text-sm leading-6 text-slate-500">
                                                Khi có công tác mới, khoản thu hoặc nhắc nhở nội bộ, thông báo sẽ hiển thị tại đây.
                                          </p>
                                    </Card>
                              ) : (
                                    <div className="space-y-3">
                                          {items.map((item: any) => (
                                                <Card
                                                      key={item.id}
                                                      className={`rounded-[24px] border p-5 shadow-[0_12px_32px_rgba(120,53,15,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(120,53,15,0.08)] ${
                                                            item.isRead
                                                                  ? "border-slate-100 bg-white/80"
                                                                  : "border-amber-200 bg-amber-50/60"
                                                      }`}
                                                >
                                                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                            <div className="min-w-0 flex-1">
                                                                  <div className="flex flex-wrap items-center gap-2">
                                                                        <span
                                                                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getTypeTone(
                                                                                    item.type
                                                                              )}`}
                                                                        >
                                                                              {getTypeLabel(item.type)}
                                                                        </span>
                                                                        {!item.isRead ? (
                                                                              <Badge className="bg-[#17335f] text-white hover:bg-[#17335f]">
                                                                                    Chưa đọc
                                                                              </Badge>
                                                                        ) : (
                                                                              <Badge variant="secondary">Đã đọc</Badge>
                                                                        )}
                                                                  </div>
                                                                  <h2 className="mt-3 text-lg font-bold tracking-tight text-[#17335f]">
                                                                        {item.title || "Thông báo"}
                                                                  </h2>
                                                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                        {item.content || "Không có nội dung."}
                                                                  </p>
                                                                  <p className="mt-3 text-xs font-medium text-slate-400">
                                                                        {formatDateTimeText(item.createdAt || item.sentAt)}
                                                                  </p>
                                                            </div>

                                                            <Button
                                                                  type="button"
                                                                  variant={item.isRead ? "outline" : "default"}
                                                                  disabled={item.isRead || markReadMutation.isPending}
                                                                  onClick={() =>
                                                                        markReadMutation.mutate({ notificationId: Number(item.id) })
                                                                  }
                                                                  className={`shrink-0 rounded-xl text-sm font-semibold ${
                                                                        item.isRead
                                                                              ? "border-slate-200 text-slate-400"
                                                                              : "bg-[#17335f] text-white hover:bg-[#244878]"
                                                                  }`}
                                                            >
                                                                  {item.isRead ? (
                                                                        <>
                                                                              <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                              Đã đọc
                                                                        </>
                                                                  ) : (
                                                                        <>
                                                                              <CircleDot className="mr-2 h-4 w-4" />
                                                                              Đánh dấu đã đọc
                                                                        </>
                                                                  )}
                                                            </Button>
                                                      </div>
                                                </Card>
                                          ))}
                                    </div>
                              )}
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
