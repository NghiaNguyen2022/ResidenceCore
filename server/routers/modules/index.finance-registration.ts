import { router } from '../../_core/trpc';
import { financeRouter } from './finance';

// Copy phần finance vào root app router hiện tại.
// Ví dụ:
//
// export const appRouter = router({
//       members: membersRouter,
//       organization: organizationRouter,
//       duties: dutiesRouter,
//       finance: financeRouter,
// });
//
// Nếu repo đang có file server/routers/index.ts hoặc server/routers/_app.ts,
// chỉ cần import financeRouter và thêm dòng `finance: financeRouter`.

export const financeRouterRegistrationExample = router({
      finance: financeRouter,
});
