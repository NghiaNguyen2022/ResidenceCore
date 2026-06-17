import * as db from "../db";

export type RoomFilters = {
      search?: string;
      capacity?: number;
      groupId?: number;
      limit?: number;
      offset?: number;
};

export type CreateRoomData = {
      roomCode: string;
      capacity: number;
      groupId?: number;
      notes?: string;
};

export type UpdateRoomData = {
      /**
       * Không cho sửa roomCode từ update room.
       * Nếu sau này thêm cột roomName, bổ sung roomName vào đây và db.updateRoom.
       */
      capacity?: number;
      groupId?: number;
      notes?: string;
};

export type RoomAssignmentEventType =
      | "new_entry"
      | "transfer"
      | "temporary_leave"
      | "left";

export class RoomService {
      private normalizeRoomCode(roomCode: string) {
            return String(roomCode || "").trim();
      }

      private getRoomCodeValue(room: any) {
            return String(room?.roomCode ?? room?.roomcode ?? room?.code ?? "").trim();
      }

      private extractInsertedRoomId(createdRoom: any) {
            return (
                  createdRoom?.id ??
                  createdRoom?.insertId ??
                  createdRoom?.[0]?.id ??
                  createdRoom?.[0]?.insertId ??
                  createdRoom?.result?.id ??
                  createdRoom?.result?.insertId ??
                  createdRoom?.rows?.[0]?.id ??
                  createdRoom?.rows?.[0]?.insertId ??
                  null
            );
      }

      private async findRoomByCode(roomCode: string) {
            const normalizedRoomCode = this.normalizeRoomCode(roomCode);

            if (!normalizedRoomCode) {
                  return null;
            }

            const rooms = await db.getRoomsWithDetails({
                  search: normalizedRoomCode,
                  limit: 50,
                  offset: 0,
            });

            const list = Array.isArray(rooms)
                  ? rooms
                  : Array.isArray((rooms as any)?.data)
                        ? (rooms as any).data
                        : Array.isArray((rooms as any)?.items)
                              ? (rooms as any).items
                              : [];

            return (
                  list.find(
                        (room: any) =>
                              this.getRoomCodeValue(room).toLowerCase() ===
                              normalizedRoomCode.toLowerCase()
                  ) ?? null
            );
      }

      async listRooms(filters?: RoomFilters) {
            return db.getRoomsWithDetails(filters);
      }

      async getRoomById(id: number) {
            const room = await db.getRoomDetails(id);

            if (!room) {
                  throw new Error("Room not found");
            }

            return room;
      }

      async createRoom(data: CreateRoomData) {
            const roomCode = this.normalizeRoomCode(data.roomCode);
            const capacity = Number(data.capacity);

            if (!roomCode) {
                  throw new Error("Vui lòng nhập mã phòng.");
            }

            if (!Number.isFinite(capacity) || capacity <= 0) {
                  throw new Error("Sức chứa phải lớn hơn 0.");
            }

            /**
             * Check trùng mã phòng trước khi insert để frontend nhận lỗi nghiệp vụ dễ hiểu,
             * không bị lộ lỗi MySQL ER_DUP_ENTRY.
             */
            const existingRoom = await this.findRoomByCode(roomCode);

            if (existingRoom) {
                  throw new Error(`Mã phòng ${roomCode} đã tồn tại. Vui lòng dùng mã phòng khác.`);
            }

            let createdRoom: any;

            try {
                  createdRoom = await db.createRoom({
                        roomCode,
                        capacity,
                        groupId: data.groupId,
                        notes: data.notes?.trim() || undefined,
                  });
            } catch (error: any) {
                  if (error?.code === "ER_DUP_ENTRY" || error?.errno === 1062) {
                        throw new Error(
                              `Mã phòng ${roomCode} đã tồn tại. Vui lòng dùng mã phòng khác.`
                        );
                  }

                  throw error;
            }

            /**
             * Với Drizzle + MySQL, kết quả insert có thể không trả id theo cùng một format.
             * Vì roomCode là unique, fallback an toàn nhất là lấy lại phòng vừa tạo bằng roomCode.
             */
            const roomId = this.extractInsertedRoomId(createdRoom);

            if (roomId) {
                  const room = await db.getRoomById(Number(roomId));

                  if (room) {
                        return room;
                  }
            }

            const roomByCode = await this.findRoomByCode(roomCode);

            if (roomByCode) {
                  return roomByCode;
            }

            throw new Error(
                  "Phòng đã được tạo nhưng chưa thể tải lại dữ liệu. Vui lòng làm mới danh sách."
            );
      }

      async updateRoom(id: number, data: UpdateRoomData) {
            const room = await db.getRoomById(id);

            if (!room) {
                  throw new Error("Room not found");
            }

            /**
             * Không cho giảm sức chứa nhỏ hơn số học viên đang ở.
             */
            if (data.capacity !== undefined) {
                  const capacity = Number(data.capacity);

                  if (!Number.isFinite(capacity) || capacity <= 0) {
                        throw new Error("Sức chứa phải lớn hơn 0.");
                  }

                  const occupancy = await db.getRoomCurrentOccupancy(id);

                  if (capacity < occupancy) {
                        throw new Error(
                              "Sức chứa không được nhỏ hơn số học viên hiện đang ở trong phòng."
                        );
                  }
            }

            /**
             * Chủ động loại bỏ roomCode nếu frontend gửi nhầm.
             */
            const safeData: UpdateRoomData = {
                  capacity:
                        data.capacity !== undefined ? Number(data.capacity) : undefined,
                  groupId: data.groupId,
                  notes: data.notes,
            };

            await db.updateRoom(id, safeData);

            const updatedRoom = await db.getRoomById(id);

            if (!updatedRoom) {
                  throw new Error("Room not found");
            }

            return updatedRoom;
      }

      async deleteRoom(id: number) {
            const occupancy = await db.getRoomCurrentOccupancy(id);

            if (occupancy > 0) {
                  throw new Error("Không thể xóa phòng đang có học viên lưu trú.");
            }

            await db.deleteRoom(id);

            return { success: true } as const;
      }

      async getStats() {
            return db.getRoomsStats();
      }

      async getResidents(roomId: number) {
            return db.getResidentsInRoom(roomId);
      }

      async assignResident(payload: {
            residentId: number;
            roomId?: number;
            assignedDate?: Date;
            eventType: RoomAssignmentEventType;
            reason?: string;
      }) {
            const resident = await db.getResidentById(payload.residentId);

            if (!resident) {
                  throw new Error("Không tìm thấy học viên.");
            }

            const residentStatus = String((resident as any).status || "");
            const residentHasCurrentRoom = Boolean((resident as any).currentRoomId);
            const currentRoomId = (resident as any).currentRoomId
                  ? Number((resident as any).currentRoomId)
                  : null;

            /**
             * Nghiệp vụ phòng hiện tại phải dựa trên residents.currentRoomId.
             * roomAssignments chỉ là lịch sử/đối soát và có thể còn dữ liệu cũ.
             */
            if (
                  ["transferred_out", "left", "inactive"].includes(residentStatus) &&
                  payload.eventType !== "left"
            ) {
                  throw new Error("Học viên đã rời/ngừng lưu trú, không thể gán/chuyển phòng.");
            }

            const processDate = payload.assignedDate
                  ? new Date(payload.assignedDate)
                  : new Date();

            const currentAssignment = await db.getCurrentRoomAssignmentByResident(
                  payload.residentId
            );

            /**
             * Trả phòng / rời phòng:
             * - Đóng assignment đang mở nếu có.
             * - Set residents.currentRoomId = null để nhả suất.
             * - Không xóa roomAssignments để giữ lịch sử phòng.
             */
            if (payload.eventType === "left") {
                  if (currentAssignment) {
                        await db.closeCurrentRoomAssignment(
                              currentAssignment.id,
                              processDate,
                              payload.reason || "Trả phòng / rời phòng"
                        );
                  }

                  await db.updateResidentCurrentRoom(payload.residentId, null);

                  return { success: true } as const;
            }

            if (!payload.roomId) {
                  throw new Error("Vui lòng chọn phòng.");
            }

            if (!residentHasCurrentRoom && payload.eventType !== "new_entry") {
                  throw new Error(
                        "Học viên chưa có phòng, chỉ được gán phòng mới / nhập lưu trú."
                  );
            }

            if (residentHasCurrentRoom && payload.eventType === "new_entry") {
                  throw new Error(
                        "Học viên đã có phòng, chỉ được chuyển phòng hoặc trả phòng."
                  );
            }

            const room = await db.getRoomById(payload.roomId);

            if (!room) {
                  throw new Error("Không tìm thấy phòng.");
            }

            if (
                  payload.eventType === "transfer" &&
                  currentRoomId &&
                  currentRoomId === Number(payload.roomId)
            ) {
                  throw new Error("Phòng chuyển đến không được trùng với phòng hiện tại.");
            }

            const occupancy = await db.getRoomCurrentOccupancy(payload.roomId);
            const capacity = Number((room as any).capacity || 0);

            if (capacity > 0 && occupancy >= capacity) {
                  throw new Error("Phòng đã đủ sức chứa, vui lòng chọn phòng khác.");
            }

            if (payload.eventType === "transfer" && currentAssignment) {
                  await db.closeCurrentRoomAssignment(
                        currentAssignment.id,
                        processDate,
                        payload.reason || "Chuyển phòng"
                  );
            }

            /**
             * Nếu currentRoomId đang null nhưng còn assignment mở do dữ liệu cũ,
             * đóng assignment cũ trước khi tạo dòng mới để tránh tính sai sức chứa.
             */
            if (payload.eventType === "new_entry" && currentAssignment && !residentHasCurrentRoom) {
                  await db.closeCurrentRoomAssignment(
                        currentAssignment.id,
                        processDate,
                        "Đóng dữ liệu phòng cũ trước khi gán phòng mới"
                  );
            }

            await db.assignResidentToRoom({
                  residentId: payload.residentId,
                  roomId: payload.roomId,
                  assignedDate: processDate,
                  eventType: payload.eventType,
                  reason: payload.reason,
            });

            await db.updateResidentCurrentRoom(payload.residentId, payload.roomId);

            return { success: true } as const;
      }

      async appointLeader(payload: {
            roomId: number;
            residentId: number;
            notes?: string;
      }) {
            await db.appointRoomLeader({
                  roomId: payload.roomId,
                  residentId: payload.residentId,
                  appointedDate: new Date(),
                  notes: payload.notes,
            });

            return { success: true } as const;
      }

      async getLeader(roomId: number) {
            return db.getRoomLeader(roomId);
      }

      async getLeaderHistory(roomId: number) {
            return db.getRoomLeaderHistory(roomId);
      }
}

export const roomService = new RoomService();
