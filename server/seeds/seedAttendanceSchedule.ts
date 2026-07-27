import {
      createAttendanceSchedule,
      listAttendanceSchedules,
      updateAttendanceSchedule,
} from "../db/attendance";

async function main() {
      const schedules = await listAttendanceSchedules();
      const existing = schedules.find(
            (schedule: any) => String(schedule.name).trim() === "Điểm danh tối"
      );

      if (existing) {
            await updateAttendanceSchedule(Number(existing.id), {
                  name: "Điểm danh tối",
                  type: "check_in",
                  scheduledTime: "21:00",
                  tolerance: 15,
                  isDaily: true,
            });
            console.log(`Đã cập nhật lịch #${existing.id} thành 21:00.`);
      } else {
            const created = await createAttendanceSchedule({
                  name: "Điểm danh tối",
                  type: "check_in",
                  scheduledTime: "21:00",
                  tolerance: 15,
                  isDaily: true,
            });
            console.log(`Đã tạo lịch #${created.id} lúc 21:00.`);
      }
}

main()
      .then(() => process.exit(0))
      .catch((error) => {
            console.error(error);
            process.exit(1);
      });
