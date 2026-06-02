'use client';

import { trpc } from "@/lib/trpc";

export type SystemDisplayMode = "simple" | "detailed";

export function useSystemDisplayMode() {
      const query = trpc.system.getDisplayMode.useQuery(undefined, {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
      });

      const mode = (query.data?.mode ?? "simple") as SystemDisplayMode;

      return {
            mode,
            isSimple: mode === "simple",
            isDetailed: mode === "detailed",
            isLoading: query.isLoading,
      };
}