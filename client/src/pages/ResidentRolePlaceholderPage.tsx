import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";

type ResidentRolePlaceholderPageProps = {
      title: string;
      description?: string;
      scopeTitle?: string;
      features?: Array<{
            title: string;
            description?: string;
            status?: string;
      }>;
};

export function ResidentRolePlaceholderPage({
      title,
      description,
      scopeTitle = "Phạm vi",
      features = [],
}: ResidentRolePlaceholderPageProps) {
      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    Vai trò của tôi
                              </p>
                              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                    {title}
                              </h1>
                              {description && (
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                                          {description}
                                    </p>
                              )}
                        </section>

                        <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
                              <h2 className="text-base font-semibold text-amber-900">
                                    {scopeTitle}
                              </h2>
                              <p className="mt-2 text-sm leading-6 text-amber-800">
                                    Màn hình này là phần giữ chỗ an toàn. Các chức năng chính đã được chuyển
                                    sang trang Tổng quan vai trò, Cơ cấu lưu xá và Công tác theo vai trò.
                              </p>
                        </section>

                        {features.length > 0 && (
                              <section className="grid gap-4 lg:grid-cols-3">
                                    {features.map((feature) => (
                                          <article
                                                key={feature.title}
                                                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                                          >
                                                <div className="flex items-start justify-between gap-3">
                                                      <h2 className="text-lg font-semibold text-slate-950">
                                                            {feature.title}
                                                      </h2>
                                                      {feature.status && (
                                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                                                  {feature.status}
                                                            </span>
                                                      )}
                                                </div>
                                                {feature.description && (
                                                      <p className="mt-3 text-sm leading-6 text-slate-600">
                                                            {feature.description}
                                                      </p>
                                                )}
                                          </article>
                                    ))}
                              </section>
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}
