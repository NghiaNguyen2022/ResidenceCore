import { describe, expect, it } from "vitest";

import { getNavigationByRoles } from "./navigation";
import type { NavigationItem } from "./types";
import { getPostLoginPath } from "../lib/authRedirect";

function flattenPaths(items: NavigationItem[]): string[] {
      return items.flatMap((item) => [
            ...(item.path ? [item.path] : []),
            ...flattenPaths(item.children || []),
      ]);
}

describe("manager navigation", () => {
      it("exposes the completed section 15 modules in detailed mode", () => {
            const paths = flattenPaths(getNavigationByRoles(["manager"], "detailed"));

            expect(paths).toEqual(
                  expect.arrayContaining([
                        "/parents",
                        "/academic-info",
                        "/study-schedule",
                        "/smart-assignment",
                        "/settings/notifications",
                        "/attendance",
                        "/attendance-schedules",
                        "/clubs",
                        "/skills",
                  ])
            );
      });

      it("matches the approved 5640581 menu with attendance added", () => {
            const paths = flattenPaths(getNavigationByRoles(["manager"], "simple"));

            expect(paths).toEqual([
                  "/dashboard",
                  "/members",
                  "/organization",
                  "/finance",
                  "/daily-routine",
                  "/activities",
                  "/attendance",
                  "/attendance-schedules",
                  "/discipline-rules",
                  "/store-products",
                  "/store-purchase",
                  "/store-sales",
                  "/store-cashflow",
                  "/settings/users",
            ]);

            expect(paths).not.toContain("/duties");
            expect(paths).not.toContain("/parents");
            expect(paths).not.toContain("/academic-info");
            expect(paths).not.toContain("/study-schedule");
            expect(paths).not.toContain("/smart-assignment");
            expect(paths).not.toContain("/settings/notifications");
            expect(paths).not.toContain("/clubs");
            expect(paths).not.toContain("/skills");
      });

      it("does not expose manager navigation to resident-only users", () => {
            const paths = flattenPaths(getNavigationByRoles(["resident"], "simple"));

            expect(paths).toEqual([
                  "/resident/today",
                  "/my-profile",
                  "/my-duties",
                  "/resident/store",
                  "/resident/finance",
                  "/resident/notifications",
                  "/resident/activities",
            ]);
            expect(paths).not.toContain("/dashboard");
            expect(paths).not.toContain("/members");
            expect(paths).not.toContain("/settings/users");
            expect(paths).not.toContain("/attendance");
      });
});

describe("post-login navigation", () => {
      it("opens the resident portal for a resident account", () => {
            expect(getPostLoginPath({ role: "resident" })).toBe("/resident/today");
      });

      it("keeps manager accounts on the dashboard", () => {
            expect(getPostLoginPath({ role: "manager" })).toBe("/dashboard");
      });

      it("prioritizes manager access for mixed-role accounts", () => {
            expect(
                  getPostLoginPath({
                        role: "resident",
                        roles: ["resident", "manager"],
                  })
            ).toBe("/dashboard");
      });
});
