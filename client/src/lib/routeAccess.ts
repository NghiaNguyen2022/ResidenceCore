export const APPOINTMENT_ROUTE_ROLES = [
      "house_leader",
      "head",
      "deputy",
      "secretary",
      "treasurer",
      "team_leader",
      "committee_head",
] as const;

export type RouteAccess =
      | { kind: "public" }
      | { kind: "manager" }
      | { kind: "resident" }
      | { kind: "roles"; roles: readonly string[] };

export type RouteUserLike = {
      role?: string | null;
      roles?: string[] | null;
};

export const ROUTE_ACCESS: Record<string, RouteAccess> = {
      "/": { kind: "public" },
      "/login": { kind: "public" },

      "/dashboard": { kind: "manager" },
      "/members": { kind: "manager" },
      "/rooms": { kind: "manager" },
      "/organization": { kind: "manager" },
      "/daily-routine": { kind: "manager" },
      "/duties": { kind: "manager" },
      "/activities": { kind: "manager" },
      "/store-ledger": { kind: "manager" },
      "/store-products": { kind: "manager" },
      "/store-purchase": { kind: "manager" },
      "/store-sales": { kind: "manager" },
      "/store-cashflow": { kind: "manager" },
      "/discipline-rules": { kind: "manager" },
      "/settings/users": { kind: "manager" },
      "/parents": { kind: "manager" },
      "/academic-info": { kind: "manager" },
      "/study-schedule": { kind: "manager" },
      "/smart-assignment": { kind: "manager" },
      "/settings/notifications": { kind: "manager" },
      "/attendance": { kind: "manager" },
      "/attendance-schedules": { kind: "manager" },
      "/clubs": { kind: "manager" },
      "/skills": { kind: "manager" },
      "/finance": { kind: "manager" },

      "/resident/today": { kind: "resident" },
      "/resident/information": { kind: "resident" },
      "/resident/rules": { kind: "resident" },
      "/resident/notifications": { kind: "resident" },
      "/resident/finance": { kind: "resident" },
      "/resident/activities": { kind: "resident" },
      "/resident/store": { kind: "resident" },
      "/my-profile": { kind: "resident" },
      "/my-duties": { kind: "resident" },

      "/resident/roles": {
            kind: "roles",
            roles: APPOINTMENT_ROUTE_ROLES,
      },
      "/resident/organization": {
            kind: "roles",
            roles: ["house_leader", "head", "deputy", "secretary", "treasurer"],
      },
      "/resident/role-duties": {
            kind: "roles",
            roles: ["house_leader", "head", "deputy", "secretary", "treasurer"],
      },
      "/resident/my-team": { kind: "roles", roles: ["team_leader"] },
      "/resident/team-duties": { kind: "roles", roles: ["team_leader"] },
      "/resident/my-committee": { kind: "roles", roles: ["committee_head"] },
      "/resident/committee-duties": {
            kind: "roles",
            roles: ["committee_head"],
      },
};

export function getUserRoleKeys(user?: RouteUserLike | null) {
      const roles = new Set<string>();

      if (user?.role) roles.add(user.role);
      user?.roles?.forEach((role) => roles.add(role));

      if (roles.has("head")) roles.add("house_leader");
      if (roles.has("house_leader")) roles.add("head");

      return roles;
}

export function getRouteAccess(pathname: string): RouteAccess {
      const pathOnly = pathname.split(/[?#]/, 1)[0] || "/";
      const normalizedPath =
            pathOnly.length > 1 ? pathOnly.replace(/\/+$/, "") : pathOnly;

      // Fail closed: a newly-added route must be explicitly assigned a policy.
      return ROUTE_ACCESS[normalizedPath] ?? { kind: "roles", roles: [] };
}

export function canAccessRoute(
      user: RouteUserLike | null | undefined,
      access: RouteAccess
) {
      if (access.kind === "public") return true;
      if (!user) return false;

      const roles = getUserRoleKeys(user);

      if (access.kind === "manager") return roles.has("manager");
      if (access.kind === "resident") return roles.has("resident");

      return access.roles.some((role) => roles.has(role));
}
