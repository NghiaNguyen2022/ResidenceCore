'use client';

import { useState } from "react";
import { KeyRound, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Props = {
      onChangedAndRequireLogin: () => void;
};

export function MandatoryChangePasswordModal({
      onChangedAndRequireLogin,
}: Props) {
      const [currentPassword, setCurrentPassword] = useState("");
      const [newPassword, setNewPassword] = useState("");
      const [confirmPassword, setConfirmPassword] = useState("");
      const [message, setMessage] = useState<string | null>(null);

      const changePasswordMutation =
            trpc.residentPortal.changePassword.useMutation();

      const handleSubmit = async () => {
            setMessage(null);

            if (!currentPassword.trim()) {
                  setMessage("Vui lòng nhập mật khẩu hiện tại.");
                  return;
            }

            if (!newPassword.trim()) {
                  setMessage("Vui lòng nhập mật khẩu mới.");
                  return;
            }

            if (newPassword.length < 6) {
                  setMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
                  return;
            }

            if (newPassword !== confirmPassword) {
                  setMessage("Xác nhận mật khẩu mới chưa khớp.");
                  return;
            }

            try {
                  await changePasswordMutation.mutateAsync({
                        currentPassword,
                        newPassword,
                        confirmPassword,
                  });

                  onChangedAndRequireLogin();
            } catch (error: any) {
                  setMessage(
                        error?.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại."
                  );
            }
      };

      return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
                  <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
                        <div className="mb-5 flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                                    <KeyRound className="h-5 w-5" />
                              </div>

                              <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                          Đổi mật khẩu lần đầu
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Vui lòng đổi mật khẩu trước khi sử dụng hệ thống.
                                    </p>
                              </div>
                        </div>

                        {message && (
                              <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                    {message}
                              </div>
                        )}

                        <div className="space-y-4">
                              <label className="block space-y-1.5">
                                    <span className="text-sm font-semibold text-slate-700">
                                          Mật khẩu hiện tại
                                    </span>
                                    <input
                                          type="password"
                                          value={currentPassword}
                                          onChange={(event) => setCurrentPassword(event.target.value)}
                                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                          autoFocus
                                    />
                              </label>

                              <label className="block space-y-1.5">
                                    <span className="text-sm font-semibold text-slate-700">
                                          Mật khẩu mới
                                    </span>
                                    <input
                                          type="password"
                                          value={newPassword}
                                          onChange={(event) => setNewPassword(event.target.value)}
                                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                    />
                              </label>

                              <label className="block space-y-1.5">
                                    <span className="text-sm font-semibold text-slate-700">
                                          Xác nhận mật khẩu mới
                                    </span>
                                    <input
                                          type="password"
                                          value={confirmPassword}
                                          onChange={(event) => setConfirmPassword(event.target.value)}
                                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                    />
                              </label>
                        </div>

                        <button
                              type="button"
                              onClick={handleSubmit}
                              disabled={changePasswordMutation.isPending}
                              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                              <Lock className="h-4 w-4" />
                              {changePasswordMutation.isPending
                                    ? "Đang đổi mật khẩu..."
                                    : "Đổi mật khẩu và đăng nhập lại"}
                        </button>

                        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                              Sau khi đổi mật khẩu thành công, hệ thống sẽ yêu cầu đăng nhập lại.
                        </p>
                  </div>
            </div>
      );
}