import { router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { authRouter } from "./routers/modules/auth";
import { dashboardRouter } from "./routers/modules/dashboard";
import { membersRouter } from "./routers/modules/members";
import { roomsRouter } from "./routers/modules/rooms";
import { dutiesRouter } from "./routers/modules/duties";
import { organizationRouter } from "./routers/modules/organization";
import { rolesRouter } from "./routers/modules/roles";
import { usersRouter } from "./routers/modules/users";
import { dailyRoutineRouter } from "./routers/modules/dailyRoutine";
import { residentPortalRouter } from "./routers/modules/residentPortal";
import { activitiesRouter } from "./routers/modules/activities";
import { financeRouter } from "./routers/modules/finance";
import { storeLedgerRouter } from "./routers/modules/storeLedger";

export const appRouter = router({
      system: systemRouter,
      auth: authRouter,
      dashboard: dashboardRouter,
      members: membersRouter,
      rooms: roomsRouter,
      duties: dutiesRouter,
      organization: organizationRouter,
      roles: rolesRouter,
      users: usersRouter,
      dailyRoutine: dailyRoutineRouter,
      residentPortal: residentPortalRouter,
      activities: activitiesRouter,
      finance: financeRouter,
      storeLedger: storeLedgerRouter,
});

export type AppRouter = typeof appRouter;
