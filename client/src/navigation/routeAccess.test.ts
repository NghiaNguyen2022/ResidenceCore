import { describe, expect, it } from "vitest";

import {
      ROUTE_ACCESS,
      canAccessRoute,
      getRouteAccess,
} from "../lib/routeAccess";

const manager = { role: "manager" };
const resident = { role: "resident" };
const teamLeader = {
      role: "resident",
      roles: ["resident", "team_leader"],
};
const committeeHead = {
      role: "resident",
      roles: ["resident", "committee_head"],
};
const houseLeader = {
      role: "resident",
      roles: ["resident", "house_leader"],
};

describe("route access matrix", () => {
      it("requires authentication for every application route except home and login", () => {
            for (const [path, access] of Object.entries(ROUTE_ACCESS)) {
                  if (path === "/" || path === "/login") {
                        expect(access.kind).toBe("public");
                  } else {
                        expect(access.kind, path).not.toBe("public");
                  }
            }
      });

      it("separates manager and resident workspaces", () => {
            expect(canAccessRoute(manager, getRouteAccess("/dashboard"))).toBe(true);
            expect(canAccessRoute(resident, getRouteAccess("/dashboard"))).toBe(false);

            expect(canAccessRoute(resident, getRouteAccess("/resident/today"))).toBe(true);
            expect(canAccessRoute(manager, getRouteAccess("/resident/today"))).toBe(false);
      });

      it("blocks anonymous users from protected routes", () => {
            expect(canAccessRoute(null, getRouteAccess("/members"))).toBe(false);
            expect(canAccessRoute(null, getRouteAccess("/resident/today"))).toBe(false);
            expect(canAccessRoute(manager, getRouteAccess("/route-not-declared"))).toBe(false);
      });

      it("enforces appointment scope routes", () => {
            expect(canAccessRoute(teamLeader, getRouteAccess("/resident/my-team"))).toBe(true);
            expect(canAccessRoute(teamLeader, getRouteAccess("/resident/my-committee"))).toBe(false);

            expect(canAccessRoute(committeeHead, getRouteAccess("/resident/my-committee"))).toBe(true);
            expect(canAccessRoute(committeeHead, getRouteAccess("/resident/my-team"))).toBe(false);

            expect(canAccessRoute(houseLeader, getRouteAccess("/resident/role-duties"))).toBe(true);
            expect(canAccessRoute(resident, getRouteAccess("/resident/role-duties"))).toBe(false);
      });

      it("normalizes trailing slashes and the legacy head role", () => {
            expect(canAccessRoute(resident, getRouteAccess("/resident/today/"))).toBe(true);
            expect(getRouteAccess("/login?returnTo=%2Fmembers").kind).toBe("public");
            expect(
                  canAccessRoute(
                        { role: "resident", roles: ["resident", "head"] },
                        getRouteAccess("/resident/organization")
                  )
            ).toBe(true);
      });
});
