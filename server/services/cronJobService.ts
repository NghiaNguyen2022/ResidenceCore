import { getDb } from "../db";
import { residents, feeTypes, debts, cronJobLogs } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { notifyDebtGenerated } from "./notificationService";

export interface CronJobLog {
  jobName: string;
  status: "success" | "failed" | "running";
  message?: string;
  startTime: Date;
  endTime?: Date;
}

/**
 * Generate monthly debts for all active residents
 * This should be called once a month (e.g., on the 1st of each month)
 */
export async function generateMonthlyDebts(): Promise<CronJobLog> {
  const db = await getDb();
  if (!db) {
    return {
      jobName: "generateMonthlyDebts",
      status: "failed",
      message: "Database not available",
      startTime: new Date(),
    };
  }

  const startTime = new Date();
  let debtCount = 0;
  let failedCount = 0;

  try {
    console.log("[CronJob] Starting monthly debt generation...");

    // Get all active residents
    const activeResidents = await db.select().from(residents).where(eq(residents.status, "active"));

    if (activeResidents.length === 0) {
      console.log("[CronJob] No active residents found");
      return {
        jobName: "generateMonthlyDebts",
        status: "success",
        message: "No active residents found",
        startTime,
        endTime: new Date(),
      };
    }

    // Get all fee types
    const allFeeTypes = await db.select().from(feeTypes).where(eq(feeTypes.isActive, true));

    if (allFeeTypes.length === 0) {
      console.log("[CronJob] No active fee types found");
      return {
        jobName: "generateMonthlyDebts",
        status: "success",
        message: "No active fee types found",
        startTime,
        endTime: new Date(),
      };
    }

    // Generate current billing month (YYYY-MM format)
    const now = new Date();
    const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // For each resident, create debt records for each fee type
    for (const resident of activeResidents) {
      for (const feeType of allFeeTypes) {
        try {
          // Check if debt already exists for this month
          const existingDebt = await db
            .select()
            .from(debts)
            .where(
              and(
                eq(debts.residentId, resident.id),
                eq(debts.billingMonth, billingMonth),
                eq(debts.feeTypeId, feeType.id)
              )
            )
            .limit(1);

          if (existingDebt.length > 0) {
            console.log(
              `[CronJob] Debt already exists for resident ${resident.id}, fee type ${feeType.id}, month ${billingMonth}`
            );
            continue;
          }

          // Calculate due date (e.g., 15 days from now)
          const dueDate = new Date(now);
          dueDate.setDate(dueDate.getDate() + 15);

          // Create debt record
          await db.insert(debts).values({
            residentId: resident.id,
            feeTypeId: feeType.id,
            amount: String(feeType.amount),
            billingMonth,
            dueDate,
            status: "unpaid" as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          debtCount++;

          // Send notification to resident
          await notifyDebtGenerated(resident.id, Number(feeType.amount), billingMonth);

          console.log(
            `[CronJob] Created debt for resident ${resident.id}: ${feeType.name} - ${feeType.amount} đ`
          );
        } catch (error) {
          failedCount++;
          console.error(
            `[CronJob] Failed to create debt for resident ${resident.id}, fee type ${feeType.id}:`,
            error
          );
        }
      }
    }

    const message = `Successfully generated ${debtCount} debts. Failed: ${failedCount}`;
    console.log(`[CronJob] ${message}`);

    // Log the job execution
    await db.insert(cronJobLogs).values({
      jobName: "generateMonthlyDebts",
      status: "success" as any,
      errorMessage: null,
      recordsProcessed: debtCount,
      createdAt: new Date(),
    });

    return {
      jobName: "generateMonthlyDebts",
      status: "success",
      message,
      startTime,
      endTime: new Date(),
    };
  } catch (error) {
    const message = `Failed to generate monthly debts: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`[CronJob] ${message}`);

    // Log the failed job
    try {
      await db.insert(cronJobLogs).values({
        jobName: "generateMonthlyDebts",
        status: "failure" as any,
        errorMessage: message,
        createdAt: new Date(),
      });
    } catch (logError) {
      console.error("[CronJob] Failed to log job execution:", logError);
    }

    return {
      jobName: "generateMonthlyDebts",
      status: "failed",
      message,
      startTime,
      endTime: new Date(),
    };
  }
}

/**
 * Check for overdue debts and send notifications
 */
export async function checkOverdueDebts(): Promise<CronJobLog> {
  const db = await getDb();
  if (!db) {
    return {
      jobName: "checkOverdueDebts",
      status: "failed",
      message: "Database not available",
      startTime: new Date(),
    };
  }

  const startTime = new Date();
  let notifiedCount = 0;

  try {
    console.log("[CronJob] Checking for overdue debts...");

    // Get all unpaid debts that are past due date
    const now = new Date();
    const overdueDebts = await db
      .select()
      .from(debts)
      .where(
        and(
          eq(debts.status, "unpaid"),
          // This is a simplified check - in real implementation you'd use a proper date comparison
          eq(debts.status, "unpaid")
        )
      );

    // Filter for overdue debts (past due date)
    const actualOverdueDebts = overdueDebts.filter((debt) => {
      if (!debt.dueDate) return false;
      return new Date(debt.dueDate) < now;
    });

    console.log(`[CronJob] Found ${actualOverdueDebts.length} overdue debts`);

    // For each overdue debt, update status and send notification
    for (const debt of actualOverdueDebts) {
      try {
        // Update debt status to overdue
        await db.update(debts).set({ status: "overdue" }).where(eq(debts.id, debt.id));
        notifiedCount++;
        console.log(`[CronJob] Marked debt ${debt.id} as overdue`);
      } catch (error) {
        console.error(`[CronJob] Failed to update debt ${debt.id}:`, error);
      }
    }

    const message = `Checked and updated ${notifiedCount} overdue debts`;
    console.log(`[CronJob] ${message}`);

    // Log the job execution
    await db.insert(cronJobLogs).values({
      jobName: "checkOverdueDebts",
      status: "success" as any,
      errorMessage: null,
      recordsProcessed: notifiedCount,
      createdAt: new Date(),
    });

    return {
      jobName: "checkOverdueDebts",
      status: "success",
      message,
      startTime,
      endTime: new Date(),
    };
  } catch (error) {
    const message = `Failed to check overdue debts: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`[CronJob] ${message}`);

    // Log the failed job
    try {
      await db.insert(cronJobLogs).values({
        jobName: "checkOverdueDebts",
        status: "failure" as any,
        errorMessage: message,
        createdAt: new Date(),
      });
    } catch (logError) {
      console.error("[CronJob] Failed to log job execution:", logError);
    }

    return {
      jobName: "checkOverdueDebts",
      status: "failed",
      message,
      startTime,
      endTime: new Date(),
    };
  }
}

/**
 * Get cron job execution history
 */
export async function getCronJobHistory(jobName?: string, limit: number = 50): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    let query = db.select().from(cronJobLogs);

    if (jobName) {
      query = query.where(eq(cronJobLogs.jobName, jobName)) as any;
    }

    const result = await query.orderBy(cronJobLogs.createdAt).limit(limit);
    return result;
  } catch (error) {
    console.error("[CronJob] Failed to get job history:", error);
    return [];
  }
}
