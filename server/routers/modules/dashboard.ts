import { router } from "../../_core/trpc";
import { managerProcedure } from "../../_core/rbac";
import * as db from "../../db";
import { TRPCError } from "@trpc/server";

export const dashboardRouter = router({
  getFullDashboard: managerProcedure.query(async () => {
    try {
      const residentsStats = await db.getResidentsStats();
      const roomsStats = await db.getRoomsStats();

      return {
        residents: residentsStats,
        rooms: roomsStats,
      };
    } catch (error) {
      console.error("[dashboard.getFullDashboard] Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Không thể lấy dữ liệu dashboard",
      });
    }
  }),
});
