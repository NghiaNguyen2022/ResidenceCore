import { router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { authRouter } from "./routers/modules/auth";
import { dashboardRouter } from "./routers/modules/dashboard";
import { membersRouter } from "./routers/modules/members";
import { roomsRouter } from "./routers/modules/rooms";
import { dutiesRouter } from "./routers/modules/duties";
import { financialRouter } from "./routers/financial";
import { organizationRouter } from "./routers/modules/organization";
import { rolesRouter } from "./routers/modules/roles";
import { usersRouter } from "./routers/modules/users";

export const appRouter = router({
      system: systemRouter,
      auth: authRouter,
      dashboard: dashboardRouter,
      members: membersRouter,
      rooms: roomsRouter,
      duties: dutiesRouter,
      financial: financialRouter,

      // Tổ chức lưu xá:
      // - roles
      // - terms
      // - assignments
      // - units: Tổ / Ban
      organization: organizationRouter,
      roles: rolesRouter,
      users: usersRouter,
});

export type AppRouter = typeof appRouter;
