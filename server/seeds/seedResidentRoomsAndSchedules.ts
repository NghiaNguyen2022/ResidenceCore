import {
      createResidentStudySchedule,
      createRoom,
      getResidentStudySchedulesByResidentId,
      getRooms,
      getRoomsWithDetails,
} from "../db";
import { memberService } from "../services/memberService";

const roomDefinitions = [
      { roomCode: "BMT-N101", capacity: 4, notes: "Phòng nữ sinh - Khu nhà chính" },
      { roomCode: "BMT-N102", capacity: 4, notes: "Phòng nữ sinh - Khu nhà chính" },
      { roomCode: "BMT-N103", capacity: 4, notes: "Phòng nữ sinh - Khu nhà chính" },
      { roomCode: "BMT-N104", capacity: 4, notes: "Phòng nữ sinh - Khu nhà chính" },
      { roomCode: "BMT-N105", capacity: 4, notes: "Phòng nữ sinh - Khu nhà chính" },
] as const;

const schedulePatterns = [
      {
            dayOfWeek: "monday" as const,
            startTime: "07:30",
            endTime: "11:00",
            subjectName: "Các môn đại cương",
      },
      {
            dayOfWeek: "tuesday" as const,
            startTime: "13:00",
            endTime: "17:00",
            subjectName: "Chuyên ngành",
      },
      {
            dayOfWeek: "wednesday" as const,
            startTime: "07:30",
            endTime: "11:00",
            subjectName: "Thực hành",
      },
      {
            dayOfWeek: "thursday" as const,
            startTime: "13:00",
            endTime: "17:00",
            subjectName: "Ngoại ngữ",
      },
      {
            dayOfWeek: "friday" as const,
            startTime: "07:30",
            endTime: "11:00",
            subjectName: "Kỹ năng nghề nghiệp",
      },
] as const;

async function ensureRooms() {
      const existingRooms = await getRooms({ limit: 100 });
      const existingCodes = new Set(existingRooms.map((room: any) => room.roomCode));

      for (const definition of roomDefinitions) {
            if (!existingCodes.has(definition.roomCode)) {
                  await createRoom({ ...definition });
            }
      }

      return getRoomsWithDetails({ limit: 100 });
}

async function main() {
      let availableRooms = (await ensureRooms())
            .filter((room: any) =>
                  roomDefinitions.some((definition) => definition.roomCode === room.roomCode)
            )
            .map((room: any) => ({
                  id: Number(room.id),
                  roomCode: String(room.roomCode),
                  capacity: Number(room.capacity),
                  residentsCount: Number(room.residentsCount || 0),
            }))
            .sort((a: any, b: any) => a.roomCode.localeCompare(b.roomCode));

      const residents = (await memberService.listMembers({ limit: 500 }))
            .filter((resident: any) => resident.status === "active")
            .sort((a: any, b: any) => Number(a.id) - Number(b.id));

      const assigned: Array<{ resident: string; room: string }> = [];
      const scheduled: Array<{ resident: string; day: string; time: string }> = [];

      for (let index = 0; index < residents.length; index += 1) {
            const resident: any = residents[index];

            if (!resident.currentRoomId) {
                  const room = availableRooms
                        .filter((item) => item.residentsCount < item.capacity)
                        .sort(
                              (a, b) =>
                                    a.residentsCount - b.residentsCount ||
                                    a.roomCode.localeCompare(b.roomCode)
                        )[0];

                  if (!room) {
                        throw new Error(`Không còn phòng trống cho ${resident.fullName}.`);
                  }

                  await memberService.assignRoom({
                        id: Number(resident.id),
                        roomId: room.id,
                        assignedDate: new Date(2026, 6, 27),
                        eventType: "new_entry",
                        reason: "Phân phòng dữ liệu nền UAT năm học 2026-2027",
                  });

                  room.residentsCount += 1;
                  assigned.push({ resident: resident.fullName, room: room.roomCode });
            }

            const existingSchedules = await getResidentStudySchedulesByResidentId(
                  Number(resident.id)
            );

            if (existingSchedules.length === 0) {
                  const pattern = schedulePatterns[index % schedulePatterns.length];
                  await createResidentStudySchedule({
                        residentId: Number(resident.id),
                        ...pattern,
                        location: "Cơ sở học tập tại Buôn Ma Thuột",
                        notes: "Lịch học dữ liệu nền UAT để kiểm tra xung đột công tác",
                  });
                  scheduled.push({
                        resident: resident.fullName,
                        day: pattern.dayOfWeek,
                        time: `${pattern.startTime}-${pattern.endTime}`,
                  });
            }
      }

      availableRooms = (await getRoomsWithDetails({ limit: 100 }))
            .filter((room: any) =>
                  roomDefinitions.some((definition) => definition.roomCode === room.roomCode)
            )
            .map((room: any) => ({
                  roomCode: room.roomCode,
                  capacity: Number(room.capacity),
                  residentsCount: Number(room.residentsCount || 0),
            }))
            .sort((a: any, b: any) => a.roomCode.localeCompare(b.roomCode));

      console.log(
            JSON.stringify(
                  {
                        totalResidents: residents.length,
                        rooms: availableRooms,
                        newlyAssigned: assigned.length,
                        newlyScheduled: scheduled.length,
                        assigned,
                        scheduled,
                  },
                  null,
                  2
            )
      );
}

main()
      .then(() => process.exit(0))
      .catch((error) => {
            console.error(error);
            process.exit(1);
      });
