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

export type UpdateRoomData = Partial<Omit<CreateRoomData, "roomCode">>;

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
    eventType: "new_entry" | "transfer" | "temporary_leave" | "left";
    reason?: string;
  }) {
    const resident = await db.getResidentById(payload.residentId);
    if (!resident) {
      throw new Error("Resident not found");
    }

    const room = await db.getRoomById(payload.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    await db.assignResidentToRoom({
      residentId: payload.residentId,
      roomId: payload.roomId,
      assignedDate: new Date(),
      eventType: payload.eventType,
      reason: payload.reason,
    });

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
