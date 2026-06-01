import { getDb } from "./connection";

import { and, count, desc, eq, isNull, like } from "drizzle-orm";

import {
  InsertRoom,
  InsertRoomAssignment,
  InsertRoomLeader,
  residents,
  roomAssignments,
  roomLeaders,
  rooms,
} from "../../drizzle/schema";

export async function createRoom(data: InsertRoom) {
  const db = getDb();

  return await db.insert(rooms).values(data);
}

export async function getRoomById(id: number) {
  const db = getDb();

  const result = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getRooms(filters?: {
  search?: string;
  capacity?: number;
  groupId?: number;
  limit?: number;
  offset?: number;
}) {
  const db = getDb();

  let query: any = db.select().from(rooms);

  const conditions = [];

  if (filters?.search?.trim()) {
    conditions.push(like(rooms.roomCode, `%${filters.search.trim()}%`));
  }

  if (filters?.capacity) {
    conditions.push(eq(rooms.capacity, filters.capacity));
  }

  if (filters?.groupId) {
    conditions.push(eq(rooms.groupId, filters.groupId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}

export async function updateRoom(id: number, data: Partial<InsertRoom>) {
  const db = getDb();

  return await db.update(rooms).set(data).where(eq(rooms.id, id));
}

export async function deleteRoom(id: number) {
  const db = getDb();

  return await db.delete(rooms).where(eq(rooms.id, id));
}

export async function getRoomsStats() {
  const db = getDb();

  const total = await db.select({ count: count() }).from(rooms);

  return {
    total: total[0]?.count || 0,
  };
}

export async function getRoomDetails(roomId: number) {
  const room = await getRoomById(roomId);

  if (!room) return null;

  const residentsInRoom = await getResidentsInRoom(roomId);
  const residentsCount = residentsInRoom.length;

  return {
    ...room,
    residents: residentsInRoom,
    residentsCount,
  };
}

export async function getRoomsWithDetails(filters?: {
  search?: string;
  capacity?: number;
  groupId?: number;
  limit?: number;
  offset?: number;
}) {
  const roomsList = await getRooms(filters);

  return await Promise.all(
    roomsList.map(async (room: any) => {
      const residentsCount = await getRoomCurrentOccupancy(room.id);

      return {
        ...room,
        residentsCount,
      };
    })
  );
}

export async function assignResidentToRoom(data: InsertRoomAssignment) {
  const db = getDb();

  return await db.insert(roomAssignments).values(data);
}

export async function getCurrentRoomAssignmentByResident(residentId: number) {
  const db = getDb();

  const result = await db
    .select()
    .from(roomAssignments)
    .where(
      and(
        eq(roomAssignments.residentId, residentId),
        isNull(roomAssignments.unassignedDate)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function closeCurrentRoomAssignment(
  assignmentId: number,
  unassignedDate: Date
) {
  const db = getDb();

  return await db
    .update(roomAssignments)
    .set({
      unassignedDate,
    })
    .where(eq(roomAssignments.id, assignmentId));
}

export async function updateResidentCurrentRoom(
  residentId: number,
  roomId: number | null
) {
  const db = getDb();

  return await db
    .update(residents)
    .set({
      currentRoomId: roomId,
      updatedAt: new Date(),
    })
    .where(eq(residents.id, residentId));
}

export async function getRoomAssignmentHistory(residentId: number) {
  const db = getDb();

  return await db
    .select()
    .from(roomAssignments)
    .where(eq(roomAssignments.residentId, residentId))
    .orderBy(desc(roomAssignments.assignedDate));
}

export async function getResidentsInRoom(roomId: number) {
  const db = getDb();

  return await db
    .select({
      id: roomAssignments.id,
      residentId: roomAssignments.residentId,
      roomId: roomAssignments.roomId,
      assignedDate: roomAssignments.assignedDate,
      unassignedDate: roomAssignments.unassignedDate,
      eventType: roomAssignments.eventType,
      reason: roomAssignments.reason,
      resident: residents,
    })
    .from(roomAssignments)
    .innerJoin(residents, eq(roomAssignments.residentId, residents.id))
    .where(
      and(
        eq(roomAssignments.roomId, roomId),
        isNull(roomAssignments.unassignedDate)
      )
    )
    .orderBy(roomAssignments.assignedDate);
}

export async function isRoomAvailable(roomId: number, capacity: number) {
  const residentsInRoom = await getResidentsInRoom(roomId);

  return residentsInRoom.length < capacity;
}

export async function getRoomCurrentOccupancy(roomId: number) {
  const residentsInRoom = await getResidentsInRoom(roomId);

  return residentsInRoom.length;
}

export async function appointRoomLeader(data: InsertRoomLeader) {
  const db = getDb();

  return await db.insert(roomLeaders).values(data);
}

export async function getCurrentRoomLeader(roomId: number) {
  const db = getDb();

  const result = await db
    .select()
    .from(roomLeaders)
    .where(
      and(eq(roomLeaders.roomId, roomId), isNull(roomLeaders.unappointedDate))
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getRoomLeader(roomId: number) {
  return getCurrentRoomLeader(roomId);
}

export async function getRoomLeaderHistory(roomId: number) {
  const db = getDb();

  return await db
    .select()
    .from(roomLeaders)
    .where(eq(roomLeaders.roomId, roomId))
    .orderBy(desc(roomLeaders.appointedDate));
}

export async function removeRoomLeader(id: number, unappointedDate: Date) {
  const db = getDb();

  return await db
    .update(roomLeaders)
    .set({ unappointedDate })
    .where(eq(roomLeaders.id, id));
}