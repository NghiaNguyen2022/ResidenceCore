/**
 * App Settings and Display Mode Database Functions
 */

import { getDb } from "./connection";
import {
      appSettings,
      moduleDisplayModes,
      DisplayMode,
      InsertAppSetting,
      InsertModuleDisplayMode,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function getAppSetting(settingKey: string) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.select().from(appSettings).where(eq(appSettings.settingKey, settingKey)).limit(1);
            return result.length > 0 ? result[0] : null;
      } catch (error) {
            console.error("[Database] Failed to get app setting:", error);
            throw error;
      }
}

export async function upsertAppSetting(data: InsertAppSetting) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const existing = await getAppSetting(data.settingKey);
            if (existing) {
                  await db.update(appSettings).set({ value: data.value }).where(eq(appSettings.settingKey, data.settingKey));
                  return existing;
            }

            const result = await db.insert(appSettings).values(data);
            return result;
      } catch (error) {
            console.error("[Database] Failed to upsert app setting:", error);
            throw error;
      }
}

export async function getModuleDisplayMode(moduleKey: string) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.select().from(moduleDisplayModes).where(eq(moduleDisplayModes.moduleKey, moduleKey)).limit(1);
            return result.length > 0 ? result[0] : null;
      } catch (error) {
            console.error("[Database] Failed to get module display mode:", error);
            throw error;
      }
}

export async function setModuleDisplayMode(moduleKey: string, mode: DisplayMode) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const existing = await getModuleDisplayMode(moduleKey);
            if (existing) {
                  await db.update(moduleDisplayModes).set({ mode }).where(eq(moduleDisplayModes.moduleKey, moduleKey));
                  return existing;
            }

            const result = await db.insert(moduleDisplayModes).values({ moduleKey, mode });
            return result;
      } catch (error) {
            console.error("[Database] Failed to set module display mode:", error);
            throw error;
      }
}

export async function getEffectiveDisplayMode(moduleKey: string) {
      const moduleMode = await getModuleDisplayMode(moduleKey);
      if (moduleMode) {
            return moduleMode.mode;
      }

      const defaultMode = await getAppSetting("defaultDisplayMode");
      return (defaultMode?.value as DisplayMode) || "detailed";
}
