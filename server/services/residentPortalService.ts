import * as db from "../db";
import { hashPassword, verifyPassword } from "./authService";

function toDateString(value: unknown) {
      if (!value) return null;

      if (value instanceof Date) {
            return value.toISOString();
      }

      return value;
}

function getResidentDisplayName(resident: any) {
      const holyName = resident?.holyName ? `${resident.holyName} ` : "";
      return `${holyName}${resident?.fullName || ""}`.trim();
}

function sanitizeUser(user: any) {
      if (!user) return null;

      return {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            roles: user.roles,
            primaryRole: user.primaryRole,
            isActive: user.isActive,
            mustChangePassword: user.mustChangePassword,
            lastSignedIn: toDateString(user.lastSignedIn),
            createdAt: toDateString(user.createdAt),
            updatedAt: toDateString(user.updatedAt),
      };
}

function sanitizeMember(member: any) {
      if (!member) return null;

      return {
            id: member.id,
            residentCode: member.residentCode,
            holyName: member.holyName,
            fullName: member.fullName,
            displayName: getResidentDisplayName(member),
            dateOfBirth: toDateString(member.dateOfBirth),
            gender: member.gender,
            idNumber: member.idNumber,
            permanentAddress: member.permanentAddress,
            phoneNumber: member.phoneNumber,
            schoolId: member.schoolId,
            profileImage: member.profileImage,
            admissionDate: toDateString(member.admissionDate),
            departureDate: toDateString(member.departureDate),
            status: member.status,
            notes: member.notes,
            userId: member.userId,
            currentRoomId: member.currentRoomId,

            roomCode: member.roomCode,
            roomName: member.roomName,
            currentRoomCode: member.currentRoomCode,
            currentRoomName: member.currentRoomName,

            primaryContactType: member.primaryContactType,
            primaryContactName: member.primaryContactName,
            primaryContactPhone: member.primaryContactPhone,
            primaryContactEmail: member.primaryContactEmail,

            createdAt: toDateString(member.createdAt),
            updatedAt: toDateString(member.updatedAt),
      };
}

function sanitizeRoom(room: any, residentsCount?: number) {
      if (!room) return null;

      const capacity = Number(room.capacity || 0);
      const occupied = Number(
            residentsCount ??
            room.residentsCount ??
            room.residents?.length ??
            0
      );

      return {
            id: room.id,
            roomCode: room.roomCode,
            roomName: room.roomName ?? room.roomCode,
            capacity,
            residentsCount: occupied,
            availableSlots: Math.max(capacity - occupied, 0),
            groupId: room.groupId,
            notes: room.notes,
            createdAt: toDateString(room.createdAt),
            updatedAt: toDateString(room.updatedAt),
      };
}

function sanitizeRoommate(item: any) {
      const resident = item?.resident ?? item;

      return {
            id: resident.id,
            residentId: resident.id,
            residentCode: resident.residentCode,
            holyName: resident.holyName,
            fullName: resident.fullName,
            displayName: getResidentDisplayName(resident),
            gender: resident.gender,
            phoneNumber: resident.phoneNumber,
            status: resident.status,
            schoolId: resident.schoolId,
      };
}

function sanitizeContact(contact: any) {
      if (!contact) return null;

      return {
            id: contact.id,
            residentId: contact.residentId,
            parentType: contact.parentType,
            fullName: contact.fullName,
            phoneNumber: contact.phoneNumber,
            email: contact.email,
            idNumber: contact.idNumber,
            occupation: contact.occupation,
            address: contact.address,
            notes: contact.notes,
            createdAt: toDateString(contact.createdAt),
            updatedAt: toDateString(contact.updatedAt),
      };
}

export const residentPortalService = {
      async me(userId: number) {
            if (!userId) {
                  throw new Error("Vui lòng đăng nhập để xem hồ sơ.");
            }

            const user = await db.getUserById(userId);

            if (!user) {
                  throw new Error("Không tìm thấy tài khoản đăng nhập.");
            }

            const linkedResident = await db.getResidentLinkedToUser(userId);

            if (!linkedResident?.id) {
                  throw new Error("Tài khoản chưa được liên kết với hồ sơ học viên.");
            }

            const member = await db.getResidentById(linkedResident.id);

            if (!member) {
                  throw new Error("Không tìm thấy hồ sơ học viên.");
            }

            const contacts = await db.getParentsByResidentId(member.id);

            let room = null;
            let roommates: any[] = [];

            if (member.currentRoomId) {
                  const roomDetails = await db.getRoomDetails(member.currentRoomId);
                  const residentsInRoom = await db.getResidentsInRoom(
                        member.currentRoomId
                  );

                  const roommateRows = residentsInRoom
                        .filter((item: any) => item.residentId !== member.id)
                        .map(sanitizeRoommate)
                        .filter((item: any) => item.status !== "transferred_out");

                  room = sanitizeRoom(roomDetails, residentsInRoom.length);
                  roommates = roommateRows;
            }

            return {
                  member: sanitizeMember(member),
                  user: sanitizeUser(user),
                  room,
                  roommates,
                  contacts: contacts.map(sanitizeContact).filter(Boolean),
            };
      },

      async changePassword(input: {
            userId: number;
            currentPassword: string;
            newPassword: string;
            confirmPassword: string;
      }) {
            const currentPassword = input.currentPassword?.trim();
            const newPassword = input.newPassword?.trim();
            const confirmPassword = input.confirmPassword?.trim();

            if (!input.userId) {
                  throw new Error("Vui lòng đăng nhập để đổi mật khẩu.");
            }

            if (!currentPassword) {
                  throw new Error("Vui lòng nhập mật khẩu hiện tại.");
            }

            if (!newPassword) {
                  throw new Error("Vui lòng nhập mật khẩu mới.");
            }

            if (newPassword.length < 6) {
                  throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
            }

            if (newPassword !== confirmPassword) {
                  throw new Error("Xác nhận mật khẩu mới chưa khớp.");
            }

            const user = await db.getUserById(input.userId);

            if (!user) {
                  throw new Error("Không tìm thấy tài khoản đăng nhập.");
            }

            if (!user.isActive) {
                  throw new Error("Tài khoản đang bị khóa, không thể đổi mật khẩu.");
            }

            const isCurrentPasswordValid = await verifyPassword(
                  currentPassword,
                  user.passwordHash
            );

            if (!isCurrentPasswordValid) {
                  throw new Error("Mật khẩu hiện tại không đúng.");
            }

            const passwordHash = await hashPassword(newPassword);

            const updatedUser = await db.changeMyPassword({
                  userId: input.userId,
                  passwordHash,
            });

            return {
                  success: true,
                  user: sanitizeUser(updatedUser),
            };
      },
};