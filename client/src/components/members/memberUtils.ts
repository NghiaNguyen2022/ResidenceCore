import type { ParentFormData } from './memberTypes';

export function normalizeText(value?: string) {
      return (value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
}

export function normalizePhone(value?: string) {
      return (value || '').replace(/[^\d]/g, '');
}

export function getStatusLabel(status?: string) {
      if (status === 'active') return 'Đang ở';
      if (status === 'transferred_out') return 'Đã rời';
      if (status === 'inactive') return 'Tạm rời';
      return 'Chưa xác định';
}

export function getStatusClass(status?: string) {
      if (status === 'active') return 'border-green-200 bg-green-50 text-green-700';
      if (status === 'transferred_out') return 'border-red-200 bg-red-50 text-red-700';
      if (status === 'inactive') return 'border-orange-200 bg-orange-50 text-orange-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

export function getGenderLabel(gender?: string) {
      if (gender === 'male') return 'Nam';
      if (gender === 'female') return 'Nữ';
      if (gender === 'other') return 'Khác';
      return '-';
}

export function getParentTypeLabel(type?: string) {
      if (type === 'father') return 'Cha';
      if (type === 'mother') return 'Mẹ';
      if (type === 'guardian') return 'Người giám hộ';
      return 'Khác';
}

export function getParentTypeClass(type?: string) {
      if (type === 'father') return 'bg-blue-50 text-blue-700';
      if (type === 'mother') return 'bg-pink-50 text-pink-700';
      if (type === 'guardian') return 'bg-purple-50 text-purple-700';
      return 'bg-neutral-100 text-neutral-700';
}

export function getCurrentRoomIdFromMember(member: any) {
      return member?.currentRoomId ?? member?.roomId ?? null;
}

export function hasCurrentRoom(member: any) {
      return Boolean(getCurrentRoomIdFromMember(member));
}

export function getRoomActionLabel(member: any) {
      return hasCurrentRoom(member) ? 'Chuyển / Trả phòng' : 'Gán phòng';
}

export function getRoomLabelFromMember(member: any) {
      if (member?.roomCode) return member.roomCode;
      if (member?.currentRoomCode) return member.currentRoomCode;
      if (member?.roomName) return member.roomName;
      if (member?.currentRoomName) return member.currentRoomName;
      if (member?.currentRoomId) return `Phòng ID: ${member.currentRoomId}`;
      if (member?.roomId) return `Phòng ID: ${member.roomId}`;
      return 'Chưa gán';
}

export function getPrimaryContactText(member: any) {
      const contactName =
            member?.primaryParentName ??
            member?.parentName ??
            member?.contactName ??
            member?.guardianName ??
            member?.fatherName ??
            member?.motherName ??
            '';

      const contactPhone =
            member?.primaryParentPhone ??
            member?.parentPhone ??
            member?.contactPhone ??
            member?.guardianPhone ??
            member?.fatherPhone ??
            member?.motherPhone ??
            '';

      if (contactName && contactPhone) return `${contactName} - ${contactPhone}`;
      if (contactName) return contactName;
      if (contactPhone) return contactPhone;

      return 'Chưa có người liên hệ';
}

export function getSchoolText(member: any) {
      const school = member?.schoolName ?? member?.school ?? member?.universityName ?? '';
      const className = member?.className ?? member?.majorName ?? member?.major ?? '';

      if (school && className) return `${school} - ${className}`;
      if (school) return school;
      if (className) return className;

      return 'Chưa có thông tin';
}

export function getRoomLabel(room: any) {
      return room.roomCode || room.name || room.roomName || `Phòng ID: ${room.id}`;
}

export function getRoomCurrentOccupancy(room: any) {
      return Number(
            room.currentOccupancy ??
            room.occupied ??
            room.residentCount ??
            room.residentsCount ??
            room.currentResidents ??
            0
      );
}

export function getRoomCapacity(room: any) {
      return Number(room.capacity ?? room.maxCapacity ?? 0);
}

export function getRoomAvailableSlots(room: any) {
      const capacity = getRoomCapacity(room);
      const occupied = getRoomCurrentOccupancy(room);

      if (!capacity) return null;

      return Math.max(capacity - occupied, 0);
}

export function isRoomFull(room: any) {
      const available = getRoomAvailableSlots(room);

      if (available === null) return false;

      return available <= 0;
}

export function validateParentFormBeforeSave({
      parents,
      formData,
      editingParentId,
}: {
      parents: any[];
      formData: ParentFormData;
      editingParentId?: number;
}) {
      const fullName = normalizeText(formData.fullName);
      const phoneNumber = normalizePhone(formData.phoneNumber);

      if (!fullName) return 'Vui lòng nhập họ tên liên hệ.';
      if (!phoneNumber) return 'Vui lòng nhập số điện thoại liên hệ.';

      if (phoneNumber.length < 9 || phoneNumber.length > 15) {
            return 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.';
      }

      const otherParents = parents.filter(
            (parent: any) => parent.id !== editingParentId
      );

      if (
            (formData.parentType === 'father' || formData.parentType === 'mother') &&
            otherParents.some((parent: any) => parent.parentType === formData.parentType)
      ) {
            return `Học viên này đã có thông tin ${getParentTypeLabel(
                  formData.parentType
            )}. Không thể thêm trùng.`;
      }

      const duplicatedName = otherParents.some(
            (parent: any) => normalizeText(parent.fullName) === fullName
      );

      if (duplicatedName) {
            return 'Tên liên hệ này đã tồn tại cho học viên đang chọn.';
      }

      const duplicatedPhone = otherParents.some(
            (parent: any) => normalizePhone(parent.phoneNumber) === phoneNumber
      );

      if (duplicatedPhone) {
            return 'Số điện thoại này đã tồn tại cho học viên đang chọn.';
      }

      return null;
}

export function formatDate(date?: string | Date | null) {
      if (!date) return '-';

      try {
            return new Date(date).toLocaleDateString('vi-VN');
      } catch {
            return '-';
      }
}
