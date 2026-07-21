#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

ROOT = Path.cwd()
STAMP = datetime.now().strftime('%Y%m%d_%H%M%S')
BACKUP = ROOT / f'.backup_16L8_18_{STAMP}'

def read(path: str):
    file = ROOT / path
    if not file.exists():
        raise RuntimeError(f'Không tìm thấy file: {path}')
    return file, file.read_text(encoding='utf-8')

def backup(file: Path):
    target = BACKUP / file.relative_to(ROOT)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(file, target)

def replace_once(text: str, old: str, new: str, label: str):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: cần đúng 1 block khớp nhưng tìm thấy {count}. Dừng để tránh ghi đè sai phiên bản.')
    return text.replace(old, new, 1)

# 1) server/db/duty.ts
duty_file, duty = read('server/db/duty.ts')
old = '''function createWallClockDate(dateText: string, timeText = "00:00:00") {
      const [year, month, day] = dateText.split("-").map(Number);
      const [hour = 0, minute = 0, second = 0] = timeText.split(":").map(Number);

      return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}'''
new = '''/**
 * Chuyển giờ nghiệp vụ Việt Nam sang thời điểm UTC để ghi vào cột TIMESTAMP.
 * Ví dụ 13:00 Asia/Ho_Chi_Minh được lưu thành 06:00Z.
 */
function createWallClockDate(dateText: string, timeText = "00:00:00") {
      const [year, month, day] = dateText.split("-").map(Number);
      const [hour = 0, minute = 0, second = 0] = timeText.split(":").map(Number);

      return new Date(Date.UTC(year, month - 1, day, hour - 7, minute, second));
}'''
duty = replace_once(duty, old, new, 'Sửa lưu giờ Việt Nam sang UTC')

old = '''      if (input.storeShiftType) {
            const ledgerId = Number(input.storeLedgerId || 0);
            if (!ledgerId) {
                  throw new Error("Vui lòng chọn cửa hàng cho ca trực.");
            }

            for (const assignedDate of Array.from(
                  new Set(preview.items.filter((item) => item.canCreate).map((item) => item.date)),
            )) {
                  const existingShift = await db
                        .select()
                        .from(storeShifts)
                        .where(
                              and(
                                    eq(storeShifts.ledgerId, ledgerId),
                                    sql`DATE(${storeShifts.shiftDate}) = ${assignedDate}`,
                                    eq(storeShifts.shiftType, input.storeShiftType),
                              ),
                        )
                        .limit(1);

                  if (existingShift.length > 0) {
                        throw new Error(
                              `Cửa hàng đã có ${
                                    input.storeShiftType === "morning" ? "ca sáng" : "ca chiều"
                              } ngày ${assignedDate}.`,
                        );
                  }
            }
      }'''
new = '''      if (input.storeShiftType && !Number(input.storeLedgerId || 0)) {
            throw new Error("Vui lòng chọn cửa hàng cho ca trực.");
      }'''
duty = replace_once(duty, old, new, 'Bỏ guard chặn ca Cửa hàng đã tồn tại')

old = '''      const existingShift = await db
            .select()
            .from(storeShifts)
            .where(
                  and(
                        eq(storeShifts.ledgerId, ledgerId),
                        sql`DATE(${storeShifts.shiftDate}) = ${assignedDate}`,
                        eq(storeShifts.shiftType, input.storeShiftType),
                  ),
            )
            .limit(1);

      if (existingShift.length > 0) {
            throw new Error(
                  `Cửa hàng đã có ${input.storeShiftType === "morning" ? "ca sáng" : "ca chiều"} ngày ${assignedDate}.`,
            );
      }'''
new = '''      const existingShiftRows = await db
            .select()
            .from(storeShifts)
            .where(
                  and(
                        eq(storeShifts.ledgerId, ledgerId),
                        sql`DATE(${storeShifts.shiftDate}) = ${assignedDate}`,
                        eq(storeShifts.shiftType, input.storeShiftType),
                  ),
            )
            .limit(1);

      const existingShift = existingShiftRows[0] as any;

      if (existingShift?.id) {
            const existingStoreDutyAssignmentId = Number(existingShift.storeDutyAssignmentId || 0);
            if (!existingStoreDutyAssignmentId) {
                  throw new Error("Ca Cửa hàng hiện có chưa liên kết với phân công công tác.");
            }

            const existingMembers = await db
                  .select({ residentId: storeDutyMembers.residentId })
                  .from(storeDutyMembers)
                  .where(eq(storeDutyMembers.storeDutyAssignmentId, existingStoreDutyAssignmentId));

            const existingResidentIds = new Set(
                  existingMembers.map((row: any) => Number(row.residentId)),
            );
            const newResidentIds = residentIds.filter(
                  (residentId) => !existingResidentIds.has(residentId),
            );

            if (newResidentIds.length > 0) {
                  await db.insert(storeDutyMembers).values(
                        newResidentIds.map((residentId) => ({
                              storeDutyAssignmentId: existingStoreDutyAssignmentId,
                              residentId,
                              memberRole:
                                    residentId === Number(existingShift.primaryResidentId || 0)
                                          ? "primary"
                                          : "assistant",
                              status: "assigned",
                        })) as any,
                  );
            }

            return {
                  storeDutyAssignmentId: existingStoreDutyAssignmentId,
                  storeShiftId: Number(existingShift.id),
                  shiftDate: assignedDate,
                  shiftType: input.storeShiftType,
                  residentIds,
                  primaryResidentId: Number(existingShift.primaryResidentId || primaryResidentId),
                  reusedExistingShift: true,
            };
      }'''
duty = replace_once(duty, old, new, 'Dùng lại ca Cửa hàng hiện hữu')

duty = duty.replace(
'''            managerId: input.createdBy ?? null,
            openingCashPlanned: String(Number(input.openingCashPlanned || 0).toFixed(2)),
            status: "scheduled",
            notes: input.notes || null,
            createdBy: input.createdBy ?? null,''',
'''            managerId: null,
            openingCashPlanned: String(Number(input.openingCashPlanned || 0).toFixed(2)),
            status: "scheduled",
            notes: input.notes || null,
            createdBy: null,''',
1)
duty = duty.replace(
'''            status: "scheduled",
            notes: input.notes || null,
            createdBy: input.createdBy ?? null,
      } as any);''',
'''            status: "scheduled",
            notes: input.notes || null,
            createdBy: null,
      } as any);''',
1)

# 2) server/routers/modules/duties.ts
router_file, router = read('server/routers/modules/duties.ts')
router = replace_once(
    router,
    'import { notifyDutyAssigned } from "../../services/notificationService";',
    'import { notifyDutyAssigned } from "../../services/notificationService";\nimport { storeDutyAccessService } from "../../services/storeDutyAccessService";',
    'Thêm Store access service',
)
old = '''                        await notifyDutyAssigned({
                              dutyConfigId: input.dutyConfigId,
                              assignedToType: input.assignedToType,
                              assignedToId: input.assignedToId,
                              assignedToIds: input.assignedToIds,
                              assignedDates: input.assignedDates,
                              notes: input.notes,
                        });

                        return result;'''
new = '''                        if (input.storeShiftType && input.assignedToType === "resident") {
                              for (const createdShift of result.storeShiftsCreated || []) {
                                    for (const residentId of createdShift.residentIds || []) {
                                          await storeDutyAccessService.issueAccessCode({
                                                storeShiftId: Number(createdShift.storeShiftId),
                                                residentId: Number(residentId),
                                                issuedBy: null,
                                          });
                                    }
                              }
                        }

                        await notifyDutyAssigned({
                              dutyConfigId: input.dutyConfigId,
                              assignedToType: input.assignedToType,
                              assignedToId: input.assignedToId,
                              assignedToIds: input.assignedToIds,
                              assignedDates: input.assignedDates,
                              notes: input.notes,
                        });

                        return result;'''
router = replace_once(router, old, new, 'Tự cấp mã sau phân công')

# 3) Validate current service logic
service_file, service = read('server/services/storeDutyAccessService.ts')
required = [
    'const STORE_IDLE_TIMEOUT_MINUTES = 30;',
    'const validFrom = asDate(shift?.accessValidFrom);',
    'await storeDb.revokeStoreDutyAccessSessions',
    'Ca trực đã kết thúc. Mã vào Cửa hàng đã hết hạn.',
]
if 'asVietnamWallClockInstant' in service:
    raise RuntimeError('storeDutyAccessService.ts vẫn chứa logic trừ thêm 7 giờ. Hãy đồng bộ Git mới nhất.')
for marker in required:
    if marker not in service:
        raise RuntimeError(f'storeDutyAccessService.ts thiếu marker: {marker}')

for file in (duty_file, router_file, service_file):
    backup(file)

duty_file.write_text(duty, encoding='utf-8')
router_file.write_text(router, encoding='utf-8')

print('16L8.18 applied successfully')
print(f'Backup: {BACKUP}')
