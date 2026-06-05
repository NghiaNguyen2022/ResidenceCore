import type { AppRole, NavigationItem } from "./types";
import { simpleManagerNavigation } from "./managerNavigation";
import { residentNavigation } from "./residentNavigation";
import { appointedResidentNavigation } from "./appointedResidentNavigation";

export function getNavigationByRoles(
      roles: AppRole[],
      mode: "simple" | "detailed" = "simple"
): NavigationItem[] {
      const hasManager = roles.includes("manager");
      const hasResident = roles.includes("resident");

      const hasAppointmentRole = roles.some((role) =>
            [
                  "team_leader",
                  "committee_head",
                  "house_leader",
                  "deputy",
                  "secretary",
                  "treasurer",
            ].includes(role)
      );

      if (hasManager) {
            return simpleManagerNavigation;
      }

      if (hasResident) {
            return [
                  ...residentNavigation,
                  ...(hasAppointmentRole ? appointedResidentNavigation : []),
            ];
      }

      return [];
}