import { useMemo, useState } from "react";
import {
      AlertTriangle,
      Bell,
      CheckCircle2,
      CircleDot,
      ClipboardList,
      Inbox,
      LoaderCircle,
      Megaphone,
      WalletCards,
} from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

type NotificationFilter = "all" | "unread" | "task" | "finance" | "system";

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
                  return "border-amber-100 bg-amber-50 text-amber-700";
            case "fee_generated":
                  return "border-emerald-100 bg-emerald-50 text-emerald-700";
            case "debt_overdue":
                  return "border-red-100 bg-red-50 text-red-700";
            case "attendance_alert":
                  return "border-blue-100 bg-blue-50 text-blue-700";
            default:
                  return "border-slate-200 bg-slate-50 text-slate-600";
      }
}

function getTypeIcon(type?: string | null) {
      switch (type) {
            case "task_assigned":
                  return ClipboardList;
            case "fee_generated":
                  return WalletCards;
            case "debt_overdue":
                  return AlertTriangle;
            default:
                  return Megaphone;
      }
}

function getFilterType(filter: NotificationFilter) {
      switch (filter) {
            case "task":
                  return "task_assigned";
            case "finance":
                  return "fee_generated";
            case "system":
                  return "system";
            default:
                  return null;
      }
}

export default function ResidentNotifications() {
      const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
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
      const taskCount = items.filter((item: any) => item.type === "task_assigned").length;
      const financeCount = items.filter((item: any) => item.type === "fee_generated").length;
      const systemCount = items.filter((item: any) => {
            const knownType = item.type === "task_assigned" || item.type === "fee_generated";
            return !knownType;
      }).length;

      const filteredItems = useMemo(() => {
            if (activeFilter === "all") return items;
            if (activeFilter === "unread") return items.filter((item: any) => !item.isRead);

            const targetType = getFilterType(activeFilter);
            if (targetType === "system") {
                  return items.filter((item: any) => item.type !== "task_assigned" && item.type !== "fee_generated");
            }

            return items.filter((item: any) => item.type === targetType);
      }, [activeFilter, items]);

      const filterItems: Array<{ key: NotificationFilter; label: string; count: number }> = [
            { key: "all", label: "Tất cả", count: items.length },
            { key: "unread", label: "Chưa đọc", count: unreadCount },
            { key: "task", label: "Công tác", count: taskCount },
            { key: "finance", label: "Tài chính", count: financeCount },
            { key: "system", label: "Hệ thống", count: systemCount },
      ];

      return (
            <ResidenceCareLayout>
                  <div className="min-h-screen bg-[linear-gradient(135deg,#fffdf7_0%,#ffffff_48%,#fff7ed_100%)] px-4 py-5 md:px-8">
                        <div className="mx-auto max-w-6xl space-y-4">
                              <section className="rounded-[28px] border border-amber-100/80 bg-white/90 p-5 shadow-[0_16px_42px_rgba(120,53,15,0.075)] backdrop-blur md:p-6">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                          <div className="min-w-0">
                                                <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                                                      <Bell className="h-3.5 w-3.5" />
                                                      Trung tâm thông báo
                                                </div>
                                                <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#0f1f3d] md:text-[32px]">
                                                      Thông báo của tôi
                                                </h1>
                                                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                                                      Theo dõi công tác, tài chính và các nhắc nhở nội bộ dành riêng cho bạn.
                                                </p>
                                          </div>

                                          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                                                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm font-semibold text-amber-800">
                                                      <span className="block text-xl font-bold leading-none text-amber-900">{unreadCount}</span>
                                                      <span className="mt-1 block text-xs text-amber-700">chưa đọc</span>
                                                </div>
                                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                                                      <span className="block text-xl font-bold leading-none text-[#0f1f3d]">{items.length}</span>
                                                      <span className="mt-1 block text-xs text-slate-500">tổng thông báo</span>
                                                </div>
                                          </div>
                                    </div>
                              </section>

                              <section className="rounded-[22px] border border-amber-100/80 bg-white/86 p-2 shadow-[0_10px_30px_rgba(120,53,15,0.055)] backdrop-blur">
                                    <div className="flex flex-wrap gap-2">
                                          {filterItems.map((filter) => {
                                                const isActive = activeFilter === filter.key;
                                                return (
                                                      <button
                                                            key={filter.key}
                                                            type="button"
                                                            onClick={() => setActiveFilter(filter.key)}
                                                            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-semibold transition ${
                                                                  isActive
                                                                        ? "bg-[#0f1f3d] text-white shadow-[0_10px_22px_rgba(15,31,61,0.16)]"
                                                                        : "border border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/70 hover:text-amber-800"
                                                            }`}
                                                      >
                                                            <span>{filter.label}</span>
                                                            <span
                                                                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                                                        isActive ? "bg-white/18 text-white" : "bg-slate-100 text-slate-500"
                                                                  }`}
                                                            >
                                                                  {filter.count}
                                                            </span>
                                                      </button>
                                                );
                                          })}
                                    </div>
                              </section>

                              {notificationsQuery.isLoading ? (
                                    <Card className="rounded-[24px] border-amber-100/80 bg-white/90 p-8 text-center text-sm text-slate-500 shadow-sm">
                                          <div className="inline-flex items-center gap-2 font-semibold">
                                                <LoaderCircle className="h-4 w-4 animate-spin text-amber-600" />
                                                Đang tải thông báo...
                                          </div>
                                    </Card>
                              ) : notificationsQuery.error ? (
                                    <Card className="rounded-[24px] border-red-100 bg-red-50/80 p-8 text-center text-sm text-red-600 shadow-sm">
                                          {notificationsQuery.error.message || "Không tải được thông báo."}
                                    </Card>
                              ) : filteredItems.length === 0 ? (
                                    <Card className="rounded-[24px] border border-dashed border-amber-100 bg-white/75 p-10 text-center shadow-sm">
                                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                                                <Inbox className="h-5 w-5" />
                                          </div>
                                          <h2 className="mt-4 text-lg font-bold text-slate-900">
                                                {items.length === 0 ? "Chưa có thông báo" : "Không có thông báo phù hợp"}
                                          </h2>
                                          <p className="mt-2 text-sm leading-6 text-slate-500">
                                                {items.length === 0
                                                      ? "Khi có công tác mới, khoản thu hoặc nhắc nhở nội bộ, thông báo sẽ hiển thị tại đây."
                                                      : "Thử đổi bộ lọc để xem các thông báo khác."}
                                          </p>
                                    </Card>
                              ) : (
                                    <div className="overflow-hidden rounded-[24px] border border-amber-100/80 bg-white/90 shadow-[0_16px_40px_rgba(120,53,15,0.065)]">
                                          <div className="border-b border-amber-100/70 bg-amber-50/35 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:px-5">
                                                Danh sách thông báo
                                          </div>
                                          <div className="divide-y divide-slate-100">
                                                {filteredItems.map((item: any) => {
                                                      const TypeIcon = getTypeIcon(item.type);
                                                      return (
                                                            <article
                                                                  key={item.id}
                                                                  className={`group flex gap-3 px-4 py-4 transition hover:bg-amber-50/40 md:px-5 ${
                                                                        item.isRead ? "bg-white" : "bg-amber-50/45"
                                                                  }`}
                                                            >
                                                                  <div
                                                                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${getTypeTone(
                                                                              item.type
                                                                        )}`}
                                                                  >
                                                                        <TypeIcon className="h-4 w-4" />
                                                                  </div>

                                                                  <div className="min-w-0 flex-1">
                                                                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                                                              <div className="min-w-0">
                                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                                          <span
                                                                                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${getTypeTone(
                                                                                                      item.type
                                                                                                )}`}
                                                                                          >
                                                                                                {getTypeLabel(item.type)}
                                                                                          </span>
                                                                                          {!item.isRead ? (
                                                                                                <Badge className="bg-[#0f1f3d] px-2 py-0.5 text-[11px] text-white hover:bg-[#0f1f3d]">
                                                                                                      Chưa đọc
                                                                                                </Badge>
                                                                                          ) : (
                                                                                                <Badge
                                                                                                      variant="secondary"
                                                                                                      className="px-2 py-0.5 text-[11px] text-slate-500"
                                                                                                >
                                                                                                      Đã đọc
                                                                                                </Badge>
                                                                                          )}
                                                                                    </div>

                                                                                    <h2 className="mt-2 text-base font-bold tracking-tight text-[#0f1f3d] md:text-lg">
                                                                                          {item.title || "Thông báo"}
                                                                                    </h2>
                                                                                    <p className="mt-1.5 text-sm leading-6 text-slate-600">
                                                                                          {item.content || "Không có nội dung."}
                                                                                    </p>
                                                                                    <p className="mt-2 text-xs font-medium text-slate-400">
                                                                                          {formatDateTimeText(item.createdAt || item.sentAt)}
                                                                                    </p>
                                                                              </div>

                                                                              <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    disabled={item.isRead || markReadMutation.isPending}
                                                                                    onClick={() =>
                                                                                          markReadMutation.mutate({
                                                                                                notificationId: Number(item.id),
                                                                                          })
                                                                                    }
                                                                                    className={`h-9 shrink-0 rounded-xl px-3 text-xs font-semibold ${
                                                                                          item.isRead
                                                                                                ? "text-slate-300 hover:bg-transparent hover:text-slate-300"
                                                                                                : "text-[#0f1f3d] hover:bg-[#0f1f3d] hover:text-white"
                                                                                    }`}
                                                                              >
                                                                                    {item.isRead ? (
                                                                                          <>
                                                                                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                                                                                Đã đọc
                                                                                          </>
                                                                                    ) : (
                                                                                          <>
                                                                                                <CircleDot className="mr-1.5 h-4 w-4" />
                                                                                                Đánh dấu
                                                                                          </>
                                                                                    )}
                                                                              </Button>
                                                                        </div>
                                                                  </div>
                                                            </article>
                                                      );
                                                })}
                                          </div>
                                    </div>
                              )}
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
