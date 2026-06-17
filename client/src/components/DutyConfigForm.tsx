import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import TemplateSelector from "./TemplateSelector";
import { DEFAULT_TIME } from "@/lib/formDefaults";

interface ChecklistItem {
  id?: number;
  itemOrder: number;
  checklistItem: string;
  isRequired: boolean;
  description?: string;
  estimatedTimeMinutes?: number;
}

interface DutyTemplate {
  id: number;
  templateCode: string;
  templateName: string;
  dutyType: string;
  startTime: string;
  endTime: string;
  minPersons: number;
  maxPersons: number;
  description: string;
  isActive: boolean;
}

interface DutyConfigFormProps {
  duty?: any; // null for create, DutyConfig for edit
  onSave: () => void;
  onCancel: () => void;
}

export default function DutyConfigForm({ duty, onSave, onCancel }: DutyConfigFormProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "checklist">("basic");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState<ChecklistItem>({
    itemOrder: 0,
    checklistItem: "",
    isRequired: true,
  });

  const [formData, setFormData] = useState({
    dutyCode: "",
    dutyName: "",
    description: "",
    dutyType: "daily" as "daily" | "weekly" | "monthly",
    startTime: DEFAULT_TIME,
    endTime: DEFAULT_TIME,
    minPersons: 1,
    maxPersons: 5,
    frequency: "daily" as "daily" | "weekly" | "monthly",
    dayOfWeek: 0,
    requiresStudyScheduleCheck: true,
  });

  // tRPC queries & mutations
  const listTemplatesQuery = trpc.duties.listTemplates.useQuery();
  const getChecklistQuery = trpc.duties.getChecklist.useQuery(
    { dutyConfigId: duty?.id || 0 },
    { enabled: !!duty?.id }
  );
  const createConfigMutation = trpc.duties.createConfig.useMutation();
  const updateConfigMutation = trpc.duties.updateConfig.useMutation();
  const addChecklistItemMutation = trpc.duties.addChecklistItem.useMutation();
  const updateChecklistItemMutation = trpc.duties.updateChecklistItem.useMutation();
  const deleteChecklistItemMutation = trpc.duties.deleteChecklistItem.useMutation();

  // Load data
  useEffect(() => {
    if (duty) {
      setFormData({
        dutyCode: duty.dutyCode,
        dutyName: duty.dutyName,
        description: duty.description || "",
        dutyType: duty.dutyType,
        startTime: duty.startTime || DEFAULT_TIME,
        endTime: duty.endTime || DEFAULT_TIME,
        minPersons: duty.minPersons,
        maxPersons: duty.maxPersons,
        frequency: duty.frequency,
        dayOfWeek: duty.dayOfWeek || 0,
        requiresStudyScheduleCheck: duty.requiresStudyScheduleCheck,
      });
    } else {
      setChecklistItems([]);
      setFormData({
        dutyCode: "",
        dutyName: "",
        description: "",
        dutyType: "daily",
        startTime: DEFAULT_TIME,
        endTime: DEFAULT_TIME,
        minPersons: 1,
        maxPersons: 5,
        frequency: "daily",
        dayOfWeek: 0,
        requiresStudyScheduleCheck: true,
      });
    }
  }, [duty]);

  useEffect(() => {
    if (getChecklistQuery.data) {
      setChecklistItems(getChecklistQuery.data);
    }
  }, [getChecklistQuery.data]);

  // Handle select template
  const handleSelectTemplate = (template: DutyTemplate) => {
    setFormData({
      ...formData,
      dutyCode: `${template.templateCode}_${Date.now()}`,
      dutyName: template.templateName,
      description: template.description,
      startTime: template.startTime,
      endTime: template.endTime,
      minPersons: template.minPersons,
      maxPersons: template.maxPersons,
      dutyType: template.dutyType as "daily" | "weekly" | "monthly",
      frequency: template.dutyType as "daily" | "weekly" | "monthly",
    });
    setShowTemplateSelector(false);
  };

  const persistChecklistItems = async (dutyConfigId: number) => {
    const originalItems = (getChecklistQuery.data || []) as ChecklistItem[];
    const originalIds = originalItems
      .map((item) => item.id)
      .filter((id): id is number => Boolean(id));

    const currentIds = checklistItems
      .map((item) => item.id)
      .filter((id): id is number => Boolean(id));

    const deletedIds = originalIds.filter((id) => !currentIds.includes(id));

    for (const id of deletedIds) {
      await deleteChecklistItemMutation.mutateAsync({ id });
    }

    for (const [index, item] of checklistItems.entries()) {
      const payload = {
        checklistItem: item.checklistItem.trim(),
        description: item.description || undefined,
        isRequired: item.isRequired,
        estimatedTimeMinutes: item.estimatedTimeMinutes,
      };

      if (!payload.checklistItem) continue;

      if (item.id) {
        await updateChecklistItemMutation.mutateAsync({
          id: item.id,
          ...payload,
        });
      } else {
        await addChecklistItemMutation.mutateAsync({
          dutyConfigId,
          itemOrder: index + 1,
          ...payload,
        });
      }
    }
  };

  const getDutyConfigIdFromResult = (result: any) => {
    const rawId =
      result?.id ??
      result?.dutyConfigId ??
      result?.insertId ??
      result?.data?.id ??
      result?.data?.dutyConfigId ??
      result?.data?.insertId ??
      result?.result?.id ??
      result?.result?.insertId ??
      result?.[0]?.id ??
      result?.[0]?.insertId;

    const parsedId = Number(rawId);

    return Number.isFinite(parsedId) && parsedId > 0 ? parsedId : 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.dutyCode || !formData.dutyName) {
      setFormError("Vui lòng nhập mã và tên công tác.");
      return;
    }

    try {
      setFormError(null);
      setLoading(true);

      let dutyConfigId = duty?.id ? Number(duty.id) : 0;

      if (duty) {
        const updatedConfig: any = await updateConfigMutation.mutateAsync({
          id: duty.id,
          data: {
            dutyName: formData.dutyName,
            description: formData.description,
            startTime: formData.startTime || undefined,
            endTime: formData.endTime || undefined,
            minPersons: formData.minPersons,
            maxPersons: formData.maxPersons,
          },
        });

        dutyConfigId =
          dutyConfigId ||
          getDutyConfigIdFromResult(updatedConfig) ||
          Number(duty.id || 0);
      } else {
        const createdConfig: any = await createConfigMutation.mutateAsync({
          dutyCode: formData.dutyCode,
          dutyName: formData.dutyName,
          description: formData.description,
          dutyType: formData.dutyType,
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined,
          minPersons: formData.minPersons,
          maxPersons: formData.maxPersons,
          frequency: formData.frequency,
          dayOfWeek: formData.dayOfWeek,
          requiresStudyScheduleCheck: formData.requiresStudyScheduleCheck,
        });

        dutyConfigId = getDutyConfigIdFromResult(createdConfig);

        if (!dutyConfigId) {
          console.warn(
            "Đã lưu cấu hình công tác nhưng response chưa trả về ID. Bỏ qua bước lưu danh sách công việc trong lần này.",
            createdConfig
          );
        }
      }

      const hasChecklistItems = checklistItems.some((item) =>
        item.checklistItem?.trim()
      );

      if (hasChecklistItems && dutyConfigId) {
        await persistChecklistItems(dutyConfigId);
      } else if (hasChecklistItems && !dutyConfigId) {
        console.warn(
          "Không xác định được công tác cần lưu danh sách công việc. Vui lòng mở lại công tác vừa tạo để bổ sung danh sách công việc nếu cần."
        );
      }

      onSave();
    } catch (error) {
      console.error("Error saving duty config:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Lỗi khi lưu công tác"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle add checklist item
  const handleAddChecklistItem = () => {
    const checklistItem = newChecklistItem.checklistItem.trim();

    if (!checklistItem) {
      alert("Vui lòng nhập nội dung công việc");
      return;
    }

    const newItem = {
      ...newChecklistItem,
      checklistItem,
      itemOrder: checklistItems.length + 1,
    };

    setChecklistItems([...checklistItems, newItem]);
    setNewChecklistItem({
      itemOrder: 0,
      checklistItem: "",
      isRequired: true,
    });
  };

  // Handle delete checklist item
  const handleDeleteChecklistItem = (index: number) => {
    setChecklistItems(
      checklistItems
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          itemOrder: itemIndex + 1,
        }))
    );
  };

  return (
    <div className="space-y-6">
      {formError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {formError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("basic")}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === "basic"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Thông Tin Cơ Bản
        </button>
        <button
          onClick={() => setActiveTab("checklist")}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === "checklist"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Danh Sách Công Việc
        </button>
      </div>

      {/* Basic Tab */}
      {activeTab === "basic" && (
        <div className="space-y-4">
          {/* Template Selector Button */}
          {!duty && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <button
                type="button"
                onClick={() => setShowTemplateSelector(true)}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center justify-center gap-2"
              >
                📋 Chọn Công Tác Mẫu
              </button>
              <p className="text-sm text-green-700 mt-2">
                💡 Chọn mẫu để tự động điền thông tin cơ bản
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã Công Tác *
              </label>
              <input
                type="text"
                value={formData.dutyCode}
                onChange={(e) => setFormData({ ...formData, dutyCode: e.target.value })}
                disabled={!!duty}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="VD: DI_CHO_1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Công Tác *
              </label>
              <input
                type="text"
                value={formData.dutyName}
                onChange={(e) => setFormData({ ...formData, dutyName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Đi Chợ"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô Tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả chi tiết về công tác"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại Công Tác *
              </label>
              <select
                value={formData.dutyType}
                onChange={(e) => setFormData({ ...formData, dutyType: e.target.value as any })}
                disabled={!!duty}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="daily">Hàng Ngày</option>
                <option value="weekly">Hàng Tuần</option>
                <option value="monthly">Hàng Tháng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tần Suất *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Hàng Ngày</option>
                <option value="weekly">Hàng Tuần</option>
                <option value="monthly">Hàng Tháng</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ Bắt Đầu
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ Kết Thúc
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số Người Tối Thiểu
              </label>
              <input
                type="number"
                min="1"
                value={formData.minPersons}
                onChange={(e) => setFormData({ ...formData, minPersons: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số Người Tối Đa
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxPersons}
                onChange={(e) => setFormData({ ...formData, maxPersons: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.requiresStudyScheduleCheck}
                onChange={(e) =>
                  setFormData({ ...formData, requiresStudyScheduleCheck: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Kiểm tra xung đột với lịch học
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Checklist Tab */}
      {activeTab === "checklist" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Thêm danh sách công việc cần hoàn thành cho công tác này
            </p>
          </div>

          {/* Existing Checklist Items */}
          {checklistItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Danh Sách Công Việc Hiện Tại</h3>
              <div className="space-y-2">
                {checklistItems.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.isRequired}
                          disabled
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="font-medium text-gray-900">{item.checklistItem}</span>
                        {item.estimatedTimeMinutes && (
                          <span className="text-xs text-gray-500">
                            ({item.estimatedTimeMinutes} phút)
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1 ml-6">{item.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteChecklistItem(index)}
                      className="text-red-600 hover:text-red-900 font-medium text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Checklist Item */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900">Thêm Công Việc Mới</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội Dung Công Việc *
              </label>
              <input
                type="text"
                value={newChecklistItem.checklistItem}
                onChange={(e) =>
                  setNewChecklistItem({ ...newChecklistItem, checklistItem: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Mua rau, Mua thịt, Mua gia vị"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô Tả Chi Tiết
              </label>
              <input
                type="text"
                value={newChecklistItem.description || ""}
                onChange={(e) =>
                  setNewChecklistItem({ ...newChecklistItem, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả chi tiết (tùy chọn)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời Gian Ước Tính (phút)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newChecklistItem.estimatedTimeMinutes || ""}
                  onChange={(e) =>
                    setNewChecklistItem({
                      ...newChecklistItem,
                      estimatedTimeMinutes: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={newChecklistItem.isRequired}
                    onChange={(e) =>
                      setNewChecklistItem({ ...newChecklistItem, isRequired: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Bắt buộc</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleAddChecklistItem}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              + Thêm Công Việc
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {loading ? "Đang Lưu..." : duty ? "Cập Nhật" : "Tạo Mới"}
        </button>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleSelectTemplate}
          onCancel={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
}