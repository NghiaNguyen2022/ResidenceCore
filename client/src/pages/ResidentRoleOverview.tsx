import { Link } from "wouter";
import { BriefcaseBusiness, Building2, CheckCircle2, Coins, ShieldCheck, UsersRound } from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { trpc } from "@/lib/trpc";

function normalizeRoleCode(value?: string | null) {
      return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/-/g, "_");
}

function getRoleLabel(role: any) {
      const roleCode = normalizeRoleCode(role?.roleCode);
      const roleName = role?.roleName;

      if (roleName) return roleName;

      switch (roleCode) {
            case "house_leader":
            case "head":
                  return "Trưởng";
            case "deputy":
                  return "Phó";
            case "secretary":
                  return "Thư ký";
            case "treasurer":
                  return "Thủ quỹ";
            case "team_leader":
                  return "Tổ trưởng";
            case "committee_head":
                  return "Trưởng ban";
            default:
                  return "Vai trò phụ trách";
      }
}

function getScopeText(role: any) {
      if (role?.unitName) return role.unitName;

      const roleCode = normalizeRoleCode(role?.roleCode);
      if (roleCode === "team_leader") return "Tổ được phân công";
      if (roleCode === "committee_head") return "Ban được phân công";

      return "Toàn lưu xá";
}

function getRoleTone(role: any) {
      const roleCode = normalizeRoleCode(role?.roleCode);

      if (roleCode === "team_leader") {
            return {
                  icon: UsersRound,
                  wrapper: "border-emerald-200 bg-emerald-50/80",
                  iconBox: "bg-emerald-100 text-emerald-700",
                  text: "text-emerald-900",
                  subText: "text-emerald-700",
            };
      }

      if (roleCode === "committee_head") {
            return {
                  icon: Building2,
                  wrapper: "border-violet-200 bg-violet-50/80",
                  iconBox: "bg-violet-100 text-violet-700",
                  text: "text-violet-900",
                  subText: "text-violet-700",
            };
      }

      return {
            icon: ShieldCheck,
            wrapper: "border-amber-200 bg-amber-50/80",
            iconBox: "bg-amber-100 text-amber-700",
            text: "text-amber-900",
            subText: "text-amber-700",
      };
}

function getRoleActions(role: any) {
      const roleCode = normalizeRoleCode(role?.roleCode);

      if (["house_leader", "head", "deputy", "secretary", "treasurer"].includes(roleCode)) {
            return [
                  {
                        label: "Xem cơ cấu lưu xá",
                        href: "/resident/organization",
                  },
                  {
                        label: "Công tác điều hành",
                        href: "/resident/role-duties",
                  },
            ];
      }

      if (roleCode === "team_leader") {
            return [
                  {
                        label: "Thành viên tổ",
                        href: "/resident/my-team",
                  },
                  {
                        label: "Công tác tổ",
                        href: "/resident/team-duties",
                  },
            ];
      }

      if (roleCode === "committee_head") {
            return [
                  {
                        label: "Thành viên ban",
                        href: "/resident/my-committee",
                  },
                  {
                        label: "Công tác ban",
                        href: "/resident/committee-duties",
                  },
            ];
      }

      return [];
}

function EmptyBox() {
      return (
            <section className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                        <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-950">
                        Chưa có vai trò phụ trách
                  </h2>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                        Khi được bổ nhiệm làm Trưởng, Phó, Thư ký, Thủ quỹ, Tổ trưởng hoặc Trưởng ban,
                        các chức năng theo vai trò sẽ hiển thị tại đây.
                  </p>
            </section>
      );
}

export default function ResidentRoleOverview() {
      const accessContextQuery = trpc.residentPortal.getMyAccessContext.useQuery(undefined, {
            retry: false,
            refetchOnWindowFocus: false,
      });

      const roles = Array.isArray((accessContextQuery.data as any)?.roles)
            ? ((accessContextQuery.data as any).roles as any[])
            : [];

      const financeQuery = trpc.residentPortal.getMyFinanceOverview.useQuery(undefined, {
            retry: false,
            refetchOnWindowFocus: false,
      });
      const unitAdvances = Array.isArray((financeQuery.data as any)?.unitAdvances)
            ? ((financeQuery.data as any).unitAdvances as any[])
            : [];

      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="max-w-3xl">
                                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                Vai trò của tôi
                                          </p>
                                          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                                Tổng quan vai trò
                                          </h1>
                                          <p className="mt-3 text-sm leading-6 text-slate-600">
                                                Tất cả chức vụ đang đảm nhiệm được gom tại đây để dễ xem
                                                phạm vi phụ trách, thành viên liên quan và công tác cần theo dõi.
                                          </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                          <div className="font-semibold text-slate-900">
                                                {roles.length} vai trò đang hoạt động
                                          </div>
                                          <div className="mt-1 text-xs text-slate-500">
                                                Dữ liệu lấy từ bổ nhiệm hiện tại
                                          </div>
                                    </div>
                              </div>
                        </section>

                        {accessContextQuery.isLoading ? (
                              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
                                    <div className="mt-4 h-24 animate-pulse rounded-2xl bg-slate-100" />
                              </section>
                        ) : roles.length === 0 ? (
                              <EmptyBox />
                        ) : (
                              <section className="grid gap-4 lg:grid-cols-2">
                                    {roles.map((role) => {
                                          const tone = getRoleTone(role);
                                          const Icon = tone.icon;
                                          const actions = getRoleActions(role);

                                          return (
                                                <article
                                                      key={`${role.roleCode}-${role.unitType || "all"}-${role.unitId || "0"}`}
                                                      className={[
                                                            "rounded-3xl border p-5 shadow-sm",
                                                            tone.wrapper,
                                                      ].join(" ")}
                                                >
                                                      <div className="flex items-start gap-4">
                                                            <div
                                                                  className={[
                                                                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                                                                        tone.iconBox,
                                                                  ].join(" ")}
                                                            >
                                                                  <Icon className="h-5 w-5" />
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                  <h2
                                                                        className={[
                                                                              "text-xl font-bold tracking-tight",
                                                                              tone.text,
                                                                        ].join(" ")}
                                                                  >
                                                                        {getRoleLabel(role)}
                                                                  </h2>
                                                                  <p
                                                                        className={[
                                                                              "mt-1 text-sm font-medium",
                                                                              tone.subText,
                                                                        ].join(" ")}
                                                                  >
                                                                        {getScopeText(role)}
                                                                  </p>

                                                                  {role?.termName && (
                                                                        <p className="mt-2 text-xs text-slate-500">
                                                                              Nhiệm kỳ: {role.termName}
                                                                        </p>
                                                                  )}
                                                            </div>
                                                      </div>

                                                      {actions.length > 0 && (
                                                            <div className="mt-5 flex flex-wrap gap-2">
                                                                  {actions.map((action) => (
                                                                        <Link
                                                                              key={action.href}
                                                                              href={action.href}
                                                                              className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
                                                                        >
                                                                              <CheckCircle2 className="h-4 w-4 text-slate-400" />
                                                                              {action.label}
                                                                        </Link>
                                                                  ))}
                                                            </div>
                                                      )}
                                                </article>
                                          );
                                    })}
                              </section>
                        )}



                        {unitAdvances.length > 0 && (
                              <section className="rounded-3xl border border-[#ead9ad] bg-[linear-gradient(180deg,#fffdf8_0%,#fff7e6_100%)] p-5 shadow-[0_16px_40px_rgba(91,68,28,0.08)]">
                                    <div className="flex items-start gap-3">
                                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff2c9] text-[#8a5305]">
                                                <Coins className="h-5 w-5" />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                      <div>
                                                            <h2 className="text-base font-semibold text-[#101a2f]">
                                                                  Tạm ứng của Tổ/Ban đang phụ trách
                                                            </h2>
                                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                                  Các khoản tạm ứng được giao cho Tổ hoặc Ban của bạn sẽ cần cập nhật chi thực tế theo kỳ.
                                                            </p>
                                                      </div>
                                                      <Link
                                                            href="/resident/finance"
                                                            className="inline-flex w-fit items-center rounded-2xl border border-[#e5c06a] bg-white/80 px-3 py-2 text-sm font-semibold text-[#7c4a03] shadow-sm"
                                                      >
                                                            Mở tài chính
                                                      </Link>
                                                </div>

                                                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                                      {unitAdvances.slice(0, 4).map((advance: any) => (
                                                            <div key={advance.id} className="rounded-2xl border border-[#efe4cb] bg-white/85 px-4 py-3">
                                                                  <div className="flex items-start justify-between gap-3">
                                                                        <div>
                                                                              <p className="font-semibold text-slate-900">
                                                                                    {advance.targetName || "Tạm ứng đơn vị"}
                                                                              </p>
                                                                              <p className="mt-1 text-xs text-slate-500">
                                                                                    {advance.periodStart || "Theo kỳ"}
                                                                                    {advance.periodEnd ? ` → ${advance.periodEnd}` : ""}
                                                                              </p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Còn giữ</p>
                                                                              <p className="mt-1 font-bold text-[#a05a12]">
                                                                                    {new Intl.NumberFormat("vi-VN").format(Number(advance.balanceAmount || 0))}đ
                                                                              </p>
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>
                                          </div>
                                    </div>
                              </section>
                        )}

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                              <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                                          <BriefcaseBusiness className="h-5 w-5" />
                                    </div>
                                    <div>
                                          <h2 className="text-base font-semibold text-slate-950">
                                                Gợi ý sử dụng
                                          </h2>
                                          <p className="mt-1 text-sm leading-6 text-slate-600">
                                                Trang Hôm nay vẫn là nơi xem việc cần làm trong ngày. Trang Vai trò
                                                của tôi dùng để xem phạm vi phụ trách, thành viên và công tác theo
                                                từng chức vụ.
                                          </p>
                                    </div>
                              </div>
                        </section>
                  </div>
            </ResidenceCareLayout>
      );
}
