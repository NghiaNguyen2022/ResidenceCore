/**
 * DUTY CONFIG FORM - FORM TẠO/SỬA CÔNG TÁC (V2 - TÍch hợp TemplateSelector)
 * Phase 5: Tạo/sửa công tác, quản lý checklist + chọn mẫu
 * 
 * Cách sử dụng:
 * 1. Import vào Duties.tsx
 * 2. Thay thế modal form bằng component này
 * 3. Truyền props: duty, onSave, onCancel
 * 
 * Tính năng mới:
 * - Nút "📋 Chọn Mẫu" để auto-fill form từ template
 * - Modal TemplateSelector để chọn công tác mẫu
 * - Auto-fill: dutyCode, dutyName, startTime, endTime, minPersons, maxPersons, dutyType
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import TemplateSelector from "./TemplateSelector";

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
    startTime: "",
    endTime: "",
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
        startTime: duty.startTime || "",
        endTime: duty.endTime || "",
        minPersons: duty.minPersons,
        maxPersons: duty.maxPersons,
        frequency: duty.frequency,
        dayOfWeek: duty.dayOfWeek || 0,
        requiresStudyScheduleCheck: duty.requiresStudyScheduleCheck,
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

  // Handle save
  const handleSave = async () => {
    if (!formData.dutyCode || !formData.dutyName) {
      alert("Vui lòng nhập mã và tên công tác");
      return;
    }

    try {
      setLoading(true);

      if (duty) {
        // Update
        await updateConfigMutation.mutateAsync({
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
      } else {
        // Create
        await createConfigMutation.mutateAsync({
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
      }

      onSave();
    } catch (error) {
      console.error("Error saving duty config:", error);
      alert("Lỗi khi lưu công tác");
    } finally {
      setLoading(false);
    }
  };

  // Handle add checklist item
  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.checklistItem) {
      alert("Vui lòng nhập nội dung công việc");
      return;
    }

    if (!duty?.id) {
      // Nếu chưa tạo duty, thêm vào state tạm
      const newItem = {
        ...newChecklistItem,
        itemOrder: checklistItems.length + 1,
      };
      setChecklistItems([...checklistItems, newItem]);
      setNewChecklistItem({
        itemOrder: 0,
        checklistItem: "",
        isRequired: true,
      });
    } else {
      // Nếu đã tạo duty, lưu vào DB
      try {
        await addChecklistItemMutation.mutateAsync({
          dutyConfigId: duty.id,
          itemOrder: checklistItems.length + 1,
          checklistItem: newChecklistItem.checklistItem,
          isRequired: newChecklistItem.isRequired,
          description: newChecklistItem.description,
          estimatedTimeMinutes: newChecklistItem.estimatedTimeMinutes,
        });

        getChecklistQuery.refetch();
        setNewChecklistItem({
          itemOrder: 0,
          checklistItem: "",
          isRequired: true,
        });
      } catch (error) {
        console.error("Error adding checklist item:", error);
        alert("Lỗi khi thêm công việc");
      }
    }
  };

  // Handle delete checklist item
  const handleDeleteChecklistItem = async (index: number) => {
    const item = checklistItems[index];

    if (item.id) {
      // Xóa từ DB
      try {
        await deleteChecklistItemMutation.mutateAsync({ id: item.id });
        getChecklistQuery.refetch();
      } catch (error) {
        console.error("Error deleting checklist item:", error);
        alert("Lỗi khi xóa công việc");
      }
    } else {
      // Xóa từ state tạm
      setChecklistItems(checklistItems.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
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