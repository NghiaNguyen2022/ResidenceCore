'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Bell, Loader2, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AppCard, ErrorState, LoadingState } from '@/components/shared';

type Prefs = {
      debtNotifications: boolean;
      paymentNotifications: boolean;
      taskNotifications: boolean;
      attendanceNotifications: boolean;
      emailNotifications: boolean;
      pushNotifications: boolean;
};

const DEFAULTS: Prefs = {
      debtNotifications: true,
      paymentNotifications: true,
      taskNotifications: true,
      attendanceNotifications: true,
      emailNotifications: false,
      pushNotifications: true,
};

export default function NotificationPreferences() {
      const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
      const [dirty, setDirty] = useState(false);

      const prefsQuery = trpc.system.getNotificationPrefs.useQuery();
      const utils = trpc.useUtils();

      const saveMutation = trpc.system.saveNotificationPrefs.useMutation({
            onSuccess: () => {
                  toast.success('Đã lưu cài đặt thông báo');
                  utils.system.getNotificationPrefs.invalidate();
                  setDirty(false);
            },
            onError: (err) => toast.error(err.message),
      });

      useEffect(() => {
            if (prefsQuery.data) {
                  setPrefs({ ...DEFAULTS, ...(prefsQuery.data as Partial<Prefs>) });
            }
      }, [prefsQuery.data]);

      function toggle(key: keyof Prefs) {
            setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
            setDirty(true);
      }

      function handleSave() {
            saveMutation.mutate(prefs);
      }

      if (prefsQuery.isLoading) return <ResidenceCareLayout><LoadingState /></ResidenceCareLayout>;
      if (prefsQuery.isError) return (
            <ResidenceCareLayout>
                  <ErrorState message={prefsQuery.error.message} onRetry={() => prefsQuery.refetch()} />
            </ResidenceCareLayout>
      );

      const isSaving = saveMutation.isPending;

      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-2xl space-y-6">
                        {/* Header */}
                        <div>
                              <h1 className="text-2xl font-bold text-slate-900">Cài đặt thông báo</h1>
                              <p className="mt-1 text-sm text-slate-500">Quản lý cách bạn nhận được thông báo</p>
                        </div>

                        {/* Loại thông báo */}
                        <AppCard title="Loại thông báo">
                              <div className="space-y-3">
                                    <SwitchRow
                                          icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
                                          label="Thông báo công nợ"
                                          desc="Nhận thông báo khi có công nợ mới hoặc quá hạn"
                                          checked={prefs.debtNotifications}
                                          onToggle={() => toggle('debtNotifications')}
                                          disabled={isSaving}
                                    />
                                    <SwitchRow
                                          icon={<Bell className="h-5 w-5 text-green-500" />}
                                          label="Thông báo thanh toán"
                                          desc="Nhận xác nhận khi thanh toán được ghi nhận"
                                          checked={prefs.paymentNotifications}
                                          onToggle={() => toggle('paymentNotifications')}
                                          disabled={isSaving}
                                    />
                                    <SwitchRow
                                          icon={<AlertCircle className="h-5 w-5 text-blue-500" />}
                                          label="Thông báo công việc"
                                          desc="Nhận thông báo khi được phân công công việc"
                                          checked={prefs.taskNotifications}
                                          onToggle={() => toggle('taskNotifications')}
                                          disabled={isSaving}
                                    />
                                    <SwitchRow
                                          icon={<Bell className="h-5 w-5 text-purple-500" />}
                                          label="Thông báo điểm danh"
                                          desc="Nhận thông báo về điểm danh và lịch sinh hoạt"
                                          checked={prefs.attendanceNotifications}
                                          onToggle={() => toggle('attendanceNotifications')}
                                          disabled={isSaving}
                                    />
                              </div>
                        </AppCard>

                        {/* Phương thức nhận */}
                        <AppCard title="Phương thức nhận thông báo">
                              <div className="space-y-3">
                                    <SwitchRow
                                          icon={<Mail className="h-5 w-5 text-blue-600" />}
                                          label="Thông báo qua email"
                                          desc="Gửi thông báo đến email của bạn"
                                          checked={prefs.emailNotifications}
                                          onToggle={() => toggle('emailNotifications')}
                                          disabled={isSaving}
                                    />
                                    <SwitchRow
                                          icon={<Bell className="h-5 w-5 text-orange-500" />}
                                          label="Thông báo trong ứng dụng"
                                          desc="Hiển thị thông báo trong ứng dụng"
                                          checked={prefs.pushNotifications}
                                          onToggle={() => toggle('pushNotifications')}
                                          disabled={isSaving}
                                    />
                              </div>
                        </AppCard>

                        {/* Actions */}
                        <div className="flex gap-3">
                              <Button onClick={handleSave} disabled={isSaving || !dirty}>
                                    {isSaving ? (
                                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</>
                                    ) : (
                                          <><Save className="mr-2 h-4 w-4" />Lưu cài đặt</>
                                    )}
                              </Button>
                              {dirty && (
                                    <Button
                                          variant="outline"
                                          onClick={() => {
                                                setPrefs({ ...DEFAULTS, ...(prefsQuery.data as Partial<Prefs> ?? {}) });
                                                setDirty(false);
                                          }}
                                          disabled={isSaving}
                                    >
                                          Hủy thay đổi
                                    </Button>
                              )}
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}

function SwitchRow({
      icon,
      label,
      desc,
      checked,
      onToggle,
      disabled,
}: {
      icon: React.ReactNode;
      label: string;
      desc: string;
      checked: boolean;
      onToggle: () => void;
      disabled?: boolean;
}) {
      return (
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div className="flex items-start gap-3">
                        <span className="mt-0.5 shrink-0">{icon}</span>
                        <div>
                              <p className="font-medium text-slate-900">{label}</p>
                              <p className="text-sm text-slate-500">{desc}</p>
                        </div>
                  </div>
                  <Switch checked={checked} onCheckedChange={onToggle} disabled={disabled} />
            </div>
      );
}
