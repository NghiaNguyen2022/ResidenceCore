import { asc, eq } from "drizzle-orm";
import { skills, type InsertSkill } from "../../drizzle/schema";
import { getDb } from "./connection";

export const listSkills = () => getDb().select().from(skills).orderBy(asc(skills.sortOrder), asc(skills.name));
export async function createSkill(data: InsertSkill) {
      const result = await getDb().insert(skills).values(data);
      return { id: Number(result[0].insertId) };
}
export async function updateSkill(id: number, data: Partial<InsertSkill>) {
      await getDb().update(skills).set(data).where(eq(skills.id, id));
      return { success: true };
}
export async function deleteSkill(id: number) {
      const target = await getDb().select({ classCount: skills.classCount, completedCount: skills.completedCount })
            .from(skills).where(eq(skills.id, id)).limit(1);
      if (target[0] && (target[0].classCount > 0 || target[0].completedCount > 0)) {
            throw new Error("Không thể xóa kỹ năng đã có lớp hoặc kết quả hoàn thành.");
      }
      await getDb().delete(skills).where(eq(skills.id, id));
      return { success: true };
}
