import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { trpc } from "@/lib/trpc";

function EmptyBox({ title, description }: { title: string; description: string }) {
      return (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                  <div className="font-semibold text-slate-800">{title}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            </div>
      );
}

function MemberRow({ member }: { member: any }) {
      return (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                              <div className="font-semibold text-slate-950">
                                    {member.residentName || "Chưa rõ tên"}
                              </div>
                              <div className="mt-1 text-sm text-slate-500">
                                    {member.residentCode || "Chưa có mã học viên"}
                              </div>
                        </div>
                        <span className="w-fit rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                              {member.roleName || "Thành viên"}
                        </span>
                  </div>
            </div>
      );
}

export default function ResidentCommitteeMembers() {
      const scopeQuery = trpc.residentPortal.getMyOrganizationScope.useQuery(undefined, {
            retry: false,
            refetchOnWindowFocus: false,
      });

      const committees = (scopeQuery.data as any)?.committees || [];

      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                                    Ban của tôi
                              </p>
                              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                    Thành viên trong ban
                              </h1>
                              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                    Dành cho Trưởng ban xem phạm vi Ban mình đang phụ trách. Simple Mode hiện hiển thị các nhân sự đã được gắn trong cơ cấu của Tổ.
                              </p>
                        </section>

                        {scopeQuery.isLoading && (
                              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <p className="text-sm text-slate-500">Đang tải thành viên trong ban...</p>
                              </section>
                        )}

                        {scopeQuery.error && (
                              <section className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                    {scopeQuery.error.message || "Không thể tải thành viên trong ban."}
                              </section>
                        )}

                        {!scopeQuery.isLoading && !scopeQuery.error && committees.length === 0 && (
                              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <EmptyBox
                                          title="Bạn chưa phụ trách Ban nào"
                                          description="Menu này sẽ có dữ liệu khi học viên được bổ nhiệm làm Trưởng ban trong nhiệm kỳ hiện tại."
                                    />
                              </section>
                        )}

                        <div className="grid gap-5 lg:grid-cols-2">
                              {committees.map((committee: any) => (
                                    <section
                                          key={`committee-${committee.unitId || committee.unitName}`}
                                          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                                    >
                                          <div className="flex items-start justify-between gap-3">
                                                <div>
                                                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                            Ban phụ trách
                                                      </div>
                                                      <h2 className="mt-1 text-xl font-bold text-slate-950">
                                                            {committee.unitName || "Ban chưa xác định"}
                                                      </h2>
                                                </div>
                                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                                      {committee.myRoleName || "Trưởng ban"}
                                                </span>
                                          </div>

                                          <div className="mt-4 space-y-3">
                                                {committee.members?.length ? (
                                                      committee.members.map((member: any) => (
                                                            <MemberRow
                                                                  key={`${member.assignmentId}-${member.residentId}`}
                                                                  member={member}
                                                            />
                                                      ))
                                                ) : (
                                                      <EmptyBox
                                                            title="Chưa có thành viên trong cơ cấu Ban"
                                                            description="Danh sách thành viên của Ban sẽ được bổ sung ở bước tiếp theo."
                                                      />
                                                )}
                                          </div>
                                    </section>
                              ))}
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
