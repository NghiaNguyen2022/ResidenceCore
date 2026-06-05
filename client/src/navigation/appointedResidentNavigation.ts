import type { NavigationItem } from "./types";

export const appointedResidentNavigation: NavigationItem[] = [
      {
            label: "Việc tôi phụ trách",
            path: "/resident/assigned-work",
            icon: "✅",
            roles: [
                  "team_leader",
                  "committee_head",
                  "house_leader",
                  "deputy",
                  "secretary",
                  "treasurer",
            ],
            badge: "Sau",
            disabled: true,
      },
      {
            label: "Nhóm / Ban của tôi",
            path: "/resident/my-unit",
            icon: "👥",
            roles: [
                  "team_leader",
                  "committee_head",
                  "house_leader",
                  "deputy",
                  "secretary",
                  "treasurer",
            ],
            badge: "Sau",
            disabled: true,
      },
];