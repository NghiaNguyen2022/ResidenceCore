import * as db from "../db";

export type ResidentFilters = {
  search?: string;
  status?: string;
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
      residentCode: data.fullName ? data.fullName.replace(/\s+/g, "_").toLowerCase() : "",
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      idNumber: data.idNumber,
      permanentAddress: data.permanentAddress,
      phoneNumber: data.phoneNumber,
      schoolId: data.schoolId,
      profileImage: data.profileImage,
      admissionDate: data.admissionDate,
      notes: data.notes,
    });

    const residentId = result.insertId;

    if (data.parents && data.parents.length > 0) {
      for (const parent of data.parents) {
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

  async createParent(data: ParentInput & { residentId: number }) {
    const result = await db.createParent(data);
    const parentId = result.insertId;
    return db.getParentById(parentId);
  }

  async updateParent(id: number, data: Partial<ParentInput>) {
    await db.updateParent(id, data);
    return db.getParentById(id);
  }

  async deleteParent(id: number) {
    await db.deleteParent(id);
    return { success: true } as const;
  }
}

export const memberService = new MemberService();
