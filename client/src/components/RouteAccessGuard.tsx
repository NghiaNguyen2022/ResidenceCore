import type { ReactNode } from "react";
import { useEffect } from "react";
import { LoaderCircle, ShieldAlert } from "lucide-react";
import { useLocation } from "wouter";

import { getPostLoginPath } from "@/lib/authRedirect";
import { canAccessRoute, getRouteAccess } from "@/lib/routeAccess";
import { trpc } from "@/lib/trpc";

type RouteAccessGuardProps = {
      children: ReactNode;
      pathname: string;
};

function FullPageLoading() {
      return (
            <div
                  className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#fffdf8_0%,#ffffff_55%,#fff7ed_100%)]"
                  aria-busy="true"
                  aria-label="Đang kiểm tra quyền truy cập"
            >
                  <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-700 shadow-lg shadow-amber-950/5">
                        <LoaderCircle className="h-5 w-5 animate-spin text-amber-600" />
                        Đang kiểm tra quyền truy cập...
                  </div>
            </div>
      );
}

export function RouteAccessGuard({
      children,
      pathname,
}: RouteAccessGuardProps) {
      const [, navigate] = useLocation();
      const access = getRouteAccess(pathname);
      const requiresAuthentication = access.kind !== "public";
      const authQuery = trpc.auth.me.useQuery(undefined, {
            enabled: requiresAuthentication,
            retry: false,
            refetchOnWindowFocus: true,
      });
      const user = authQuery.data ?? null;

      useEffect(() => {
            if (!requiresAuthentication) return;
            if (authQuery.isLoading || authQuery.isFetching || user) return;

            window.location.href = `/login?returnTo=${encodeURIComponent(pathname)}`;
      }, [
            authQuery.isFetching,
            authQuery.isLoading,
            pathname,
            requiresAuthentication,
            user,
      ]);

      if (!requiresAuthentication) return <>{children}</>;

      if (authQuery.isLoading || authQuery.isFetching || !user) {
            return <FullPageLoading />;
      }

      if (canAccessRoute(user, access)) return <>{children}</>;

      const homePath = getPostLoginPath(user);

      return (
            <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#fffdf8_0%,#ffffff_55%,#fff7ed_100%)] px-4">
                  <div className="w-full max-w-lg rounded-3xl border border-rose-100 bg-white p-7 text-center shadow-2xl shadow-slate-950/10">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                              <ShieldAlert className="h-7 w-7" />
                        </div>
                        <h1 className="mt-5 text-2xl font-bold text-slate-950">
                              Không có quyền truy cập
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                              Tài khoản hiện tại không được phép mở chức năng này.
                              Vui lòng quay lại khu vực làm việc đúng với vai trò của bạn.
                        </p>
                        <button
                              type="button"
                              onClick={() => navigate(homePath)}
                              className="mt-6 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                              Về trang làm việc
                        </button>
                  </div>
            </div>
      );
}
