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
            const createdRoom = await db.createRoom(data);

            const roomId =
                  (createdRoom as any)?.id ??
                  (createdRoom as any)?.insertId ??
                  (Array.isArray(createdRoom) ? (createdRoom as any)[0]?.id : null);

            if (!roomId) {
                  throw new Error("Không thể xác định phòng vừa tạo.");
            }

            const room = await db.getRoomById(roomId);

            if (!room) {
                  throw new Error("Room not found after creation");
            }

            return room;
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
                  capacity: data.capacity,
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

            if ((resident as any).status === "transferred_out") {
                  throw new Error("Học viên đã rời lưu xá, không thể gán/chuyển phòng.");
            }

            const processDate = payload.assignedDate
                  ? new Date(payload.assignedDate)
                  : new Date();

            const currentAssignment = await db.getCurrentRoomAssignmentByResident(
                  payload.residentId
            );

            const hasCurrentRoom = Boolean(currentAssignment);

            /**
             * Trả phòng / rời phòng:
             * - Đóng assignment hiện tại bằng unassignedDate.
             * - Set residents.currentRoomId = null để nhả suất.
             * - Không xóa roomAssignments để giữ lịch sử.
             */
            if (payload.eventType === "left") {
                  if (!currentAssignment) {
                        await db.updateResidentCurrentRoom(payload.residentId, null);
                        return { success: true } as const;
                  }

                  await db.closeCurrentRoomAssignment(
                        currentAssignment.id,
                        processDate,
                        payload.reason || "Trả phòng / rời phòng"
                  );

                  await db.updateResidentCurrentRoom(payload.residentId, null);

                  return { success: true } as const;
            }

            if (!payload.roomId) {
                  throw new Error("Vui lòng chọn phòng.");
            }

            if (!hasCurrentRoom && payload.eventType !== "new_entry") {
                  throw new Error(
                        "Học viên chưa có phòng, chỉ được gán phòng mới / nhập lưu trú."
                  );
            }

            if (hasCurrentRoom && payload.eventType === "new_entry") {
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
                  currentAssignment &&
                  currentAssignment.roomId === payload.roomId
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
