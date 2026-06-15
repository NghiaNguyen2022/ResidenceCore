import { useMemo, useState } from "react";
import { Search, UsersRound } from "lucide-react";

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

function normalizeSearchText(value?: string | null) {
      return String(value || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
}

function getMemberRoleLabel(role?: string | null) {
      switch (role) {
            case "leader":
                  return "Tổ trưởng";
            case "head":
                  return "Trưởng ban";
            default:
                  return "Thành viên";
      }
}

function getMemberRoleClass(role?: string | null) {
      switch (role) {
            case "leader":
                  return "bg-emerald-50 text-emerald-700 ring-emerald-100";
            case "head":
                  return "bg-purple-50 text-purple-700 ring-purple-100";
            default:
                  return "bg-slate-50 text-slate-600 ring-slate-200";
      }
}

function filterMembers(members: any[], keyword: string) {
      const q = normalizeSearchText(keyword);

      if (!q) return members;

      return members.filter((member) => {
            const haystack = normalizeSearchText(
                  [
                        member.residentName,
                        member.fullName,
                        member.residentCode,
                        member.holyName,
                        member.phoneNumber,
                        member.roomCode,
                  ]
                        .filter(Boolean)
                        .join(" ")
            );

            return haystack.includes(q);
      });
}

function countRole(members: any[], role: string) {
      return members.filter((member) => String(member.memberRole || "member") === role).length;
}

function MemberRow({ member }: { member: any }) {
      const role = member.memberRole || "member";

      return (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                    <div className="font-semibold text-slate-950">
                                          {member.residentName || member.fullName || "Chưa rõ tên"}
                                    </div>
                                    <span
                                          className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getMemberRoleClass(
                                                role
                                          )}`}
                                    >
                                          {getMemberRoleLabel(role)}
                                    </span>
                              </div>

                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                                    <span>{member.residentCode || "Chưa có mã học viên"}</span>
                                    {member.holyName && <span>· {member.holyName}</span>}
                                    {member.roomCode && <span>· Phòng {member.roomCode}</span>}
                                    {member.phoneNumber && <span>· {member.phoneNumber}</span>}
                              </div>
                        </div>
                  </div>
            </div>
      );
}

function SearchBox({
      value,
      onChange,
      placeholder,
}: {
      value: string;
      onChange: (value: string) => void;
      placeholder: string;
}) {
      return (
            <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder={placeholder}
                        className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400"
                  />
            </div>
      );
}

export default function ResidentCommitteeMembers() {
      const [keyword, setKeyword] = useState("");

      const scopeQuery = trpc.residentPortal.getMyOrganizationScope.useQuery(undefined, {
            retry: false,
            refetchOnWindowFocus: false,
      });

      const committees = (scopeQuery.data as any)?.committees || [];
      const totalMembers = useMemo(() => {
            return committees.reduce((sum: number, committee: any) => sum + (committee.members || []).length, 0);
      }, [committees]);

      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="max-w-3xl">
                                          <p className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                                                Ban của tôi
                                          </p>
                                          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                                Thành viên trong ban
                                          </h1>
                                          <p className="mt-2 text-sm leading-6 text-slate-500">
                                                Dành cho Trưởng ban xem danh sách thành viên thuộc Ban mình phụ trách.
                                                Một học viên có thể tham gia nhiều Ban.
                                          </p>
                                    </div>

                                    <div className="rounded-2xl border border-purple-200 bg-purple-50/70 px-4 py-3">
                                          <div className="flex items-center gap-2 text-sm font-semibold text-purple-900">
                                                <UsersRound className="h-4 w-4" />
                                                {committees.length} ban phụ trách
                                          </div>
                                          <div className="mt-1 text-xs text-purple-700">
                                                {totalMembers} lượt thành viên đang hoạt động
                                          </div>
                                    </div>
                              </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                              <SearchBox
                                    value={keyword}
                                    onChange={setKeyword}
                                    placeholder="Tìm theo tên, mã học viên, tên thánh, phòng, số điện thoại..."
                              />
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
                              {committees.map((committee: any) => {
                                    const members = committee.members || [];
                                    const visibleMembers = filterMembers(members, keyword);
                                    const headCount = countRole(members, "head");

                                    return (
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
                                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                                                        {members.length} thành viên
                                                                  </span>
                                                                  {headCount > 0 && (
                                                                        <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-100">
                                                                              {headCount} trưởng ban
                                                                        </span>
                                                                  )}
                                                            </div>
                                                      </div>

                                                      <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-100">
                                                            {committee.myRoleName || "Trưởng ban"}
                                                      </span>
                                                </div>

                                                <div className="mt-4 space-y-3">
                                                      {visibleMembers.length ? (
                                                            visibleMembers.map((member: any) => (
                                                                  <MemberRow
                                                                        key={`${member.memberId || member.residentId}-${member.residentId}`}
                                                                        member={member}
                                                                  />
                                                            ))
                                                      ) : members.length ? (
                                                            <EmptyBox
                                                                  title="Không tìm thấy thành viên phù hợp"
                                                                  description="Thử đổi từ khóa tìm kiếm hoặc xóa bộ lọc."
                                                            />
                                                      ) : (
                                                            <EmptyBox
                                                                  title="Chưa có thành viên trong Ban"
                                                                  description="Quản lý có thể thêm thành viên ở màn hình Tổ chức lưu xá > Tổ / Ban."
                                                            />
                                                      )}
                                                </div>
                                          </section>
                                    );
                              })}
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
