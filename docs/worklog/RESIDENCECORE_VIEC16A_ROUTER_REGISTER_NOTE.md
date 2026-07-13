# RESIDENCECORE_VIEC16A_ROUTER_REGISTER_NOTE

Patch 16A tạo module router:

```ts
server/routers/modules/storeLedger.ts
export const storeLedgerRouter = router({ ... })
```

Vì người dùng xác nhận hiện không có `server/routers/index.ts`, cần đăng ký router này vào file root app router hiện tại của repo.

Ví dụ:

```ts
import { storeLedgerRouter } from "./modules/storeLedger";

export const appRouter = router({
      // existing routers
      storeLedger: storeLedgerRouter,
});
```

Client page `StoreLedger.tsx` gọi API qua:

```ts
(trpc as any).storeLedger
```

Nếu chưa đăng ký root router, page sẽ mở được nhưng API chưa chạy.
