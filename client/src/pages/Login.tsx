import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getPostLoginPath } from "@/lib/authRedirect";
import { toast } from "sonner";

export default function Login() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const loginMutation = trpc.auth[isLogin ? "login" : "register"].useMutation({
    onSuccess: async (result) => {
      await utils.auth.me.invalidate();
      const currentUser = await utils.auth.me.fetch();
      toast.success(isLogin ? "Đăng nhập thành công!" : "Đăng ký thành công!");
      navigate(getPostLoginPath(currentUser ?? result.user));
    },
    onError: (error) => {
      toast.error(error.message || "Lỗi xảy ra");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (isLogin) {
      (loginMutation as any).mutate({ username, password });
    } else {
      (loginMutation as any).mutate({ username, password, name: name || undefined });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">RC</h1>
          <p className="text-muted-foreground">
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Tên</label>
              <Input
                type="text"
                placeholder="Nhập tên của bạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <Input
              type="text"
              placeholder="Nhập username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              placeholder="Nhập password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Đang xử lý..." : (isLogin ? "Đăng nhập" : "Đăng ký")}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-3">
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setUsername("");
              setPassword("");
              setName("");
            }}
            className="text-accent hover:underline font-medium"
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            {isLogin ? (
              <>
                Demo: username <code className="bg-card px-1">admin</code> password{" "}
                <code className="bg-card px-1">Admin@123</code>
              </>
            ) : (
              "Tạo tài khoản để bắt đầu sử dụng hệ thống"
            )}
          </p>
        </div>
      </Card>
    </div>
  );
}
