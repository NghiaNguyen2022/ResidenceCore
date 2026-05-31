import { router } from "../_core/trpc";
import { supervisorProcedure } from "../_core/rbac";
import * as db from "../db";

export const dashboardRouter = router({
  getStats: supervisorProcedure.query(async () => {
    return await db.getDashboardStats();
  }),

  getResidentStats: supervisorProcedure.query(async () => {
    const residents = await db.getResidents({ status: "active" });
    return {
      total: residents.length,
      active: residents.length,
      byGender: {
        male: residents.filter((r) => r.gender === "male").length,
        female: residents.filter((r) => r.gender === "female").length,
        other: residents.filter((r) => r.gender === "other").length,
      },
    };
  }),

  getRoomStats: supervisorProcedure.query(async () => {
    const rooms = await db.getRoomOccupancyStats();
    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const totalOccupancy = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);

    return {
      total: rooms.length,
      totalCapacity,
      totalOccupancy,
      occupancyRate: totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0,
      byStatus: {
        available: rooms.filter((r) => r.status === "available").length,
        full: rooms.filter((r) => r.status === "full").length,
        maintenance: rooms.filter((r) => r.status === "maintenance").length,
        closed: rooms.filter((r) => r.status === "closed").length,
      },
    };
  }),

  getAttendanceStats: supervisorProcedure.query(async () => {
    const today = new Date();
    const todayAttendance = await db.getAttendanceByDate(today);

    return {
      total: todayAttendance.length,
      present: todayAttendance.filter((a) => a.status === "present").length,
      absent: todayAttendance.filter((a) => a.status === "absent").length,
      excused: todayAttendance.filter((a) => a.status === "excused").length,
      late: todayAttendance.filter((a) => a.status === "late").length,
    };
  }),

  getTaskStats: supervisorProcedure.query(async () => {
    const allTasks = await db.getTaskAssignments({ limit: 1000 });

    return {
      total: allTasks.length,
      pending: allTasks.filter((t) => t.status === "pending").length,
      inProgress: allTasks.filter((t) => t.status === "in_progress").length,
      completed: allTasks.filter((t) => t.status === "completed").length,
      overdue: allTasks.filter((t) => t.status === "overdue").length,
      cancelled: allTasks.filter((t) => t.status === "cancelled").length,
    };
  }),

  getFinancialStats: supervisorProcedure.query(async () => {
    const allDebts = await db.getDebts();

    const unpaidDebts = allDebts.filter(
      (d) => d.status === "unpaid" || d.status === "partially_paid" || d.status === "overdue"
    );

    return {
      totalDebts: allDebts.length,
      unpaidCount: unpaidDebts.length,
      totalAmount: allDebts.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0),
      unpaidAmount: unpaidDebts.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0),
      paidAmount: allDebts
        .filter((d) => d.status === "paid")
        .reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0),
      collectionRate: 0,
    };
  }),

  getFullDashboard: supervisorProcedure.query(async () => {
    const [stats, residents, rooms, attendance, tasks, financial] = await Promise.all([
      db.getDashboardStats(),
      db.getResidents({ status: "active" }),
      db.getRoomOccupancyStats(),
      db.getAttendanceByDate(new Date()),
      db.getTaskAssignments({ limit: 1000 }),
      db.getDebts(),
    ]);

    return {
      overview: stats,
      residents: {
        total: residents.length,
        byGender: {
          male: residents.filter((r) => r.gender === "male").length,
          female: residents.filter((r) => r.gender === "female").length,
          other: residents.filter((r) => r.gender === "other").length,
        },
      },
      rooms: {
        total: rooms.length,
        totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
        totalOccupancy: rooms.reduce((sum, r) => sum + r.currentOccupancy, 0),
        byStatus: {
          available: rooms.filter((r) => r.status === "available").length,
          full: rooms.filter((r) => r.status === "full").length,
          maintenance: rooms.filter((r) => r.status === "maintenance").length,
          closed: rooms.filter((r) => r.status === "closed").length,
        },
      },
      attendance: {
        total: attendance.length,
        present: attendance.filter((a) => a.status === "present").length,
        absent: attendance.filter((a) => a.status === "absent").length,
        excused: attendance.filter((a) => a.status === "excused").length,
        late: attendance.filter((a) => a.status === "late").length,
      },
      tasks: {
        total: tasks.length,
        pending: tasks.filter((t) => t.status === "pending").length,
        inProgress: tasks.filter((t) => t.status === "in_progress").length,
        completed: tasks.filter((t) => t.status === "completed").length,
        overdue: tasks.filter((t) => t.status === "overdue").length,
      },
      financial: {
        totalDebts: financial.length,
        unpaidCount: financial.filter(
          (d) => d.status === "unpaid" || d.status === "partially_paid" || d.status === "overdue"
        ).length,
        totalAmount: financial.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0),
        unpaidAmount: financial
          .filter((d) => d.status === "unpaid" || d.status === "partially_paid" || d.status === "overdue")
          .reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0),
      },
    };
  }),
});
