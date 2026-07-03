import * as db from "../db";
import { organizationService } from "./organizationService";

export type ResidentFilters = {
      search?: string;
      status?: string;
      limit?: number;
      offset?: number;
};

export type ParentFilters = {
      search?: string;
      parentType?: "father" | "mother" | "guardian";
      residentId?: number;
      limit?: number;
      offset?: number;
};

export type ParentInput = {
      parentType: "father" | "mother" | "guardian";
      fullName: string;
      phoneNumber?: string | null;
      email?: string | null;
      idNumber?: string | null;
      occupation?: string | null;
      address?: string | null;
      notes?: string | null;
};

export type MarkAsLeftOptions = {
      forceAfterHandover?: boolean;
};

class NeedHandoverError extends Error {
      code = "NEED_HANDOVER";
      reason = "NEED_HANDOVER";
      assignments: any[];

      constructor(assignments: any[]) {
            super(
                  "Học viên đang giữ chức vụ trong cơ cấu lưu xá. Vui lòng bàn giao hoặc bãi nhiệm trước khi cho rời lưu xá."
            );
            this.name = "NeedHandoverError";
            this.assignments = assignments;
      }
}


export type CreateMemberData = {
      holyName?: string | null;
      fullName: string;
      dateOfBirth?: Date | null;
      gender?: "male" | "female" | "other";
      idNumber?: string | null;
      permanentAddress?: string | null;
      phoneNumber?: string | null;
      schoolId?: number | null;
      profileImage?: string | null;
      admissionDate: Date;
      notes?: string | null;
      parents?: ParentInput[];
};

export type UpdateMemberData = Partial<{
      holyName: string | null;
      fullName: string;
      dateOfBirth: Date | null;
      gender: "male" | "female" | "other";
      idNumber: string | null;
      permanentAddress: string | null;
      phoneNumber: string | null;
      schoolId: number | null;
      profileImage: string | null;
      admissionDate: Date;
      notes: string | null;
      status: "active" | "inactive" | "transferred_out";
}>;

function generateResidentCode(admissionDate?: Date) {
      const year = (admissionDate || new Date()).getFullYear();
      const timePart = Date.now().toString().slice(-6);
      return `LX${year}${timePart}`;
}

function normalizeText(value?: string | null) {
      return (value || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ");
}

function normalizePhone(value?: string | null) {
      return (value || "").replace(/[^\d]/g, "");
}

async function validateParentBeforeSave(params: {
      residentId: number;
      data: Partial<ParentInput>;
      editingParentId?: number;
}) {
      const { residentId, data, editingParentId } = params;
      const fullName = normalizeText(data.fullName);
      const phoneNumber = normalizePhone(data.phoneNumber);

      if (!residentId) {
            throw new Error("Vui lòng chọn học viên cho liên hệ gia đình.");
      }

      if (!fullName) {
            throw new Error("Vui lòng nhập họ tên liên hệ.");
      }

      if (!phoneNumber) {
            throw new Error("Vui lòng nhập số điện thoại liên hệ.");
      }

      if (phoneNumber.length < 9 || phoneNumber.length > 15) {
            throw new Error("Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.");
      }

      const existingParents = await db.getParentsByResidentId(residentId);
      const otherParents = existingParents.filter(
            (parent: any) => parent.id !== editingParentId
      );

      if (
            (data.parentType === "father" || data.parentType === "mother") &&
            otherParents.some((parent: any) => parent.parentType === data.parentType)
      ) {
            throw new Error(
                  `Học viên này đã có thông tin ${data.parentType === "father" ? "Cha" : "Mẹ"
                  }. Không thể thêm trùng.`
            );
      }

      const duplicatedName = otherParents.some(
            (parent: any) => normalizeText(parent.fullName) === fullName
      );

      if (duplicatedName) {
            throw new Error("Tên liên hệ này đã tồn tại cho học viên đang chọn.");
      }

      const duplicatedPhone = otherParents.some(
            (parent: any) => normalizePhone(parent.phoneNumber) === phoneNumber
      );

      if (duplicatedPhone) {
            throw new Error("Số điện thoại này đã tồn tại cho học viên đang chọn.");
      }
}



type EducationLevel =
      | "high_school"
      | "vocational"
      | "college"
      | "university"
      | "other";

export type ResidentEducationData = {
      residentId: number;
      schoolName: string;
      educationLevel?: EducationLevel | null;
      classOrMajor?: string | null;
      academicYear?: string | null;
      notes?: string | null;
};

type DayOfWeek =
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";

export type ResidentStudyScheduleData = {
      residentId: number;
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
      subjectName?: string | null;
      location?: string | null;
      notes?: string | null;
};

export type UpdateResidentStudyScheduleData = ResidentStudyScheduleData & {
      id: number;
};

function normalizeStudyTime(value?: string | null) {
      return String(value || "").slice(0, 5);
}

function validateStudySchedulePayload(data: {
      startTime?: string | null;
      endTime?: string | null;
}) {
      const startTime = normalizeStudyTime(data.startTime);
      const endTime = normalizeStudyTime(data.endTime);

      if (!startTime || !endTime) {
            throw new Error("Vui lòng nhập giờ bắt đầu và giờ kết thúc.");
      }

      if (startTime >= endTime) {
            throw new Error("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
      }

      return { startTime, endTime };
}

export class MemberService {
      async listMembers(filters?: ResidentFilters) {
            return db.getResidents(filters);
      }

      async getMemberById(id: number) {
            const resident = await db.getResidentById(id);

            if (!resident) {
                  throw new Error("Member not found");
            }

            const parents = await db.getParentsByResidentId(id);
            const education = await db.getResidentEducationByResidentId(id);
            const studySchedules = await db.getResidentStudySchedulesByResidentId(id);

            return {
                  ...resident,
                  parents,
                  education,
                  studySchedules,
            };
      }

      async createMember(data: CreateMemberData) {
            const residentCode = generateResidentCode(data.admissionDate);

            const createdResident = await db.createResident({
                  residentCode,
                  holyName: data.holyName ?? null,
                  fullName: data.fullName,
                  dateOfBirth: data.dateOfBirth ?? null,
                  gender: data.gender,
                  idNumber: data.idNumber ?? null,
                  permanentAddress: data.permanentAddress ?? null,
                  phoneNumber: data.phoneNumber ?? null,
                  schoolId: data.schoolId ?? null,
                  profileImage: data.profileImage ?? null,
                  admissionDate: data.admissionDate,
                  notes: data.notes ?? null,
                  status: "active",
            });

            const residentId = (createdResident as any)?.id;

            if (!residentId) {
                  throw new Error("Không thể xác định học viên vừa tạo.");
            }

            if (data.parents && data.parents.length > 0) {
                  for (const parent of data.parents) {
                        await validateParentBeforeSave({
                              residentId,
                              data: parent,
                        });

                        await db.createParent({
                              residentId,
                              parentType: parent.parentType,
                              fullName: parent.fullName,
                              phoneNumber: parent.phoneNumber ?? null,
                              email: parent.email ?? null,
                              idNumber: parent.idNumber ?? null,
                              occupation: parent.occupation ?? null,
                              address: parent.address ?? null,
                              notes: parent.notes ?? null,
                        });
                  }
            }

            const resident = await db.getResidentById(residentId);
            const parents = await db.getParentsByResidentId(residentId);

            return {
                  ...resident,
                  parents,
            };
      }

      async updateMember(id: number, data: UpdateMemberData) {
            await db.updateResident(id, {
                  ...data,
                  holyName: data.holyName ?? null,
            });

            const resident = await db.getResidentById(id);

            if (!resident) {
                  throw new Error("Member not found");
            }

            const parents = await db.getParentsByResidentId(id);

            return {
                  ...resident,
                  parents,
            };
      }

      async deleteMember(id: number) {
            try {
                  await db.deleteResident(id);
                  return { success: true } as const;
            } catch (error: any) {
                  const isForeignKeyError =
                        error?.code === 'ER_ROW_IS_REFERENCED_2' ||
                        error?.errno === 1451 ||
                        String(error?.message || '').includes('foreign key constraint fails');

                  if (isForeignKeyError) {
                        throw new Error(
                              'Không thể xóa hồ sơ vì học viên đã phát sinh dữ liệu liên quan. Vui lòng dùng chức năng Rời lưu xá / Ngừng lưu trú để giữ lịch sử.'
                        );
                  }

                  throw error;
            }
      }

      async markAsLeft(id: number, departureDate: Date, options?: MarkAsLeftOptions) {
            const resident = await db.getResidentById(id);

            if (!resident) {
                  throw new Error("Không tìm thấy học viên cần ngừng/rời lưu xá.");
            }

            const activeAssignmentCheck =
                  await organizationService.hasActiveAssignmentsByResident(id);

            if (
                  activeAssignmentCheck.hasActiveAssignments &&
                  options?.forceAfterHandover !== true
            ) {
                  throw new NeedHandoverError(activeAssignmentCheck.assignments);
            }

            await db.markResidentAsLeft(id, departureDate);

            if ((resident as any).userId) {
                  await db.deactivateUser((resident as any).userId);
            }

            return { success: true } as const;
      }
      async reactivateMember(id: number) {
            const resident = await db.getResidentById(id);

            if (!resident) {
                  throw new Error("Không tìm thấy học viên cần đăng ký lại.");
            }

            const currentStatus = (resident as any).status;

            if (currentStatus === "active") {
                  return resident;
            }

            const updatedResident = await db.reactivateResident(id);

            if ((resident as any).userId) {
                  await db.activateUser((resident as any).userId);
            }

            return updatedResident;
      }

      async assignRoom(payload: {
            id: number;
            roomId?: number;
            assignedDate?: Date;
            eventType: "new_entry" | "transfer" | "temporary_leave" | "left";
            reason?: string;
      }) {
            /**
             * Legacy compatibility path for members.assignRoom.
             *
             * Main UI hiện đang dùng rooms.assignResident. Tuy nhiên endpoint cũ vẫn còn expose,
             * nên phải giữ cùng business rule để tránh tạo roomAssignments mở song song hoặc lệch
             * residents.currentRoomId nếu có client cũ gọi vào.
             */
            const resident = await db.getResidentById(payload.id);

            if (!resident) {
                  throw new Error("Member not found");
            }

            const residentStatus = (resident as any).status;
            if (residentStatus === "inactive" || residentStatus === "transferred_out") {
                  throw new Error("Học viên đã ngừng/rời lưu xá, không thể thao tác phòng trực tiếp.");
            }

            const assignedDate = payload.assignedDate || new Date();
            const currentAssignment = await db.getCurrentRoomAssignmentByResident(payload.id);

            if (payload.eventType === "left" || payload.eventType === "temporary_leave") {
                  if (currentAssignment?.id) {
                        await db.closeCurrentRoomAssignment(
                              Number(currentAssignment.id),
                              assignedDate,
                              payload.reason || "Trả phòng"
                        );
                  }

                  await db.updateResidentCurrentRoom(payload.id, null);
                  return { success: true } as const;
            }

            if (!payload.roomId) {
                  throw new Error("Vui lòng chọn phòng.");
            }

            if (currentAssignment?.roomId && Number(currentAssignment.roomId) === Number(payload.roomId)) {
                  throw new Error("Học viên đang ở phòng này, vui lòng chọn phòng khác.");
            }

            const room = await db.getRoomById(payload.roomId);
            if (!room) {
                  throw new Error("Không tìm thấy phòng.");
            }

            const occupancy = await db.getRoomCurrentOccupancy(payload.roomId);
            const capacity = Number((room as any).capacity || 0);

            if (capacity > 0 && occupancy >= capacity) {
                  throw new Error("Phòng đã đủ sức chứa, không thể gán thêm học viên.");
            }

            if (currentAssignment?.id) {
                  await db.closeCurrentRoomAssignment(
                        Number(currentAssignment.id),
                        assignedDate,
                        payload.reason || "Chuyển phòng"
                  );
            }

            await db.assignResidentToRoom({
                  residentId: payload.id,
                  roomId: payload.roomId,
                  assignedDate,
                  eventType: payload.eventType,
                  reason: payload.reason,
            });

            await db.updateResidentCurrentRoom(payload.id, payload.roomId);

            return { success: true } as const;
      }


      async getEducation(residentId: number) {
            const resident = await db.getResidentById(residentId);

            if (!resident) {
                  throw new Error("Không tìm thấy học viên.");
            }

            return db.getResidentEducationByResidentId(residentId);
      }

      async upsertEducation(data: ResidentEducationData) {
            const resident = await db.getResidentById(data.residentId);

            if (!resident) {
                  throw new Error("Không tìm thấy học viên.");
            }

            if (!data.schoolName?.trim()) {
                  throw new Error("Vui lòng nhập trường đang học.");
            }

            return db.upsertResidentEducation({
                  residentId: data.residentId,
                  schoolName: data.schoolName.trim(),
                  educationLevel: data.educationLevel || "university",
                  classOrMajor: data.classOrMajor?.trim() || null,
                  academicYear: data.academicYear?.trim() || null,
                  notes: data.notes?.trim() || null,
            });
      }

      async getStudySchedules(residentId: number) {
            const resident = await db.getResidentById(residentId);

            if (!resident) {
                  throw new Error("Không tìm thấy học viên.");
            }

            return db.getResidentStudySchedulesByResidentId(residentId);
      }

      async createStudySchedule(data: ResidentStudyScheduleData) {
            const resident = await db.getResidentById(data.residentId);

            if (!resident) {
                  throw new Error("Không tìm thấy học viên.");
            }

            const timeRange = validateStudySchedulePayload(data);

            return db.createResidentStudySchedule({
                  residentId: data.residentId,
                  dayOfWeek: data.dayOfWeek,
                  startTime: timeRange.startTime,
                  endTime: timeRange.endTime,
                  subjectName: data.subjectName?.trim() || null,
                  location: data.location?.trim() || null,
                  notes: data.notes?.trim() || null,
            });
      }

      async updateStudySchedule(data: UpdateResidentStudyScheduleData) {
            const resident = await db.getResidentById(data.residentId);

            if (!resident) {
                  throw new Error("Không tìm thấy học viên.");
            }

            const timeRange = validateStudySchedulePayload(data);

            return db.updateResidentStudySchedule({
                  id: data.id,
                  residentId: data.residentId,
                  dayOfWeek: data.dayOfWeek,
                  startTime: timeRange.startTime,
                  endTime: timeRange.endTime,
                  subjectName: data.subjectName?.trim() || null,
                  location: data.location?.trim() || null,
                  notes: data.notes?.trim() || null,
            });
      }

      async deleteStudySchedule(input: { id: number; residentId: number }) {
            const resident = await db.getResidentById(input.residentId);

            if (!resident) {
                  throw new Error("Không tìm thấy học viên.");
            }

            return db.deactivateResidentStudySchedule(input);
      }

      async getStats() {
            return db.getResidentsStats();
      }

      async getParents(residentId: number) {
            return db.getParentsByResidentId(residentId);
      }

      async listParents(filters?: ParentFilters) {
            return db.getAllParents(filters);
      }

      async createParent(data: ParentInput & { residentId: number }) {
            const resident = await db.getResidentById(data.residentId);

            if (!resident) {
                  throw new Error("Không tìm thấy học viên cần gắn liên hệ.");
            }

            await validateParentBeforeSave({
                  residentId: data.residentId,
                  data,
            });

            const createdParent = await db.createParent({
                  residentId: data.residentId,
                  parentType: data.parentType,
                  fullName: data.fullName,
                  phoneNumber: data.phoneNumber ?? null,
                  email: data.email ?? null,
                  idNumber: data.idNumber ?? null,
                  occupation: data.occupation ?? null,
                  address: data.address ?? null,
                  notes: data.notes ?? null,
            });

            const parentId = (createdParent as any)?.id;

            if (!parentId) {
                  throw new Error("Không thể xác định phụ huynh vừa tạo.");
            }

            return db.getParentById(parentId);
      }

      async updateParent(id: number, data: Partial<ParentInput>) {
            const currentParent = await db.getParentById(id);

            if (!currentParent) {
                  throw new Error("Không tìm thấy liên hệ cần cập nhật.");
            }

            const mergedData: ParentInput = {
                  parentType: (data.parentType ??
                        currentParent.parentType) as ParentInput["parentType"],
                  fullName: data.fullName ?? currentParent.fullName,
                  phoneNumber: data.phoneNumber ?? currentParent.phoneNumber ?? "",
                  email: data.email ?? currentParent.email ?? "",
                  idNumber: data.idNumber ?? currentParent.idNumber ?? "",
                  occupation: data.occupation ?? currentParent.occupation ?? "",
                  address: data.address ?? currentParent.address ?? "",
                  notes: data.notes ?? currentParent.notes ?? "",
            };

            await validateParentBeforeSave({
                  residentId: currentParent.residentId,
                  data: mergedData,
                  editingParentId: id,
            });

            await db.updateParent(id, {
                  parentType: data.parentType,
                  fullName: data.fullName,
                  phoneNumber: data.phoneNumber ?? null,
                  email: data.email ?? null,
                  idNumber: data.idNumber ?? null,
                  occupation: data.occupation ?? null,
                  address: data.address ?? null,
                  notes: data.notes ?? null,
            });

            return db.getParentById(id);
      }

      async deleteParent(id: number) {
            await db.deleteParent(id);
            return { success: true } as const;
      }
}

export const memberService = new MemberService();
