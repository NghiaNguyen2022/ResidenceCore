# RESIDENCECORE_VIEC14A_ROUTER_REGISTER_NOTE

Patch 14A có tạo mới:

```ts
server/routers/modules/activities.ts
```

Nếu root tRPC router của repo hiện tại chưa đăng ký `activities`, cần thêm tương tự:

```ts
import { activitiesRouter } from "./modules/activities";

export const appRouter = router({
  // ...các router hiện có
  activities: activitiesRouter,
});
```

Nếu root router đã có `activities` từ bản cũ thì chỉ cần thay file module tương ứng bằng bản trong patch.
