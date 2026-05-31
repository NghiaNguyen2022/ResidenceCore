import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export function ResidenceCareLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: "🏠" },
    { label: "Học viên lưu trú", path: "/members", icon: "👥" },
    { label: "Phòng ở", path: "/rooms", icon: "🏢" },
    { label: "Công tác", path: "/duties", icon: "✓" },
    { label: "Phí lưu trú", path: "/fees", icon: "💰" },
    { label: "Thông tin học & Lịch học", path: "/schedule", icon: "📚" },
    { label: "Hoạt động", path: "/activities", icon: "🎉" },
    { label: "Báo cáo", path: "/reports", icon: "📊" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            RC
          </div>
          <div>
            <h1 className="font-bold text-neutral-900">ResidenceCore</h1>
            <p className="text-xs text-neutral-500">Quản lý ký túc xá</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop User Info */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900">{user?.name || "Admin"}</p>
              <p className="text-xs text-neutral-500">{user?.role || "User"}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || "A"}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline text-sm font-medium">Đăng xuất</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-neutral-900" />
            ) : (
              <Menu className="w-6 h-6 text-neutral-900" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-72 bg-neutral-900 text-white flex-col fixed left-0 top-16 bottom-0 overflow-y-auto">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? "bg-blue-500 text-white"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive(item.path) && <ChevronRight className="w-5 h-5" />}
              </a>
            </Link>
          ))}
        </nav>

        {/* User Section - Desktop Sidebar */}
        <div className="px-4 py-6 border-t border-neutral-700">
          <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-neutral-400 truncate">{user?.role || "User"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30 top-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={`fixed left-0 top-16 bottom-0 w-64 bg-neutral-900 text-white transform transition-transform md:hidden z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? "bg-blue-500 text-white"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive(item.path) && <ChevronRight className="w-5 h-5" />}
              </a>
            </Link>
          ))}
        </nav>

        {/* User Section - Mobile Sidebar */}
        <div className="px-4 py-6 border-t border-neutral-700">
          <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-neutral-400 truncate">{user?.role || "User"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 mt-16 overflow-auto">
        {children}
      </main>
    </div>
  );
}