import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { isManager } from "../../_core/rbac";
import { router } from "../../_core/trpc";
import { managerProcedure } from "../../_core/rbac";
import { createSkill, deleteSkill, listSkills, updateSkill } from "../../db/skills";

function requireManager(user: any) {
      if (!isManager(user)) throw new TRPCError({ code: "FORBIDDEN", message: "Bạn không có quyền quản lý kỹ năng." });
}
const payload = z.object({
      code: z.string().trim().min(1).max(50), name: z.string().trim().min(1).max(255),
      category: z.enum(["life", "communication", "learning", "leadership", "digital", "career", "spiritual", "community", "other"]),
      level: z.enum(["basic", "intermediate", "advanced"]), status: z.enum(["active", "inactive"]),
      description: z.string().optional().nullable(), objective: z.string().optional().nullable(),
      evaluationCriteria: z.string().optional().nullable(), suggestedDuration: z.string().max(100).optional().nullable(),
      ownerGroup: z.string().max(255).optional().nullable(), note: z.string().optional().nullable(),
      sortOrder: z.number().int().min(0),
});
export const skillsRouter = router({
      list: managerProcedure.query(({ ctx }) => { requireManager(ctx.user); return listSkills(); }),
      create: managerProcedure.input(payload).mutation(({ ctx, input }) => { requireManager(ctx.user); return createSkill(input); }),
      update: managerProcedure.input(payload.and(z.object({ id: z.number().int().positive() }))).mutation(({ ctx, input }) => {
            requireManager(ctx.user); const { id, ...data } = input; return updateSkill(id, data);
      }),
      delete: managerProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
            requireManager(ctx.user);
            try { return await deleteSkill(input.id); } catch (error) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Không thể xóa kỹ năng." });
            }
      }),
});
