import type { AppRole, NavigationItem } from "./types";
import {
      detailedManagerNavigation,
      simpleManagerNavigation,
} from "./managerNavigation";
import { residentNavigation } from "./residentNavigation";
import {
      appointedResidentNavigation,
      appointedResidentRoleKeys,
} from "./appointedResidentNavigation";

export function hasAnyAppointmentRole(roles: AppRole[]) {
      return roles.some((role) => appointedResidentRoleKeys.includes(role));
}

export function getNavigationByRoles(
      roles: AppRole[],
      mode: "simple" | "detailed" = "simple"
): NavigationItem[] {
      const hasManager = roles.includes("manager");
      const hasResident = roles.includes("resident");
      const hasAppointmentRole = hasAnyAppointmentRole(roles);

      if (hasManager) {
            return mode === "detailed"
                  ? detailedManagerNavigation
                  : simpleManagerNavigation;
      }

      if (hasResident) {
            return [
                  ...residentNavigation,
                  ...(hasAppointmentRole ? appointedResidentNavigation : []),
            ];
      }

      if (hasAppointmentRole) {
            return appointedResidentNavigation;
      }

      return [];
}
