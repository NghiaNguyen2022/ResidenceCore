import { z } from "zod";
import { router } from "../_core/trpc";
import { managerProcedure, supervisorProcedure } from "../_core/rbac";
import * as db from "../db";

const roomSchema = z.object({
  roomCode: z.string().min(1, "Mã phòng không được trống"),
  roomName: z.string().min(1, "Tên phòng không được trống"),
  floor: z.number().optional(),
  zone: z.string().optional(),
  gender: z.enum(["male", "female", "mixed"]).optional(),
  capacity: z.number().min(1, "Sức chứa phải lớn hơn 0"),
});

export const roomsRouter = router({
  list: supervisorProcedure
    .input(
      z.object({
        status: z.enum(["available", "full", "maintenance", "closed"]).optional(),
        gender: z.enum(["male", "female", "mixed"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await db.getRooms({
        status: input.status,
        gender: input.gender,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  getById: supervisorProcedure.input(z.number()).query(async ({ input }) => {
    const room = await db.getRoomById(input);
    if (!room) {
      throw new Error("Phòng không tìm thấy");
    }
    return room;
  }),

  create: managerProcedure
    .input(roomSchema)
    .mutation(async ({ input }) => {
      await db.createRoom({
        ...input,
        currentOccupancy: 0,
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      return {
        success: true,
        message: "Thêm phòng thành công",
      };
    }),

  update: managerProcedure
    .input(
      z.object({
        id: z.number(),
        data: roomSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateRoom(input.id, {
        ...input.data,
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Cập nhật thông tin phòng thành công",
      };
    }),

  updateStatus: managerProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["available", "full", "maintenance", "closed"]),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateRoom(input.id, {
        status: input.status,
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Cập nhật trạng thái phòng thành công",
      };
    }),

  getOccupancyStats: supervisorProcedure.query(async () => {
    const rooms = await db.getRoomOccupancyStats();

    const stats = {
      totalRooms: rooms.length,
      totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
      totalOccupancy: rooms.reduce((sum, r) => sum + r.currentOccupancy, 0),
      availableRooms: rooms.filter((r) => r.status === "available").length,
      fullRooms: rooms.filter((r) => r.status === "full").length,
      maintenanceRooms: rooms.filter((r) => r.status === "maintenance").length,
      occupancyRate: 0,
      rooms: rooms,
    };

    if (stats.totalCapacity > 0) {
      stats.occupancyRate = Math.round((stats.totalOccupancy / stats.totalCapacity) * 100);
    }

    return stats;
  }),

  getByZone: supervisorProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const rooms = await db.getRooms();
      return rooms.filter((r) => r.zone === input);
    }),

  getByGender: supervisorProcedure
    .input(z.enum(["male", "female", "mixed"]))
    .query(async ({ input }) => {
      return await db.getRooms({ gender: input });
    }),

  getAvailableRooms: supervisorProcedure.query(async () => {
    const rooms = await db.getRooms({ status: "available" });
    return rooms.filter((r) => r.currentOccupancy < r.capacity);
  }),
});
