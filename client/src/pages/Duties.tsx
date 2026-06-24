'use client';

import { useMemo, useState } from 'react';
import {
      CalendarDays,
      CheckCircle2,
      Clock,
      Edit2,
      Plus,
      Search,
      SkipForward,
      Trash2,
      Users,
      X,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DutyConfigForm from '@/components/DutyConfigForm';
import {
      AppMessageBox,
      type AppMessageBoxState,
} from '@/components/common/AppMessageBox';
import { formatTime, formatTimeRange } from '@/lib/format';
import { DEFAULT_TIME } from '@/lib/formDefaults';
import { DatePickerInput } from '@/components/shared/form/DatePickerInput';
import { cx, residenceMediumStyle } from '@/components/shared/styleMedium';

type DutyStatus =
      | 'pending'
      | 'confirmed'
      | 'in_progress'
      | 'completed'
      | 'skipped'
      | 'cancelled';

type AssignToType = 'resident' | 'team' | 'room' | 'committee';

type DutyConfig = {
      id: number;
      dutyCode: string;
      dutyName: string;
      description?: string | null;
      dutyType?: 'daily' | 'weekly' | 'monthly';
      startTime?: string | null;
      endTime?: string | null;
      minPersons?: number;
      maxPersons?: number;
      frequency?: 'daily' | 'weekly' | 'monthly';
      dayOfWeek?: number | null;
      requiresStudyScheduleCheck?: boolean;
      isActive?: boolean;
};

type AssignmentForm = {
      dutyConfigId: string;
      assignedDate: string;
      startTime: string;
      endTime: string;
      assignedToType: AssignToType;
      assignedToId: string;
      notes: string;
};

type SimpleTab = 'today' | 'create' | 'templates';

function todayValue() {
      return new Date().toISOString().slice(0, 10);
}

function createWallClockDate(dateText: string, timeText = '12:00:00') {
      const [year, month, day] = dateText.split('-').map(Number);
      const [hour = 0, minute = 0, second = 0] = timeText.split(':').map(Number);

      return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

function toDateAtNoon(dateText: string) {
      return createWallClockDate(dateText, '12:00:00');
}

function toDateTime(dateText: string, timeText?: string | null) {
      if (!dateText || !timeText) return undefined;

      return createWallClockDate(dateText, timeText.length === 5 ? `${timeText}:00` : timeText);
}

function getDutyTypeLabel(type?: string | null) {
      if (type === 'daily') return 'Hằng ngày';
      if (type === 'weekly') return 'Hằng tuần';
      if (type === 'monthly') return 'Hằng tháng';
      return 'Công tác';
}

function getStatusLabel(status?: string | null) {
      if (status === 'completed') return 'Hoàn thành';
      if (status === 'in_progress') return 'Đang làm';
      if (status === 'confirmed') return 'Đã nhận';
      if (status === 'skipped') return 'Vắng / Không làm';
      if (status === 'cancelled') return 'Đã hủy';
      return 'Chưa làm';
}

function getStatusClass(status?: string | null) {
      if (status === 'completed') return 'border-green-100 bg-green-50 text-green-700';
      if (status === 'in_progress') return 'border-blue-100 bg-blue-50 text-blue-700';
      if (status === 'confirmed') return 'border-indigo-100 bg-indigo-50 text-indigo-700';
      if (status === 'skipped') return 'border-amber-100 bg-amber-50 text-amber-700';
      if (status === 'cancelled') return 'border-slate-200 bg-slate-100 text-slate-600';
      return 'border-orange-100 bg-orange-50 text-orange-700';
}

function getAssigneeTypeLabel(type?: string | null) {
      if (type === 'team') return 'Tổ';
      if (type === 'room') return 'Phòng';
      if (type === 'committee') return 'Ban';
      return 'Học viên';
}

function getRoomName(room: any) {
      if (!room) return '';
      if (room.roomCode && room.roomName) return `${room.roomCode} - ${room.roomName}`;
      return room.roomName || room.name || room.roomCode || `Phòng ${room.id}`;
}

function getMemberName(member: any) {
      if (!member) return '';
      const holyName = member.holyName ? `${member.holyName} ` : '';
      return `${holyName}${member.fullName || member.name || `Học viên ${member.id}`}`.trim();
}

function getUnitName(unit: any) {
      if (!unit) return '';
      return unit.name || unit.code || `Đơn vị ${unit.id}`;
}

function Badge({
      children,
      className = '',
}: {
      children: React.ReactNode;
      className?: string;
}) {
      return (
            <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${className}`}
            >
                  {children}
            </span>
      );
}

function SectionEmpty({
      title,
      description,
}: {
      title: string;
      description: string;
}) {
      return (
            <div className="rounded-[26px] border border-dashed border-amber-100 bg-white/70 p-8 text-center shadow-sm">
                  <p className="font-semibold text-slate-800">{title}</p>
                  <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
      );
}

const dutiesPanelClass =
      'rounded-[26px] border border-amber-100/80 bg-white/90 p-5 shadow-[0_16px_36px_rgba(120,53,15,0.06)]';

const dutiesItemClass =
      'rounded-[24px] border border-slate-200 bg-white/85 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.07)]';

const dutiesInputClass =
      'h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.045)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100';

export default function Duties() {
      const [activeTab, setActiveTab] = useState<SimpleTab>('today');
      const [selectedDate, setSelectedDate] = useState(todayValue());
      const [searchTerm, setSearchTerm] = useState('');
      const [isDutyDialogOpen, setIsDutyDialogOpen] = useState(false);
      const [selectedDuty, setSelectedDuty] = useState<DutyConfig | null>(null);
      const [message, setMessage] = useState<{
            type: 'success' | 'error' | 'info';
            text: string;
      } | null>(null);

      const [messageBox, setMessageBox] = useState<AppMessageBoxState>({
            open: false,
            title: '',
            message: '',
            variant: 'info',
            actions: [],
      });
      const [pendingDeleteDuty, setPendingDeleteDuty] = useState<DutyConfig | null>(null);
      const [pendingCancelAssignment, setPendingCancelAssignment] = useState<any>(null);

      const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>({
            dutyConfigId: '',
            assignedDate: todayValue(),
            startTime: DEFAULT_TIME,
            endTime: DEFAULT_TIME,
            assignedToType: 'resident',
            assignedToId: '',
            notes: '',
      });

      const listDutiesQuery = trpc.duties.listConfigs.useQuery({ isActive: true });
      const assignmentsQuery = trpc.duties.getAssignmentsByDate.useQuery({
            date: toDateAtNoon(selectedDate),
      });

      const membersQuery = trpc.members.list.useQuery({
            status: 'active' as any,
            limit: 500,
            offset: 0,
      });

      const roomsQuery = trpc.rooms.list.useQuery();
      const unitsQuery = trpc.organization.listUnits.useQuery({
            isActive: true,
            limit: 500,
            offset: 0,
      });

      const assignDutyMutation = trpc.duties.assignDuty.useMutation();
      const completeAssignmentMutation = trpc.duties.completeAssignment.useMutation();
      const skipAssignmentMutation = trpc.duties.skipAssignment.useMutation();
      const cancelAssignmentMutation = trpc.duties.cancelAssignment.useMutation();
      const deleteDutyMutation = trpc.duties.deleteConfig.useMutation();

      const duties = useMemo(() => {
            const keyword = searchTerm.trim().toLowerCase();

            return ((listDutiesQuery.data || []) as DutyConfig[])
                  .filter((duty) => {
                        if (!keyword) return true;

                        return [
                              duty.dutyCode,
                              duty.dutyName,
                              duty.description,
                              duty.dutyType,
                        ]
                              .filter(Boolean)
                              .some((value) =>
                                    String(value).toLowerCase().includes(keyword)
                              );
                  })
                  .sort((a, b) => (a.dutyName || '').localeCompare(b.dutyName || '', 'vi'));
      }, [listDutiesQuery.data, searchTerm]);

      const assignments = useMemo(() => {
            const configsById = new Map<number, DutyConfig>();

            ((listDutiesQuery.data || []) as DutyConfig[]).forEach((duty) => {
                  configsById.set(duty.id, duty);
            });

            return ((assignmentsQuery.data || []) as any[])
                  .map((assignment) => ({
                        ...assignment,
                        dutyConfig: configsById.get(assignment.dutyConfigId),
                  }))
                  .sort((a, b) => {
                        const aTime = a.startDateTime || a.dutyConfig?.startTime || '';
                        const bTime = b.startDateTime || b.dutyConfig?.startTime || '';
                        return String(aTime).localeCompare(String(bTime));
                  });
      }, [assignmentsQuery.data, listDutiesQuery.data]);

      const members = (membersQuery.data || []) as any[];
      const rooms = (roomsQuery.data || []) as any[];
      const units = (unitsQuery.data || []) as any[];

      const teams = units.filter((unit: any) => unit.unitType === 'team');
      const committees = units.filter((unit: any) => unit.unitType === 'committee');

      const selectedDutyConfig = assignmentForm.dutyConfigId
            ? ((listDutiesQuery.data || []) as DutyConfig[]).find(
                    (duty) => String(duty.id) === assignmentForm.dutyConfigId
              )
            : null;

      const getAssigneeName = (assignment: any) => {
            const assignedToType =
                  assignment.assignedToType ||
                  (assignment.residentId ? 'resident' : assignment.assigned_to_type);
            const assignedToId =
                  assignment.assignedToId ||
                  assignment.assigned_to_id ||
                  assignment.residentId;

            if (assignedToType === 'room') {
                  return getRoomName(rooms.find((room: any) => Number(room.id) === Number(assignedToId)));
            }

            if (assignedToType === 'team' || assignedToType === 'committee') {
                  return getUnitName(units.find((unit: any) => Number(unit.id) === Number(assignedToId)));
            }

            return getMemberName(members.find((member: any) => Number(member.id) === Number(assignedToId)));
      };

      const refetchAll = async () => {
            await assignmentsQuery.refetch();
            await listDutiesQuery.refetch();
      };

      const selectDutyForAssignment = (duty: DutyConfig) => {
            setAssignmentForm((current) => ({
                  ...current,
                  dutyConfigId: String(duty.id),
                  startTime: formatTime(duty.startTime),
                  endTime: formatTime(duty.endTime),
            }));
            setActiveTab('create');
            setMessage(null);
      };

      const saveAssignment = async () => {
            const dutyConfigId = Number(assignmentForm.dutyConfigId || 0);
            const assignedToId = Number(assignmentForm.assignedToId || 0);

            if (!dutyConfigId) {
                  setMessage({ type: 'error', text: 'Vui lòng chọn mẫu/cấu hình công tác.' });
                  return;
            }

            if (!assignmentForm.assignedDate) {
                  setMessage({ type: 'error', text: 'Vui lòng chọn ngày công tác.' });
                  return;
            }

            if (!assignedToId) {
                  setMessage({ type: 'error', text: 'Vui lòng chọn đối tượng được phân công.' });
                  return;
            }

            try {
                  await assignDutyMutation.mutateAsync({
                        dutyConfigId,
                        residentId:
                              assignmentForm.assignedToType === 'resident'
                                    ? assignedToId
                                    : null,
                        assignedToType: assignmentForm.assignedToType,
                        assignedToId,
                        assignedDate: toDateAtNoon(assignmentForm.assignedDate),
                        startDateTime: toDateTime(
                              assignmentForm.assignedDate,
                              assignmentForm.startTime
                        ),
                        endDateTime: toDateTime(
                              assignmentForm.assignedDate,
                              assignmentForm.endTime
                        ),
                        notes: assignmentForm.notes || undefined,
                  } as any);

                  setMessage({ type: 'success', text: 'Đã tạo phân công công tác.' });
                  setSelectedDate(assignmentForm.assignedDate);
                  setAssignmentForm({
                        dutyConfigId: '',
                        assignedDate: assignmentForm.assignedDate,
                        startTime: '',
                        endTime: '',
                        assignedToType: 'resident',
                        assignedToId: '',
                        notes: '',
                  });
                  setActiveTab('today');
                  await refetchAll();
            } catch (error: any) {
                  setMessage({
                        type: 'error',
                        text: error?.message || 'Không thể tạo phân công công tác.',
                  });
            }
      };

      const completeAssignment = async (assignment: any) => {
            try {
                  await completeAssignmentMutation.mutateAsync({
                        id: assignment.id,
                  });
                  setMessage({ type: 'success', text: 'Đã đánh dấu hoàn thành công tác.' });
                  await refetchAll();
            } catch (error: any) {
                  setMessage({
                        type: 'error',
                        text: error?.message || 'Không thể cập nhật công tác.',
                  });
            }
      };

      const skipAssignment = async (assignment: any) => {
            try {
                  await skipAssignmentMutation.mutateAsync({
                        id: assignment.id,
                        reason: 'Vắng / không thực hiện',
                  });
                  setMessage({
                        type: 'success',
                        text: 'Đã đánh dấu vắng / không làm công tác.',
                  });
                  await refetchAll();
            } catch (error: any) {
                  setMessage({
                        type: 'error',
                        text: error?.message || 'Không thể cập nhật công tác.',
                  });
            }
      };

      const requestCancelAssignment = (assignment: any) => {
            setPendingCancelAssignment(assignment);
            setMessageBox({
                  open: true,
                  title: 'Hủy công tác',
                  message:
                        `Bạn có chắc muốn hủy công tác "${assignment.dutyConfig?.dutyName || `#${assignment.id}`}"?\n\n` +
                        'Công tác sẽ chuyển sang trạng thái Đã hủy và không còn được tính là công tác cần thực hiện.',
                  variant: 'warning',
                  selectedValue: 'cancelAssignment',
                  cancelText: 'Hủy',
                  actions: [
                        {
                              label: 'Hủy công tác',
                              value: 'cancelAssignment',
                              description: 'Chuyển công tác sang trạng thái Đã hủy.',
                              variant: 'warning',
                        },
                  ],
            });
      };

      const executeCancelAssignment = async () => {
            if (!pendingCancelAssignment) {
                  closeMessageBox();
                  return;
            }

            try {
                  await cancelAssignmentMutation.mutateAsync({
                        id: pendingCancelAssignment.id,
                        reason: 'Hủy từ màn hình quản lý công tác',
                  });
                  setMessage({ type: 'success', text: 'Đã hủy công tác.' });
                  closeMessageBox();
                  await refetchAll();
            } catch (error: any) {
                  setMessage({
                        type: 'error',
                        text: error?.message || 'Không thể hủy công tác.',
                  });
                  closeMessageBox();
            }
      };

      const openCreateDuty = () => {
            setSelectedDuty(null);
            setIsDutyDialogOpen(true);
      };

      const openEditDuty = (duty: DutyConfig) => {
            setSelectedDuty(duty);
            setIsDutyDialogOpen(true);
      };

      const requestDeleteDuty = (duty: DutyConfig) => {
            setPendingDeleteDuty(duty);
            setMessageBox({
                  open: true,
                  title: 'Xóa mẫu công tác',
                  message:
                        `Bạn có chắc muốn xóa mẫu công tác "${duty.dutyName}"?\n\n` +
                        'Chỉ nên xóa khi đây là dữ liệu tạo nhầm hoặc dữ liệu test. Nếu mẫu công tác đã phát sinh phân công, nên chuyển sang ngừng dùng để giữ lịch sử.',
                  variant: 'danger',
                  selectedValue: 'deleteDuty',
                  cancelText: 'Hủy',
                  actions: [
                        {
                              label: 'Xóa mẫu công tác',
                              value: 'deleteDuty',
                              description: 'Xóa mẫu công tác và các thiết lập liên quan nếu backend cho phép.',
                              variant: 'danger',
                        },
                  ],
            });
      };

      const executeDeleteDuty = async () => {
            if (!pendingDeleteDuty) {
                  closeMessageBox();
                  return;
            }

            try {
                  await deleteDutyMutation.mutateAsync({
                        id: pendingDeleteDuty.id,
                  });

                  setMessage({
                        type: 'success',
                        text: 'Đã xóa mẫu công tác.',
                  });

                  closeMessageBox();
                  await listDutiesQuery.refetch();
            } catch (error: any) {
                  setMessage({
                        type: 'error',
                        text:
                              error?.message ||
                              'Không thể xóa mẫu công tác. Nếu công tác đã phát sinh phân công, nên chuyển sang ngừng dùng thay vì xóa.',
                  });
                  closeMessageBox();
            }
      };

      const closeMessageBox = () => {
            setMessageBox({
                  open: false,
                  title: '',
                  message: '',
                  variant: 'info',
                  actions: [],
            });
            setPendingDeleteDuty(null);
            setPendingCancelAssignment(null);
      };

      const handleMessageBoxConfirm = async (value: string) => {
            if (value === 'closeMessageBox') {
                  closeMessageBox();
                  return;
            }

            if (value === 'deleteDuty') {
                  await executeDeleteDuty();
                  return;
            }

            if (value === 'cancelAssignment') {
                  await executeCancelAssignment();
                  return;
            }

            closeMessageBox();
      };

      const getAssigneeOptions = () => {
            if (assignmentForm.assignedToType === 'room') {
                  return rooms.map((room: any) => ({
                        id: room.id,
                        label: getRoomName(room),
                  }));
            }

            if (assignmentForm.assignedToType === 'team') {
                  return teams.map((unit: any) => ({
                        id: unit.id,
                        label: getUnitName(unit),
                  }));
            }

            if (assignmentForm.assignedToType === 'committee') {
                  return committees.map((unit: any) => ({
                        id: unit.id,
                        label: getUnitName(unit),
                  }));
            }

            return members.map((member: any) => ({
                  id: member.id,
                  label: getMemberName(member),
            }));
      };

      return (
            <ResidenceCareLayout>
                  <div className={residenceMediumStyle.page}>
                        <div className={residenceMediumStyle.pageShell}>
                        <div className={residenceMediumStyle.topArea}>
                              <div className={residenceMediumStyle.actionBar}>
                                    <button
                                          type="button"
                                          onClick={openCreateDuty}
                                          className={cx(residenceMediumStyle.secondaryButton, 'inline-flex items-center gap-2')}
                                    >
                                          <Plus className="h-4 w-4" />
                                          Thêm mẫu công tác
                                    </button>
                                    <button
                                          type="button"
                                          onClick={() => setActiveTab('create')}
                                          className="inline-flex items-center gap-2 rounded-xl bg-[#17335f] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(23,51,95,0.16)] transition hover:bg-[#244878]"
                                    >
                                          <Users className="h-4 w-4" />
                                          Tạo phân công
                                    </button>
                              </div>
                              <div className={residenceMediumStyle.topInner}>
                                    <p className={residenceMediumStyle.modalEyebrow}>
                                          Sinh hoạt
                                    </p>
                                    <h1 className={residenceMediumStyle.topTitle}>
                                          Công tác & Phân công
                                    </h1>
                                    <p className={residenceMediumStyle.topSubtitle}>
                                          Theo dõi công tác hằng ngày, trực cửa hàng sáng/chiều,
                                          phân công theo học viên, Tổ, phòng ngủ hoặc Ban.
                                    </p>
                              </div>
                        </div>

                        {message && (
                              <div
                                    className={[
                                          'rounded-2xl border px-4 py-3 text-sm font-medium',
                                          message.type === 'success'
                                                ? 'border-green-100 bg-green-50 text-green-700'
                                                : message.type === 'error'
                                                      ? 'border-red-100 bg-red-50 text-red-700'
                                                      : 'border-blue-100 bg-blue-50 text-blue-700',
                                    ].join(' ')}
                              >
                                    {message.text}
                              </div>
                        )}

                        <div className="flex flex-wrap gap-2 rounded-[26px] border border-amber-100/80 bg-white/90 p-2 shadow-[0_12px_30px_rgba(120,53,15,0.045)]">
                              {[
                                    { key: 'today', label: 'Công tác hôm nay' },
                                    { key: 'create', label: 'Tạo phân công' },
                                    { key: 'templates', label: 'Mẫu công tác' },
                              ].map((tab) => (
                                    <button
                                          key={tab.key}
                                          type="button"
                                          onClick={() => setActiveTab(tab.key as SimpleTab)}
                                          className={[
                                                'rounded-xl px-4 py-2 text-sm font-semibold transition',
                                                activeTab === tab.key
                                                      ? 'bg-[#17335f] text-white shadow-sm'
                                                      : 'text-slate-600 hover:bg-amber-50/70 hover:text-slate-900',
                                          ].join(' ')}
                                    >
                                          {tab.label}
                                    </button>
                              ))}
                        </div>

                        {activeTab === 'today' && (
                              <div className={dutiesPanelClass}>
                                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                          <div>
                                                <h3 className={residenceMediumStyle.sectionTitle}>
                                                      Công tác trong ngày
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500">
                                                      Xem nhanh ai làm gì, ở đâu và tình trạng hoàn thành.
                                                </p>
                                          </div>

                                          <label className="flex items-center gap-2 rounded-xl border border-amber-100 bg-white/90 px-3 py-2 shadow-[0_8px_18px_rgba(120,53,15,0.045)]">
                                                <CalendarDays className="h-4 w-4 text-slate-400" />
                                                <DatePickerInput
                                                      value={selectedDate}
                                                      onChange={(event) =>
                                                            setSelectedDate(event.target.value)
                                                      }
                                                      className="h-8 border-0 p-0 shadow-none focus-visible:ring-0"
                                                />
                                          </label>
                                    </div>

                                    {assignmentsQuery.isLoading ? (
                                          <SectionEmpty
                                                title="Đang tải công tác"
                                                description="Vui lòng chờ trong giây lát."
                                          />
                                    ) : assignments.length === 0 ? (
                                          <SectionEmpty
                                                title="Chưa có công tác trong ngày"
                                                description="Tạo phân công từ mẫu công tác để bắt đầu theo dõi."
                                          />
                                    ) : (
                                          <div className="space-y-3">
                                                {assignments.map((assignment: any) => {
                                                      const duty = assignment.dutyConfig;
                                                      const title =
                                                            duty?.dutyName ||
                                                            assignment.dutyName ||
                                                            `Công tác #${assignment.id}`;
                                                      const start =
                                                            assignment.startDateTime ||
                                                            duty?.startTime;
                                                      const end =
                                                            assignment.endDateTime ||
                                                            duty?.endTime;

                                                      return (
                                                            <div
                                                                  key={assignment.id}
                                                                  className={dutiesItemClass}
                                                            >
                                                                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                                        <div className="flex gap-4">
                                                                              <div className="min-w-[98px] rounded-2xl bg-slate-50/80 px-3 py-2 text-center ring-1 ring-slate-100">
                                                                                    <p className="text-sm font-semibold text-[#17335f]">
                                                                                          {formatTime(start)}
                                                                                    </p>
                                                                                    <p className="text-xs text-slate-400">
                                                                                          đến
                                                                                    </p>
                                                                                    <p className="text-sm font-semibold text-[#17335f]">
                                                                                          {formatTime(end)}
                                                                                    </p>
                                                                              </div>

                                                                              <div>
                                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                                          <div className="font-semibold text-[#17335f]">
                                                                                                {title}
                                                                                          </div>
                                                                                          <Badge
                                                                                                className={getStatusClass(
                                                                                                      assignment.status
                                                                                                )}
                                                                                          >
                                                                                                {getStatusLabel(
                                                                                                      assignment.status
                                                                                                )}
                                                                                          </Badge>
                                                                                    </div>

                                                                                    <p className="mt-1 text-sm text-slate-500">
                                                                                          {getAssigneeTypeLabel(
                                                                                                assignment.assignedToType ||
                                                                                                      (assignment.residentId
                                                                                                            ? 'resident'
                                                                                                            : assignment.assigned_to_type)
                                                                                          )}
                                                                                          :{' '}
                                                                                          <span className="font-semibold text-slate-700">
                                                                                                {getAssigneeName(
                                                                                                      assignment
                                                                                                ) || 'Chưa xác định'}
                                                                                          </span>
                                                                                    </p>

                                                                                    {assignment.notes && (
                                                                                          <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                                                {assignment.notes}
                                                                                          </p>
                                                                                    )}
                                                                              </div>
                                                                        </div>

                                                                        <div className="flex flex-wrap gap-2 lg:justify-end">
                                                                              {assignment.status !== 'completed' &&
                                                                                    assignment.status !== 'cancelled' && (
                                                                                          <button
                                                                                                type="button"
                                                                                                onClick={() =>
                                                                                                      completeAssignment(
                                                                                                            assignment
                                                                                                      )
                                                                                                }
                                                                                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                                                                          >
                                                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                                                Hoàn thành
                                                                                          </button>
                                                                                    )}

                                                                              {assignment.status !== 'skipped' &&
                                                                                    assignment.status !== 'cancelled' && (
                                                                                          <button
                                                                                                type="button"
                                                                                                onClick={() =>
                                                                                                      skipAssignment(
                                                                                                            assignment
                                                                                                      )
                                                                                                }
                                                                                                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                                                                          >
                                                                                                <SkipForward className="h-3.5 w-3.5" />
                                                                                                Vắng / Không làm
                                                                                          </button>
                                                                                    )}

                                                                              {assignment.status !== 'cancelled' && (
                                                                                    <button
                                                                                          type="button"
                                                                                          onClick={() =>
                                                                                                requestCancelAssignment(
                                                                                                      assignment
                                                                                                )
                                                                                          }
                                                                                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                                                                    >
                                                                                          <X className="h-3.5 w-3.5" />
                                                                                          Hủy
                                                                                    </button>
                                                                              )}
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                      );
                                                })}
                                          </div>
                                    )}
                              </div>
                        )}

                        {activeTab === 'create' && (
                              <div className={dutiesPanelClass}>
                                    <div className="mb-5">
                                          <h3 className={residenceMediumStyle.sectionTitle}>
                                                Tạo phân công
                                          </h3>
                                          <p className="mt-1 text-sm text-slate-500">
                                                Tạo công tác theo ngày, giao cho học viên, Tổ, phòng ngủ hoặc Ban.
                                          </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                          <label className="space-y-1.5">
                                                <Label>Ngày công tác</Label>
                                                <DatePickerInput
                                                      value={assignmentForm.assignedDate}
                                                      onChange={(event) =>
                                                            setAssignmentForm((current) => ({
                                                                  ...current,
                                                                  assignedDate: event.target.value,
                                                            }))
                                                      }
                                                      className={dutiesInputClass}
                                                />
                                          </label>

                                          <label className="space-y-1.5">
                                                <Label>Mẫu / công tác</Label>
                                                <select
                                                      value={assignmentForm.dutyConfigId}
                                                      onChange={(event) => {
                                                            const duty = (
                                                                  listDutiesQuery.data || []
                                                            ).find(
                                                                  (item: any) =>
                                                                        String(item.id) ===
                                                                        event.target.value
                                                            ) as DutyConfig | undefined;

                                                            setAssignmentForm((current) => ({
                                                                  ...current,
                                                                  dutyConfigId: event.target.value,
                                                                  startTime: formatTime(
                                                                        duty?.startTime
                                                                  ),
                                                                  endTime: formatTime(duty?.endTime),
                                                            }));
                                                      }}
                                                      className={dutiesInputClass}
                                                >
                                                      <option value="">Chọn công tác</option>
                                                      {duties.map((duty) => (
                                                            <option key={duty.id} value={duty.id}>
                                                                  {duty.dutyName}
                                                            </option>
                                                      ))}
                                                </select>
                                          </label>

                                          <label className="space-y-1.5">
                                                <Label>Giờ bắt đầu</Label>
                                                <Input
                                                      type="time"
                                                      value={assignmentForm.startTime}
                                                      onChange={(event) =>
                                                            setAssignmentForm((current) => ({
                                                                  ...current,
                                                                  startTime: event.target.value,
                                                            }))
                                                      }
                                                      className={dutiesInputClass}
                                                />
                                          </label>

                                          <label className="space-y-1.5">
                                                <Label>Giờ kết thúc</Label>
                                                <Input
                                                      type="time"
                                                      value={assignmentForm.endTime}
                                                      onChange={(event) =>
                                                            setAssignmentForm((current) => ({
                                                                  ...current,
                                                                  endTime: event.target.value,
                                                            }))
                                                      }
                                                      className={dutiesInputClass}
                                                />
                                          </label>

                                          <label className="space-y-1.5">
                                                <Label>Giao cho</Label>
                                                <select
                                                      value={assignmentForm.assignedToType}
                                                      onChange={(event) =>
                                                            setAssignmentForm((current) => ({
                                                                  ...current,
                                                                  assignedToType:
                                                                        event.target
                                                                              .value as AssignToType,
                                                                  assignedToId: '',
                                                            }))
                                                      }
                                                      className={dutiesInputClass}
                                                >
                                                      <option value="resident">Học viên</option>
                                                      <option value="team">Tổ</option>
                                                      <option value="room">Phòng ngủ</option>
                                                      <option value="committee">Ban</option>
                                                </select>
                                          </label>

                                          <label className="space-y-1.5">
                                                <Label>Đối tượng</Label>
                                                <select
                                                      value={assignmentForm.assignedToId}
                                                      onChange={(event) =>
                                                            setAssignmentForm((current) => ({
                                                                  ...current,
                                                                  assignedToId: event.target.value,
                                                            }))
                                                      }
                                                      className={dutiesInputClass}
                                                >
                                                      <option value="">
                                                            Chọn {getAssigneeTypeLabel(assignmentForm.assignedToType).toLowerCase()}
                                                      </option>
                                                      {getAssigneeOptions().map((option) => (
                                                            <option key={option.id} value={option.id}>
                                                                  {option.label}
                                                            </option>
                                                      ))}
                                                </select>
                                          </label>

                                          {selectedDutyConfig?.requiresStudyScheduleCheck && (
                                                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700 md:col-span-2">
                                                      Công tác này có bật kiểm tra lịch học. Giai đoạn này hệ thống chỉ ghi nhận
                                                      hook cảnh báo, phần kiểm tra trùng lịch học/vắng/về phép sẽ bổ sung sau.
                                                </div>
                                          )}

                                          <label className="space-y-1.5 md:col-span-2">
                                                <Label>Ghi chú</Label>
                                                <Textarea
                                                      value={assignmentForm.notes}
                                                      onChange={(event) =>
                                                            setAssignmentForm((current) => ({
                                                                  ...current,
                                                                  notes: event.target.value,
                                                            }))
                                                      }
                                                      rows={3}
                                                      className="min-h-24 rounded-xl border-amber-100 bg-white/90 text-sm shadow-[0_8px_18px_rgba(120,53,15,0.045)] focus-visible:ring-amber-100"
                                                />
                                          </label>
                                    </div>

                                    <div className="mt-5 flex justify-end gap-2">
                                          <button
                                                type="button"
                                                onClick={() => setActiveTab('today')}
                                                className={residenceMediumStyle.secondaryButton}
                                          >
                                                Hủy
                                          </button>
                                          <button
                                                type="button"
                                                onClick={saveAssignment}
                                                disabled={assignDutyMutation.isPending}
                                                className="rounded-xl bg-[#17335f] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(23,51,95,0.16)] transition hover:bg-[#244878] disabled:opacity-60"
                                          >
                                                {assignDutyMutation.isPending
                                                      ? 'Đang lưu...'
                                                      : 'Lưu phân công'}
                                          </button>
                                    </div>
                              </div>
                        )}

                        {activeTab === 'templates' && (
                              <div className={dutiesPanelClass}>
                                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                          <div>
                                                <h3 className={residenceMediumStyle.sectionTitle}>
                                                      Mẫu công tác
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500">
                                                      Quản lý các công tác lặp lại như trực cửa hàng sáng/chiều,
                                                      dọn vệ sinh, trực bếp, công tác tuần.
                                                </p>
                                          </div>

                                          <div className="relative w-full md:max-w-sm">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <Input
                                                      value={searchTerm}
                                                      onChange={(event) =>
                                                            setSearchTerm(event.target.value)
                                                      }
                                                      placeholder="Tìm mẫu công tác..."
                                                      className="h-10 rounded-xl border-amber-100 bg-white/90 pl-9 text-sm shadow-[0_8px_18px_rgba(120,53,15,0.045)]"
                                                />
                                          </div>
                                    </div>

                                    {listDutiesQuery.isLoading ? (
                                          <SectionEmpty
                                                title="Đang tải mẫu công tác"
                                                description="Vui lòng chờ trong giây lát."
                                          />
                                    ) : duties.length === 0 ? (
                                          <SectionEmpty
                                                title="Chưa có mẫu công tác"
                                                description="Thêm mẫu công tác để tạo phân công nhanh."
                                          />
                                    ) : (
                                          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                {duties.map((duty) => (
                                                      <div
                                                            key={duty.id}
                                                            className={dutiesItemClass}
                                                      >
                                                            <div className="flex items-start justify-between gap-3">
                                                                  <div>
                                                                        <p className="font-semibold text-[#17335f]">
                                                                              {duty.dutyName}
                                                                        </p>
                                                                        <p className="mt-1 text-xs text-slate-500">
                                                                              {duty.dutyCode}
                                                                        </p>
                                                                  </div>
                                                                  <Badge className="border-blue-100 bg-blue-50 text-blue-700">
                                                                        {getDutyTypeLabel(
                                                                              duty.dutyType
                                                                        )}
                                                                  </Badge>
                                                            </div>

                                                            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                                                                  <Clock className="h-4 w-4 text-slate-400" />
                                                                  {formatTimeRange(
                                                                        duty.startTime,
                                                                        duty.endTime
                                                                  )}
                                                            </div>

                                                            {duty.description && (
                                                                  <p className="mt-3 text-sm leading-6 text-slate-600">
                                                                        {duty.description}
                                                                  </p>
                                                            )}

                                                            <div className="mt-4 flex flex-wrap gap-2">
                                                                  <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                              selectDutyForAssignment(
                                                                                    duty
                                                                              )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                                                  >
                                                                        <Plus className="h-3.5 w-3.5" />
                                                                        Phân công
                                                                  </button>

                                                                  <button
                                                                        type="button"
                                                                        onClick={() => openEditDuty(duty)}
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                                  >
                                                                        <Edit2 className="h-3.5 w-3.5" />
                                                                        Sửa
                                                                  </button>

                                                                  <button
                                                                        type="button"
                                                                        onClick={() => requestDeleteDuty(duty)}
                                                                        disabled={deleteDutyMutation.isPending}
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                                  >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                        Xóa
                                                                  </button>
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                    )}
                              </div>
                        )}

                        {isDutyDialogOpen && (
                              <div className={residenceMediumStyle.modalOverlay}>
                                    <div className={`${residenceMediumStyle.modalShell} max-w-3xl`}>
                                          <div className="mb-5 flex items-start justify-between">
                                                <div>
                                                      <p className={residenceMediumStyle.modalEyebrow}>Mẫu công tác</p>
                                                      <h2 className={residenceMediumStyle.modalTitle}>
                                                            {selectedDuty
                                                                  ? 'Cập nhật mẫu công tác'
                                                                  : 'Thêm mẫu công tác'}
                                                      </h2>
                                                      <p className={residenceMediumStyle.modalSubtitle}>
                                                            Thiết lập mẫu công tác để dùng lại khi phân công.
                                                      </p>
                                                </div>
                                                <button
                                                      type="button"
                                                      onClick={() => setIsDutyDialogOpen(false)}
                                                      className="rounded-xl border border-amber-100 bg-white/90 p-2 text-slate-500 transition hover:bg-amber-50/70"
                                                >
                                                      <X className="h-4 w-4" />
                                                </button>
                                          </div>

                                          <div className="overflow-y-auto px-5 pb-5">
                                                <DutyConfigForm
                                                      duty={selectedDuty as any}
                                                      onSave={async () => {
                                                            setIsDutyDialogOpen(false);
                                                            setSelectedDuty(null);
                                                            setMessage({
                                                                  type: 'success',
                                                                  text: selectedDuty
                                                                        ? 'Đã cập nhật mẫu công tác.'
                                                                        : 'Đã thêm mẫu công tác.',
                                                            });
                                                            await listDutiesQuery.refetch();
                                                      }}
                                                      onCancel={() => setIsDutyDialogOpen(false)}
                                                />
                                          </div>
                                    </div>
                              </div>
                        )}

                        <AppMessageBox
                              state={messageBox}
                              onCancel={closeMessageBox}
                              onConfirm={handleMessageBoxConfirm}
                              isProcessing={
                                    deleteDutyMutation.isPending ||
                                    cancelAssignmentMutation.isPending
                              }
                        />
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}

