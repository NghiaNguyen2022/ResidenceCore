import type { AppRole, NavigationItem } from "./types";

export const executiveRoleKeys: AppRole[] = [
      "house_leader",
      "head",
      "deputy",
      "secretary",
      "treasurer",
];

export const teamLeaderRoleKeys: AppRole[] = ["team_leader"];

export const committeeHeadRoleKeys: AppRole[] = ["committee_head"];

export const appointedResidentRoleKeys: AppRole[] = [
      ...executiveRoleKeys,
      ...teamLeaderRoleKeys,
      ...committeeHeadRoleKeys,
];

export const appointedResidentNavigation: NavigationItem[] = [
      {
            label: "Phụ trách",
            icon: "⭐",
            roles: appointedResidentRoleKeys,
            children: [
                  {
                        label: "Tổng quan",
                        path: "/resident/roles",
                        icon: "⭐",
                        roles: appointedResidentRoleKeys,
                  },
                  {
                        label: "Điều hành",
                        path: "/resident/role-duties",
                        icon: "✅",
                        roles: executiveRoleKeys,
                  },
                  {
                        label: "Tổ phụ trách",
                        path: "/resident/my-team",
                        icon: "👥",
                        roles: teamLeaderRoleKeys,
                  },
                  {
                        label: "Ban phụ trách",
                        path: "/resident/my-committee",
                        icon: "👥",
                        roles: committeeHeadRoleKeys,
                  },
            ],
      },
];
