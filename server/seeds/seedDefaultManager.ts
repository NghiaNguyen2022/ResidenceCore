import { and, eq } from "drizzle-orm";
import { getDb } from "../db/connection";
import { hashPassword } from "../_core/password";
import { roles, userRoles, users } from "../../drizzle/schema";

async function seedDefaultManager() {
      const db = await getDb();

      if (!db) {
            throw new Error("Database connection is not available.");
      }

      const [managerRole] = await db
            .select({
                  id: roles.id,
                  roleKey: roles.roleKey,
            })
            .from(roles)
            .where(eq(roles.roleKey, "manager"))
            .limit(1);

      if (!managerRole) {
            throw new Error(
                  "Role manager does not exist. Please run roles migration first."
            );
      }

      const [existingAdminUser] = await db
            .select({
                  id: users.id,
                  username: users.username,
            })
            .from(users)
            .where(eq(users.username, "admin"))
            .limit(1);

      let adminUserId: number;

      if (existingAdminUser) {
            adminUserId = existingAdminUser.id;

            await db
                  .update(users)
                  .set({
                        role: "manager",
                        isActive: true,
                        mustChangePassword: true,
                  })
                  .where(eq(users.id, adminUserId));
      } else {
            const passwordHash = await hashPassword("admin");

            await db.insert(users).values({
                  username: "admin",
                  passwordHash,
                  name: "Quản lý hệ thống",
                  email: null,
                  role: "manager",
                  isActive: true,
                  mustChangePassword: true,
            });

            const [createdAdminUser] = await db
                  .select({
                        id: users.id,
                        username: users.username,
                  })
                  .from(users)
                  .where(eq(users.username, "admin"))
                  .limit(1);

            if (!createdAdminUser) {
                  throw new Error("Cannot create default admin user.");
            }

            adminUserId = createdAdminUser.id;
      }

      await db
            .update(userRoles)
            .set({
                  isPrimary: false,
            })
            .where(eq(userRoles.userId, adminUserId));

      const [existingManagerRole] = await db
            .select({
                  id: userRoles.id,
            })
            .from(userRoles)
            .where(
                  and(
                        eq(userRoles.userId, adminUserId),
                        eq(userRoles.roleId, managerRole.id)
                  )
            )
            .limit(1);

      if (existingManagerRole) {
            await db
                  .update(userRoles)
                  .set({
                        isPrimary: true,
                  })
                  .where(eq(userRoles.id, existingManagerRole.id));
      } else {
            await db.insert(userRoles).values({
                  userId: adminUserId,
                  roleId: managerRole.id,
                  isPrimary: true,
                  assignedBy: null,
            });
      }

      console.log("Default manager user has been seeded successfully.");
      console.log("Username: admin");
      console.log("Default password: admin");
      console.log("Role: manager");
      console.log("mustChangePassword: true");
}

seedDefaultManager()
      .then(() => {
            process.exit(0);
      })
      .catch((error) => {
            console.error("Failed to seed default manager user:", error);
            process.exit(1);
      });