'use client';

import { useMemo, useState } from 'react';
import {
      CalendarDays,
      CheckSquare,
      Clock,
      ClipboardList,
      Plus,
      X,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import DutyConfigForm from '@/components/DutyConfigForm';
import TodayOverviewTab from '@/components/daily-routine/today/TodayOverviewTab';
import DutiesTab from '@/components/daily-routine/duties/DutiesTab';
import DutyTemplateDialog from '@/components/daily-routine/duties/DutyTemplateDialog';
import RoutineSetupTab from '@/components/daily-routine/routine/RoutineSetupTab';
import RoutineTemplateModal from '@/components/daily-routine/routine/RoutineTemplateModal';
import RoutineItemModal from '@/components/daily-routine/routine/RoutineItemModal';
import {
      AppMessageBox,
      type AppMessageBoxState,
} from '@/components/common/AppMessageBox';
import { useAutoDismissMessage } from '@/hooks/useAutoDismissMessage';
import {
      todayValue,
      formatTime,
      formatDateValue,
      getWeekDateValues,
      getTimeValue,
      isPastTime,
      isSameDateAsToday,
      getRoutineVisualState,
      getDutyVisualState,
      getAssigneeTypeLabel,
} from '@/components/daily-routine/shared';

type DayType = 'weekday' | 'sunday' | 'special';

type DailyRoutineView = 'today' | 'routine' | 'duties';

type DutyStatusFilter = 'all' | 'open' | 'overdue' | 'completed' | 'skipped' | 'cancelled';

type AssignToType = 'resident' | 'team' | 'room' | 'committee';

type AssignmentForm = {
      dutyConfigId: string;
      assignedDate: string;
      startTime: string;
      endTime: string;
      assignedToType: AssignToType;
      assignedToId: string;
      assignWholeWeek: boolean;
      notes: string;
};

type TemplateForm = {
      id?: number;
      code: string;
      name: string;
      dayType: DayType;
      description: string;
      isActive: boolean;
      sortOrder: string;
};

type ItemForm = {
      id?: number;
      templateId: string;
      startTime: string;
      endTime: string;
      title: string;
      location: string;
      description: string;
      isActive: boolean;
      sortOrder: string;
};

const emptyTemplateForm: TemplateForm = {
      code: '',
      name: '',
      dayType: 'weekday',
      description: '',
      isActive: true,
      sortOrder: '10',
};

const emptyItemForm: ItemForm = {
      templateId: '',
      startTime: '',
      endTime: '',
      title: '',
      location: '',
      description: '',
      isActive: true,
      sortOrder: '10',
};

function getDayTypeLabel(dayType?: string | null) {
      if (dayType === 'weekday') return 'Ngày thường';
      if (dayType === 'sunday') return 'Chúa nhật';
      if (dayType === 'special') return 'Ngày đặc biệt';
      return 'Chưa xác định';
}

function getDayTypeClass(dayType?: string | null) {
      if (dayType === 'weekday') return 'border-blue-100 bg-blue-50 text-blue-700';
      if (dayType === 'sunday') return 'border-purple-100 bg-purple-50 text-purple-700';
      if (dayType === 'special') return 'border-amber-100 bg-amber-50 text-amber-700';
      return 'border-slate-100 bg-slate-50 text-slate-600';
}

function createWallClockDate(dateText: string, timeText = '12:00:00') {
      const [year, month, day] = dateText.split('-').map(Number);
      const [hour = 0, minute = 0, second = 0] = timeText.split(':').map(Number);

      return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

function toDateAtNoon(dateText: string) {
      return createWallClockDate(dateText, '12:00:00');
}

function toDateStartOfDay(dateText: string) {
      return createWallClockDate(dateText, '00:00:00');
}

function toDateEndOfDay(dateText: string) {
      return createWallClockDate(dateText, '23:59:59');
}

function getAssignmentDateText(assignment: any) {
      const value = assignment.assignedDate || assignment.date;

      if (!value) return '';

      if (value instanceof Date) return value.toISOString().slice(0, 10);

      return String(value).slice(0, 10);
}

function getMonthRangeValues(dateText: string) {
      const [year, month] = dateText.split('-').map(Number);
      const firstDate = new Date(year, month - 1, 1);
      const lastDate = new Date(year, month, 0);

      return {
            startDate: formatDateValue(firstDate),
            endDate: formatDateValue(lastDate),
      };
}

function getAssigneeId(assignment: any) {
      return (
            assignment.assignedToId ||
            assignment.assigned_to_id ||
            assignment.residentId ||
            assignment.resident_id ||
            null
      );
}


function getSimpleAssigneeName(assignment: any) {
      return (
            assignment.residentName ||
            assignment.memberName ||
            assignment.assigneeName ||
            assignment.assignedToName ||
            assignment.roomName ||
            assignment.unitName ||
            assignment.resident?.fullName ||
            assignment.member?.fullName ||
            'Đối tượng được phân công'
      );
}


function getMemberName(member: any) {
      if (!member) return '';
      const holyName = member.holyName ? `${member.holyName} ` : '';
      return `${holyName}${member.fullName || member.name || `Học viên ${member.id}`}`.trim();
}

function getRoomName(room: any) {
      if (!room) return '';
      if (room.roomCode && room.roomName) return `${room.roomCode} - ${room.roomName}`;
      return room.roomName || room.name || room.roomCode || `Phòng ${room.id}`;
}

function getUnitName(unit: any) {
      if (!unit) return '';
      return unit.name || unit.code || `Đơn vị ${unit.id}`;
}

function toDateTime(dateText: string, timeText?: string | null) {
      if (!dateText || !timeText) return undefined;

      return createWallClockDate(dateText, timeText.length === 5 ? `${timeText}:00` : timeText);
}

function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}


export default function DailyRoutine() {
      const [activeView, setActiveView] = useState<DailyRoutineView>('today');
      const [selectedDate, setSelectedDate] = useState(todayValue());
      const [dutyStatusFilter, setDutyStatusFilter] = useState<DutyStatusFilter>('all');
      const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [dayTypeFilter, setDayTypeFilter] = useState<'all' | DayType>('all');

      const [templateForm, setTemplateForm] = useState<TemplateForm | null>(null);
      const [itemForm, setItemForm] = useState<ItemForm | null>(null);

      const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>({
            dutyConfigId: '',
            assignedDate: todayValue(),
            startTime: '',
            endTime: '',
            assignedToType: 'resident',
            assignedToId: '',
            assignWholeWeek: true,
            notes: '',
      });

      const [isDutyTemplateDialogOpen, setIsDutyTemplateDialogOpen] = useState(false);
      const [isDutyConfigFormOpen, setIsDutyConfigFormOpen] = useState(false);
      const [selectedDutyConfigForEdit, setSelectedDutyConfigForEdit] = useState<any>(null);

      const [messageBox, setMessageBox] = useState<AppMessageBoxState>({
            open: false,
            title: '',
            message: '',
            variant: 'info',
            actions: [],
      });
      const [pendingDeleteDutyConfig, setPendingDeleteDutyConfig] = useState<any>(null);
      const [pendingCancelAssignment, setPendingCancelAssignment] = useState<any>(null);

      const { message, showMessage, clearMessage } = useAutoDismissMessage({
            successDuration: 5000,
            errorDuration: 7000,
      });

      const setMessage = (nextMessage: {
            type: 'success' | 'error' | 'info' | 'warning';
            text: string;
      } | null) => {
            if (!nextMessage) {
                  clearMessage();
                  return;
            }

            showMessage(nextMessage.type, nextMessage.text);
      };

      const templatesQuery = trpc.dailyRoutine.listTemplates.useQuery({
            search: searchTerm || undefined,
            dayType: dayTypeFilter,
            limit: 200,
            offset: 0,
      });

      const templates = templatesQuery.data || [];

      const currentTemplate = useMemo(() => {
            if (selectedTemplateId) {
                  return templates.find((template: any) => template.id === selectedTemplateId) || null;
            }

            return templates[0] || null;
      }, [templates, selectedTemplateId]);

      const itemsQuery = trpc.dailyRoutine.listItems.useQuery(
            {
                  templateId: currentTemplate?.id,
                  limit: 500,
                  offset: 0,
            },
            {
                  enabled: Boolean(currentTemplate?.id),
            }
      );

      const items = itemsQuery.data || [];

      const selectedMonthRange = useMemo(
            () => getMonthRangeValues(selectedDate),
            [selectedDate]
      );

      const dutiesQuery = trpc.duties.getAssignmentsByDateRange.useQuery({
            startDate: toDateStartOfDay(selectedMonthRange.startDate),
            endDate: toDateEndOfDay(selectedMonthRange.endDate),
      });

      /**
       * Dữ liệu công tác của cả tháng.
       * View ngày sẽ tự lọc theo selectedDate.
       * View tuần sẽ tự lọc theo tuần đang chọn.
       * View tháng dùng toàn bộ dữ liệu này.
       */
      const dutyAssignments = dutiesQuery.data || [];

      const dutyConfigsQuery = trpc.duties.listConfigs.useQuery({ isActive: true });

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

      const dutyConfigs = dutyConfigsQuery.data || [];
      const members = (membersQuery.data || []) as any[];
      const rooms = (roomsQuery.data || []) as any[];
      const units = (unitsQuery.data || []) as any[];
      const teams = units.filter((unit: any) => unit.unitType === 'team');
      const committees = units.filter((unit: any) => unit.unitType === 'committee');

      const enrichedDutyAssignments = useMemo(() => {
            const dutyMap = new Map<number, any>();
            const memberMap = new Map<number, any>();
            const roomMap = new Map<number, any>();
            const unitMap = new Map<number, any>();

            (dutyConfigs as any[]).forEach((duty: any) => dutyMap.set(Number(duty.id), duty));
            members.forEach((member: any) => memberMap.set(Number(member.id), member));
            rooms.forEach((room: any) => roomMap.set(Number(room.id), room));
            units.forEach((unit: any) => unitMap.set(Number(unit.id), unit));

            return (dutyAssignments as any[]).map((assignment: any) => {
                  const dutyConfig = assignment.dutyConfig || dutyMap.get(Number(assignment.dutyConfigId));
                  const assignedToType =
                        assignment.assignedToType ||
                        assignment.assigned_to_type ||
                        (assignment.residentId ? 'resident' : 'resident');
                  const assignedToId = getAssigneeId(assignment);

                  let assigneeName = getSimpleAssigneeName(assignment);

                  if (assignedToType === 'room') {
                        assigneeName =
                              getRoomName(roomMap.get(Number(assignedToId))) || assigneeName;
                  } else if (assignedToType === 'team' || assignedToType === 'committee') {
                        assigneeName =
                              getUnitName(unitMap.get(Number(assignedToId))) || assigneeName;
                  } else {
                        assigneeName =
                              getMemberName(memberMap.get(Number(assignedToId))) || assigneeName;
                  }

                  return {
                        ...assignment,
                        dutyConfig,
                        assignedToType,
                        assignedToId,
                        assigneeName,
                        dutyName: assignment.dutyName || dutyConfig?.dutyName,
                  };
            });
      }, [dutyAssignments, dutyConfigs, members, rooms, units]);

      const selectedDateDutyAssignments = useMemo(() => {
            return (enrichedDutyAssignments as any[]).filter(
                  (assignment: any) => getAssignmentDateText(assignment) === selectedDate
            );
      }, [enrichedDutyAssignments, selectedDate]);

      const completeAssignmentMutation = trpc.duties.completeAssignment.useMutation();
      const skipAssignmentMutation = trpc.duties.skipAssignment.useMutation();
      const assignDutyBatchMutation = trpc.duties.assignDutyBatch.useMutation();
      const cancelAssignmentMutation = trpc.duties.cancelAssignment.useMutation();
      const deleteDutyConfigMutation = trpc.duties.deleteConfig.useMutation();

      const createTemplateMutation = trpc.dailyRoutine.createTemplate.useMutation();
      const updateTemplateMutation = trpc.dailyRoutine.updateTemplate.useMutation();
      const removeTemplateMutation = trpc.dailyRoutine.removeTemplate.useMutation();

      const createItemMutation = trpc.dailyRoutine.createItem.useMutation();
      const updateItemMutation = trpc.dailyRoutine.updateItem.useMutation();
      const removeItemMutation = trpc.dailyRoutine.removeItem.useMutation();

      const isSavingTemplate =
            createTemplateMutation.isPending || updateTemplateMutation.isPending;

      const isSavingItem = createItemMutation.isPending || updateItemMutation.isPending;

      const refetchAll = async () => {
            await templatesQuery.refetch();
            await itemsQuery.refetch();
            await dutiesQuery.refetch();
      };

      const todayTimelineItems = useMemo(() => {
            const routineTimeline = (items || [])
                  .filter((item: any) => item.isActive)
                  .map((item: any) => ({
                        key: `routine-${item.id}`,
                        type: 'routine' as const,
                        startTime: item.startTime,
                        endTime: item.endTime,
                        title: item.title,
                        subTitle: item.location || 'Sinh hoạt chung',
                        description: item.description,
                        status: 'routine',
                        visualState: getRoutineVisualState(item, selectedDate),
                  }));

            const dutyTimeline = (selectedDateDutyAssignments || []).map((assignment: any) => {
                  const entry = {
                        key: `duty-${assignment.id}`,
                        type: 'duty' as const,
                        startTime:
                              assignment.startDateTime ||
                              assignment.startTime ||
                              assignment.dutyConfig?.startTime,
                        endTime:
                              assignment.endDateTime ||
                              assignment.endTime ||
                              assignment.dutyConfig?.endTime,
                        title:
                              assignment.dutyName ||
                              assignment.dutyConfig?.dutyName ||
                              `Công tác #${assignment.id}`,
                        subTitle: `${getAssigneeTypeLabel(
                              assignment.assignedToType || (assignment.residentId ? 'resident' : null)
                        )}: ${assignment.assigneeName || getSimpleAssigneeName(assignment)}`,
                        description: assignment.notes,
                        status: assignment.status,
                        assignment,
                  };

                  return {
                        ...entry,
                        visualState: getDutyVisualState(entry, selectedDate),
                  };
            });

            return [...routineTimeline, ...dutyTimeline].sort((a, b) =>
                  String(a.startTime || '').localeCompare(String(b.startTime || ''))
            );
      }, [items, selectedDateDutyAssignments, selectedDate]);

      const filteredDutyAssignments = useMemo(() => {
            return (selectedDateDutyAssignments as any[]).filter((assignment: any) => {
                  const visualState = getDutyVisualState(assignment, selectedDate);

                  if (dutyStatusFilter === 'all') return true;
                  if (dutyStatusFilter === 'open') {
                        return assignment.status !== 'completed' && assignment.status !== 'cancelled';
                  }
                  if (dutyStatusFilter === 'overdue') return visualState === 'overdue';

                  return assignment.status === dutyStatusFilter;
            });
      }, [selectedDateDutyAssignments, dutyStatusFilter, selectedDate]);

      const completeAssignment = async (assignment: any) => {
            try {
                  await completeAssignmentMutation.mutateAsync({ id: assignment.id });
                  setMessage({ type: 'success', text: 'Đã đánh dấu hoàn thành công tác.' });
                  await dutiesQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể cập nhật công tác.',
                  });
            }
      };

      const skipAssignment = async (assignment: any) => {
            try {
                  await skipAssignmentMutation.mutateAsync({
                        id: assignment.id,
                        reason: 'Vắng / không thực hiện',
                  });
                  setMessage({ type: 'success', text: 'Đã ghi nhận vắng / không làm công tác.' });
                  await dutiesQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể cập nhật công tác.',
                  });
            }
      };

      const requestCancelAssignment = (assignment: any) => {
            setPendingCancelAssignment(assignment);
            setMessageBox({
                  open: true,
                  title: 'Hủy công tác',
                  message:
                        `Bạn có chắc muốn hủy công tác "${
                              assignment.dutyName ||
                              assignment.dutyConfig?.dutyName ||
                              `#${assignment.id}`
                        }"?\n\n` +
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
                        reason: 'Hủy từ màn hình sinh hoạt hằng ngày',
                  });

                  setMessage({ type: 'success', text: 'Đã hủy công tác.' });
                  closeMessageBox();
                  await dutiesQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể hủy công tác.',
                  });
                  closeMessageBox();
            }
      };

      const selectedDutyConfig = assignmentForm.dutyConfigId
            ? (dutyConfigs as any[]).find(
                    (duty: any) => String(duty.id) === assignmentForm.dutyConfigId
              )
            : null;

      const assignmentPreviewDates = useMemo(() => {
            if (!assignmentForm.assignedDate) return [];

            return selectedDutyConfig?.dutyType === 'daily' && assignmentForm.assignWholeWeek
                  ? getWeekDateValues(assignmentForm.assignedDate)
                  : [assignmentForm.assignedDate];
      }, [assignmentForm.assignedDate, assignmentForm.assignWholeWeek, selectedDutyConfig?.dutyType]);

      const isAssignmentPreviewReady = Boolean(
            assignmentForm.dutyConfigId &&
                  assignmentForm.assignedDate &&
                  assignmentForm.assignedToId &&
                  assignmentPreviewDates.length > 0
      );

      const assignmentPreviewQuery = trpc.duties.previewAssignment.useQuery(
            {
                  dutyConfigId: Number(assignmentForm.dutyConfigId || 0),
                  assignedDates: assignmentPreviewDates,
                  assignedToType: assignmentForm.assignedToType,
                  assignedToId: Number(assignmentForm.assignedToId || 0),
                  startTime: assignmentForm.startTime || null,
                  endTime: assignmentForm.endTime || null,
                  notes: assignmentForm.notes || null,
            },
            {
                  enabled: isAssignmentPreviewReady,
            }
      );

      const assignmentPreview = assignmentPreviewQuery.data as
            | {
                    canCreateCount: number;
                    skippedCount: number;
                    items: Array<{
                          date: string;
                          canCreate: boolean;
                          reason?: string;
                          currentResidentCount?: number;
                          minPersons?: number | null;
                          maxPersons?: number | null;
                    }>;
              }
            | undefined;


      const selectedDutyResidentAssignmentsCount = useMemo(() => {
            if (!assignmentForm.dutyConfigId || !assignmentForm.assignedDate) return 0;

            return (enrichedDutyAssignments as any[]).filter((assignment: any) => {
                  const assignedDateText = String(assignment.assignedDate || '').slice(0, 10);

                  return (
                        String(assignment.dutyConfigId) === assignmentForm.dutyConfigId &&
                        assignedDateText === assignmentForm.assignedDate &&
                        (assignment.assignedToType || (assignment.residentId ? 'resident' : 'resident')) ===
                              'resident' &&
                        assignment.status !== 'cancelled'
                  );
            }).length;
      }, [enrichedDutyAssignments, assignmentForm.dutyConfigId, assignmentForm.assignedDate]);


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

      const saveAssignment = async () => {
            const dutyConfigId = Number(assignmentForm.dutyConfigId || 0);
            const assignedToId = Number(assignmentForm.assignedToId || 0);

            if (!dutyConfigId) {
                  setMessage({ type: 'error', text: 'Vui lòng chọn công tác.' });
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
                  const result = await assignDutyBatchMutation.mutateAsync({
                        dutyConfigId,
                        assignedDates: assignmentPreviewDates,
                        assignedToType: assignmentForm.assignedToType,
                        assignedToId,
                        startTime: assignmentForm.startTime || null,
                        endTime: assignmentForm.endTime || null,
                        notes: assignmentForm.notes || null,
                  } as any);

                  setSelectedDate(assignmentForm.assignedDate);
                  setMessage({
                        type: 'success',
                        text:
                              result.skipped > 0
                                    ? `Đã tạo ${result.created} phân công, bỏ qua ${result.skipped} ngày không phù hợp.`
                                    : `Đã tạo ${result.created} phân công.`,
                  });
                  setAssignmentForm({
                        dutyConfigId: '',
                        assignedDate: assignmentForm.assignedDate,
                        startTime: '',
                        endTime: '',
                        assignedToType: 'resident',
                        assignedToId: '',
                        assignWholeWeek: true,
                        notes: '',
                  });

                  await dutiesQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể tạo phân công công tác.',
                  });
            }
      };

      const openCreateDutyConfig = () => {
            setSelectedDutyConfigForEdit(null);
            setIsDutyConfigFormOpen(true);
      };

      const openEditDutyConfig = (duty: any) => {
            setSelectedDutyConfigForEdit(duty);
            setIsDutyConfigFormOpen(true);
      };

      const requestDeleteDutyConfig = (duty: any) => {
            setPendingDeleteDutyConfig(duty);
            setMessageBox({
                  open: true,
                  title: 'Xóa mẫu công tác',
                  message:
                        `Bạn có chắc muốn xóa mẫu công tác "${duty.dutyName}"?\n\n` +
                        'Chỉ nên xóa khi đây là dữ liệu tạo nhầm hoặc dữ liệu test. Nếu mẫu công tác đã phát sinh phân công, nên chuyển sang ngừng dùng để giữ lịch sử.',
                  variant: 'danger',
                  selectedValue: 'deleteDutyConfig',
                  cancelText: 'Hủy',
                  actions: [
                        {
                              label: 'Xóa mẫu công tác',
                              value: 'deleteDutyConfig',
                              description: 'Xóa mẫu công tác và các thiết lập liên quan nếu backend cho phép.',
                              variant: 'danger',
                        },
                  ],
            });
      };

      const closeMessageBox = () => {
            setMessageBox({
                  open: false,
                  title: '',
                  message: '',
                  variant: 'info',
                  actions: [],
            });
            setPendingDeleteDutyConfig(null);
            setPendingCancelAssignment(null);
      };

      const executeDeleteDutyConfig = async () => {
            if (!pendingDeleteDutyConfig) {
                  closeMessageBox();
                  return;
            }

            try {
                  await deleteDutyConfigMutation.mutateAsync({
                        id: pendingDeleteDutyConfig.id,
                  });

                  setMessage({
                        type: 'success',
                        text: 'Đã xóa mẫu công tác.',
                  });

                  closeMessageBox();
                  await dutyConfigsQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text:
                              err?.message ||
                              'Không thể xóa mẫu công tác. Nếu đã phát sinh phân công, nên chuyển sang ngừng dùng.',
                  });
                  closeMessageBox();
            }
      };

      const handleMessageBoxConfirm = async (value: string) => {
            if (value === 'deleteDutyConfig') {
                  await executeDeleteDutyConfig();
                  return;
            }

            if (value === 'cancelAssignment') {
                  await executeCancelAssignment();
                  return;
            }

            closeMessageBox();
      };

      const openCreateTemplate = () => {
            setMessage(null);
            setTemplateForm({ ...emptyTemplateForm });
      };

      const openEditTemplate = (template: any) => {
            setMessage(null);
            setTemplateForm({
                  id: template.id,
                  code: template.code || '',
                  name: template.name || '',
                  dayType: template.dayType || 'weekday',
                  description: template.description || '',
                  isActive: Boolean(template.isActive),
                  sortOrder: String(template.sortOrder ?? 10),
            });
      };

      const saveTemplate = async () => {
            if (!templateForm) return;

            const code = normalizeCode(templateForm.code);
            const name = templateForm.name.trim();

            if (!code) {
                  setMessage({ type: 'error', text: 'Vui lòng nhập mã mẫu lịch.' });
                  return;
            }

            if (!name) {
                  setMessage({ type: 'error', text: 'Vui lòng nhập tên mẫu lịch.' });
                  return;
            }

            try {
                  if (templateForm.id) {
                        const updated = await updateTemplateMutation.mutateAsync({
                              id: templateForm.id,
                              code,
                              name,
                              dayType: templateForm.dayType,
                              description: templateForm.description || null,
                              isActive: templateForm.isActive,
                              sortOrder: Number(templateForm.sortOrder || 10),
                        });

                        setSelectedTemplateId((updated as any)?.id || templateForm.id);
                        setMessage({ type: 'success', text: 'Đã cập nhật mẫu lịch.' });
                  } else {
                        const created = await createTemplateMutation.mutateAsync({
                              code,
                              name,
                              dayType: templateForm.dayType,
                              description: templateForm.description || null,
                              isActive: templateForm.isActive,
                              sortOrder: Number(templateForm.sortOrder || 10),
                        });

                        setSelectedTemplateId((created as any)?.id || null);
                        setMessage({ type: 'success', text: 'Đã thêm mẫu lịch.' });
                  }

                  setTemplateForm(null);
                  await refetchAll();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể lưu mẫu lịch.',
                  });
            }
      };

      const removeTemplate = async (template: any) => {
            const confirmed = window.confirm(
                  `Xóa mẫu lịch "${template.name}"? Các khung giờ bên trong cũng sẽ bị xóa.`
            );

            if (!confirmed) return;

            try {
                  await removeTemplateMutation.mutateAsync({ id: template.id });
                  setMessage({ type: 'success', text: 'Đã xóa mẫu lịch.' });

                  if (selectedTemplateId === template.id) {
                        setSelectedTemplateId(null);
                  }

                  await refetchAll();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể xóa mẫu lịch.',
                  });
            }
      };

      const openCreateItem = () => {
            if (!currentTemplate?.id) {
                  setMessage({
                        type: 'error',
                        text: 'Vui lòng chọn mẫu lịch trước khi thêm khung giờ.',
                  });
                  return;
            }

            setMessage(null);
            setItemForm({
                  ...emptyItemForm,
                  templateId: String(currentTemplate.id),
            });
      };

      const openEditItem = (item: any) => {
            setMessage(null);
            setItemForm({
                  id: item.id,
                  templateId: String(item.templateId || currentTemplate?.id || ''),
                  startTime: formatTime(item.startTime),
                  endTime: formatTime(item.endTime),
                  title: item.title || '',
                  location: item.location || '',
                  description: item.description || '',
                  isActive: Boolean(item.isActive),
                  sortOrder: String(item.sortOrder ?? 10),
            });
      };

      const saveItem = async () => {
            if (!itemForm) return;

            const templateId = Number(itemForm.templateId || 0);
            const title = itemForm.title.trim();

            if (!templateId) {
                  setMessage({ type: 'error', text: 'Vui lòng chọn mẫu lịch.' });
                  return;
            }

            if (!itemForm.startTime || !itemForm.endTime) {
                  setMessage({
                        type: 'error',
                        text: 'Vui lòng nhập giờ bắt đầu và giờ kết thúc.',
                  });
                  return;
            }

            if (itemForm.endTime <= itemForm.startTime) {
                  setMessage({
                        type: 'error',
                        text: 'Giờ kết thúc phải lớn hơn giờ bắt đầu.',
                  });
                  return;
            }

            if (!title) {
                  setMessage({ type: 'error', text: 'Vui lòng nhập tên hoạt động.' });
                  return;
            }

            try {
                  if (itemForm.id) {
                        await updateItemMutation.mutateAsync({
                              id: itemForm.id,
                              templateId,
                              startTime: itemForm.startTime,
                              endTime: itemForm.endTime,
                              title,
                              location: itemForm.location || null,
                              description: itemForm.description || null,
                              isActive: itemForm.isActive,
                              sortOrder: Number(itemForm.sortOrder || 10),
                        });

                        setMessage({ type: 'success', text: 'Đã cập nhật khung giờ.' });
                  } else {
                        await createItemMutation.mutateAsync({
                              templateId,
                              startTime: itemForm.startTime,
                              endTime: itemForm.endTime,
                              title,
                              location: itemForm.location || null,
                              description: itemForm.description || null,
                              isActive: itemForm.isActive,
                              sortOrder: Number(itemForm.sortOrder || 10),
                        });

                        setMessage({ type: 'success', text: 'Đã thêm khung giờ.' });
                  }

                  setItemForm(null);
                  await itemsQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể lưu khung giờ.',
                  });
            }
      };

      const removeItem = async (item: any) => {
            const confirmed = window.confirm(`Xóa khung giờ "${item.title}"?`);

            if (!confirmed) return;

            try {
                  await removeItemMutation.mutateAsync({ id: item.id });
                  setMessage({ type: 'success', text: 'Đã xóa khung giờ.' });
                  await itemsQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể xóa khung giờ.',
                  });
            }
      };

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6 p-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                                                Sinh hoạt hằng ngày
                                          </h1>
                                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                                Theo dõi lịch sinh hoạt, phân công công tác và nhắc nhở trong lưu xá
                                                trên một màn hình gọn, dễ nhìn và dễ thực hiện.
                                          </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                          {activeView === 'today' && (
                                                <>
                                                      <button
                                                            type="button"
                                                            onClick={openCreateItem}
                                                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                      >
                                                            <Clock className="h-4 w-4" />
                                                            Thêm khung giờ
                                                      </button>
                                                      <button
                                                            type="button"
                                                            onClick={() => {
                                                                  setAssignmentForm((current) => ({
                                                                        ...current,
                                                                        assignedDate: selectedDate || todayValue(),
                                                                  }));
                                                                  setActiveView('duties');
                                                            }}
                                                            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                                      >
                                                            <Plus className="h-4 w-4" />
                                                            Thêm phân công
                                                      </button>
                                                </>
                                          )}

                                          {activeView === 'routine' && (
                                                <>
                                                      <button
                                                            type="button"
                                                            onClick={openCreateTemplate}
                                                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                      >
                                                            <Plus className="h-4 w-4" />
                                                            Thêm mẫu lịch
                                                      </button>
                                                      <button
                                                            type="button"
                                                            onClick={openCreateItem}
                                                            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                                      >
                                                            <Clock className="h-4 w-4" />
                                                            Thêm khung giờ
                                                      </button>
                                                </>
                                          )}

                                          {activeView === 'duties' && (
                                                <>
                                                      <button
                                                            type="button"
                                                            onClick={() => setIsDutyTemplateDialogOpen(true)}
                                                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                      >
                                                            <ClipboardList className="h-4 w-4" />
                                                            Mẫu công tác
                                                      </button>
                                                      <button
                                                            type="button"
                                                            onClick={openCreateDutyConfig}
                                                            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                                      >
                                                            <Plus className="h-4 w-4" />
                                                            Thêm mẫu công tác
                                                      </button>
                                                </>
                                          )}
                                    </div>
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

                        <div className="grid gap-3 md:grid-cols-3">
                              {[
                                    {
                                          key: 'today',
                                          label: 'Hôm nay',
                                          description: 'Tổng quan lịch sinh hoạt và công tác trong ngày',
                                          icon: CalendarDays,
                                          count: todayTimelineItems.length,
                                    },
                                    {
                                          key: 'routine',
                                          label: 'Lịch sinh hoạt',
                                          description: 'Thiết lập mẫu lịch và khung giờ sinh hoạt',
                                          icon: Clock,
                                          count: items.length,
                                    },
                                    {
                                          key: 'duties',
                                          label: 'Công tác',
                                          description: 'Phân công, theo dõi hoàn thành, vắng hoặc hủy',
                                          icon: CheckSquare,
                                          count: selectedDateDutyAssignments.length,
                                    },
                              ].map((view) => {
                                    const Icon = view.icon;
                                    const isActive = activeView === view.key;

                                    return (
                                          <button
                                                key={view.key}
                                                type="button"
                                                onClick={() => setActiveView(view.key as DailyRoutineView)}
                                                className={[
                                                      'group rounded-3xl border p-4 text-left transition-all',
                                                      isActive
                                                            ? 'border-blue-200 bg-blue-50 shadow-sm ring-2 ring-blue-100'
                                                            : 'border-slate-200 bg-white shadow-sm hover:border-blue-100 hover:bg-slate-50',
                                                ].join(' ')}
                                          >
                                                <div className="flex items-start justify-between gap-3">
                                                      <div className="flex items-center gap-3">
                                                            <span
                                                                  className={[
                                                                        'flex h-10 w-10 items-center justify-center rounded-2xl',
                                                                        isActive
                                                                              ? 'bg-blue-600 text-white'
                                                                              : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700',
                                                                  ].join(' ')}
                                                            >
                                                                  <Icon className="h-5 w-5" />
                                                            </span>
                                                            <div>
                                                                  <p
                                                                        className={[
                                                                              'text-sm font-bold',
                                                                              isActive ? 'text-blue-800' : 'text-slate-900',
                                                                        ].join(' ')}
                                                                  >
                                                                        {view.label}
                                                                  </p>
                                                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                                                        {view.description}
                                                                  </p>
                                                            </div>
                                                      </div>

                                                      <span
                                                            className={[
                                                                  'rounded-full px-2.5 py-1 text-xs font-bold',
                                                                  isActive
                                                                        ? 'bg-white text-blue-700 ring-1 ring-blue-100'
                                                                        : 'bg-slate-100 text-slate-500',
                                                            ].join(' ')}
                                                      >
                                                            {view.count}
                                                      </span>
                                                </div>
                                          </button>
                                    );
                              })}
                        </div>

                        {activeView === 'today' && (
                              <TodayOverviewTab
                                    selectedDate={selectedDate}
                                    onDateChange={setSelectedDate}
                                    routineItems={items}
                                    dutyAssignments={selectedDateDutyAssignments}
                                    timelineItems={todayTimelineItems}
                                    isLoading={
                                          templatesQuery.isLoading ||
                                          itemsQuery.isLoading ||
                                          dutiesQuery.isLoading
                                    }
                                    onCreateDuty={() => setActiveView('duties')}
                                    onCompleteDuty={completeAssignment}
                                    onSkipDuty={skipAssignment}
                              />
                        )}

                        {activeView === 'duties' && (
                              <DutiesTab
                                    assignmentForm={assignmentForm}
                                    onAssignmentFormChange={setAssignmentForm}
                                    dutyConfigs={dutyConfigs as any[]}
                                    selectedDutyConfig={selectedDutyConfig}
                                    assigneeOptions={getAssigneeOptions()}
                                    previewEnabled={isAssignmentPreviewReady}
                                    previewLoading={assignmentPreviewQuery.isLoading}
                                    preview={assignmentPreview}
                                    isSaving={assignDutyBatchMutation.isPending}
                                    onSaveAssignment={saveAssignment}
                                    onOpenDutyTemplateDialog={() =>
                                          setIsDutyTemplateDialogOpen(true)
                                    }
                                    selectedDate={selectedDate}
                                    onDateChange={setSelectedDate}
                                    statusFilter={dutyStatusFilter}
                                    onStatusFilterChange={setDutyStatusFilter}
                                    assignments={filteredDutyAssignments}
                                    allAssignments={enrichedDutyAssignments}
                                    isLoadingAssignments={dutiesQuery.isLoading}
                                    onCompleteDuty={completeAssignment}
                                    onSkipDuty={skipAssignment}
                                    onCancelDuty={requestCancelAssignment}
                              />
                        )}

                        {activeView === 'routine' && (
                              <RoutineSetupTab
                                    templates={templates as any[]}
                                    currentTemplate={currentTemplate}
                                    items={items as any[]}
                                    templatesLoading={templatesQuery.isLoading}
                                    itemsLoading={itemsQuery.isLoading}
                                    searchTerm={searchTerm}
                                    onSearchTermChange={setSearchTerm}
                                    dayTypeFilter={dayTypeFilter as any}
                                    onDayTypeFilterChange={setDayTypeFilter as any}
                                    onSelectTemplate={setSelectedTemplateId}
                                    onCreateTemplate={openCreateTemplate}
                                    onEditTemplate={openEditTemplate}
                                    onRemoveTemplate={removeTemplate}
                                    onCreateItem={openCreateItem}
                                    onEditItem={openEditItem}
                                    onRemoveItem={removeItem}
                              />
                        )}

                        {templateForm && (
                              <RoutineTemplateModal
                                    form={templateForm}
                                    onChange={setTemplateForm}
                                    onSave={saveTemplate}
                                    isSaving={isSavingTemplate}
                              />
                        )}

                        {itemForm && (
                              <RoutineItemModal
                                    form={itemForm}
                                    templates={templates as any[]}
                                    onChange={setItemForm}
                                    onSave={saveItem}
                                    isSaving={isSavingItem}
                              />
                        )}

                        {isDutyTemplateDialogOpen && (
                              <DutyTemplateDialog
                                    dutyConfigs={dutyConfigs as any[]}
                                    isLoading={dutyConfigsQuery.isLoading}
                                    isDeleting={deleteDutyConfigMutation.isPending}
                                    onClose={() => setIsDutyTemplateDialogOpen(false)}
                                    onCreate={openCreateDutyConfig}
                                    onEdit={openEditDutyConfig}
                                    onDelete={requestDeleteDutyConfig}
                              />
                        )}

                        {isDutyConfigFormOpen && (
                              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
                                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
                                          <div className="mb-5 flex items-start justify-between">
                                                <div>
                                                      <h2 className="text-xl font-bold text-slate-950">
                                                            {selectedDutyConfigForEdit
                                                                  ? 'Cập nhật mẫu công tác'
                                                                  : 'Thêm mẫu công tác'}
                                                      </h2>
                                                      <p className="mt-1 text-sm text-slate-500">
                                                            Thiết lập thông tin công tác và danh sách việc cần hoàn thành.
                                                      </p>
                                                </div>

                                                <button
                                                      type="button"
                                                      onClick={() => setIsDutyConfigFormOpen(false)}
                                                      className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                                                >
                                                      <X className="h-4 w-4" />
                                                </button>
                                          </div>

                                          <DutyConfigForm
                                                duty={selectedDutyConfigForEdit}
                                                onSave={async () => {
                                                      setIsDutyConfigFormOpen(false);
                                                      setSelectedDutyConfigForEdit(null);
                                                      setMessage({
                                                            type: 'success',
                                                            text: selectedDutyConfigForEdit
                                                                  ? 'Đã cập nhật mẫu công tác.'
                                                                  : 'Đã thêm mẫu công tác.',
                                                      });
                                                      await dutyConfigsQuery.refetch();
                                                }}
                                                onCancel={() => setIsDutyConfigFormOpen(false)}
                                          />
                                    </div>
                              </div>
                        )}

                        <AppMessageBox
                              state={messageBox}
                              onCancel={closeMessageBox}
                              onConfirm={handleMessageBoxConfirm}
                              isProcessing={deleteDutyConfigMutation.isPending || cancelAssignmentMutation.isPending}
                        />
                  </div>
            </ResidenceCareLayout>
      );
}
