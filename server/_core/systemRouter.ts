import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./trpc";
import {
      getAppSetting,
      upsertAppSetting,
      getEffectiveDisplayMode,
      getModuleDisplayMode,
      setModuleDisplayMode,
} from "../db/appSettings";

export const systemRouter = router({
      health: publicProcedure
            .input(
                  z.object({
                        timestamp: z.number().min(0, "timestamp cannot be negative"),
                  })
            )
            .query(() => ({
                  ok: true,
            })),

      notifyOwner: adminProcedure
            .input(
                  z.object({
                        title: z.string().min(1, "title is required"),
                        content: z.string().min(1, "content is required"),
                  })
            )
            .mutation(async ({ input }) => {
                  const delivered = await notifyOwner(input);
                  return {
                        success: delivered,
                  } as const;
            }),

      getDisplayMode: protectedProcedure
            .input(z.object({ moduleKey: z.string().optional() }).optional())
            .query(async ({ input }) => {
                  const moduleKey = input?.moduleKey;
                  if (moduleKey) {
                        const mode = await getEffectiveDisplayMode(moduleKey);
                        return { moduleKey, mode } as const;
                  }

                  const defaultMode = await getAppSetting("defaultDisplayMode");
                  return {
                        moduleKey: null,
                        mode: (defaultMode?.value as "simple" | "detailed") || "detailed",
                  } as const;
            }),

      setDisplayMode: adminProcedure
            .input(z.object({ mode: z.enum(["simple", "detailed"]) }))
            .mutation(async ({ input }) => {
                  await upsertAppSetting({ settingKey: "defaultDisplayMode", value: input.mode });
                  return { mode: input.mode } as const;
            }),

      getModuleDisplayMode: protectedProcedure
            .input(z.object({ moduleKey: z.string().min(1) }))
            .query(async ({ input }) => {
                  const displayMode = await getModuleDisplayMode(input.moduleKey);
                  return {
                        moduleKey: input.moduleKey,
                        mode: displayMode?.mode || null,
                  } as const;
            }),

      setModuleDisplayMode: adminProcedure
            .input(z.object({ moduleKey: z.string().min(1), mode: z.enum(["simple", "detailed"]) }))
            .mutation(async ({ input }) => {
                  await setModuleDisplayMode(input.moduleKey, input.mode);
                  return {
                        moduleKey: input.moduleKey,
                        mode: input.mode,
                  } as const;
            }),

      getNotificationPrefs: protectedProcedure
            .query(async () => {
                  const setting = await getAppSetting("notification_preferences");
                  if (!setting?.value) {
                        return {
                              debtNotifications: true,
                              paymentNotifications: true,
                              taskNotifications: true,
                              attendanceNotifications: true,
                              emailNotifications: false,
                              pushNotifications: true,
                        };
                  }
                  try {
                        return JSON.parse(setting.value) as Record<string, boolean>;
                  } catch {
                        return {
                              debtNotifications: true,
                              paymentNotifications: true,
                              taskNotifications: true,
                              attendanceNotifications: true,
                              emailNotifications: false,
                              pushNotifications: true,
                        };
                  }
            }),

      saveNotificationPrefs: protectedProcedure
            .input(z.object({
                  debtNotifications: z.boolean(),
                  paymentNotifications: z.boolean(),
                  taskNotifications: z.boolean(),
                  attendanceNotifications: z.boolean(),
                  emailNotifications: z.boolean(),
                  pushNotifications: z.boolean(),
            }))
            .mutation(async ({ input }) => {
                  await upsertAppSetting({
                        settingKey: "notification_preferences",
                        value: JSON.stringify(input),
                  });
                  return { success: true };
            }),
});
