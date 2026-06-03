export type Gender = 'male' | 'female' | 'other';
export type RoomEventType = 'new_entry' | 'transfer' | 'temporary_leave' | 'left';
export type ParentType = 'father' | 'mother' | 'guardian';

export type MemberFormData = {
      holyName: string;
      fullName: string;
      dateOfBirth: string;
      gender: Gender;
      idNumber: string;
      permanentAddress: string;
      phoneNumber: string;
      admissionDate: string;
      notes: string;
};

export type ParentFormData = {
      parentType: ParentType;
      fullName: string;
      phoneNumber: string;
      email: string;
      idNumber: string;
      occupation: string;
      address: string;
      notes: string;
};

export type RoomAssignmentData = {
      roomId: string;
      assignedDate: string;
      eventType: RoomEventType;
      reason: string;
};

export type QuickRoomFormData = {
      roomCode: string;
      capacity: string;
      notes: string;
};

export type CreateResidentUserFormData = {
      createUserAccount: boolean;
      username: string;
      temporaryPassword: string;
      mustChangePassword: boolean;
};

export const defaultFormData: MemberFormData = {
      holyName: '',
      fullName: '',
      dateOfBirth: '',
      gender: 'male',
      idNumber: '',
      permanentAddress: '',
      phoneNumber: '',
      admissionDate: new Date().toISOString().split('T')[0],
      notes: '',
};

export const defaultParentFormData: ParentFormData = {
      parentType: 'father',
      fullName: '',
      phoneNumber: '',
      email: '',
      idNumber: '',
      occupation: '',
      address: '',
      notes: '',
};

export const defaultRoomAssignmentData: RoomAssignmentData = {
      roomId: '',
      assignedDate: new Date().toISOString().split('T')[0],
      eventType: 'new_entry',
      reason: '',
};

export const defaultQuickRoomFormData: QuickRoomFormData = {
      roomCode: '',
      capacity: '4',
      notes: '',
};

export const defaultCreateResidentUserFormData: CreateResidentUserFormData = {
      createUserAccount: false,
      username: '',
      temporaryPassword: '123456',
      mustChangePassword: true,
};

export function resetMemberForm(): MemberFormData {
      return {
            ...defaultFormData,
            admissionDate: new Date().toISOString().split('T')[0],
      };
}

export function resetRoomAssignmentForm(): RoomAssignmentData {
      return {
            ...defaultRoomAssignmentData,
            assignedDate: new Date().toISOString().split('T')[0],
      };
}

export function resetCreateResidentUserForm(): CreateResidentUserFormData {
      return {
            ...defaultCreateResidentUserFormData,
      };
}