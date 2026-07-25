import * as db from "../db";
import * as financeDb from "../db/finance";
import { getResidentPortalAccessContext } from "./residentPortalAccessService";
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


function isInactiveResidentStatus(status?: string | null) {
      return ["inactive", "transferred_out", "left"].includes(String(status || "").toLowerCase());
}

function assertActivePortalUser<T extends { id?: unknown; isActive?: boolean | null; passwordHash?: string | null } | null | undefined>(
      user: T,
): asserts user is NonNullable<T> & { id: number; isActive?: boolean; passwordHash: string } {
      if (!user) {
            throw new Error("Không tìm thấy tài khoản đăng nhập.");
      }

      if (!user.isActive) {
            throw new Error("Tài khoản đang bị khóa, không thể truy cập cổng học viên.");
      }
}

function assertActiveLinkedResident<
      T extends { id?: unknown; status?: string | null; fullName?: string | null; residentCode?: string | null } | null | undefined,
>(
      resident: T,
): asserts resident is NonNullable<T> & { id: number; status?: string | null; fullName?: string | null; residentCode?: string | null } {
      if (!resident?.id) {
            throw new Error("Tài khoản chưa được liên kết với hồ sơ học viên.");
      }

      if (isInactiveResidentStatus(resident.status)) {
            throw new Error("Hồ sơ học viên đã ngừng/rời lưu xá, không thể truy cập cổng học viên.");
      }
}

export const residentPortalService = {
      async me(userId: number) {
            if (!userId) {
                  throw new Error("Vui lòng đăng nhập để xem hồ sơ.");
            }

            const user = await db.getUserById(userId);

            assertActivePortalUser(user);

            const linkedResident = await db.getResidentLinkedToUser(userId);
            assertActiveLinkedResident(linkedResident);

            const member = await db.getResidentById(linkedResident.id);

            if (!member) {
                  throw new Error("Không tìm thấy hồ sơ học viên.");
            }

            assertActiveLinkedResident(member);

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



      async getMyFinanceOverview(userId: number) {
            if (!userId) {
                  throw new Error("Vui lòng đăng nhập để xem tài chính.");
            }

            const linkedResident = await db.getResidentLinkedToUser(userId);
            assertActiveLinkedResident(linkedResident);

            const accessContext = await getResidentPortalAccessContext(userId);
            const unitTargets = (accessContext.roles || [])
                  .filter((role: any) => ["team_leader", "committee_head"].includes(String(role.roleCode || "")))
                  .map((role: any) => ({
                        unitId: role.unitId || null,
                        unitName: role.unitName || null,
                        unitType: role.unitType || (role.roleCode === "team_leader" ? "team" : "committee"),
                  }))
                  .filter((unit: any) => unit.unitName);

            return financeDb.getFinancePortalOverview({
                  residentId: Number(linkedResident.id),
                  residentName: linkedResident.fullName,
                  residentCode: linkedResident.residentCode,
                  unitTargets,
            });
      },

      async createMyAdvanceExpenseEntry(input: {
            userId: number;
            advanceId: number;
            amount: number;
            transactionDate?: string | null;
            description?: string | null;
      }) {
            if (!input.userId) {
                  throw new Error("Vui lòng đăng nhập để cập nhật tạm ứng.");
            }

            const overview = await this.getMyFinanceOverview(input.userId);
            const allowedAdvances = [
                  ...((overview as any).personalAdvances || []),
                  ...((overview as any).unitAdvances || []),
            ];
            const canUpdate = allowedAdvances.some((advance: any) => Number(advance.id) === Number(input.advanceId));

            if (!canUpdate) {
                  throw new Error("Bạn không có quyền cập nhật khoản tạm ứng này.");
            }

            return financeDb.createFinanceAdvanceSpendingEntry({
                  advanceId: input.advanceId,
                  amount: input.amount,
                  transactionDate: input.transactionDate,
                  description: input.description,
                  createdBy: input.userId,
            });
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

            assertActivePortalUser(user);

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
