import { z } from "zod";
import { router } from "../_core/trpc";
import { managerProcedure, supervisorProcedure } from "../_core/rbac";
import * as db from "../db";

const schoolSchema = z.object({
  name: z.string().min(1, "Tên trường không được trống"),
  type: z.enum(["high_school", "college", "university"]),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
});

const programSchema = z.object({
  schoolId: z.number(),
  name: z.string().min(1, "Tên chương trình không được trống"),
  code: z.string().optional(),
});

export const schoolsRouter = router({
  listSchools: supervisorProcedure.query(async () => {
    return await db.getSchools();
  }),

  getSchoolById: supervisorProcedure.input(z.number()).query(async ({ input }) => {
    const school = await db.getSchoolById(input);
    if (!school) {
      throw new Error("Trường không tìm thấy");
    }
    return school;
  }),

  createSchool: managerProcedure
    .input(schoolSchema)
    .mutation(async ({ input }) => {
      await db.createSchool({
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      return {
        success: true,
        message: "Thêm trường thành công",
      };
    }),

  getProgramsBySchool: supervisorProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await db.getProgramsBySchool(input);
    }),

  createProgram: managerProcedure
    .input(programSchema)
    .mutation(async ({ input }) => {
      await db.createProgram({
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      return {
        success: true,
        message: "Thêm chương trình học thành công",
      };
    }),
});
