import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Đã đăng xuất");
      navigate("/");
    },
    onError: () => {
      toast.error("Lỗi đăng xuất");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold">
              RC
            </div>
            <h1 className="text-xl font-bold">ResidenceCare</h1>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Xin chào, <strong>{user.name || user.username}</strong>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Đang xử lý..." : "Đăng xuất"}
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Hệ thống ResidenceCare
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Giải pháp quản lý toàn diện cho nhà lưu trú, lưu xá - từ quản lý cư dân, phòng ốc, đến báo cáo chi tiết. Dễ sử dụng, hiệu quả và đáng tin cậy.  
          </p>

          {isAuthenticated && user ? (
            <div className="space-y-4">
              <p className="text-base text-muted-foreground">
                Chào mừng <strong>{user.name || user.username}</strong>!
              </p>
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate("/dashboard")}
              >
                Vào Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate("/login")}
              >
                Bắt đầu ngay
              </Button>
              <p className="text-sm text-muted-foreground">
                Hoặc <button
                  onClick={() => navigate("/login")}
                  className="text-accent hover:underline"
                >
                  đăng nhập
                </button> nếu đã có tài khoản
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 ResidenceCare. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}
