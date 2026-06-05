import { z } from "zod";

import { router, protectedProcedure } from "../../_core/trpc";
import { organizationService } from "../../services/organizationService";

const organizationRoleCategorySchema = z.enum([
      "management",
      "room",
      "liturgy",
      "academic",
      "activity",
      "finance",
      "discipline",
      "life",
      "other",
]);
const organizationRoleTypeSchema = z.enum([
      "head",
      "deputy",
      "secretary",
      "treasurer",
      "team_leader",
      "committee_head",
      "custom",
]);
const organizationTermStatusSchema = z.enum([
      "active",
      "inactive",
      "closed",
]);
const organizationAssignmentStatusSchema = z.enum([
      "active",
      "ended",
]);
const organizationUnitTypeSchema = z.enum(["team", "committee"]);

export const organizationRouter = router({
      ensureDefaultRoles: protectedProcedure.mutation(async () => {
            return await organizationService.ensureDefaultOrganizationRoles();
      }),

      listRoles: protectedProcedure
            .input(
                  z
                        .object({
                              search: z.string().optional(),
                              category: z
                                    .union([organizationRoleCategorySchema, z.literal("all")])
                                    .optional(),
                              isActive: z.boolean().optional(),
                              limit: z.number().min(1).max(500).optional(),
                              offset: z.number().min(0).optional(),
                        })
                        .optional()
            )
            .query(async ({ input }) => {
                  return await organizationService.listRoles(input);
            }),

      getRoleById: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                  })
            )
            .query(async ({ input }) => {
                  return await organizationService.getRoleById(input.id);
            }),

      createRole: protectedProcedure
            .input(
                  z.object({
                        code: z.string().min(1, "Vui lòng nhập mã vai trò."),
                        name: z.string().min(1, "Vui lòng nhập tên vai trò."),
                        category: organizationRoleCategorySchema.optional(),
                        description: z.string().nullable().optional(),
                        allowMultipleMembers: z.boolean().optional(),
                        isActive: z.boolean().optional(),
                        sortOrder: z.number().min(0).optional(),

                        level: z.number().int().min(1).max(3).optional(),
                        roleType: organizationRoleTypeSchema.optional(),
                        minAssignees: z.number().int().min(0).optional(),
                        maxAssignees: z.number().int().min(1).nullable().optional(),
                        isSystem: z.boolean().optional(),
                        requiresUnit: z.boolean().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.createRole(input);
            }),

      updateRole: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                        code: z.string().min(1).optional(),
                        name: z.string().min(1).optional(),
                        category: organizationRoleCategorySchema.optional(),
                        description: z.string().nullable().optional(),
                        allowMultipleMembers: z.boolean().optional(),
                        isActive: z.boolean().optional(),
                        sortOrder: z.number().min(0).optional(),

                        level: z.number().int().min(1).max(3).optional(),
                        roleType: organizationRoleTypeSchema.optional(),
                        minAssignees: z.number().int().min(0).optional(),
                        maxAssignees: z.number().int().min(1).nullable().optional(),
                        isSystem: z.boolean().optional(),
                        requiresUnit: z.boolean().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.updateRole(input);
            }),

      deleteRole: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.deleteRole(input.id);
            }),

      toggleRoleActive: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.toggleRoleActive(input.id);
            }),

      listTerms: protectedProcedure
            .input(
                  z
                        .object({
                              search: z.string().optional(),
                              status: z
                                    .union([organizationTermStatusSchema, z.literal("all")])
                                    .optional(),
                              limit: z.number().min(1).max(500).optional(),
                              offset: z.number().min(0).optional(),
                        })
                        .optional()
            )
            .query(async ({ input }) => {
                  return await organizationService.listTerms(input);
            }),

      getTermById: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                  })
            )
            .query(async ({ input }) => {
                  return await organizationService.getTermById(input.id);
            }),

      getActiveTerm: protectedProcedure.query(async () => {
            return await organizationService.getActiveTerm();
      }),

      createTerm: protectedProcedure
            .input(
                  z.object({
                        code: z.string().min(1, "Vui lòng nhập mã nhiệm kỳ."),
                        name: z.string().min(1, "Vui lòng nhập tên nhiệm kỳ."),
                        startDate: z.union([z.string(), z.date()]),
                        endDate: z.union([z.string(), z.date()]),
                        status: organizationTermStatusSchema.optional(),
                        description: z.string().nullable().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.createTerm(input);
            }),

      updateTerm: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                        code: z.string().min(1).optional(),
                        name: z.string().min(1).optional(),
                        startDate: z.union([z.string(), z.date()]).optional(),
                        endDate: z.union([z.string(), z.date()]).optional(),
                        status: organizationTermStatusSchema.optional(),
                        description: z.string().nullable().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.updateTerm(input);
            }),

      deleteTerm: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.deleteTerm(input.id);
            }),

      setActiveTerm: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.setActiveTerm(input.id);
            }),
      listAssignments: protectedProcedure
            .input(
                  z
                        .object({
                              search: z.string().optional(),
                              termId: z.number().min(1).optional(),
                              roleId: z.number().min(1).optional(),
                              residentId: z.number().min(1).optional(),
                              status: z
                                    .union([organizationAssignmentStatusSchema, z.literal("all")])
                                    .optional(),
                              limit: z.number().min(1).max(500).optional(),
                              offset: z.number().min(0).optional(),
                        })
                        .optional()
            )
            .query(async ({ input }) => {
                  return await organizationService.listAssignments(input);
            }),


      getActiveAssignmentsByResident: protectedProcedure
            .input(
                  z.object({
                        residentId: z.number().min(1, "Vui lòng chọn học viên."),
                  })
            )
            .query(async ({ input }) => {
                  return await organizationService.getActiveAssignmentsByResident(
                        input.residentId
                  );
            }),

      getAssignmentById: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                  })
            )
            .query(async ({ input }) => {
                  return await organizationService.getAssignmentById(input.id);
            }),

      createAssignment: protectedProcedure
            .input(
                  z.object({
                        termId: z.number().min(1, "Vui lòng chọn nhiệm kỳ."),
                        roleId: z.number().min(1, "Vui lòng chọn vai trò."),
                        residentId: z.number().min(1, "Vui lòng chọn học viên."),
                        roomId: z.number().min(1).nullable().optional(),
                        unitId: z.number().min(1).nullable().optional(),
                        assignmentTitle: z.string().trim().max(255).nullable().optional(),
                        startDate: z.union([z.string(), z.date()]),
                        endDate: z.union([z.string(), z.date()]).nullable().optional(),
                        status: organizationAssignmentStatusSchema.optional(),
                        notes: z.string().nullable().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.createAssignment(input);
            }),

      updateAssignment: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                        termId: z.number().min(1).optional(),
                        roleId: z.number().min(1).optional(),
                        residentId: z.number().min(1).optional(),
                        roomId: z.number().min(1).nullable().optional(),
                        unitId: z.number().min(1).nullable().optional(),
                        assignmentTitle: z.string().trim().max(255).nullable().optional(),
                        startDate: z.union([z.string(), z.date()]).optional(),
                        endDate: z.union([z.string(), z.date()]).nullable().optional(),
                        status: organizationAssignmentStatusSchema.optional(),
                        notes: z.string().nullable().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.updateAssignment(input);
            }),

      endAssignment: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.endAssignment(input.id);
            }),

      deleteAssignment: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.deleteAssignment(input.id);
            }),
      /* =========================================================
* UNITS - TỔ / BAN
* ======================================================= */

      listUnits: protectedProcedure
            .input(
                  z
                        .object({
                              search: z.string().optional(),
                              unitType: z
                                    .union([organizationUnitTypeSchema, z.literal("all")])
                                    .optional(),
                              isActive: z.boolean().optional(),
                              limit: z.number().min(1).max(500).optional(),
                              offset: z.number().min(0).optional(),
                        })
                        .optional()
            )
            .query(async ({ input }) => {
                  return await organizationService.listUnits(input);
            }),

      getUnitById: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                  })
            )
            .query(async ({ input }) => {
                  return await organizationService.getUnitById(input.id);
            }),

      createUnit: protectedProcedure
            .input(
                  z.object({
                        code: z.string().min(1, "Vui lòng nhập mã Tổ/Ban."),
                        name: z.string().min(1, "Vui lòng nhập tên Tổ/Ban."),
                        unitType: organizationUnitTypeSchema,
                        description: z.string().nullable().optional(),
                        isActive: z.boolean().optional(),
                        sortOrder: z.number().min(0).optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.createUnit(input);
            }),

      updateUnit: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                        code: z.string().min(1).optional(),
                        name: z.string().min(1).optional(),
                        unitType: organizationUnitTypeSchema.optional(),
                        description: z.string().nullable().optional(),
                        isActive: z.boolean().optional(),
                        sortOrder: z.number().min(0).optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.updateUnit(input);
            }),

      deleteUnit: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.deleteUnit(input.id);
            }),

      toggleUnitActive: protectedProcedure
            .input(
                  z.object({
                        id: z.number().min(1),
                  })
            )
            .mutation(async ({ input }) => {
                  return await organizationService.toggleUnitActive(input.id);
            }),
});