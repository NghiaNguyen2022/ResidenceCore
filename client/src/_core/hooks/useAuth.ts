import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      console.log("[useAuth] Logout mutation success");
      utils.auth.me.setData(undefined, null);
    },
    onError: (error) => {
      console.error("[useAuth] Logout mutation error:", error);
    },
  });

  const logout = useCallback(async () => {
    try {
      console.log("[useAuth] Starting logout...");
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      console.error("[useAuth] Logout error caught:", error);
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        console.log("[useAuth] Already unauthorized");
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    const userData = meQuery.data ?? null;
    
    // Save to localStorage for persistence
    if (userData) {
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(userData)
      );
    }

    return {
      user: userData,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(userData),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  // Debug logs
  useEffect(() => {
    console.log("[useAuth] State updated:", {
      isAuthenticated: state.isAuthenticated,
      user: state.user?.username,
      loading: state.loading,
    });
  }, [state]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    console.log("[useAuth] Redirecting to login:", redirectPath);
    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => {
      console.log("[useAuth] Refreshing auth state...");
      return meQuery.refetch();
    },
    logout,
  };
}
