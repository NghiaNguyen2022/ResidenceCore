# Add Finance route to real App router

Trang `/finance` đang 404 vì menu đã trỏ tới `/finance`, nhưng route chính của app chưa khai báo path này.

## Nếu file route chính dùng wouter

Tìm file đang có các route như `/members`, `/organization`, `/daily-routine`.

Thêm import:

```tsx
import FinanceLite from '@/pages/FinanceLite';
```

Thêm route trước route 404/catch-all:

```tsx
<Route path="/finance" component={FinanceLite} />
```

Ví dụ:

```tsx
<Switch>
      <Route path="/members" component={Members} />
      <Route path="/organization" component={OrganizationSimple} />
      <Route path="/daily-routine" component={DailyRoutine} />
      <Route path="/finance" component={FinanceLite} />

      <Route component={NotFound} />
</Switch>
```

## Nếu route chính muốn dùng fragment

```tsx
import FinanceRouteFragment from '@/routes/financeRouteFragment';

<Switch>
      ...
      <FinanceRouteFragment />
      <Route component={NotFound} />
</Switch>
```

## Nếu app có map route object

```tsx
{
      path: '/finance',
      component: FinanceLite,
}
```

hoặc:

```tsx
{
      path: '/finance',
      element: <FinanceLite />,
}
```

## Lưu ý

Route phải đặt trước route 404/catch-all.
