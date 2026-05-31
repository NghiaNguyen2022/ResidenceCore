/**
 * Financial Management Page
 * Quản Lý Tài Chính - Phí Thu & Phí Trả
 */

import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, AlertCircle, Plus, Settings, Download } from "lucide-react";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FinancialStats {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  pendingPayments: number;
  overduePayments: number;
  pendingApprovals: number;
}

export default function Financial() {
  const [stats] = useState<FinancialStats>({
    totalRevenue: 500000000,
    totalExpense: 200000000,
    netProfit: 300000000,
    profitMargin: 60,
    pendingPayments: 45,
    overduePayments: 12,
    pendingApprovals: 8,
  });

  const [activeTab, setActiveTab] = useState("overview");

  return (
    <ResidenceCareLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Wallet className="w-10 h-10 text-blue-600" />
              Quản Lý Tài Chính
            </h1>
            <p className="text-muted-foreground mt-2">Quản lý phí thu và phí trả của ký túc xá</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Xuất báo cáo
            </Button>
            <Button size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Cài đặt
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Revenue */}
          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng Thu</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {(stats.totalRevenue / 1000000).toFixed(0)}M
                </p>
                <p className="text-xs text-green-600 mt-2">+5% so với tháng trước</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          {/* Total Expense */}
          <Card className="p-6 border-l-4 border-l-red-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng Chi</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {(stats.totalExpense / 1000000).toFixed(0)}M
                </p>
                <p className="text-xs text-red-600 mt-2">+2% so với tháng trước</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          {/* Net Profit */}
          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lợi Nhuận</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {(stats.netProfit / 1000000).toFixed(0)}M
                </p>
                <p className="text-xs text-blue-600 mt-2">Tỷ suất: {stats.profitMargin}%</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          {/* Alerts */}
          <Card className="p-6 border-l-4 border-l-orange-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cảnh Báo</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{stats.pendingPayments}</span> chờ thanh toán
                  </p>
                  <p className="text-sm text-red-600">
                    <span className="font-semibold">{stats.overduePayments}</span> quá hạn
                  </p>
                </div>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
            <TabsTrigger value="revenue">Phí Thu</TabsTrigger>
            <TabsTrigger value="expense">Phí Trả</TabsTrigger>
            <TabsTrigger value="reports">Báo Cáo</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Tổng Quan Tài Chính</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-foreground mb-3">Phí Thu (Revenue)</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phí lưu trú</span>
                      <span className="font-medium">150M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phí ăn</span>
                      <span className="font-medium">250M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phí sinh hoạt</span>
                      <span className="font-medium">50M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phí khác</span>
                      <span className="font-medium">50M</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Tổng</span>
                      <span>500M</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-3">Phí Trả (Expense)</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Điện nước</span>
                      <span className="font-medium">30M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Nhân công</span>
                      <span className="font-medium">80M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Thực phẩm</span>
                      <span className="font-medium">60M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Khác</span>
                      <span className="font-medium">30M</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Tổng</span>
                      <span>200M</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Quản Lý Phí Thu</h2>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Thêm Phí
                </Button>
              </div>

              <div className="space-y-4">
                {/* Revenue Section */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Phí Cơ Bản</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Loại 1</p>
                      <p className="text-lg font-semibold">1.7M/tháng</p>
                      <p className="text-xs text-muted-foreground mt-1">500k ở + 1M ăn + 200k sinh hoạt</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Loại 2</p>
                      <p className="text-lg font-semibold">2.6M/tháng</p>
                      <p className="text-xs text-muted-foreground mt-1">800k ở + 1.5M ăn + 300k sinh hoạt</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Loại 3</p>
                      <p className="text-lg font-semibold">3.7M/tháng</p>
                      <p className="text-xs text-muted-foreground mt-1">1.2M ở + 2M ăn + 500k sinh hoạt</p>
                    </div>
                  </div>
                </div>

                {/* Pending Payments */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Chờ Thanh Toán</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                      <span className="text-sm">Tháng 5/2026 - 45 học viên</span>
                      <span className="font-semibold text-orange-600">76.5M</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                      <span className="text-sm">Tháng 6/2026 - 48 học viên</span>
                      <span className="font-semibold text-orange-600">81.6M</span>
                    </div>
                  </div>
                </div>

                {/* Overdue Payments */}
                <div className="border rounded-lg p-4 border-red-200 bg-red-50">
                  <h3 className="font-medium mb-3 text-red-900">Quá Hạn</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm">Tháng 3/2026 - 12 học viên</span>
                      <span className="font-semibold text-red-600">20.4M</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Expense Tab */}
          <TabsContent value="expense" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Quản Lý Phí Trả</h2>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Thêm Chi Phí
                </Button>
              </div>

              <div className="space-y-4">
                {/* Expense Categories */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Danh Mục Chi Phí</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-muted rounded flex justify-between">
                      <span className="text-sm">Điện nước</span>
                      <span className="font-semibold">30M</span>
                    </div>
                    <div className="p-3 bg-muted rounded flex justify-between">
                      <span className="text-sm">Nhân công</span>
                      <span className="font-semibold">80M</span>
                    </div>
                    <div className="p-3 bg-muted rounded flex justify-between">
                      <span className="text-sm">Thực phẩm</span>
                      <span className="font-semibold">60M</span>
                    </div>
                    <div className="p-3 bg-muted rounded flex justify-between">
                      <span className="text-sm">Khác</span>
                      <span className="font-semibold">30M</span>
                    </div>
                  </div>
                </div>

                {/* Pending Approvals */}
                <div className="border rounded-lg p-4 border-yellow-200 bg-yellow-50">
                  <h3 className="font-medium mb-3 text-yellow-900">Chờ Phê Duyệt</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm">Mua sách thư viện</span>
                      <span className="font-semibold text-yellow-600">5M</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm">Sửa chữa phòng ở</span>
                      <span className="font-semibold text-yellow-600">8M</span>
                    </div>
                  </div>
                </div>

                {/* Department Stats */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Thống Kê Bộ Phận</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-sm text-muted-foreground">Cửa Hàng</p>
                      <p className="text-lg font-semibold">Lợi nhuận: 15M</p>
                      <p className="text-xs text-muted-foreground mt-1">Doanh thu: 50M | Chi phí: 35M</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-sm text-muted-foreground">Thư Viện</p>
                      <p className="text-lg font-semibold">Lợi nhuận: 5M</p>
                      <p className="text-xs text-muted-foreground mt-1">Doanh thu: 20M | Chi phí: 15M</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Báo Cáo Tài Chính</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 hover:bg-muted cursor-pointer transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Báo Cáo Tháng 5/2026</h3>
                      <p className="text-sm text-muted-foreground mt-1">Tổng thu: 500M | Tổng chi: 200M | Lợi nhuận: 300M</p>
                    </div>
                    <Button variant="outline" size="sm">Xem</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:bg-muted cursor-pointer transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Danh Sách Nợ</h3>
                      <p className="text-sm text-muted-foreground mt-1">12 học viên nợ | Tổng nợ: 20.4M</p>
                    </div>
                    <Button variant="outline" size="sm">Xem</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:bg-muted cursor-pointer transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Báo Cáo Chi Tiết Phí</h3>
                      <p className="text-sm text-muted-foreground mt-1">Phân tích chi tiết từng loại phí</p>
                    </div>
                    <Button variant="outline" size="sm">Xem</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResidenceCareLayout>
  );
}