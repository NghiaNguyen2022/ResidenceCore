import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import * as db from "./db";
import { sdk } from "./_core/sdk";
import { dutiesRouter } from "./routers/duties";

/**
 * ============================================
 * ROOMS ROUTER - QUẢN LÝ PHÒNG
 * ============================================
 */
const roomsRouter = router({
  /**
   * Lấy danh sách phòng
   */
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
        const rooms = await db.getRoomsWithDetails({
          search: input?.search,
          capacity: input?.capacity,
          groupId: input?.groupId,
          limit: input?.limit || 50,
          offset: input?.offset || 0,
        });

        return rooms;
      } catch (error) {
        console.error("[rooms.list] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch rooms",
        });
      }
    }),

  /**
   * Lấy chi tiết phòng
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const room = await db.getRoomDetails(input.id);
        if (!room) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Room not found",
          });
        }

        return room;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[rooms.getById] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch room details",
        });
      }
    }),

  /**
   * Tạo phòng mới
   */
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
        const result = await db.createRoom(input);
        const roomId = result.insertId;
        const room = await db.getRoomById(roomId);

        return room;
      } catch (error) {
        console.error("[rooms.create] Error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to create room",
        });
      }
    }),

  /**
   * Cập nhật phòng
   */
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

        await db.updateRoom(id, updateData);

        const room = await db.getRoomById(id);
        if (!room) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Room not found",
          });
        }

        return room;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[rooms.update] Error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to update room",
        });
      }
    }),

  /**
   * Xóa phòng
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await db.deleteRoom(input.id);
        return { success: true };
      } catch (error) {
        console.error("[rooms.delete] Error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to delete room",
        });
      }
    }),

  /**
   * Lấy stats phòng
   */
  getStats: protectedProcedure.query(async () => {
    try {
      const stats = await db.getRoomsStats();
      return stats;
    } catch (error) {
      console.error("[rooms.getStats] Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch stats",
      });
    }
  }),

  /**
   * Lấy danh sách học viên trong phòng
   */
  getResidents: protectedProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ input }) => {
      try {
        const residents = await db.getResidentsInRoom(input.roomId);
        return residents;
      } catch (error) {
        console.error("[rooms.getResidents] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch room residents",
        });
      }
    }),

  /**
   * Gán học viên vào phòng
   */
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
        const resident = await db.getResidentById(input.residentId);
        if (!resident) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Resident not found",
          });
        }

        const room = await db.getRoomById(input.roomId);
        if (!room) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Room not found",
          });
        }

        await db.assignResidentToRoom({
          residentId: input.residentId,
          roomId: input.roomId,
          assignedDate: new Date(),
          eventType: input.eventType,
          reason: input.reason,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[rooms.assignResident] Error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to assign resident",
        });
      }
    }),

  /**
   * Bổ nhiệm trưởng phòng
   */
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
        await db.appointRoomLeader({
          roomId: input.roomId,
          residentId: input.residentId,
          appointedDate: new Date(),
          notes: input.notes,
        });

        return { success: true };
      } catch (error) {
        console.error("[rooms.appointLeader] Error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to appoint leader",
        });
      }
    }),

  /**
   * Lấy trưởng phòng hiện tại
   */
  getLeader: protectedProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ input }) => {
      try {
        const leader = await db.getRoomLeader(input.roomId);
        return leader;
      } catch (error) {
        console.error("[rooms.getLeader] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch room leader",
        });
      }
    }),

  /**
   * Lấy lịch sử trưởng phòng
   */
  getLeaderHistory: protectedProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ input }) => {
      try {
        const history = await db.getRoomLeaderHistory(input.roomId);
        return history;
      } catch (error) {
        console.error("[rooms.getLeaderHistory] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch leader history",
        });
      }
    }),
});

/**
 * ============================================
 * MAIN APP ROUTER
 * ============================================
 */
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByUsername(input.username);

        if (!user) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Username hoặc password không đúng" });
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isPasswordValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Username hoặc password không đúng" });
        }

        const sessionToken = await sdk.createSessionToken(user.id, user.username, { name: user.name || "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return { user };
      }),

    register: publicProcedure
      .input(z.object({ username: z.string(), password: z.string(), name: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const existingUser = await db.getUserByUsername(input.username);
        if (existingUser) {
          throw new TRPCError({ code: "CONFLICT", message: "Username đã tồn tại" });
        }

        const passwordHash = await bcrypt.hash(input.password, 10);

        await db.upsertUser({
          username: input.username,
          passwordHash,
          name: input.name || null,
        });

        // Wait for database to sync
        await new Promise(resolve => setTimeout(resolve, 100));

        const user = await db.getUserByUsername(input.username);

        if (!user) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Không thể tạo tài khoản" });
        }

        const sessionToken = await sdk.createSessionToken(user.id, user.username, { name: user.name || "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return { user };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Dashboard Router
   */
  dashboard: router({
    getFullDashboard: protectedProcedure.query(async ({ ctx }) => {
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
  }),

  /**
   * Members Router
   */
  members: router({
    list: protectedProcedure
      .input(
        z.object({
          status: z.enum(["active", "inactive", "transferred_out"]).optional(),
          search: z.string().optional(),
          limit: z.number().default(50),
          offset: z.number().default(0),
        }).optional()
      )
      .query(async ({ input }) => {
        const residents = await db.getResidents({
          status: input?.status,
          search: input?.search,
          limit: input?.limit,
          offset: input?.offset,
        });

        return residents;
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const resident = await db.getResidentById(input.id);
        if (!resident) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Member not found",
          });
        }

        const parents = await db.getParentsByResidentId(input.id);

        return {
          ...resident,
          parents,
        };
      }),

    create: protectedProcedure
      .input(
        z.object({
          fullName: z.string().min(1, "Tên không được để trống"),
          dateOfBirth: z.date().optional(),
          gender: z.enum(["male", "female", "other"]).optional(),
          idNumber: z.string().optional(),
          permanentAddress: z.string().optional(),
          phoneNumber: z.string().optional(),
          schoolId: z.number().optional(),
          profileImage: z.string().optional(),
          admissionDate: z.date(),
          notes: z.string().optional(),
          parents: z
            .array(
              z.object({
                parentType: z.enum(["father", "mother", "guardian"]),
                fullName: z.string(),
                phoneNumber: z.string().optional(),
                email: z.string().optional(),
                idNumber: z.string().optional(),
                occupation: z.string().optional(),
                address: z.string().optional(),
                notes: z.string().optional(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await db.createResident({
            fullName: input.fullName,
            dateOfBirth: input.dateOfBirth,
            gender: input.gender,
            idNumber: input.idNumber,
            permanentAddress: input.permanentAddress,
            phoneNumber: input.phoneNumber,
            schoolId: input.schoolId,
            profileImage: input.profileImage,
            admissionDate: input.admissionDate,
            notes: input.notes,
          });

          const residentId = result.insertId;

          if (input.parents && input.parents.length > 0) {
            for (const parent of input.parents) {
              await db.createParent({
                residentId,
                parentType: parent.parentType,
                fullName: parent.fullName,
                phoneNumber: parent.phoneNumber,
                email: parent.email,
                idNumber: parent.idNumber,
                occupation: parent.occupation,
                address: parent.address,
                notes: parent.notes,
              });
            }
          }

          const newResident = await db.getResidentById(residentId);
          const parents = await db.getParentsByResidentId(residentId);

          return {
            ...newResident,
            parents,
          };
        } catch (error) {
          console.error("[members.create] Error:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Failed to create member",
          });
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          fullName: z.string().optional(),
          dateOfBirth: z.date().optional(),
          gender: z.enum(["male", "female", "other"]).optional(),
          idNumber: z.string().optional(),
          permanentAddress: z.string().optional(),
          phoneNumber: z.string().optional(),
          schoolId: z.number().optional(),
          profileImage: z.string().optional(),
          admissionDate: z.date().optional(),
          notes: z.string().optional(),
          status: z.enum(["active", "inactive", "transferred_out"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { id, ...updateData } = input;

          await db.updateResident(id, updateData);

          const updatedResident = await db.getResidentById(id);
          if (!updatedResident) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Member not found",
            });
          }

          const parents = await db.getParentsByResidentId(id);

          return {
            ...updatedResident,
            parents,
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[members.update] Error:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Failed to update member",
          });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await db.deleteResident(input.id);
          return { success: true };
        } catch (error) {
          console.error("[members.delete] Error:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Failed to delete member",
          });
        }
      }),

    markAsLeft: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          departureDate: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await db.markResidentAsLeft(input.id, input.departureDate);
          return { success: true };
        } catch (error) {
          console.error("[members.markAsLeft] Error:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Failed to mark member as left",
          });
        }
      }),

    assignRoom: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          roomId: z.number(),
          eventType: z.enum(["new_entry", "transfer", "temporary_leave", "left"]).default("new_entry"),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const resident = await db.getResidentById(input.id);
          if (!resident) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Member not found",
            });
          }

          await db.assignResidentToRoom({
            residentId: input.id,
            roomId: input.roomId,
            assignedDate: new Date(),
            eventType: input.eventType,
            reason: input.reason,
          });

          return { success: true };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[members.assignRoom] Error:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Failed to assign room",
          });
        }
      }),

    getStats: protectedProcedure.query(async () => {
      try {
        const stats = await db.getResidentsStats();
        return stats;
      } catch (error) {
        console.error("[members.getStats] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch stats",
        });
      }
    }),

    getParents: protectedProcedure
      .input(z.object({ residentId: z.number() }))
      .query(async ({ input }) => {
        try {
          const parents = await db.getParentsByResidentId(input.residentId);
          return parents;
        } catch (error) {
          console.error("[members.getParents] Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch parents",
          });
        }
      }),

    createParent: protectedProcedure
      .input(
        z.object({
          residentId: z.number(),
          parentType: z.enum(["father", "mother", "guardian"]),
          fullName: z.string().min(1, "Tên không được để trống"),
          phoneNumber: z.string().optional(),
          email: z.string().optional(),
          idNumber: z.string().optional(),
          occupation: z.string().optional(),
          address: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await db.createParent(input);
          const parentId = result.insertId;
          const parent = await db.getParentById(parentId);
          return parent;
        } catch (error) {
          console.error("[members.createParent] Error:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Failed to create parent",
          });
        }
      }),

    updateParent: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          parentType: z.enum(["father", "mother", "guardian"]).optional(),
          fullName: z.string().optional(),
          phoneNumber: z.string().optional(),
          email: z.string().optional(),
          idNumber: z.string().optional(),
          occupation: z.string().optional(),
          address: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { id, ...updateData } = input;
          await db.updateParent(id, updateData);
          const parent = await db.getParentById(id);
          return parent;
        } catch (error) {
          console.error("[members.updateParent] Error:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Failed to update parent",
          });
        }
      }),

    deleteParent: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await db.deleteParent(input.id);
          return { success: true };
        } catch (error) {
          console.error("[members.deleteParent] Error:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Failed to delete parent",
          });
        }
      }),
  }),

  /**
   * Rooms Router
   */
  rooms: roomsRouter,
  duties: dutiesRouter,
});

export type AppRouter = typeof appRouter;