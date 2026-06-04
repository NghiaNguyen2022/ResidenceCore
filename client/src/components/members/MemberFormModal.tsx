import type { Dispatch, SetStateAction } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
      CreateResidentUserFormData,
      Gender,
      MemberFormData,
} from './memberTypes';

export function MemberFormModal({
      title,
      error,
      formData,
      setFormData,
      createUserData,
      setCreateUserData,
      onSuggestUsername,
      onClose,
      onSubmit,
      submitText,
      isSubmitting,
      isSuggestingUsername,
      isEditing = false,
}: {
      title: string;
      error: string | null;
      formData: MemberFormData;
      setFormData: Dispatch<SetStateAction<MemberFormData>>;
      createUserData: CreateResidentUserFormData;
      setCreateUserData: Dispatch<SetStateAction<CreateResidentUserFormData>>;
      onSuggestUsername: () => void;
      onClose: () => void;
      onSubmit: () => void;
      submitText: string;
      isSubmitting: boolean;
      isSuggestingUsername: boolean;
      isEditing?: boolean;
}) {
      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-2xl font-bold text-neutral-900">
                                          {title}
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                          Cập nhật thông tin cơ bản của học viên lưu trú.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg p-2 transition hover:bg-neutral-100"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <form
                              onSubmit={(event) => {
                                    event.preventDefault();
                                    onSubmit();
                              }}
                              className="space-y-5 p-6"
                        >
                              {error && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                          {error}
                                    </div>
                              )}

                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="mb-4">
                                          <h3 className="text-base font-semibold text-slate-900">
                                                Thông tin học viên
                                          </h3>
                                          <p className="mt-1 text-sm text-slate-500">
                                                Nhập các thông tin cơ bản, đủ dùng cho quản lý hằng ngày.
                                          </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                          <div>
                                                <Label htmlFor="holyName">Tên thánh</Label>
                                                <Input
                                                      id="holyName"
                                                      value={formData.holyName}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  holyName: event.target.value,
                                                            })
                                                      }
                                                      placeholder="Ví dụ: Maria, Giuse..."
                                                />
                                          </div>

                                          <div>
                                                <Label htmlFor="fullName">Họ tên học viên *</Label>
                                                <Input
                                                      id="fullName"
                                                      value={formData.fullName}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  fullName: event.target.value,
                                                            })
                                                      }
                                                      placeholder="Nhập họ tên"
                                                      required
                                                />
                                          </div>

                                          <div>
                                                <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                                <Input
                                                      id="dateOfBirth"
                                                      type="date"
                                                      value={formData.dateOfBirth}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  dateOfBirth: event.target.value,
                                                            })
                                                      }
                                                />
                                          </div>

                                          <div>
                                                <Label htmlFor="gender">Giới tính</Label>
                                                <select
                                                      id="gender"
                                                      value={formData.gender}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  gender: event.target.value as Gender,
                                                            })
                                                      }
                                                      className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                >
                                                      <option value="male">Nam</option>
                                                      <option value="female">Nữ</option>
                                                      <option value="other">Khác</option>
                                                </select>
                                          </div>

                                          <div>
                                                <Label htmlFor="idNumber">Số CCCD</Label>
                                                <Input
                                                      id="idNumber"
                                                      value={formData.idNumber}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  idNumber: event.target.value,
                                                            })
                                                      }
                                                      placeholder="Nhập số CCCD"
                                                />
                                          </div>

                                          <div>
                                                <Label htmlFor="phoneNumber">Điện thoại</Label>
                                                <Input
                                                      id="phoneNumber"
                                                      value={formData.phoneNumber}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  phoneNumber: event.target.value,
                                                            })
                                                      }
                                                      placeholder="Nhập số điện thoại"
                                                />
                                          </div>

                                          <div>
                                                <Label htmlFor="admissionDate">Ngày vào lưu trú *</Label>
                                                <Input
                                                      id="admissionDate"
                                                      type="date"
                                                      value={formData.admissionDate}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  admissionDate: event.target.value,
                                                            })
                                                      }
                                                      required
                                                />
                                          </div>
                                    </div>
                              </div>

                              {!isEditing && (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                <input
                                                      type="checkbox"
                                                      checked={createUserData.createUserAccount}
                                                      onChange={(event) =>
                                                            setCreateUserData((current) => ({
                                                                  ...current,
                                                                  createUserAccount: event.target.checked,
                                                            }))
                                                      }
                                                />
                                                <span>Tạo tài khoản đăng nhập cho học viên</span>
                                          </label>

                                          {createUserData.createUserAccount && (
                                                <div className="mt-4 space-y-4">
                                                      <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                                            <div className="flex-1">
                                                                  <Label htmlFor="residentUsername">
                                                                        Tên đăng nhập
                                                                  </Label>
                                                                  <Input
                                                                        id="residentUsername"
                                                                        value={createUserData.username}
                                                                        onChange={(event) =>
                                                                              setCreateUserData((current) => ({
                                                                                    ...current,
                                                                                    username: event.target.value,
                                                                              }))
                                                                        }
                                                                        placeholder="ten.ho"
                                                                  />
                                                            </div>

                                                            <button
                                                                  type="button"
                                                                  onClick={onSuggestUsername}
                                                                  disabled={
                                                                        isSuggestingUsername ||
                                                                        !formData.fullName.trim()
                                                                  }
                                                                  className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                  {isSuggestingUsername
                                                                        ? 'Đang gợi ý...'
                                                                        : 'Gợi ý tên đăng nhập'}
                                                            </button>
                                                      </div>

                                                      <div className="grid gap-4 md:grid-cols-2">
                                                            <div>
                                                                  <Label htmlFor="residentTemporaryPassword">
                                                                        Mật khẩu tạm
                                                                  </Label>
                                                                  <Input
                                                                        id="residentTemporaryPassword"
                                                                        value={createUserData.temporaryPassword}
                                                                        onChange={(event) =>
                                                                              setCreateUserData((current) => ({
                                                                                    ...current,
                                                                                    temporaryPassword:
                                                                                          event.target.value,
                                                                              }))
                                                                        }
                                                                        placeholder="123456"
                                                                        type="text"
                                                                  />
                                                            </div>

                                                            <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm text-slate-700">
                                                                  <input
                                                                        type="checkbox"
                                                                        checked={
                                                                              createUserData.mustChangePassword
                                                                        }
                                                                        onChange={(event) =>
                                                                              setCreateUserData((current) => ({
                                                                                    ...current,
                                                                                    mustChangePassword:
                                                                                          event.target.checked,
                                                                              }))
                                                                        }
                                                                  />
                                                                  <span>
                                                                        Yêu cầu đổi mật khẩu khi đăng nhập lần đầu
                                                                  </span>
                                                            </label>
                                                      </div>

                                                      <div className="rounded-xl bg-white px-4 py-3 text-xs text-slate-500">
                                                            Tài khoản học viên sẽ được gắn vai trò{' '}
                                                            <span className="font-medium text-slate-700">
                                                                  Học viên
                                                            </span>
                                                            . Các chức danh như Tổ trưởng, Trưởng ban, Thủ quỹ
                                                            sẽ được gán sau từ quy trình bổ nhiệm.
                                                      </div>
                                                </div>
                                          )}
                                    </div>
                              )}

                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="grid gap-4">
                                          <div>
                                                <Label htmlFor="permanentAddress">
                                                      Địa chỉ thường trú
                                                </Label>
                                                <Textarea
                                                      id="permanentAddress"
                                                      value={formData.permanentAddress}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  permanentAddress: event.target.value,
                                                            })
                                                      }
                                                      placeholder="Nhập địa chỉ"
                                                      className="min-h-24"
                                                />
                                          </div>

                                          <div>
                                                <Label htmlFor="notes">Ghi chú</Label>
                                                <Textarea
                                                      id="notes"
                                                      value={formData.notes}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  notes: event.target.value,
                                                            })
                                                      }
                                                      placeholder="Ghi chú thêm về học viên nếu có"
                                                      className="min-h-20"
                                                />
                                          </div>
                                    </div>
                              </div>

                              <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                    >
                                          Hủy
                                    </button>

                                    <button
                                          type="submit"
                                          disabled={isSubmitting}
                                          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                          {submitText}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}