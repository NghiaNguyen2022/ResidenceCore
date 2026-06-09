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

            return {
                  ...resident,
                  parents,
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
            roomId: number;
            eventType: "new_entry" | "transfer" | "temporary_leave" | "left";
            reason?: string;
      }) {
            const resident = await db.getResidentById(payload.id);

            if (!resident) {
                  throw new Error("Member not found");
            }

            await db.assignResidentToRoom({
                  residentId: payload.id,
                  roomId: payload.roomId,
                  assignedDate: new Date(),
                  eventType: payload.eventType,
                  reason: payload.reason,
            });

            return { success: true } as const;
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
