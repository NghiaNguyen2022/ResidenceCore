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
            label: "Điều hành lưu xá",
            icon: "🧭",
            roles: executiveRoleKeys,
            children: [
                  {
                        label: "Tổng quan điều hành",
                        path: "/resident/leadership/overview",
                        icon: "📊",
                        roles: executiveRoleKeys,
                  },
                  {
                        label: "Cơ cấu tổ chức",
                        path: "/resident/leadership/organization",
                        icon: "🏛️",
                        roles: executiveRoleKeys,
                  },
                  {
                        label: "Công tác & phân công",
                        path: "/resident/leadership/duties",
                        icon: "✅",
                        roles: executiveRoleKeys,
                  },
            ],
      },
      {
            label: "Tổ của tôi",
            icon: "👥",
            roles: teamLeaderRoleKeys,
            children: [
                  {
                        label: "Thành viên trong tổ",
                        path: "/resident/team/members",
                        icon: "👥",
                        roles: teamLeaderRoleKeys,
                  },
                  {
                        label: "Công tác của tổ",
                        path: "/resident/team/duties",
                        icon: "✅",
                        roles: teamLeaderRoleKeys,
                  },
            ],
      },
      {
            label: "Ban của tôi",
            icon: "📌",
            roles: committeeHeadRoleKeys,
            children: [
                  {
                        label: "Thành viên trong ban",
                        path: "/resident/committee/members",
                        icon: "👥",
                        roles: committeeHeadRoleKeys,
                  },
                  {
                        label: "Công tác của ban",
                        path: "/resident/committee/duties",
                        icon: "✅",
                        roles: committeeHeadRoleKeys,
                  },
            ],
      },
];
