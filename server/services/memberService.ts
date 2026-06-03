import * as db from "../db";

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
      phoneNumber?: string;
      email?: string;
      idNumber?: string;
      occupation?: string;
      address?: string;
      notes?: string;
};

export type CreateMemberData = {
      holyName?: string | null;
      fullName: string;
      dateOfBirth?: Date;
      gender?: "male" | "female" | "other";
      idNumber?: string;
      permanentAddress?: string;
      phoneNumber?: string;
      schoolId?: number;
      profileImage?: string;
      admissionDate: Date;
      notes?: string;
      parents?: ParentInput[];
};

export type UpdateMemberData = Partial<{
      holyName: string | null;
      fullName: string;
      dateOfBirth: Date;
      gender: "male" | "female" | "other";
      idNumber: string;
      permanentAddress: string;
      phoneNumber: string;
      schoolId: number;
      profileImage: string;
      admissionDate: Date;
      notes: string;
      status: "active" | "inactive" | "transferred_out";
}>;

function generateResidentCode(admissionDate?: Date) {
      const year = (admissionDate || new Date()).getFullYear();
      const timePart = Date.now().toString().slice(-6);
      return `LX${year}${timePart}`;
}

function normalizeText(value?: string) {
      return (value || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ");
}

function normalizePhone(value?: string) {
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
            const result = await db.createResident({
                  residentCode: generateResidentCode(data.admissionDate),
                  holyName: data.holyName ?? null,
                  fullName: data.fullName,
                  dateOfBirth: data.dateOfBirth ?? null,
                  gender: data.gender,
                  idNumber: data.idNumber ?? null,
                  permanentAddress: data.permanentAddress ?? null,
                  phoneNumber: data.phoneNumber ?? null,
                  admissionDate: data.admissionDate,
                  notes: data.notes ?? null,
            });

            const residentId =
                  (result as any)?.id ??
                  (result as any)?.insertId ??
                  (Array.isArray(result) ? (result as any)[0]?.id : null);

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
                              phoneNumber: parent.phoneNumber,
                              email: parent.email,
                              idNumber: parent.idNumber,
                              occupation: parent.occupation,
                              address: parent.address,
                              notes: parent.notes,
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
            await db.updateResident(id, data);

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
            await db.deleteResident(id);
            return { success: true } as const;
      }

      async markAsLeft(id: number, departureDate: Date) {
            await db.markResidentAsLeft(id, departureDate);
            return { success: true } as const;
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
                  phoneNumber: data.phoneNumber,
                  email: data.email,
                  idNumber: data.idNumber,
                  occupation: data.occupation,
                  address: data.address,
                  notes: data.notes,
            });

            const parentId =
                  (createdParent as any)?.id ??
                  (createdParent as any)?.insertId ??
                  (Array.isArray(createdParent) ? (createdParent as any)[0]?.id : null);

            if (!parentId) {
                  throw new Error('Không thể xác định phụ huynh vừa tạo.');
            }

            return db.getParentById(parentId);
      }

      async updateParent(id: number, data: Partial<ParentInput>) {
            const currentParent = await db.getParentById(id);

            if (!currentParent) {
                  throw new Error("Không tìm thấy liên hệ cần cập nhật.");
            }

            const mergedData: ParentInput = {
                  parentType: data.parentType ?? currentParent.parentType,
                  fullName: data.fullName ?? currentParent.fullName,
                  phoneNumber: data.phoneNumber ?? currentParent.phoneNumber ?? '',
                  email: data.email ?? currentParent.email ?? '',
                  idNumber: data.idNumber ?? currentParent.idNumber ?? '',
                  occupation: data.occupation ?? currentParent.occupation ?? '',
                  address: data.address ?? currentParent.address ?? '',
                  notes: data.notes ?? currentParent.notes ?? '',
            };

            await validateParentBeforeSave({
                  residentId: currentParent.residentId,
                  data: mergedData,
                  editingParentId: id,
            });

            await db.updateParent(id, data);
            return db.getParentById(id);
      }

      async deleteParent(id: number) {
            await db.deleteParent(id);
            return { success: true } as const;
      }
}

export const memberService = new MemberService();
