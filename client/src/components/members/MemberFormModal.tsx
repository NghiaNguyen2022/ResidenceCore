'use client';

import type { Dispatch, SetStateAction } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormDateInput } from '@/components/shared/form/FormDateInput';
import { residenceMediumStyle } from '@/components/shared/styleMedium';
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
            <div className={residenceMediumStyle.modalOverlay}>
                  <div className={`${residenceMediumStyle.modalShell} max-w-3xl`}>
                        <div className={residenceMediumStyle.modalHeader}>
                              <div>
                                    <h2 className={residenceMediumStyle.modalTitle}>
                                          {title}
                                    </h2>
                                    <p className={residenceMediumStyle.modalSubtitle}>
                                          Cập nhật thông tin cơ bản của học viên lưu trú.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl border border-amber-100 bg-white/75 p-2 text-slate-500 shadow-sm shadow-slate-900/5 transition hover:bg-white hover:text-slate-800"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <form
                              onSubmit={(event) => {
                                    event.preventDefault();
                                    onSubmit();
                              }}
                              className="space-y-5 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,251,235,0.26)_0%,rgba(248,250,252,0.46)_100%)] p-5 sm:p-6"
                        >
                              {error && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                          {error}
                                    </div>
                              )}

                              <div className={`${residenceMediumStyle.premiumGoldBlackSoftSurface} p-4`}>
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
                                                
                                                      className={residenceMediumStyle.formInput}
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
                                                
                                                      className={residenceMediumStyle.formInput}
                                                />
                                          </div>

                                          <div>
                                                <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                                <FormDateInput
                                                      id="dateOfBirth"
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
                                                      className="h-10 w-full rounded-2xl border border-amber-100/70 bg-white/70 px-3 text-sm font-semibold text-slate-700 outline-none transition hover:bg-white focus:border-amber-200 focus:bg-white focus:ring-2 focus:ring-amber-100/70"
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
                                                
                                                      className={residenceMediumStyle.formInput}
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
                                                
                                                      className={residenceMediumStyle.formInput}
                                                />
                                          </div>

                                          <div>
                                                <Label htmlFor="admissionDate">Ngày vào lưu trú *</Label>
                                                <FormDateInput
                                                      id="admissionDate"
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
                                    <div className={`${residenceMediumStyle.premiumGoldBlackSoftSurface} p-4`}>
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
                                                                  
                                                      className={residenceMediumStyle.formInput}
                                                />
                                                            </div>

                                                            <button
                                                                  type="button"
                                                                  onClick={onSuggestUsername}
                                                                  disabled={
                                                                        isSuggestingUsername ||
                                                                        !formData.fullName.trim()
                                                                  }
                                                                  className={residenceMediumStyle.buttonCard}
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
                                                                  
                                                      className={residenceMediumStyle.formInput}
                                                />
                                                            </div>

                                                            <label className="flex items-center gap-2 rounded-2xl border border-amber-100/60 bg-white/62 px-3 py-2 text-sm text-slate-700 shadow-sm shadow-slate-900/5">
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

                                                      <div className="rounded-2xl border border-amber-100/55 bg-white/58 px-4 py-3 text-xs leading-5 text-slate-500 shadow-sm shadow-slate-900/5">
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

                              <div className={`${residenceMediumStyle.premiumGoldBlackSoftSurface} p-4`}>
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
                                                      className={residenceMediumStyle.formTextarea}
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
                                                      className={residenceMediumStyle.formTextarea}
                                                />
                                          </div>
                                    </div>
                              </div>

                              <div className="flex flex-col-reverse gap-3 border-t border-amber-100/60 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className={residenceMediumStyle.buttonCard}
                                    >
                                          Hủy
                                    </button>

                                    <button
                                          type="submit"
                                          disabled={isSubmitting}
                                          className={residenceMediumStyle.buttonCardPrimary}
                                    >
                                          {submitText}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}