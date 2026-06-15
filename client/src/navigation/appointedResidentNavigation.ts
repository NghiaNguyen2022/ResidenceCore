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
            label: "Vai trò của tôi",
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
                        label: "Cơ cấu lưu xá",
                        path: "/resident/organization",
                        icon: "🏛️",
                        roles: executiveRoleKeys,
                  },
                  {
                        label: "Công tác điều hành",
                        path: "/resident/role-duties",
                        icon: "✅",
                        roles: executiveRoleKeys,
                  },
                  {
                        label: "Thành viên tổ",
                        path: "/resident/my-team",
                        icon: "👥",
                        roles: teamLeaderRoleKeys,
                  },
                  {
                        label: "Công tác tổ",
                        path: "/resident/team-duties",
                        icon: "✅",
                        roles: teamLeaderRoleKeys,
                  },
                  {
                        label: "Thành viên ban",
                        path: "/resident/my-committee",
                        icon: "👥",
                        roles: committeeHeadRoleKeys,
                  },
                  {
                        label: "Công tác ban",
                        path: "/resident/committee-duties",
                        icon: "✅",
                        roles: committeeHeadRoleKeys,
                  },
            ],
      },
];
