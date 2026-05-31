import { router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { authRouter } from "./routers/modules/auth";
import { dashboardRouter } from "./routers/modules/dashboard";
import { membersRouter } from "./routers/modules/members";
import { roomsRouter } from "./routers/modules/rooms";
import { dutiesRouter } from "./routers/modules/duties";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  dashboard: dashboardRouter,
  members: membersRouter,
  rooms: roomsRouter,
  duties: dutiesRouter,
});

export type AppRouter = typeof appRouter;
