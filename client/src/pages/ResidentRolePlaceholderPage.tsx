import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { trpc } from "@/lib/trpc";

type FeatureItem = {
      title: string;
      description: string;
      status?: "ready" | "next";
};

type ResidentRolePlaceholderPageProps = {
      title: string;
      description: string;
      scopeTitle: string;
      features: FeatureItem[];
};

function getRoleSummary(accessContext: any) {
      const roles = Array.isArray(accessContext?.roles) ? accessContext.roles : [];

      if (roles.length === 0) {
            return ["Học viên lưu trú"];
      }

      return roles.map((role: any) => {
            const roleName = role?.roleName || role?.roleCode || "Chức vụ";
            const unitName = role?.unitName ? ` · ${role.unitName}` : "";
            return `${roleName}${unitName}`;
      });
}

export function ResidentRolePlaceholderPage({
      title,
      description,
      scopeTitle,
      features,
}: ResidentRolePlaceholderPageProps) {
      const accessContextQuery = trpc.residentPortal.getMyAccessContext.useQuery(undefined, {
            retry: false,
            refetchOnWindowFocus: false,
      });

      const roleSummary = getRoleSummary(accessContextQuery.data);

      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                                                Chức năng theo vai trò
                                          </p>
                                          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                                {title}
                                          </h1>
                                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                                {description}
                                          </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Vai trò hiện tại
                                          </div>
                                          <div className="mt-2 space-y-1">
                                                {roleSummary.map((item: string) => (
                                                      <div
                                                            key={item}
                                                            className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
                                                      >
                                                            {item}
                                                      </div>
                                                ))}
                                          </div>
                                    </div>
                              </div>
                        </section>

                        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h2 className="text-lg font-bold text-slate-950">
                                          {scopeTitle}
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                          Phạm vi dữ liệu sẽ được giới hạn theo chức vụ đang đảm nhiệm.
                                          Ví dụ: Tổ trưởng chỉ làm việc với tổ của mình, Trưởng ban chỉ
                                          làm việc với ban của mình, nhóm điều hành xem phạm vi toàn lưu xá.
                                    </p>

                                    <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                                          Đây là màn chuẩn bị cho demo main flow. Các tính năng chính sẽ
                                          được mở dần theo thứ tự: xem dữ liệu → theo dõi công tác →
                                          phân công trong phạm vi được phụ trách.
                                    </div>
                              </div>

                              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h2 className="text-lg font-bold text-slate-950">
                                          Tính năng dự kiến
                                    </h2>

                                    <div className="mt-4 space-y-3">
                                          {features.map((feature) => (
                                                <div
                                                      key={feature.title}
                                                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                                                >
                                                      <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                  <div className="font-semibold text-slate-900">
                                                                        {feature.title}
                                                                  </div>
                                                                  <p className="mt-1 text-sm leading-6 text-slate-500">
                                                                        {feature.description}
                                                                  </p>
                                                            </div>

                                                            <span
                                                                  className={[
                                                                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                                                                        feature.status === "ready"
                                                                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                                                              : "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
                                                                  ].join(" ")}
                                                            >
                                                                  {feature.status === "ready" ? "Demo" : "Tiếp theo"}
                                                            </span>
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              </div>
                        </section>
                  </div>
            </ResidenceCareLayout>
      );
}
