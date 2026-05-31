import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { toast } from "sonner";
import { Bell, Mail, AlertCircle } from "lucide-react";

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    debtNotifications: true,
    paymentNotifications: true,
    taskNotifications: true,
    attendanceNotifications: true,
    emailNotifications: false,
    pushNotifications: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate saving preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Lưu cài đặt thông báo thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ResidenceCareLayout>
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-serif-editorial text-5xl font-bold">Cài đặt thông báo</h1>
          <p className="text-muted-foreground detail-text">Quản lý cách bạn nhận được thông báo</p>
        </div>

        {/* Notification Types */}
        <Card className="card-editorial p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Loại thông báo</h2>
            <p className="text-sm text-muted-foreground">Chọn loại thông báo bạn muốn nhận</p>
          </div>

          <div className="space-y-4">
            {/* Debt Notifications */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Thông báo công nợ</h3>
                  <p className="text-sm text-muted-foreground">Nhận thông báo khi có công nợ mới hoặc quá hạn</p>
                </div>
              </div>
              <Switch checked={preferences.debtNotifications} onCheckedChange={() => handleToggle("debtNotifications")} />
            </div>

            {/* Payment Notifications */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Thông báo thanh toán</h3>
                  <p className="text-sm text-muted-foreground">Nhận xác nhận khi thanh toán được ghi nhận</p>
                </div>
              </div>
              <Switch
                checked={preferences.paymentNotifications}
                onCheckedChange={() => handleToggle("paymentNotifications")}
              />
            </div>

            {/* Task Notifications */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Thông báo công việc</h3>
                  <p className="text-sm text-muted-foreground">Nhận thông báo khi được phân công công việc</p>
                </div>
              </div>
              <Switch
                checked={preferences.taskNotifications}
                onCheckedChange={() => handleToggle("taskNotifications")}
              />
            </div>

            {/* Attendance Notifications */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Thông báo điểm danh</h3>
                  <p className="text-sm text-muted-foreground">Nhận thông báo về điểm danh và lịch sinh hoạt</p>
                </div>
              </div>
              <Switch
                checked={preferences.attendanceNotifications}
                onCheckedChange={() => handleToggle("attendanceNotifications")}
              />
            </div>
          </div>
        </Card>

        {/* Delivery Methods */}
        <Card className="card-editorial p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Phương thức nhận thông báo</h2>
            <p className="text-sm text-muted-foreground">Chọn cách bạn muốn nhận thông báo</p>
          </div>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Thông báo qua email</h3>
                  <p className="text-sm text-muted-foreground">Gửi thông báo đến email của bạn</p>
                </div>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
              />
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Thông báo trong ứng dụng</h3>
                  <p className="text-sm text-muted-foreground">Hiển thị thông báo trong ứng dụng</p>
                </div>
              </div>
              <Switch
                checked={preferences.pushNotifications}
                onCheckedChange={() => handleToggle("pushNotifications")}
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={isSaving} className="btn-primary">
            {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
          </Button>
          <Button variant="outline">Hủy</Button>
        </div>
      </div>
    </ResidenceCareLayout>
  );
}
