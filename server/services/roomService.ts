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

export type UpdateRoomData = Partial<CreateRoomData>;

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
            const result = await db.createRoom(data);

            const roomId = result.insertId;

            const room = await db.getRoomById(roomId);

            if (!room) {
                  throw new Error("Room not found after creation");
            }

            return room;
      }

      async updateRoom(id: number, data: UpdateRoomData) {
            await db.updateRoom(id, data);

            const room = await db.getRoomById(id);

            if (!room) {
                  throw new Error("Room not found");
            }

            return room;
      }

      async deleteRoom(id: number) {
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
            roomId: number;
            assignedDate?: Date;
            eventType: RoomAssignmentEventType;
            reason?: string;
      }) {
            const resident = await db.getResidentById(payload.residentId);

            if (!resident) {
                  throw new Error("Resident not found");
            }

            const processDate = payload.assignedDate
                  ? new Date(payload.assignedDate)
                  : new Date();

            const currentAssignment = await db.getCurrentRoomAssignmentByResident(
                  payload.residentId
            );

            const hasCurrentRoom = Boolean(currentAssignment);

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

            if (payload.eventType === "left") {
                  if (!currentAssignment) {
                        throw new Error("Không tìm thấy phòng hiện tại để trả phòng.");
                  }

                  await db.closeCurrentRoomAssignment(currentAssignment.id, processDate);
                  await db.updateResidentCurrentRoom(payload.residentId, null);

                  return { success: true } as const;
            }

            const room = await db.getRoomById(payload.roomId);

            if (!room) {
                  throw new Error("Room not found");
            }

            if (
                  payload.eventType === "transfer" &&
                  currentAssignment &&
                  currentAssignment.roomId === payload.roomId
            ) {
                  throw new Error("Phòng chuyển đến không được trùng với phòng hiện tại.");
            }

            const occupancy = await db.getRoomCurrentOccupancy(payload.roomId);
            const capacity = Number(room.capacity || 0);

            if (capacity > 0 && occupancy >= capacity) {
                  throw new Error("Phòng đã đủ sức chứa, vui lòng chọn phòng khác.");
            }

            if (payload.eventType === "transfer" && currentAssignment) {
                  await db.closeCurrentRoomAssignment(currentAssignment.id, processDate);
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