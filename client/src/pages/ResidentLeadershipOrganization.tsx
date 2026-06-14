import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { trpc } from "@/lib/trpc";

function RoleBadge({ children }: { children: string }) {
      return (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                  {children}
            </span>
      );
}

function EmptyBox({ title, description }: { title: string; description: string }) {
      return (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                  <div className="font-semibold text-slate-800">{title}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            </div>
      );
}

function AssignmentCard({ item }: { item: any }) {
      return (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                        <div>
                              <div className="font-semibold text-slate-950">
                                    {item.residentName || "Chưa rõ tên"}
                              </div>
                              <div className="mt-1 text-sm text-slate-500">
                                    {item.residentCode || "Chưa có mã học viên"}
                              </div>
                        </div>
                        <RoleBadge>{item.roleName || "Chức vụ"}</RoleBadge>
                  </div>
                  {item.unitName && (
                        <div className="mt-3 text-sm text-slate-500">
                              Phạm vi: <span className="font-medium text-slate-700">{item.unitName}</span>
                        </div>
                  )}
            </div>
      );
}


function normalizeRoleText(value?: string | null) {
      return String(value || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[-\s]+/g, "_");
}

function isRole(item: any, keys: string[]) {
      const roleCode = normalizeRoleText(item?.roleCode);
      const roleName = normalizeRoleText(item?.roleName);

      return keys.some((key) => {
            const normalizedKey = normalizeRoleText(key);
            return roleCode === normalizedKey || roleName === normalizedKey;
      });
}

function ExecutivePersonCard({
      item,
      roleLabel,
      highlight = false,
}: {
      item?: any;
      roleLabel: string;
      highlight?: boolean;
}) {
      if (!item) {
            return (
                  <div
                        className={
                              highlight
                                    ? "rounded-3xl border-2 border-dashed border-blue-100 bg-blue-50/40 px-5 py-5 text-center"
                                    : "rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center"
                        }
                  >
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              {roleLabel}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-500">
                              Chưa bổ nhiệm
                        </div>
                  </div>
            );
      }

      return (
            <div
                  className={
                        highlight
                              ? "rounded-3xl border border-blue-200 bg-blue-50/60 px-5 py-5 text-center shadow-sm"
                              : "rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                  }
            >
                  <div className="flex justify-center">
                        <RoleBadge>{roleLabel}</RoleBadge>
                  </div>
                  <div
                        className={
                              highlight
                                    ? "mt-3 text-lg font-bold text-slate-950"
                                    : "mt-3 font-bold text-slate-950"
                        }
                  >
                        {item.residentName || "Chưa rõ tên"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                        {item.residentCode || "Chưa có mã học viên"}
                  </div>
                  {item.roomName && (
                        <div className="mt-2 text-xs font-medium text-slate-500">
                              {item.roomName}
                        </div>
                  )}
            </div>
      );
}

function ExecutiveRoleColumn({
      title,
      items,
}: {
      title: string;
      items: any[];
}) {
      return (
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-slate-500">
                        {title}
                  </div>

                  <div className="space-y-3">
                        {items.length === 0 ? (
                              <ExecutivePersonCard roleLabel={title} />
                        ) : (
                              items.map((item: any) => (
                                    <ExecutivePersonCard
                                          key={`${title}-${item.assignmentId || item.residentCode || item.residentName}`}
                                          item={item}
                                          roleLabel={title}
                                    />
                              ))
                        )}
                  </div>
            </div>
      );
}

function ExecutiveOrgChart({ assignments }: { assignments: any[] }) {
      const head = assignments.find((item) =>
            isRole(item, ["house_leader", "head", "truong", "trưởng"])
      );

      const deputies = assignments.filter((item) =>
            isRole(item, ["deputy", "pho", "phó"])
      );

      const secretaries = assignments.filter((item) =>
            isRole(item, ["secretary", "thu_ky", "thư ký"])
      );

      const treasurers = assignments.filter((item) =>
            isRole(item, ["treasurer", "thu_quy", "thủ quỹ"])
      );

      return (
            <div className="mt-5">
                  <div className="mx-auto max-w-md">
                        <ExecutivePersonCard
                              item={head}
                              roleLabel="Trưởng"
                              highlight
                        />
                  </div>

                  <div className="mx-auto h-8 w-px bg-slate-200" />

                  <div className="grid gap-4 lg:grid-cols-3">
                        <ExecutiveRoleColumn title="Phó" items={deputies} />
                        <ExecutiveRoleColumn title="Thư ký" items={secretaries} />
                        <ExecutiveRoleColumn title="Thủ quỹ" items={treasurers} />
                  </div>
            </div>
      );
}

function UnitScopeCard({ unit }: { unit: any }) {
      const members = Array.isArray(unit?.members) ? unit.members : [];

      return (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    {unit.unitType === "committee" ? "Ban của tôi" : "Tổ của tôi"}
                              </div>
                              <h3 className="mt-1 text-xl font-bold text-slate-950">
                                    {unit.unitName || "Chưa xác định"}
                              </h3>
                        </div>
                        {unit.myRoleName && <RoleBadge>{unit.myRoleName}</RoleBadge>}
                  </div>

                  <div className="mt-4">
                        {members.length === 0 ? (
                              <EmptyBox
                                    title="Chưa có thành viên trong cơ cấu"
                                    description="Hiện mới ghi nhận vai trò phụ trách. Danh sách thành viên chính thức của Tổ/Ban sẽ được bổ sung ở bước tiếp theo."
                              />
                        ) : (
                              <div className="space-y-3">
                                    {members.map((member: any) => (
                                          <AssignmentCard
                                                key={`${member.assignmentId}-${member.residentId}`}
                                                item={member}
                                          />
                                    ))}
                              </div>
                        )}
                  </div>
            </div>
      );
}

function getRoleSummary(data: any) {
      const roles = Array.isArray(data?.roles) ? data.roles : [];

      if (roles.length === 0) {
            return ["Học viên lưu trú"];
      }

      return roles.map((role: any) => {
            const unitName = role.unitName ? ` · ${role.unitName}` : " · Toàn lưu xá";
            return `${role.roleName || role.roleCode || "Chức vụ"}${unitName}`;
      });
}

export default function ResidentLeadershipOrganization() {
      const scopeQuery = trpc.residentPortal.getMyOrganizationScope.useQuery(undefined, {
            retry: false,
            refetchOnWindowFocus: false,
      });

      const data: any = scopeQuery.data;
      const roleSummary = getRoleSummary(data);
      const executiveAssignments = data?.executive?.assignments || [];
      const teams = data?.teams || [];
      const committees = data?.committees || [];

      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                                                Cơ cấu theo vai trò
                                          </p>
                                          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                                Cơ cấu tổ chức của tôi
                                          </h1>
                                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                                Hiển thị phạm vi tổ chức mà học viên đang phụ trách trong nhiệm kỳ hiện tại.
                                                Nếu có nhiều chức vụ, hệ thống sẽ hiển thị đủ từng phạm vi.
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

                        {scopeQuery.isLoading && (
                              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <p className="text-sm text-slate-500">Đang tải cơ cấu tổ chức...</p>
                              </section>
                        )}

                        {scopeQuery.error && (
                              <section className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                    {scopeQuery.error.message || "Không thể tải cơ cấu tổ chức."}
                              </section>
                        )}

                        {!scopeQuery.isLoading && !scopeQuery.error && (
                              <>
                                    {data?.executive?.enabled && (
                                          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                                <div className="flex items-start justify-between gap-3">
                                                      <div>
                                                            <h2 className="text-xl font-bold text-slate-950">
                                                                  Điều hành lưu xá
                                                            </h2>
                                                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                                                  Danh sách các vai trò điều hành đang hoạt động trong nhiệm kỳ hiện tại.
                                                            </p>
                                                      </div>
                                                      <RoleBadge>Toàn lưu xá</RoleBadge>
                                                </div>

                                                <div className="mt-4">
                                                      {executiveAssignments.length === 0 ? (
                                                            <EmptyBox
                                                                  title="Chưa có dữ liệu điều hành"
                                                                  description="Chưa tìm thấy phân công điều hành active trong nhiệm kỳ hiện tại."
                                                            />
                                                      ) : (
                                                            <ExecutiveOrgChart assignments={executiveAssignments} />
                                                      )}
                                                </div>
                                          </section>
                                    )}

                                    {teams.length > 0 && (
                                          <section className="grid gap-5 lg:grid-cols-2">
                                                {teams.map((unit: any) => (
                                                      <UnitScopeCard
                                                            key={`team-${unit.unitId || unit.unitName}`}
                                                            unit={unit}
                                                      />
                                                ))}
                                          </section>
                                    )}

                                    {committees.length > 0 && (
                                          <section className="grid gap-5 lg:grid-cols-2">
                                                {committees.map((unit: any) => (
                                                      <UnitScopeCard
                                                            key={`committee-${unit.unitId || unit.unitName}`}
                                                            unit={unit}
                                                      />
                                                ))}
                                          </section>
                                    )}

                                    {!data?.executive?.enabled &&
                                          teams.length === 0 &&
                                          committees.length === 0 && (
                                                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                                      <EmptyBox
                                                            title="Bạn chưa có vai trò phụ trách"
                                                            description="Khi được bổ nhiệm làm điều hành, Tổ trưởng hoặc Trưởng ban, phạm vi cơ cấu sẽ hiển thị tại đây."
                                                      />
                                                </section>
                                          )}
                              </>
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}
