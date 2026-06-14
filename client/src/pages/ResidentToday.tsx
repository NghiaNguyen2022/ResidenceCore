import { useState } from "react";
import { BookOpen, BriefcaseBusiness, CalendarDays, CheckCircle2, Home, ShieldCheck } from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { trpc } from "@/lib/trpc";

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
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 ring-1 ring-blue-100">
                              <Icon className="h-5 w-5" />
                        </div>
                        <div>
                              <p className="text-sm font-semibold text-slate-500">{label}</p>
                              <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
                              {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
                        </div>
                  </div>
            </div>
      );
}

function StudyCard({ item }: { item: any }) {
      return (
            <div
                  className={`rounded-2xl border px-4 py-4 shadow-sm ${
                        isAssignedToMe
                              ? "border-blue-200 bg-blue-50/40 ring-1 ring-blue-100"
                              : "border-slate-200 bg-white"
                  }`}
            >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                              <div className="text-sm font-semibold text-blue-600">
                                    {item.timeRange || `${item.startTime || "--:--"} - ${item.endTime || "--:--"}`}
                              </div>
                              <div className="mt-1 text-lg font-bold text-slate-950">
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
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
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
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                              <div className="text-sm font-semibold text-slate-500">
                                    {item.timeRange || `${item.startTime || "--:--"} - ${item.endTime || "--:--"}`}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <div className="text-lg font-bold text-slate-950">
                                          {item.dutyName || "Công tác"}
                                    </div>
                                    {isAssignedToMe && (
                                          <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
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
                                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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

function RoleCard({ role }: { role: any }) {
      return (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="font-semibold text-slate-950">{role.roleName || "Chức vụ"}</div>
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

      const data: any = todayQuery.data;
      const studySchedules = data?.studySchedules || [];
      const duties = data?.duties || [];
      const roles = data?.roles || [];
      const resident = data?.resident;
      const today = data?.today;
      const dutyStats = data?.summary?.dutyStats || {
            total: duties.length,
            pending: duties.filter((item: any) => ["pending", "in_progress", "confirmed"].includes(String(item.status || "pending"))).length,
            completed: duties.filter((item: any) => String(item.status || "") === "completed").length,
            skipped: duties.filter((item: any) => ["skipped", "absent"].includes(String(item.status || ""))).length,
      };

      const handleCompleteDuty = (item: any) => {
            if (!item?.id) return;
            const assignmentId = Number(item.id);
            setCompletingDutyId(assignmentId);
            completeDutyMutation.mutate({ assignmentId });
      };

      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                                                Hôm nay của tôi
                                          </p>
                                          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                                {today?.dayLabel || "Hôm nay"} · {formatDateText(today?.date)}
                                          </h1>
                                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                                Tổng hợp lịch học, công tác và thông tin cần chú ý trong ngày.
                                          </p>
                                    </div>

                                    {resident && (
                                          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
                                                <div className="font-bold text-slate-950">{resident.fullName}</div>
                                                <div>{resident.residentCode}</div>
                                                {resident.roomName && <div>Phòng: {resident.roomName}</div>}
                                          </div>
                                    )}
                              </div>
                        </section>

                        {todayQuery.isLoading && (
                              <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                                    Đang tải thông tin hôm nay...
                              </section>
                        )}

                        {todayQuery.error && (
                              <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700 shadow-sm">
                                    {todayQuery.error.message || "Không thể tải thông tin hôm nay."}
                              </section>
                        )}

                        {successMessage && (
                              <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 shadow-sm">
                                    {successMessage}
                              </section>
                        )}

                        {errorMessage && (
                              <section className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-sm">
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
                                                label="Công tác"
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
                                          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                                <div className="mb-4 flex items-center justify-between gap-3">
                                                      <div>
                                                            <h2 className="text-xl font-bold text-slate-950">
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

                                          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                                <div className="mb-4 flex items-center justify-between gap-3">
                                                      <div>
                                                            <h2 className="text-xl font-bold text-slate-950">
                                                                  Công tác hôm nay
                                                            </h2>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  Các công tác được phân công riêng cho bạn trong ngày.
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
                                                            duties.map((item: any) => (
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

                                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                          <div className="mb-4 flex items-center justify-between gap-3">
                                                <div>
                                                      <h2 className="text-xl font-bold text-slate-950">
                                                            Thông tin lưu trú & vai trò
                                                      </h2>
                                                      <p className="mt-1 text-sm text-slate-500">
                                                            Thông tin cơ bản giúp bạn nắm phạm vi sinh hoạt trong lưu xá.
                                                      </p>
                                                </div>
                                                <Home className="h-5 w-5 text-slate-400" />
                                          </div>

                                          <div className="grid gap-3 md:grid-cols-2">
                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
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
            </ResidenceCareLayout>
      );
}
