import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { roomService } from "../../services/roomService";

export const roomsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        capacity: z.number().optional(),
        groupId: z.number().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      try {
        return await roomService.listRooms({
          search: input?.search,
          capacity: input?.capacity,
          groupId: input?.groupId,
          limit: input?.limit,
          offset: input?.offset,
        });
      } catch (error) {
        console.error("[rooms.list] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch rooms",
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        return await roomService.getRoomById(input.id);
      } catch (error) {
        console.error("[rooms.getById] Error:", error);
        if (error instanceof Error && error.message === "Room not found") {
          throw new TRPCError({ code: "NOT_FOUND", message: error.message });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch room details",
        });
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        roomCode: z.string().min(1, "Mã phòng không được để trống"),
        capacity: z.number().min(1, "Sức chứa phải lớn hơn 0"),
        groupId: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await roomService.createRoom(input);
      } catch (error) {
        console.error("[rooms.create] Error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to create room",
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        capacity: z.number().optional(),
        groupId: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;
        return await roomService.updateRoom(id, updateData);
      } catch (error) {
        console.error("[rooms.update] Error:", error);
        if (error instanceof Error && error.message === "Room not found") {
          throw new TRPCError({ code: "NOT_FOUND", message: error.message });
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to update room",
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        return await roomService.deleteRoom(input.id);
      } catch (error) {
        console.error("[rooms.delete] Error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to delete room",
        });
      }
    }),

  getStats: protectedProcedure.query(async () => {
    try {
      return await roomService.getStats();
    } catch (error) {
      console.error("[rooms.getStats] Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch stats",
      });
    }
  }),

  getResidents: protectedProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ input }) => {
      try {
        return await roomService.getResidents(input.roomId);
      } catch (error) {
        console.error("[rooms.getResidents] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch room residents",
        });
      }
    }),

  assignResident: protectedProcedure
    .input(
      z.object({
        residentId: z.number(),
        roomId: z.number(),
        eventType: z.enum(["new_entry", "transfer", "temporary_leave", "left"]).default("new_entry"),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await roomService.assignResident(input);
      } catch (error) {
        console.error("[rooms.assignResident] Error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to assign resident",
        });
      }
    }),

  appointLeader: protectedProcedure
    .input(
      z.object({
        roomId: z.number(),
        residentId: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await roomService.appointLeader(input);
      } catch (error) {
        console.error("[rooms.appointLeader] Error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to appoint leader",
        });
      }
    }),

  getLeader: protectedProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ input }) => {
      try {
        return await roomService.getLeader(input.roomId);
      } catch (error) {
        console.error("[rooms.getLeader] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch room leader",
        });
      }
    }),

  getLeaderHistory: protectedProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ input }) => {
      try {
        return await roomService.getLeaderHistory(input.roomId);
      } catch (error) {
        console.error("[rooms.getLeaderHistory] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch leader history",
        });
      }
    }),
});
