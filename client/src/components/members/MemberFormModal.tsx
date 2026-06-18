import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { residenceMediumStyle } from '@/components/shared/styleMedium';
import { AddressSuggestionInput } from '@/components/shared/AddressSuggestionInput';
import { FormDateInput } from '@/components/shared/form/FormDateInput';
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
      useEffect(() => {
            if (!isEditing && !createUserData.createUserAccount) {
                  setCreateUserData((current) => ({
                        ...current,
                        createUserAccount: true,
                        mustChangePassword:
                              current.mustChangePassword === undefined
                                    ? true
                                    : current.mustChangePassword,
                  }));
            }
      }, []);

      return (
            <div className={residenceMediumStyle.modalOverlay}>
                  <div className={`${residenceMediumStyle.modalShell} max-w-3xl`}>
                        <div className={residenceMediumStyle.modalHeader}>
                              <div>
                                    <p className={residenceMediumStyle.modalEyebrow}>
                                          Học viên
                                    </p>
                                    <h2 className={residenceMediumStyle.modalTitle}>
                                          {title}
                                    </h2>
                                    <p className={residenceMediumStyle.modalSubtitle}>
                                          Nhập thông tin cần thiết cho quản lý lưu trú hằng ngày.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl p-2 text-slate-500 transition hover:bg-white/70 hover:text-slate-700"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <form
                              onSubmit={(event) => {
                                    event.preventDefault();
                                    onSubmit();
                              }}
                              className="min-h-0 overflow-y-auto px-5 py-4"
                        >
                              <div className="space-y-4">
                                    {error && (
                                          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                {error}
                                          </div>
                                    )}

                                    <div className={residenceMediumStyle.cardSection}>
                                          <div className="mb-3">
                                                <h3 className="text-base font-semibold text-slate-900">
                                                      Thông tin học viên
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500">
                                                      Các trường chính để nhận diện và quản lý hồ sơ.
                                                </p>
                                          </div>

                                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                <div>
                                                      <label htmlFor="holyName" className={residenceMediumStyle.fieldLabel}>
                                                            Tên thánh
                                                      </label>
                                                      <Input
                                                            id="holyName"
                                                            value={formData.holyName}
                                                            onChange={(event) =>
                                                                  setFormData({
                                                                        ...formData,
                                                                        holyName: event.target.value,
                                                                  })
                                                            }
                                                            placeholder="Maria, Giuse..."
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </div>

                                                <div>
                                                      <label htmlFor="fullName" className={residenceMediumStyle.fieldLabel}>
                                                            Họ tên học viên *
                                                      </label>
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
                                                      <label htmlFor="dateOfBirth" className={residenceMediumStyle.fieldLabel}>
                                                            Ngày sinh
                                                      </label>
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
                                                      <label htmlFor="gender" className={residenceMediumStyle.fieldLabel}>
                                                            Giới tính
                                                      </label>
                                                      <select
                                                            id="gender"
                                                            value={formData.gender}
                                                            onChange={(event) =>
                                                                  setFormData({
                                                                        ...formData,
                                                                        gender: event.target.value as Gender,
                                                                  })
                                                            }
                                                            className="mt-1 h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
                                                      >
                                                            <option value="male">Nam</option>
                                                            <option value="female">Nữ</option>
                                                            <option value="other">Khác</option>
                                                      </select>
                                                </div>

                                                <div>
                                                      <label htmlFor="phoneNumber" className={residenceMediumStyle.fieldLabel}>
                                                            Điện thoại
                                                      </label>
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
                                                      <label htmlFor="admissionDate" className={residenceMediumStyle.fieldLabel}>
                                                            Ngày vào lưu trú *
                                                      </label>
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

                                                <div className="md:col-span-2">
                                                      <label htmlFor="idNumber" className={residenceMediumStyle.fieldLabel}>
                                                            Số CCCD
                                                      </label>
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
                                          </div>
                                    </div>

                                    {!isEditing && (
                                          <div className={residenceMediumStyle.cardSection}>
                                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
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
                                                      <div className="mt-3 space-y-3">
                                                            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                                                                  <div>
                                                                        <label htmlFor="residentUsername" className={residenceMediumStyle.fieldLabel}>
                                                                              Tên đăng nhập
                                                                        </label>
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
                                                                        className={residenceMediumStyle.secondaryButton}
                                                                  >
                                                                        {isSuggestingUsername
                                                                              ? 'Đang gợi ý...'
                                                                              : 'Gợi ý'}
                                                                  </button>
                                                            </div>

                                                            <div className="grid gap-3 md:grid-cols-2">
                                                                  <div>
                                                                        <label htmlFor="residentTemporaryPassword" className={residenceMediumStyle.fieldLabel}>
                                                                              Mật khẩu tạm
                                                                        </label>
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

                                                                  <label className="mt-6 flex items-center gap-2 rounded-xl border border-amber-100 bg-white/80 px-3 py-2 text-sm text-slate-700">
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
                                                                        <span>Đổi mật khẩu lần đầu</span>
                                                                  </label>
                                                            </div>

                                                            <div className="rounded-xl bg-amber-50/70 px-4 py-3 text-xs leading-5 text-slate-500">
                                                                  Tài khoản học viên dùng vai trò{' '}
                                                                  <span className="font-medium text-slate-700">
                                                                        Học viên
                                                                  </span>
                                                                  . Các chức danh tổ chức sẽ được gán sau từ quy trình bổ nhiệm.
                                                            </div>
                                                      </div>
                                                )}
                                          </div>
                                    )}

                                    <div className={residenceMediumStyle.cardSection}>
                                          <div className="grid gap-4">
                                                <AddressSuggestionInput
                                                      id="permanentAddress"
                                                      label="Địa chỉ thường trú"
                                                      value={formData.permanentAddress}
                                                      onChange={(value) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  permanentAddress: value,
                                                            })
                                                      }
                                                />

                                                <div>
                                                      <label htmlFor="notes" className={residenceMediumStyle.fieldLabel}>
                                                            Ghi chú
                                                      </label>
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
                              </div>

                              <div className="sticky bottom-0 mt-4 flex flex-col-reverse gap-2 border-t border-amber-100/80 bg-white/90 px-0 py-4 backdrop-blur sm:flex-row sm:justify-end">
                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className={residenceMediumStyle.secondaryButton}
                                    >
                                          Hủy
                                    </button>

                                    <button
                                          type="submit"
                                          disabled={isSubmitting}
                                          className={residenceMediumStyle.primaryButton}
                                    >
                                          {submitText}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}