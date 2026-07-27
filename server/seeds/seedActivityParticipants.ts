import {
      addActivityParticipant,
      getActivityByCode,
      getActivityParticipants,
      markParticipantAttendance,
      updateActivity,
} from "../db/activity";
import { memberService } from "../services/memberService";

const ACTIVITY_CODE = "SHCD-20260727";
const ABSENT_NAMES = new Set(["Dương Thị Hải Yến", "Đặng Thị Phương Thảo"]);

async function main() {
      const activity = await getActivityByCode(ACTIVITY_CODE);
      if (!activity) {
            throw new Error(`Không tìm thấy hoạt động ${ACTIVITY_CODE}.`);
      }

      const residents = (await memberService.listMembers({ limit: 500 }))
            .filter((resident: any) => resident.status === "active")
            .sort((a: any, b: any) => Number(a.id) - Number(b.id));
      const existing = await getActivityParticipants(Number(activity.id));
      const existingResidentIds = new Set(
            existing.map((participant: any) => Number(participant.residentId))
      );

      let added = 0;
      for (const resident of residents) {
            if (!existingResidentIds.has(Number(resident.id))) {
                  await addActivityParticipant({
                        activityId: Number(activity.id),
                        residentId: Number(resident.id),
                        role: "participant",
                        attended: false,
                        notes: null,
                  });
                  added += 1;
            }

            await markParticipantAttendance(
                  Number(activity.id),
                  Number(resident.id),
                  !ABSENT_NAMES.has(String(resident.fullName))
            );
      }

      const actualParticipants = residents.filter(
            (resident: any) => !ABSENT_NAMES.has(String(resident.fullName))
      ).length;

      await updateActivity(Number(activity.id), {
            expectedParticipants: residents.length,
            actualParticipants,
      });

      const participants = await getActivityParticipants(Number(activity.id));
      console.log(
            JSON.stringify(
                  {
                        activityId: activity.id,
                        activityCode: ACTIVITY_CODE,
                        residents: residents.length,
                        added,
                        attended: participants.filter((participant: any) => participant.attended).length,
                        absent: participants.filter((participant: any) => !participant.attended).length,
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
