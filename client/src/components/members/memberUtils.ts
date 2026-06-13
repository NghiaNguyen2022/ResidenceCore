import type { ParentFormData } from './memberTypes';
import { normalizeText } from '@/lib/text';

export { normalizeText };

export function normalizePhone(value?: string) {
      return (value || '').replace(/[^\d]/g, '');
}

export function getRawResidentStatus(member: any) {
      return member?.status || member?.residenceStatus || '';
}

export function isResidentLeft(member: any) {
      const status = getRawResidentStatus(member);

      return (
            status === 'transferred_out' ||
            status === 'left' ||
            status === 'Đã rời lưu xá'
      );
}

export function isResidentInactive(member: any) {
      const status = getRawResidentStatus(member);

      return (
            status === 'inactive' ||
            status === 'temporary_leave' ||
            status === 'Tạm ngưng' ||
            status === 'Tạm vắng'
      );
}

export function getStatusClass(status?: string) {
      if (status === 'active') return 'border-green-200 bg-green-50 text-green-700';
      if (status === 'transferred_out' || status === 'left') return 'border-red-200 bg-red-50 text-red-700';
      if (status === 'inactive' || status === 'temporary_leave') return 'border-orange-200 bg-orange-50 text-orange-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

export function getStatusBadgeClass(member: any) {
      if (isResidentLeft(member)) {
            return 'bg-rose-50 text-rose-700 ring-rose-200';
      }

      if (isResidentInactive(member)) {
            return 'bg-amber-50 text-amber-700 ring-amber-200';
      }

      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
}

export function getStatusLabel(status?: string | null) {
      switch (status) {
            case 'active':
                  return 'Đang lưu trú';
            case 'inactive':
                  return 'Tạm ngưng';
            case 'temporary_leave':
                  return 'Tạm vắng';
            case 'transferred_out':
            case 'left':
                  return 'Đã rời lưu xá';
            default:
                  return 'Đang lưu trú';
      }
}

export function getGenderLabel(gender?: string) {
      if (gender === 'male') return 'Nam';
      if (gender === 'female') return 'Nữ';
      if (gender === 'other') return 'Khác';
      return '-';
}

export function getParentTypeLabel(type?: string | null) {
      if (type === 'father') return 'Cha';
      if (type === 'mother') return 'Mẹ';
      if (type === 'guardian') return 'Người giám hộ';
      return 'Liên hệ';
}

export function getParentTypeClass(type?: string) {
      if (type === 'father') return 'bg-blue-50 text-blue-700';
      if (type === 'mother') return 'bg-pink-50 text-pink-700';
      if (type === 'guardian') return 'bg-purple-50 text-purple-700';
      return 'bg-neutral-100 text-neutral-700';
}

export function getDisplayName(member: any) {
      if (member?.holyName && member?.fullName) {
            return `${member.holyName} ${member.fullName}`;
      }

      return member?.fullName || member?.name || 'Chưa có tên';
}

export function getCurrentRoomIdFromMember(member: any) {
      /**
       * Chỉ trả về phòng hiện tại. Không fallback sang roomId/room object
       * vì các field đó có thể là dữ liệu lịch sử hoặc fallback hiển thị.
       */
      return member?.currentRoomId ?? null;
}

export function hasCurrentRoom(member: any) {
      /**
       * Chỉ dùng currentRoom* để quyết định nghiệp vụ phòng hiện tại.
       * Không dùng roomId/roomCode/roomName vì các field đó có thể là fallback/lịch sử.
       */
      return Boolean(
            member?.currentRoomId ||
            member?.currentRoomName ||
            member?.currentRoomCode ||
            member?.currentRoomNumber
      );
}

export function hasAnyRoomDisplayData(member: any) {
      /**
       * Giữ logic rộng cũ để phục vụ hiển thị/fallback khi cần,
       * nhưng không dùng hàm này để quyết định gán/chuyển/trả phòng.
       */
      return Boolean(
            member?.currentRoomId ||
            member?.currentRoomName ||
            member?.currentRoomCode ||
            member?.currentRoomNumber ||
            member?.roomId ||
            member?.roomName ||
            member?.roomCode ||
            member?.roomNumber ||
            member?.room?.id ||
            member?.room?.roomId ||
            member?.room?.roomName ||
            member?.room?.roomCode ||
            member?.room?.roomNumber
      );
}

export function getRoomActionLabel(member: any) {
      return hasCurrentRoom(member) ? 'Chuyển / Trả phòng' : 'Gán phòng';
}

export function getRoomLabelFromMember(member: any) {
      if (isResidentLeft(member)) return 'Đã rời lưu xá';
      if (isResidentInactive(member)) return 'Tạm ngưng lưu trú';

      if (member?.currentRoomName) return member.currentRoomName;
      if (member?.currentRoomCode) return member.currentRoomCode;
      if (member?.currentRoomNumber) return member.currentRoomNumber;

      if (member?.roomName) return member.roomName;
      if (member?.roomCode) return member.roomCode;
      if (member?.roomNumber) return member.roomNumber;

      if (member?.room?.roomName) return member.room.roomName;
      if (member?.room?.roomCode) return member.room.roomCode;
      if (member?.room?.roomNumber) return member.room.roomNumber;

      if (member?.currentRoomId) return `Phòng ID: ${member.currentRoomId}`;
      if (member?.roomId) return `Phòng ID: ${member.roomId}`;
      if (member?.room?.id) return `Phòng ID: ${member.room.id}`;
      if (member?.room?.roomId) return `Phòng ID: ${member.room.roomId}`;

      return 'Chưa gán';
}

export function hasPrimaryContact(member: any) {
      return Boolean(
            (member?.primaryContactName && member?.primaryContactPhone) ||
            (member?.primaryParentName && member?.primaryParentPhone) ||
            (member?.parentName && member?.parentPhone) ||
            (member?.contactName && member?.contactPhone)
      );
}

export function getPrimaryContactText(member: any) {
      if (member?.primaryContactName && member?.primaryContactPhone) {
            return `${getParentTypeLabel(member.primaryContactType)} - ${member.primaryContactName} - ${member.primaryContactPhone}`;
      }

      if (member?.primaryContactName) {
            return `${getParentTypeLabel(member.primaryContactType)} - ${member.primaryContactName}`;
      }

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

export function hasUserAccount(member: any) {
      return Boolean(member?.userId);
}

export function isUserAccountLocked(member: any) {
      if (!hasUserAccount(member)) return false;

      const isAccountInactive =
            member?.userIsActive === false ||
            member?.isUserActive === false ||
            member?.accountIsActive === false;

      return isAccountInactive || isResidentLeft(member) || isResidentInactive(member);
}

export function getAccountBadge(member: any) {
      if (!hasUserAccount(member)) {
            return {
                  label: 'Chưa có tài khoản',
                  className: 'bg-amber-50 text-amber-700 ring-amber-200',
            };
      }

      if (isUserAccountLocked(member)) {
            return {
                  label: 'Đã khóa tài khoản',
                  className: 'bg-slate-100 text-slate-600 ring-slate-300',
            };
      }

      return {
            label: 'Đã có tài khoản',
            className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      };
}

export function getAttentionItems(member: any) {
      if (isResidentLeft(member)) {
            return [];
      }

      const items: string[] = [];

      if (!hasCurrentRoom(member)) {
            items.push('Chưa có phòng');
      }

      if (!hasUserAccount(member)) {
            items.push('Chưa có tài khoản');
      }

      if (!hasPrimaryContact(member)) {
            items.push('Thiếu liên hệ');
      }

      return items;
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

export { formatDate } from '@/lib/format';
