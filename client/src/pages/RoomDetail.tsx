/**
 * ============================================
 * ROOM DETAIL PAGE
 * ============================================
 * Xem chi tiết phòng - danh sách học viên, trưởng phòng, lịch sử
 * File: client/src/pages/RoomDetail.tsx
 */

import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ResidenceCareLayout } from "../components/ResidenceCareLayout";
import { trpc } from "../lib/trpc";

interface RoomDetail {
  id: number;
  roomCode: string;
  capacity: number;
  currentOccupancy: number;
  available: number;
  isFull: boolean;
  notes: string | null;
  group: {
    id: number;
    groupCode: string;
    groupName: string;
  } | null;
  leader: {
    id: number;
    residentId: number;
    residentCode: string;
    fullName: string;
    appointedDate: string;
  } | null;
  residents: Array<{
    id: number;
    residentCode: string;
    fullName: string;
    phoneNumber: string | null;
    schoolId: number | null;
    admissionDate: string;
    assignedDate: string;
  }>;
  history: Array<{
    id: number;
    residentId: number;
    residentCode: string;
    fullName: string;
    assignedDate: string;
    unassignedDate: string | null;
    eventType: string;
    reason: string | null;
    notes: string | null;
  }>;
}

/**
 * Room Detail Page Component
 */
export default function RoomDetail() {
  const { roomId } = useParams<{ roomId: string }>();
  const [, navigate] = useLocation();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "residents" | "history">("overview");
  const [showAppointLeaderForm, setShowAppointLeaderForm] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState<number | "">("");

  // tRPC query
  const roomQuery = trpc.rooms.getById.useQuery(Number(roomId));
  const appointLeaderMutation = trpc.rooms.appointLeader.useMutation();

  // Load data
  useEffect(() => {
    if (roomQuery.data?.success) {
      setRoom(roomQuery.data.data);
    }
    setLoading(roomQuery.isLoading);
  }, [roomQuery.data, roomQuery.isLoading]);

  const handleAppointLeader = async () => {
    if (!selectedResidentId) {
      alert("Vui lòng chọn học viên");
      return;
    }

    try {
      const result = await appointLeaderMutation.mutateAsync({
        roomId: Number(roomId),
        residentId: Number(selectedResidentId),
        appointedDate: new Date(),
      });

      if (result.success) {
        alert("Bổ nhiệm trưởng phòng thành công");
        setShowAppointLeaderForm(false);
        setSelectedResidentId("");
        roomQuery.refetch();
      } else {
        alert(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      console.error("Appoint leader error:", error);
      alert("Lỗi bổ nhiệm trưởng phòng");
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatEventType = (type: string) => {
    const types: Record<string, string> = {
      new_entry: "Vào mới",
      transfer: "Chuyển phòng",
      left: "Rời lưu trú",
      temporary_leave: "Tạm rời",
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <ResidenceCareLayout>
        <div className="px-6 py-8 max-w-7xl mx-auto w-full">
          <div className="text-center py-12">
            <p className="text-neutral-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </ResidenceCareLayout>
    );
  }

  if (!room) {
    return (
      <ResidenceCareLayout>
        <div className="px-6 py-8 max-w-7xl mx-auto w-full">
          <div className="text-center py-12">
            <p className="text-neutral-600">Phòng không tồn tại</p>
            <button
              onClick={() => navigate("/rooms")}
              className="btn-primary mt-4"
            >
              Quay lại
            </button>
          </div>
        </div>
      </ResidenceCareLayout>
    );
  }

  return (
    <ResidenceCareLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/rooms")}
            className="text-blue-600 hover:text-blue-700 mb-4 text-body-md"
          >
            ← Quay lại
          </button>
          <h1 className="text-display-lg text-neutral-900 mb-2">
            Phòng {room.roomCode}
          </h1>
          <p className="text-body-md text-neutral-600">
            Sức chứa: {room.capacity} chỗ | Hiện tại: {room.currentOccupancy}/{room.capacity}
          </p>
        </div>

        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-elevated">
            <div className="p-6">
              <h3 className="text-body-sm text-neutral-600 mb-2">Sức Chứa</h3>
              <p className="text-display-md text-neutral-900">{room.capacity} chỗ</p>
            </div>
          </div>

          <div className="card-elevated">
            <div className="p-6">
              <h3 className="text-body-sm text-neutral-600 mb-2">Hiện Tại</h3>
              <p className="text-display-md text-neutral-900">
                {room.currentOccupancy}/{room.capacity}
              </p>
              <p className="text-body-sm text-neutral-600 mt-2">
                {room.available} chỗ trống
              </p>
            </div>
          </div>

          <div className="card-elevated">
            <div className="p-6">
              <h3 className="text-body-sm text-neutral-600 mb-2">Tỷ Lệ</h3>
              <p className="text-display-md text-neutral-900">
                {Math.round((room.currentOccupancy / room.capacity) * 100)}%
              </p>
              <div className="w-full bg-neutral-200 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full transition-all ${
                    room.isFull ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (room.currentOccupancy / room.capacity) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card-elevated mb-6">
          <div className="border-b border-neutral-200 flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 text-body-md font-medium border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Tổng Quan
            </button>
            <button
              onClick={() => setActiveTab("residents")}
              className={`px-6 py-4 text-body-md font-medium border-b-2 transition-colors ${
                activeTab === "residents"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Học Viên ({room.residents.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-4 text-body-md font-medium border-b-2 transition-colors ${
                activeTab === "history"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Lịch Sử
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Room Info */}
                <div>
                  <h3 className="text-body-lg font-semibold text-neutral-900 mb-4">
                    Thông Tin Phòng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-body-sm text-neutral-600">Mã Phòng</p>
                      <p className="text-body-md font-semibold text-neutral-900">
                        {room.roomCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-body-sm text-neutral-600">Sức Chứa</p>
                      <p className="text-body-md font-semibold text-neutral-900">
                        {room.capacity} chỗ
                      </p>
                    </div>
                    <div>
                      <p className="text-body-sm text-neutral-600">Tổ</p>
                      <p className="text-body-md font-semibold text-neutral-900">
                        {room.group ? room.group.groupName : "Không có"}
                      </p>
                    </div>
                    <div>
                      <p className="text-body-sm text-neutral-600">Trạng Thái</p>
                      <p className="text-body-md font-semibold text-neutral-900">
                        {room.isFull ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-body-sm">
                            Đầy
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-body-sm">
                            Có sẵn
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {room.notes && (
                    <div className="mt-4">
                      <p className="text-body-sm text-neutral-600">Ghi Chú</p>
                      <p className="text-body-md text-neutral-900">{room.notes}</p>
                    </div>
                  )}
                </div>

                {/* Room Leader */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-body-lg font-semibold text-neutral-900">
                      Trưởng Phòng
                    </h3>
                    <button
                      onClick={() => setShowAppointLeaderForm(true)}
                      className="btn-primary-sm"
                    >
                      {room.leader ? "Thay Đổi" : "Bổ Nhiệm"}
                    </button>
                  </div>

                  {room.leader ? (
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <p className="text-body-sm text-neutral-600">Tên</p>
                      <p className="text-body-md font-semibold text-neutral-900">
                        {room.leader.fullName}
                      </p>
                      <p className="text-body-sm text-neutral-600 mt-2">Mã Lưu Trú</p>
                      <p className="text-body-md font-semibold text-neutral-900">
                        {room.leader.residentCode}
                      </p>
                      <p className="text-body-sm text-neutral-600 mt-2">Ngày Bổ Nhiệm</p>
                      <p className="text-body-md font-semibold text-neutral-900">
                        {formatDate(room.leader.appointedDate)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-neutral-600">Chưa có trưởng phòng</p>
                  )}

                  {/* Appoint Leader Form */}
                  {showAppointLeaderForm && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-body-md font-semibold text-neutral-900 mb-3">
                        Bổ Nhiệm Trưởng Phòng
                      </h4>
                      <select
                        value={selectedResidentId}
                        onChange={(e) =>
                          setSelectedResidentId(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className="input-field mb-3"
                      >
                        <option value="">Chọn học viên...</option>
                        {room.residents.map((resident) => (
                          <option key={resident.id} value={resident.id}>
                            {resident.fullName} ({resident.residentCode})
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAppointLeader}
                          className="btn-primary flex-1"
                          disabled={appointLeaderMutation.isPending}
                        >
                          {appointLeaderMutation.isPending
                            ? "Đang xử lý..."
                            : "Bổ Nhiệm"}
                        </button>
                        <button
                          onClick={() => {
                            setShowAppointLeaderForm(false);
                            setSelectedResidentId("");
                          }}
                          className="btn-secondary flex-1"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Residents Tab */}
            {activeTab === "residents" && (
              <div>
                {room.residents.length === 0 ? (
                  <p className="text-neutral-600">Phòng trống</p>
                ) : (
                  <div className="space-y-3">
                    {room.residents.map((resident) => (
                      <div
                        key={resident.id}
                        className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-body-md font-semibold text-neutral-900">
                              {resident.fullName}
                            </p>
                            <p className="text-body-sm text-neutral-600">
                              {resident.residentCode}
                            </p>
                            {resident.phoneNumber && (
                              <p className="text-body-sm text-neutral-600">
                                {resident.phoneNumber}
                              </p>
                            )}
                            <p className="text-body-sm text-neutral-600 mt-2">
                              Vào phòng: {formatDate(resident.assignedDate)}
                            </p>
                          </div>
                          {room.leader?.residentId === resident.id && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-body-sm font-medium">
                              Trưởng Phòng
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div>
                {room.history.length === 0 ? (
                  <p className="text-neutral-600">Không có lịch sử</p>
                ) : (
                  <div className="space-y-3">
                    {room.history.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 border border-neutral-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-body-md font-semibold text-neutral-900">
                              {record.fullName}
                            </p>
                            <p className="text-body-sm text-neutral-600">
                              {record.residentCode}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-body-sm font-medium ${
                              record.eventType === "new_entry"
                                ? "bg-green-100 text-green-700"
                                : record.eventType === "transfer"
                                ? "bg-blue-100 text-blue-700"
                                : record.eventType === "left"
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {formatEventType(record.eventType)}
                          </span>
                        </div>
                        <p className="text-body-sm text-neutral-600">
                          Vào: {formatDate(record.assignedDate)}
                        </p>
                        {record.unassignedDate && (
                          <p className="text-body-sm text-neutral-600">
                            Ra: {formatDate(record.unassignedDate)}
                          </p>
                        )}
                        {record.reason && (
                          <p className="text-body-sm text-neutral-600 mt-2">
                            Lý do: {record.reason}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-body-sm text-neutral-600 mt-2">
                            Ghi chú: {record.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ResidenceCareLayout>
  );
}