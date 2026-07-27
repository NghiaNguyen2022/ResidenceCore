import { memberService } from "../services/memberService";
import { organizationService } from "../services/organizationService";

const START_DATE = "2026-07-27";

async function main() {
      const [residents, units, roles, terms, existingAssignments] = await Promise.all([
            memberService.listMembers({ limit: 500 }),
            organizationService.listUnits({ isActive: true, limit: 100 }),
            organizationService.listRoles({ isActive: true, limit: 100 }),
            organizationService.listTerms({ limit: 100 }),
            organizationService.listAssignments({ status: "active", limit: 500 }),
      ]);

      const activeResidents = residents
            .filter((resident: any) => resident.status === "active")
            .sort((a: any, b: any) => Number(a.id) - Number(b.id));
      const teams = units
            .filter((unit: any) => unit.unitType === "team")
            .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
      const committees = units
            .filter((unit: any) => unit.unitType === "committee")
            .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
      const activeTerm = terms.find((term: any) => term.status === "active") || terms[0];

      if (activeResidents.length === 0) throw new Error("Không có học viên đang lưu trú.");
      if (teams.length !== 4) throw new Error(`Cần đúng 4 tổ, hiện có ${teams.length}.`);
      if (committees.length !== 4) throw new Error(`Cần đúng 4 ban, hiện có ${committees.length}.`);
      if (!activeTerm) throw new Error("Chưa có nhiệm kỳ tổ chức.");

      const membershipByUnit = new Map<number, any[]>();
      for (const unit of units) {
            membershipByUnit.set(
                  Number(unit.id),
                  await organizationService.listUnitMembers({
                        unitId: Number(unit.id),
                        status: "active",
                  })
            );
      }

      const currentTeamByResident = new Map<number, number>();
      for (const team of teams) {
            for (const member of membershipByUnit.get(Number(team.id)) || []) {
                  currentTeamByResident.set(Number(member.residentId), Number(team.id));
            }
      }

      const targetTeamSizes = [5, 5, 5, 4];
      const teamLoads = teams.map(
            (team: any) => (membershipByUnit.get(Number(team.id)) || []).length
      );
      let teamMembershipsAdded = 0;

      for (const resident of activeResidents) {
            if (currentTeamByResident.has(Number(resident.id))) continue;

            let teamIndex = teamLoads.findIndex(
                  (load, index) => load < targetTeamSizes[index]
            );
            if (teamIndex < 0) {
                  teamIndex = teamLoads.indexOf(Math.min(...teamLoads));
            }

            await organizationService.addUnitMember({
                  unitId: Number(teams[teamIndex].id),
                  residentId: Number(resident.id),
                  memberRole: "member",
                  startDate: START_DATE,
                  notes: "Dữ liệu nền UAT - phân tổ học viên nữ",
            });
            teamLoads[teamIndex] += 1;
            teamMembershipsAdded += 1;
      }

      const currentCommitteePairs = new Set<string>();
      for (const committee of committees) {
            for (const member of membershipByUnit.get(Number(committee.id)) || []) {
                  currentCommitteePairs.add(`${member.residentId}:${committee.id}`);
            }
      }

      let committeeMembershipsAdded = 0;
      for (let index = 0; index < activeResidents.length; index += 1) {
            const resident = activeResidents[index];
            const committee = committees[index % committees.length];
            const key = `${resident.id}:${committee.id}`;
            if (currentCommitteePairs.has(key)) continue;

            await organizationService.addUnitMember({
                  unitId: Number(committee.id),
                  residentId: Number(resident.id),
                  memberRole: "member",
                  startDate: START_DATE,
                  notes: "Dữ liệu nền UAT - phân ban phục vụ",
            });
            committeeMembershipsAdded += 1;
      }

      const refreshedMemberships = new Map<number, any[]>();
      for (const unit of units) {
            refreshedMemberships.set(
                  Number(unit.id),
                  await organizationService.listUnitMembers({
                        unitId: Number(unit.id),
                        status: "active",
                  })
            );
      }

      const roleByCode = new Map(roles.map((role: any) => [String(role.code), role]));
      const existingKeys = new Set(
            existingAssignments.map(
                  (assignment: any) =>
                        `${assignment.roleId}:${assignment.residentId}:${assignment.unitId || 0}`
            )
      );
      let appointmentsCreated = 0;

      async function createAppointment(roleCode: string, residentId: number, unitId?: number) {
            const role: any = roleByCode.get(roleCode);
            if (!role) throw new Error(`Không tìm thấy vai trò ${roleCode}.`);

            const key = `${role.id}:${residentId}:${unitId || 0}`;
            if (existingKeys.has(key)) return;

            await organizationService.createAssignment({
                  termId: Number(activeTerm.id),
                  roleId: Number(role.id),
                  residentId,
                  unitId,
                  startDate: START_DATE,
                  status: "active",
                  notes: "Dữ liệu nền UAT - cơ cấu lưu xá nữ BMT",
            });
            existingKeys.add(key);
            appointmentsCreated += 1;
      }

      const houseRoles = ["TRUONG", "PHO", "THU_KY", "THU_QUY"];
      for (let index = 0; index < houseRoles.length; index += 1) {
            await createAppointment(houseRoles[index], Number(activeResidents[index].id));
      }

      for (const team of teams) {
            const members = refreshedMemberships.get(Number(team.id)) || [];
            if (members.length === 0) throw new Error(`${team.name} chưa có thành viên.`);
            await createAppointment("TO_TRUONG", Number(members[0].residentId), Number(team.id));
      }

      for (const committee of committees) {
            const members = refreshedMemberships.get(Number(committee.id)) || [];
            if (members.length === 0) throw new Error(`${committee.name} chưa có thành viên.`);
            await createAppointment(
                  "TRUONG_BAN",
                  Number(members[0].residentId),
                  Number(committee.id)
            );
      }

      const summary = [];
      for (const unit of [...teams, ...committees]) {
            const members = await organizationService.listUnitMembers({
                  unitId: Number(unit.id),
                  status: "active",
            });
            summary.push({
                  code: unit.code,
                  name: unit.name,
                  unitType: unit.unitType,
                  memberCount: members.length,
            });
      }

      console.log(
            JSON.stringify(
                  {
                        activeResidents: activeResidents.length,
                        teamMembershipsAdded,
                        committeeMembershipsAdded,
                        appointmentsCreated,
                        units: summary,
                  },
                  null,
                  2
            )
      );
}

main()
      .then(() => process.exit(0))
      .catch((error) => {
            console.error(error);
            process.exit(1);
      });
