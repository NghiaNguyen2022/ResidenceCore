import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface Resident {
  id: number;
  residentCode: string;
  residentName: string;
  email: string;
  phone: string;
  roomId: number;
  isActive: boolean;
}

interface DutyConfig {
  id: number;
  dutyCode: string;
  dutyName: string;
  dutyType: "daily" | "weekly" | "monthly";
  startTime?: string;
  endTime?: string;
  minPersons: number;
  maxPersons: number;
}

interface RotationPreview {
  week: number;
  residents: Array<{
    residentId: number;
    residentName: string;
    hasConflict: boolean;
    conflictReason?: string;
  }>;
}

interface DutyRotationProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DutyRotation({ onClose, onSuccess }: DutyRotationProps) {
  const [step, setStep] = useState<"select-duty" | "select-residents" | "preview" | "done">(
    "select-duty"
  );
  const [loading, setLoading] = useState(false);

  // Form state
  const [selectedDutyId, setSelectedDutyId] = useState<number | null>(null);
  const [startWeek, setStartWeek] = useState<number>(1);
  const [numWeeks, setNumWeeks] = useState<number>(4);
  const [selectedResidents, setSelectedResidents] = useState<number[]>([]);
  const [rotationPreview, setRotationPreview] = useState<RotationPreview[]>([]);

  // tRPC queries
  const dutiesQuery = trpc.duties.listConfigs.useQuery();
  const residentsQuery = trpc.residents.listResidents.useQuery();
  const createAssignmentsMutation = trpc.duties.createAssignments.useMutation();

  const selectedDuty = dutiesQuery.data?.find((d) => d.id === selectedDutyId);

  // Handle step 1: Select duty
  const handleSelectDuty = () => {
    if (!selectedDutyId) {
      alert("Vui lòng chọn công tác");
      return;
    }
    setStep("select-residents");
  };

  // Handle step 2: Select residents
  const handleSelectResidents = () => {
    if (selectedResidents.length === 0) {
      alert("Vui lòng chọn ít nhất 1 học viên");
      return;
    }

    if (selectedResidents.length < (selectedDuty?.minPersons || 1)) {
      alert(
        `Công tác này cần ít nhất ${selectedDuty?.minPersons} người, bạn chọn ${selectedResidents.length}`
      );
      return;
    }

    // Generate preview
    generatePreview();
    setStep("preview");
  };

  // Generate rotation preview
  const generatePreview = () => {
    const preview: RotationPreview[] = [];
    const residentsPerWeek = Math.ceil(
      selectedResidents.length / numWeeks
    );

    for (let week = 0; week < numWeeks; week++) {
      const weekResidents = selectedResidents.slice(
        week * residentsPerWeek,
        (week + 1) * residentsPerWeek
      );

      preview.push({
        week: startWeek + week,
        residents: weekResidents.map((resId) => {
          const resident = residentsQuery.data?.find((r) => r.id === resId);
          return {
            residentId: resId,
            residentName: resident?.residentName || "Unknown",
            hasConflict: false, // TODO: Check schedule conflict
            conflictReason: undefined,
          };
        }),
      });
    }

    setRotationPreview(preview);
  };

  // Handle save rotation
  const handleSaveRotation = async () => {
    if (!selectedDutyId) return;

    try {
      setLoading(true);

      // Create assignments for each week
      const assignments = rotationPreview.flatMap((week) =>
        week.residents.map((resident) => ({
          dutyConfigId: selectedDutyId,
          residentId: resident.residentId,
          assignedWeek: week.week,
          status: "pending" as const,
        }))
      );

      await createAssignmentsMutation.mutateAsync({
        assignments,
      });

      setStep("done");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error saving rotation:", error);
      alert("Lỗi khi lưu chia công tác");
    } finally {
      setLoading(false);
    }
  };

  // Toggle resident selection
  const toggleResident = (residentId: number) => {
    setSelectedResidents((prev) =>
      prev.includes(residentId)
        ? prev.filter((id) => id !== residentId)
        : [...prev, residentId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔄 Chia Công Tác Tự Động</h2>

        {/* Step 1: Select Duty */}
        {step === "select-duty" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn Công Tác *
              </label>
              <select
                value={selectedDutyId || ""}
                onChange={(e) => setSelectedDutyId(parseInt(e.target.value) || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn công tác --</option>
                {dutiesQuery.data?.map((duty) => (
                  <option key={duty.id} value={duty.id}>
                    {duty.dutyName} ({duty.minPersons}-{duty.maxPersons} người)
                  </option>
                ))}
              </select>
            </div>

            {selectedDuty && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-gray-900 mb-2">📌 Thông Tin Công Tác</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <div>
                    <span className="font-medium">Tên:</span> {selectedDuty.dutyName}
                  </div>
                  <div>
                    <span className="font-medium">Loại:</span>{" "}
                    {selectedDuty.dutyType === "daily"
                      ? "Hàng Ngày"
                      : selectedDuty.dutyType === "weekly"
                      ? "Hàng Tuần"
                      : "Hàng Tháng"}
                  </div>
                  <div>
                    <span className="font-medium">Giờ:</span> {selectedDuty.startTime} -{" "}
                    {selectedDuty.endTime}
                  </div>
                  <div>
                    <span className="font-medium">Số Người:</span> {selectedDuty.minPersons} -{" "}
                    {selectedDuty.maxPersons}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tuần Bắt Đầu *
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={startWeek}
                  onChange={(e) => setStartWeek(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số Tuần Chia *
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={numWeeks}
                  onChange={(e) => setNumWeeks(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSelectDuty}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Tiếp Tục →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Residents */}
        {step === "select-residents" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn Học Viên ({selectedResidents.length} / {residentsQuery.data?.length || 0})
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4">
                {residentsQuery.data?.map((resident) => (
                  <label key={resident.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedResidents.includes(resident.id)}
                      onChange={() => toggleResident(resident.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{resident.residentName}</span>
                    <span className="text-xs text-gray-500">({resident.residentCode})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep("select-duty")}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                ← Quay Lại
              </button>
              <button
                onClick={handleSelectResidents}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Xem Preview →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                👀 Xem trước kế hoạch chia công tác trước khi lưu
              </p>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {rotationPreview.map((week) => (
                <div key={week.week} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Tuần {week.week}</h4>
                  <div className="space-y-1">
                    {week.residents.map((resident) => (
                      <div
                        key={resident.residentId}
                        className={`flex items-center gap-2 text-sm ${
                          resident.hasConflict ? "text-red-600" : "text-gray-700"
                        }`}
                      >
                        <span>{resident.hasConflict ? "⚠️" : "✓"}</span>
                        <span>{resident.residentName}</span>
                        {resident.conflictReason && (
                          <span className="text-xs text-red-500">({resident.conflictReason})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep("select-residents")}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                ← Quay Lại
              </button>
              <button
                onClick={handleSaveRotation}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? "Đang Lưu..." : "✓ Lưu Chia Công Tác"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === "done" && (
          <div className="text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h3 className="text-xl font-bold text-gray-900">Chia Công Tác Thành Công!</h3>
            <p className="text-gray-600">
              Đã tạo {rotationPreview.reduce((sum, w) => sum + w.residents.length, 0)} bản ghi chia
              công tác
            </p>
          </div>
        )}
      </div>
    </div>
  );
}