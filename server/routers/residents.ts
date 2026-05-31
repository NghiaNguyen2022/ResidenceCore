import { z } from "zod";
import { router } from "../_core/trpc";
import { managerProcedure, supervisorProcedure } from "../_core/rbac";
import * as db from "../db";

const residentSchema = z.object({
  fullName: z.string().min(1, "Tên không được trống"),
  dateOfBirth: z.date().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  idNumber: z.string().optional(),
  permanentAddress: z.string().optional(),
  phoneNumber: z.string().optional(),
  notes: z.string().optional(),
});

const roomAssignmentSchema = z.object({
  residentId: z.number(),
  roomId: z.number(),
  reason: z.string().optional(),
});

export const residentsRouter = router({
  list: supervisorProcedure
    .input(
      z.object({
        status: z.enum(["active", "inactive", "transferred_out"]).optional(),
        roomId: z.number().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await db.getResidents({
        status: input.status,
        roomId: input.roomId,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  getById: supervisorProcedure.input(z.number()).query(async ({ input }) => {
    const resident = await db.getResidentById(input);
    if (!resident) {
      throw new Error("Cư dân không tìm thấy");
    }
    return resident;
  }),

  create: managerProcedure
    .input(residentSchema)
    .mutation(async ({ input }) => {
      await db.createResident({
        ...input,
        status: "active",
        admissionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: undefined,
        currentRoomId: undefined,
        departureDate: undefined,
      } as any);

      return {
        success: true,
        message: "Thêm cư dân thành công",
      };
    }),

  update: managerProcedure
    .input(
      z.object({
        id: z.number(),
        data: residentSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateResident(input.id, {
        ...input.data,
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Cập nhật thông tin cư dân thành công",
      };
    }),

  deactivate: managerProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      await db.updateResident(input, {
        status: "inactive",
        departureDate: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Vô hiệu hóa cư dân thành công",
      };
    }),

  getAcademicInfo: supervisorProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await db.getResidentAcademicInfo(input);
    }),

  addAcademicInfo: managerProcedure
    .input(
      z.object({
        residentId: z.number(),
        schoolId: z.number(),
        programId: z.number(),
        class: z.string(),
        academicYear: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.createResidentAcademicInfo({
        ...input,
        enrollmentDate: new Date(),
        status: "enrolled",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      return {
        success: true,
        message: "Thêm thông tin học tập thành công",
      };
    }),

  getRoomHistory: supervisorProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await db.getRoomAssignmentHistory(input);
    }),

  assignRoom: managerProcedure
    .input(roomAssignmentSchema)
    .mutation(async ({ input, ctx }) => {
      const room = await db.getRoomById(input.roomId);
      if (!room) {
        throw new Error("Phòng không tìm thấy");
      }

      if (room.currentOccupancy >= room.capacity) {
        throw new Error("Phòng đã đầy");
      }

      const resident = await db.getResidentById(input.residentId);
      if (!resident) {
        throw new Error("Cư dân không tìm thấy");
      }

      if (resident.currentRoomId) {
        const oldRoom = await db.getRoomById(resident.currentRoomId);
        if (oldRoom) {
          await db.updateRoom(resident.currentRoomId, {
            currentOccupancy: Math.max(0, oldRoom.currentOccupancy - 1),
          });
        }

        await db.createRoomAssignment({
          residentId: input.residentId,
          roomId: resident.currentRoomId,
          releaseDate: new Date(),
          reason: "Chuyển phòng",
          assignedBy: ctx.user.id,
          createdAt: new Date(),
        } as any);
      }

      await db.updateResident(input.residentId, {
        currentRoomId: input.roomId,
        updatedAt: new Date(),
      });

      await db.updateRoom(input.roomId, {
        currentOccupancy: room.currentOccupancy + 1,
      });

      await db.createRoomAssignment({
        residentId: input.residentId,
        roomId: input.roomId,
        assignmentDate: new Date(),
        reason: input.reason || "Xếp phòng",
        assignedBy: ctx.user.id,
        createdAt: new Date(),
      } as any);

      return {
        success: true,
        message: "Xếp phòng thành công",
      };
    }),

  getActiveCount: supervisorProcedure.query(async () => {
    return await db.getActiveResidentsCount();
  }),
});
