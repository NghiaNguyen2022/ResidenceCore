import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { isManager } from "../../_core/rbac";
import { protectedProcedure, router } from "../../_core/trpc";
import { createClub, deleteClub, listClubs, updateClub } from "../../db/clubs";

function requireClubManager(user: { role?: string | null; roles?: string[] | null } | null | undefined) {
      if (!isManager(user)) {
            throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Bạn không có quyền quản lý câu lạc bộ.",
            });
      }
}

const clubPayloadSchema = z
      .object({
            code: z.string().trim().min(1).max(50),
            name: z.string().trim().min(1).max(255),
            clubType: z.enum(["study", "music", "sports", "art", "volunteer", "spiritual", "skill", "other"]),
            status: z.enum(["active", "inactive", "paused"]),
            leaderName: z.string().trim().max(255).optional().nullable(),
            mentorName: z.string().trim().max(255).optional().nullable(),
            meetingSchedule: z.string().trim().max(255).optional().nullable(),
            location: z.string().trim().max(255).optional().nullable(),
            memberCount: z.number().int().min(0),
            maxMembers: z.number().int().min(0),
            objective: z.string().trim().optional().nullable(),
            note: z.string().trim().optional().nullable(),
            sortOrder: z.number().int().min(0),
      })
      .refine((data) => data.maxMembers === 0 || data.memberCount <= data.maxMembers, {
            message: "Số thành viên hiện tại không được lớn hơn số thành viên tối đa.",
            path: ["memberCount"],
      });

export const clubsRouter = router({
      list: protectedProcedure.query(async ({ ctx }) => {
            requireClubManager(ctx.user);
            return listClubs();
      }),
      create: protectedProcedure.input(clubPayloadSchema).mutation(async ({ ctx, input }) => {
            requireClubManager(ctx.user);
            return createClub(input);
      }),
      update: protectedProcedure
            .input(clubPayloadSchema.and(z.object({ id: z.number().int().positive() })))
            .mutation(async ({ ctx, input }) => {
                  requireClubManager(ctx.user);
                  const { id, ...data } = input;
                  return updateClub(id, data);
            }),
      delete: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .mutation(async ({ ctx, input }) => {
                  requireClubManager(ctx.user);
                  return deleteClub(input.id);
            }),
});
